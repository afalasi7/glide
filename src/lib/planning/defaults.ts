import {
  BUDGET_PRESETS_AED,
  DEFAULT_BUDGET_AED,
  DEFAULT_TRAVELLERS,
  type PlanTripRequest,
} from "./types";

/** Next Friday on or after `from` (UTC date). If today is Friday, returns today. */
export function nextFridayIso(from = new Date()): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const day = d.getUTCDay(); // 0 Sun … 5 Fri
  const add = (5 - day + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Apply demo defaults: Ras Al Khaimah, next Fri→Sun, 2 adults, AED 3,000.
 * Dates remain fully configurable when provided.
 */
export function withPlanDefaults(request: PlanTripRequest = {}): Required<
  Pick<PlanTripRequest, "destination" | "startDate" | "endDate" | "travellers" | "budgetAED">
> &
  PlanTripRequest {
  const startDate = request.startDate ?? nextFridayIso();
  const endDate = request.endDate ?? addDaysIso(startDate, 2); // Friday → Sunday
  return {
    ...request,
    destination: request.destination ?? "ras-al-khaimah",
    startDate,
    endDate,
    travellers: request.travellers ?? DEFAULT_TRAVELLERS,
    budgetAED: request.budgetAED ?? DEFAULT_BUDGET_AED,
  };
}

export { BUDGET_PRESETS_AED, DEFAULT_BUDGET_AED, DEFAULT_TRAVELLERS };
