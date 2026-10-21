import { getCatalogOption, type CatalogOption } from "./catalog";
import { timeToMinutes } from "./pricing";
import type { Trip, TripItem } from "./types";

export function minutesToHm(total: number): string {
  const t = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(t / 60)).padStart(2, "0");
  const mm = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function arrivalMinutes(travel: Pick<TripItem, "startTime" | "durationMin">): number {
  return timeToMinutes(travel.startTime) + (travel.durationMin ?? 0);
}

/** Last-day homebound departure (wall-clock minutes). */
export function defaultReturnDepartMinutes(destTravelDefault?: string): number {
  // Prefer mid-afternoon so the last day still has a morning + lunch window.
  // Morning outbound times (typical flights) must not become an 08:40 return.
  if (destTravelDefault) {
    const outbound = timeToMinutes(destTravelDefault);
    if (outbound < 12 * 60) return 15 * 60;
    return outbound;
  }
  return 14 * 60;
}

export function dayWindow(args: {
  dayIndex: number;
  totalDays: number;
  arrivalMin: number;
  returnDepartMin: number;
}): { earliest: number; latest: number } {
  const { dayIndex, totalDays, arrivalMin, returnDepartMin } = args;
  if (dayIndex === 1 && totalDays === 1) {
    return { earliest: arrivalMin, latest: returnDepartMin };
  }
  if (dayIndex === 1) {
    return { earliest: arrivalMin, latest: 22 * 60 };
  }
  if (dayIndex === totalDays) {
    return { earliest: 8 * 60, latest: returnDepartMin };
  }
  return { earliest: 8 * 60, latest: 22 * 60 };
}

/** True when the day window opens by mid-morning and runs through evening. */
export function isFullDayWindow(earliest: number, latest: number): boolean {
  return earliest <= 9 * 60 && latest >= 18 * 60;
}

export function isLunchOption(opt: CatalogOption): boolean {
  if (opt.kind !== "dining") return false;
  const start = timeToMinutes(opt.defaultStartTime ?? "12:00");
  return start >= 11 * 60 && start < 15 * 60;
}

export function isEveningDining(opt: CatalogOption): boolean {
  if (opt.kind !== "dining") return false;
  return timeToMinutes(opt.defaultStartTime ?? "19:00") >= 17 * 60;
}

export function fitsWindow(opt: CatalogOption, earliest: number, latest: number): boolean {
  const start = timeToMinutes(opt.defaultStartTime ?? "10:00");
  const end = start + (opt.durationMin ?? 60);
  return start >= earliest && end <= latest + 30; // small slack for dining end
}

/**
 * Prefer the catalog default time. Only bump forward within 90 minutes so a
 * morning activity is never rescheduled into the evening on arrival day.
 */
export function clampStart(opt: CatalogOption, earliest: number, latest: number): string | null {
  const preferred = timeToMinutes(opt.defaultStartTime ?? "10:00");
  let start = preferred;
  if (start < earliest) {
    if (earliest - preferred > 90) return null;
    start = earliest;
  }
  const end = start + (opt.durationMin ?? 60);
  if (start > latest || end > latest + 45) return null;
  return minutesToHm(start);
}

export function usedCatalogIds(trip: Trip): Set<string> {
  const ids = new Set<string>();
  ids.add(trip.travel.catalogId);
  ids.add(trip.hotel.catalogId);
  if (trip.returnTravel) ids.add(trip.returnTravel.catalogId);
  for (const d of trip.days) {
    for (const p of d.plans) ids.add(p.catalogId);
  }
  return ids;
}

/** Areas already claimed by plan items on the trip. */
export function usedAreas(trip: Trip): Set<string> {
  const areas = new Set<string>();
  for (const d of trip.days) {
    for (const p of d.plans) {
      const opt = getCatalogOption(p.catalogId);
      if (opt?.area) areas.add(opt.area);
    }
  }
  return areas;
}

/** True when this option can be added without duplicating a catalog id or area. */
export function isOptionAvailable(
  opt: CatalogOption,
  usedIds: Set<string>,
  usedAreaKeys: Set<string>,
  /** Catalog id being replaced (swap) — its id/area are treated as free. */
  freeing?: { catalogId?: string; area?: string },
): boolean {
  if (opt.repeatable) return true;
  if (usedIds.has(opt.catalogId) && opt.catalogId !== freeing?.catalogId) return false;
  if (opt.area && usedAreaKeys.has(opt.area) && opt.area !== freeing?.area) return false;
  return true;
}

export function assertScheduleInvariants(trip: Trip): void {
  const arrival = arrivalMinutes(trip.travel);
  const returnMin = trip.returnTravel
    ? timeToMinutes(trip.returnTravel.startTime)
    : defaultReturnDepartMinutes();
  const totalDays = trip.days.length;
  const seenIds = new Set<string>();
  const seenAreas = new Set<string>();

  for (const day of trip.days) {
    for (let i = 1; i < day.plans.length; i++) {
      if (day.plans[i].startTime < day.plans[i - 1].startTime) {
        throw new Error(`Day ${day.day} plans are not in time order`);
      }
    }
    for (const p of day.plans) {
      const start = timeToMinutes(p.startTime);
      if (day.day === 1 && start < arrival) {
        throw new Error(`${p.title} starts before arrival on day 1`);
      }
      if (day.day === totalDays && trip.returnTravel && start >= returnMin) {
        throw new Error(`${p.title} starts after return departure`);
      }
    }
  }

  for (const day of trip.days) {
    for (const p of day.plans) {
      const opt = getCatalogOption(p.catalogId);
      if (seenIds.has(p.catalogId) && !opt?.repeatable) {
        throw new Error(`Duplicate venue ${p.catalogId}`);
      }
      seenIds.add(p.catalogId);
      if (opt?.area && seenAreas.has(opt.area) && !opt.repeatable) {
        throw new Error(`Duplicate area ${opt.area}`);
      }
      if (opt?.area) seenAreas.add(opt.area);
    }
  }
}
