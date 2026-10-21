import { NextResponse } from "next/server";
import { demoConfirmBooking, getTrip } from "@/lib/planning";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * POST /api/checkout/demo-confirm
 * Body: { tripId: string, confirm: true }
 *
 * Only available when STRIPE_SECRET_KEY is absent (demo fallback).
 * Bookings still require this explicit confirm — never on pay-button tap alone.
 */
export async function POST(request: Request) {
  if (getStripeSecretKey()) {
    return NextResponse.json(
      { error: "Demo confirm is disabled when Stripe is configured. Use Checkout + webhook." },
      { status: 409 },
    );
  }

  let body: { tripId?: string; confirm?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tripId || body.confirm !== true) {
    return NextResponse.json(
      { error: "Requires { tripId, confirm: true }. Nothing was booked." },
      { status: 400 },
    );
  }

  if (!getTrip(body.tripId)) {
    return NextResponse.json({ error: `Unknown trip ${body.tripId}` }, { status: 404 });
  }

  try {
    const result = demoConfirmBooking(body.tripId, { confirm: true });
    return NextResponse.json({
      message: "Demo only. Nothing was charged.",
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Demo confirm failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
