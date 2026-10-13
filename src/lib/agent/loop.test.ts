import { describe, expect, test } from "bun:test";
import { evaluate, topoOrder, applyDelay, fmt } from "./dag";
import { buildRakRoadTrip } from "./scenario";
import { runShockAbsorber } from "./loop";
import { createMockWorld, executeTool } from "./tools";

describe("DAG solver", () => {
  test("baseline plan has no violations and the documented buffers", () => {
    const ev = evaluate(buildRakRoadTrip());
    expect(ev.violations).toEqual([]);
    expect(fmt(ev.timings.jais.arriveAt)).toBe("17:15");
    expect(ev.timings.jais.slackMin).toBe(33);
    expect(ev.timings.dinner.slackMin).toBe(45);
    expect(ev.timings.dinner.softSlackMin).toBe(0);
  });

  test("+75 delay cascades into three conflicts", () => {
    const ev = evaluate(applyDelay(buildRakRoadTrip(), 75));
    expect(ev.violations.map((v) => v.constraintId)).toEqual(["jais-sunset", "dinner-hold", "dinner-settle-in"]);
    expect(ev.violations.map((v) => v.overByMin)).toEqual([42, 30, 30]);
  });

  test("cycles are rejected", () => {
    const g = buildRakRoadTrip();
    g.edges.push({ from: "dinner", to: "jais", travelMin: 1 });
    expect(() => topoOrder(g)).toThrow(/cycle/);
  });
});

describe("shock absorber loop", () => {
  test("on time: no tool calls", () => {
    const r = runShockAbsorber(buildRakRoadTrip(), 0);
    expect(r.toolResults).toEqual([]);
    expect(r.unresolved).toEqual([]);
  });

  test("+15 and +45 end with no unresolved conflicts", () => {
    for (const d of [15, 45]) {
      const r = runShockAbsorber(buildRakRoadTrip(), d);
      expect(r.unresolved).toEqual([]);
    }
  });

  test("+75: full cascade — resequence, dining, hotel, wallet", () => {
    const r = runShockAbsorber(buildRakRoadTrip(), 75);
    expect(r.unresolved).toEqual([]);
    expect(r.toolResults.map((t) => t.tool)).toEqual([
      "resequence_node",
      "modify_dining_reservation",
      "flag_hotel_late_arrival",
      "push_wallet_pass_sync",
    ]);
    expect(r.toolResults.every((t) => t.ok)).toBe(true);
    expect(r.toolResults[1].args).toEqual({ bookingRef: "SR-994182", newTime: "21:15" });
    expect(fmt(r.healed.timings.depart.startAt)).toBe("16:15");
    expect(fmt(r.healed.timings.hotel.arriveAt)).toBe("19:35");
    expect(fmt(r.healed.timings.dinner.startAt)).toBe("21:15");
    expect(fmt(r.healed.timings.jais.startAt)).toBe("Day 2 • 08:30");
    expect(r.healed.order).toEqual(["depart", "hotel", "dinner", "jais"]);
    expect(r.world.reservations["SR-994182"].time).toBe("21:15");
    expect(r.world.hotelBookings["IC-RAK-4089"].mobileKeyDispatched).toBe(true);
    expect(r.world.itineraryMoves.jais).toEqual({ day: 2, time: "08:30" });
  });

  test("does not mutate the input graph", () => {
    const g = buildRakRoadTrip();
    const snapshot = JSON.stringify(g);
    runShockAbsorber(g, 75);
    expect(JSON.stringify(g)).toBe(snapshot);
  });

  test("dining repair fires when the dinner conflict is independent (Jais not movable)", () => {
    const g = buildRakRoadTrip();
    g.nodes.jais.movableToNextDayAt = undefined; // cannot be moved
    g.nodes.jais.constraints = []; // not time-critical in this variant
    const r = runShockAbsorber(g, 75);
    const call = r.toolResults.find((t) => t.tool === "modify_dining_reservation");
    expect(call?.ok).toBe(true);
    expect(call?.args).toEqual({ bookingRef: "SR-994182", newTime: "21:15" });
    expect(r.world.reservations["SR-994182"].feeCents).toBe(0);
    expect(r.unresolved).toEqual([]);
  });

  test("late hotel arrival is flagged", () => {
    const g = buildRakRoadTrip();
    g.nodes.jais.movableToNextDayAt = undefined;
    g.nodes.jais.constraints = [];
    const r = runShockAbsorber(g, 75);
    expect(r.toolResults.map((t) => t.tool)).toContain("flag_hotel_late_arrival");
    expect(r.world.hotelBookings["IC-RAK-4089"].mobileKeyDispatched).toBe(true);
  });
});

describe("mock tools", () => {
  test("validate arguments and unknown ids", () => {
    const w = createMockWorld();
    expect(executeTool(w, "modify_dining_reservation", {}).status).toBe(400);
    expect(executeTool(w, "modify_dining_reservation", { bookingRef: "nope", newTime: "21:00" }).status).toBe(404);
    expect(executeTool(w, "modify_dining_reservation", { bookingRef: "SR-994182", newTime: "20:00" }).status).toBe(409);
    expect(executeTool(w, "push_wallet_pass_sync", { passIds: ["x"], reason: "r" }).status).toBe(404);
  });
});
