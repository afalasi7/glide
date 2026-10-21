import { at, type TripGraph } from "@/lib/agent/dag";
import type { ProposedTrip } from "./types";

function parseHmm(value: string): { h: number; m: number } {
  const [h, m] = value.split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

/**
 * Map a proposed/booked trip into a TripGraph so the existing reshape solver
 * can evaluate delays on newly booked itineraries.
 */
export function proposedTripToGraph(trip: ProposedTrip): TripGraph {
  const depart = trip.stops.find((s) => s.kind === "transfer") ?? trip.stops[0]!;
  const hotel = trip.stops.find((s) => s.kind === "hotel");
  const scenic = trip.stops.find((s) => s.kind === "scenic" || s.kind === "activity");
  const dinner = trip.stops.find((s) => s.kind === "dining");

  const departT = parseHmm(depart.startAt);
  const nodes: TripGraph["nodes"] = {
    depart: {
      id: "depart",
      label: depart.title,
      kind: "departure",
      dwellMin: 0,
      earliestStart: at(departT.h, departT.m, depart.day),
      constraints: [],
    },
  };
  const edges: TripGraph["edges"] = [];
  let prev = "depart";

  if (scenic) {
    const t = parseHmm(scenic.startAt);
    nodes.jais = {
      id: "jais",
      label: scenic.title,
      kind: "scenic",
      dwellMin: scenic.durationMin,
      movableToNextDayAt: 8 * 60 + 30,
      constraints: [
        {
          id: "jais-sunset",
          kind: "arrive_before",
          deadline: at(17, 48, scenic.day),
          label: "sunset cutoff",
        },
      ],
      earliestStart: at(t.h, t.m, scenic.day),
    };
    edges.push({ from: prev, to: "jais", travelMin: Math.max(30, scenic.day === depart.day ? 90 : 55) });
    prev = "jais";
  }

  if (hotel) {
    const t = parseHmm(hotel.startAt);
    nodes.hotel = {
      id: "hotel",
      label: hotel.title,
      kind: "hotel",
      dwellMin: hotel.durationMin,
      bookedArriveAt: at(t.h, t.m, hotel.day),
      bookingRef: hotel.bookingRef ?? "HTL-DEMO",
      constraints: [],
    };
    edges.push({ from: prev, to: "hotel", travelMin: 30 });
    prev = "hotel";
  }

  if (dinner) {
    const t = parseHmm(dinner.startAt);
    nodes.dinner = {
      id: "dinner",
      label: dinner.title,
      kind: "dining",
      dwellMin: dinner.durationMin,
      earliestStart: at(t.h, t.m, dinner.day),
      bookingRef: dinner.bookingRef ?? "DIN-DEMO",
      constraints: [
        {
          id: "dinner-hold",
          kind: "reservation_hold",
          reservedAt: at(t.h, t.m, dinner.day),
          holdMin: 15,
          lastSeatAt: at(t.h + 1, t.m + 30, dinner.day),
          bookingRef: dinner.bookingRef ?? "DIN-DEMO",
          label: "table hold",
        },
        ...(hotel
          ? [
              {
                id: "dinner-settle-in" as const,
                kind: "min_gap_after" as const,
                afterNodeId: "hotel",
                gapMin: 90,
                label: "hotel settle-in / unpack buffer",
              },
            ]
          : []),
      ],
    };
    edges.push({ from: prev, to: "dinner", travelMin: 15 });
  }

  return {
    rootId: "depart",
    nodes,
    edges,
    travel: {
      "depart>hotel": {
        travelMin: 140,
        peak: { fromMinuteOfDay: 16 * 60, toMinuteOfDay: 19 * 60, extraMin: 60 },
      },
      "hotel>jais": { travelMin: 55 },
      "dinner>jais": { travelMin: 55 },
    },
  };
}
