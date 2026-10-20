import { describe, expect, test } from "bun:test";
import { findSunsetViolation, findToolResult } from "@/components/story/data";
import type { ToolResult, Violation } from "@/lib/agent";
import { createMockWorld, scenarioHotelBookedArrive } from "@/lib/agent";

describe("story data helpers", () => {
  test("findToolResult returns undefined when a solver tool is missing", () => {
    const results: ToolResult[] = [
      {
        tool: "modify_dining_reservation",
        args: {},
        status: 200,
        ok: true,
        latencyMs: 100,
      },
    ];
    expect(findToolResult(results, "resequence_node")).toBeUndefined();
    expect(findToolResult(results, "modify_dining_reservation")?.latencyMs).toBe(100);
  });

  test("findSunsetViolation matches by constraint id, not by index", () => {
    const violations: Violation[] = [
      {
        nodeId: "dinner",
        constraintId: "dinner-hold",
        kind: "reservation_hold",
        overByMin: 30,
        message: "hold",
      },
      {
        nodeId: "jais",
        constraintId: "jais-sunset",
        kind: "arrive_before",
        overByMin: 42,
        message: "sunset",
      },
    ];
    expect(findSunsetViolation(violations)?.constraintId).toBe("jais-sunset");
    expect(findSunsetViolation(violations)?.overByMin).toBe(42);
    expect(findSunsetViolation([])).toBeUndefined();
  });

  test("findSunsetViolation falls back to arrive_before when id is absent", () => {
    const violations: Violation[] = [
      {
        nodeId: "jais",
        constraintId: "other-deadline",
        kind: "arrive_before",
        overByMin: 12,
        message: "deadline",
      },
    ];
    expect(findSunsetViolation(violations)?.overByMin).toBe(12);
  });
});

describe("scenario hotel arrival", () => {
  test("mock world ETA matches scenario bookedArriveAt (18:30)", () => {
    expect(scenarioHotelBookedArrive()).toBe("18:30");
    expect(createMockWorld().hotelBookings["IC-RAK-4089"].etaTime).toBe("18:30");
  });
});
