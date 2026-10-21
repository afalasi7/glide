import type { PaymentStatus, Trip } from "./types";

/**
 * In-memory trip store for the championship demo.
 * Survives for the life of the Node process only — not durable across deploys.
 * Checkout sessions and the Stripe webhook mark payment / booking here.
 */
const trips = new Map<string, Trip>();
/** sessionId → tripId for webhook fulfillment and status polling. */
const sessions = new Map<string, string>();
/** sessionId → payment status override (pending until webhook / failure). */
const sessionStatus = new Map<string, PaymentStatus>();

export function saveTrip(trip: Trip): Trip {
  trips.set(trip.id, structuredClone(trip));
  return getTrip(trip.id)!;
}

export function getTrip(id: string): Trip | undefined {
  const t = trips.get(id);
  return t ? structuredClone(t) : undefined;
}

export function updateTrip(id: string, patch: Partial<Trip>): Trip | undefined {
  const current = trips.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  trips.set(id, next);
  return structuredClone(next);
}

export function bindCheckoutSession(tripId: string, sessionId: string): void {
  sessions.set(sessionId, tripId);
  sessionStatus.set(sessionId, "pending");
  const t = trips.get(tripId);
  if (t) {
    t.checkoutSessionId = sessionId;
    if (t.status !== "paid" && t.status !== "booked") {
      t.status = "pending_payment";
    }
  }
}

export function tripIdForSession(sessionId: string): string | undefined {
  return sessions.get(sessionId);
}

export function setSessionPaymentStatus(sessionId: string, status: PaymentStatus): void {
  sessionStatus.set(sessionId, status);
}

export function getPaymentStatusForSession(sessionId: string): {
  status: PaymentStatus;
  tripId?: string;
  trip?: Trip;
} {
  const tripId = sessions.get(sessionId);
  const trip = tripId ? getTrip(tripId) : undefined;
  if (trip?.status === "paid" || trip?.status === "booked") {
    return { status: "paid", tripId, trip };
  }
  if (trip?.status === "payment_failed") {
    return { status: "failed", tripId, trip };
  }
  const stored = sessionStatus.get(sessionId);
  if (stored) return { status: stored, tripId, trip };
  if (!tripId) return { status: "failed" };
  return { status: "pending", tripId, trip };
}

export function markTripPaid(tripId: string, paidAt = new Date().toISOString()): Trip | undefined {
  const next = updateTrip(tripId, { status: "paid", paidAt });
  const t = trips.get(tripId);
  if (t?.checkoutSessionId) sessionStatus.set(t.checkoutSessionId, "paid");
  return next;
}

/** Test helper — clear store between cases. */
export function resetTripStore(): void {
  trips.clear();
  sessions.clear();
  sessionStatus.clear();
}
