import type { CatalogOption } from "./catalog";
import { timeToMinutes } from "./pricing";

/** Matches `Date#getUTCDay()` / local calendar day indexing. */
export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function weekdayFromIsoDate(iso: string): Weekday {
  const d = new Date(`${iso}T12:00:00Z`);
  return WEEKDAYS[d.getUTCDay()]!;
}

/** True when the venue is open for a visit starting at `startHm` on `dateIso`. */
export function isOpenAt(
  opt: Pick<CatalogOption, "openDays" | "openHours" | "durationMin" | "title">,
  dateIso: string,
  startHm: string,
): boolean {
  const day = weekdayFromIsoDate(dateIso);
  if (opt.openDays && opt.openDays.length > 0 && !opt.openDays.includes(day)) {
    return false;
  }
  if (!opt.openHours) return true;
  const start = timeToMinutes(startHm);
  const open = timeToMinutes(opt.openHours.open);
  const close = timeToMinutes(opt.openHours.close);
  const end = start + (opt.durationMin ?? 60);
  // Must start at/after open and finish by close (small slack for dining).
  if (start < open) return false;
  if (end > close + 15) return false;
  return true;
}

export function closedReason(
  opt: Pick<CatalogOption, "title" | "openDays" | "openHours">,
  dateIso: string,
  startHm: string,
): string {
  const day = weekdayFromIsoDate(dateIso);
  if (opt.openDays && !opt.openDays.includes(day)) {
    return `${opt.title} is closed on ${day} (${dateIso})`;
  }
  if (opt.openHours) {
    return `${opt.title} is closed at ${startHm} (open ${opt.openHours.open}–${opt.openHours.close} on ${dateIso})`;
  }
  return `${opt.title} is not available at ${startHm} on ${dateIso}`;
}
