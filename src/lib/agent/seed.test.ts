import { describe, expect, test } from "bun:test";
import { evaluate } from "./dag";
import { buildRakRoadTrip, SCENARIO_IDS, scenarioHotelBookedArrive } from "./scenario";
import { createMockWorld } from "./tools";
import { INITIAL_STOPS } from "../types";

describe("seed database consistency", () => {
  test("MockWorld hotel ETA matches scenario bookedArriveAt", () => {
    const world = createMockWorld();
    expect(scenarioHotelBookedArrive()).toBe("18:30");
    expect(world.hotelBookings[SCENARIO_IDS.hotelBooking].etaTime).toBe("18:30");
  });

  test("MockWorld booking and pass keys match scenario refs", () => {
    const world = createMockWorld();
    const g = buildRakRoadTrip();
    expect(g.nodes.hotel.bookingRef).toBe(SCENARIO_IDS.hotelBooking);
    expect(g.nodes.dinner.bookingRef).toBe(SCENARIO_IDS.dinnerBooking);
    expect(world.reservations[SCENARIO_IDS.dinnerBooking]).toBeDefined();
    expect(world.hotelBookings[SCENARIO_IDS.hotelBooking]).toBeDefined();
    expect(world.walletPasses[SCENARIO_IDS.hotelPass]).toBeDefined();
    expect(world.walletPasses[SCENARIO_IDS.dinnerPass]).toBeDefined();
  });

  test("INITIAL_STOPS times, dwell, drive, and refs match the solver graph", () => {
    const g = buildRakRoadTrip();
    const ev = evaluate(g);
    const jais = INITIAL_STOPS.find((s) => s.id === "stop-2")!;
    const hotel = INITIAL_STOPS.find((s) => s.id === "stop-3")!;
    const dinner = INITIAL_STOPS.find((s) => s.id === "stop-4")!;

    expect(jais.durationMin).toBe(g.nodes.jais.dwellMin);
    expect(hotel.durationMin).toBe(g.nodes.hotel.dwellMin);
    expect(hotel.originalTime).toBe(scenarioHotelBookedArrive());
    expect(hotel.currentTime).toBe("18:30");
    expect(hotel.driveTimeFromPrevMin).toBe(
      g.edges.find((e) => e.from === "jais" && e.to === "hotel")!.travelMin,
    );
    expect(hotel.constraint.referenceCode).toBe(SCENARIO_IDS.hotelBooking);
    expect(hotel.passDetails?.code).toBe(SCENARIO_IDS.hotelBooking);
    expect(dinner.constraint.referenceCode).toBe(SCENARIO_IDS.dinnerBooking);
    expect(dinner.passDetails?.code).toBe(SCENARIO_IDS.dinnerBooking);

    // Sanity: seed hotel clock equals evaluated baseline arrival.
    const hhmm = (t: number) => {
      const m = ((t % 1440) + 1440) % 1440;
      return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    };
    expect(hotel.originalTime).toBe(hhmm(ev.timings.hotel.arriveAt));
  });

  test("no stale 18:45 hotel seed remains", () => {
    const world = createMockWorld();
    expect(world.hotelBookings[SCENARIO_IDS.hotelBooking].etaTime).not.toBe("18:45");
    expect(INITIAL_STOPS.some((s) => s.originalTime === "18:45")).toBe(false);
    expect(INITIAL_STOPS.some((s) => s.passDetails?.code === "IC-4089-RES")).toBe(false);
  });
});
