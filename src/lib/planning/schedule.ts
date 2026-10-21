import { getCatalogOption, type CatalogOption } from "./catalog";
import { closedReason, isOpenAt } from "./hours";
import { timeToMinutes } from "./pricing";
import type { Trip, TripItem } from "./types";

export const MAX_GAP_MINUTES = 3 * 60;

export function minutesToHm(total: number): string {
  const t = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(t / 60)).padStart(2, "0");
  const mm = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Landing/arrival wall-clock (before hotel transfer). */
export function arrivalMinutes(travel: Pick<TripItem, "startTime" | "durationMin" | "catalogId">): number {
  return timeToMinutes(travel.startTime) + (travel.durationMin ?? 0);
}

/** Ready for hotel / first activity = arrival + airport or border transfer. */
export function readyMinutes(travel: Pick<TripItem, "startTime" | "durationMin" | "catalogId">): number {
  const opt = getCatalogOption(travel.catalogId);
  return arrivalMinutes(travel) + (opt?.transferMin ?? 0);
}

/** Last-day homebound departure (wall-clock minutes). */
export function defaultReturnDepartMinutes(
  travelOpt?: Pick<CatalogOption, "defaultStartTime" | "mode" | "transferMin">,
): number {
  // Flights / morning outbound → mid-afternoon return so day 3 still has lunch.
  if (travelOpt?.mode === "flight") return 15 * 60;
  if (travelOpt?.defaultStartTime) {
    const outbound = timeToMinutes(travelOpt.defaultStartTime);
    if (outbound < 12 * 60) return 15 * 60;
    return outbound;
  }
  return 14 * 60;
}

/** Latest plan start on departure day: leave for airport/drive before return. */
export function departureLatestMinutes(
  returnDepartMin: number,
  travelOpt?: Pick<CatalogOption, "transferMin" | "mode">,
): number {
  const buffer = travelOpt?.transferMin ?? (travelOpt?.mode === "flight" ? 40 : 0);
  return Math.max(8 * 60, returnDepartMin - buffer);
}

export function dayWindow(args: {
  dayIndex: number;
  totalDays: number;
  readyMin: number;
  returnDepartMin: number;
  travelOpt?: Pick<CatalogOption, "transferMin" | "mode">;
}): { earliest: number; latest: number } {
  const { dayIndex, totalDays, readyMin, returnDepartMin, travelOpt } = args;
  const depLatest = departureLatestMinutes(returnDepartMin, travelOpt);
  if (dayIndex === 1 && totalDays === 1) {
    return { earliest: readyMin, latest: depLatest };
  }
  if (dayIndex === 1) {
    return { earliest: readyMin, latest: 22 * 60 };
  }
  if (dayIndex === totalDays) {
    return { earliest: 8 * 60, latest: depLatest };
  }
  return { earliest: 8 * 60, latest: 22 * 60 };
}

export function isFullDayWindow(earliest: number, latest: number): boolean {
  return earliest <= 9 * 60 && latest >= 18 * 60;
}

export function isLunchOption(opt: CatalogOption): boolean {
  if (opt.kind !== "dining") return false;
  const start = timeToMinutes(opt.defaultStartTime ?? "12:00");
  return start >= 11 * 60 && start < 16 * 60;
}

export function isEveningDining(opt: CatalogOption): boolean {
  if (opt.kind !== "dining") return false;
  return timeToMinutes(opt.defaultStartTime ?? "19:00") >= 17 * 60;
}

export function fitsWindow(opt: CatalogOption, earliest: number, latest: number): boolean {
  const start = timeToMinutes(opt.defaultStartTime ?? "10:00");
  const end = start + (opt.durationMin ?? 60);
  return start >= earliest && end <= latest + 30;
}

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

/** Drive minutes between zones (Al Wadi desert ↔ coast/city needs a real buffer). */
export function transitMinutes(from?: CatalogOption, to?: CatalogOption): number {
  if (!from || !to) return 15;
  if (from.hotelCampus && from.hotelCampus === to.hotelCampus) return 10;
  if (from.area && from.area === to.area) return 10;
  const a = from.zone;
  const b = to.zone;
  if (!a || !b || a === b) return 20;
  if (
    (a === "desert" || b === "desert") &&
    (a === "coast" || b === "coast" || a === "city" || b === "city" || a === "mountain" || b === "mountain")
  ) {
    return 45;
  }
  if (a === "mountain" || b === "mountain") return 35;
  if (a === "airport" || b === "airport") return 40;
  return 25;
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

/**
 * Areas already claimed. Hotel-campus restaurants only block the same meal
 * band (lunch vs dinner) — lunch at Kaheela and dinner at Farmhouse is allowed.
 */
export function usedAreas(
  trip: Trip,
  opts?: { mealBand?: "lunch" | "dinner" | "any" },
): Set<string> {
  const band = opts?.mealBand ?? "any";
  const areas = new Set<string>();
  for (const d of trip.days) {
    for (const p of d.plans) {
      const opt = getCatalogOption(p.catalogId);
      if (!opt?.area) continue;
      if (band !== "any" && opt.hotelCampus) {
        const itemBand = isLunchOption(opt) ? "lunch" : isEveningDining(opt) ? "dinner" : "any";
        if (itemBand !== band && itemBand !== "any") continue;
      }
      areas.add(opt.area);
    }
  }
  return areas;
}

export function mealBandFor(opt: CatalogOption): "lunch" | "dinner" | "any" {
  if (isLunchOption(opt)) return "lunch";
  if (isEveningDining(opt)) return "dinner";
  return "any";
}

export function isOptionAvailable(
  opt: CatalogOption,
  usedIds: Set<string>,
  usedAreaKeys: Set<string>,
  freeing?: { catalogId?: string; area?: string },
): boolean {
  if (opt.repeatable) return true;
  if (usedIds.has(opt.catalogId) && opt.catalogId !== freeing?.catalogId) return false;
  if (opt.area && usedAreaKeys.has(opt.area) && opt.area !== freeing?.area) return false;
  return true;
}

/** Option can be placed at date+start within the day window and opening hours. */
export function canScheduleOn(
  opt: CatalogOption,
  dateIso: string,
  startHm: string,
  earliest: number,
  latest: number,
): boolean {
  const start = timeToMinutes(startHm);
  if (start < earliest || start > latest) return false;
  return isOpenAt(opt, dateIso, startHm);
}

export function assertNoClosedVenues(trip: Trip): void {
  for (const day of trip.days) {
    for (const p of day.plans) {
      const opt = getCatalogOption(p.catalogId);
      if (!opt) throw new Error(`Unknown catalog ${p.catalogId}`);
      if (!isOpenAt(opt, day.date, p.startTime)) {
        throw new Error(closedReason(opt, day.date, p.startTime));
      }
    }
  }
}

export function assertMaxGaps(trip: Trip): void {
  const ready = readyMinutes(trip.travel);
  for (const day of trip.days) {
    const events: { start: number; end: number; label: string }[] = [];
    if (day.day === 1) {
      events.push({ start: ready, end: ready, label: "arrival-ready" });
      const hotelStart = timeToMinutes(trip.hotel.startTime);
      events.push({
        start: hotelStart,
        end: hotelStart + (trip.hotel.durationMin ?? 40),
        label: trip.hotel.title,
      });
    }
    for (const p of day.plans) {
      const start = timeToMinutes(p.startTime);
      events.push({
        start,
        end: start + (p.durationMin ?? 60),
        label: p.title,
      });
    }
    events.sort((a, b) => a.start - b.start);
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].start - events[i - 1].end;
      if (gap > MAX_GAP_MINUTES) {
        throw new Error(
          `Day ${day.day}: ${gap} min gap between ${events[i - 1].label} and ${events[i].label}`,
        );
      }
    }
  }
}

export function assertScheduleInvariants(trip: Trip): void {
  const ready = readyMinutes(trip.travel);
  const travelOpt = getCatalogOption(trip.travel.catalogId);
  const returnMin = trip.returnTravel
    ? timeToMinutes(trip.returnTravel.startTime)
    : defaultReturnDepartMinutes(travelOpt);
  const totalDays = trip.days.length;
  const seenIds = new Set<string>();
  const seenAreasLunch = new Set<string>();
  const seenAreasDinner = new Set<string>();
  const seenAreasOther = new Set<string>();

  for (const day of trip.days) {
    for (let i = 1; i < day.plans.length; i++) {
      if (day.plans[i].startTime < day.plans[i - 1].startTime) {
        throw new Error(`Day ${day.day} plans are not in time order`);
      }
    }
    for (const p of day.plans) {
      const start = timeToMinutes(p.startTime);
      if (day.day === 1 && start < ready) {
        throw new Error(`${p.title} starts before arrival-ready on day 1`);
      }
      if (day.day === totalDays && trip.returnTravel) {
        const latest = departureLatestMinutes(returnMin, travelOpt);
        if (start >= latest && start >= returnMin) {
          throw new Error(`${p.title} starts after return departure`);
        }
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
      if (opt?.area && !opt.repeatable) {
        const band = mealBandFor(opt);
        const bucket =
          opt.hotelCampus && band === "lunch"
            ? seenAreasLunch
            : opt.hotelCampus && band === "dinner"
              ? seenAreasDinner
              : seenAreasOther;
        // Non-campus areas always go in Other; campus lunch/dinner are separate.
        if (!opt.hotelCampus) {
          if (seenAreasOther.has(opt.area) || seenAreasLunch.has(opt.area) || seenAreasDinner.has(opt.area)) {
            throw new Error(`Duplicate area ${opt.area}`);
          }
          seenAreasOther.add(opt.area);
        } else if (bucket.has(opt.area)) {
          throw new Error(`Duplicate area ${opt.area}`);
        } else {
          bucket.add(opt.area);
        }
      }
    }
  }

  assertNoClosedVenues(trip);
  assertMaxGaps(trip);
}
