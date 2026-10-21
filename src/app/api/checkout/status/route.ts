import { NextResponse } from "next/server";
import {
  getBookingStore,
  hasDurableBookingStore,
  selectionFromMetadata,
  tripFromSelection,
} from "@/lib/booking";
import { validateAndRepriceTrip, type Trip } from "@/lib/planning";
import { getStripeSecretKey, requireStripe } from "@/lib/stripe/server";

/**
 * GET /api/checkout/status?session_id=cs_…
 * Reads durable bookingStore first; if empty, retrieves the Checkout Session from Stripe
 * and rebuilds the trip from metadata.
 *
 * POST /api/checkout/status  body: { trip } — demo (or client-held) status, stateless.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") ?? undefined;
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  if (hasDurableBookingStore()) {
    try {
      const store = getBookingStore();
      const record = await store.get(sessionId);
      if (record) {
        const trip = record.selection ? tripFromSelection(record.selection) : undefined;
        const status =
          record.status === "booked"
            ? "paid"
            : record.status === "failed"
              ? "failed"
              : "pending";
        return NextResponse.json({
          status,
          tripId: record.tripId,
          trip: trip
            ? {
                ...trip,
                status: record.status === "booked" ? "booked" : record.status === "failed" ? "payment_failed" : "pending_payment",
                confirmations: record.confirmations,
                paidAt: record.paidAt,
                bookedAt: record.bookedAt,
              }
            : undefined,
          confirmations: record.confirmations,
        });
      }
    } catch (err) {
      console.warn("[checkout/status] store read failed", err);
    }
  }

  // Fallback: Stripe session + metadata rebuild (no server memory of the trip).
  if (!getStripeSecretKey()) {
    return NextResponse.json(
      { status: "failed", error: "No booking for session and Stripe is not configured" },
      { status: 404 },
    );
  }

  try {
    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    let trip: Trip | undefined;
    try {
      const sel = selectionFromMetadata(session.metadata as Record<string, string> | null);
      trip = tripFromSelection(sel);
    } catch {
      trip = undefined;
    }
    const payment = session.payment_status;
    const status =
      payment === "paid" || payment === "no_payment_required"
        ? "paid"
        : session.status === "expired"
          ? "failed"
          : "pending";
    return NextResponse.json({
      status,
      tripId: trip?.id ?? session.metadata?.tripId,
      trip,
      source: "stripe",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe retrieve failed";
    return NextResponse.json({ status: "failed", error: message }, { status: 404 });
  }
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

  try {
    const trip = validateAndRepriceTrip(body.trip);
    const status =
      body.trip.status === "paid" || body.trip.status === "booked"
        ? "paid"
        : body.trip.status === "payment_failed"
          ? "failed"
          : "pending";
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
