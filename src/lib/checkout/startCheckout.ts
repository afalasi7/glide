import type { BookingResult, Trip } from "@/lib/planning";

export type StartCheckoutResult =
  | { mode: "stripe"; url: string; sessionId?: string }
  | { mode: "demo"; tripId: string; message: string };

/**
 * Client helper: create a Checkout Session and redirect.
 * On 503 (no STRIPE_SECRET_KEY server-side) → demo path; does NOT book.
 * Call {@link confirmDemoCheckout} with the full trip after an explicit user confirm.
 *
 * Never imports STRIPE_SECRET_KEY — that stays server-only.
 */
export async function startCheckout(trip: Trip): Promise<void> {
  const result = await requestCheckout(trip);
  if (result.mode === "stripe") {
    window.location.assign(result.url);
    return;
  }
  const params = new URLSearchParams({
    checkout: "demo",
    trip_id: result.tripId,
    message: result.message,
  });
  const demoUrl = new URL("/app", window.location.origin);
  demoUrl.search = params.toString();
  window.location.assign(demoUrl.toString());
}

/** Same as startCheckout but returns the mode without navigating (for tests / custom UI). */
export async function requestCheckout(trip: Trip): Promise<StartCheckoutResult> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip }),
  });

  if (res.status === 503) {
    return {
      mode: "demo",
      tripId: trip.id,
      message: "Demo only. Nothing was charged.",
    };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Checkout failed (${res.status})`);
  }

  const data = (await res.json()) as { url: string; sessionId?: string };
  if (!data.url) throw new Error("Checkout response missing url");
  return { mode: "stripe", url: data.url, sessionId: data.sessionId };
}

/**
 * Explicit demo booking confirm (only when Stripe is not configured).
 * Sends the full trip — works on a cold serverless instance with an empty store.
 * UI should call this after the user confirms — never from the pay tap alone.
 */
export async function confirmDemoCheckout(trip: Trip): Promise<BookingResult & { message: string }> {
  const res = await fetch("/api/checkout/demo-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip, confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Demo confirm failed (${res.status})`);
  return data as BookingResult & { message: string };
}

/** Stripe path: poll by Checkout session id. */
export async function getCheckoutStatus(params: {
  sessionId: string;
}): Promise<{ status: "paid" | "pending" | "failed"; tripId?: string; trip?: Trip }>;

/** Demo path: POST the full trip (stateless). */
export async function getCheckoutStatus(params: {
  trip: Trip;
}): Promise<{ status: "paid" | "pending" | "failed"; tripId?: string; trip?: Trip }>;

export async function getCheckoutStatus(params: {
  sessionId?: string;
  tripId?: string;
  trip?: Trip;
}): Promise<{ status: "paid" | "pending" | "failed"; tripId?: string; trip?: Trip }> {
  if (params.trip) {
    const res = await fetch("/api/checkout/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip: params.trip }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Status failed (${res.status})`);
    return data;
  }

  const q = new URLSearchParams();
  if (params.sessionId) q.set("session_id", params.sessionId);
  if (params.tripId) q.set("trip_id", params.tripId);
  const res = await fetch(`/api/checkout/status?${q.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Status failed (${res.status})`);
  return data;
}

/**
 * Cancel return: demo sends the full trip; Stripe path may use tripId (store).
 */
/**
 * Cancel return: demo sends the full trip; Stripe path sends sessionId for the bookingStore.
 */
export async function reportCheckoutCancelled(args: {
  trip?: Trip;
  sessionId?: string;
}): Promise<{ status: "failed"; message: string; trip?: Trip }> {
  const res = await fetch("/api/checkout/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trip: args.trip,
      session_id: args.sessionId,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Cancel failed (${res.status})`);
  return data;
}

export { PAYMENT_TRUST_LINE } from "@/lib/planning";
