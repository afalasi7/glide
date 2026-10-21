/**
 * Proposal budget line copy (pure — safe for unit tests and client UI).
 * Over-budget: ≤10% of budget → "a bit over"; more → "{overBy} over your {budget}".
 */

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
