import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillCheckoutSession, getBookingStore, markSessionFailed } from "@/lib/booking";
import { getStripeSecretKey, requireStripe } from "@/lib/stripe/server";

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

/**
 * POST /api/stripe/webhook
 * Verifies Stripe-Signature with STRIPE_WEBHOOK_SECRET.
 * On checkout.session.completed → rebuild from metadata, claim booking:{sessionId},
 * book once (deterministic codes). Permanent failures trigger a full refund.
 *
 * Missing/invalid metadata → refund + 200. Transient errors → delete claim + 500.
 * Bad signature → 400.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 503 });
  }
  if (!getStripeSecretKey()) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = requireStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    const store = getBookingStore();

    const handlePaidSession = async (session: Stripe.Checkout.Session) => {
      const result = await fulfillCheckoutSession({
        sessionId: session.id,
        metadata: session.metadata as Record<string, string> | null,
        store,
        paymentIntentId: paymentIntentId(session),
        deps: {
          refund: async ({ paymentIntentId, sessionId }) => {
            const refund = await stripe.refunds.create(
              { payment_intent: paymentIntentId },
              { idempotencyKey: `refund:${sessionId}` },
            );
            return { id: refund.id };
          },
        },
      });
      if (!result.ok) {
        const refunded = "refunded" in result && Boolean(result.refunded);
        console.warn(
          `[stripe/webhook] ${result.reason} for session ${session.id}: ${result.detail}` +
            (refunded ? " (refunded)" : ""),
        );
        if (result.reason === "transient") {
          return NextResponse.json({ error: result.detail, reason: result.reason }, { status: 500 });
        }
        return NextResponse.json({
          received: true,
          warning: result.reason,
          refunded,
        });
      }
      return NextResponse.json({
        received: true,
        booked: result.record.status === "booked",
        created: result.created,
      });
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return NextResponse.json({ received: true, deferred: true });
      }
      return handlePaidSession(session);
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      return handlePaidSession(session);
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await markSessionFailed(store, session.id, session.metadata as Record<string, string> | null);
      return NextResponse.json({ received: true, status: "failed" });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    console.warn(`[stripe/webhook] handler error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
