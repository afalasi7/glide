import { DESTINATIONS, getCatalogOption } from "./catalog";
import { isEveningDining, usedCatalogIds } from "./schedule";
import { lineCostAED, nightsBetween, timeToMinutes } from "./pricing";
import type {
  CheaperHotelSuggestion,
  CheapestFix,
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

function hotelSwapFix(trip: Trip): CheapestFix | undefined {
  const cheaper = cheaperHotelSuggestion(trip);
  if (!cheaper || cheaper.savesAED <= 0) return undefined;
  return {
    kind: "swap-hotel",
    label: `Swap hotel to ${cheaper.title} to save AED ${cheaper.savesAED}.`,
    savingAed: cheaper.savesAED,
  };
}

function mealSwapFix(trip: Trip): CheapestFix | undefined {
  const dest = DESTINATIONS[trip.destination];
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const used = usedCatalogIds(trip);
  let best: CheapestFix | undefined;

  for (const day of trip.days) {
    for (const item of day.plans) {
      const current = getCatalogOption(item.catalogId);
      if (!current || !isEveningDining(current)) continue;
      const currentCost = lineCostAED(item.catalogId, trip.travellers, nights);
      for (const alt of dest.plans) {
        if (alt.kind !== "dining") continue;
        if (!isEveningDining(alt)) continue;
        if (alt.catalogId === item.catalogId) continue;
        if (used.has(alt.catalogId) && alt.catalogId !== item.catalogId) continue;
        const altCost = lineCostAED(alt.catalogId, trip.travellers, nights);
        const saves = currentCost - altCost;
        if (saves <= 0) continue;
        if (!best || saves > best.savingAed) {
          best = {
            kind: "swap-meal",
            label: `Swap dinner at ${current.title} for ${alt.title} to save AED ${saves}.`,
            savingAed: saves,
          };
        }
      }
    }
  }
  return best;
}

function dropItemFix(trip: Trip): CheapestFix | undefined {
  const nights = nightsBetween(trip.startDate, trip.endDate);
  let best: CheapestFix | undefined;
  for (const day of trip.days) {
    for (const item of day.plans) {
      const opt = getCatalogOption(item.catalogId);
      if (!opt) continue;
      const cost = lineCostAED(item.catalogId, trip.travellers, nights);
      if (cost <= 0) continue;
      if (opt.catalogId === DESTINATIONS[trip.destination].highlight.catalogId) continue;
      if (!best || cost > best.savingAed) {
        best = {
          kind: "drop-item",
          label: `Drop ${item.title} to save AED ${cost}.`,
          savingAed: cost,
        };
      }
    }
  }
  return best;
}

function shortenTripFix(trip: Trip): CheapestFix | undefined {
  if (trip.days.length <= 1) return undefined;
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const lastDay = trip.days[trip.days.length - 1]!;
  let dayCost = 0;
  for (const p of lastDay.plans) {
    dayCost += lineCostAED(p.catalogId, trip.travellers, nights);
  }
  if (trip.returnTravel) {
    dayCost += lineCostAED(trip.returnTravel.catalogId, trip.travellers, nights);
  }
  const hotelOpt = getCatalogOption(trip.hotel.catalogId);
  if (hotelOpt) dayCost += hotelOpt.costAED;
  if (dayCost <= 0) return undefined;
  return {
    kind: "shorten-trip",
    label: "Make it one night shorter",
    savingAed: dayCost,
  };
}

function raiseBudgetFix(trip: Trip): CheapestFix {
  return {
    kind: "raise-budget",
    label: `Set budget to AED ${trip.totalCostAED}.`,
    savingAed: 0,
    targetBudgetAed: trip.totalCostAED,
  };
}

/**
 * Always returns a concrete next step for over-budget trips.
 * Prefers the option that saves the most AED; falls back to raise-budget.
 */
export function buildCheapestFix(trip: Trip): CheapestFix {
  const candidates: CheapestFix[] = [];
  const hotel = hotelSwapFix(trip);
  if (hotel) candidates.push(hotel);
  const meal = mealSwapFix(trip);
  if (meal) candidates.push(meal);
  const drop = dropItemFix(trip);
  if (drop) candidates.push(drop);
  const shorten = shortenTripFix(trip);
  if (shorten) candidates.push(shorten);

  candidates.sort((a, b) => b.savingAed - a.savingAed);
  const best = candidates[0];
  if (best && best.savingAed > 0) return best;
  return raiseBudgetFix(trip);
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
    facts.cheapestFix = buildCheapestFix(trip);
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
