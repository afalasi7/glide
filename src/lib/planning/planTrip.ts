import { DESTINATIONS, getCatalogOption, resolveDestination, type CatalogOption } from "./catalog";
import { withPlanDefaults } from "./defaults";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { isOpenAt } from "./hours";
import { applyCatalogPrices, nightsBetween, timeToMinutes } from "./pricing";
import {
  clampStart,
  dayWindow,
  defaultReturnDepartMinutes,
  fitsWindow,
  isEveningDining,
  isFullDayWindow,
  isLunchOption,
  mealBandFor,
  minutesToHm,
  readyMinutes,
  transitMinutes,
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

/** Prefer flight when the destination offers one (Muscat default). */
function pickTravel(
  pool: CatalogOption[],
  interests: string[] | undefined,
  budgetPressure: number,
): CatalogOption {
  const flights = pool.filter((t) => t.mode === "flight");
  const chosen = pickBest(flights.length ? flights : pool, interests, budgetPressure);
  if (!chosen) throw new Error("empty travel catalog");
  return chosen;
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
  readyMin: number;
  returnDepartMin: number;
  travelOpt: CatalogOption;
  startDate: string;
}): number {
  const hStart = timeToMinutes(args.highlight.defaultStartTime ?? "17:00");
  const candidates: number[] = [];
  for (let d = 1; d <= args.days; d++) {
    const date = addDays(args.startDate, d - 1);
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: args.days,
      readyMin: args.readyMin,
      returnDepartMin: args.returnDepartMin,
      travelOpt: args.travelOpt,
    });
    const startHm = args.highlight.defaultStartTime ?? "17:00";
    if (hStart >= earliest && hStart <= latest && isOpenAt(args.highlight, date, startHm)) {
      candidates.push(d);
    }
  }
  if (!candidates.length) return 0;
  const full = candidates.find((d) => {
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: args.days,
      readyMin: args.readyMin,
      returnDepartMin: args.returnDepartMin,
      travelOpt: args.travelOpt,
    });
    return isFullDayWindow(earliest, latest);
  });
  return full ?? candidates[0];
}

/**
 * Build one complete proposed trip from curated destination data.
 * Defaults: Ras Al Khaimah, next Fri→Sunday, 2 adults, AED 3,000.
 */
export function planTrip(request: PlanTripRequest = {}): Trip {
  const resolved = withPlanDefaults(request);
  assertResolved(resolved);

  const destination = resolveDestination(resolved.destination);
  const catalog = DESTINATIONS[destination];
  const days = dayCount(resolved.startDate, resolved.endDate);
  if (days > 5) throw new Error("Demo planner supports trips of at most 5 days");

  const roughFloor = destination === "muscat" ? 2800 : destination === "hatta" ? 900 : 1400;
  const budgetPressure = roughFloor / resolved.budgetAED;

  const tripId = `trip_${destination.slice(0, 3)}_${Date.now().toString(36)}`;
  const travelOpt = pickTravel(catalog.travel, resolved.interests, budgetPressure);
  const hotelOpt = pickBest(catalog.hotels, resolved.interests, budgetPressure)!;

  const travel = toItem(
    travelOpt,
    `${tripId}_travel`,
    1,
    travelOpt.defaultStartTime ?? "09:00",
    refFor(travelOpt, tripId),
  );

  const readyMin = readyMinutes(travel);
  const returnDepartMin = defaultReturnDepartMinutes(travelOpt);
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

  // Check in soon after ready (flights land mid-morning; don't wait until 14:30 catalog default).
  const hotelStart = Math.max(
    readyMin + 25,
    Math.min(timeToMinutes(hotelOpt.defaultStartTime ?? "18:00"), readyMin + 90),
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
        readyMin,
        returnDepartMin,
        travelOpt,
        startDate: resolved.startDate,
      })
    : 0;

  if (highlight && highlightDay > 0) {
    usedIds.add(highlight.catalogId);
    if (highlight.area) usedAreaKeys.add(highlight.area);
  }

  const tripDays: TripDay[] = [];
  for (let d = 1; d <= days; d++) {
    const date = addDays(resolved.startDate, d - 1);
    const { earliest, latest } = dayWindow({
      dayIndex: d,
      totalDays: days,
      readyMin,
      returnDepartMin,
      travelOpt,
    });
    const fullDay = isFullDayWindow(earliest, latest);
    const lastDay = d === days && days > 1;
    const chosen: { opt: CatalogOption; start: string }[] = [];

    const campusLunch = new Set<string>();
    const campusDinner = new Set<string>();

    const available = (opt: CatalogOption) => {
      if (opt.repeatable) return true;
      if (usedIds.has(opt.catalogId)) return false;
      if (!opt.area) return true;
      if (opt.hotelCampus) {
        const band = mealBandFor(opt);
        if (band === "lunch") return !campusLunch.has(opt.area);
        if (band === "dinner") return !campusDinner.has(opt.area);
      }
      return !usedAreaKeys.has(opt.area);
    };

    const markUsed = (opt: CatalogOption) => {
      usedIds.add(opt.catalogId);
      if (!opt.area) return;
      if (opt.hotelCampus) {
        const band = mealBandFor(opt);
        if (band === "lunch") campusLunch.add(opt.area);
        else if (band === "dinner") campusDinner.add(opt.area);
        else usedAreaKeys.add(opt.area);
      } else {
        usedAreaKeys.add(opt.area);
      }
    };

    // Seed campus sets from prior days.
    for (const prev of tripDays) {
      for (const p of prev.plans) {
        const o = getCatalogOption(p.catalogId);
        if (!o?.area || !o.hotelCampus) continue;
        const band = mealBandFor(o);
        if (band === "lunch") campusLunch.add(o.area);
        if (band === "dinner") campusDinner.add(o.area);
      }
    }

    /** Natural start time — do not chain onto other picks (avoids evening "lunch"). */
    const naturalStart = (opt: CatalogOption): string | null => {
      const start = fitsWindow(opt, earliest, latest)
        ? (opt.defaultStartTime ?? "10:00")
        : clampStart(opt, earliest, latest);
      if (!start) return null;
      if (timeToMinutes(start) < earliest) return null;
      if (!isOpenAt(opt, date, start)) return null;
      return start;
    };

    const take = (opt: CatalogOption | undefined): boolean => {
      if (!opt || !available(opt)) return false;
      const start = naturalStart(opt);
      if (!start) return false;
      if (chosen.some((c) => c.opt.catalogId === opt.catalogId)) return false;
      chosen.push({ opt, start });
      markUsed(opt);
      return true;
    };

    const fitsOpen = (p: CatalogOption) => Boolean(naturalStart(p));

    // Morning first (museum / Dhayah / mosque), then highlight, lunch, dinner, afternoon.
    if (fullDay || lastDay) {
      take(
        pickBest(
          catalog.plans.filter(
            (p) =>
              p.kind === "activity" &&
              available(p) &&
              fitsOpen(p) &&
              timeToMinutes(p.defaultStartTime ?? "10:00") < 12 * 60,
          ),
          resolved.interests,
          budgetPressure,
        ),
      );
    }

    if (d === highlightDay && highlight) {
      const start = naturalStart(highlight);
      if (start) {
        chosen.push({ opt: highlight, start });
      }
    }

    // Lunch whenever the day window covers midday (arrival after morning flight, full days, departure).
    if (earliest < 14 * 60 && latest > 13 * 60) {
      take(
        pickBest(
          catalog.plans.filter((p) => isLunchOption(p) && available(p) && fitsOpen(p)),
          resolved.interests,
          budgetPressure,
        ),
      );
    }

    if (!lastDay || days === 1) {
      take(
        pickBest(
          catalog.plans.filter((p) => isEveningDining(p) && available(p) && fitsOpen(p)),
          resolved.interests,
          budgetPressure,
        ),
      );
    }

    const activityPool = () =>
      catalog.plans.filter(
        (p) =>
          p.kind === "activity" &&
          p.catalogId !== highlight?.catalogId &&
          available(p) &&
          fitsOpen(p) &&
          !chosen.some((c) => c.opt.catalogId === p.catalogId),
      );

    // Arrival / full-day afternoon filler (e.g. Qurum Beach after Friday Muscat landing).
    if (!lastDay) {
      take(
        pickBest(
          activityPool().filter((p) => {
            const t = timeToMinutes(p.defaultStartTime ?? "14:00");
            return t >= 12 * 60 && t < 18 * 60;
          }),
          resolved.interests,
          budgetPressure,
        ),
      );
    }

    if (!fullDay && !lastDay) {
      take(
        pickBest(
          activityPool().filter((p) => timeToMinutes(p.defaultStartTime ?? "18:00") >= 17 * 60),
          resolved.interests,
          budgetPressure,
        ),
      );
    }

    const target = fullDay ? 4 : lastDay ? 2 : 3;
    while (chosen.length < target) {
      const next = pickBest(activityPool(), resolved.interests, budgetPressure);
      if (!next || !take(next)) break;
    }

    // Sort, then push forward for transit / overlap while keeping opening hours.
    chosen.sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < chosen.length; i++) {
      const prev = chosen[i - 1]!;
      const cur = chosen[i]!;
      const need =
        timeToMinutes(prev.start) +
        (prev.opt.durationMin ?? 60) +
        transitMinutes(prev.opt, cur.opt);
      let startMin = timeToMinutes(cur.start);
      if (startMin < need) startMin = need;
      if (startMin > latest) {
        chosen.splice(i, 1);
        i -= 1;
        continue;
      }
      const hm = minutesToHm(startMin);
      if (!isOpenAt(cur.opt, date, hm)) {
        chosen.splice(i, 1);
        i -= 1;
        continue;
      }
      cur.start = hm;
    }

    // Close gaps > 3h.
    let guard = 0;
    while (guard++ < 6) {
      let inserted = false;
      const anchorEnd =
        d === 1 ? hotelStart + (hotelOpt.durationMin ?? 40) : earliest;
      const sequence: { start: number; end: number; opt?: CatalogOption }[] = [
        { start: d === 1 ? readyMin : earliest, end: d === 1 ? readyMin : earliest },
      ];
      if (d === 1) {
        sequence.push({
          start: hotelStart,
          end: hotelStart + (hotelOpt.durationMin ?? 40),
        });
      }
      for (const c of chosen) {
        const s = timeToMinutes(c.start);
        sequence.push({ start: s, end: s + (c.opt.durationMin ?? 60), opt: c.opt });
      }
      sequence.sort((a, b) => a.start - b.start);

      for (let i = 0; i < sequence.length - 1; i++) {
        const a = sequence[i]!;
        const b = sequence[i + 1]!;
        const gap = b.start - a.end;
        if (gap <= 180) continue;
        const slotEarliest = a.end + 15;
        const slotLatest = b.start - 20;
        if (slotLatest - slotEarliest < 40) continue;
        const startInSlot = (p: CatalogOption): string | null => {
          // Gap-fill may retime within the hole (not limited to ±90 min of default).
          let start = Math.max(slotEarliest, timeToMinutes(p.defaultStartTime ?? "10:00"));
          if (start > slotLatest) start = slotEarliest;
          if (start > slotLatest) return null;
          const hm = minutesToHm(start);
          if (!isOpenAt(p, date, hm)) return null;
          const end = start + (p.durationMin ?? 60);
          if (end > slotLatest + 30) return null;
          return hm;
        };
        const fillerCandidates = catalog.plans.filter((p) => {
          if (!available(p)) return false;
          if (chosen.some((c) => c.opt.catalogId === p.catalogId)) return false;
          if (p.kind !== "activity") return false;
          return Boolean(startInSlot(p));
        });
        const filler = pickBest(fillerCandidates, resolved.interests, budgetPressure);
        if (!filler) continue;
        const start = startInSlot(filler);
        if (!start) continue;
        chosen.push({ opt: filler, start });
        markUsed(filler);
        chosen.sort((x, y) => x.start.localeCompare(y.start));
        inserted = true;
        break;
      }
      void anchorEnd;
      if (!inserted) break;
    }

    chosen.sort((a, b) => a.start.localeCompare(b.start));
    const plans = chosen.map((c, i) =>
      toItem(c.opt, `${tripId}_d${d}_p${i}`, d, c.start, refFor(c.opt, tripId)),
    );
    tripDays.push({ day: d, date, plans });
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
