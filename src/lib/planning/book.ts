import { createMockWorld, executeTool } from "@/lib/agent";
import { eachBookableItem } from "./pricing";
import { validateAndRepriceTrip } from "./validate";
import type {
  BookingConfirmation,
  BookingResult,
  Trip,
  TripItem,
  WalletPassData,
} from "./types";

function formatPassDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function walletFor(trip: Trip, item: TripItem, code: string): WalletPassData | undefined {
  if (item.kind !== "dining" && item.kind !== "hotel" && item.kind !== "travel") return undefined;
  const day = trip.days.find((d) => d.day === item.day) ?? trip.days[0];
  return {
    photo: item.photo,
    title: item.title,
    time: item.startTime,
    date: formatPassDate(day?.date ?? trip.startDate),
    note: "Confirmed",
    rows: [
      [item.kind === "hotel" ? "Room" : item.kind === "travel" ? "Leg" : "Table", item.location.slice(0, 28)],
      ["Guests", String(trip.travellers)],
      ["Fee", "None"],
    ],
    ref: code,
  };
}

/** Deterministic confirmation id from Checkout session id + item identity. */
export function deterministicConfirmationCode(sessionId: string, item: TripItem): string {
  const seed = `${sessionId}|${item.catalogId}|${item.day}|${item.startTime}|${item.kind}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `GLD-${item.kind.slice(0, 3).toUpperCase()}-${hex}`;
}

export type BookTripOptions = {
  /**
   * @deprecated No-op kept for call-site compatibility. Stripe path uses bookingStore;
   * demo path never persists server-side.
   */
  persist?: boolean;
  /** When set (Stripe Checkout session id), confirmation codes are deterministic. */
  sessionId?: string;
};

/**
 * Issue confirmation codes + wallet passes for a paid trip.
 * Do NOT call from a pay-button tap alone.
 */
export function bookTrip(trip: Trip, opts: BookTripOptions = {}): BookingResult {
  if (trip.status !== "paid" && trip.status !== "booked") {
    throw new Error(
      "bookTrip runs only after payment succeeds (or demo confirm). Status must be paid.",
    );
  }

  if (trip.status === "booked" && trip.confirmations?.length) {
    return {
      tripId: trip.id,
      confirmations: trip.confirmations,
      bookedAt: trip.bookedAt ?? new Date().toISOString(),
      trip,
    };
  }

  const world = createMockWorld();
  for (const item of eachBookableItem(trip)) {
    if (item.kind === "dining" && item.bookingRef) {
      world.reservations[item.bookingRef] = {
        time: item.startTime,
        table: "Demo table",
        party: trip.travellers,
        feeCents: 0,
        revision: 0,
      };
      world.walletPasses[`apple:${item.bookingRef}`] = { revision: 0, lastReason: "" };
    }
    if (item.kind === "hotel" && item.bookingRef) {
      world.hotelBookings[item.bookingRef] = {
        etaTime: item.startTime,
        mobileKeyDispatched: false,
        status: "expected",
      };
      world.walletPasses[`apple:${item.bookingRef}`] = { revision: 0, lastReason: "" };
    }
  }

  const confirmations: BookingConfirmation[] = [];
  const passIds: string[] = [];

  for (const item of eachBookableItem(trip)) {
    const confirmationCode = opts.sessionId
      ? deterministicConfirmationCode(opts.sessionId, item)
      : `GLD-${item.kind.slice(0, 3).toUpperCase()}-${item.id.slice(-8).toUpperCase()}`;

    if (item.kind === "hotel" && item.bookingRef) {
      executeTool(world, "flag_hotel_late_arrival", {
        reservation: item.bookingRef,
        etaTime: item.startTime,
      });
      passIds.push(`apple:${item.bookingRef}`);
    }
    if (item.kind === "dining" && item.bookingRef) {
      const existing = world.reservations[item.bookingRef];
      if (existing && existing.time !== item.startTime) {
        executeTool(world, "modify_dining_reservation", {
          bookingRef: item.bookingRef,
          newTime: item.startTime,
        });
      }
      passIds.push(`apple:${item.bookingRef}`);
    }

    confirmations.push({
      itemId: item.id,
      kind: item.kind,
      confirmationCode,
      title: item.title,
      walletPass: walletFor(trip, item, confirmationCode),
    });
  }

  if (passIds.length) {
    executeTool(world, "push_wallet_pass_sync", {
      passIds: [...new Set(passIds)],
      reason: "Booking confirmed after payment",
    });
  }

  const bookedAt = new Date().toISOString();
  const next: Trip = {
    ...trip,
    status: "booked",
    bookedAt,
    confirmations,
  };

  return { tripId: next.id, confirmations, bookedAt, trip: next };
}

/**
 * Stateless demo confirm: validate + reprice the client trip from the catalog,
 * then return confirmations without any server-memory lookup.
 */
export function demoConfirmBookingFromTrip(trip: Trip, opts: { confirm: true }): BookingResult {
  if (opts.confirm !== true) {
    throw new Error("demoConfirmBookingFromTrip requires { confirm: true }");
  }
  const validated = validateAndRepriceTrip(trip);
  const paid: Trip = {
    ...validated,
    status: "paid",
    paidAt: new Date().toISOString(),
  };
  return bookTrip(paid, { persist: false });
}

/**
 * Stateless cancel for demo mode: reprice the client trip and return it as failed.
 */
export function demoCancelFromTrip(trip: Trip): Trip {
  const validated = validateAndRepriceTrip(trip);
  return { ...validated, status: "payment_failed" };
}
