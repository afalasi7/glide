import { DESTINATIONS, getCatalogOption, resolveDestination, type CatalogOption } from "./catalog";
import { withPlanDefaults } from "./defaults";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { isAgeAllowed, isOpenAt, resolveStartTime } from "./hours";
import { applyCatalogPrices, nightsBetween, timeToMinutes } from "./pricing";
import {
  clampStart,
  dayWindow,
  defaultReturnDepartMinutes,
  fitsWindow,
  hotelTierForBudget,
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
  if (req.children !== undefined) {
    if (!Array.isArray(req.children) || req.children.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) {
      throw new Error("children must be an array of ages 0–17");
    }
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

function scoreOption(
  opt: CatalogOption,
  interests: string[] | undefined,
  budgetPressure: number,
  hotelCampus?: string,
): number {
  let score = 0;
  if (interests?.length && opt.tags?.length) {
    for (const tag of opt.tags) {
      if (interests.some((i) => i.toLowerCase().includes(tag) || tag.includes(i.toLowerCase()))) {
        score += 3;
      }
    }
  }
  score -= (opt.costAED / 500) * budgetPressure;
  if (budgetPressure >= 1 && opt.tags?.includes("value")) score += 2;
  if (budgetPressure >= 1 && opt.tags?.includes("luxury")) score -= 4;
  // Prefer on-campus dining when staying at that resort (e.g. Café Gazebo at JA Hatta Fort).
  if (hotelCampus && opt.hotelCampus === hotelCampus) score += 2;
  return score;
}

function pickBest(
  pool: CatalogOption[],
  interests: string[] | undefined,
  budgetPressure: number,
  hotelCampus?: string,
): CatalogOption | undefined {
  if (!pool.length) return undefined;
  return [...pool].sort(
    (a, b) =>
      scoreOption(b, interests, budgetPressure, hotelCampus) -
      scoreOption(a, interests, budgetPressure, hotelCampus),
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

function pickHotel(
  pool: CatalogOption[],
  budgetAED: number,
  interests: string[] | undefined,
  budgetPressure: number,
): CatalogOption {
  const tier = hotelTierForBudget(budgetAED);
  const byTier = (t: string) => pool.filter((h) => (h.hotelTier ?? "mid") === t);
  const tiered =
    byTier(tier).length > 0
      ? byTier(tier)
      : tier === "luxury"
        ? byTier("mid").length
          ? byTier("mid")
          : pool
        : tier === "value"
          ? byTier("mid").length
            ? byTier("mid")
            : pool
          : pool;
  // At luxury tier prefer the most expensive remaining; otherwise score normally.
  const chosen =
    tier === "luxury" && tiered.length
      ? [...tiered].sort((a, b) => b.costAED - a.costAED)[0]
      : pickBest(tiered, interests, budgetPressure);
  if (!chosen) throw new Error("empty hotel catalog");
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

/**
 * Provider booking refs. Dining must be unique per catalog row — a shared
 * `DIN-{trip}` key made MockWorld overwrite every meal with the last seating.
 */
function refFor(opt: CatalogOption, tripId: string): string | undefined {
  const base = tripId.slice(-6).toUpperCase();
  if (opt.kind === "hotel") return `HTL-${base}`;
  if (opt.kind === "dining") {
    const tag = opt.catalogId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
    return `DIN-${base}-${tag}`;
  }
  if (opt.kind === "travel" && opt.mode === "flight") return `FLT-${base}`;
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

type Chosen = { opt: CatalogOption; start: string };

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

  const childrenAges = resolved.children;
  const roughFloor = destination === "muscat" ? 2800 : destination === "hatta" ? 900 : 1400;
  const budgetPressure = roughFloor / resolved.budgetAED;

  const tripId = `trip_${destination.slice(0, 3)}_${Date.now().toString(36)}`;
  const travelOpt = pickTravel(catalog.travel, resolved.interests, budgetPressure);
  const hotelOpt = pickHotel(catalog.hotels, resolved.budgetAED, resolved.interests, budgetPressure);
  const hotelCampus = hotelOpt.hotelCampus;
  const pick = (pool: CatalogOption[]) =>
    pickBest(pool, resolved.interests, budgetPressure, hotelCampus);

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
  const hotelEnd = hotelStart + (hotelOpt.durationMin ?? 40);

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

  const ageOk = (opt: CatalogOption) => isAgeAllowed(opt, childrenAges);

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
    const chosen: Chosen[] = [];

    const campusLunch = new Set<string>();
    const campusDinner = new Set<string>();

    const available = (opt: CatalogOption) => {
      if (!ageOk(opt)) return false;
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

    const naturalStart = (opt: CatalogOption, prefer?: string): string | null => {
      if (opt.startSlots?.length) {
        return resolveStartTime(opt, date, prefer ?? opt.defaultStartTime, earliest, latest);
      }
      const start = fitsWindow(opt, earliest, latest)
        ? (prefer ?? opt.defaultStartTime ?? "10:00")
        : clampStart(opt, earliest, latest);
      if (!start) return null;
      if (timeToMinutes(start) < earliest) return null;
      if (!isOpenAt(opt, date, start)) return null;
      return start;
    };

    const take = (opt: CatalogOption | undefined, prefer?: string): boolean => {
      if (!opt || !available(opt)) return false;
      const start = naturalStart(opt, prefer);
      if (!start) return false;
      if (chosen.some((c) => c.opt.catalogId === opt.catalogId)) return false;
      chosen.push({ opt, start });
      markUsed(opt);
      return true;
    };

    const fitsOpen = (p: CatalogOption) => Boolean(naturalStart(p));

    // RAK Saturday (full day): Suwaidi 10:00 → marina lunch → museum afternoon → Jais 17:15 → dinner.
    const rakSaturday =
      destination === "ras-al-khaimah" && fullDay && !lastDay && d === highlightDay;

    if (rakSaturday) {
      const suwaidi = catalog.plans.find((p) => p.catalogId === "rak-suwaidi-pearls");
      const marina = catalog.plans.find((p) => p.catalogId === "rak-lunch-marina");
      const museum = catalog.plans.find((p) => p.catalogId === "rak-national-museum");
      take(suwaidi, "10:00");
      if (marina && available(marina)) {
        const afterSuwaidi = chosen.find((c) => c.opt.catalogId === "rak-suwaidi-pearls");
        let lunchAt = marina.defaultStartTime ?? "12:30";
        if (afterSuwaidi) {
          const readyLunch =
            timeToMinutes(afterSuwaidi.start) +
            (afterSuwaidi.opt.durationMin ?? 150) +
            transitMinutes(afterSuwaidi.opt, marina);
          lunchAt = minutesToHm(Math.max(readyLunch, timeToMinutes(lunchAt)));
        }
        if (isOpenAt(marina, date, lunchAt) && timeToMinutes(lunchAt) <= latest) {
          chosen.push({ opt: marina, start: lunchAt });
          markUsed(marina);
        }
      }
      if (museum && available(museum)) {
        const prev = chosen[chosen.length - 1];
        let museumAt = "14:30";
        if (prev) {
          const readyMus =
            timeToMinutes(prev.start) +
            (prev.opt.durationMin ?? 60) +
            transitMinutes(prev.opt, museum);
          museumAt = minutesToHm(Math.max(readyMus, timeToMinutes("14:00")));
        }
        if (isOpenAt(museum, date, museumAt) && timeToMinutes(museumAt) <= latest) {
          chosen.push({ opt: museum, start: museumAt });
          markUsed(museum);
        }
      }
      if (highlight && d === highlightDay) {
        const start = naturalStart(highlight, highlight.defaultStartTime ?? "17:15");
        if (start && !chosen.some((c) => c.opt.catalogId === highlight.catalogId)) {
          chosen.push({ opt: highlight, start });
        }
      }
      take(pick(catalog.plans.filter((p) => isEveningDining(p) && available(p) && fitsOpen(p))));
    } else {
      const highlightIsMorning =
        Boolean(highlight) &&
        timeToMinutes(highlight!.defaultStartTime ?? "17:00") < 12 * 60;

      // Place morning highlight first so we do not also consume the only other morning slot.
      if (d === highlightDay && highlight && highlightIsMorning) {
        const start = naturalStart(highlight);
        if (start && !chosen.some((c) => c.opt.catalogId === highlight.catalogId)) {
          chosen.push({ opt: highlight, start });
        }
      }

      // Morning first (museum / Dhayah / mosque / dam viewpoint). Skip when the
      // highlight already filled the morning so Day 3 still has a morning option.
      const hasMorningActivity = chosen.some(
        (c) => c.opt.kind === "activity" && timeToMinutes(c.start) < 12 * 60,
      );
      if ((fullDay || lastDay) && !hasMorningActivity) {
        take(
          pick(
            catalog.plans.filter(
              (p) =>
                p.kind === "activity" &&
                available(p) &&
                fitsOpen(p) &&
                timeToMinutes(p.defaultStartTime ?? "10:00") < 12 * 60,
            ),
          ),
        );
      }

      if (d === highlightDay && highlight && !highlightIsMorning) {
        const start = naturalStart(highlight);
        if (start && !chosen.some((c) => c.opt.catalogId === highlight.catalogId)) {
          chosen.push({ opt: highlight, start });
        }
      }

      // Lunch whenever the day window covers midday.
      if (earliest < 14 * 60 && latest > 13 * 60) {
        take(pick(catalog.plans.filter((p) => isLunchOption(p) && available(p) && fitsOpen(p))));
      }

      if (!lastDay || days === 1) {
        take(pick(catalog.plans.filter((p) => isEveningDining(p) && available(p) && fitsOpen(p))));
      }

      const activityPool = (opts?: { morning?: boolean; afternoon?: boolean }) =>
        catalog.plans.filter((p) => {
          if (p.kind !== "activity") return false;
          if (p.catalogId === highlight?.catalogId) return false;
          if (!available(p) || !fitsOpen(p)) return false;
          if (chosen.some((c) => c.opt.catalogId === p.catalogId)) return false;
          const t = timeToMinutes(p.defaultStartTime ?? "14:00");
          if (opts?.morning === false && t < 12 * 60) return false;
          if (opts?.afternoon && (t < 12 * 60 || t >= 18 * 60)) return false;
          return true;
        });

      if (!lastDay) {
        take(pick(activityPool({ afternoon: true })));
      }

      if (!fullDay && !lastDay) {
        take(
          pick(
            activityPool().filter((p) => timeToMinutes(p.defaultStartTime ?? "18:00") >= 17 * 60),
          ),
        );
      }

      // Full days always get dinner (arrival day may already have one).
      if (fullDay && !lastDay) {
        const hasDinner = chosen.some((c) => isEveningDining(c.opt));
        if (!hasDinner) {
          take(pick(catalog.plans.filter((p) => isEveningDining(p) && available(p) && fitsOpen(p))));
        }
      }

      const morningFilled = chosen.some(
        (c) => c.opt.kind === "activity" && timeToMinutes(c.start) < 12 * 60,
      );
      const target = fullDay ? 4 : lastDay ? 2 : 3;
      while (chosen.length < target) {
        // Do not steal Day 3's morning options when this day already has one.
        const next = pick(activityPool({ morning: morningFilled ? false : undefined }));
        if (!next || !take(next)) break;
      }
    }

    const resolveOverlaps = (): void => {
      chosen.sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 0; i < chosen.length; i++) {
        const cur = chosen[i]!;
        let minStart = earliest;
        if (d === 1) {
          // Never overlap hotel check-in (include transit from hotel).
          minStart = Math.max(minStart, hotelEnd + transitMinutes(hotelOpt, cur.opt));
        }
        if (i > 0) {
          const prev = chosen[i - 1]!;
          minStart = Math.max(
            minStart,
            timeToMinutes(prev.start) +
              (prev.opt.durationMin ?? 60) +
              transitMinutes(prev.opt, cur.opt),
          );
        }

        let startMin = timeToMinutes(cur.start);
        if (cur.opt.startSlots?.length) {
          const slot = resolveStartTime(cur.opt, date, cur.start, minStart, latest);
          if (!slot) {
            chosen.splice(i, 1);
            i -= 1;
            continue;
          }
          startMin = timeToMinutes(slot);
        } else if (startMin < minStart) {
          startMin = minStart;
        }

        if (startMin > latest) {
          chosen.splice(i, 1);
          i -= 1;
          continue;
        }
        const hm = minutesToHm(startMin);
        if (!isOpenAt(cur.opt, date, hm)) {
          if (cur.opt.startSlots?.length) {
            const later = resolveStartTime(cur.opt, date, undefined, startMin + 1, latest);
            if (later && isOpenAt(cur.opt, date, later)) {
              cur.start = later;
              continue;
            }
          }
          // Dinner: if pushed too late for hours, drop; otherwise try keeping preferred when open.
          chosen.splice(i, 1);
          i -= 1;
          continue;
        }
        cur.start = hm;
      }
    };

    resolveOverlaps();

    // Close gaps > 3h.
    let guard = 0;
    while (guard++ < 6) {
      let inserted = false;
      const sequence: { start: number; end: number; opt?: CatalogOption }[] = [
        { start: d === 1 ? readyMin : earliest, end: d === 1 ? readyMin : earliest },
      ];
      if (d === 1) {
        sequence.push({
          start: hotelStart,
          end: hotelEnd,
          opt: hotelOpt,
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
          if (p.startSlots?.length) {
            return resolveStartTime(p, date, p.defaultStartTime, slotEarliest, slotLatest);
          }
          // Prefer natural default when it falls in the hole; otherwise start at hole open.
          let start = timeToMinutes(p.defaultStartTime ?? "10:00");
          if (start < slotEarliest || start > slotLatest) start = slotEarliest;
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
          // Only skip true early-morning defaults for late-afternoon holes.
          const def = timeToMinutes(p.defaultStartTime ?? "14:00");
          if (slotEarliest >= 14 * 60 && def < 9 * 60) return false;
          return Boolean(startInSlot(p));
        });
        // Prefer fillers whose natural default sits in the hole.
        const ranked = [...fillerCandidates].sort((a, b) => {
          const aDef = timeToMinutes(a.defaultStartTime ?? "14:00");
          const bDef = timeToMinutes(b.defaultStartTime ?? "14:00");
          const aFit = aDef >= slotEarliest && aDef <= slotLatest ? 0 : 1;
          const bFit = bDef >= slotEarliest && bDef <= slotLatest ? 0 : 1;
          if (aFit !== bFit) return aFit - bFit;
          return bDef - aDef;
        });
        const filler = ranked[0] ?? pick(fillerCandidates);
        if (!filler) continue;
        const start = startInSlot(filler);
        if (!start) continue;
        chosen.push({ opt: filler, start });
        markUsed(filler);
        chosen.sort((x, y) => x.start.localeCompare(y.start));
        inserted = true;
        break;
      }
      if (!inserted) break;
    }

    // Gap-fill inserts can land on top of neighbors — resolve again.
    resolveOverlaps();

    // If a long hole remains before dinner, pull dinner earlier — but never before
    // 18:00 for evening dining (all-day kitchens still serve dinner in the evening).
    chosen.sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < chosen.length; i++) {
      const prev = chosen[i - 1]!;
      const cur = chosen[i]!;
      if (!isEveningDining(cur.opt)) continue;
      const prevEnd = timeToMinutes(prev.start) + (prev.opt.durationMin ?? 60);
      const gap = timeToMinutes(cur.start) - prevEnd;
      if (gap <= 180) continue;
      const afterPrev = prevEnd + transitMinutes(prev.opt, cur.opt);
      const dinnerFloor = Math.max(
        18 * 60,
        timeToMinutes(cur.opt.defaultStartTime ?? "19:00") - 60,
      );
      const candidate = Math.max(afterPrev, dinnerFloor);
      const pulled = minutesToHm(candidate);
      if (
        candidate < timeToMinutes(cur.start) &&
        isOpenAt(cur.opt, date, pulled) &&
        candidate <= latest
      ) {
        cur.start = pulled;
      }
    }
    resolveOverlaps();

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
    children: resolved.children,
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
