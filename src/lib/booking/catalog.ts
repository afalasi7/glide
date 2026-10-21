import type { CatalogItem, DestinationId } from "./types";

/** Curated UAE picks with photos already in the repo. Only RAK and Hatta are bookable. */
export const DESTINATION_OPTIONS: {
  id: DestinationId | "abu-dhabi" | "al-ain" | "fujairah" | "muscat";
  label: string;
  available: boolean;
  blurb: string;
}[] = [
  { id: "rak", label: "Ras Al Khaimah", available: true, blurb: "Mountains, resort, and Levant & Nar" },
  { id: "hatta", label: "Hatta", available: true, blurb: "Cooler hills and a quiet long weekend" },
  { id: "abu-dhabi", label: "Abu Dhabi", available: false, blurb: "Soon" },
  { id: "al-ain", label: "Al Ain", available: false, blurb: "Soon" },
  { id: "fujairah", label: "Fujairah", available: false, blurb: "Soon" },
  { id: "muscat", label: "Muscat", available: false, blurb: "Soon — waiting on photography" },
];

const RAK_HOTELS: CatalogItem[] = [
  {
    id: "hotel-ic-rak",
    destinationId: "rak",
    kind: "hotel",
    title: "InterContinental RAK",
    place: "Mina Al Arab",
    photo: "/images/hd/ic_rak_resort.jpg",
    priceAed: 890,
    priceUnit: "night",
    durationMin: 45,
    blurb: "Ocean terrace suite, mobile key ready.",
    tags: ["resort", "default"],
  },
  {
    id: "hotel-rak-hill",
    destinationId: "rak",
    kind: "hotel",
    title: "Jais Mountain Lodge",
    place: "Jebel Jais Road",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    priceAed: 620,
    priceUnit: "night",
    durationMin: 40,
    blurb: "Quiet rooms above the hairpins.",
    tags: ["mountain"],
  },
  {
    id: "hotel-rak-marina",
    destinationId: "rak",
    kind: "hotel",
    title: "Al Marjan Stay",
    place: "Al Marjan Island",
    photo: "/images/hd/ic_rak_resort.jpg",
    priceAed: 540,
    priceUnit: "night",
    durationMin: 40,
    blurb: "Compact island hotel, easy parking.",
    tags: ["value"],
  },
];

const RAK_SCENIC: CatalogItem[] = [
  {
    id: "act-jais",
    destinationId: "rak",
    kind: "scenic",
    title: "Jebel Jais Viewing Deck",
    place: "Hajar Mountains",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    priceAed: 0,
    priceUnit: "visit",
    durationMin: 45,
    blurb: "Sunset cutoff at 17:48 — the hard constraint.",
    tags: ["sunset", "default"],
  },
  {
    id: "act-jais-morning",
    destinationId: "rak",
    kind: "activity",
    title: "Jebel Jais Morning Drive",
    place: "Hajar Mountains",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    priceAed: 0,
    priceUnit: "visit",
    durationMin: 60,
    blurb: "Cooler light, empty road.",
    tags: ["morning"],
  },
  {
    id: "act-beach",
    destinationId: "rak",
    kind: "activity",
    title: "Mina Al Arab Shore Walk",
    place: "Mina Al Arab",
    photo: "/images/hd/ic_rak_resort.jpg",
    priceAed: 0,
    priceUnit: "visit",
    durationMin: 50,
    blurb: "Flat promenade after check-in.",
    tags: ["easy"],
  },
];

const RAK_DINING: CatalogItem[] = [
  {
    id: "din-levant",
    destinationId: "rak",
    kind: "dining",
    title: "Levant & Nar",
    place: "InterContinental Promenade",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 320,
    priceUnit: "table",
    durationMin: 90,
    blurb: "15-minute hold; terrace #14.",
    tags: ["default", "dinner"],
  },
  {
    id: "din-grill",
    destinationId: "rak",
    kind: "dining",
    title: "Ember Grill",
    place: "Al Marjan",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 260,
    priceUnit: "table",
    durationMin: 85,
    blurb: "Later seating, no fee to move.",
    tags: ["dinner"],
  },
  {
    id: "din-cafe",
    destinationId: "rak",
    kind: "dining",
    title: "Salt & Citrus",
    place: "Mina boardwalk",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 180,
    priceUnit: "table",
    durationMin: 70,
    blurb: "Lighter plates, earlier table.",
    tags: ["dinner", "value"],
  },
];

const HATTA_HOTELS: CatalogItem[] = [
  {
    id: "hotel-hatta-lodge",
    destinationId: "hatta",
    kind: "hotel",
    title: "Hatta Hill Lodge",
    place: "Hatta Dam Road",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    priceAed: 480,
    priceUnit: "night",
    durationMin: 40,
    blurb: "Cooler nights, simple rooms.",
    tags: ["default"],
  },
  {
    id: "hotel-hatta-dam",
    destinationId: "hatta",
    kind: "hotel",
    title: "Dam View Stay",
    place: "Hatta Dam",
    photo: "/images/hd/ic_rak_resort.jpg",
    priceAed: 390,
    priceUnit: "night",
    durationMin: 35,
    blurb: "Quiet balcony over the water.",
    tags: ["value"],
  },
  {
    id: "hotel-hatta-luxe",
    destinationId: "hatta",
    kind: "hotel",
    title: "Heritage Courtyard",
    place: "Hatta Village",
    photo: "/images/hd/ic_rak_resort.jpg",
    priceAed: 710,
    priceUnit: "night",
    durationMin: 40,
    blurb: "Stone courtyard, breakfast included.",
    tags: ["luxe"],
  },
];

const HATTA_ACTS: CatalogItem[] = [
  {
    id: "act-hatta-dam",
    destinationId: "hatta",
    kind: "activity",
    title: "Hatta Dam Walk",
    place: "Hatta Dam",
    photo: "/images/hd/traffic_road.jpg",
    priceAed: 0,
    priceUnit: "visit",
    durationMin: 55,
    blurb: "Flat path, late afternoon light.",
    tags: ["default"],
  },
  {
    id: "act-hatta-trail",
    destinationId: "hatta",
    kind: "scenic",
    title: "Wadi Trail Overlook",
    place: "Hatta hills",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    priceAed: 0,
    priceUnit: "visit",
    durationMin: 70,
    blurb: "Short climb, wide view.",
    tags: ["scenic"],
  },
  {
    id: "act-hatta-kayak",
    destinationId: "hatta",
    kind: "activity",
    title: "Morning Kayak Slot",
    place: "Hatta Dam",
    photo: "/images/hd/traffic_road.jpg",
    priceAed: 140,
    priceUnit: "visit",
    durationMin: 75,
    blurb: "Shared boats, booked in advance.",
    tags: ["morning"],
  },
];

const HATTA_DINING: CatalogItem[] = [
  {
    id: "din-hatta-table",
    destinationId: "hatta",
    kind: "dining",
    title: "Dam Terrace Kitchen",
    place: "Hatta Dam",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 210,
    priceUnit: "table",
    durationMin: 80,
    blurb: "Grill plates, outdoor tables.",
    tags: ["default", "dinner"],
  },
  {
    id: "din-hatta-home",
    destinationId: "hatta",
    kind: "dining",
    title: "Village Table",
    place: "Hatta Heritage",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 160,
    priceUnit: "table",
    durationMin: 75,
    blurb: "Shared dishes, earlier seating.",
    tags: ["dinner", "value"],
  },
  {
    id: "din-hatta-luxe",
    destinationId: "hatta",
    kind: "dining",
    title: "Courtyard Supper",
    place: "Heritage Courtyard",
    photo: "/images/hd/levant_nar_dining.jpg",
    priceAed: 290,
    priceUnit: "table",
    durationMin: 90,
    blurb: "Private courtyard, fixed menu.",
    tags: ["dinner", "luxe"],
  },
];

export const CATALOG: CatalogItem[] = [
  ...RAK_HOTELS,
  ...RAK_SCENIC,
  ...RAK_DINING,
  ...HATTA_HOTELS,
  ...HATTA_ACTS,
  ...HATTA_DINING,
];

export function itemsFor(destinationId: DestinationId, kind?: CatalogItem["kind"]): CatalogItem[] {
  return CATALOG.filter((item) => item.destinationId === destinationId && (!kind || item.kind === kind));
}

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id);
}
