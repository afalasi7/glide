import { DESTINATIONS, getCatalogOption, resolveDestination } from "@/lib/planning/catalog";
import { withFacts } from "@/lib/planning/facts";
import { syncTripGraph } from "@/lib/planning/graph";
import { applyCatalogPrices } from "@/lib/planning/pricing";
import type { DestinationId, Trip, TripDay, TripItem } from "@/lib/planning/types";

/**
 * Compact trip selection for Stripe Checkout Session metadata.
 * Each metadata value must stay ≤ 500 characters (Stripe limit).
 */
export type CompactTripSelection = {
  v: 1;
  dest: DestinationId;
  start: string;
  end: string;
  travellers: number;
  kids?: number;
  budgetAED: number;
  travel: string;
  /** Outbound travel start HHMM */
  travelAt?: string;
  hotel: string;
  hotelAt?: string;
  /** `catalogId:day:HHMM` for return leg, optional */
  ret?: string;
  retAt?: string;
  /** `catalogId:day:HHMM` joined by `|` */
  plans: string;
  tripId: string;
};

const META_MAX = 500;

function hmToCompact(hm: string): string {
  const [h, m] = hm.split(":");
  return `${h.padStart(2, "0")}${m.padStart(2, "0")}`;
}

function compactToHm(hhmm: string): string {
  if (hhmm.length !== 4 || !/^\d{4}$/.test(hhmm)) throw new Error(`Bad time ${hhmm}`);
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
}

function toItem(
  catalogId: string,
  id: string,
  day: number,
  startTime: string,
  bookingRef?: string,
): TripItem {
  const opt = getCatalogOption(catalogId);
  if (!opt) throw new Error(`Unknown catalogId ${catalogId}`);
  const end = opt.durationMin
    ? (() => {
        const [h, m] = startTime.split(":").map(Number);
        const total = h * 60 + m + opt.durationMin;
        return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })()
    : undefined;
  return {
    id,
    catalogId,
    kind: opt.kind,
    title: opt.title,
    location: opt.location,
    day,
    startTime,
    endTime: end,
    costAED: opt.costAED,
    photo: opt.photo,
    bookingRef,
    mode: opt.mode,
    durationMin: opt.durationMin,
    notes: opt.notes,
  };
}

function refFor(kind: string, tripId: string): string | undefined {
  if (kind === "hotel") return `HTL-${tripId.slice(-6).toUpperCase()}`;
  if (kind === "dining") return `DIN-${tripId.slice(-6).toUpperCase()}`;
  if (kind === "travel") return undefined;
  return undefined;
}

/** Encode a priced trip into a compact selection (catalog ids + times only). */
export function selectionFromTrip(trip: Trip): CompactTripSelection {
  const plans = trip.days
    .flatMap((d) =>
      d.plans.map((p) => `${p.catalogId}:${p.day}:${hmToCompact(p.startTime)}`),
    )
    .join("|");
  if (plans.length > META_MAX) {
    throw new Error(`plans metadata exceeds ${META_MAX} characters`);
  }
  return {
    v: 1,
    dest: trip.destination,
    start: trip.startDate,
    end: trip.endDate,
    travellers: trip.travellers,
    kids: trip.kids,
    budgetAED: trip.budgetAED,
    travel: trip.travel.catalogId,
    travelAt: hmToCompact(trip.travel.startTime),
    hotel: trip.hotel.catalogId,
    hotelAt: hmToCompact(trip.hotel.startTime),
    ret: trip.returnTravel?.catalogId,
    retAt: trip.returnTravel ? hmToCompact(trip.returnTravel.startTime) : undefined,
    plans,
    tripId: trip.id,
  };
}

/** Rebuild a full Trip from compact selection + curated catalog (server price source). */
export function tripFromSelection(sel: CompactTripSelection): Trip {
  if (sel.v !== 1) throw new Error("Unsupported selection version");
  const destination = resolveDestination(sel.dest);
  if (!DESTINATIONS[destination]) throw new Error("Unknown destination");
  if (!getCatalogOption(sel.travel)) throw new Error(`Unknown travel ${sel.travel}`);
  if (!getCatalogOption(sel.hotel)) throw new Error(`Unknown hotel ${sel.hotel}`);

  const tripId = sel.tripId || `trip_${destination.slice(0, 3)}_meta`;
  const travelOpt = getCatalogOption(sel.travel)!;
  const hotelOpt = getCatalogOption(sel.hotel)!;

  const travelStart = sel.travelAt ? compactToHm(sel.travelAt) : travelOpt.defaultStartTime ?? "09:00";
  const travel = toItem(
    sel.travel,
    `${tripId}_travel`,
    1,
    travelStart,
    travelOpt.mode === "flight" ? `FLT-${tripId.slice(-6).toUpperCase()}` : undefined,
  );
  const hotelStart = sel.hotelAt ? compactToHm(sel.hotelAt) : hotelOpt.defaultStartTime ?? "15:00";
  const hotel = toItem(
    sel.hotel,
    `${tripId}_hotel`,
    1,
    hotelStart,
    refFor("hotel", tripId),
  );
  const lastDay = Math.max(
    1,
    ...((sel.plans ? sel.plans.split("|").filter(Boolean) : []).map((p) => Number(p.split(":")[1])) || [1]),
  );
  const returnTravel =
    sel.ret && sel.retAt
      ? toItem(sel.ret, `${tripId}_return`, lastDay, compactToHm(sel.retAt), undefined)
      : undefined;

  const byDay = new Map<number, TripItem[]>();
  const parts = sel.plans ? sel.plans.split("|").filter(Boolean) : [];
  if (!parts.length) throw new Error("selection.plans is empty");
  let pi = 0;
  for (const part of parts) {
    const [catalogId, dayStr, hhmm] = part.split(":");
    if (!catalogId || !dayStr || !hhmm) throw new Error(`Bad plan token ${part}`);
    const day = Number(dayStr);
    if (!Number.isInteger(day) || day < 1) throw new Error(`Bad plan day in ${part}`);
    const opt = getCatalogOption(catalogId);
    if (!opt) throw new Error(`Unknown plan ${catalogId}`);
    if (opt.kind !== "activity" && opt.kind !== "dining") {
      throw new Error(`Plan ${catalogId} is not activity/dining`);
    }
    const startTime = compactToHm(hhmm);
    const item = toItem(
      catalogId,
      `${tripId}_d${day}_p${pi++}`,
      day,
      startTime,
      refFor(opt.kind, tripId),
    );
    const list = byDay.get(day) ?? [];
    list.push(item);
    byDay.set(day, list);
  }

  const days: TripDay[] = [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, plans]) => ({
      day,
      date: addDays(sel.start, day - 1),
      plans,
    }));

  let trip: Trip = {
    id: tripId,
    destination,
    destinationLabel: DESTINATIONS[destination].label,
    startDate: sel.start,
    endDate: sel.end,
    travellers: sel.travellers,
    kids: sel.kids,
    budgetAED: sel.budgetAED,
    travel,
    returnTravel,
    hotel,
    days,
    totalCostAED: 0,
    facts: { withinBudget: true, totalAED: 0, overBudgetByAED: 0 },
    status: "proposed",
    graph: { rootId: travel.id, nodes: {}, edges: [], travel: {} },
    createdAt: new Date().toISOString(),
  };

  trip = applyCatalogPrices(trip);
  trip = syncTripGraph(trip);
  trip = withFacts(trip);
  return trip;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Flatten selection into Stripe metadata string map (all values ≤ 500 chars). */
export function selectionToMetadata(sel: CompactTripSelection): Record<string, string> {
  const meta: Record<string, string> = {
    v: "1",
    dest: sel.dest,
    start: sel.start,
    end: sel.end,
    travellers: String(sel.travellers),
    budgetAED: String(sel.budgetAED),
    travel: sel.travel,
    hotel: sel.hotel,
    plans: sel.plans,
    tripId: sel.tripId,
  };
  if (sel.kids !== undefined) meta.kids = String(sel.kids);
  if (sel.travelAt) meta.travelAt = sel.travelAt;
  if (sel.hotelAt) meta.hotelAt = sel.hotelAt;
  if (sel.ret) meta.ret = sel.ret;
  if (sel.retAt) meta.retAt = sel.retAt;
  for (const [k, v] of Object.entries(meta)) {
    if (v.length > META_MAX) throw new Error(`metadata.${k} exceeds ${META_MAX} characters`);
  }
  if (Object.keys(meta).length > 50) throw new Error("Too many metadata keys");
  return meta;
}

/** Parse Stripe session metadata into a compact selection. */
export function selectionFromMetadata(
  meta: Record<string, string> | null | undefined,
): CompactTripSelection {
  if (!meta || meta.v !== "1") throw new Error("Missing or unsupported selection metadata");
  const dest = resolveDestination(meta.dest);
  const travellers = Number(meta.travellers);
  const budgetAED = Number(meta.budgetAED);
  if (!meta.start || !meta.end || !meta.travel || !meta.hotel || !meta.plans || !meta.tripId) {
    throw new Error("Incomplete selection metadata");
  }
  if (!Number.isInteger(travellers) || travellers < 1) throw new Error("Bad travellers metadata");
  if (!Number.isFinite(budgetAED) || budgetAED <= 0) throw new Error("Bad budgetAED metadata");
  return {
    v: 1,
    dest,
    start: meta.start,
    end: meta.end,
    travellers,
    kids: meta.kids !== undefined ? Number(meta.kids) : undefined,
    budgetAED,
    travel: meta.travel,
    travelAt: meta.travelAt,
    hotel: meta.hotel,
    hotelAt: meta.hotelAt,
    ret: meta.ret,
    retAt: meta.retAt,
    plans: meta.plans,
    tripId: meta.tripId,
  };
}
