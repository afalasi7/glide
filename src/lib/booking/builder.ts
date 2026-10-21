import { itemsFor } from "./catalog";
import type { BudgetBand, CatalogItem, ProposedStop, ProposedTrip, TripPrefs } from "./types";
import { DESTINATION_LABELS } from "./types";

function pickHotel(prefs: TripPrefs): CatalogItem {
  const hotels = itemsFor(prefs.destinationId, "hotel");
  if (prefs.budgetBand === "smart") return hotels.find((h) => h.tags.includes("value")) ?? hotels[hotels.length - 1]!;
  if (prefs.budgetBand === "luxe") return hotels.find((h) => h.tags.includes("luxe") || h.tags.includes("resort")) ?? hotels[0]!;
  return hotels.find((h) => h.tags.includes("default")) ?? hotels[0]!;
}

function pickDinner(prefs: TripPrefs): CatalogItem {
  const dinners = itemsFor(prefs.destinationId, "dining");
  if (prefs.budgetBand === "smart") return dinners.find((d) => d.tags.includes("value")) ?? dinners[dinners.length - 1]!;
  if (prefs.budgetBand === "luxe") return dinners.find((d) => d.tags.includes("luxe")) ?? dinners[0]!;
  return dinners.find((d) => d.tags.includes("default")) ?? dinners[0]!;
}

function pickActivities(prefs: TripPrefs): CatalogItem[] {
  const pool = [
    ...itemsFor(prefs.destinationId, "scenic"),
    ...itemsFor(prefs.destinationId, "activity"),
  ];
  const preferred = pool.filter((a) => a.tags.includes("default") || a.tags.includes("sunset") || a.tags.includes("morning"));
  const nights = Math.max(0, prefs.nights);
  if (nights === 0) return [preferred[0] ?? pool[0]!].filter(Boolean);
  if (nights === 1) return [preferred[0] ?? pool[0]!, preferred[1] ?? pool[1]!].filter(Boolean);
  return [preferred[0] ?? pool[0]!, preferred[1] ?? pool[1]!, preferred[2] ?? pool[2]!].filter(Boolean);
}

function hhmm(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function stopFrom(
  item: CatalogItem,
  opts: { id: string; day: number; startAt: string; priceAed: number; note?: string; kind?: ProposedStop["kind"] },
): ProposedStop {
  return {
    id: opts.id,
    catalogId: item.id,
    kind: opts.kind ?? item.kind,
    day: opts.day,
    startAt: opts.startAt,
    title: item.title,
    place: item.place,
    photo: item.photo,
    priceAed: opts.priceAed,
    durationMin: item.durationMin,
    note: opts.note ?? item.blurb,
  };
}

function transportPrice(prefs: TripPrefs): number {
  const base = prefs.destinationId === "hatta" ? 180 : 220;
  return base + Math.max(0, prefs.travellers - 2) * 40;
}

/** Build one day-by-day demo itinerary from preferences. Deterministic for tests. */
export function buildProposedTrip(prefs: TripPrefs): ProposedTrip {
  const nights = Math.min(3, Math.max(0, Math.floor(prefs.nights)));
  const travellers = Math.min(6, Math.max(1, Math.floor(prefs.travellers)));
  const normalized: TripPrefs = { ...prefs, nights, travellers };
  const hotel = pickHotel(normalized);
  const dinner = pickDinner(normalized);
  const activities = pickActivities(normalized);
  const drive = transportPrice(normalized);
  const stops: ProposedStop[] = [];

  stops.push({
    id: "depart",
    catalogId: "transfer-drive",
    kind: "transfer",
    day: 1,
    startAt: hhmm(nights === 0 ? 15 : 10),
    title: normalized.destinationId === "hatta" ? "Drive from Dubai" : "Drive from Dubai Marina",
    place: "Dubai → " + DESTINATION_LABELS[normalized.destinationId],
    photo: "/images/hd/traffic_road.jpg",
    priceAed: drive,
    durationMin: normalized.destinationId === "hatta" ? 90 : 135,
    note: "Self-drive · fuel estimate included",
  });

  if (nights === 0) {
    const act = activities[0]!;
    stops.push(stopFrom(act, { id: "act-1", day: 1, startAt: hhmm(17, 15), priceAed: act.priceAed * travellers }));
    stops.push(
      stopFrom(dinner, {
        id: "dinner-1",
        day: 1,
        startAt: hhmm(20),
        priceAed: dinner.priceAed * Math.ceil(travellers / 2),
        note: "Demo table hold · example price",
      }),
    );
  } else {
    // Day 1: arrive, hotel, dinner
    const act1 = activities[0]!;
    stops.push(stopFrom(act1, { id: "act-1", day: 1, startAt: hhmm(16, 30), priceAed: act1.priceAed * travellers }));
    stops.push(
      stopFrom(hotel, {
        id: "hotel-1",
        day: 1,
        startAt: hhmm(18, 30),
        priceAed: hotel.priceAed * nights,
        note: `${nights} night${nights > 1 ? "s" : ""} · demo rate`,
      }),
    );
    stops.push(
      stopFrom(dinner, {
        id: "dinner-1",
        day: 1,
        startAt: hhmm(20, 15),
        priceAed: dinner.priceAed * Math.ceil(travellers / 2),
        note: "Demo table · example price",
      }),
    );

    // Day 2 morning activity
    const act2 = activities[1] ?? activities[0]!;
    stops.push(
      stopFrom(act2, {
        id: "act-2",
        day: 2,
        startAt: hhmm(9),
        priceAed: act2.priceAed * travellers,
        note: act2.blurb,
      }),
    );

    if (nights >= 2) {
      const act3 = activities[2] ?? act2;
      stops.push(
        stopFrom(act3, {
          id: "act-3",
          day: 2,
          startAt: hhmm(15, 30),
          priceAed: act3.priceAed * travellers,
        }),
      );
      const dinner2 = itemsFor(normalized.destinationId, "dining").find((d) => d.id !== dinner.id) ?? dinner;
      stops.push(
        stopFrom(dinner2, {
          id: "dinner-2",
          day: 2,
          startAt: hhmm(19, 45),
          priceAed: dinner2.priceAed * Math.ceil(travellers / 2),
        }),
      );
      stops.push(
        stopFrom(act2, {
          id: "act-4",
          day: 3,
          startAt: hhmm(9, 30),
          priceAed: 0,
          note: "Easy morning before the drive home",
          kind: "activity",
        }),
      );
    }
  }

  const totalAed = stops.reduce((sum, s) => sum + s.priceAed, 0);
  const label = DESTINATION_LABELS[normalized.destinationId];
  const title =
    nights === 0 ? `Day in ${label}` : nights === 1 ? `Night in ${label}` : `Long weekend in ${label}`;

  return {
    id: `trip-${normalized.destinationId}-${nights}n-${travellers}p`,
    destinationId: normalized.destinationId,
    prefs: normalized,
    title,
    subtitle: `${travellers} traveller${travellers > 1 ? "s" : ""} · ${budgetLabel(normalized.budgetBand)} · demo prices`,
    nights,
    stops,
    transport: {
      mode: "drive",
      label: normalized.destinationId === "hatta" ? "Dubai → Hatta drive" : "Dubai → Ras Al Khaimah drive",
      priceAed: drive,
    },
    totalAed,
  };
}

function budgetLabel(band: BudgetBand): string {
  return band === "smart" ? "Smart budget" : band === "luxe" ? "Luxe" : "Comfort";
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
