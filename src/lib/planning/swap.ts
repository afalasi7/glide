import { evaluate, type Violation } from "@/lib/agent";
import { DESTINATIONS, getCatalogOption } from "./catalog";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { applyCatalogPrices, eachBookableItem, isPast2200, timeToMinutes } from "./pricing";
import {
  arrivalMinutes,
  clampStart,
  dayWindow,
  defaultReturnDepartMinutes,
  fitsWindow,
  isOptionAvailable,
  minutesToHm,
  usedAreas,
  usedCatalogIds,
} from "./schedule";
import type { ApplySwapResult, LateItemFlag, SwapOption, Trip, TripItem } from "./types";

function findItem(trip: Trip, itemId: string): TripItem | undefined {
  if (trip.travel.id === itemId) return trip.travel;
  if (trip.returnTravel?.id === itemId) return trip.returnTravel;
  if (trip.hotel.id === itemId) return trip.hotel;
  for (const day of trip.days) {
    const hit = day.plans.find((p) => p.id === itemId);
    if (hit) return hit;
  }
  return undefined;
}

function mapItem(trip: Trip, itemId: string, map: (item: TripItem) => TripItem): Trip {
  if (trip.travel.id === itemId) return { ...trip, travel: map(trip.travel) };
  if (trip.returnTravel?.id === itemId) {
    return { ...trip, returnTravel: map(trip.returnTravel) };
  }
  if (trip.hotel.id === itemId) return { ...trip, hotel: map(trip.hotel) };
  return {
    ...trip,
    days: trip.days.map((d) => ({
      ...d,
      plans: d.plans.map((p) => (p.id === itemId ? map(p) : p)),
    })),
  };
}

function windowForItem(trip: Trip, item: TripItem): { earliest: number; latest: number } {
  const arrivalMin = arrivalMinutes(trip.travel);
  const returnDepartMin = trip.returnTravel
    ? timeToMinutes(trip.returnTravel.startTime)
    : defaultReturnDepartMinutes();
  const totalDays = trip.days.length;
  if (item.kind === "travel" && item.id === trip.travel.id) {
    return { earliest: 0, latest: 24 * 60 };
  }
  if (item.kind === "travel" && trip.returnTravel && item.id === trip.returnTravel.id) {
    return { earliest: 8 * 60, latest: 22 * 60 };
  }
  return dayWindow({
    dayIndex: item.day,
    totalDays,
    arrivalMin,
    returnDepartMin,
  });
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
 * Filters out venues already on the trip (unless repeatable) and options that
 * cannot fit the item's day window (arrival / return bounds).
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

  const usedIds = usedCatalogIds(trip);
  const usedAreaKeys = usedAreas(trip);
  const currentOpt = getCatalogOption(item.catalogId);
  const freeing = { catalogId: item.catalogId, area: currentOpt?.area };
  const { earliest, latest } = windowForItem(trip, item);

  const eligible = pool.filter((p) => {
    if (p.catalogId === item.catalogId) return false;
    if (!isOptionAvailable(p, usedIds, usedAreaKeys, freeing)) return false;
    if (item.kind === "activity" || item.kind === "dining") {
      return Boolean(fitsWindow(p, earliest, latest) || clampStart(p, earliest, latest));
    }
    return true;
  });

  const alts = eligible.slice(0, 3);
  if (alts.length < 2) {
    const broader = (item.kind === "activity" || item.kind === "dining" ? dest.plans : pool).filter(
      (p) => {
        if (p.catalogId === item.catalogId) return false;
        if (!isOptionAvailable(p, usedIds, usedAreaKeys, freeing)) return false;
        if (item.kind === "activity" || item.kind === "dining") {
          return Boolean(fitsWindow(p, earliest, latest) || clampStart(p, earliest, latest));
        }
        return true;
      },
    );
    for (const b of broader) {
      if (alts.length >= 3) break;
      if (!alts.some((a) => a.catalogId === b.catalogId)) alts.push(b);
    }
  }

  const currentUnit = getCatalogOption(item.catalogId)!.costAED;
  return alts.slice(0, 3).map((opt, i) => {
    const start =
      item.kind === "activity" || item.kind === "dining"
        ? fitsWindow(opt, earliest, latest)
          ? (opt.defaultStartTime ?? item.startTime)
          : (clampStart(opt, earliest, latest) ?? opt.defaultStartTime)
        : opt.defaultStartTime;
    return {
      id: `opt_${itemId}_${i}_${opt.catalogId}`,
      itemId,
      catalogId: opt.catalogId,
      title: opt.title,
      location: opt.location,
      costAED: opt.costAED,
      startTime: start,
      photo: opt.photo,
      deltaAED: opt.costAED - currentUnit,
      notes: opt.notes,
    };
  });
}

/**
 * Apply a swap option, re-price from catalog, rebuild the solver graph, and
 * re-run evaluate() (same constraint checks the reshape path uses).
 * Keeps arrival/return bounds, unique venues, and time-ordered day plans.
 */
export function applySwap(trip: Trip, itemId: string, optionId: string): ApplySwapResult {
  const options = swapOptions(trip, itemId);
  const option = options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Unknown optionId ${optionId} for item ${itemId}`);

  const catalog = getCatalogOption(option.catalogId);
  if (!catalog) throw new Error(`Unknown catalogId ${option.catalogId}`);

  const item = findItem(trip, itemId)!;
  const usedIds = usedCatalogIds(trip);
  const usedAreaKeys = usedAreas(trip);
  const currentOpt = getCatalogOption(item.catalogId);
  if (
    !isOptionAvailable(catalog, usedIds, usedAreaKeys, {
      catalogId: item.catalogId,
      area: currentOpt?.area,
    })
  ) {
    throw new Error(
      catalog.area
        ? `Area ${catalog.area} is already on this trip`
        : `Venue ${catalog.catalogId} is already on this trip`,
    );
  }

  const { earliest, latest } = windowForItem(trip, item);
  let startTime = option.startTime ?? item.startTime;
  if (catalog.kind === "activity" || catalog.kind === "dining") {
    const clamped =
      fitsWindow(catalog, earliest, latest)
        ? (catalog.defaultStartTime ?? startTime)
        : clampStart(catalog, earliest, latest);
    if (!clamped) {
      throw new Error(`${catalog.title} does not fit the day window`);
    }
    startTime = clamped;
  }

  let next = mapItem(trip, itemId, (prev) => ({
    ...prev,
    catalogId: catalog.catalogId,
    kind: catalog.kind,
    title: catalog.title,
    location: catalog.location,
    startTime,
    endTime: catalog.durationMin
      ? minutesToHm(timeToMinutes(startTime) + catalog.durationMin)
      : prev.endTime,
    photo: catalog.photo,
    mode: catalog.mode ?? prev.mode,
    durationMin: catalog.durationMin ?? prev.durationMin,
    notes: catalog.notes,
    bookingRef: catalog.kind === prev.kind ? prev.bookingRef : undefined,
  }));

  // Keep each day's plans in wall-clock order after a retime.
  next = {
    ...next,
    days: next.days.map((d) => ({
      ...d,
      plans: [...d.plans].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })),
  };

  next = applyCatalogPrices(next);
  next = syncTripGraph(next);
  next = withFacts(next);
  if (next.status !== "paid" && next.status !== "booked") {
    next = { ...next, status: "proposed" };
  }

  const evaluation = evaluate(next.graph);
  const violations: Violation[] = evaluation.violations;
  const lateItems = lateItemFlags(next);

  return {
    trip: next,
    violations,
    timingsHold: violations.length === 0,
    lateItems,
  };
}
