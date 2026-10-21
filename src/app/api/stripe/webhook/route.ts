import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { confirmBookingAfterPayment, markPaymentFailed } from "@/lib/planning";
import {
  setSessionPaymentStatus,
  tripIdForSession,
} from "@/lib/planning/store";
import { getStripeSecretKey, requireStripe } from "@/lib/stripe/server";

/**
 * POST /api/stripe/webhook
 * Verifies Stripe-Signature with STRIPE_WEBHOOK_SECRET.
 * On checkout.session.completed → mark trip paid (in-memory) and run bookTrip.
 *
 * Storage: in-memory Map in src/lib/planning/store.ts (process lifetime only).
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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        // Async methods: wait for async_payment_succeeded in a fuller integration.
        setSessionPaymentStatus(session.id, "pending");
        return NextResponse.json({ received: true, deferred: true });
      }
      const tripId = session.metadata?.tripId ?? tripIdForSession(session.id);
      if (!tripId) {
        return NextResponse.json({ error: "No tripId on session" }, { status: 400 });
      }
      setSessionPaymentStatus(session.id, "paid");
      confirmBookingAfterPayment(tripId);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      setSessionPaymentStatus(session.id, "failed");
      const tripId = session.metadata?.tripId ?? tripIdForSession(session.id);
      if (tripId) markPaymentFailed(tripId);
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      setSessionPaymentStatus(session.id, "failed");
      const tripId = session.metadata?.tripId ?? tripIdForSession(session.id);
      if (tripId) markPaymentFailed(tripId);
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tripId = session.metadata?.tripId ?? tripIdForSession(session.id);
      if (tripId) {
        setSessionPaymentStatus(session.id, "paid");
        confirmBookingAfterPayment(tripId);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
