import { NextResponse } from "next/server";
import { demoConfirmBookingFromTrip, type Trip } from "@/lib/planning";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * POST /api/checkout/demo-confirm
 * Body: { trip: Trip, confirm: true }
 *
 * Stateless demo path (no STRIPE_SECRET_KEY): validates the trip from the catalog
 * and returns confirmations without reading server memory — safe across Vercel instances.
 */
export async function POST(request: Request) {
  if (getStripeSecretKey()) {
    return NextResponse.json(
      { error: "Demo confirm is disabled when Stripe is configured. Use Checkout + webhook." },
      { status: 409 },
    );
  }

  let body: { trip?: Trip; tripId?: string; confirm?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "Requires { trip, confirm: true }. Nothing was booked." },
      { status: 400 },
    );
  }

  if (!body.trip) {
    return NextResponse.json(
      {
        error:
          "Demo mode requires the full trip in the body ({ trip, confirm: true }). tripId-only lookup is not used across serverless instances.",
      },
      { status: 400 },
    );
  }

  try {
    const result = demoConfirmBookingFromTrip(body.trip, { confirm: true });
    return NextResponse.json({
      message: "Demo only. Nothing was charged.",
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Demo confirm failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
