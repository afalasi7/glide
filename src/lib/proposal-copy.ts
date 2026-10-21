/**
 * Proposal budget copy + over-budget recovery UI adapter.
 *
 * PR #6 is adding `facts.cheapestFix`:
 * `{ kind: "swap-hotel" | "swap-meal" | "drop-item" | "shorten-trip" | "raise-budget",
 *    label, savesAED, apply? }`.
 * Until that field lands we synthesize from `cheaperHotel` + local fallbacks.
 */

import { BUDGET_PRESETS_AED, addDaysIso, planTrip, type Trip } from "@/lib/planning";

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
    cheaperHotel?: {
      catalogId: string;
      title: string;
      location?: string;
      costAED?: number;
      savesAED: number;
    };
    /** PR #6 planner best fix — may be absent until that branch lands. */
    cheapestFix?: unknown;
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

export const LOWEST_PRICE_NOTICE = "This is already the lowest price I can find for these dates.";

export type CheapestFixKind =
  | "swap-hotel"
  | "swap-meal"
  | "drop-item"
  | "shorten-trip"
  | "raise-budget";

export type CheapestFixApply = {
  itemId?: string;
  optionId?: string;
  catalogId?: string;
  budgetAED?: number;
};

export type CheapestFix = {
  kind: CheapestFixKind;
  label: string;
  savesAED: number;
  apply?: CheapestFixApply;
};

const CATALOG_FIX_KINDS = new Set<CheapestFixKind>(["swap-hotel", "swap-meal", "drop-item"]);

export function isCheapestFixKind(value: unknown): value is CheapestFixKind {
  return (
    value === "swap-hotel" ||
    value === "swap-meal" ||
    value === "drop-item" ||
    value === "shorten-trip" ||
    value === "raise-budget"
  );
}

/** Narrow unknown planner payload into our typed fix (or null). */
export function parseCheapestFix(raw: unknown): CheapestFix | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isCheapestFixKind(o.kind)) return null;
  if (typeof o.label !== "string" || !o.label.trim()) return null;
  const savesAED = typeof o.savesAED === "number" && Number.isFinite(o.savesAED) ? o.savesAED : 0;
  let apply: CheapestFixApply | undefined;
  if (o.apply && typeof o.apply === "object") {
    const a = o.apply as Record<string, unknown>;
    apply = {
      itemId: typeof a.itemId === "string" ? a.itemId : undefined,
      optionId: typeof a.optionId === "string" ? a.optionId : undefined,
      catalogId: typeof a.catalogId === "string" ? a.catalogId : undefined,
      budgetAED: typeof a.budgetAED === "number" ? a.budgetAED : undefined,
    };
  }
  return { kind: o.kind, label: o.label.trim(), savesAED, apply };
}

export function catalogFixButtonLabel(fix: Pick<CheapestFix, "label" | "savesAED">): string {
  if (fix.savesAED > 0 && !/\bsave\b/i.test(fix.label)) {
    return `${fix.label} · save ${formatAed(fix.savesAED)}`;
  }
  return fix.label;
}

export function canApplyCatalogFix(
  fix: CheapestFix,
  ctx: { hotelId: string; cheaperHotelCatalogId?: string },
): boolean {
  if (!CATALOG_FIX_KINDS.has(fix.kind)) return false;
  if (fix.kind === "swap-hotel") {
    return Boolean(fix.apply?.catalogId || fix.apply?.optionId || ctx.cheaperHotelCatalogId);
  }
  if (fix.kind === "swap-meal") {
    return Boolean(fix.apply?.itemId && (fix.apply.optionId || fix.apply.catalogId));
  }
  if (fix.kind === "drop-item") {
    return Boolean(fix.apply?.itemId);
  }
  return false;
}

export function nextBudgetChip(
  budgetAED: number,
  presets: readonly number[] = BUDGET_PRESETS_AED,
): number | undefined {
  return presets.find((p) => p > budgetAED);
}

/** Next preset that covers `totalAED`, else ceil of total. */
export function budgetThatFits(
  totalAED: number,
  currentBudget: number,
  presets: readonly number[] = BUDGET_PRESETS_AED,
): number {
  const fromPreset = presets.find((p) => p >= totalAED && p > currentBudget);
  if (fromPreset != null) return fromPreset;
  return Math.max(Math.ceil(totalAED), currentBudget + 1);
}

export function setBudgetButtonLabel(budgetAED: number): string {
  return `Set budget to ${formatAed(budgetAED)}`;
}

export type ShortenInput = {
  destination: Trip["destination"];
  startDate: string;
  endDate: string;
  travellers: number;
  kids?: number;
  budgetAED: number;
  interests?: string[];
};

/** True when endDate can move one day earlier and planTrip succeeds. */
export function canShortenTripOneNight(trip: ShortenInput): boolean {
  if (trip.endDate <= trip.startDate) return false;
  const shorterEnd = addDaysIso(trip.endDate, -1);
  if (shorterEnd < trip.startDate) return false;
  try {
    planTrip({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: shorterEnd,
      travellers: trip.travellers,
      kids: trip.kids,
      budgetAED: trip.budgetAED,
      interests: trip.interests,
    });
    return true;
  } catch {
    return false;
  }
}

export function shortenTripOneNight(trip: ShortenInput): Trip | null {
  if (!canShortenTripOneNight(trip)) return null;
  const shorterEnd = addDaysIso(trip.endDate, -1);
  try {
    return planTrip({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: shorterEnd,
      travellers: trip.travellers,
      kids: trip.kids,
      budgetAED: trip.budgetAED,
      interests: trip.interests,
    });
  } catch {
    return null;
  }
}

/**
 * UI model under the over-budget line.
 * - catalogFix: one button (hotel / dinner / drop stop) from planner label
 * - noCatalogFix: Chief notice + optional shorten + set-budget (only if they work)
 */
export type OverBudgetUi =
  | {
      mode: "catalogFix";
      fix: CheapestFix;
      buttonLabel: string;
    }
  | {
      mode: "noCatalogFix";
      notice: typeof LOWEST_PRICE_NOTICE;
      shorten: boolean;
      setBudgetAED: number | null;
    };

export type AdaptOverBudgetInput = ProposalBudgetInput & {
  hotelId?: string;
  destination?: Trip["destination"];
  startDate?: string;
  endDate?: string;
  interests?: string[];
  /** Override shorten probe (tests). */
  canShorten?: boolean;
};

/**
 * Adapt planner facts (+ local fallbacks) into actionable over-budget UI.
 * Returns null when within budget.
 */
export function adaptOverBudgetUi(trip: AdaptOverBudgetInput): OverBudgetUi | null {
  if (trip.facts.withinBudget) return null;

  const fromPlanner = parseCheapestFix(trip.facts.cheapestFix);
  const ctx = {
    hotelId: trip.hotelId ?? "hotel",
    cheaperHotelCatalogId: trip.facts.cheaperHotel?.catalogId,
  };

  if (fromPlanner && CATALOG_FIX_KINDS.has(fromPlanner.kind) && canApplyCatalogFix(fromPlanner, ctx)) {
    return {
      mode: "catalogFix",
      fix: fromPlanner,
      buttonLabel: catalogFixButtonLabel(fromPlanner),
    };
  }

  // Fallback while PR #6 cheapestFix is absent: existing cheaperHotel.
  if (trip.facts.cheaperHotel) {
    const h = trip.facts.cheaperHotel;
    const fix: CheapestFix = {
      kind: "swap-hotel",
      label: `Switch to ${h.title} to save ${formatAed(h.savesAED)}.`,
      savesAED: h.savesAED,
      apply: { catalogId: h.catalogId, itemId: trip.hotelId },
    };
    return { mode: "catalogFix", fix, buttonLabel: catalogFixButtonLabel(fix) };
  }

  let setBudgetAED: number | null = null;
  if (fromPlanner?.kind === "raise-budget") {
    setBudgetAED =
      fromPlanner.apply?.budgetAED ?? budgetThatFits(trip.facts.totalAED, trip.budgetAED);
  } else {
    setBudgetAED = budgetThatFits(trip.facts.totalAED, trip.budgetAED);
  }
  if (setBudgetAED != null && setBudgetAED <= trip.budgetAED) setBudgetAED = null;

  let shorten = false;
  if (typeof trip.canShorten === "boolean") {
    shorten = trip.canShorten;
  } else if (fromPlanner?.kind === "shorten-trip") {
    shorten = true;
  } else if (trip.destination && trip.startDate && trip.endDate) {
    shorten = canShortenTripOneNight({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travellers: trip.travellers,
      kids: trip.kids,
      budgetAED: trip.budgetAED,
      interests: trip.interests,
    });
  }

  return {
    mode: "noCatalogFix",
    notice: LOWEST_PRICE_NOTICE,
    shorten,
    setBudgetAED,
  };
}
