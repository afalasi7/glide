/**
 * STUB — Programmer replaces this with real planner + solver tools.
 * One curated Ras Al Khaimah proposal so /app screens can ship.
 */

import type {
  BookingResult,
  ProposedTrip,
  TripItem,
  TripItemAlternative,
  TripRequest,
} from "./booking-types";

export const DESTINATION_CHIPS = ["Ras Al Khaimah", "Muscat", "Hatta"] as const;
export const BUDGET_CHIPS = [1500, 3000, 6000] as const;

/** Next Thursday → Saturday (local), used as the default When answer. */
export function defaultWeekendRange(from: Date = new Date()): { from: string; to: string } {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0 Sun … 4 Thu
  const daysUntilThu = (4 - day + 7) % 7 || 7;
  const thu = new Date(d);
  thu.setDate(d.getDate() + daysUntilThu);
  const sat = new Date(thu);
  sat.setDate(thu.getDate() + 2);
  return { from: iso(thu), to: iso(sat) };
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function defaultTripRequest(partial?: Partial<TripRequest>): TripRequest {
  const weekend = defaultWeekendRange();
  return {
    where: partial?.where ?? "Ras Al Khaimah",
    from: partial?.from ?? weekend.from,
    to: partial?.to ?? weekend.to,
    adults: partial?.adults ?? 2,
    kids: partial?.kids ?? 0,
    budgetAed: partial?.budgetAed ?? 3000,
  };
}

function item(
  partial: Omit<TripItem, "alternatives"> & { alternatives?: TripItemAlternative[] },
): TripItem {
  return { alternatives: [], ...partial };
}

/** Stub proposal for Ras Al Khaimah (and soft-mapped destinations). */
export function proposeTripStub(request: TripRequest): ProposedTrip {
  const destination = request.where || "Ras Al Khaimah";
  const guests = Math.max(1, request.adults + request.kids);
  const hotelBase = request.budgetAed >= 6000 ? 1200 : request.budgetAed <= 1500 ? 480 : 890;
  const dinnerBase = request.budgetAed >= 6000 ? 420 : request.budgetAed <= 1500 ? 180 : 320;
  const drive = 220;

  const hotelAlts: TripItemAlternative[] = [
    {
      id: "alt-hotel-lodge",
      title: "Jais Mountain Lodge",
      time: "18:30",
      priceAed: Math.round(hotelBase * 0.72),
      photo: "/images/hd/jebel_jais_sunset.jpg",
      place: "Jebel Jais Road",
    },
    {
      id: "alt-hotel-marjan",
      title: "Al Marjan Stay",
      time: "19:10",
      priceAed: Math.round(hotelBase * 0.6),
      photo: "/images/hd/ic_rak_resort.jpg",
      place: "Al Marjan Island",
      movesDinnerPast22: true,
    },
  ];

  const dinnerAlts: TripItemAlternative[] = [
    {
      id: "alt-din-grill",
      title: "Ember Grill",
      time: "20:30",
      priceAed: Math.round(dinnerBase * 0.85),
      photo: "/images/hd/levant_nar_dining.jpg",
      place: "Al Marjan",
    },
    {
      id: "alt-din-cafe",
      title: "Salt & Citrus",
      time: "19:45",
      priceAed: Math.round(dinnerBase * 0.55),
      photo: "/images/hd/levant_nar_dining.jpg",
      place: "Mina boardwalk",
    },
  ];

  const activityAlts: TripItemAlternative[] = [
    {
      id: "alt-act-shore",
      title: "Mina Al Arab Shore Walk",
      time: "16:45",
      priceAed: 0,
      photo: "/images/hd/ic_rak_resort.jpg",
      place: "Mina Al Arab",
    },
    {
      id: "alt-act-morning",
      title: "Jebel Jais Morning Drive",
      time: "09:00",
      priceAed: 0,
      photo: "/images/hd/jebel_jais_sunset.jpg",
      place: "Hajar Mountains",
    },
  ];

  const items: TripItem[] = [
    item({
      id: "drive",
      kind: "transfer",
      title: "Drive from Dubai Marina",
      time: "15:00",
      priceAed: drive,
      day: 1,
      place: `Dubai → ${destination}`,
      photo: "/images/hd/traffic_road.jpg",
    }),
    item({
      id: "jais",
      kind: "scenic",
      title: "Jebel Jais Viewing Deck",
      time: "17:15",
      priceAed: 0,
      day: 1,
      place: "Hajar Mountains",
      photo: "/images/hd/jebel_jais_sunset.jpg",
      alternatives: activityAlts,
    }),
    item({
      id: "hotel",
      kind: "hotel",
      title: "InterContinental RAK",
      time: "18:30",
      priceAed: hotelBase * 2,
      day: 1,
      place: "Mina Al Arab",
      photo: "/images/hd/ic_rak_resort.jpg",
      alternatives: hotelAlts,
    }),
    item({
      id: "dinner",
      kind: "dining",
      title: "Levant & Nar",
      time: "20:15",
      priceAed: dinnerBase,
      day: 1,
      place: "InterContinental Promenade",
      photo: "/images/hd/levant_nar_dining.jpg",
      alternatives: dinnerAlts,
    }),
    item({
      id: "morning",
      kind: "activity",
      title: "Jebel Jais Morning Drive",
      time: "09:00",
      priceAed: 0,
      day: 2,
      place: "Hajar Mountains",
      photo: "/images/hd/jebel_jais_sunset.jpg",
      alternatives: activityAlts,
    }),
  ];

  const totalAed = items.reduce((sum, i) => sum + i.priceAed, 0);
  const days = [
    { day: 1, label: "Friday", items: items.filter((i) => i.day === 1) },
    { day: 2, label: "Saturday", items: items.filter((i) => i.day === 2) },
  ];

  return {
    id: `stub-${destination.toLowerCase().replace(/\s+/g, "-")}-${guests}p`,
    destination,
    days,
    items,
    totalAed,
    summary: `Here's your weekend in ${destination}. Everything fits your budget, and sunset at Jebel Jais is timed for you.`,
  };
}

export type SwapOutcome =
  | { ok: true; trip: ProposedTrip; note: string }
  | { ok: false; needsConfirm: true; message: string; tripIfShifted: ProposedTrip };

/** Apply an alternative; flag dinner-past-22 conflicts for UI confirm. */
export function applySwapStub(
  trip: ProposedTrip,
  itemId: string,
  alternativeId: string,
  opts?: { shiftDinner?: boolean },
): SwapOutcome {
  const current = trip.items.find((i) => i.id === itemId);
  const alt = current?.alternatives.find((a) => a.id === alternativeId);
  if (!current || !alt) return { ok: true, trip, note: "" };

  if (alt.movesDinnerPast22 && !opts?.shiftDinner) {
    const shifted = applySwapStub(trip, itemId, alternativeId, { shiftDinner: true });
    if (shifted.ok) {
      return {
        ok: false,
        needsConfirm: true,
        message: "That moves dinner past 22:00. Want me to shift it?",
        tripIfShifted: shifted.trip,
      };
    }
  }

  const items = trip.items.map((i) => {
    if (i.id !== itemId) {
      if (opts?.shiftDinner && i.kind === "dining") {
        return { ...i, time: "22:15", title: i.title };
      }
      return i;
    }
    const previous: TripItemAlternative = {
      id: `prev-${i.id}`,
      title: i.title,
      time: i.time,
      priceAed: i.priceAed,
      photo: i.photo,
      place: i.place,
    };
    return {
      ...i,
      title: alt.title,
      time: alt.time,
      priceAed: alt.priceAed,
      photo: alt.photo ?? i.photo,
      place: alt.place ?? i.place,
      alternatives: [previous, ...i.alternatives.filter((a) => a.id !== alt.id)].slice(0, 3),
    };
  });

  const totalAed = items.reduce((sum, i) => sum + i.priceAed, 0);
  const days = trip.days.map((d) => ({
    ...d,
    items: items.filter((i) => i.day === d.day),
  }));

  const kindLabel = current.kind === "hotel" ? "hotels" : "options";
  return {
    ok: true,
    trip: { ...trip, items, days, totalAed },
    note: `Here are two other ${kindLabel}. I've re-checked your timings, and all of them still work.`,
  };
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export function guestCount(request: TripRequest): number {
  return Math.max(1, request.adults + request.kids);
}

export function bookTripStub(trip: ProposedTrip, mode: "stripe" | "demo" = "demo"): BookingResult {
  const labels: Record<string, string> = {
    hotel: "Hotel booked ✓",
    dinner: "Dinner booked ✓",
    jais: "Jebel Jais booked ✓",
  };
  const confirmations = trip.items
    .filter((i) => i.kind === "hotel" || i.kind === "dining" || i.kind === "scenic")
    .map((i) => ({
      itemId: i.id,
      label: labels[i.id] ?? `${i.title} booked ✓`,
    }));

  return {
    tripId: trip.id,
    mode,
    bookedAt: new Date().toISOString(),
    confirmations,
    walletPasses: trip.items
      .filter((i) => i.kind === "hotel" || i.kind === "dining")
      .map((i) => ({
        id: `pass-${i.id}`,
        title: i.title,
        detail: `${i.time} · demo`,
      })),
  };
}

export async function startCheckoutStub(trip: ProposedTrip): Promise<BookingResult> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        destination: trip.destination,
        totalAed: trip.totalAed,
        currency: "aed",
        items: trip.items.map((i) => ({ id: i.id, title: i.title, priceAed: i.priceAed })),
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { url?: unknown };
      if (typeof data.url === "string" && data.url.startsWith("http")) {
        return { ...bookTripStub(trip, "stripe"), checkoutUrl: data.url };
      }
    }
  } catch {
    /* demo fallback */
  }
  return bookTripStub(trip, "demo");
}

/** Lightweight chat → TripRequest prefill (UI helper; not the real planner). */
export function parseTripIntentStub(message: string): Partial<TripRequest> | null {
  const q = message.toLowerCase().trim();
  if (!q) return null;
  const looks =
    /\b(book|plan|weekend|trip|getaway|night|budget)\b/.test(q) ||
    /ras al khaimah|rak|hatta|muscat/.test(q);
  if (!looks) return null;
  let where = "Ras Al Khaimah";
  if (q.includes("hatta")) where = "Hatta";
  if (q.includes("muscat")) where = "Muscat";
  let adults = 2;
  const forMatch = q.match(/\bfor\s+(\d+|two|three|four|one)\b/);
  if (forMatch) {
    const map: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
    const token = forMatch[1]!;
    const mapped = map[token];
    const digits = Number(token);
    adults = mapped ?? (Number.isFinite(digits) && digits > 0 ? digits : 2);
  }
  let budgetAed = 3000;
  if (/\b(cheap|budget|1500)\b/.test(q)) budgetAed = 1500;
  if (/\b(luxe|luxury|6000|six thousand)\b/.test(q)) budgetAed = 6000;
  return { where, adults, budgetAed };
}
