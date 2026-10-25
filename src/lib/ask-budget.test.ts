import { describe, expect, test } from "bun:test";
import {
  DESTINATION_DEFAULT_BUDGET_AED,
  applyDestinationDefaultBudget,
  defaultBudgetFor,
  muscatAirBudgetCopy,
  muscatBudgetChipHint,
  resolveDestinationId,
} from "./ask-budget";

describe("defaultBudgetFor — per-destination Start defaults", () => {
  test("RAK and Hatta → 3000, Muscat → 6000", () => {
    expect(defaultBudgetFor("ras-al-khaimah")).toBe(3000);
    expect(defaultBudgetFor("hatta")).toBe(3000);
    expect(defaultBudgetFor("muscat")).toBe(6000);
    expect(DESTINATION_DEFAULT_BUDGET_AED.muscat).toBe(6000);
  });

  test("resolves loose destination labels", () => {
    expect(resolveDestinationId("RAK")).toBe("ras-al-khaimah");
    expect(resolveDestinationId("Muscat")).toBe("muscat");
    expect(defaultBudgetFor("Muscat")).toBe(6000);
  });
});

describe("applyDestinationDefaultBudget", () => {
  test("preselects destination default when budget not touched manually", () => {
    const next = applyDestinationDefaultBudget(
      { destination: "ras-al-khaimah", budgetAED: 3000, travellers: 2 },
      "muscat",
      { budgetManual: false },
    );
    expect(next.destination).toBe("muscat");
    expect(next.budgetAED).toBe(6000);
  });

  test("switching away from Muscat restores RAK default when not manual", () => {
    const next = applyDestinationDefaultBudget(
      { destination: "muscat", budgetAED: 6000, travellers: 2 },
      "hatta",
      { budgetManual: false },
    );
    expect(next.destination).toBe("hatta");
    expect(next.budgetAED).toBe(3000);
  });

  test("keeps user-chosen budget when budgetManual", () => {
    const next = applyDestinationDefaultBudget(
      { destination: "ras-al-khaimah", budgetAED: 1500, travellers: 2 },
      "muscat",
      { budgetManual: true },
    );
    expect(next.destination).toBe("muscat");
    expect(next.budgetAED).toBe(1500);
  });
});

describe("muscatAirBudgetCopy / chip hint", () => {
  test("formats Chief line with thousands separators", () => {
    expect(muscatAirBudgetCopy(5210)).toBe("Muscat by air starts around AED 5,210 for two.");
    expect(muscatAirBudgetCopy(5330)).toBe("Muscat by air starts around AED 5,330 for two.");
  });

  test("hint only when Muscat selected", () => {
    expect(muscatBudgetChipHint({ destination: "ras-al-khaimah" })).toBeNull();
    const hint = muscatBudgetChipHint({
      destination: "muscat",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      travellers: 2,
    });
    expect(hint).toMatch(/^Muscat by air starts around AED [\d,]+ for two\.$/);
    expect(hint).toContain(",");
  });
});
