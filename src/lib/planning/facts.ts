import { DESTINATIONS, getCatalogOption } from "./catalog";
import { lineCostAED, nightsBetween, timeToMinutes } from "./pricing";
import type {
  CheaperHotelSuggestion,
  Trip,
  TripFacts,
  TripHighlight,
  TripItem,
} from "./types";

function findItemByCatalog(trip: Trip, catalogId: string): TripItem | undefined {
  for (const day of trip.days) {
    const hit = day.plans.find((p) => p.catalogId === catalogId);
    if (hit) return hit;
  }
  return undefined;
}

function inHighlightWindow(startTime: string, earliest: string, latest: string): boolean {
  const t = timeToMinutes(startTime);
  return t >= timeToMinutes(earliest) && t <= timeToMinutes(latest);
}

/**
 * Destination highlight only when the curated item is actually on the trip
 * at an accepted time. A swap that removes or retimes it drops the copy.
 */
export function buildHighlight(trip: Trip): TripHighlight | undefined {
  const dest = DESTINATIONS[trip.destination];
  const spec = dest.highlight;
  const item = findItemByCatalog(trip, spec.catalogId);
  if (!item) return undefined;
  if (!inHighlightWindow(item.startTime, spec.earliestStart, spec.latestStart)) {
    return undefined;
  }
  const dayMeta = trip.days.find((d) => d.day === item.day) ?? trip.days[0];
  return {
    itemId: item.id,
    catalogId: item.catalogId,
    title: item.title,
    startTime: item.startTime,
    day: item.day,
    date: dayMeta?.date ?? trip.startDate,
    label: spec.label,
    copy: spec.copy,
    cutoffTime: spec.cutoffTime,
  };
}

export function cheaperHotelSuggestion(trip: Trip): CheaperHotelSuggestion | undefined {
  const dest = DESTINATIONS[trip.destination];
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const currentLine = lineCostAED(trip.hotel.catalogId, trip.travellers, nights);
  let best: CheaperHotelSuggestion | undefined;
  for (const h of dest.hotels) {
    if (h.catalogId === trip.hotel.catalogId) continue;
    const cost = lineCostAED(h.catalogId, trip.travellers, nights);
    if (cost >= currentLine) continue;
    const saves = currentLine - cost;
    if (!best || saves > best.savesAED) {
      best = {
        catalogId: h.catalogId,
        title: h.title,
        location: h.location,
        costAED: cost,
        savesAED: saves,
      };
    }
  }
  return best;
}

/** Recompute facts from the priced trip. */
export function buildFacts(trip: Trip): TripFacts {
  const totalAED = trip.totalCostAED;
  const overBudgetByAED = Math.max(0, Math.round(totalAED - trip.budgetAED));
  const withinBudget = overBudgetByAED === 0;
  const facts: TripFacts = {
    withinBudget,
    totalAED,
    overBudgetByAED,
    highlight: buildHighlight(trip),
  };
  if (!withinBudget) {
    const cheaper = cheaperHotelSuggestion(trip);
    if (cheaper) facts.cheaperHotel = cheaper;
  }
  return facts;
}

export function withFacts(trip: Trip): Trip {
  const facts = buildFacts(trip);
  return { ...trip, facts, totalCostAED: facts.totalAED };
}

/** Ensure catalog option still exists (used by tests / suggestions). */
export function assertCatalog(catalogId: string): void {
  if (!getCatalogOption(catalogId)) throw new Error(`Unknown catalogId ${catalogId}`);
}
