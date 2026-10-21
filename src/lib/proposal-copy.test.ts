import { describe, expect, test } from "bun:test";
import {
  formatAed,
  hasPlanningCheapestFix,
  nextBudgetChip,
  overBudgetRecovery,
  proposalBudgetLine,
  raiseBudgetButtonLabel,
} from "./proposal-copy";

function trip(partial: {
  budgetAED: number;
  totalAED: number;
  overBudgetByAED: number;
  withinBudget?: boolean;
  travellers?: number;
  kids?: number;
  cheaperHotel?: unknown;
  cheapestFix?: unknown;
  suggestions?: unknown;
}) {
  const withinBudget = partial.withinBudget ?? partial.overBudgetByAED === 0;
  return {
    budgetAED: partial.budgetAED,
    travellers: partial.travellers ?? 2,
    kids: partial.kids,
    facts: {
      withinBudget,
      totalAED: partial.totalAED,
      overBudgetByAED: partial.overBudgetByAED,
      cheaperHotel: partial.cheaperHotel,
      cheapestFix: partial.cheapestFix,
      suggestions: partial.suggestions,
    },
  };
}

describe("proposalBudgetLine", () => {
  test("within budget", () => {
    expect(proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 2800, overBudgetByAED: 0 }))).toBe(
      "It comes to AED 2,800 for 2, within your budget.",
    );
  });

  test("over by exactly 10% uses a bit over", () => {
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3300, overBudgetByAED: 300 })),
    ).toBe("This comes to AED 3,300, a bit over your AED 3,000.");
  });

  test("over by under 10% uses a bit over", () => {
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3200, overBudgetByAED: 200 })),
    ).toBe("This comes to AED 3,200, a bit over your AED 3,000.");
  });

  test("over by more than 10% uses overBy amount", () => {
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3740, overBudgetByAED: 740 })),
    ).toBe("AED 740 over your AED 3,000.");
  });

  test("just over 10% threshold uses overBy form", () => {
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3301, overBudgetByAED: 301 })),
    ).toBe("AED 301 over your AED 3,000.");
  });

  test("formatAed rounds and localizes", () => {
    expect(formatAed(1500)).toBe("AED 1,500");
  });
});

describe("overBudgetRecovery", () => {
  test("within budget → null (no recovery UI)", () => {
    expect(
      overBudgetRecovery(trip({ budgetAED: 3000, totalAED: 2800, overBudgetByAED: 0 })),
    ).toBeNull();
  });

  test("over budget with cheaperHotel → cheaperHotel action", () => {
    expect(
      overBudgetRecovery(
        trip({
          budgetAED: 3000,
          totalAED: 4920,
          overBudgetByAED: 1920,
          cheaperHotel: { catalogId: "rak-hotel-hilton" },
        }),
      ),
    ).toEqual({ kind: "cheaperHotel" });
  });

  test("over budget with cheapestFix (future PR #6 field) → cheaperHotel action", () => {
    expect(
      overBudgetRecovery(
        trip({
          budgetAED: 3000,
          totalAED: 4000,
          overBudgetByAED: 1000,
          cheapestFix: { catalogId: "x" },
        }),
      ),
    ).toEqual({ kind: "cheaperHotel" });
  });

  test("over budget with suggestions array → cheaperHotel action", () => {
    expect(
      overBudgetRecovery(
        trip({
          budgetAED: 3000,
          totalAED: 4000,
          overBudgetByAED: 1000,
          suggestions: [{ type: "hotel" }],
        }),
      ),
    ).toEqual({ kind: "cheaperHotel" });
  });

  test("over budget, no cheaper hotel, mid chip → raiseBudget to next chip", () => {
    expect(
      overBudgetRecovery(trip({ budgetAED: 3000, totalAED: 4180, overBudgetByAED: 1180 })),
    ).toEqual({ kind: "raiseBudget", nextBudgetAED: 6000 });
  });

  test("over budget, no cheaper hotel, low chip → raiseBudget to 3000", () => {
    expect(
      overBudgetRecovery(trip({ budgetAED: 1500, totalAED: 4180, overBudgetByAED: 2680 })),
    ).toEqual({ kind: "raiseBudget", nextBudgetAED: 3000 });
  });

  test("over budget, no cheaper hotel, top chip → changeDetailsOnly", () => {
    expect(
      overBudgetRecovery(trip({ budgetAED: 6000, totalAED: 7200, overBudgetByAED: 1200 })),
    ).toEqual({ kind: "changeDetailsOnly" });
  });

  test("cheaperHotel wins over raiseBudget even at mid chip", () => {
    expect(
      overBudgetRecovery(
        trip({
          budgetAED: 3000,
          totalAED: 4920,
          overBudgetByAED: 1920,
          cheaperHotel: { catalogId: "h" },
        }),
      ),
    ).toEqual({ kind: "cheaperHotel" });
  });
});

describe("nextBudgetChip / raiseBudgetButtonLabel", () => {
  test("next chip above current", () => {
    expect(nextBudgetChip(1500)).toBe(3000);
    expect(nextBudgetChip(3000)).toBe(6000);
    expect(nextBudgetChip(6000)).toBeUndefined();
  });

  test("button label", () => {
    expect(raiseBudgetButtonLabel(6000)).toBe("Use AED 6,000 budget");
  });

  test("hasPlanningCheapestFix", () => {
    expect(hasPlanningCheapestFix({ withinBudget: false, totalAED: 1, overBudgetByAED: 1 })).toBe(
      false,
    );
    expect(
      hasPlanningCheapestFix({
        withinBudget: false,
        totalAED: 1,
        overBudgetByAED: 1,
        cheaperHotel: {},
      }),
    ).toBe(true);
  });
});
