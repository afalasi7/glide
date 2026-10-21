import { getCatalogOption, type CatalogOption, type HotelTier } from "./catalog";
import { closedReason, isAgeAllowed, isOpenAt } from "./hours";
import { timeToMinutes } from "./pricing";
import type { Trip, TripItem } from "./types";

export const MAX_GAP_MINUTES = 3 * 60;
/** Full days should have a plan ending near dinner time. */
export const FULL_DAY_EVENING_ANCHOR = 20 * 60;

/** Map trip budget to the lodging tier the planner should prefer. */
export function hotelTierForBudget(budgetAED: number): HotelTier {
  if (budgetAED <= 1500) return "value";
  if (budgetAED <= 3000) return "mid";
  return "luxury";
}

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
  if (opt.startSlots?.length) {
    return opt.startSlots.some((hm) => {
      const start = timeToMinutes(hm);
      const end = start + (opt.durationMin ?? 60);
      return start >= earliest && end <= latest + 30;
    });
  }
  const start = timeToMinutes(opt.defaultStartTime ?? "10:00");
  const end = start + (opt.durationMin ?? 60);
  return start >= earliest && end <= latest + 30;
}

export function clampStart(opt: CatalogOption, earliest: number, latest: number): string | null {
  if (opt.startSlots?.length) {
    // Date-agnostic: pick the earliest slot that fits the day window.
    for (const hm of [...opt.startSlots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b))) {
      const start = timeToMinutes(hm);
      const end = start + (opt.durationMin ?? 60);
      if (start >= earliest && start <= latest && end <= latest + 45) return hm;
    }
    return null;
  }
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
  // Named long hops with realistic buffers.
  const pair = new Set([from.area, to.area]);
  if (pair.has("suwaidi-pearls") && (pair.has("al-hamra-yacht-club") || pair.has("al-hamra-corniche"))) {
    return 35;
  }
  if (pair.has("suwaidi-pearls") && pair.has("rak-national-museum")) return 40;
  if (pair.has("al-hamra-yacht-club") && pair.has("rak-national-museum")) return 30;
  if (pair.has("rak-national-museum") && pair.has("jebel-jais")) return 55;
  if (pair.has("jebel-jais") && (from.zone === "coast" || to.zone === "coast")) return 50;
  if (pair.has("jebel-jais") && (from.zone === "desert" || to.zone === "desert")) return 45;
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

export function partyChildrenAges(trip: Pick<Trip, "children" | "kids">): number[] | undefined {
  if (trip.children?.length) return trip.children;
  return undefined;
}

/** Venue is allowed for this party (age gate). */
export function passesAgeGate(
  opt: CatalogOption,
  childrenAges: number[] | undefined,
): boolean {
  return isAgeAllowed(opt, childrenAges);
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

function dayEvents(
  trip: Trip,
  day: Trip["days"][number],
): { start: number; end: number; label: string; opt?: CatalogOption }[] {
  const ready = readyMinutes(trip.travel);
  const travelOpt = getCatalogOption(trip.travel.catalogId);
  const returnMin = trip.returnTravel
    ? timeToMinutes(trip.returnTravel.startTime)
    : defaultReturnDepartMinutes(travelOpt);
  const totalDays = trip.days.length;
  const { earliest, latest } = dayWindow({
    dayIndex: day.day,
    totalDays,
    readyMin: ready,
    returnDepartMin: returnMin,
    travelOpt,
  });

  const events: { start: number; end: number; label: string; opt?: CatalogOption }[] = [];
  if (day.day === 1) {
    events.push({ start: ready, end: ready, label: "arrival-ready" });
    const hotelStart = timeToMinutes(trip.hotel.startTime);
    const hotelOpt = getCatalogOption(trip.hotel.catalogId);
    events.push({
      start: hotelStart,
      end: hotelStart + (trip.hotel.durationMin ?? 40),
      label: trip.hotel.title,
      opt: hotelOpt,
    });
  } else {
    events.push({ start: earliest, end: earliest, label: "day-start" });
  }
  for (const p of day.plans) {
    const start = timeToMinutes(p.startTime);
    events.push({
      start,
      end: start + (p.durationMin ?? 60),
      label: p.title,
      opt: getCatalogOption(p.catalogId),
    });
  }
  events.sort((a, b) => a.start - b.start || a.end - b.end);

  const fullDay = isFullDayWindow(earliest, latest);
  const lastDay = day.day === totalDays && totalDays > 1;
  if (fullDay && !lastDay) {
    const lastPlanEnd = day.plans.reduce((max, p) => {
      const end = timeToMinutes(p.startTime) + (p.durationMin ?? 60);
      return Math.max(max, end);
    }, 0);
    // Only require an evening anchor when the day would otherwise end before dinner.
    if (lastPlanEnd < 18 * 60) {
      events.push({
        start: FULL_DAY_EVENING_ANCHOR,
        end: FULL_DAY_EVENING_ANCHOR,
        label: "evening-anchor-20:00",
      });
    }
  }
  if (lastDay && trip.returnTravel) {
    const dep = timeToMinutes(trip.returnTravel.startTime);
    events.push({ start: dep, end: dep, label: "departure" });
  }
  events.sort((a, b) => a.start - b.start || a.end - b.end);
  return events;
}

export function assertMaxGaps(trip: Trip): void {
  for (const day of trip.days) {
    const events = dayEvents(trip, day);
    for (let i = 1; i < events.length; i++) {
      const gap = events[i]!.start - events[i - 1]!.end;
      if (gap > MAX_GAP_MINUTES) {
        throw new Error(
          `Day ${day.day}: ${gap} min gap between ${events[i - 1]!.label} and ${events[i]!.label}`,
        );
      }
    }
  }
}

/** No two timed items may overlap, including hotel check-in and travel buffers. */
export function assertNoOverlaps(trip: Trip): void {
  for (const day of trip.days) {
    const events = dayEvents(trip, day).filter(
      (e) => e.label !== "arrival-ready" && e.label !== "day-start" && e.label !== "evening-anchor-20:00" && e.label !== "departure",
    );
    for (let i = 1; i < events.length; i++) {
      const prev = events[i - 1]!;
      const cur = events[i]!;
      const need = prev.end + transitMinutes(prev.opt, cur.opt);
      if (cur.start < need) {
        throw new Error(
          `Day ${day.day}: ${cur.label} at ${minutesToHm(cur.start)} overlaps ${prev.label} (needs ${minutesToHm(need)} with transit)`,
        );
      }
    }
  }
}

export function assertFullDaysHaveDinner(trip: Trip): void {
  const ready = readyMinutes(trip.travel);
  const travelOpt = getCatalogOption(trip.travel.catalogId);
  const returnMin = trip.returnTravel
    ? timeToMinutes(trip.returnTravel.startTime)
    : defaultReturnDepartMinutes(travelOpt);
  for (const day of trip.days) {
    const { earliest, latest } = dayWindow({
      dayIndex: day.day,
      totalDays: trip.days.length,
      readyMin: ready,
      returnDepartMin: returnMin,
      travelOpt,
    });
    if (!isFullDayWindow(earliest, latest)) continue;
    if (day.day === trip.days.length && trip.days.length > 1) continue;
    const hasDinner = day.plans.some((p) => {
      const opt = getCatalogOption(p.catalogId);
      return Boolean(opt && isEveningDining(opt));
    });
    if (!hasDinner) {
      throw new Error(`Day ${day.day} is a full day but has no dinner`);
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
  assertNoOverlaps(trip);
  assertFullDaysHaveDinner(trip);
}
