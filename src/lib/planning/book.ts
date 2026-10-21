import { createMockWorld, executeTool } from "@/lib/agent";
import { eachBookableItem } from "./pricing";
import { getTrip, saveTrip, updateTrip } from "./store";
import { validateAndRepriceTrip } from "./validate";
import type {
  BookingConfirmation,
  BookingResult,
  Trip,
  WalletPassData,
} from "./types";

function formatPassDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function walletFor(trip: Trip, item: Trip["travel"], code: string): WalletPassData | undefined {
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

export type BookTripOptions = {
  /** Persist into the in-memory store (Stripe path). Default true. Demo sets false. */
  persist?: boolean;
};

/**
 * Issue demo confirmation codes + wallet passes for a trip that has already
 * cleared payment (Stripe webhook) or an explicit demo confirm.
 * Do NOT call this from a pay-button tap alone.
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
    const confirmationCode = `GLD-${item.kind.slice(0, 3).toUpperCase()}-${item.id.slice(-8).toUpperCase()}`;
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
  if (opts.persist !== false) saveTrip(next);

  return { tripId: next.id, confirmations, bookedAt, trip: next };
}

/**
 * Fulfillment after verified `checkout.session.completed` (or equivalent).
 * Marks paid in the in-memory store, then runs bookTrip.
 * Requires durable storage before real multi-instance payments.
 */
export function confirmBookingAfterPayment(tripId: string, paidAt = new Date().toISOString()): BookingResult {
  const trip = getTrip(tripId);
  if (!trip) throw new Error(`Unknown trip ${tripId}`);
  const paid = updateTrip(tripId, { status: "paid", paidAt }) ?? { ...trip, status: "paid" as const, paidAt };
  return bookTrip(paid, { persist: true });
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
 * @deprecated Prefer {@link demoConfirmBookingFromTrip} for serverless demo mode.
 * tripId lookup only works when the trip is already in this process's memory.
 */
export function demoConfirmBooking(tripId: string, opts: { confirm: true }): BookingResult {
  if (opts.confirm !== true) {
    throw new Error("demoConfirmBooking requires { confirm: true }");
  }
  const trip = getTrip(tripId);
  if (!trip) throw new Error(`Unknown trip ${tripId}`);
  return confirmBookingAfterPayment(tripId);
}

/** Mark payment failed in the store (Stripe path). */
export function markPaymentFailed(tripId: string): Trip | undefined {
  return updateTrip(tripId, { status: "payment_failed" });
}

/**
 * Stateless cancel for demo mode: reprice the client trip and return it as failed.
 * Plan stays with the client — nothing was booked.
 */
export function demoCancelFromTrip(trip: Trip): Trip {
  const validated = validateAndRepriceTrip(trip);
  return { ...validated, status: "payment_failed" };
}
