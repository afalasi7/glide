import { bookTrip } from "@/lib/planning/book";
import {
  selectionFromMetadata,
  tripFromSelection,
  type CompactTripSelection,
} from "./selection";
import type { BookingRecord, BookingStore } from "./store";

export type FulfillResult =
  | { ok: true; record: BookingRecord; created: boolean }
  | { ok: false; reason: "missing_metadata" | "invalid_metadata"; detail: string };

/**
 * Idempotent fulfillment for checkout.session.completed.
 * Claims `booking:{sessionId}` (SET NX). If already booked, returns existing
 * confirmations and does not call bookTrip again.
 */
export async function fulfillCheckoutSession(args: {
  sessionId: string;
  metadata: Record<string, string> | null | undefined;
  store: BookingStore;
  paidAt?: string;
}): Promise<FulfillResult> {
  const { sessionId, metadata, store } = args;
  const paidAt = args.paidAt ?? new Date().toISOString();

  const existing = await store.get(sessionId);
  if (existing?.status === "booked" && existing.confirmations?.length) {
    return { ok: true, record: existing, created: false };
  }

  let selection: CompactTripSelection;
  try {
    selection = selectionFromMetadata(metadata);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "invalid metadata";
    return {
      ok: false,
      reason: metadata && Object.keys(metadata).length ? "invalid_metadata" : "missing_metadata",
      detail,
    };
  }

  const pending: BookingRecord = {
    sessionId,
    status: "pending",
    selection,
    tripId: selection.tripId,
    paidAt,
  };

  const claimed = await store.claim(sessionId, pending);
  if (!claimed) {
    const again = await store.get(sessionId);
    if (again?.status === "booked" && again.confirmations?.length) {
      return { ok: true, record: again, created: false };
    }
    // Another worker holds a pending/failed claim — do not double-book.
    if (again) return { ok: true, record: again, created: false };
  }

  let trip;
  try {
    trip = tripFromSelection(selection);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "rebuild failed";
    return { ok: false, reason: "invalid_metadata", detail };
  }

  const result = bookTrip(
    { ...trip, status: "paid", paidAt },
    { persist: false, sessionId },
  );

  const record: BookingRecord = {
    sessionId,
    status: "booked",
    selection,
    tripId: trip.id,
    totalAED: trip.totalCostAED,
    confirmations: result.confirmations,
    paidAt,
    bookedAt: result.bookedAt,
  };
  await store.set(sessionId, record);
  return { ok: true, record, created: true };
}

export async function markSessionFailed(
  store: BookingStore,
  sessionId: string,
  metadata?: Record<string, string> | null,
): Promise<BookingRecord> {
  const existing = await store.get(sessionId);
  if (existing?.status === "booked") return existing;

  let selection = existing?.selection;
  if (!selection && metadata) {
    try {
      selection = selectionFromMetadata(metadata);
    } catch {
      /* keep undefined */
    }
  }

  const record: BookingRecord = {
    sessionId,
    status: "failed",
    selection,
    tripId: existing?.tripId ?? selection?.tripId ?? "unknown",
  };
  if (existing) {
    await store.set(sessionId, record);
  } else {
    const claimed = await store.claim(sessionId, record);
    if (!claimed) {
      const again = await store.get(sessionId);
      if (again) return again;
    }
    await store.set(sessionId, record);
  }
  return record;
}
