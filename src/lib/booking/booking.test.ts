import { describe, expect, test } from "bun:test";
import { buildProposedTrip, formatAed } from "./builder";
import { applyStopSwap, alternativesForStop } from "./swap";
import { parseTripIntent, defaultPrefs } from "./parse-intent";
import { bookProposedTrip, confirmationCodesFor, isBookedTrip } from "./book";
import { proposedTripToGraph } from "./graph";
import { evaluate, applyDelay } from "@/lib/agent/dag";

describe("itinerary builder", () => {
  test("builds a RAK long weekend with hotel, activities, dinner, and total", () => {
    const trip = buildProposedTrip(defaultPrefs({ destinationId: "rak", nights: 2, travellers: 2 }));
    expect(trip.nights).toBe(2);
    expect(trip.stops.some((s) => s.kind === "hotel")).toBe(true);
    expect(trip.stops.some((s) => s.kind === "dining")).toBe(true);
    expect(trip.stops.filter((s) => s.kind === "transfer")).toHaveLength(1);
    expect(trip.totalAed).toBeGreaterThan(0);
    expect(formatAed(trip.totalAed)).toMatch(/^AED /);
  });

  test("day trip has no hotel night charge", () => {
    const trip = buildProposedTrip(defaultPrefs({ nights: 0, travellers: 2 }));
    expect(trip.stops.every((s) => s.kind !== "hotel")).toBe(true);
    expect(trip.nights).toBe(0);
  });
});

describe("swaps", () => {
  test("offers hotel alternatives and re-times dinner after settle-in", () => {
    const trip = buildProposedTrip(defaultPrefs({ nights: 1 }));
    const hotel = trip.stops.find((s) => s.kind === "hotel")!;
    const alts = alternativesForStop(trip, hotel.id);
    expect(alts.length).toBeGreaterThan(0);
    const swapped = applyStopSwap(trip, hotel.id, alts[0]!.id);
    expect(swapped.stops.find((s) => s.id === hotel.id)?.catalogId).toBe(alts[0]!.id);
    const dinner = swapped.stops.find((s) => s.kind === "dining" && s.day === 1);
    const hotelStop = swapped.stops.find((s) => s.kind === "hotel")!;
    if (dinner) {
      const [hh, hm] = hotelStop.startAt.split(":").map(Number);
      const [dh, dm] = dinner.startAt.split(":").map(Number);
      expect((dh! * 60 + dm!) - (hh! * 60 + hm!)).toBeGreaterThanOrEqual(90);
    }
  });
});

describe("chat intent", () => {
  test("prefills a long weekend in Ras Al Khaimah for two", () => {
    const prefs = parseTripIntent("book a long weekend in Ras Al Khaimah for two");
    expect(prefs).toEqual({
      destinationId: "rak",
      nights: 2,
      travellers: 2,
      budgetBand: "comfort",
      note: "book a long weekend in Ras Al Khaimah for two",
    });
  });

  test("reads Hatta and budget cues", () => {
    const prefs = parseTripIntent("plan a cheap weekend in Hatta for 3");
    expect(prefs?.destinationId).toBe("hatta");
    expect(prefs?.travellers).toBe(3);
    expect(prefs?.budgetBand).toBe("smart");
    expect(prefs?.nights).toBe(2);
  });
});

describe("booking + graph", () => {
  test("books with confirmation codes and wallet passes", () => {
    const trip = buildProposedTrip(defaultPrefs({ nights: 1 }));
    const booked = bookProposedTrip(trip, "demo", { seed: "test", now: "2026-10-21T12:00:00.000Z" });
    expect(isBookedTrip(booked)).toBe(true);
    expect(Object.keys(booked.confirmationCodes).length).toBeGreaterThan(0);
    expect(booked.walletPasses.length).toBeGreaterThan(0);
    expect(confirmationCodesFor(trip, "test")).toEqual(booked.confirmationCodes);
  });

  test("proposed trip converts to a solvable TripGraph", () => {
    const trip = buildProposedTrip(defaultPrefs({ nights: 1 }));
    const graph = proposedTripToGraph(trip);
    const baseline = evaluate(graph);
    expect(baseline.timings.depart).toBeDefined();
    expect(baseline.order.length).toBeGreaterThan(1);
    const delayed = evaluate(applyDelay(graph, 75));
    expect(delayed.timings.depart.startAt).toBeGreaterThan(baseline.timings.depart.startAt);
  });
});
