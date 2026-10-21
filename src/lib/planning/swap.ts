import { evaluate, type Violation } from "@/lib/agent";
import { DESTINATIONS, getCatalogOption } from "./catalog";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { applyCatalogPrices, eachBookableItem, isPast2200 } from "./pricing";
import { saveTrip } from "./store";
import type { ApplySwapResult, LateItemFlag, SwapOption, Trip, TripItem } from "./types";

function findItem(trip: Trip, itemId: string): TripItem | undefined {
  if (trip.travel.id === itemId) return trip.travel;
  if (trip.hotel.id === itemId) return trip.hotel;
  for (const day of trip.days) {
    const hit = day.plans.find((p) => p.id === itemId);
    if (hit) return hit;
  }
  return undefined;
}

function mapItem(trip: Trip, itemId: string, map: (item: TripItem) => TripItem): Trip {
  if (trip.travel.id === itemId) return { ...trip, travel: map(trip.travel) };
  if (trip.hotel.id === itemId) return { ...trip, hotel: map(trip.hotel) };
  return {
    ...trip,
    days: trip.days.map((d) => ({
      ...d,
      plans: d.plans.map((p) => (p.id === itemId ? map(p) : p)),
    })),
  };
}

export function lateItemFlags(trip: Trip): LateItemFlag[] {
  return eachBookableItem(trip)
    .filter((item) => isPast2200(item.startTime))
    .map((item) => ({
      itemId: item.id,
      title: item.title,
      startTime: item.startTime,
      kind: item.kind,
      past2200: true,
    }));
}

/**
 * Return 2–3 alternative catalog options for the given trip item.
 */
export function swapOptions(trip: Trip, itemId: string): SwapOption[] {
  const item = findItem(trip, itemId);
  if (!item) throw new Error(`Unknown itemId ${itemId}`);

  const dest = DESTINATIONS[trip.destination];
  const pool =
    item.kind === "travel"
      ? dest.travel
      : item.kind === "hotel"
        ? dest.hotels
        : dest.plans.filter((p) => p.kind === item.kind);

  const alts = pool.filter((p) => p.catalogId !== item.catalogId).slice(0, 3);
  if (alts.length < 2) {
    const broader = (item.kind === "activity" || item.kind === "dining" ? dest.plans : pool).filter(
      (p) => p.catalogId !== item.catalogId,
    );
    for (const b of broader) {
      if (alts.length >= 3) break;
      if (!alts.some((a) => a.catalogId === b.catalogId)) alts.push(b);
    }
  }

  const currentUnit = getCatalogOption(item.catalogId)!.costAED;
  return alts.slice(0, 3).map((opt, i) => ({
    id: `opt_${itemId}_${i}_${opt.catalogId}`,
    itemId,
    catalogId: opt.catalogId,
    title: opt.title,
    location: opt.location,
    costAED: opt.costAED,
    startTime: opt.defaultStartTime,
    photo: opt.photo,
    deltaAED: opt.costAED - currentUnit,
    notes: opt.notes,
  }));
}

/**
 * Apply a swap option, re-price from catalog, rebuild the solver graph, and
 * re-run evaluate() (same constraint checks the reshape path uses).
 * Reports whether timings still hold and flags any item past 22:00.
 */
export function applySwap(trip: Trip, itemId: string, optionId: string): ApplySwapResult {
  const options = swapOptions(trip, itemId);
  const option = options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Unknown optionId ${optionId} for item ${itemId}`);

  const catalog = getCatalogOption(option.catalogId);
  if (!catalog) throw new Error(`Unknown catalogId ${option.catalogId}`);

  let next = mapItem(trip, itemId, (item) => ({
    ...item,
    catalogId: catalog.catalogId,
    kind: catalog.kind,
    title: catalog.title,
    location: catalog.location,
    startTime: option.startTime ?? item.startTime,
    photo: catalog.photo,
    mode: catalog.mode ?? item.mode,
    durationMin: catalog.durationMin ?? item.durationMin,
    notes: catalog.notes,
    bookingRef: catalog.kind === item.kind ? item.bookingRef : undefined,
  }));

  next = applyCatalogPrices(next);
  next = syncTripGraph(next);
  next = withFacts(next);
  if (next.status !== "paid" && next.status !== "booked") {
    next = { ...next, status: "proposed" };
  }

  const evaluation = evaluate(next.graph);
  const violations: Violation[] = evaluation.violations;
  const lateItems = lateItemFlags(next);
  const saved = saveTrip(next);

  return {
    trip: saved,
    violations,
    timingsHold: violations.length === 0,
    lateItems,
  };
}
