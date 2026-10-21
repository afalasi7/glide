import "server-only";

import { bookTrip } from "@/lib/planning/book";
import type { Trip } from "@/lib/planning/types";
import { REFUND_MESSAGE } from "./messages";
import {
  selectionFromMetadata,
  tripFromSelection,
  type CompactTripSelection,
} from "./selection";
import type { BookingRecord, BookingStore } from "./store";

export type FulfillResult =
  | { ok: true; record: BookingRecord; created: boolean }
  /** Permanent — webhook should 200 (and may have refunded). */
  | {
      ok: false;
      reason: "missing_metadata" | "invalid_metadata";
      detail: string;
      record?: BookingRecord;
      refunded?: boolean;
    }
  /** Temporary — claim deleted; webhook should 500 so Stripe retries. */
  | { ok: false; reason: "transient"; detail: string };

export type FulfillDeps = {
  rebuild?: (sel: CompactTripSelection) => Trip;
  book?: typeof bookTrip;
  /** Create a full refund; must honour idempotencyKey `refund:{sessionId}`. */
  refund?: (args: {
    paymentIntentId: string;
    sessionId: string;
  }) => Promise<{ id: string }>;
};

/**
 * Idempotent fulfillment for checkout.session.completed.
 *
 * - Claims `booking:{sessionId}` as pending (with TTL).
 * - If already `booked` / `refunded`, returns that record.
 * - If already `pending`, finishes the booking (deterministic bookTrip).
 * - Bad metadata / unrebuildable trip → full Stripe refund (idempotent), status `refunded`, 200 path.
 * - Unexpected book error → delete claim, transient 500 path.
 */
export async function fulfillCheckoutSession(args: {
  sessionId: string;
  metadata: Record<string, string> | null | undefined;
  store: BookingStore;
  paidAt?: string;
  paymentIntentId?: string | null;
  deps?: FulfillDeps;
}): Promise<FulfillResult> {
  const { sessionId, metadata, store, deps, paymentIntentId } = args;
  const paidAt = args.paidAt ?? new Date().toISOString();
  const rebuild = deps?.rebuild ?? tripFromSelection;
  const book = deps?.book ?? bookTrip;
  const refund = deps?.refund;

  const existing = await store.get(sessionId);
  if (existing?.status === "booked" && existing.confirmations?.length) {
    return { ok: true, record: existing, created: false };
  }
  if (existing?.status === "refunded") {
    return {
      ok: false,
      reason: "invalid_metadata",
      detail: "Session already refunded",
      record: existing,
      refunded: true,
    };
  }

  let selection: CompactTripSelection | undefined;
  try {
    selection = selectionFromMetadata(metadata);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "invalid metadata";
    const reason: "missing_metadata" | "invalid_metadata" =
      metadata && Object.keys(metadata).length ? "invalid_metadata" : "missing_metadata";
    return permanentFailure({
      store,
      sessionId,
      selection: undefined,
      tripId: existing?.tripId,
      reason,
      detail,
      paymentIntentId,
      refund,
      existing,
    });
  }

  if (existing?.status === "pending") {
    return finishBooking({
      sessionId,
      selection: existing.selection ?? selection,
      store,
      paidAt,
      rebuild,
      book,
      created: true,
      paymentIntentId,
      refund,
    });
  }

  const pending: BookingRecord = {
    sessionId,
    status: "pending",
    selection,
    tripId: selection.tripId,
    paidAt,
    claimedAt: new Date().toISOString(),
  };

  const claimed = await store.claim(sessionId, pending);
  if (!claimed) {
    const again = await store.get(sessionId);
    if (again?.status === "booked" && again.confirmations?.length) {
      return { ok: true, record: again, created: false };
    }
    if (again?.status === "refunded") {
      return {
        ok: false,
        reason: "invalid_metadata",
        detail: "Session already refunded",
        record: again,
        refunded: true,
      };
    }
    if (again?.status === "pending") {
      return finishBooking({
        sessionId,
        selection: again.selection ?? selection,
        store,
        paidAt,
        rebuild,
        book,
        created: true,
        paymentIntentId,
        refund,
      });
    }
    if (again?.status === "failed") {
      return permanentFailure({
        store,
        sessionId,
        selection,
        tripId: again.tripId,
        reason: "invalid_metadata",
        detail: "Session previously marked failed",
        paymentIntentId,
        refund,
        existing: again,
      });
    }
  }

  return finishBooking({
    sessionId,
    selection,
    store,
    paidAt,
    rebuild,
    book,
    created: true,
    paymentIntentId,
    refund,
  });
}

async function finishBooking(args: {
  sessionId: string;
  selection: CompactTripSelection;
  store: BookingStore;
  paidAt: string;
  rebuild: (sel: CompactTripSelection) => Trip;
  book: typeof bookTrip;
  created: boolean;
  paymentIntentId?: string | null;
  refund?: FulfillDeps["refund"];
}): Promise<FulfillResult> {
  const { sessionId, selection, store, paidAt, rebuild, book, created, paymentIntentId, refund } =
    args;

  const latest = await store.get(sessionId);
  if (latest?.status === "booked" && latest.confirmations?.length) {
    return { ok: true, record: latest, created: false };
  }
  if (latest?.status === "refunded") {
    return {
      ok: false,
      reason: "invalid_metadata",
      detail: "Session already refunded",
      record: latest,
      refunded: true,
    };
  }

  let trip: Trip;
  try {
    trip = rebuild(selection);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "rebuild failed";
    // Unrebuildable trip is a permanent catalog/metadata failure → refund.
    return permanentFailure({
      store,
      sessionId,
      selection,
      tripId: selection.tripId,
      reason: "invalid_metadata",
      detail,
      paymentIntentId,
      refund,
      existing: latest ?? undefined,
    });
  }

  try {
    const result = book(
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
    return { ok: true, record, created };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "booking failed";
    await store.delete(sessionId);
    return { ok: false, reason: "transient", detail };
  }
}

async function permanentFailure(args: {
  store: BookingStore;
  sessionId: string;
  selection: CompactTripSelection | undefined;
  tripId?: string;
  reason: "missing_metadata" | "invalid_metadata";
  detail: string;
  paymentIntentId?: string | null;
  refund?: FulfillDeps["refund"];
  existing?: BookingRecord | null;
}): Promise<FulfillResult> {
  const { store, sessionId, selection, reason, detail, paymentIntentId, refund } = args;

  const existing = args.existing ?? (await store.get(sessionId));
  if (existing?.status === "booked" && existing.confirmations?.length) {
    return { ok: true, record: existing, created: false };
  }
  if (existing?.status === "refunded") {
    return { ok: false, reason, detail, record: existing, refunded: true };
  }

  if (paymentIntentId && refund) {
    try {
      const ref = await refund({ paymentIntentId, sessionId });
      const record: BookingRecord = {
        sessionId,
        status: "refunded",
        selection,
        tripId: args.tripId ?? selection?.tripId ?? existing?.tripId ?? "unknown",
        refundId: ref.id,
        paidAt: existing?.paidAt,
      };
      await store.set(sessionId, record);
      return { ok: false, reason, detail, record, refunded: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "refund failed";
      await store.delete(sessionId);
      return { ok: false, reason: "transient", detail: msg };
    }
  }

  // No payment intent (or no refund fn) — still mark failed for review, no pending left.
  const failed: BookingRecord = {
    sessionId,
    status: "failed",
    selection,
    tripId: args.tripId ?? selection?.tripId ?? existing?.tripId ?? "unknown",
  };
  await store.set(sessionId, failed);
  return { ok: false, reason, detail, record: failed };
}

export async function markSessionFailed(
  store: BookingStore,
  sessionId: string,
  metadata?: Record<string, string> | null,
): Promise<BookingRecord> {
  const existing = await store.get(sessionId);
  if (existing?.status === "booked" || existing?.status === "refunded") return existing;

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
  await store.set(sessionId, record);
  return record;
}

export { REFUND_MESSAGE };
