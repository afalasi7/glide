import { NextResponse } from "next/server";
import { getBookingStore, hasDurableBookingStore, markSessionFailed } from "@/lib/booking";
import { demoCancelFromTrip, type Trip } from "@/lib/planning";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * POST /api/checkout/cancel
 * Demo: { trip } — validate from catalog, return failed (stateless).
 * Stripe: { session_id } — mark failed in durable bookingStore.
 */
export async function POST(request: Request) {
  let body: { tripId?: string; trip?: Trip; session_id?: string; sessionId?: string };
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

  const sessionId = body.session_id ?? body.sessionId;
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id required when Stripe is configured" },
      { status: 400 },
    );
  }
  if (!hasDurableBookingStore()) {
    return NextResponse.json(
      {
        error: "Storage is not configured",
        code: "STORAGE_NOT_CONFIGURED",
        message,
      },
      { status: 503 },
    );
  }

  const store = getBookingStore();
  const record = await markSessionFailed(store, sessionId);
  return NextResponse.json({ status: "failed", message, tripId: record.tripId, record });
}
