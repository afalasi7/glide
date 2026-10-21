import { describe, expect, test, beforeEach } from "bun:test";
import { evaluate } from "@/lib/agent";
import {
  applySwap,
  assertScheduleInvariants,
  bookTrip,
  BUDGET_PRESETS_AED,
  demoConfirmBookingFromTrip,
  DEFAULT_BUDGET_AED,
  lateItemFlags,
  nextFridayIso,
  PAYMENT_TRUST_LINE,
  planTrip,
  resetTripStore,
  swapOptions,
  timeToMinutes,
  validateAndRepriceTrip,
  withPlanDefaults,
} from "./index";

beforeEach(() => {
  resetTripStore();
});

describe("PAYMENT_TRUST_LINE", () => {
  test("exact product copy", () => {
    expect(PAYMENT_TRUST_LINE).toBe(
      "Payments are encrypted and handled by Stripe. Glide never sees or stores your card.",
    );
    expect(PAYMENT_TRUST_LINE.toLowerCase()).not.toContain("never saved");
  });
});

describe("planTrip defaults", () => {
  test("Fri–Sun long weekend, RAK, 2 adults, AED 3000", () => {
    const d = withPlanDefaults({});
    expect(d.destination).toBe("ras-al-khaimah");
    expect(d.travellers).toBe(2);
    expect(d.budgetAED).toBe(DEFAULT_BUDGET_AED);
    expect(BUDGET_PRESETS_AED).toEqual([1500, 3000, 6000]);

    const fri = nextFridayIso(new Date("2026-10-21T12:00:00Z"));
    expect(fri).toBe("2026-10-23");
    const trip = planTrip({ startDate: "2026-10-23" });
    expect(trip.startDate).toBe("2026-10-23");
    expect(trip.endDate).toBe("2026-10-25");
    expect(trip.destination).toBe("ras-al-khaimah");
    expect(trip.travellers).toBe(2);
    expect(trip.budgetAED).toBe(3000);
  });

  test("dates remain configurable", () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-11-06",
      endDate: "2026-11-07",
      travellers: 3,
      budgetAED: 1500,
    });
    expect(trip.startDate).toBe("2026-11-06");
    expect(trip.endDate).toBe("2026-11-07");
    expect(trip.destination).toBe("hatta");
    expect(trip.travellers).toBe(3);
  });
});

describe("highlights", () => {
  test("RAK: Jebel Jais sunset item + copy on a full day", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      travellers: 2,
      budgetAED: 3000,
    });
    const highlightDay = trip.days.find((d) =>
      d.plans.some((p) => p.catalogId === "rak-jais-deck"),
    );
    expect(highlightDay).toBeDefined();
    // Full middle day for Fri–Sun (not arrival Friday).
    expect(highlightDay!.day).toBe(2);
    expect(trip.facts.highlight).toBeDefined();
    expect(trip.facts.highlight!.catalogId).toBe("rak-jais-deck");
    expect(trip.facts.highlight!.itemId).toBeTruthy();
    expect(trip.facts.highlight!.copy).toBe("Jebel Jais is timed for sunset.");
    expect(trip.facts.highlight!.cutoffTime).toBe("17:48");
    expect(evaluate(trip.graph).order.length).toBeGreaterThan(2);
  });

  test("Muscat: Mutrah Corniche evening copy", () => {
    const trip = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
    });
    expect(trip.days.some((d) => d.plans.some((p) => p.catalogId === "mct-mutrah"))).toBe(true);
    expect(trip.facts.highlight!.copy).toBe(
      "Your evening at Mutrah Corniche is set for the cooler hours.",
    );
  });

  test("Hatta: morning dam kayaking copy", () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(trip.days.some((d) => d.plans.some((p) => p.catalogId === "hatta-kayak"))).toBe(true);
    expect(trip.facts.highlight!.catalogId).toBe("hatta-kayak");
    expect(trip.facts.highlight!.copy).toBe(
      "The dam kayaking is booked for the calm morning water.",
    );
  });

  test("swap that removes the highlight drops the copy", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const jais = trip.days
      .flatMap((d) => d.plans)
      .find((p) => p.catalogId === "rak-jais-deck")!;
    expect(trip.facts.highlight?.copy).toBe("Jebel Jais is timed for sunset.");
    const opts = swapOptions(trip, jais.id);
    const alt = opts.find((o) => o.catalogId !== "rak-jais-deck");
    expect(alt).toBeDefined();
    const swapped = applySwap(trip, jais.id, alt!.id);
    expect(swapped.trip.facts.highlight).toBeUndefined();
  });
});

describe("schedule invariants", () => {
  const destinations = ["ras-al-khaimah", "muscat", "hatta"] as const;

  for (const destination of destinations) {
    test(`${destination}: day-1 after arrival, unique venues, time order`, () => {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: destination === "muscat" ? 6000 : 3000,
      });
      assertScheduleInvariants(trip);

      const arrival =
        timeToMinutes(trip.travel.startTime) + (trip.travel.durationMin ?? 0);
      for (const p of trip.days[0].plans) {
        expect(timeToMinutes(p.startTime)).toBeGreaterThanOrEqual(arrival);
      }

      const ids = trip.days.flatMap((d) => d.plans.map((p) => p.catalogId));
      expect(new Set(ids).size).toBe(ids.length);

      for (const day of trip.days) {
        for (let i = 1; i < day.plans.length; i++) {
          expect(day.plans[i].startTime >= day.plans[i - 1].startTime).toBe(true);
        }
      }
    });
  }

  test("swaps keep arrival bounds and unique venues", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const dinner = trip.days.flatMap((d) => d.plans).find((p) => p.kind === "dining");
    expect(dinner).toBeDefined();
    const opts = swapOptions(trip, dinner!.id);
    expect(opts.length).toBeGreaterThanOrEqual(1);
    const result = applySwap(trip, dinner!.id, opts[0].id);
    assertScheduleInvariants(result.trip);
  });
});

describe("swapOptions / applySwap", () => {
  test("returns 2–3 alternatives and reports timingsHold + lateItems", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const opts = swapOptions(trip, trip.hotel.id);
    expect(opts.length).toBeGreaterThanOrEqual(2);
    expect(opts.length).toBeLessThanOrEqual(3);

    const result = applySwap(trip, trip.hotel.id, opts[0].id);
    expect(result.trip.hotel.catalogId).toBe(opts[0].catalogId);
    expect(typeof result.timingsHold).toBe("boolean");
    expect(Array.isArray(result.lateItems)).toBe(true);
    expect(result.timingsHold).toBe(result.violations.length === 0);
  });

  test("flags items pushed past 22:00", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-24",
      budgetAED: 3000,
    });
    const dinner = trip.days[0].plans.find((p) => p.kind === "dining");
    expect(dinner).toBeDefined();
    const opts = swapOptions(trip, dinner!.id);
    const lateTrip = {
      ...trip,
      days: trip.days.map((d) => ({
        ...d,
        plans: d.plans.map((p) =>
          p.id === dinner!.id ? { ...p, startTime: "22:30" } : p,
        ),
      })),
    };
    const flags = lateItemFlags(lateTrip);
    expect(flags.some((f) => f.past2200 && f.itemId === dinner!.id)).toBe(true);
    expect(opts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("bookTrip / payment gating", () => {
  test("refuses to book before payment", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    expect(() => bookTrip(trip)).toThrow(/after payment/);
  });

  test("deterministic confirmation codes from session id", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    const paid = { ...trip, status: "paid" as const };
    const a = bookTrip(paid, { sessionId: "cs_test_abc" });
    const b = bookTrip(paid, { sessionId: "cs_test_abc" });
    expect(a.confirmations.map((c) => c.confirmationCode)).toEqual(
      b.confirmations.map((c) => c.confirmationCode),
    );
  });
});

describe("stateless demo mode (cold serverless instance)", () => {
  test("demoConfirmBookingFromTrip works with an empty store", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    resetTripStore();
    const result = demoConfirmBookingFromTrip(trip, { confirm: true });
    expect(result.confirmations.length).toBeGreaterThan(0);
    expect(result.trip.status).toBe("booked");
    expect(result.confirmations.some((c) => c.walletPass)).toBe(true);
    expect(result.trip.totalCostAED).toBe(validateAndRepriceTrip(trip).totalCostAED);
  });

  test("rejects unknown catalog items without touching the store", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    resetTripStore();
    const forged = {
      ...trip,
      hotel: { ...trip.hotel, catalogId: "not-a-real-hotel" },
    };
    expect(() => validateAndRepriceTrip(forged)).toThrow(/Unknown catalog/);
    expect(() => demoConfirmBookingFromTrip(forged, { confirm: true })).toThrow(/Unknown catalog/);
  });
});
