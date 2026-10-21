import { DESTINATIONS, resolveDestination, type CatalogOption } from "./catalog";
import { withPlanDefaults } from "./defaults";
import { withFacts } from "./facts";
import { syncTripGraph } from "./graph";
import { applyCatalogPrices, nightsBetween } from "./pricing";
import { saveTrip } from "./store";
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

function pickBest(pool: CatalogOption[], interests: string[] | undefined, budgetPressure: number): CatalogOption {
  if (!pool.length) throw new Error("empty catalog pool");
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
        const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
        const mm = String(total % 60).padStart(2, "0");
        return `${hh}:${mm}`;
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

function uniqueByCatalog(opts: CatalogOption[]): CatalogOption[] {
  const seen = new Set<string>();
  return opts.filter((o) => {
    if (seen.has(o.catalogId)) return false;
    seen.add(o.catalogId);
    return true;
  });
}

function isMorningHighlight(defaultStartTime: string | undefined): boolean {
  if (!defaultStartTime) return false;
  const [h] = defaultStartTime.split(":").map(Number);
  return h < 12;
}

/**
 * Always include the destination highlight plan on a day that fits its timing
 * (evening highlights on day 1, morning highlights on day 2+).
 */
function selectDayPlans(
  dest: DestinationId,
  dayIndex: number,
  interests: string[] | undefined,
  budgetPressure: number,
  totalDays: number,
): CatalogOption[] {
  const catalog = DESTINATIONS[dest];
  const pool = catalog.plans;
  const dining = pool.filter((p) => p.kind === "dining");
  const activities = pool.filter((p) => p.kind === "activity");
  const dinner = pickBest(dining, interests, budgetPressure);
  const highlight = pool.find((p) => p.catalogId === catalog.highlight.catalogId);
  const highlightMorning = highlight ? isMorningHighlight(highlight.defaultStartTime) : false;
  // Morning highlight (Hatta kayak): day 2 when multi-day, else day 1.
  const highlightDay = highlightMorning ? (totalDays >= 2 ? 2 : 1) : 1;

  if (dayIndex === highlightDay && highlight) {
    const extra = pickBest(
      activities.filter((a) => a.catalogId !== highlight.catalogId),
      interests,
      budgetPressure,
    );
    return uniqueByCatalog([highlight, extra, dinner]).slice(0, 3);
  }

  if (dayIndex === 1) {
    const primary = pickBest(
      activities.filter((a) => a.catalogId !== highlight?.catalogId),
      interests,
      budgetPressure,
    );
    const extra = pickBest(
      activities.filter((a) => a.catalogId !== primary.catalogId && a.catalogId !== highlight?.catalogId),
      interests,
      budgetPressure,
    );
    return uniqueByCatalog([primary, extra, dinner]).slice(0, 3);
  }

  const morning = pickBest(
    activities.filter((a) => a.catalogId !== highlight?.catalogId),
    interests,
    budgetPressure,
  );
  const extra = pickBest(
    activities.filter((a) => a.catalogId !== morning.catalogId && a.catalogId !== highlight?.catalogId),
    interests,
    budgetPressure,
  );
  return uniqueByCatalog([morning, extra, dinner]).slice(0, 3);
}

function refFor(opt: CatalogOption, tripId: string): string | undefined {
  if (opt.kind === "hotel") return `HTL-${tripId.slice(-6).toUpperCase()}`;
  if (opt.kind === "dining") return `DIN-${tripId.slice(-6).toUpperCase()}`;
  if (opt.kind === "travel" && opt.mode === "flight") return `FLT-${tripId.slice(-6).toUpperCase()}`;
  return undefined;
}

/**
 * Build one complete proposed trip from curated destination data.
 * Defaults: Ras Al Khaimah, next Fri→Sun, 2 adults, AED 3,000.
 * Persists the trip in the in-memory store for checkout recomputation.
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
  // Prefer mid-tier hotel at default budget; pressure pushes cheaper.
  const travelOpt = pickBest(catalog.travel, resolved.interests, budgetPressure);
  const hotelOpt = pickBest(catalog.hotels, resolved.interests, budgetPressure);

  const travel = toItem(
    travelOpt,
    `${tripId}_travel`,
    1,
    travelOpt.defaultStartTime ?? "09:00",
    refFor(travelOpt, tripId),
  );
  const hotel = toItem(
    hotelOpt,
    `${tripId}_hotel`,
    1,
    hotelOpt.defaultStartTime ?? "15:00",
    refFor(hotelOpt, tripId),
  );

  const tripDays: TripDay[] = [];
  for (let d = 1; d <= days; d++) {
    const opts = selectDayPlans(destination, d, resolved.interests, budgetPressure, days);
    const chosen = opts.slice(0, Math.min(3, Math.max(2, opts.length)));
    while (chosen.length < 2 && catalog.plans.length > chosen.length) {
      const next = catalog.plans.find((p) => !chosen.some((c) => c.catalogId === p.catalogId));
      if (!next) break;
      chosen.push(next);
    }
    const plans = chosen.map((opt, i) => {
      let start = opt.defaultStartTime ?? "10:00";
      if (chosen.filter((c) => (c.defaultStartTime ?? "10:00") === start).length > 1 && i > 0) {
        const [h, m] = start.split(":").map(Number);
        const bumped = h * 60 + m + i * 30;
        start = `${String(Math.floor(bumped / 60) % 24).padStart(2, "0")}:${String(bumped % 60).padStart(2, "0")}`;
      }
      return toItem(opt, `${tripId}_d${d}_p${i}`, d, start, refFor(opt, tripId));
    });
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

  return saveTrip(trip);
}
