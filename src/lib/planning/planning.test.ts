import { describe, expect, test, beforeEach } from "bun:test";
import { evaluate } from "@/lib/agent";
import {
  applySwap,
  bookTrip,
  BUDGET_PRESETS_AED,
  confirmBookingAfterPayment,
  demoConfirmBookingFromTrip,
  DEFAULT_BUDGET_AED,
  lateItemFlags,
  nextFridayIso,
  PAYMENT_TRUST_LINE,
  planTrip,
  resetTripStore,
  swapOptions,
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

    const fri = nextFridayIso(new Date("2026-10-21T12:00:00Z")); // Wed → Fri 23
    expect(fri).toBe("2026-10-23");
    const trip = planTrip({ startDate: "2026-10-23" });
    expect(trip.startDate).toBe("2026-10-23");
    expect(trip.endDate).toBe("2026-10-25"); // Sun
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
  test("RAK: Jebel Jais sunset item + copy", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      travellers: 2,
      budgetAED: 3000,
    });
    const day1Ids = trip.days[0].plans.map((p) => p.catalogId);
    expect(day1Ids).toContain("rak-jais-deck");
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
    const jais = trip.days[0].plans.find((p) => p.catalogId === "rak-jais-deck")!;
    expect(trip.facts.highlight?.copy).toBe("Jebel Jais is timed for sunset.");
    const opts = swapOptions(trip, jais.id);
    const alt = opts.find((o) => o.catalogId !== "rak-jais-deck");
    expect(alt).toBeDefined();
    const swapped = applySwap(trip, jais.id, alt!.id);
    expect(swapped.trip.facts.highlight).toBeUndefined();
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

  test("confirmBookingAfterPayment issues confirmations", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    const result = confirmBookingAfterPayment(trip.id);
    expect(result.confirmations.length).toBeGreaterThan(0);
    expect(result.trip.status).toBe("booked");
    expect(result.confirmations[0].confirmationCode).toMatch(/^GLD-/);
    expect(result.confirmations.some((c) => c.walletPass)).toBe(true);
  });
});

describe("stateless demo mode (cold serverless instance)", () => {
  test("demoConfirmBookingFromTrip works with an empty store", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    // Simulate a different Vercel instance: wipe all in-memory trips.
    resetTripStore();
    const result = demoConfirmBookingFromTrip(trip, { confirm: true });
    expect(result.confirmations.length).toBeGreaterThan(0);
    expect(result.trip.status).toBe("booked");
    expect(result.confirmations.some((c) => c.walletPass)).toBe(true);
    // Total was recomputed from catalog, not trusted from a stale client claim.
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
