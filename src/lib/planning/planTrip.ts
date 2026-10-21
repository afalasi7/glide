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
  isFullDayWindow,
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
 * - Each non-repeatable venue appears at most once; meals rotate.
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

  const used = new Set<string>([travel.catalogId, hotel.catalogId]);
  const highlight = catalog.plans.find((p) => p.catalogId === catalog.highlight.catalogId);
  const highlightDay = highlight
    ? pickHighlightDay({
        highlight,
        days,
        arrivalMin,
        returnDepartMin,
      })
    : 0;

  const tripDays: TripDay[] = [];
  for (let d = 1; d <= days; d++) {
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: days,
      arrivalMin,
      returnDepartMin,
    });
    const chosen: { opt: CatalogOption; start: string }[] = [];

    const available = (opt: CatalogOption) => !used.has(opt.catalogId) || Boolean(opt.repeatable);

    const take = (opt: CatalogOption | undefined) => {
      if (!opt) return;
      if (!available(opt)) return;
      // Prefer natural fit; allow a small clamp (≤90 min) via clampStart.
      const start = fitsWindow(opt, earliest, latest)
        ? (opt.defaultStartTime ?? "10:00")
        : clampStart(opt, earliest, latest);
      if (!start) return;
      // Avoid stacking two items at the exact same minute.
      let startMin = timeToMinutes(start);
      while (chosen.some((c) => timeToMinutes(c.start) === startMin)) {
        startMin += 30;
      }
      if (startMin > latest) return;
      chosen.push({ opt, start: minutesToHm(startMin) });
      used.add(opt.catalogId);
    };

    if (d === highlightDay && highlight) {
      take(highlight);
    }

    const diningPool = catalog.plans.filter((p) => p.kind === "dining" && available(p));
    const activityPool = catalog.plans.filter(
      (p) =>
        p.kind === "activity" &&
        p.catalogId !== highlight?.catalogId &&
        available(p),
    );

    // Last day: skip evening dinner (leave before evening). Prefer evening venues
    // on other days so lunch options stay available for departure mornings.
    if (d < days || days === 1) {
      const fitsDining = (p: CatalogOption) =>
        fitsWindow(p, earliest, latest) || clampStart(p, earliest, latest);
      const evening = diningPool.filter(
        (p) =>
          fitsDining(p) && timeToMinutes(p.defaultStartTime ?? "19:00") >= 17 * 60,
      );
      const dinner = pickBest(
        evening.length ? evening : diningPool.filter(fitsDining),
        resolved.interests,
        budgetPressure,
      );
      take(dinner);
    }

    // Target: 2 plans on arrival/departure, up to 3 on full middle days.
    const target = isFullDayWindow(earliest, latest) ? 3 : 2;
    while (chosen.length < target) {
      const next = pickBest(
        activityPool.filter(
          (p) =>
            !chosen.some((c) => c.opt.catalogId === p.catalogId) &&
            (fitsWindow(p, earliest, latest) || clampStart(p, earliest, latest)),
        ),
        resolved.interests,
        budgetPressure,
      );
      if (!next) break;
      take(next);
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
