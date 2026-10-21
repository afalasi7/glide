import type { CatalogOption } from "./catalog";
import { timeToMinutes } from "./pricing";

/** Matches `Date#getUTCDay()` / local calendar day indexing. */
export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const WEEKDAY_LONG: Record<Weekday, string> = {
  sun: "Sundays",
  mon: "Mondays",
  tue: "Tuesdays",
  wed: "Wednesdays",
  thu: "Thursdays",
  fri: "Fridays",
  sat: "Saturdays",
};

export type OpenWindow = { open: string; close: string };

/** Normalize single or split opening windows. */
export function openWindows(
  openHours: OpenWindow | OpenWindow[] | undefined,
): OpenWindow[] {
  if (!openHours) return [];
  return Array.isArray(openHours) ? openHours : [openHours];
}

export function weekdayFromIsoDate(iso: string): Weekday {
  const d = new Date(`${iso}T12:00:00Z`);
  return WEEKDAYS[d.getUTCDay()]!;
}

/** True when every child age is allowed (≥ minAge). Omitted minAge = no restriction. */
export function isAgeAllowed(
  opt: Pick<CatalogOption, "minAge">,
  childrenAges: number[] | undefined,
): boolean {
  if (opt.minAge == null) return true;
  if (!childrenAges?.length) return true;
  return childrenAges.every((age) => age >= opt.minAge!);
}

/**
 * Pick a legal start time for venues with fixed tour slots.
 * Prefers `preferredHm` when it is an exact slot; otherwise the earliest slot
 * that fits the day window and opening hours.
 */
export function resolveStartTime(
  opt: Pick<CatalogOption, "startSlots" | "defaultStartTime" | "durationMin" | "openDays" | "openHours">,
  dateIso: string,
  preferredHm: string | undefined,
  earliest: number,
  latest: number,
): string | null {
  const candidates =
    opt.startSlots && opt.startSlots.length > 0
      ? [...opt.startSlots]
      : [preferredHm ?? opt.defaultStartTime ?? "10:00"];

  const ranked = [...candidates].sort((a, b) => {
    if (preferredHm && a === preferredHm) return -1;
    if (preferredHm && b === preferredHm) return 1;
    return timeToMinutes(a) - timeToMinutes(b);
  });

  for (const hm of ranked) {
    const start = timeToMinutes(hm);
    if (start < earliest || start > latest) continue;
    if (!isOpenAt(opt, dateIso, hm)) continue;
    return hm;
  }
  return null;
}

/** True when the venue is open for a visit starting at `startHm` on `dateIso`. */
export function isOpenAt(
  opt: Pick<CatalogOption, "openDays" | "openHours" | "durationMin" | "startSlots">,
  dateIso: string,
  startHm: string,
): boolean {
  const day = weekdayFromIsoDate(dateIso);
  if (opt.openDays && opt.openDays.length > 0 && !opt.openDays.includes(day)) {
    return false;
  }
  if (opt.startSlots && opt.startSlots.length > 0) {
    if (!opt.startSlots.includes(startHm)) return false;
  }
  const windows = openWindows(opt.openHours);
  if (!windows.length) return true;
  const start = timeToMinutes(startHm);
  const end = start + (opt.durationMin ?? 60);
  for (const w of windows) {
    const open = timeToMinutes(w.open);
    const close = timeToMinutes(w.close);
    // Must start at/after open and finish by close (small slack for dining).
    if (start >= open && end <= close + 15) return true;
  }
  return false;
}

export interface ClosedInfo {
  /** User-facing sentence, e.g. "Dhayah Fort is closed on Sundays." */
  message: string;
  /** Internal machine code, e.g. "closed on sun (2026-10-25)". */
  code: string;
}

export function closedInfo(
  opt: Pick<CatalogOption, "title" | "openDays" | "openHours" | "startSlots">,
  dateIso: string,
  startHm: string,
): ClosedInfo {
  const day = weekdayFromIsoDate(dateIso);
  if (opt.openDays && opt.openDays.length > 0 && !opt.openDays.includes(day)) {
    return {
      message: `${opt.title} is closed on ${WEEKDAY_LONG[day]}.`,
      code: `closed on ${day} (${dateIso})`,
    };
  }
  if (opt.startSlots && opt.startSlots.length > 0 && !opt.startSlots.includes(startHm)) {
    return {
      message: `${opt.title} only starts at ${opt.startSlots.join(", ")}.`,
      code: `slot ${startHm} not in [${opt.startSlots.join(",")}] (${dateIso})`,
    };
  }
  const windows = openWindows(opt.openHours);
  if (windows.length) {
    const ranges = windows.map((w) => `${w.open}–${w.close}`).join(", ");
    return {
      message: `${opt.title} is closed at ${startHm}.`,
      code: `closed at ${startHm} (open ${ranges} on ${dateIso})`,
    };
  }
  return {
    message: `${opt.title} is not available at ${startHm}.`,
    code: `unavailable at ${startHm} on ${dateIso}`,
  };
}

/** @deprecated Prefer closedInfo().message — kept for call sites that want a string. */
export function closedReason(
  opt: Pick<CatalogOption, "title" | "openDays" | "openHours" | "startSlots">,
  dateIso: string,
  startHm: string,
): string {
  return closedInfo(opt, dateIso, startHm).message;
}
