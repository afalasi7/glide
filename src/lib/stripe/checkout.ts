import {
  eachBookableItem,
  getTrip,
  recomputeTotalAED,
  saveTrip,
  validateAndRepriceTrip,
  type Trip,
} from "@/lib/planning";
import { aedToFils, appBaseUrl, requireStripe } from "./server";
import { bindCheckoutSession } from "@/lib/planning/store";

export type CheckoutBody = {
  tripId?: string;
  trip?: Trip;
};

/**
 * Resolve the trip from the store (preferred for Stripe) or a client payload, then
 * re-price every line from the catalog. Never trust client totals.
 *
 * Note: the in-memory store is process-local. Real multi-instance Stripe payments
 * need durable storage before go-live.
 */
export function resolveTripForCheckout(body: CheckoutBody): Trip {
  if (body.tripId) {
    const stored = getTrip(body.tripId);
    if (stored) {
      const priced = validateAndRepriceTrip(stored);
      return saveTrip(priced);
    }
    // Fall through to client trip when this instance has no memory of tripId.
  }
  if (body.trip?.id) {
    const priced = validateAndRepriceTrip(body.trip);
    return saveTrip(priced);
  }
  throw new Error("Provide tripId or trip");
}

export async function createCheckoutSession(trip: Trip): Promise<{ url: string; sessionId: string }> {
  const stripe = requireStripe();
  const base = appBaseUrl();
  // Preserve the plan on cancel so the UI can keep editing / retry payment.
  const successUrl = `${base}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}&trip_id=${encodeURIComponent(trip.id)}`;
  const cancelUrl = `${base}/app?checkout=cancel&trip_id=${encodeURIComponent(trip.id)}`;

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
          metadata: { catalogId: item.catalogId, itemId: item.id },
        },
      },
    }));

  if (!line_items.length) {
    throw new Error("Trip has no payable line items");
  }

  // One-time payment only: no Customers, no setup_future_usage, no saved PMs.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items,
    metadata: {
      tripId: trip.id,
      totalAED: String(recomputeTotalAED(trip)),
    },
    // Do not set customer, customer_creation, or payment_intent_data.setup_future_usage.
  });

  if (!session.url) throw new Error("Stripe Checkout Session missing url");

  bindCheckoutSession(trip.id, session.id);
  return { url: session.url, sessionId: session.id };
}
