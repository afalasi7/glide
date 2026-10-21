import "server-only";

import {
  eachBookableItem,
  validateAndRepriceTrip,
  type Trip,
} from "@/lib/planning";
import {
  hasDurableBookingStore,
  selectionFromTrip,
  selectionToMetadata,
  tripFromSelection,
  type CompactTripSelection,
} from "@/lib/booking";
import { aedToFils, appBaseUrl, getStripeSecretKey, requireStripe } from "./server";

export type CheckoutBody = {
  /** Preferred: full trip from the client (re-priced server-side). */
  trip?: Trip;
  /** Compact selection (destination, dates, budget, catalog swaps). */
  selection?: CompactTripSelection;
};

/**
 * Resolve trip from client body only — never from server memory.
 * Re-derives prices from the curated catalog.
 */
export function resolveTripForCheckout(body: CheckoutBody): Trip {
  if (body.trip?.id) {
    return validateAndRepriceTrip(body.trip);
  }
  if (body.selection) {
    return tripFromSelection(body.selection);
  }
  throw new Error("Provide trip or selection");
}

export function assertStripeCheckoutReady():
  | { ok: true }
  | { ok: false; code: "STRIPE_NOT_CONFIGURED" | "STORAGE_NOT_CONFIGURED"; message: string } {
  if (!getStripeSecretKey()) {
    return {
      ok: false,
      code: "STRIPE_NOT_CONFIGURED",
      message: "Demo only. Nothing was charged. Set STRIPE_SECRET_KEY (sk_test_…) to enable Checkout.",
    };
  }
  if (!hasDurableBookingStore()) {
    return {
      ok: false,
      code: "STORAGE_NOT_CONFIGURED",
      message:
        "Stripe is configured but durable booking storage is not. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN) before taking payments. Nothing was charged.",
    };
  }
  return { ok: true };
}

export async function createCheckoutSession(trip: Trip): Promise<{ url: string; sessionId: string }> {
  const stripe = requireStripe();
  const base = appBaseUrl();
  const selection = selectionFromTrip(trip);
  const metadata = selectionToMetadata(selection);

  const successUrl = `${base}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}&trip_id=${encodeURIComponent(trip.id)}`;
  const cancelUrl = `${base}/app?checkout=cancel&trip_id=${encodeURIComponent(trip.id)}&session_id={CHECKOUT_SESSION_ID}`;

  const line_items = eachBookableItem(trip)
    .filter((item) => item.costAED > 0)
    .map((item) => ({
      quantity: 1,
      price_data: {
        currency: "aed" as const,
        unit_amount: aedToFils(item.costAED),
        product_data: {
          name: item.title,
          description: `${item.kind} · ${item.location}`.slice(0, 500),
        },
      },
    }));

  if (!line_items.length) {
    throw new Error("Trip has no payable line items");
  }

  // One-time payment only: no Customers, no setup_future_usage, no saved PMs.
  // Compact selection in metadata is the source of truth for the webhook.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items,
    metadata,
  });

  if (!session.url) throw new Error("Stripe Checkout Session missing url");
  return { url: session.url, sessionId: session.id };
}
