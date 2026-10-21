import { DESTINATIONS, resolveDestination, type CatalogOption } from "./catalog";
import { withPlanDefaults } from "./defaults";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { applyCatalogPrices, nightsBetween, timeToMinutes } from "./pricing";
import {
  arrivalMinutes,
  clampStart,
  dayWindow,
  defaultReturnDepartMinutes,
  fitsWindow,
  isEveningDining,
  isFullDayWindow,
  isLunchOption,
  isOptionAvailable,
  minutesToHm,
} from "./schedule";
import type { DestinationId, PlanTripRequest, Trip, TripDay, TripItem } from "./types";

function assertResolved(req: ReturnType<typeof withPlanDefaults>): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.startDate)) throw new Error("startDate must be YYYY-MM-DD");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.endDate)) throw new Error("endDate must be YYYY-MM-DD");
  if (!Number.isInteger(req.travellers) || req.travellers < 1 || req.travellers > 12) {
    throw new Error("travellers must be an integer from 1 to 12");
  }
  if (req.kids !== undefined && (!Number.isInteger(req.kids) || req.kids < 0 || req.kids > 12)) {
    throw new Error("kids must be an integer from 0 to 12");
  }
  if (!Number.isFinite(req.budgetAED) || req.budgetAED <= 0) {
    throw new Error("budgetAED must be a positive number");
  }
  nightsBetween(req.startDate, req.endDate);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayCount(start: string, end: string): number {
  return nightsBetween(start, end) + 1;
}

function scoreOption(opt: CatalogOption, interests: string[] | undefined, budgetPressure: number): number {
  let score = 0;
  if (interests?.length && opt.tags?.length) {
    for (const tag of opt.tags) {
      if (interests.some((i) => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase()))) {
        score += 3;
      }
    }
  }
  score -= (opt.costAED / 500) * budgetPressure;
  return score;
}

function pickBest(
  pool: CatalogOption[],
  interests: string[] | undefined,
  budgetPressure: number,
): CatalogOption | undefined {
  if (!pool.length) return undefined;
  return [...pool].sort(
    (a, b) => scoreOption(b, interests, budgetPressure) - scoreOption(a, interests, budgetPressure),
  )[0];
}

function toItem(
  opt: CatalogOption,
  id: string,
  day: number,
  startTime: string,
  bookingRef?: string,
): TripItem {
  const end = opt.durationMin
    ? (() => {
        const [h, m] = startTime.split(":").map(Number);
        const total = h * 60 + m + opt.durationMin;
        return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })()
    : undefined;
  return {
    id,
    catalogId: opt.catalogId,
    kind: opt.kind,
    title: opt.title,
    location: opt.location,
    day,
    startTime,
    endTime: end,
    costAED: opt.costAED,
    photo: opt.photo,
    bookingRef,
    mode: opt.mode,
    durationMin: opt.durationMin,
    notes: opt.notes,
  };
}

function refFor(opt: CatalogOption, tripId: string): string | undefined {
  if (opt.kind === "hotel") return `HTL-${tripId.slice(-6).toUpperCase()}`;
  if (opt.kind === "dining") return `DIN-${tripId.slice(-6).toUpperCase()}`;
  if (opt.kind === "travel" && opt.mode === "flight") return `FLT-${tripId.slice(-6).toUpperCase()}`;
  return undefined;
}

function pickHighlightDay(args: {
  highlight: CatalogOption;
  days: number;
  arrivalMin: number;
  returnDepartMin: number;
}): number {
  const hStart = timeToMinutes(args.highlight.defaultStartTime ?? "17:00");
  const candidates: number[] = [];
  for (let d = 1; d <= args.days; d++) {
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: args.days,
      arrivalMin: args.arrivalMin,
      returnDepartMin: args.returnDepartMin,
    });
    if (hStart >= earliest && hStart <= latest) candidates.push(d);
  }
  if (!candidates.length) return 0;
  // Prefer a full day (not arrival evening / departure morning) when possible.
  const full = candidates.find((d) => {
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: args.days,
      arrivalMin: args.arrivalMin,
      returnDepartMin: args.returnDepartMin,
    });
    return isFullDayWindow(earliest, latest);
  });
  return full ?? candidates[0];
}

/**
 * Build one complete proposed trip from curated destination data.
 * Defaults: Ras Al Khaimah, next Fri→Sunday, 2 adults, AED 3,000.
 *
 * Schedule rules:
 * - Day 1 plans start at/after arrival (departure + drive/flight).
 * - Last day plans end before the return departure.
 * - Each non-repeatable venue/area appears at most once; meals rotate.
 * - Full days and the departure day get a lunch slot.
 * - Destination highlight sits on a full day inside its time window.
 */
export function planTrip(request: PlanTripRequest = {}): Trip {
  const resolved = withPlanDefaults(request);
  assertResolved(resolved);

  const destination = resolveDestination(resolved.destination);
  const catalog = DESTINATIONS[destination];
  const days = dayCount(resolved.startDate, resolved.endDate);
  if (days > 5) throw new Error("Demo planner supports trips of at most 5 days");

  const roughFloor = destination === "muscat" ? 1800 : destination === "hatta" ? 900 : 1400;
  const budgetPressure = roughFloor / resolved.budgetAED;

  const tripId = `trip_${destination.slice(0, 3)}_${Date.now().toString(36)}`;
  const travelOpt = pickBest(catalog.travel, resolved.interests, budgetPressure)!;
  const hotelOpt = pickBest(catalog.hotels, resolved.interests, budgetPressure)!;

  const travel = toItem(
    travelOpt,
    `${tripId}_travel`,
    1,
    travelOpt.defaultStartTime ?? "09:00",
    refFor(travelOpt, tripId),
  );

  const arrivalMin = arrivalMinutes(travel);
  const returnDepartMin = defaultReturnDepartMinutes(travelOpt.defaultStartTime);
  // Return uses the same route catalog (outbound option) in reverse for pricing.
  const returnTravel =
    days > 1
      ? toItem(
          travelOpt,
          `${tripId}_return`,
          days,
          minutesToHm(returnDepartMin),
          refFor(travelOpt, tripId),
        )
      : undefined;

  const hotelStart = Math.max(
    timeToMinutes(hotelOpt.defaultStartTime ?? "18:00"),
    arrivalMin + 15,
  );
  const hotel = toItem(
    hotelOpt,
    `${tripId}_hotel`,
    1,
    minutesToHm(hotelStart),
    refFor(hotelOpt, tripId),
  );

  const usedIds = new Set<string>([travel.catalogId, hotel.catalogId]);
  const usedAreaKeys = new Set<string>();
  const highlight = catalog.plans.find((p) => p.catalogId === catalog.highlight.catalogId);
  const highlightDay = highlight
    ? pickHighlightDay({
        highlight,
        days,
        arrivalMin,
        returnDepartMin,
      })
    : 0;

  // Reserve the highlight venue/area up front so earlier days' dinners cannot
  // steal Mutrah / Hatta Dam / Jebel Jais before the highlight day is filled.
  if (highlight && highlightDay > 0) {
    usedIds.add(highlight.catalogId);
    if (highlight.area) usedAreaKeys.add(highlight.area);
  }

  const tripDays: TripDay[] = [];
  for (let d = 1; d <= days; d++) {
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: days,
      arrivalMin,
      returnDepartMin,
    });
    const fullDay = isFullDayWindow(earliest, latest);
    const lastDay = d === days && days > 1;
    const chosen: { opt: CatalogOption; start: string }[] = [];

    const available = (opt: CatalogOption) => isOptionAvailable(opt, usedIds, usedAreaKeys);

    const take = (opt: CatalogOption | undefined): boolean => {
      if (!opt) return false;
      if (!available(opt)) return false;
      const start = fitsWindow(opt, earliest, latest)
        ? (opt.defaultStartTime ?? "10:00")
        : clampStart(opt, earliest, latest);
      if (!start) return false;
      let startMin = timeToMinutes(start);
      while (chosen.some((c) => timeToMinutes(c.start) === startMin)) {
        startMin += 30;
      }
      if (startMin > latest) return false;
      chosen.push({ opt, start: minutesToHm(startMin) });
      usedIds.add(opt.catalogId);
      if (opt.area) usedAreaKeys.add(opt.area);
      return true;
    };

    const fits = (p: CatalogOption) =>
      fitsWindow(p, earliest, latest) || Boolean(clampStart(p, earliest, latest));

    if (d === highlightDay && highlight) {
      // Already reserved in usedIds/usedAreaKeys — force-add without re-checking availability.
      const start = fitsWindow(highlight, earliest, latest)
        ? (highlight.defaultStartTime ?? "17:00")
        : clampStart(highlight, earliest, latest);
      if (start) {
        chosen.push({ opt: highlight, start });
      }
    }

    // Lunch on every full day and on the departure day (before the drive home).
    if (fullDay || lastDay || days === 1) {
      const lunchPool = catalog.plans.filter(
        (p) => isLunchOption(p) && available(p) && fits(p),
      );
      take(pickBest(lunchPool, resolved.interests, budgetPressure));
    }

    // Evening dinner on nights that are not the departure morning.
    if (!lastDay || days === 1) {
      const dinnerPool = catalog.plans.filter(
        (p) => isEveningDining(p) && available(p) && fits(p),
      );
      take(pickBest(dinnerPool, resolved.interests, budgetPressure));
    }

    const activityPool = () =>
      catalog.plans.filter(
        (p) =>
          p.kind === "activity" &&
          p.catalogId !== highlight?.catalogId &&
          available(p) &&
          fits(p) &&
          !chosen.some((c) => c.opt.catalogId === p.catalogId),
      );

    // Prefer a morning city/culture stop on full days (avoids re-visiting the highlight area).
    if (fullDay || lastDay) {
      const morning = pickBest(
        activityPool().filter((p) => timeToMinutes(p.defaultStartTime ?? "10:00") < 12 * 60),
        resolved.interests,
        budgetPressure,
      );
      take(morning);
    }

    // Arrival evening: one light activity if time allows.
    if (!fullDay && !lastDay) {
      const eveningAct = pickBest(
        activityPool().filter((p) => timeToMinutes(p.defaultStartTime ?? "18:00") >= 17 * 60),
        resolved.interests,
        budgetPressure,
      );
      take(eveningAct);
    }

    // Full days: morning + lunch + highlight/act + dinner when the catalog allows.
    const target = fullDay ? 4 : lastDay ? 2 : 2;
    while (chosen.length < target) {
      const next = pickBest(activityPool(), resolved.interests, budgetPressure);
      if (!next) break;
      if (!take(next)) break;
    }

    chosen.sort((a, b) => a.start.localeCompare(b.start));
    const plans = chosen.map((c, i) =>
      toItem(c.opt, `${tripId}_d${d}_p${i}`, d, c.start, refFor(c.opt, tripId)),
    );
    tripDays.push({ day: d, date: addDays(resolved.startDate, d - 1), plans });
  }

  let trip: Trip = {
    id: tripId,
    destination,
    destinationLabel: catalog.label,
    startDate: resolved.startDate,
    endDate: resolved.endDate,
    travellers: resolved.travellers,
    kids: resolved.kids,
    budgetAED: resolved.budgetAED,
    interests: resolved.interests,
    travel,
    returnTravel,
    hotel,
    days: tripDays,
    totalCostAED: 0,
    facts: {
      withinBudget: true,
      totalAED: 0,
      overBudgetByAED: 0,
    },
    status: "proposed",
    graph: { rootId: travel.id, nodes: {}, edges: [], travel: {} },
    createdAt: new Date().toISOString(),
  };

  trip = applyCatalogPrices(trip);
  trip = syncTripGraph(trip);
  trip = withFacts(trip);
  return trip;
}

export type { DestinationId };
