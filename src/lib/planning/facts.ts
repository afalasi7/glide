import { DESTINATIONS, getCatalogOption } from "./catalog";
import { lineCostAED, nightsBetween } from "./pricing";
import type {
  CheaperHotelSuggestion,
  Trip,
  TripFacts,
  TripHighlight,
  TripItem,
} from "./types";

function findItemByCatalog(trip: Trip, catalogId: string): TripItem | undefined {
  if (trip.travel.catalogId === catalogId) return trip.travel;
  if (trip.hotel.catalogId === catalogId) return trip.hotel;
  for (const day of trip.days) {
    const hit = day.plans.find((p) => p.catalogId === catalogId);
    if (hit) return hit;
  }
  return undefined;
}

export function buildHighlight(trip: Trip): TripHighlight {
  const dest = DESTINATIONS[trip.destination];
  const item =
    findItemByCatalog(trip, dest.highlightCatalogId) ??
    trip.days.flatMap((d) => d.plans)[0] ??
    trip.travel;
  const dayMeta = trip.days.find((d) => d.day === item.day) ?? trip.days[0];
  return {
    itemId: item.id,
    catalogId: item.catalogId,
    title: item.title,
    startTime: item.startTime,
    day: item.day,
    date: dayMeta?.date ?? trip.startDate,
    label: dest.highlightLabel,
    cutoffTime: dest.highlightCutoffTime,
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
