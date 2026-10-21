import { NextResponse } from "next/server";
import { getTrip, markPaymentFailed } from "@/lib/planning";
import { setSessionPaymentStatus } from "@/lib/planning/store";

/**
 * POST /api/checkout/cancel
 * Body: { tripId: string }
 * Marks payment failed while keeping the plan saved (cancel URL destination).
 */
export async function POST(request: Request) {
  let body: { tripId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.tripId) {
    return NextResponse.json({ error: "tripId required" }, { status: 400 });
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
  return NextResponse.json({
    status: "failed",
    message: "Payment didn't go through, so nothing was booked. Your plan is saved.",
    trip: updated,
  });
}
