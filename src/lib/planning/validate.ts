import { DESTINATIONS, getCatalogOption, resolveDestination } from "./catalog";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { applyCatalogPrices, eachBookableItem, nightsBetween } from "./pricing";
import type { Trip, TripItem } from "./types";

function assertItemShape(item: TripItem, label: string): void {
  if (!item || typeof item !== "object") throw new Error(`${label} is required`);
  if (!item.catalogId || typeof item.catalogId !== "string") {
    throw new Error(`${label} missing catalogId`);
  }
  if (!getCatalogOption(item.catalogId)) {
    throw new Error(`Unknown catalog item "${item.catalogId}"`);
  }
  if (!item.id || typeof item.id !== "string") throw new Error(`${label} missing id`);
  if (!item.startTime || !/^\d{2}:\d{2}$/.test(item.startTime)) {
    throw new Error(`${label} needs startTime HH:MM`);
  }
  if (!Number.isInteger(item.day) || item.day < 1) throw new Error(`${label} has invalid day`);
}

/**
 * Re-derive a client-submitted trip from the curated catalog.
 * Rejects unknown items, recomputes every line price and total server-side.
 * Does not read or write the in-memory store (safe on a cold serverless instance).
 */
export function validateAndRepriceTrip(raw: Trip): Trip {
  if (!raw || typeof raw !== "object") throw new Error("trip is required");
  if (!raw.id || typeof raw.id !== "string") throw new Error("trip.id is required");

  const destination = resolveDestination(raw.destination);
  if (!DESTINATIONS[destination]) throw new Error(`Unsupported destination`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.startDate ?? "")) throw new Error("startDate must be YYYY-MM-DD");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.endDate ?? "")) throw new Error("endDate must be YYYY-MM-DD");
  nightsBetween(raw.startDate, raw.endDate);

  if (!Number.isInteger(raw.travellers) || raw.travellers < 1 || raw.travellers > 12) {
    throw new Error("travellers must be an integer from 1 to 12");
  }
  if (!Number.isFinite(raw.budgetAED) || raw.budgetAED <= 0) {
    throw new Error("budgetAED must be a positive number");
  }

  assertItemShape(raw.travel, "travel");
  assertItemShape(raw.hotel, "hotel");
  if (raw.travel.kind !== "travel" && getCatalogOption(raw.travel.catalogId)?.kind !== "travel") {
    throw new Error("travel item must be a travel catalog option");
  }
  if (getCatalogOption(raw.hotel.catalogId)?.kind !== "hotel") {
    throw new Error("hotel item must be a hotel catalog option");
  }
  if (!Array.isArray(raw.days) || raw.days.length < 1) throw new Error("days required");

  for (const day of raw.days) {
    if (!Array.isArray(day.plans) || day.plans.length < 1) {
      throw new Error(`day ${day.day} needs plans`);
    }
    for (const plan of day.plans) {
      assertItemShape(plan, `day ${day.day} plan`);
      const opt = getCatalogOption(plan.catalogId)!;
      if (opt.kind !== "activity" && opt.kind !== "dining") {
        throw new Error(`Plan item ${plan.catalogId} is not an activity/dining option`);
      }
    }
  }

  // Rebuild display fields from catalog (title/location/photo/mode) while keeping ids & times.
  const enrich = (item: TripItem): TripItem => {
    const opt = getCatalogOption(item.catalogId)!;
    return {
      ...item,
      kind: opt.kind,
      title: opt.title,
      location: opt.location,
      photo: opt.photo,
      mode: opt.mode ?? item.mode,
      durationMin: opt.durationMin ?? item.durationMin,
      notes: opt.notes,
    };
  };

  let trip: Trip = {
    ...raw,
    destination,
    destinationLabel: DESTINATIONS[destination].label,
    travel: enrich(raw.travel),
    hotel: enrich(raw.hotel),
    days: raw.days.map((d) => ({
      ...d,
      plans: d.plans.map(enrich),
    })),
    // Clear client-claimed payment / booking state before demo confirm.
    confirmations: undefined,
    paidAt: undefined,
    bookedAt: undefined,
    checkoutSessionId: undefined,
    graph: raw.graph ?? { rootId: raw.travel.id, nodes: {}, edges: [], travel: {} },
    facts: raw.facts,
    totalCostAED: 0,
    status: raw.status === "payment_failed" ? "payment_failed" : "proposed",
  };

  // Reject any leftover ids that aren't in catalog (already checked) and reprice.
  for (const item of eachBookableItem(trip)) {
    if (!getCatalogOption(item.catalogId)) {
      throw new Error(`Unknown catalog item "${item.catalogId}"`);
    }
  }

  trip = applyCatalogPrices(trip);
  trip = syncTripGraph(trip);
  trip = withFacts(trip);
  return trip;
}
