import { describe, expect, test } from "bun:test";
import { formatAed, proposalBudgetLine } from "./proposal-copy";

function trip(partial: {
  budgetAED: number;
  totalAED: number;
  overBudgetByAED: number;
  withinBudget?: boolean;
  travellers?: number;
  kids?: number;
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
    // 300 over 3000 = 10%
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
    // 740 over 3000 ≈ 24.7%
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3740, overBudgetByAED: 740 })),
    ).toBe("AED 740 over your AED 3,000.");
  });

  test("just over 10% threshold uses overBy form", () => {
    // 301 / 3000 > 10%
    expect(
      proposalBudgetLine(trip({ budgetAED: 3000, totalAED: 3301, overBudgetByAED: 301 })),
    ).toBe("AED 301 over your AED 3,000.");
  });

  test("formatAed rounds and localizes", () => {
    expect(formatAed(1500)).toBe("AED 1,500");
  });
});
