import { at, type TripGraph, type TripNode, type Constraint } from "@/lib/agent";
import { DESTINATIONS, getCatalogOption } from "./catalog";
import { openWindows } from "./hours";
import type { Trip, TripItem } from "./types";
import { timeToMinutes } from "./pricing";

function itemStartMinutes(item: TripItem): number {
  const { day } = item;
  const [h, m] = item.startTime.split(":").map(Number);
  return at(h, m, day);
}

function kindFor(item: TripItem): TripNode["kind"] {
  if (item.kind === "travel") return "departure";
  if (item.kind === "hotel") return "hotel";
  if (item.kind === "dining") return "dining";
  return "scenic";
}

/**
 * Kitchen last-seat = venue close on the window that covers the booking,
 * falling back to 21:30 (championship demo hold).
 */
function lastSeatMinutes(item: TripItem): number {
  const opt = getCatalogOption(item.catalogId);
  const windows = openWindows(opt?.openHours);
  const start = timeToMinutes(item.startTime);
  for (const w of windows) {
    const open = timeToMinutes(w.open);
    const close = timeToMinutes(w.close);
    if (start >= open && start < close) {
      return at(Math.floor(close / 60), close % 60, item.day);
    }
  }
  if (windows.length === 1) {
    const close = timeToMinutes(windows[0]!.close);
    return at(Math.floor(close / 60), close % 60, item.day);
  }
  return at(21, 30, item.day);
}

/** Sunset / highlight hard deadline from the destination catalog when present. */
function highlightDeadline(trip: Trip, item: TripItem): number | undefined {
  const spec = DESTINATIONS[trip.destination]?.highlight;
  if (!spec || spec.catalogId !== item.catalogId || !spec.cutoffTime) return undefined;
  const [h, m] = spec.cutoffTime.split(":").map(Number);
  return at(h, m, item.day);
}

/**
 * Build a TripGraph from the presentation trip so evaluate() / reshape tools apply.
 * Chronological order within each day (travel + hotel interleaved with plans by startTime).
 *
 * Travel duration lives on the *edge* after the departure node — never also as dwellMin —
 * otherwise drive time is double-counted and dinner holds fire on a healthy plan.
 */
export function buildGraphFromTrip(trip: Trip): TripGraph {
  const nodes: Record<string, TripNode> = {};
  const edges: TripGraph["edges"] = [];
  const travelMap: TripGraph["travel"] = {};

  const hotelId = trip.hotel.id;

  const all: TripItem[] = [
    trip.travel,
    trip.hotel,
    ...trip.days.flatMap((d) => d.plans),
    ...(trip.returnTravel ? [trip.returnTravel] : []),
  ];

  for (const item of all) {
    const constraints: Constraint[] = [];
    if (item.kind === "dining" && item.bookingRef) {
      const start = itemStartMinutes(item);
      constraints.push({
        id: `${item.id}-hold`,
        kind: "reservation_hold",
        reservedAt: start,
        holdMin: 15,
        lastSeatAt: lastSeatMinutes(item),
        bookingRef: item.bookingRef,
        label: "table hold",
      });
      if (item.day === 1) {
        constraints.push({
          id: `${item.id}-settle`,
          kind: "min_gap_after",
          afterNodeId: hotelId,
          gapMin: 90,
          label: "hotel settle-in / unpack buffer",
        });
      }
    }
    const deadline =
      highlightDeadline(trip, item) ??
      (item.catalogId === "rak-jais-deck" ? at(17, 48, item.day) : undefined);
    if (deadline !== undefined) {
      constraints.push({
        id: `${item.id}-sunset`,
        kind: "arrive_before",
        deadline,
        label: "sunset cutoff",
      });
    }

    // Travel: dwell at the origin is 0; drive/flight length is the outgoing edge.
    const dwellMin =
      item.kind === "travel" ? 0 : (item.durationMin ?? 60);

    nodes[item.id] = {
      id: item.id,
      label: item.title,
      kind: kindFor(item),
      dwellMin,
      earliestStart: itemStartMinutes(item),
      bookingRef: item.bookingRef,
      constraints,
      ...(item.kind === "hotel" ? { bookedArriveAt: itemStartMinutes(item) } : {}),
      ...(item.catalogId.includes("jais") ? { movableToNextDayAt: 8 * 60 + 30 } : {}),
    };
  }

  // Sort by absolute start so Day 1 can be travel → Jais → hotel → dinner.
  const ordered = [...all].sort((a, b) => {
    const da = (a.day - 1) * 1440 + timeToMinutes(a.startTime);
    const db = (b.day - 1) * 1440 + timeToMinutes(b.startTime);
    return da - db;
  });

  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const hop =
      from.kind === "travel"
        ? from.durationMin ?? 120
        : from.day === to.day
          ? 20
          : 55;
    edges.push({ from: from.id, to: to.id, travelMin: hop });
    travelMap[`${from.id}>${to.id}`] = {
      travelMin: hop,
      ...(from.kind === "travel" && from.mode === "drive"
        ? { peak: { fromMinuteOfDay: 16 * 60, toMinuteOfDay: 19 * 60, extraMin: 60 } }
        : {}),
    };
  }

  for (const a of Object.keys(nodes)) {
    for (const b of Object.keys(nodes)) {
      if (a === b) continue;
      const key = `${a}>${b}`;
      if (!travelMap[key]) travelMap[key] = { travelMin: 45 };
    }
  }

  return { rootId: trip.travel.id, nodes, edges, travel: travelMap };
}

export function syncTripGraph(trip: Trip): Trip {
  return { ...trip, graph: buildGraphFromTrip(trip) };
}
