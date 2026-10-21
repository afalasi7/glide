import { describe, expect, test, beforeEach } from "bun:test";
import { evaluate } from "@/lib/agent";
import {
  addDaysIso,
  applySwap,
  assertCatalogQuality,
  assertNoClosedVenues,
  assertScheduleInvariants,
  bookTrip,
  BUDGET_PRESETS_AED,
  demoConfirmBookingFromTrip,
  DEFAULT_BUDGET_AED,
  DESTINATIONS,
  getCatalogOption,
  isGenericVenueTitle,
  isLunchOption,
  isOpenAt,
  lateItemFlags,
  nextFridayIso,
  PAYMENT_TRUST_LINE,
  planTrip,
  readyMinutes,
  resetTripStore,
  swapOptions,
  timeToMinutes,
  validateAndRepriceTrip,
  WEEKDAYS,
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

describe("catalog quality", () => {
  test("every venue has a concrete title and non-aggregator sourceUrl", () => {
    expect(() => assertCatalogQuality()).not.toThrow();
    for (const dest of Object.values(DESTINATIONS)) {
      for (const opt of [...dest.travel, ...dest.hotels, ...dest.plans]) {
        expect(isGenericVenueTitle(opt.title)).toBe(false);
        expect(opt.sourceUrl.startsWith("http")).toBe(true);
      }
    }
  });

  test("rejects generic lunch/dinner district titles", () => {
    expect(isGenericVenueTitle("lunch")).toBe(true);
    expect(isGenericVenueTitle("Ruwi street-food lunch")).toBe(true);
    expect(isGenericVenueTitle("Opera District contemporary dinner")).toBe(true);
    expect(isGenericVenueTitle("Farmhouse by Syrco")).toBe(false);
    expect(isGenericVenueTitle("Bait Al Luban")).toBe(false);
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

  test("Muscat defaults to a DXB→MCT flight", () => {
    const trip = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
    });
    expect(trip.travel.mode).toBe("flight");
    expect(trip.travel.catalogId).toBe("mct-flight-dxb");
    expect(trip.returnTravel?.startTime).toBe("15:00");
  });
});

describe("highlights", () => {
  test("RAK: Jebel Jais sunset on Saturday full day", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const highlightDay = trip.days.find((d) =>
      d.plans.some((p) => p.catalogId === "rak-jais-deck"),
    );
    expect(highlightDay?.day).toBe(2);
    expect(trip.facts.highlight?.copy).toBe("Jebel Jais is timed for sunset.");
    expect(evaluate(trip.graph).order.length).toBeGreaterThan(2);
  });

  test("RAK: museum Saturday morning, Dhayah Sunday morning", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const sat = trip.days[1]!;
    const sun = trip.days[2]!;
    expect(sat.plans.some((p) => p.catalogId === "rak-national-museum")).toBe(true);
    expect(sun.plans.some((p) => p.catalogId === "rak-dhayah-fort")).toBe(true);
    expect(sat.plans.some((p) => p.catalogId === "rak-dhayah-fort")).toBe(false);
  });

  test("Muscat: Mutrah highlight; Opera not on Friday", () => {
    const trip = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
    });
    expect(trip.facts.highlight?.copy).toBe(
      "Your evening at Mutrah Corniche is set for the cooler hours.",
    );
    const fri = trip.days[0]!;
    expect(fri.plans.some((p) => p.catalogId === "mct-opera")).toBe(false);
    expect(fri.plans.some((p) => p.catalogId === "mct-grand-mosque")).toBe(false);
  });

  test("Hatta: morning dam kayaking copy", () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(trip.facts.highlight!.catalogId).toBe("hatta-kayak");
  });

  test("swap that removes the highlight drops the copy", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const jais = trip.days.flatMap((d) => d.plans).find((p) => p.catalogId === "rak-jais-deck")!;
    const opts = swapOptions(trip, jais.id);
    expect(opts.length).toBeGreaterThanOrEqual(1);
    const swapped = applySwap(trip, jais.id, opts[0]!.id);
    expect(swapped.ok).toBe(true);
    if (!swapped.ok) return;
    expect(swapped.trip.facts.highlight).toBeUndefined();
  });
});

describe("opening hours", () => {
  test("no item is scheduled while its venue is closed (default Fri–Sun)", () => {
    for (const destination of ["ras-al-khaimah", "muscat", "hatta"] as const) {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: destination === "muscat" ? 6000 : 3000,
      });
      expect(() => assertNoClosedVenues(trip)).not.toThrow();
      for (const day of trip.days) {
        for (const p of day.plans) {
          const opt = getCatalogOption(p.catalogId)!;
          expect(isOpenAt(opt, day.date, p.startTime)).toBe(true);
        }
      }
    }
  });

  test("every destination × 7 start weekdays stays within opening hours (plan + swap)", () => {
    // Anchor: Sunday 2026-10-18, then Mon…Sat
    const sunday = "2026-10-18";
    for (const destination of ["ras-al-khaimah", "muscat", "hatta"] as const) {
      for (let offset = 0; offset < 7; offset++) {
        const startDate = addDaysIso(sunday, offset);
        const endDate = addDaysIso(startDate, 2);
        const trip = planTrip({
          destination,
          startDate,
          endDate,
          budgetAED: destination === "muscat" ? 6000 : 3000,
        });
        expect(() => assertNoClosedVenues(trip)).not.toThrow();
        expect(WEEKDAYS.length).toBe(7);

        const swappable = trip.days.flatMap((d) => d.plans).find((p) => p.kind === "dining" || p.kind === "activity");
        if (!swappable) continue;
        const opts = swapOptions(trip, swappable.id);
        if (!opts.length) {
          const refused = applySwap(trip, swappable.id, "opt_missing");
          expect(refused.ok).toBe(false);
          continue;
        }
        const result = applySwap(trip, swappable.id, opts[0]!.id);
        if (result.ok) {
          expect(() => assertNoClosedVenues(result.trip)).not.toThrow();
        } else {
          expect(result.reason.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("swap refuses a closed venue instead of applying it", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    // Dhayah is closed Fri/Sat — any swap option list for a Saturday morning slot must not include it.
    const satMorning = trip.days[1]!.plans.find((p) => timeToMinutes(p.startTime) < 12 * 60);
    expect(satMorning).toBeDefined();
    const opts = swapOptions(trip, satMorning!.id);
    expect(opts.every((o) => o.catalogId !== "rak-dhayah-fort")).toBe(true);
  });
});

describe("schedule invariants", () => {
  const destinations = ["ras-al-khaimah", "muscat", "hatta"] as const;

  for (const destination of destinations) {
    test(`${destination}: ready time, unique venues, time order, gaps`, () => {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: destination === "muscat" ? 6000 : 3000,
      });
      assertScheduleInvariants(trip);

      const ready = readyMinutes(trip.travel);
      for (const p of trip.days[0]!.plans) {
        expect(timeToMinutes(p.startTime)).toBeGreaterThanOrEqual(ready);
      }
    });

    test(`${destination}: full days and last day include lunch`, () => {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: destination === "muscat" ? 6000 : 3000,
      });
      const hasLunch = (day: (typeof trip.days)[0]) =>
        day.plans.some((p) => {
          const opt = getCatalogOption(p.catalogId);
          return Boolean(opt && isLunchOption(opt));
        });
      expect(hasLunch(trip.days[1]!)).toBe(true);
      expect(hasLunch(trip.days[trip.days.length - 1]!)).toBe(true);
    });
  }

  test("Hatta day 1 has no multi-hour empty stretch before dinner", () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(() => assertScheduleInvariants(trip)).not.toThrow();
    expect(trip.days[0]!.plans.length).toBeGreaterThanOrEqual(1);
  });

  test("RAK keeps a single Jebel Jais visit", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const jais = trip.days.flatMap((d) => d.plans).filter((p) => {
      return getCatalogOption(p.catalogId)?.area === "jebel-jais";
    });
    expect(jais).toHaveLength(1);
    expect(jais[0]!.catalogId).toBe("rak-jais-deck");
  });
});

describe("swapOptions / applySwap", () => {
  test("returns alternatives and reports timingsHold when ok", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const opts = swapOptions(trip, trip.hotel.id);
    expect(opts.length).toBeGreaterThanOrEqual(1);
    const result = applySwap(trip, trip.hotel.id, opts[0]!.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.trip.hotel.catalogId).toBe(opts[0]!.catalogId);
    expect(result.timingsHold).toBe(result.violations.length === 0);
  });

  test("flags items pushed past 22:00", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-24",
      budgetAED: 3000,
    });
    const dinner = trip.days[0]!.plans.find((p) => p.kind === "dining");
    expect(dinner).toBeDefined();
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
  });

  test("rejects unknown catalog items without touching the store", () => {
    const trip = planTrip({ startDate: "2026-10-23", endDate: "2026-10-25" });
    resetTripStore();
    const forged = {
      ...trip,
      hotel: { ...trip.hotel, catalogId: "not-a-real-hotel" },
    };
    expect(() => validateAndRepriceTrip(forged)).toThrow(/Unknown catalog/);
  });
});
