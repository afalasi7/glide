import type { ProposedTrip } from "./types";

export type CheckoutResult =
  | { ok: true; mode: "stripe"; url: string }
  | { ok: true; mode: "demo"; url?: undefined }
  | { ok: false; error: string };

/**
 * Ask the Programmer's Stripe Checkout route. If it is missing or fails,
 * fall back to a local demo confirmation (no card form in Glide).
 */
export async function startCheckout(trip: ProposedTrip): Promise<CheckoutResult> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        title: trip.title,
        totalAed: trip.totalAed,
        currency: "aed",
        travellers: trip.prefs.travellers,
        nights: trip.nights,
        destinationId: trip.destinationId,
      }),
    });
    if (!res.ok) return { ok: true, mode: "demo" };
    const data = (await res.json()) as { url?: unknown };
    if (typeof data.url === "string" && data.url.startsWith("http")) {
      return { ok: true, mode: "stripe", url: data.url };
    }
    return { ok: true, mode: "demo" };
  } catch {
    return { ok: true, mode: "demo" };
  }
}
