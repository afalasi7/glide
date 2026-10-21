import { describe, expect, test } from "bun:test";
import { planTrip } from "@/lib/planning";
import {
  LOWEST_PRICE_NOTICE,
  adaptOverBudgetUi,
  budgetThatFits,
  canApplyCatalogFix,
  catalogFixButtonLabel,
  formatAed,
  parseCheapestFix,
  proposalBudgetLine,
  setBudgetButtonLabel,
} from "./proposal-copy";

function base(partial: {
  budgetAED: number;
  totalAED: number;
  overBudgetByAED: number;
  withinBudget?: boolean;
  travellers?: number;
  cheaperHotel?: {
    catalogId: string;
    title: string;
    savesAED: number;
  };
  cheapestFix?: unknown;
  canShorten?: boolean;
  hotelId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return {
    budgetAED: partial.budgetAED,
    travellers: partial.travellers ?? 2,
    hotelId: partial.hotelId ?? "hotel_1",
    destination: "ras-al-khaimah" as const,
    startDate: partial.startDate ?? "2026-10-23",
    endDate: partial.endDate ?? "2026-10-25",
    canShorten: partial.canShorten,
    facts: {
      withinBudget: partial.withinBudget ?? partial.overBudgetByAED === 0,
      totalAED: partial.totalAED,
      overBudgetByAED: partial.overBudgetByAED,
      cheaperHotel: partial.cheaperHotel,
      cheapestFix: partial.cheapestFix,
    },
  };
}

describe("proposalBudgetLine", () => {
  test("within / ≤10% / >10%", () => {
    expect(proposalBudgetLine(base({ budgetAED: 3000, totalAED: 2800, overBudgetByAED: 0 }))).toContain(
      "within your budget",
    );
    expect(proposalBudgetLine(base({ budgetAED: 3000, totalAED: 3300, overBudgetByAED: 300 }))).toContain(
      "a bit over",
    );
    expect(proposalBudgetLine(base({ budgetAED: 3000, totalAED: 3740, overBudgetByAED: 740 }))).toBe(
      "AED 740 over your AED 3,000.",
    );
  });
});

describe("parseCheapestFix / catalog labels", () => {
  test("parses planner shape", () => {
    expect(
      parseCheapestFix({
        kind: "swap-meal",
        label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
        savesAED: 420,
        apply: { itemId: "d1", catalogId: "rak-dinner-x" },
      }),
    ).toEqual({
      kind: "swap-meal",
      label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
      savesAED: 420,
      apply: { itemId: "d1", catalogId: "rak-dinner-x", optionId: undefined, budgetAED: undefined },
    });
  });

  test("rejects junk", () => {
    expect(parseCheapestFix(null)).toBeNull();
    expect(parseCheapestFix({ kind: "nope", label: "x", savesAED: 1 })).toBeNull();
  });

  test("button label appends save when missing", () => {
    expect(catalogFixButtonLabel({ label: "Try Hilton Garden Inn", savesAED: 740 })).toBe(
      "Try Hilton Garden Inn · save AED 740",
    );
    expect(
      catalogFixButtonLabel({
        label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
        savesAED: 420,
      }),
    ).toBe("Swap dinner at Farmhouse for Saffar to save AED 420.");
  });
});

describe("adaptOverBudgetUi — which action shows", () => {
  test("within budget → null", () => {
    expect(adaptOverBudgetUi(base({ budgetAED: 3000, totalAED: 2800, overBudgetByAED: 0 }))).toBeNull();
  });

  test("planner swap-hotel with apply → catalogFix button", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4920,
        overBudgetByAED: 1920,
        cheapestFix: {
          kind: "swap-hotel",
          label: "Switch to Hilton Garden Inn to save AED 740.",
          savesAED: 740,
          apply: { catalogId: "rak-hotel-hilton", itemId: "hotel_1" },
        },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") {
      expect(ui.fix.kind).toBe("swap-hotel");
      expect(ui.buttonLabel).toContain("Hilton");
    }
  });

  test("planner swap-meal → catalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 1500,
        totalAED: 4180,
        overBudgetByAED: 2680,
        cheapestFix: {
          kind: "swap-meal",
          label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
          savesAED: 420,
          apply: { itemId: "dinner_1", catalogId: "rak-dinner-saffar" },
        },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") {
      expect(ui.fix.kind).toBe("swap-meal");
      expect(ui.buttonLabel).toBe("Swap dinner at Farmhouse for Saffar to save AED 420.");
    }
  });

  test("planner drop-item without itemId is not actionable → noCatalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 1500,
        totalAED: 4180,
        overBudgetByAED: 2680,
        canShorten: true,
        cheapestFix: { kind: "drop-item", label: "Drop zipline", savesAED: 650 },
      }),
    );
    expect(ui?.mode).toBe("noCatalogFix");
    if (ui?.mode === "noCatalogFix") {
      expect(ui.notice).toBe(LOWEST_PRICE_NOTICE);
      expect(ui.shorten).toBe(true);
      expect(ui.setBudgetAED).toBeGreaterThan(1500);
    }
  });

  test("fallback cheaperHotel when cheapestFix absent → catalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4920,
        overBudgetByAED: 1920,
        cheaperHotel: {
          catalogId: "rak-hotel-hilton",
          title: "Hilton Garden Inn Ras Al Khaimah",
          savesAED: 740,
        },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") {
      expect(ui.fix.kind).toBe("swap-hotel");
      expect(ui.fix.apply?.catalogId).toBe("rak-hotel-hilton");
    }
  });

  test("no catalog fix → Chief notice + shorten + set budget", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        canShorten: true,
      }),
    );
    expect(ui).toEqual({
      mode: "noCatalogFix",
      notice: LOWEST_PRICE_NOTICE,
      shorten: true,
      setBudgetAED: 6000,
    });
  });

  test("no catalog fix, shorten impossible → only set budget", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        canShorten: false,
      }),
    );
    expect(ui?.mode).toBe("noCatalogFix");
    if (ui?.mode === "noCatalogFix") {
      expect(ui.shorten).toBe(false);
      expect(ui.setBudgetAED).toBe(6000);
    }
  });

  test("planner raise-budget supplies setBudgetAED under noCatalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        canShorten: false,
        cheapestFix: {
          kind: "raise-budget",
          label: "Raise budget to AED 6,000",
          savesAED: 0,
          apply: { budgetAED: 6000 },
        },
      }),
    );
    expect(ui).toEqual({
      mode: "noCatalogFix",
      notice: LOWEST_PRICE_NOTICE,
      shorten: false,
      setBudgetAED: 6000,
    });
  });

  test("live planTrip at AED 3,000 with Hilton (no cheaper) uses noCatalogFix", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      budgetAED: 3000,
      travellers: 2,
      startDate: "2026-10-23",
      endDate: "2026-10-25",
    });
    expect(trip.facts.withinBudget).toBe(false);
    expect(trip.facts.cheaperHotel).toBeUndefined();
    const ui = adaptOverBudgetUi({
      ...trip,
      hotelId: trip.hotel.id,
      canShorten: undefined,
    });
    expect(ui?.mode).toBe("noCatalogFix");
    if (ui?.mode === "noCatalogFix") {
      expect(ui.notice).toBe(LOWEST_PRICE_NOTICE);
      expect(ui.setBudgetAED).toBeTruthy();
      // Fri–Sun can shorten to Fri–Sat
      expect(ui.shorten).toBe(true);
    }
  });
});

describe("helpers", () => {
  test("budgetThatFits / setBudgetButtonLabel", () => {
    expect(budgetThatFits(4180, 3000)).toBe(6000);
    expect(budgetThatFits(7200, 6000)).toBe(7200);
    expect(setBudgetButtonLabel(6000)).toBe("Set budget to AED 6,000");
    expect(formatAed(1500)).toBe("AED 1,500");
  });

  test("canApplyCatalogFix gates incomplete payloads", () => {
    expect(
      canApplyCatalogFix(
        { kind: "drop-item", label: "Drop", savesAED: 100 },
        { hotelId: "h" },
      ),
    ).toBe(false);
    expect(
      canApplyCatalogFix(
        { kind: "drop-item", label: "Drop", savesAED: 100, apply: { itemId: "x" } },
        { hotelId: "h" },
      ),
    ).toBe(true);
  });
});
