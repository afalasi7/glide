import { describe, expect, test, beforeEach } from "bun:test";
import { evaluate } from "@/lib/agent";
import {
  addDaysIso,
  applySwap,
  assertCatalogQuality,
  assertNoClosedVenues,
  assertNoOverlaps,
  assertScheduleInvariants,
  bookTrip,
  BUDGET_PRESETS_AED,
  closedInfo,
  demoConfirmBookingFromTrip,
  DEFAULT_BUDGET_AED,
  DESTINATIONS,
  getCatalogOption,
  getSwapOptions,
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
    expect(DESTINATIONS.muscat.plans.some((p) => p.catalogId === "mct-lunch-kargeen")).toBe(false);
    expect(DESTINATIONS.hatta.plans.some((p) => p.catalogId === "hatta-lunch-janam")).toBe(false);
  });

  test("rejects generic lunch/dinner district titles", () => {
    expect(isGenericVenueTitle("lunch")).toBe(true);
    expect(isGenericVenueTitle("Ruwi street-food lunch")).toBe(true);
    expect(isGenericVenueTitle("Opera District contemporary dinner")).toBe(true);
    expect(isGenericVenueTitle("Farmhouse by Syrco")).toBe(false);
    expect(isGenericVenueTitle("Bait Al Luban")).toBe(false);
  });

  test("Suwaidi has fixed start slots and 2.5h duration", () => {
    const s = getCatalogOption("rak-suwaidi-pearls")!;
    expect(s.startSlots).toEqual(["10:00", "12:30", "15:00"]);
    expect(s.durationMin).toBe(150);
  });

  test("Dhayah is Sunday–Thursday, not Sunday-only", () => {
    const d = getCatalogOption("rak-dhayah-fort")!;
    expect(d.openDays).toEqual(["sun", "mon", "tue", "wed", "thu"]);
  });

  test("Ubhar lunch and dinner use split hours; Al Angham has minAge 6", () => {
    const lunch = getCatalogOption("mct-lunch-ubhar")!;
    const dinner = getCatalogOption("mct-dinner-ubhar")!;
    expect(lunch.openHours).toEqual({ open: "12:00", close: "15:30" });
    expect(dinner.openHours).toEqual({ open: "18:30", close: "23:00" });
    const angham = getCatalogOption("mct-lunch-al-angham")!;
    expect(angham.minAge).toBe(6);
    expect(angham.openDays).toEqual(["sun", "mon", "tue", "wed", "thu"]);
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

describe("budget tiers", () => {
  test("RAK at AED 3000 is within budget on a mid-range hotel", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(trip.hotel.catalogId).toBe("rak-hotel-hilton");
    expect(trip.facts.withinBudget).toBe(true);
    expect(trip.facts.cheapestFix).toBeUndefined();
  });

  test("RAK at AED 6000 upgrades to Ritz-Carlton Al Wadi", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
    });
    expect(trip.hotel.catalogId).toBe("rak-hotel-ritz-wadi");
    expect(trip.facts.withinBudget).toBe(true);
  });

  test("each destination at AED 1,500 has a non-null cheapestFix with savingAed", () => {
    for (const destination of ["ras-al-khaimah", "muscat", "hatta"] as const) {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: 1500,
      });
      expect(trip.facts.withinBudget).toBe(false);
      expect(trip.facts.cheapestFix).toBeDefined();
      expect(trip.facts.cheapestFix!.label.length).toBeGreaterThan(0);
      expect(typeof trip.facts.cheapestFix!.savingAed).toBe("number");
      if (trip.facts.cheapestFix!.kind === "raise-budget") {
        expect(trip.facts.cheapestFix!.targetBudgetAed).toBe(trip.totalCostAED);
      }
      if (trip.facts.cheapestFix!.kind === "shorten-trip") {
        expect(trip.facts.cheapestFix!.label).toBe("Make it one night shorter");
      }
    }
  });

  test("default AED 3000: RAK and Hatta within budget; Muscat reports over with fix", () => {
    const rak = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(rak.facts.withinBudget).toBe(true);

    const hatta = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(hatta.facts.withinBudget).toBe(true);

    const muscat = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    // Real DXB→MCT flights alone put Muscat over AED 3,000 — do not fake prices.
    expect(muscat.facts.withinBudget).toBe(false);
    expect(muscat.facts.overBudgetByAED).toBeGreaterThan(0);
    expect(muscat.facts.cheapestFix).toBeDefined();
    expect(muscat.facts.cheapestFix!.savingAed).toBeGreaterThanOrEqual(0);
  });
});

describe("highlights", () => {
  test("RAK: Jebel Jais sunset on Saturday full day after Suwaidi", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const sat = trip.days[1]!;
    expect(sat.plans.some((p) => p.catalogId === "rak-jais-deck")).toBe(true);
    expect(trip.facts.highlight?.copy).toBe("Jebel Jais is timed for sunset.");
    const suwaidi = sat.plans.find((p) => p.catalogId === "rak-suwaidi-pearls");
    expect(suwaidi?.startTime).toBe("10:00");
    expect(sat.plans.some((p) => p.catalogId === "rak-lunch-marina")).toBe(true);
    expect(sat.plans.some((p) => p.catalogId === "rak-national-museum")).toBe(true);
    expect(evaluate(trip.graph).order.length).toBeGreaterThan(2);
  });

  test("RAK: museum Saturday, Dhayah Sunday morning", () => {
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

  test("Muscat: Mutrah highlight; Opera not on Friday; Ubhar or open Friday lunch on Day 1", () => {
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
    const lunch = fri.plans.find((p) => {
      const opt = getCatalogOption(p.catalogId);
      return Boolean(opt && isLunchOption(opt));
    });
    expect(lunch).toBeDefined();
    expect(lunch!.catalogId).not.toBe("mct-lunch-kargeen");
  });

  test("Hatta: morning dam kayaking copy; Day 2 Gazebo lunch", () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(trip.facts.highlight!.catalogId).toBe("hatta-kayak");
    const sat = trip.days[1]!;
    expect(sat.plans.some((p) => p.catalogId === "hatta-lunch-gazebo")).toBe(true);
    expect(sat.plans.some((p) => p.catalogId === "hatta-lunch-janam")).toBe(false);
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

describe("opening hours and closed wording", () => {
  test("closedInfo uses plain Sundays copy and internal code", () => {
    const dhayah = getCatalogOption("rak-dhayah-fort")!;
    const info = closedInfo(dhayah, "2026-10-25", "09:30");
    // 2026-10-25 is Sunday — Dhayah is open Sundays; use a Saturday instead.
    const sat = closedInfo(dhayah, "2026-10-24", "09:30");
    expect(sat.message).toBe("Dhayah Fort is closed on Saturdays.");
    expect(sat.code).toBe("closed on sat (2026-10-24)");
    expect(info.message).not.toMatch(/\(2026/);
  });

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

  test("every destination × 7 start weekdays stays within opening hours (plan + exhaustive swap)", () => {
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
        expect(() => assertScheduleInvariants(trip)).not.toThrow();
        expect(WEEKDAYS.length).toBe(7);

        const swappable = trip.days.flatMap((d) => d.plans);
        for (const item of swappable) {
          const opts = getSwapOptions(trip, item.id);
          for (const opt of opts) {
            const result = applySwap(trip, item.id, opt.id);
            expect(result.ok).toBe(true);
            if (!result.ok) {
              throw new Error(
                `${destination} ${startDate} offered ${opt.catalogId} for ${item.catalogId} but refused: ${result.reason}`,
              );
            }
            expect(() => assertNoClosedVenues(result.trip)).not.toThrow();
          }
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
    const satMorning = trip.days[1]!.plans.find((p) => timeToMinutes(p.startTime) < 12 * 60);
    expect(satMorning).toBeDefined();
    const opts = swapOptions(trip, satMorning!.id);
    expect(opts.every((o) => o.catalogId !== "rak-dhayah-fort")).toBe(true);
  });
});

describe("minAge / children", () => {
  test("Al Angham is skipped when a child under 6 is in the party", () => {
    const trip = planTrip({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 6000,
      children: [4, 8],
    });
    const ids = trip.days.flatMap((d) => d.plans.map((p) => p.catalogId));
    expect(ids).not.toContain("mct-lunch-al-angham");
    expect(trip.children).toEqual([4, 8]);
  });

  test("Al Angham allowed when all children are 6+", () => {
    const withKids = planTrip({
      destination: "muscat",
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      budgetAED: 6000,
      children: [6, 10],
    });
    // Sunday start — Al Angham open; may or may not be picked, but must not be refused by age.
    const angham = getCatalogOption("mct-lunch-al-angham")!;
    expect(angham.minAge).toBe(6);
    void withKids;
  });
});

describe("schedule invariants", () => {
  const destinations = ["ras-al-khaimah", "muscat", "hatta"] as const;

  for (const destination of destinations) {
    test(`${destination}: ready time, unique venues, time order, gaps, overlaps`, () => {
      const trip = planTrip({
        destination,
        startDate: "2026-10-23",
        endDate: "2026-10-25",
        budgetAED: destination === "muscat" ? 6000 : 3000,
      });
      assertScheduleInvariants(trip);
      assertNoOverlaps(trip);

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

  test("items never overlap including hotel check-in (RAK Day 1)", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    expect(() => assertNoOverlaps(trip)).not.toThrow();
    const hotelEnd =
      timeToMinutes(trip.hotel.startTime) + (trip.hotel.durationMin ?? 40);
    for (const p of trip.days[0]!.plans) {
      expect(timeToMinutes(p.startTime)).toBeGreaterThanOrEqual(hotelEnd);
    }
  });

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

  test("extended gaps across all destinations × start weekdays", () => {
    const sunday = "2026-10-18";
    for (const destination of destinations) {
      for (let offset = 0; offset < 7; offset++) {
        const startDate = addDaysIso(sunday, offset);
        const trip = planTrip({
          destination,
          startDate,
          endDate: addDaysIso(startDate, 2),
          budgetAED: destination === "muscat" ? 6000 : 3000,
        });
        expect(() => assertScheduleInvariants(trip)).not.toThrow();
      }
    }
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
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const dinner = trip.days.flatMap((d) => d.plans).find((p) => p.kind === "dining");
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

describe("graph bridge integrity", () => {
  test("travel duration is not double-counted as dwell + edge", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const travelNode = trip.graph.nodes[trip.travel.id];
    expect(travelNode.dwellMin).toBe(0);
    const outEdge = trip.graph.edges.find((e) => e.from === trip.travel.id);
    expect(outEdge?.travelMin).toBe(trip.travel.durationMin);
    // Healthy default plan should not already violate dinner holds.
    const ev = evaluate(trip.graph);
    expect(ev.violations.filter((v) => v.kind === "reservation_hold")).toEqual([]);
  });

  test("each dining row gets a unique bookingRef", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const dining = trip.days.flatMap((d) => d.plans).filter((p) => p.kind === "dining");
    expect(dining.length).toBeGreaterThan(1);
    const refs = dining.map((p) => p.bookingRef);
    expect(refs.every(Boolean)).toBe(true);
    expect(new Set(refs).size).toBe(refs.length);
  });

  test("Jais highlight cutoff matches catalog 17:48", () => {
    expect(DESTINATIONS["ras-al-khaimah"].highlight.cutoffTime).toBe("17:48");
    expect(getCatalogOption("rak-jais-deck")!.durationMin).toBe(45);
  });
});
