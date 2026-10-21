import { describe, expect, test } from "bun:test";
import { planTrip } from "@/lib/planning";
import {
  LOWEST_PRICE_NOTICE,
  adaptOverBudgetUi,
  budgetThatFits,
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
  cheaperHotel?: { catalogId: string; title: string; savesAED: number };
  cheapestFix?: unknown;
  canShorten?: boolean;
}) {
  return {
    budgetAED: partial.budgetAED,
    travellers: partial.travellers ?? 2,
    hotelId: "hotel_1",
    destination: "ras-al-khaimah" as const,
    startDate: "2026-10-23",
    endDate: "2026-10-25",
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

describe("parseCheapestFix — PR #6 confirmed shape", () => {
  test("parses savingAed + targetBudgetAed", () => {
    expect(
      parseCheapestFix({
        kind: "raise-budget",
        label: "Raise your budget",
        savingAed: 0,
        targetBudgetAed: 6000,
      }),
    ).toEqual({
      kind: "raise-budget",
      label: "Raise your budget",
      savingAed: 0,
      targetBudgetAed: 6000,
    });
  });

  test("parses swap-meal with savingAed", () => {
    expect(
      parseCheapestFix({
        kind: "swap-meal",
        label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
        savingAed: 420,
      }),
    ).toEqual({
      kind: "swap-meal",
      label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
      savingAed: 420,
    });
  });

  test("tolerates legacy savesAED until PR #6 is universal", () => {
    expect(
      parseCheapestFix({ kind: "swap-hotel", label: "Hilton", savesAED: 740 }),
    ).toEqual({ kind: "swap-hotel", label: "Hilton", savingAed: 740 });
  });

  test("rejects junk", () => {
    expect(parseCheapestFix(null)).toBeNull();
    expect(parseCheapestFix({ kind: "nope", label: "x", savingAed: 1 })).toBeNull();
  });

  test("button label appends saving when missing from copy", () => {
    expect(catalogFixButtonLabel({ label: "Try Hilton Garden Inn", savingAed: 740 })).toBe(
      "Try Hilton Garden Inn · save AED 740",
    );
    expect(
      catalogFixButtonLabel({
        label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
        savingAed: 420,
      }),
    ).toBe("Swap dinner at Farmhouse for Saffar to save AED 420.");
  });
});

describe("adaptOverBudgetUi — which action shows", () => {
  test("within budget → null", () => {
    expect(adaptOverBudgetUi(base({ budgetAED: 3000, totalAED: 2800, overBudgetByAED: 0 }))).toBeNull();
  });

  test("swap-hotel → catalogFix one button", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4920,
        overBudgetByAED: 1920,
        cheapestFix: {
          kind: "swap-hotel",
          label: "Switch to Hilton Garden Inn",
          savingAed: 740,
        },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") {
      expect(ui.fix.kind).toBe("swap-hotel");
      expect(ui.buttonLabel).toBe("Switch to Hilton Garden Inn · save AED 740");
    }
  });

  test("swap-meal → catalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 1500,
        totalAED: 4180,
        overBudgetByAED: 2680,
        cheapestFix: {
          kind: "swap-meal",
          label: "Swap dinner at Farmhouse for Saffar to save AED 420.",
          savingAed: 420,
        },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") expect(ui.fix.kind).toBe("swap-meal");
  });

  test("drop-item → catalogFix", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 1500,
        totalAED: 4180,
        overBudgetByAED: 2680,
        cheapestFix: { kind: "drop-item", label: "Drop the zipline", savingAed: 650 },
      }),
    );
    expect(ui?.mode).toBe("catalogFix");
    if (ui?.mode === "catalogFix") {
      expect(ui.buttonLabel).toBe("Drop the zipline · save AED 650");
    }
  });

  test("shorten-trip → shorten mode (Make it one night shorter)", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        canShorten: true,
        cheapestFix: {
          kind: "shorten-trip",
          label: "Make it one night shorter",
          savingAed: 1040,
        },
      }),
    );
    expect(ui).toEqual({
      mode: "shorten",
      fix: {
        kind: "shorten-trip",
        label: "Make it one night shorter",
        savingAed: 1040,
      },
    });
  });

  test("shorten-trip that cannot run falls through", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        canShorten: false,
        cheapestFix: { kind: "shorten-trip", label: "Shorter", savingAed: 100 },
      }),
    );
    // No cheaperHotel → noCatalogFix without shorten
    expect(ui?.mode).toBe("noCatalogFix");
    if (ui?.mode === "noCatalogFix") expect(ui.shorten).toBe(false);
  });

  test("raise-budget → Chief notice + Set budget to targetBudgetAed", () => {
    const ui = adaptOverBudgetUi(
      base({
        budgetAED: 3000,
        totalAED: 4180,
        overBudgetByAED: 1180,
        cheapestFix: {
          kind: "raise-budget",
          label: "Raise budget",
          savingAed: 0,
          targetBudgetAed: 6000,
        },
      }),
    );
    expect(ui).toEqual({
      mode: "raiseBudget",
      notice: LOWEST_PRICE_NOTICE,
      setBudgetAED: 6000,
      fix: {
        kind: "raise-budget",
        label: "Raise budget",
        savingAed: 0,
        targetBudgetAed: 6000,
      },
    });
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
      expect(ui.fix.savingAed).toBe(740);
    }
  });

  test("no fix → Chief notice + shorten + set budget", () => {
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

  test("live planTrip Hilton over-budget uses noCatalogFix", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      budgetAED: 3000,
      travellers: 2,
      startDate: "2026-10-23",
      endDate: "2026-10-25",
    });
    expect(trip.facts.withinBudget).toBe(false);
    const ui = adaptOverBudgetUi({ ...trip, hotelId: trip.hotel.id });
    expect(ui?.mode).toBe("noCatalogFix");
  });
});

describe("helpers", () => {
  test("budgetThatFits / labels", () => {
    expect(budgetThatFits(4180, 3000)).toBe(6000);
    expect(setBudgetButtonLabel(6000)).toBe("Set budget to AED 6,000");
    expect(formatAed(1500)).toBe("AED 1,500");
  });
});
