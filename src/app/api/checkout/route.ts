import { NextResponse } from "next/server";
import {
  assertStripeCheckoutReady,
  createCheckoutSession,
  resolveTripForCheckout,
  type CheckoutBody,
} from "@/lib/stripe/checkout";

/**
 * POST /api/checkout
 * Body: { trip: Trip } | { selection: CompactTripSelection }
 * Returns: { url: string }
 *
 * Recomputes totals from curated catalog — never trusts a client-sent price.
 * Requires durable Upstash storage when Stripe keys are set (never charge without a place to record).
 * If STRIPE_SECRET_KEY is missing → 503 demo fallback (stateless).
 */
export async function POST(request: Request) {
  const ready = assertStripeCheckoutReady();
  if (!ready.ok) {
    return NextResponse.json(
      {
        error: ready.code === "STORAGE_NOT_CONFIGURED" ? "Storage is not configured" : "Stripe is not configured",
        message: ready.message,
        code: ready.code,
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
    const status = message.startsWith("Provide") || message.includes("Unknown") || message.includes("catalog")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
