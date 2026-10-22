import { at, fmt, type TripGraph } from "./dag";

/** The Dubai Marina → Ras Al Khaimah road trip from PRODUCT.md. */
export function buildRakRoadTrip(): TripGraph {
  return {
    rootId: "depart",
    nodes: {
      depart: {
        id: "depart",
        label: "Depart Dubai Marina",
        kind: "departure",
        dwellMin: 0,
        earliestStart: at(15),
        constraints: [],
      },
      jais: {
        id: "jais",
        label: "Jebel Jais Viewing Deck",
        kind: "scenic",
        dwellMin: 45,
        movableToNextDayAt: 8 * 60 + 30,
        constraints: [
          {
            id: "jais-sunset",
            kind: "arrive_before",
            deadline: at(17, 48),
            label: "sunset cutoff",
          },
        ],
      },
      hotel: {
        id: "hotel",
        label: "InterContinental RAK",
        kind: "hotel",
        dwellMin: 45,
        bookedArriveAt: at(18, 30),
        bookingRef: "IC-RAK-4089",
        constraints: [],
      },
      dinner: {
        id: "dinner",
        label: "Levant & Nar (Dinner)",
        kind: "dining",
        dwellMin: 90,
        earliestStart: at(20),
        bookingRef: "SR-994182",
        constraints: [
          {
            id: "dinner-hold",
            kind: "reservation_hold",
            reservedAt: at(20),
            holdMin: 15,
            lastSeatAt: at(21, 30),
            bookingRef: "SR-994182",
            label: "table hold",
          },
          {
            id: "dinner-settle-in",
            kind: "min_gap_after",
            afterNodeId: "hotel",
            gapMin: 90,
            label: "hotel settle-in / unpack buffer",
          },
        ],
      },
    },
    edges: [
      { from: "depart", to: "jais", travelMin: 135 },
      { from: "jais", to: "hotel", travelMin: 30 },
      { from: "hotel", to: "dinner", travelMin: 15 },
    ],
    travel: {
      // Direct drive. Leaving 16:00–19:00 hits Friday-evening E311 congestion.
      "depart>hotel": {
        travelMin: 140,
        peak: { fromMinuteOfDay: 16 * 60, toMinuteOfDay: 19 * 60, extraMin: 60 },
      },
      "hotel>jais": { travelMin: 55 },
      "dinner>jais": { travelMin: 55 },
    },
  };
}

/** Booked hotel arrival (HH:MM) from the scenario graph — single source for mock screens and tools. */
export function scenarioHotelBookedArrive(): string {
  const booked = buildRakRoadTrip().nodes.hotel.bookedArriveAt;
  return booked !== undefined ? fmt(booked) : "18:30";
}
