import { NextResponse } from "next/server";
import {
  getPaymentStatusForSession,
  getTrip,
  validateAndRepriceTrip,
  type Trip,
} from "@/lib/planning";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * GET /api/checkout/status?session_id=cs_…
 * Stripe path: session lookup (needs durable store before real multi-instance payments).
 *
 * POST /api/checkout/status  body: { trip: Trip }
 * Demo path (no Stripe key): validate trip from catalog; return status from the
 * client-supplied trip without server-memory lookup.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") ?? undefined;
  const tripIdParam = url.searchParams.get("trip_id") ?? undefined;

  if (sessionId) {
    const result = getPaymentStatusForSession(sessionId);
    return NextResponse.json({
      status: result.status,
      tripId: result.tripId,
      trip: result.trip,
    });
  }

  // trip_id alone only works if this instance still has the trip in memory (Stripe path).
  if (tripIdParam) {
    const trip = getTrip(tripIdParam);
    if (!trip) {
      return NextResponse.json(
        {
          status: "failed",
          error:
            "Unknown trip on this instance. In demo mode POST { trip } instead; Stripe path needs durable storage.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json({ status: statusFromTrip(trip), tripId: trip.id, trip });
  }

  return NextResponse.json(
    { error: "session_id required (Stripe), or POST { trip } in demo mode" },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let body: { trip?: Trip };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.trip) {
    return NextResponse.json({ error: "trip required" }, { status: 400 });
  }

  // When Stripe is configured, prefer session_id GET — but still allow trip validation.
  try {
    const trip = validateAndRepriceTrip(body.trip);
    // Preserve client booking/payment flags after reprice for status reporting.
    const status = statusFromTrip({
      ...trip,
      status: body.trip.status,
      confirmations: body.trip.confirmations,
    });
    return NextResponse.json({
      status,
      tripId: trip.id,
      trip: {
        ...trip,
        status: body.trip.status,
        confirmations: body.trip.confirmations,
        paidAt: body.trip.paidAt,
        bookedAt: body.trip.bookedAt,
      },
      mode: getStripeSecretKey() ? "stripe" : "demo",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid trip";
    return NextResponse.json({ error: message, status: "failed" }, { status: 400 });
  }
}

function statusFromTrip(trip: Trip): "paid" | "pending" | "failed" {
  if (trip.status === "paid" || trip.status === "booked") return "paid";
  if (trip.status === "payment_failed") return "failed";
  if (trip.status === "pending_payment") return "pending";
  return "pending";
}
