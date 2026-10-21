import { getCatalogItem, itemsFor } from "./catalog";
import { buildProposedTrip } from "./builder";
import type { CatalogItem, ProposedStop, ProposedTrip } from "./types";

/** Up to three alternatives for a stop (same kind, same destination), excluding current. */
export function alternativesForStop(trip: ProposedTrip, stopId: string): CatalogItem[] {
  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop || stop.kind === "transfer") return [];
  const kind = stop.kind === "scenic" || stop.kind === "activity" ? undefined : stop.kind;
  const pool =
    kind === "hotel" || kind === "dining"
      ? itemsFor(trip.destinationId, kind)
      : [
          ...itemsFor(trip.destinationId, "scenic"),
          ...itemsFor(trip.destinationId, "activity"),
        ];
  return pool.filter((item) => item.id !== stop.catalogId).slice(0, 3);
}

/**
 * Swap a stop for a catalog alternative and lightly re-time neighbours
 * (hotel settle-in / dinner hold style), then recompute the total.
 */
export function applyStopSwap(trip: ProposedTrip, stopId: string, catalogId: string): ProposedTrip {
  const nextItem = getCatalogItem(catalogId);
  if (!nextItem) return trip;
  const stops = trip.stops.map((stop) => {
    if (stop.id !== stopId) return stop;
    const priceAed = priceForSwap(trip, stop, nextItem);
    return {
      ...stop,
      catalogId: nextItem.id,
      kind: nextItem.kind === "scenic" || nextItem.kind === "activity" ? nextItem.kind : stop.kind,
      title: nextItem.title,
      place: nextItem.place,
      photo: nextItem.photo,
      priceAed,
      durationMin: nextItem.durationMin,
      note: nextItem.blurb,
    } satisfies ProposedStop;
  });

  // Re-check: dinner after hotel needs ~90m settle-in when both on same day.
  const hotel = stops.find((s) => s.kind === "hotel");
  const dinner = stops.find((s) => s.kind === "dining" && s.day === hotel?.day);
  if (hotel && dinner) {
    const hotelMin = parseHmm(hotel.startAt);
    const dinnerMin = parseHmm(dinner.startAt);
    const earliestDinner = hotelMin + 90;
    if (dinnerMin < earliestDinner) {
      dinner.startAt = formatHmm(earliestDinner);
      dinner.note = `${dinner.note ?? ""} · moved for hotel settle-in`.trim();
    }
  }

  const totalAed = stops.reduce((sum, s) => sum + s.priceAed, 0);
  return { ...trip, stops, totalAed };
}

function priceForSwap(trip: ProposedTrip, stop: ProposedStop, item: CatalogItem): number {
  if (item.kind === "hotel") return item.priceAed * Math.max(1, trip.nights);
  if (item.kind === "dining") return item.priceAed * Math.ceil(trip.prefs.travellers / 2);
  return item.priceAed * trip.prefs.travellers;
}

function parseHmm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatHmm(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Rebuild from prefs then re-apply catalog ids so a full reshape stays coherent. */
export function rebuildKeepingSwaps(trip: ProposedTrip): ProposedTrip {
  const fresh = buildProposedTrip(trip.prefs);
  let merged = fresh;
  for (const stop of trip.stops) {
    const counterpart = fresh.stops.find((s) => s.id === stop.id);
    if (counterpart && counterpart.catalogId !== stop.catalogId && stop.kind !== "transfer") {
      merged = applyStopSwap(merged, stop.id, stop.catalogId);
    }
  }
  return merged;
}
