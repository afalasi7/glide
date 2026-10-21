/** Demo booking types for `/app` plan-and-book. No live APIs. */

export type DestinationId = "rak" | "hatta";

export type BudgetBand = "smart" | "comfort" | "luxe";

export type TripPrefs = {
  destinationId: DestinationId;
  /** 0 = day trip; 1–3 overnight nights. */
  nights: number;
  travellers: number;
  budgetBand: BudgetBand;
  /** Optional free-text from chat prefill. */
  note?: string;
};

export type StopKind = "transfer" | "scenic" | "hotel" | "dining" | "activity";

export type CatalogItem = {
  id: string;
  destinationId: DestinationId;
  kind: Exclude<StopKind, "transfer">;
  title: string;
  place: string;
  photo: string;
  priceAed: number;
  /** Nightly for hotels; per seating/visit otherwise. */
  priceUnit: "night" | "visit" | "table";
  durationMin: number;
  blurb: string;
  tags: string[];
};

export type ProposedStop = {
  id: string;
  catalogId: string;
  kind: StopKind;
  day: number;
  /** HH:MM on that day. */
  startAt: string;
  title: string;
  place: string;
  photo: string;
  priceAed: number;
  durationMin: number;
  note?: string;
  bookingRef?: string;
};

export type ProposedTrip = {
  id: string;
  destinationId: DestinationId;
  prefs: TripPrefs;
  title: string;
  subtitle: string;
  nights: number;
  stops: ProposedStop[];
  transport: { mode: "drive"; label: string; priceAed: number };
  totalAed: number;
};

export type BookedTrip = ProposedTrip & {
  status: "booked-demo";
  bookedAt: string;
  confirmationCodes: Record<string, string>;
  checkoutMode: "stripe" | "demo";
  walletPasses: { id: string; title: string; detail: string }[];
};

export const BUDGET_DEFAULTS: Record<BudgetBand, { label: string; hintAed: number }> = {
  smart: { label: "Smart", hintAed: 1200 },
  comfort: { label: "Comfort", hintAed: 2400 },
  luxe: { label: "Luxe", hintAed: 4200 },
};

export const DESTINATION_LABELS: Record<DestinationId, string> = {
  rak: "Ras Al Khaimah",
  hatta: "Hatta",
};
