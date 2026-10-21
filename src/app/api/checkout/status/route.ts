import { NextResponse } from "next/server";
import { getPaymentStatusForSession, getTrip } from "@/lib/planning";

/**
 * GET /api/checkout/status?session_id=cs_…  (or ?trip_id=…)
 * Returns { status: "paid" | "pending" | "failed", tripId?, trip? }
 * so the UI can show: "Payment didn't go through, so nothing was booked. Your plan is saved."
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

  if (tripIdParam) {
    const trip = getTrip(tripIdParam);
    if (!trip) {
      return NextResponse.json({ status: "failed", error: "Unknown trip" }, { status: 404 });
    }
    const status =
      trip.status === "paid" || trip.status === "booked"
        ? "paid"
        : trip.status === "payment_failed"
          ? "failed"
          : trip.status === "pending_payment"
            ? "pending"
            : "pending";
    return NextResponse.json({ status, tripId: trip.id, trip });
  }

  return NextResponse.json({ error: "session_id or trip_id required" }, { status: 400 });
}
