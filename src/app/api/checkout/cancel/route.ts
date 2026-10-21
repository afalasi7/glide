import { NextResponse } from "next/server";
import {
  demoCancelFromTrip,
  getTrip,
  markPaymentFailed,
  type Trip,
} from "@/lib/planning";
import { setSessionPaymentStatus } from "@/lib/planning/store";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * POST /api/checkout/cancel
 * Demo (no Stripe key): { trip } — validate from catalog, return failed status (stateless).
 * Stripe path: { tripId } — mark failed in store (needs durable storage for multi-instance).
 */
export async function POST(request: Request) {
  let body: { tripId?: string; trip?: Trip };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = "Payment didn't go through, so nothing was booked. Your plan is saved.";

  if (!getStripeSecretKey()) {
    if (!body.trip) {
      return NextResponse.json(
        { error: "Demo cancel requires { trip }. Plan stays on the client." },
        { status: 400 },
      );
    }
    try {
      const trip = demoCancelFromTrip(body.trip);
      return NextResponse.json({ status: "failed", message, trip });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Cancel failed";
      return NextResponse.json({ error }, { status: 400 });
    }
  }

  if (!body.tripId) {
    return NextResponse.json({ error: "tripId required when Stripe is configured" }, { status: 400 });
  }
  const trip = getTrip(body.tripId);
  if (!trip) {
    return NextResponse.json({ error: `Unknown trip ${body.tripId}` }, { status: 404 });
  }
  if (trip.status === "paid" || trip.status === "booked") {
    return NextResponse.json({ error: "Trip already paid", trip }, { status: 409 });
  }
  if (trip.checkoutSessionId) {
    setSessionPaymentStatus(trip.checkoutSessionId, "failed");
  }
  const updated = markPaymentFailed(body.tripId);
  return NextResponse.json({ status: "failed", message, trip: updated });
}
