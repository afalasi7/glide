import type { DestinationId, TravelMode, TripItemKind } from "./types";

/** Curated option used for planning, swaps, and server-side price recomputation. */
export interface CatalogOption {
  catalogId: string;
  kind: TripItemKind;
  title: string;
  location: string;
  costAED: number;
  photo?: string;
  mode?: TravelMode;
  defaultStartTime?: string;
  durationMin?: number;
  notes?: string;
  tags?: string[];
}

export interface DestinationCatalog {
  id: DestinationId;
  label: string;
  originLabel: string;
  travel: CatalogOption[];
  hotels: CatalogOption[];
  plans: CatalogOption[];
  /** Catalog id used for the destination highlight fact. */
  highlightCatalogId: string;
  highlightLabel: string;
  highlightCutoffTime?: string;
}

const RAK_PHOTOS = {
  road: "/images/hd/traffic_road.jpg",
  jais: "/images/hd/jebel_jais_sunset.jpg",
  hotel: "/images/hd/ic_rak_resort.jpg",
  dinner: "/images/hd/levant_nar_dining.jpg",
} as const;

export const DESTINATIONS: Record<DestinationId, DestinationCatalog> = {
  "ras-al-khaimah": {
    id: "ras-al-khaimah",
    label: "Ras Al Khaimah",
    originLabel: "Dubai Marina",
    highlightCatalogId: "rak-jais-deck",
    highlightLabel: "Sunset at Jebel Jais",
    highlightCutoffTime: "17:48",
    travel: [
      {
        catalogId: "rak-drive-e311",
        kind: "travel",
        title: "Drive Dubai Marina → Ras Al Khaimah",
        location: "E311 / Sheikh Mohammed Bin Zayed Rd",
        costAED: 85,
        mode: "drive",
        defaultStartTime: "15:00",
        durationMin: 135,
        photo: RAK_PHOTOS.road,
        notes: "Self-drive; Friday 16:00–19:00 adds peak traffic.",
        tags: ["road", "scenic"],
      },
      {
        catalogId: "rak-drive-coastal",
        kind: "travel",
        title: "Coastal drive via Sharjah Corniche",
        location: "E11 coastal route",
        costAED: 95,
        mode: "drive",
        defaultStartTime: "14:30",
        durationMin: 155,
        photo: RAK_PHOTOS.road,
        notes: "Longer but calmer views; less E311 congestion.",
        tags: ["road", "scenic"],
      },
    ],
    hotels: [
      {
        catalogId: "rak-hotel-hilton",
        kind: "hotel",
        title: "Hilton Garden Inn Ras Al Khaimah",
        location: "Al Hamra Village, Ras Al Khaimah",
        costAED: 520,
        defaultStartTime: "18:00",
        durationMin: 40,
        notes: "Mid-range · close to golf and marina.",
        tags: ["value"],
      },
      {
        catalogId: "rak-hotel-ic",
        kind: "hotel",
        title: "InterContinental RAK Mina Al Arab",
        location: "Mina Al Arab, Ras Al Khaimah",
        costAED: 890,
        defaultStartTime: "18:30",
        durationMin: 45,
        photo: RAK_PHOTOS.hotel,
        notes: "Ocean Terrace · flexible check-in until midnight.",
        tags: ["resort", "beach"],
      },
      {
        catalogId: "rak-hotel-anantara",
        kind: "hotel",
        title: "Anantara Mina Al Arab Ras Al Khaimah Resort",
        location: "Mina Al Arab, Ras Al Khaimah",
        costAED: 1250,
        defaultStartTime: "18:45",
        durationMin: 45,
        photo: RAK_PHOTOS.hotel,
        notes: "Lagoon villas · higher nightly rate.",
        tags: ["luxury", "beach"],
      },
    ],
    plans: [
      {
        catalogId: "rak-jais-deck",
        kind: "activity",
        title: "Jebel Jais Viewing Deck",
        location: "Ras Al Khaimah Heights",
        costAED: 0,
        defaultStartTime: "17:15",
        durationMin: 60,
        photo: RAK_PHOTOS.jais,
        notes: "Sunset hard cutoff ~17:48.",
        tags: ["scenic", "mountains", "sunset"],
      },
      {
        catalogId: "rak-jais-morning",
        kind: "activity",
        title: "Jebel Jais morning light",
        location: "Ras Al Khaimah Heights",
        costAED: 0,
        defaultStartTime: "08:30",
        durationMin: 75,
        photo: RAK_PHOTOS.jais,
        notes: "Cooler air, clearer Hajar views.",
        tags: ["scenic", "mountains"],
      },
      {
        catalogId: "rak-zipline",
        kind: "activity",
        title: "Jebel Jais Flight zipline",
        location: "Jebel Jais",
        costAED: 650,
        defaultStartTime: "10:00",
        durationMin: 90,
        notes: "World’s longest zipline slot (demo price per traveller).",
        tags: ["adventure"],
      },
      {
        catalogId: "rak-dinner-levant",
        kind: "dining",
        title: "Levant & Nar (Dinner)",
        location: "InterContinental Promenade",
        costAED: 420,
        defaultStartTime: "20:00",
        durationMin: 90,
        photo: RAK_PHOTOS.dinner,
        notes: "15-min table hold · kitchen last seat 21:30.",
        tags: ["dining", "evening"],
      },
      {
        catalogId: "rak-dinner-barn",
        kind: "dining",
        title: "The Barn steakhhouse",
        location: "Al Hamra Mall area",
        costAED: 380,
        defaultStartTime: "19:30",
        durationMin: 90,
        notes: "Casual grill · easier parking.",
        tags: ["dining"],
      },
      {
        catalogId: "rak-beach-club",
        kind: "activity",
        title: "Al Marjan Island beach morning",
        location: "Al Marjan Island",
        costAED: 120,
        defaultStartTime: "09:30",
        durationMin: 120,
        notes: "Sunbeds and shallow swimming.",
        tags: ["beach", "relax"],
      },
    ],
  },
  muscat: {
    id: "muscat",
    label: "Muscat",
    originLabel: "Dubai International (DXB)",
    highlightCatalogId: "mct-mutrah",
    highlightLabel: "Mutrah Souq at golden hour",
    travel: [
      {
        catalogId: "mct-flight-dxb",
        kind: "travel",
        title: "Flight DXB → MCT",
        location: "flydubai FZ41 (demo)",
        costAED: 480,
        mode: "flight",
        defaultStartTime: "08:40",
        durationMin: 75,
        notes: "Economy one-way priced for the demo plan.",
        tags: ["flight"],
      },
      {
        catalogId: "mct-flight-auh",
        kind: "travel",
        title: "Flight AUH → MCT",
        location: "Etihad EY602 (demo)",
        costAED: 560,
        mode: "flight",
        defaultStartTime: "09:15",
        durationMin: 70,
        notes: "Via Abu Dhabi · slightly higher fare.",
        tags: ["flight"],
      },
    ],
    hotels: [
      {
        catalogId: "mct-hotel-grand",
        kind: "hotel",
        title: "Grand Hyatt Muscat",
        location: "Shati Al Qurum",
        costAED: 640,
        defaultStartTime: "14:30",
        durationMin: 40,
        notes: "Gardens and spa · solid mid-luxury.",
        tags: ["value", "city"],
      },
      {
        catalogId: "mct-hotel-w",
        kind: "hotel",
        title: "W Muscat",
        location: "Qurum Beach, Muscat",
        costAED: 780,
        defaultStartTime: "14:00",
        durationMin: 40,
        notes: "Beachfront · 10 min to Mutrah.",
        tags: ["beach", "city"],
      },
      {
        catalogId: "mct-hotel-al-bustan",
        kind: "hotel",
        title: "Al Bustan Palace, a Ritz-Carlton Hotel",
        location: "Al Bustan, Muscat",
        costAED: 1450,
        defaultStartTime: "15:00",
        durationMin: 45,
        notes: "Iconic bay setting · premium nightly rate.",
        tags: ["luxury", "beach"],
      },
    ],
    plans: [
      {
        catalogId: "mct-mutrah",
        kind: "activity",
        title: "Mutrah Souq & Corniche walk",
        location: "Mutrah, Muscat",
        costAED: 40,
        defaultStartTime: "16:30",
        durationMin: 120,
        notes: "Frankincense stalls and harbour light.",
        tags: ["culture", "city", "sunset"],
      },
      {
        catalogId: "mct-opera",
        kind: "activity",
        title: "Royal Opera House exterior & gardens",
        location: "Shati Al Qurum",
        costAED: 0,
        defaultStartTime: "11:00",
        durationMin: 60,
        notes: "Photo stop · check performance calendar separately.",
        tags: ["culture"],
      },
      {
        catalogId: "mct-dinner-beach",
        kind: "dining",
        title: "Beachside seafood at Qurum",
        location: "Qurum Beach",
        costAED: 310,
        defaultStartTime: "19:30",
        durationMin: 90,
        notes: "Grill and catch of the day.",
        tags: ["dining", "beach"],
      },
      {
        catalogId: "mct-dinner-mutrah",
        kind: "dining",
        title: "Omani thali near Mutrah",
        location: "Mutrah",
        costAED: 180,
        defaultStartTime: "19:00",
        durationMin: 75,
        notes: "Lighter bill · local flavours.",
        tags: ["dining", "value"],
      },
      {
        catalogId: "mct-wadi",
        kind: "activity",
        title: "Wadi Shab day trip (shared)",
        location: "Ash Sharqiyah South",
        costAED: 290,
        defaultStartTime: "08:00",
        durationMin: 360,
        notes: "Long day out · swim in the canyon pools.",
        tags: ["adventure", "scenic"],
      },
    ],
  },
  hatta: {
    id: "hatta",
    label: "Hatta",
    originLabel: "Dubai Marina",
    highlightCatalogId: "hatta-dam-sunset",
    highlightLabel: "Hatta Dam at golden hour",
    highlightCutoffTime: "18:05",
    travel: [
      {
        catalogId: "hatta-drive-e44",
        kind: "travel",
        title: "Drive Dubai Marina → Hatta",
        location: "E44 Hatta Road",
        costAED: 65,
        mode: "drive",
        defaultStartTime: "14:00",
        durationMin: 100,
        photo: RAK_PHOTOS.road,
        notes: "Mountain road · watch Friday outbound traffic.",
        tags: ["road", "scenic"],
      },
      {
        catalogId: "hatta-drive-scenic",
        kind: "travel",
        title: "Scenic drive via Maleha",
        location: "F55 / desert fringe",
        costAED: 80,
        mode: "drive",
        defaultStartTime: "13:30",
        durationMin: 125,
        photo: RAK_PHOTOS.road,
        notes: "Extra dunes detour · longer but photogenic.",
        tags: ["road", "scenic"],
      },
    ],
    hotels: [
      {
        catalogId: "hatta-hotel-ja",
        kind: "hotel",
        title: "JA Hatta Fort Hotel",
        location: "Hatta, Dubai",
        costAED: 480,
        defaultStartTime: "16:30",
        durationMin: 40,
        notes: "Hilltop fort rooms · pool and kids club.",
        tags: ["value", "family"],
      },
      {
        catalogId: "hatta-hotel-staycation",
        kind: "hotel",
        title: "Hatta Staycation Cabins",
        location: "Hatta Dam area",
        costAED: 320,
        defaultStartTime: "16:00",
        durationMin: 30,
        notes: "Simple mountain cabins · best when budget is tight.",
        tags: ["value"],
      },
      {
        catalogId: "hatta-hotel-luxury-tent",
        kind: "hotel",
        title: "Hatta Valley luxury tents",
        location: "Hatta foothills",
        costAED: 720,
        defaultStartTime: "17:00",
        durationMin: 40,
        notes: "Glamping with mountain views.",
        tags: ["luxury", "scenic"],
      },
    ],
    plans: [
      {
        catalogId: "hatta-dam-sunset",
        kind: "activity",
        title: "Hatta Dam kayak & overlook",
        location: "Hatta Dam",
        costAED: 90,
        defaultStartTime: "17:00",
        durationMin: 75,
        photo: RAK_PHOTOS.jais,
        notes: "Golden-hour light on the reservoir.",
        tags: ["scenic", "sunset", "water"],
      },
      {
        catalogId: "hatta-heritage",
        kind: "activity",
        title: "Hatta Heritage Village",
        location: "Hatta Old Village",
        costAED: 0,
        defaultStartTime: "10:00",
        durationMin: 90,
        notes: "Watchtowers and restored falaj.",
        tags: ["culture"],
      },
      {
        catalogId: "hatta-kayak",
        kind: "activity",
        title: "Morning kayak on Hatta Dam",
        location: "Hatta Dam",
        costAED: 110,
        defaultStartTime: "08:30",
        durationMin: 90,
        notes: "Cooler water, quieter boats.",
        tags: ["adventure", "water"],
      },
      {
        catalogId: "hatta-dinner-fort",
        kind: "dining",
        title: "Dinner at JA Hatta Fort",
        location: "JA Hatta Fort Hotel",
        costAED: 260,
        defaultStartTime: "19:30",
        durationMin: 90,
        notes: "Terrace seating · last kitchen ~22:00.",
        tags: ["dining"],
      },
      {
        catalogId: "hatta-dinner-grill",
        kind: "dining",
        title: "Mountain grill picnic dinner",
        location: "Hatta Dam picnic area",
        costAED: 160,
        defaultStartTime: "19:00",
        durationMin: 75,
        notes: "Casual · wrap up before the cool night drop.",
        tags: ["dining", "value"],
      },
    ],
  },
};

export function resolveDestination(raw: string | undefined): DestinationId {
  if (!raw?.trim()) return "ras-al-khaimah";
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (key === "rak" || key.includes("khaimah") || key === "ras-al-khaimah") {
    return "ras-al-khaimah";
  }
  if (key.includes("muscat") || key === "mct" || key === "oman") {
    return "muscat";
  }
  if (key.includes("hatta")) {
    return "hatta";
  }
  throw new Error(
    `Unsupported destination "${raw}". Curated demos: Ras Al Khaimah, Muscat, Hatta.`,
  );
}

export function getCatalogOption(catalogId: string): CatalogOption | undefined {
  for (const dest of Object.values(DESTINATIONS)) {
    for (const pool of [dest.travel, dest.hotels, dest.plans]) {
      const hit = pool.find((o) => o.catalogId === catalogId);
      if (hit) return hit;
    }
  }
  return undefined;
}
