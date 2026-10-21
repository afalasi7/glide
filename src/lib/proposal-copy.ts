/**
 * Proposal budget copy + over-budget recovery UI adapter.
 *
 * Aligns to PR #6 `facts.cheapestFix` (Programmer-confirmed):
 * `{ kind, label, savingAed, targetBudgetAed? }` with kinds
 * swap-hotel | swap-meal | drop-item | shorten-trip | raise-budget.
 * `cheaperHotel` remains as a fallback until/alongside cheapestFix.
 */

import { BUDGET_PRESETS_AED, addDaysIso, planTrip, type Trip } from "@/lib/planning";

export function formatAed(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}

/**
 * TODO: replace with `import type { CheapestFix, CheapestFixKind } from "@/lib/booking/client"`
 * once PR #6 pushes the browser-safe entry (re-exports from planning).
 * Local mirror kept in sync with Programmer’s confirmed shape:
 * `{ kind, label, savingAed, targetBudgetAed? }` — no `apply` / `savesAED`.
 */
export type CheapestFixKind =
  | "swap-hotel"
  | "swap-meal"
  | "drop-item"
  | "shorten-trip"
  | "raise-budget";

export type CheapestFix = {
  kind: CheapestFixKind;
  label: string;
  savingAed: number;
  targetBudgetAed?: number;
};

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
    cheapestFix?: CheapestFix | unknown;
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

/** Narrow planner `facts.cheapestFix` (accepts savingAed; ignores unknown extras). */
export function parseCheapestFix(raw: unknown): CheapestFix | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isCheapestFixKind(o.kind)) return null;
  if (typeof o.label !== "string" || !o.label.trim()) return null;

  // Confirmed field is savingAed; tolerate legacy savesAED until PR #6 is universal.
  const savingRaw = o.savingAed ?? o.savesAED;
  const savingAed =
    typeof savingRaw === "number" && Number.isFinite(savingRaw) ? savingRaw : 0;

  const targetRaw = o.targetBudgetAed ?? o.targetBudgetAED;
  const targetBudgetAed =
    typeof targetRaw === "number" && Number.isFinite(targetRaw) ? targetRaw : undefined;

  return {
    kind: o.kind,
    label: o.label.trim(),
    savingAed,
    ...(targetBudgetAed != null ? { targetBudgetAed } : {}),
  };
}

/** One catalog-fix button: Programmer label, append saving if not already in copy. */
export function catalogFixButtonLabel(fix: Pick<CheapestFix, "label" | "savingAed">): string {
  if (fix.savingAed > 0 && !/\bsave\b/i.test(fix.label)) {
    return `${fix.label} · save ${formatAed(fix.savingAed)}`;
  }
  return fix.label;
}

export function nextBudgetChip(
  budgetAED: number,
  presets: readonly number[] = BUDGET_PRESETS_AED,
): number | undefined {
  return presets.find((p) => p > budgetAED);
}

/** Next preset that covers total, else ceil(total). */
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
 * UI under the over-budget line:
 * - catalogFix: swap-hotel | swap-meal | drop-item → one labeled button
 * - shorten: shorten-trip → "Make it one night shorter"
 * - raiseBudget: raise-budget → Chief notice + "Set budget to AED {target}"
 * - noCatalogFix: no planner fix / only cheaperHotel absent → Chief notice + working shorten/set-budget
 */
export type OverBudgetUi =
  | { mode: "catalogFix"; fix: CheapestFix; buttonLabel: string }
  | { mode: "shorten"; fix?: CheapestFix }
  | {
      mode: "raiseBudget";
      notice: typeof LOWEST_PRICE_NOTICE;
      setBudgetAED: number;
      fix?: CheapestFix;
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

export function adaptOverBudgetUi(trip: AdaptOverBudgetInput): OverBudgetUi | null {
  if (trip.facts.withinBudget) return null;

  const fix = parseCheapestFix(trip.facts.cheapestFix);

  if (fix && CATALOG_FIX_KINDS.has(fix.kind)) {
    return {
      mode: "catalogFix",
      fix,
      buttonLabel: catalogFixButtonLabel(fix),
    };
  }

  if (fix?.kind === "shorten-trip") {
    const ok =
      typeof trip.canShorten === "boolean"
        ? trip.canShorten
        : trip.destination && trip.startDate && trip.endDate
          ? canShortenTripOneNight({
              destination: trip.destination,
              startDate: trip.startDate,
              endDate: trip.endDate,
              travellers: trip.travellers,
              kids: trip.kids,
              budgetAED: trip.budgetAED,
              interests: trip.interests,
            })
          : true;
    if (ok) return { mode: "shorten", fix };
    // Planner said shorten but it doesn't work — fall through to raise/no-catalog.
  }

  if (fix?.kind === "raise-budget") {
    const setBudgetAED =
      fix.targetBudgetAed ?? budgetThatFits(trip.facts.totalAED, trip.budgetAED);
    if (setBudgetAED > trip.budgetAED) {
      return {
        mode: "raiseBudget",
        notice: LOWEST_PRICE_NOTICE,
        setBudgetAED,
        fix,
      };
    }
  }

  // Fallback: existing cheaperHotel (stays even when cheapestFix lands).
  if (trip.facts.cheaperHotel) {
    const h = trip.facts.cheaperHotel;
    const synthesized: CheapestFix = {
      kind: "swap-hotel",
      label: `Switch to ${h.title} to save ${formatAed(h.savesAED)}.`,
      savingAed: h.savesAED,
    };
    return {
      mode: "catalogFix",
      fix: synthesized,
      buttonLabel: catalogFixButtonLabel(synthesized),
    };
  }

  // No planner catalog fix and no cheaperHotel — Chief line + working recovery buttons.
  let setBudgetAED: number | null = budgetThatFits(trip.facts.totalAED, trip.budgetAED);
  if (setBudgetAED <= trip.budgetAED) setBudgetAED = null;

  let shorten = false;
  if (typeof trip.canShorten === "boolean") {
    shorten = trip.canShorten;
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
