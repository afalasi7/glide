/**
 * Start-step destination default budget + Muscat air hint.
 *
 * TODO: replace local mirrors with imports from `@/lib/booking/client` once PR #6
 * pushes `defaultBudgetFor`, `DESTINATION_DEFAULT_BUDGET_AED`, and
 * `muscatAirBudgetCopy` (also re-exported from planning).
 */

import {
  BUDGET_PRESETS_AED,
  DEFAULT_BUDGET_AED,
  planTrip,
  type DestinationId,
  type PlanTripRequest,
} from "@/lib/planning";

/** Mirror of PR #6 `DESTINATION_DEFAULT_BUDGET_AED`. */
export const DESTINATION_DEFAULT_BUDGET_AED: Record<DestinationId, number> = {
  "ras-al-khaimah": 3000,
  muscat: 6000,
  hatta: 3000,
};

export function resolveDestinationId(
  destination: DestinationId | string | undefined,
): DestinationId {
  if (!destination) return "ras-al-khaimah";
  const e = destination.trim().toLowerCase().replace(/\s+/g, "-");
  if (e === "rak" || e.includes("khaimah") || e === "ras-al-khaimah") return "ras-al-khaimah";
  if (e.includes("muscat") || e === "mct" || e === "oman") return "muscat";
  if (e.includes("hatta")) return "hatta";
  return "ras-al-khaimah";
}

/** Destination default budget (Muscat 6000; RAK and Hatta 3000). */
export function defaultBudgetFor(destination: DestinationId | string | undefined): number {
  const id = resolveDestinationId(destination);
  return DESTINATION_DEFAULT_BUDGET_AED[id] ?? DEFAULT_BUDGET_AED;
}

/** Chief copy under budget chips — matches PR #6 `muscatAirBudgetCopy`. */
export function muscatAirBudgetCopy(cheapestTotalAed: number): string {
  return `Muscat by air starts around AED ${Math.round(cheapestTotalAed)} for two.`;
}

export function muscatAirBudgetCopyFor(
  destination: DestinationId | string | undefined,
  cheapestTotalAed: number,
): string | undefined {
  if (resolveDestinationId(destination) !== "muscat") return undefined;
  return muscatAirBudgetCopy(cheapestTotalAed);
}

/**
 * When the user picks a destination on Start: set that destination's default
 * budget unless they already changed the budget chip manually.
 */
export function applyDestinationDefaultBudget(
  request: PlanTripRequest,
  nextDestination: DestinationId,
  opts: { budgetManual: boolean },
): PlanTripRequest {
  if (opts.budgetManual) {
    return { ...request, destination: nextDestination };
  }
  return {
    ...request,
    destination: nextDestination,
    budgetAED: defaultBudgetFor(nextDestination),
  };
}

/** Prefer planner `facts.cheapestTotalAed` when PR #6 lands; else value-tier total. */
export function resolveCheapestTotalAed(request: PlanTripRequest): number {
  const destination = resolveDestinationId(request.destination);
  try {
    const trip = planTrip({
      destination,
      startDate: request.startDate,
      endDate: request.endDate,
      travellers: request.travellers ?? 2,
      kids: request.kids,
      children: request.children,
      interests: request.interests,
      budgetAED: BUDGET_PRESETS_AED[0],
    });
    const fromFacts = (trip.facts as { cheapestTotalAed?: number }).cheapestTotalAed;
    if (typeof fromFacts === "number" && Number.isFinite(fromFacts) && fromFacts > 0) {
      return fromFacts;
    }
    return trip.facts.totalAED;
  } catch {
    return defaultBudgetFor(destination);
  }
}

/** Small plain line under budget chips when Muscat is selected; otherwise null. */
export function muscatBudgetChipHint(request: PlanTripRequest): string | null {
  const destination = resolveDestinationId(request.destination);
  if (destination !== "muscat") return null;
  return muscatAirBudgetCopy(resolveCheapestTotalAed(request));
}
