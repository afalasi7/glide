import type { OpenWindow, Weekday } from "./hours";
import type { DestinationId, TravelMode, TripItemKind } from "./types";
import { assertSpecificVenueTitle } from "./venues";

/** Budget lodging tier — planner picks by trip budgetAED. */
export type HotelTier = "value" | "mid" | "luxury";

/** Curated option used for planning, swaps, and server-side price recomputation. */
export interface CatalogOption {
  catalogId: string;
  kind: TripItemKind;
  title: string;
  location: string;
  costAED: number;
  /** Venue's own page, official tourism page, or Google Maps — never a search aggregator. */
  sourceUrl: string;
  photo?: string;
  mode?: TravelMode;
  defaultStartTime?: string;
  durationMin?: number;
  /**
   * Fixed tour/start slots (HH:MM). When set, the scheduler and swaps may only
   * place the item at one of these times.
   */
  startSlots?: string[];
  /** Minutes after landing/arrival before ready for hotel or first activity (flights). */
  transferMin?: number;
  notes?: string;
  tags?: string[];
  /** Lodging tier for budget-aware hotel selection. */
  hotelTier?: HotelTier;
  /**
   * Shared place key. A trip visits each non-repeatable area at most once,
   * except hotel-campus restaurants may appear once for lunch and once for dinner.
   */
  area?: string;
  /** Resort/hotel campus for transit + lunch/dinner pairing rules. */
  hotelCampus?: string;
  /** Geographic zone for drive-time buffers between stops. */
  zone?: "coast" | "city" | "desert" | "mountain" | "airport";
  /** Days open; omit = every day. */
  openDays?: Weekday[];
  /**
   * Wall-clock opening window(s) on open days.
   * Pass an array for split lunch/dinner services (e.g. Ubhar).
   */
  openHours?: OpenWindow | OpenWindow[];
  /**
   * Youngest age allowed (years). Parties with any child younger than this
   * are not scheduled here (e.g. Al Angham: no children under 6 → minAge 6).
   */
  minAge?: number;
  /** When true, the same venue/area may appear more than once. Default false. */
  repeatable?: boolean;
}

export interface DestinationHighlightSpec {
  catalogId: string;
  label: string;
  copy: string;
  earliestStart: string;
  latestStart: string;
  cutoffTime?: string;
}

export interface DestinationCatalog {
  id: DestinationId;
  label: string;
  originLabel: string;
  travel: CatalogOption[];
  hotels: CatalogOption[];
  plans: CatalogOption[];
  highlight: DestinationHighlightSpec;
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
    highlight: {
      catalogId: "rak-jais-deck",
      label: "Sunset at Jebel Jais",
      copy: "Jebel Jais is timed for sunset.",
      earliestStart: "16:30",
      latestStart: "18:00",
      cutoffTime: "18:00",
    },
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
        transferMin: 0,
        photo: RAK_PHOTOS.road,
        notes: "Self-drive; Friday 16:00–19:00 adds peak traffic.",
        tags: ["road", "scenic"],
        zone: "city",
        sourceUrl: "https://visitrasalkhaimah.com/",
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
        zone: "coast",
        sourceUrl: "https://visitrasalkhaimah.com/",
      },
    ],
    hotels: [
      {
        catalogId: "rak-hotel-hampton",
        kind: "hotel",
        title: "Hampton by Hilton Marjan Island",
        location: "Marjan Island Boulevard, Ras Al Khaimah",
        costAED: 280,
        defaultStartTime: "18:00",
        durationMin: 40,
        notes: "Value beach hotel · complimentary hot breakfast.",
        tags: ["value", "beach"],
        hotelTier: "value",
        zone: "coast",
        hotelCampus: "hampton-marjan",
        sourceUrl: "https://www.hilton.com/en/hotels/rktmahx-hampton-marjan-island/",
      },
      {
        catalogId: "rak-hotel-hilton",
        kind: "hotel",
        title: "Hilton Garden Inn Ras Al Khaimah",
        location: "Bin Daher Street, Al Nakheel, Ras Al Khaimah",
        costAED: 390,
        defaultStartTime: "18:00",
        durationMin: 40,
        notes: "Mid-range · harbour views, outdoor pool.",
        tags: ["mid", "value"],
        hotelTier: "mid",
        zone: "coast",
        sourceUrl: "https://www.hilton.com/en/hotels/rkthigi-hilton-garden-inn-ras-al-khaimah/",
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
        tags: ["resort", "beach", "mid"],
        hotelTier: "mid",
        zone: "coast",
        hotelCampus: "ic-mina-al-arab",
        sourceUrl: "https://icrasalkhaimah.com/en/",
      },
      {
        catalogId: "rak-hotel-ritz-wadi",
        kind: "hotel",
        title: "The Ritz-Carlton Ras Al Khaimah, Al Wadi Desert",
        location: "Al Wadi Desert, Ras Al Khaimah",
        costAED: 1250,
        defaultStartTime: "18:45",
        durationMin: 45,
        notes: "Inland desert resort · ~40 min from the coast.",
        tags: ["luxury", "desert"],
        hotelTier: "luxury",
        zone: "desert",
        hotelCampus: "ritz-al-wadi",
        sourceUrl:
          "https://www.ritzcarlton.com/en/hotels/rktrw-the-ritz-carlton-ras-al-khaimah-al-wadi-desert/",
      },
    ],
    plans: [
      {
        catalogId: "rak-jais-deck",
        kind: "activity",
        title: "Jebel Jais Viewing Deck Park",
        location: "Jebel Jais, Ras Al Khaimah",
        costAED: 0,
        defaultStartTime: "17:15",
        durationMin: 60,
        photo: RAK_PHOTOS.jais,
        notes: "Sunset ~17:30–18:00 · park open until 23:00 Saturday.",
        tags: ["scenic", "mountains", "sunset"],
        area: "jebel-jais",
        zone: "mountain",
        openDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        openHours: { open: "08:00", close: "23:00" },
        sourceUrl: "https://visitrasalkhaimah.com/discover/attractions/jais-viewing-deck-park/",
      },
      {
        catalogId: "rak-national-museum",
        kind: "activity",
        title: "National Museum of Ras Al Khaimah",
        location: "Al Hisn Road, Old Town, Ras Al Khaimah",
        costAED: 25,
        defaultStartTime: "09:00",
        durationMin: 90,
        notes: "Fort museum · archaeology and pearling history.",
        tags: ["culture", "city"],
        area: "rak-national-museum",
        zone: "city",
        // Closed Monday; Fri–Sun trip uses Saturday morning.
        openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
        openHours: { open: "08:00", close: "18:00" },
        sourceUrl:
          "https://visitrasalkhaimah.com/discover/attractions/national-museum-of-ras-al-khaimah/",
      },
      {
        catalogId: "rak-dhayah-fort",
        kind: "activity",
        title: "Dhayah Fort",
        location: "Dhayah, Ras Al Khaimah",
        costAED: 0,
        defaultStartTime: "09:30",
        durationMin: 75,
        notes: "Hilltop fort · Sunday–Thursday 09:00–17:00 · closed Friday and Saturday.",
        tags: ["culture", "city", "scenic"],
        area: "dhayah-fort",
        zone: "city",
        openDays: ["sun", "mon", "tue", "wed", "thu"],
        openHours: { open: "09:00", close: "17:00" },
        sourceUrl: "https://visitrasalkhaimah.com/discover/attractions/dhayah-fort/",
      },
      {
        catalogId: "rak-beach-club",
        kind: "activity",
        title: "Al Marjan Island beach morning",
        location: "Al Marjan Island, Ras Al Khaimah",
        costAED: 120,
        defaultStartTime: "09:30",
        durationMin: 120,
        notes: "Sunbeds and shallow swimming.",
        tags: ["beach", "relax"],
        area: "al-marjan",
        zone: "coast",
        openHours: { open: "08:00", close: "19:00" },
        sourceUrl: "https://visitrasalkhaimah.com/discover/attractions/al-marjan-island/",
      },
      {
        catalogId: "rak-corniche-evening",
        kind: "activity",
        title: "Al Hamra Marina waterfront stroll",
        location: "Al Hamra Village, Ras Al Khaimah",
        costAED: 0,
        defaultStartTime: "18:30",
        durationMin: 60,
        notes: "Easy walk after check-in · marina lights.",
        tags: ["relax", "evening"],
        area: "al-hamra-corniche",
        zone: "coast",
        openHours: { open: "06:00", close: "23:00" },
        sourceUrl: "https://visitrasalkhaimah.com/",
      },
      {
        catalogId: "rak-suwaidi-pearls",
        kind: "activity",
        title: "Suwaidi Pearl Farm",
        location: "Al Rams Corniche, Ras Al Khaimah",
        costAED: 95,
        defaultStartTime: "10:00",
        durationMin: 150,
        startSlots: ["10:00", "12:30", "15:00"],
        notes: "Individual tours 10:00, 12:30, 15:00 · ~2.5 hours each.",
        tags: ["culture", "scenic"],
        area: "suwaidi-pearls",
        zone: "coast",
        openHours: { open: "09:00", close: "18:00" },
        sourceUrl: "https://visitrasalkhaimah.com/discover/activities/suwaidi-pearls/",
      },
      {
        catalogId: "rak-dinner-levant",
        kind: "dining",
        title: "Levant & Nar",
        location: "InterContinental Mina Al Arab, Ras Al Khaimah",
        costAED: 420,
        defaultStartTime: "20:00",
        durationMin: 90,
        photo: RAK_PHOTOS.dinner,
        notes: "Levantine & Turkish · dinner Tue–Sun 18:00–22:30 · closed Monday.",
        tags: ["dining", "evening", "luxury"],
        area: "levant-nar",
        zone: "coast",
        hotelCampus: "ic-mina-al-arab",
        openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
        openHours: { open: "18:00", close: "22:30" },
        sourceUrl: "https://icrasalkhaimah.com/en/restaurants-bars/levant-nar/",
      },
      {
        catalogId: "rak-dinner-farmhouse",
        kind: "dining",
        title: "Farmhouse by Syrco",
        location: "The Ritz-Carlton Ras Al Khaimah, Al Wadi Desert",
        costAED: 450,
        defaultStartTime: "19:00",
        durationMin: 90,
        notes: "Farm-to-table dinner · inland Al Wadi (~40 min from coast).",
        tags: ["dining", "evening", "luxury"],
        area: "farmhouse-syrco",
        zone: "desert",
        hotelCampus: "ritz-al-wadi",
        openHours: { open: "18:00", close: "23:00" },
        sourceUrl:
          "https://www.ritzcarlton.com/en/hotels/rktrw-the-ritz-carlton-ras-al-khaimah-al-wadi-desert/dining/",
      },
      {
        catalogId: "rak-kaheela",
        kind: "dining",
        title: "Kaheela",
        location: "The Ritz-Carlton Ras Al Khaimah, Al Wadi Desert",
        costAED: 220,
        defaultStartTime: "12:30",
        durationMin: 75,
        notes: "Middle Eastern and Indian · lunch and dinner at Al Wadi.",
        tags: ["dining", "lunch", "evening", "mid"],
        area: "kaheela",
        zone: "desert",
        hotelCampus: "ritz-al-wadi",
        openHours: { open: "12:00", close: "23:00" },
        sourceUrl:
          "https://www.ritzcarlton.com/en/hotels/rktrw-the-ritz-carlton-ras-al-khaimah-al-wadi-desert/dining/",
      },
      {
        catalogId: "rak-saffar",
        kind: "dining",
        title: "Saffar",
        location: "InterContinental Mina Al Arab, Ras Al Khaimah",
        costAED: 180,
        defaultStartTime: "19:00",
        durationMin: 75,
        notes: "Beachfront buffet · lunch and dinner.",
        tags: ["dining", "lunch", "evening", "value", "mid"],
        area: "saffar",
        zone: "coast",
        hotelCampus: "ic-mina-al-arab",
        openHours: { open: "12:00", close: "23:00" },
        sourceUrl: "https://icrasalkhaimah.com/en/restaurants-bars/saffar/",
      },
      {
        catalogId: "rak-lunch-marina",
        kind: "dining",
        title: "Al Hamra Marina and Yacht Club Restaurant",
        location: "Al Hamra Marina, Ras Al Khaimah",
        costAED: 150,
        defaultStartTime: "12:30",
        durationMin: 60,
        notes: "Marina views · all-day dining.",
        tags: ["dining", "value", "lunch"],
        area: "al-hamra-yacht-club",
        zone: "coast",
        openHours: { open: "08:00", close: "23:00" },
        sourceUrl:
          "https://www.google.com/maps/search/?api=1&query=Al+Hamra+Marina+and+Yacht+Club+Restaurant+Ras+Al+Khaimah",
      },
      {
        catalogId: "rak-dinner-flavors",
        kind: "dining",
        title: "Flavors Restaurant",
        location: "Hampton by Hilton Marjan Island, Ras Al Khaimah",
        costAED: 140,
        defaultStartTime: "19:30",
        durationMin: 75,
        notes: "All-day dining at Hampton Marjan Island · value evening option.",
        tags: ["dining", "value", "evening"],
        area: "flavors-hampton",
        zone: "coast",
        hotelCampus: "hampton-marjan",
        openHours: { open: "18:00", close: "23:00" },
        sourceUrl: "https://www.hilton.com/en/hotels/rktmahx-hampton-marjan-island/dining/",
      },
    ],
  },
  muscat: {
    id: "muscat",
    label: "Muscat",
    originLabel: "Dubai International (DXB)",
    highlight: {
      catalogId: "mct-mutrah",
      label: "Mutrah Corniche evening",
      copy: "Your evening at Mutrah Corniche is set for the cooler hours.",
      earliestStart: "16:00",
      latestStart: "18:30",
    },
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
        transferMin: 40,
        notes: "Economy one-way · ~40 min transfer MCT → Qurum hotels.",
        tags: ["flight"],
        zone: "airport",
        sourceUrl: "https://www.flydubai.com/",
      },
      {
        catalogId: "mct-drive-wajajah",
        kind: "travel",
        title: "Drive Dubai → Muscat via Al Wajajah",
        location: "E11 / Al Wajajah border · ~5h30",
        costAED: 180,
        mode: "drive",
        defaultStartTime: "10:00",
        durationMin: 330,
        transferMin: 0,
        notes: "Bring your passport and Oman car insurance.",
        tags: ["road", "border"],
        zone: "city",
        sourceUrl: "https://experienceoman.om/en/",
      },
    ],
    hotels: [
      {
        catalogId: "mct-hotel-grand",
        kind: "hotel",
        title: "Grand Hyatt Muscat",
        location: "Shati Al Qurum, Muscat",
        costAED: 640,
        defaultStartTime: "14:30",
        durationMin: 40,
        notes: "Gardens and spa · solid mid-range for Muscat.",
        tags: ["mid", "city"],
        hotelTier: "mid",
        zone: "city",
        sourceUrl: "https://www.hyatt.com/en-US/hotel/oman/grand-hyatt-muscat/mushi",
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
        tags: ["beach", "city", "mid"],
        hotelTier: "mid",
        zone: "coast",
        sourceUrl: "https://www.marriott.com/en-us/hotels/mctwh-w-muscat/overview/",
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
        hotelTier: "luxury",
        zone: "coast",
        sourceUrl: "https://www.ritzcarlton.com/en/hotels/mctal-al-bustan-palace/",
      },
    ],
    plans: [
      {
        catalogId: "mct-mutrah",
        kind: "activity",
        title: "Mutrah Corniche evening walk",
        location: "Mutrah Corniche, Muscat",
        costAED: 40,
        defaultStartTime: "16:30",
        durationMin: 90,
        notes: "Souq and harbour in the cooler evening hours.",
        tags: ["culture", "city", "evening"],
        area: "mutrah-corniche",
        zone: "coast",
        openHours: { open: "06:00", close: "23:00" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat/mutrah-corniche",
      },
      {
        catalogId: "mct-opera",
        kind: "activity",
        title: "Royal Opera House Muscat",
        location: "Shati Al Qurum, Muscat",
        costAED: 30,
        defaultStartTime: "10:00",
        durationMin: 75,
        notes: "House tours Sat–Thu · closed Friday.",
        tags: ["culture"],
        area: "royal-opera-house",
        zone: "city",
        openDays: ["sat", "sun", "mon", "tue", "wed", "thu"],
        openHours: { open: "08:30", close: "17:30" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat/royal-opera-house",
      },
      {
        catalogId: "mct-grand-mosque",
        kind: "activity",
        title: "Sultan Qaboos Grand Mosque",
        location: "Bawshar, Muscat",
        costAED: 30,
        defaultStartTime: "09:00",
        durationMin: 90,
        notes: "Visitors Sat–Thu 08:00–11:00 · closed Friday.",
        tags: ["culture"],
        area: "grand-mosque",
        zone: "city",
        openDays: ["sat", "sun", "mon", "tue", "wed", "thu"],
        openHours: { open: "08:00", close: "11:00" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat/sultan-qaboos-grand-mosque",
      },
      {
        catalogId: "mct-bait-al-zubair",
        kind: "activity",
        title: "Bait Al Zubair Museum",
        location: "Old Muscat",
        costAED: 35,
        defaultStartTime: "14:00",
        durationMin: 90,
        notes: "Heritage collection · closed Friday only.",
        tags: ["culture", "city"],
        area: "bait-al-zubair",
        zone: "city",
        openDays: ["sat", "sun", "mon", "tue", "wed", "thu"],
        openHours: { open: "09:00", close: "17:00" },
        sourceUrl: "https://www.baitalzubair.com/Museum/Museum",
      },
      {
        catalogId: "mct-qurum-beach",
        kind: "activity",
        title: "Qurum Beach promenade",
        location: "Qurum Beach, Muscat",
        costAED: 0,
        defaultStartTime: "15:00",
        durationMin: 75,
        notes: "Open waterfront walk · fills Friday afternoon after landing.",
        tags: ["relax", "beach"],
        area: "qurum-beach",
        zone: "coast",
        openHours: { open: "06:00", close: "22:00" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat",
      },
      {
        catalogId: "mct-kalbuh-park",
        kind: "activity",
        title: "Kalbuh Park corniche walk",
        location: "Kalbuh Park, Muscat",
        costAED: 0,
        defaultStartTime: "09:00",
        durationMin: 75,
        notes: "Seafront park · open daily, useful on Fridays when museums close.",
        tags: ["relax", "scenic", "morning"],
        area: "kalbuh-park",
        zone: "coast",
        openHours: { open: "06:00", close: "22:00" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat",
      },
      {
        catalogId: "mct-mutrah-souq",
        kind: "activity",
        title: "Mutrah Souq morning browse",
        location: "Mutrah Souq, Muscat",
        costAED: 0,
        defaultStartTime: "09:30",
        durationMin: 90,
        notes: "Covered souq lanes · open daily from morning.",
        tags: ["culture", "city", "morning"],
        area: "mutrah-souq",
        zone: "coast",
        openHours: { open: "08:00", close: "13:00" },
        sourceUrl: "https://experienceoman.om/en/destinations/muscat/mutrah-souq",
      },
      {
        catalogId: "mct-lunch-bait-al-luban",
        kind: "dining",
        title: "Bait Al Luban",
        location: "Al Mina Street, Mutrah Corniche, Muscat",
        costAED: 180,
        defaultStartTime: "12:30",
        durationMin: 75,
        notes: "Omani food · balcony over the Corniche.",
        tags: ["dining", "value", "lunch"],
        area: "bait-al-luban",
        zone: "coast",
        openHours: { open: "12:00", close: "23:00" },
        sourceUrl: "https://baitalluban.com/",
      },
      {
        catalogId: "mct-dinner-aroos",
        kind: "dining",
        title: "Aroos Al Bahar",
        location: "Opposite Mutrah fish market, Mutrah, Muscat",
        costAED: 220,
        defaultStartTime: "18:30",
        durationMin: 90,
        notes: "Seafood opposite the fish market · open 09:00–midnight.",
        tags: ["dining", "evening", "beach", "value"],
        area: "aroos-al-bahar",
        zone: "coast",
        openHours: { open: "09:00", close: "23:45" },
        sourceUrl:
          "https://www.petitfute.co.uk/v45484-mascate/c1165-restaurants/c1031-cuisines-du-monde/c1037-cuisine-du-proche-et-moyen-orient/2068008-arouse-al-bahar-restaurant.html",
      },
      {
        catalogId: "mct-lunch-rawya",
        kind: "dining",
        title: "Rawya",
        location: "Mandarin Oriental, Shatti Al Qurum, Muscat",
        costAED: 200,
        defaultStartTime: "12:30",
        durationMin: 75,
        notes: "Mediterranean coastal dining · lunch 12:30–16:00 daily including Friday.",
        tags: ["dining", "lunch", "mid"],
        area: "rawya-lunch",
        zone: "city",
        openHours: { open: "12:30", close: "16:00" },
        sourceUrl: "https://www.mandarinoriental.com/en/muscat/shatti-al-qurum/dine/rawya",
      },
      {
        catalogId: "mct-dinner-rawya",
        kind: "dining",
        title: "Rawya",
        location: "Mandarin Oriental, Shatti Al Qurum, Muscat",
        costAED: 280,
        defaultStartTime: "19:00",
        durationMin: 90,
        notes: "Mediterranean coastal dining · dinner 18:30–22:00 daily.",
        tags: ["dining", "evening", "mid"],
        area: "rawya-dinner",
        zone: "city",
        openHours: { open: "18:30", close: "22:00" },
        sourceUrl: "https://www.mandarinoriental.com/en/muscat/shatti-al-qurum/dine/rawya",
      },
      {
        catalogId: "mct-lunch-filli",
        kind: "dining",
        title: "FiLLi Cafe Shatti Al Qurum",
        location: "Al Muntazah St, Shatti Al Qurum, Muscat",
        costAED: 90,
        defaultStartTime: "12:00",
        durationMin: 60,
        notes: "Zafran chai and light bites · open daily including Friday.",
        tags: ["dining", "lunch", "value"],
        area: "filli-shatti",
        zone: "city",
        openHours: { open: "07:00", close: "23:00" },
        sourceUrl: "https://fillicafe.com/om/en/stores/muscat/shatti-al-qurum-muscat",
      },
      {
        catalogId: "mct-lunch-ubhar",
        kind: "dining",
        title: "Ubhar",
        location: "Bareeq Al Shatti, Shatti Al Qurum, Muscat",
        costAED: 220,
        defaultStartTime: "12:30",
        durationMin: 75,
        notes: "Contemporary Omani · lunch 12:00–15:30 daily.",
        tags: ["dining", "lunch", "value"],
        area: "ubhar",
        zone: "city",
        openHours: { open: "12:00", close: "15:30" },
        sourceUrl: "https://ubharoman.com/",
      },
      {
        catalogId: "mct-dinner-ubhar",
        kind: "dining",
        title: "Ubhar",
        location: "Bareeq Al Shatti, Shatti Al Qurum, Muscat",
        costAED: 320,
        defaultStartTime: "19:30",
        durationMin: 90,
        notes: "Contemporary Omani · dinner 18:30–23:00 daily.",
        tags: ["dining", "evening", "mid"],
        area: "ubhar",
        zone: "city",
        openHours: { open: "18:30", close: "23:00" },
        sourceUrl: "https://ubharoman.com/",
      },
      {
        catalogId: "mct-lunch-al-angham",
        kind: "dining",
        title: "Al Angham",
        location: "Beside Royal Opera House Muscat, Shati Al Qurum",
        costAED: 260,
        defaultStartTime: "12:30",
        durationMin: 75,
        notes: "Fine Omani dining · Sun–Thu lunch 12:00–16:00 · no children under 6.",
        tags: ["dining", "lunch", "mid"],
        area: "al-angham",
        zone: "city",
        // Official about-us: Sunday–Thursday lunch & dinner; closed Friday (and Saturday).
        openDays: ["sun", "mon", "tue", "wed", "thu"],
        openHours: [
          { open: "12:00", close: "16:00" },
          { open: "19:00", close: "23:00" },
        ],
        minAge: 6,
        sourceUrl: "https://www.alanghamoman.com/about-us/",
      },
    ],
  },
  hatta: {
    id: "hatta",
    label: "Hatta",
    originLabel: "Dubai Marina",
    highlight: {
      catalogId: "hatta-kayak",
      label: "Morning kayak at Hatta Dam",
      copy: "The dam kayaking is booked for the calm morning water.",
      earliestStart: "07:00",
      latestStart: "10:00",
    },
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
        zone: "mountain",
        sourceUrl: "https://www.visithatta.com/en/",
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
        zone: "desert",
        sourceUrl: "https://www.visithatta.com/en/",
      },
    ],
    hotels: [
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
        hotelTier: "value",
        zone: "mountain",
        sourceUrl: "https://www.visithatta.com/en/",
      },
      {
        catalogId: "hatta-hotel-ja",
        kind: "hotel",
        title: "JA Hatta Fort Hotel",
        location: "Hatta, Dubai",
        costAED: 480,
        defaultStartTime: "16:30",
        durationMin: 40,
        notes: "Hilltop fort rooms · pool and kids club.",
        tags: ["mid", "family"],
        hotelTier: "mid",
        zone: "mountain",
        hotelCampus: "ja-hatta-fort",
        sourceUrl: "https://www.jaresortshotels.com/dubai/ja-hatta-fort-hotel",
      },
    ],
    plans: [
      {
        catalogId: "hatta-kayak",
        kind: "activity",
        title: "Hatta Kayak at Hatta Dam",
        location: "Hatta Dam, Dubai",
        costAED: 110,
        defaultStartTime: "08:30",
        durationMin: 90,
        notes: "Cooler morning water · Fri–Sun 07:00–21:00.",
        tags: ["adventure", "water"],
        area: "hatta-dam",
        zone: "mountain",
        openDays: ["fri", "sat", "sun", "mon", "tue", "wed", "thu"],
        openHours: { open: "07:00", close: "21:00" },
        sourceUrl: "https://hattakayak.com/",
      },
      {
        catalogId: "hatta-dam-viewpoint",
        kind: "activity",
        title: "Hatta Dam viewpoint",
        location: "Hatta Dam ramp and view deck, Dubai",
        costAED: 0,
        defaultStartTime: "08:30",
        durationMin: 60,
        notes: "Scenic ramp and mountain views over the dam.",
        tags: ["scenic", "morning"],
        area: "hatta-dam-viewpoint",
        zone: "mountain",
        openHours: { open: "07:00", close: "19:00" },
        sourceUrl: "https://www.visitdubai.com/en/places-to-visit/hatta-dam-2",
      },
      {
        catalogId: "hatta-heritage",
        kind: "activity",
        title: "Hatta Heritage Village",
        location: "Hatta Old Village, Dubai",
        costAED: 0,
        defaultStartTime: "10:30",
        durationMin: 90,
        notes: "Restored forts, watchtowers, and falaj · daily 08:00–20:00.",
        tags: ["culture"],
        area: "hatta-heritage",
        zone: "mountain",
        openHours: { open: "08:00", close: "20:00" },
        sourceUrl: "https://www.visithatta.com/en/offer/hatta-wadi-hub",
      },
      {
        catalogId: "hatta-honeybee",
        kind: "activity",
        title: "Hatta Honeybee Garden",
        location: "Hatta Wadi Hub, Dubai",
        costAED: 40,
        defaultStartTime: "09:30",
        durationMin: 75,
        notes: "Bee garden visit · 09:00–17:00.",
        tags: ["culture", "scenic"],
        area: "hatta-honeybee",
        zone: "mountain",
        openHours: { open: "09:00", close: "17:00" },
        sourceUrl: "https://www.visithatta.com/en/offer/hatta-wadi-hub",
      },
      {
        catalogId: "hatta-wadi-hubbers",
        kind: "activity",
        title: "Hubbers mountain bike trails",
        location: "Hatta Wadi Hub, Dubai",
        costAED: 90,
        defaultStartTime: "15:30",
        durationMin: 75,
        notes: "Trail network at Wadi Hub · daily 06:00–18:00.",
        tags: ["adventure", "scenic"],
        area: "hatta-wadi-hubbers",
        zone: "mountain",
        openHours: { open: "06:00", close: "18:00" },
        sourceUrl: "https://www.visithatta.com/en/offer/hatta-wadi-hub",
      },
      {
        catalogId: "hatta-dinner-jeema",
        kind: "dining",
        title: "Jeema",
        location: "JA Hatta Fort Hotel, Hatta",
        costAED: 280,
        defaultStartTime: "19:30",
        durationMin: 90,
        notes: "Contemporary Indian · dinner only.",
        tags: ["dining", "evening", "mid"],
        area: "jeema",
        zone: "mountain",
        hotelCampus: "ja-hatta-fort",
        openHours: { open: "18:30", close: "22:30" },
        sourceUrl:
          "https://www.thenationalnews.com/travel/2023/11/18/hatta-guide-activities-accommodation-food/",
      },
      {
        catalogId: "hatta-dinner-hajarain",
        kind: "dining",
        title: "Al Hajarain Restaurant",
        location: "Hatta Heritage Village, Hatta",
        costAED: 160,
        defaultStartTime: "19:00",
        durationMin: 90,
        notes: "Traditional Emirati dining at the heritage village.",
        tags: ["dining", "evening", "value"],
        area: "al-hajarain",
        zone: "mountain",
        // Dinner sitting — venue serves through the evening.
        openHours: { open: "18:00", close: "22:00" },
        sourceUrl: "https://www.visithatta.com/en/restaurants/al-hajarain",
      },
      {
        catalogId: "hatta-lunch-gazebo",
        kind: "dining",
        title: "Café Gazebo",
        location: "JA Hatta Fort Hotel, Hatta",
        costAED: 120,
        defaultStartTime: "12:30",
        durationMin: 60,
        notes: "Alfresco lunch overlooking the pool and Hajar peaks.",
        tags: ["dining", "value", "lunch"],
        area: "cafe-gazebo",
        zone: "mountain",
        hotelCampus: "ja-hatta-fort",
        openHours: { open: "12:00", close: "18:30" },
        sourceUrl:
          "https://www.jaresortshotels.com/restaurant-detail/dubai/ja-hatta-fort-hotel/cafe-gazebo",
      },
      {
        catalogId: "hatta-lunch-wild-cafe",
        kind: "dining",
        title: "Hatta Wild Café",
        location: "Hatta Wadi Hub, Dubai",
        costAED: 95,
        defaultStartTime: "12:00",
        durationMin: 60,
        notes: "Brews and bites at Wadi Hub · open daily.",
        tags: ["dining", "value", "lunch"],
        area: "hatta-wild-cafe",
        zone: "mountain",
        openHours: { open: "06:00", close: "22:00" },
        sourceUrl: "https://www.visithatta.com/en/offer/hatta-wadi-hub",
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

/** Assert every catalog row has a concrete title and a non-aggregator sourceUrl. */
export function assertCatalogQuality(dest?: DestinationCatalog): void {
  const list = dest ? [dest] : Object.values(DESTINATIONS);
  for (const d of list) {
    for (const opt of [...d.travel, ...d.hotels, ...d.plans]) {
      assertSpecificVenueTitle(opt.title, opt.catalogId);
      if (!opt.sourceUrl?.startsWith("http")) {
        throw new Error(`Missing sourceUrl for ${opt.catalogId}`);
      }
      if (/exa\.ai|google\.com\/search|bing\.com\/search/i.test(opt.sourceUrl)) {
        throw new Error(`Aggregator sourceUrl for ${opt.catalogId}: ${opt.sourceUrl}`);
      }
    }
  }
}
