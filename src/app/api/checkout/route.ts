import { NextResponse } from "next/server";
import { createCheckoutSession, resolveTripForCheckout, type CheckoutBody } from "@/lib/stripe/checkout";
import { getStripeSecretKey } from "@/lib/stripe/server";

/**
 * POST /api/checkout
 * Body: { tripId: string } | { trip: Trip }
 * Returns: { url: string }
 *
 * Recomputes totals from curated catalog prices — never trusts a client-sent price.
 * If STRIPE_SECRET_KEY is missing → 503 (demo helper falls back without charging).
 */
export async function POST(request: Request) {
  if (!getStripeSecretKey()) {
    return NextResponse.json(
      {
        error: "Stripe is not configured",
        message: "Demo only. Nothing was charged. Set STRIPE_SECRET_KEY (sk_test_…) to enable Checkout.",
        code: "STRIPE_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const trip = resolveTripForCheckout(body);
    const { url, sessionId } = await createCheckoutSession(trip);
    return NextResponse.json({ url, sessionId, tripId: trip.id, totalAED: trip.totalCostAED });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    const status = message.startsWith("Unknown") || message.startsWith("Provide") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
