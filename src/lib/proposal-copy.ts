/**
 * Proposal budget line copy + over-budget recovery action (pure).
 * Over-budget: ≤10% of budget → "a bit over"; more → "{overBy} over your {budget}".
 */

import { BUDGET_PRESETS_AED } from "@/lib/planning";

export function formatAed(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}

export type ProposalBudgetInput = {
  budgetAED: number;
  travellers: number;
  kids?: number;
  facts: {
    withinBudget: boolean;
    totalAED: number;
    overBudgetByAED: number;
    /** Present when planning suggests a cheaper hotel swap. */
    cheaperHotel?: unknown;
    /** Reserved if PR #6 later exposes a generic cheapest fix. */
    cheapestFix?: unknown;
    suggestions?: unknown;
  };
};

/** Budget line under the proposal display heading (no CTA in this string). */
export function proposalBudgetLine(trip: ProposalBudgetInput): string {
  const total = formatAed(trip.facts.totalAED);
  const people = trip.travellers + (trip.kids ?? 0);
  if (trip.facts.withinBudget) {
    return `It comes to ${total} for ${people}, within your budget.`;
  }
  const overBy = trip.facts.overBudgetByAED;
  const budget = trip.budgetAED;
  if (overBy <= budget * 0.1) {
    return `This comes to ${total}, a bit over your ${formatAed(budget)}.`;
  }
  return `${formatAed(overBy)} over your ${formatAed(budget)}.`;
}

/**
 * What to show under the over-budget line. Never null when over budget —
 * there is always a next step.
 */
export type OverBudgetRecovery =
  | { kind: "cheaperHotel" }
  | { kind: "raiseBudget"; nextBudgetAED: number }
  | { kind: "changeDetailsOnly" };

export function hasPlanningCheapestFix(facts: ProposalBudgetInput["facts"]): boolean {
  if (facts.cheaperHotel) return true;
  if (facts.cheapestFix) return true;
  if (Array.isArray(facts.suggestions) && facts.suggestions.length > 0) return true;
  return false;
}

/** Next budget preset strictly above current, or undefined at the top chip. */
export function nextBudgetChip(
  budgetAED: number,
  presets: readonly number[] = BUDGET_PRESETS_AED,
): number | undefined {
  return presets.find((p) => p > budgetAED);
}

export function overBudgetRecovery(
  trip: Pick<ProposalBudgetInput, "budgetAED" | "facts">,
  presets: readonly number[] = BUDGET_PRESETS_AED,
): OverBudgetRecovery | null {
  if (trip.facts.withinBudget) return null;
  if (hasPlanningCheapestFix(trip.facts)) return { kind: "cheaperHotel" };
  const next = nextBudgetChip(trip.budgetAED, presets);
  if (next != null) return { kind: "raiseBudget", nextBudgetAED: next };
  return { kind: "changeDetailsOnly" };
}

export function raiseBudgetButtonLabel(nextBudgetAED: number): string {
  return `Use ${formatAed(nextBudgetAED)} budget`;
}
