import Stripe from "stripe";

/**
 * Server-only Stripe access. STRIPE_SECRET_KEY must never use NEXT_PUBLIC_
 * or be imported from a Client Component.
 */
export function getStripeSecretKey(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return undefined;
  if (key.startsWith("pk_")) {
    throw new Error("STRIPE_SECRET_KEY must be a secret key (sk_test_…), not a publishable key");
  }
  return key;
}

export function requireStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // Instantiate per Stripe Node guidance (StripeClient-style `new Stripe()`).
  return new Stripe(key);
}

export function appBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://127.0.0.1:3456";
  return raw.replace(/\/$/, "");
}

/** AED amounts are in fils (1 AED = 100 fils). */
export function aedToFils(aed: number): number {
  return Math.round(aed * 100);
}
