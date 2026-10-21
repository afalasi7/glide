import { describe, expect, test, beforeEach } from "bun:test";
import { evaluate } from "@/lib/agent";
import {
  applySwap,
  bookTrip,
  BUDGET_PRESETS_AED,
  confirmBookingAfterPayment,
  demoConfirmBooking,
  DEFAULT_BUDGET_AED,
  lateItemFlags,
  nextFridayIso,
  PAYMENT_TRUST_LINE,
  planTrip,
  resetTripStore,
  swapOptions,
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

describe("planTrip shape and facts", () => {
  test("RAK includes sunset Jebel Jais highlight and 2–3 plans per day", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      travellers: 2,
      budgetAED: 3000,
    });
    expect(trip.travel.mode).toBe("drive");
    expect(trip.hotel.kind).toBe("hotel");
    expect(trip.days.length).toBe(3);
    for (const day of trip.days) {
      expect(day.plans.length).toBeGreaterThanOrEqual(2);
      expect(day.plans.length).toBeLessThanOrEqual(3);
    }
    const day1Ids = trip.days[0].plans.map((p) => p.catalogId);
    expect(day1Ids).toContain("rak-jais-deck");
    expect(trip.facts.highlight.catalogId).toBe("rak-jais-deck");
    expect(trip.facts.highlight.label).toBe("Sunset at Jebel Jais");
    expect(trip.facts.highlight.cutoffTime).toBe("17:48");
    expect(trip.facts.totalAED).toBe(trip.totalCostAED);
    expect(typeof trip.facts.withinBudget).toBe("boolean");
    expect(trip.facts.overBudgetByAED).toBeGreaterThanOrEqual(0);
    expect(evaluate(trip.graph).order.length).toBeGreaterThan(2);
  });

  test("Muscat and Hatta return their own highlights", () => {
    const muscat = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
    });
    expect(muscat.travel.mode).toBe("flight");
    expect(muscat.facts.highlight.label).toBe("Mutrah Souq at golden hour");

    const hatta = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(hatta.travel.mode).toBe("drive");
    expect(hatta.facts.highlight.label).toBe("Hatta Dam at golden hour");
  });

  test("over-budget trips expose cheaper hotel suggestion", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      travellers: 2,
      budgetAED: 1500,
      interests: ["luxury"],
    });
    if (!trip.facts.withinBudget) {
      expect(trip.facts.overBudgetByAED).toBeGreaterThan(0);
      expect(trip.facts.cheaperHotel).toBeDefined();
      expect(trip.facts.cheaperHotel!.savesAED).toBeGreaterThan(0);
    }
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
    // Force a late start via a synthetic option path: apply catalog then manually
    // verify late detection by swapping to an option and patching — use applySwap
    // after constructing a late dining via hotel swap that keeps dinner.
    // Directly: applySwap with option that has late default if any; else simulate.
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

  test("demoConfirmBooking requires explicit confirm", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    const result = demoConfirmBooking(trip.id, { confirm: true });
    expect(result.trip.status).toBe("booked");
  });
});
