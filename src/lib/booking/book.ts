import type { BookedTrip, ProposedTrip } from "./types";

function code(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

/** Deterministic codes for tests when seed is provided. */
export function confirmationCodesFor(trip: ProposedTrip, seed = "demo"): Record<string, string> {
  const codes: Record<string, string> = {};
  for (const stop of trip.stops) {
    if (stop.kind === "transfer") continue;
    const prefix = stop.kind === "hotel" ? "HTL" : stop.kind === "dining" ? "DIN" : "ACT";
    const hash = [...`${seed}:${stop.id}`].reduce((a, c) => a + c.charCodeAt(0), 0);
    codes[stop.id] = `${prefix}-${1000 + (hash % 9000)}`;
  }
  return codes;
}

export function bookProposedTrip(
  trip: ProposedTrip,
  checkoutMode: "stripe" | "demo",
  opts?: { seed?: string; now?: string },
): BookedTrip {
  const codes = opts?.seed ? confirmationCodesFor(trip, opts.seed) : Object.fromEntries(
    trip.stops
      .filter((s) => s.kind !== "transfer")
      .map((s) => {
        const prefix = s.kind === "hotel" ? "HTL" : s.kind === "dining" ? "DIN" : "ACT";
        return [s.id, code(prefix)];
      }),
  );

  const stops = trip.stops.map((s) => (codes[s.id] ? { ...s, bookingRef: codes[s.id] } : s));
  const walletPasses = stops
    .filter((s) => s.kind === "hotel" || s.kind === "dining")
    .map((s) => ({
      id: `pass-${s.id}`,
      title: s.title,
      detail: `${s.startAt} · ${codes[s.id] ?? "DEMO"}`,
    }));

  return {
    ...trip,
    stops,
    status: "booked-demo",
    bookedAt: opts?.now ?? new Date().toISOString(),
    confirmationCodes: codes,
    checkoutMode,
    walletPasses,
  };
}

export function isBookedTrip(value: unknown): value is BookedTrip {
  if (!value || typeof value !== "object") return false;
  const v = value as BookedTrip;
  return v.status === "booked-demo" && Array.isArray(v.stops) && typeof v.totalAed === "number";
}
