import { getCatalogOption } from "./catalog";
import type { Trip, TripItem } from "./types";

/** Per-person catalog kinds — multiplied by travellers when recomputing. */
const PER_PERSON = new Set(["travel", "activity", "dining"]);

export function lineCostAED(catalogId: string, travellers: number, nights = 1): number {
  const opt = getCatalogOption(catalogId);
  if (!opt) throw new Error(`Unknown catalogId ${catalogId}`);
  if (opt.kind === "hotel") return opt.costAED * Math.max(1, nights);
  if (PER_PERSON.has(opt.kind)) return opt.costAED * Math.max(1, travellers);
  return opt.costAED;
}

export function nightsBetween(startDate: string, endDate: string): number {
  const a = Date.parse(`${startDate}T00:00:00Z`);
  const b = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) {
    throw new Error("endDate must be on or after startDate");
  }
  const nights = Math.round((b - a) / 86_400_000);
  return Math.max(1, nights);
}

export function eachBookableItem(trip: Trip): TripItem[] {
  return [trip.travel, trip.hotel, ...trip.days.flatMap((d) => d.plans)];
}

/**
 * Recompute total from catalog prices — never trust client-sent costAED / totalCostAED.
 */
export function recomputeTotalAED(trip: Trip): number {
  const nights = nightsBetween(trip.startDate, trip.endDate);
  let total = 0;
  for (const item of eachBookableItem(trip)) {
    total += lineCostAED(item.catalogId, trip.travellers, nights);
  }
  return total;
}

/** Refresh each item's costAED from the catalog, then total. */
export function applyCatalogPrices(trip: Trip): Trip {
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const price = (item: TripItem): TripItem => ({
    ...item,
    costAED: lineCostAED(item.catalogId, trip.travellers, nights),
  });
  const next: Trip = {
    ...trip,
    travel: price(trip.travel),
    hotel: price(trip.hotel),
    days: trip.days.map((d) => ({ ...d, plans: d.plans.map(price) })),
  };
  const total = recomputeTotalAED(next);
  next.totalCostAED = total;
  return next;
}

/** Minutes past midnight from HH:MM. */
export function timeToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function isPast2200(hm: string): boolean {
  return timeToMinutes(hm) > 22 * 60;
}
