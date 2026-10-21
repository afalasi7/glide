import type { TripGraph, Violation } from "@/lib/agent";

/** Stable destination keys for curated catalogs. Default: Ras Al Khaimah. */
export type DestinationId = "ras-al-khaimah" | "muscat" | "hatta";

export const BUDGET_PRESETS_AED = [1500, 3000, 6000] as const;
export const DEFAULT_BUDGET_AED = 3000;
export const DEFAULT_TRAVELLERS = 2;

export interface PlanTripRequest {
  /** Defaults to Ras Al Khaimah when omitted. */
  destination?: DestinationId | string;
  /** ISO date YYYY-MM-DD. Defaults to next Friday. */
  startDate?: string;
  /** ISO date YYYY-MM-DD (inclusive). Defaults to that Sunday (Fri–Sun long weekend). */
  endDate?: string;
  /** Adults. Defaults to 2. */
  travellers?: number;
  /** Optional kids count — reserved for UI; pricing uses adults for the demo. */
  kids?: number;
  /** Defaults to AED 3,000. Presets: 1,500 / 3,000 / 6,000. */
  budgetAED?: number;
  interests?: string[];
}

export type TripItemKind = "travel" | "hotel" | "activity" | "dining";

export type TravelMode = "drive" | "flight";

export type TripStatus = "proposed" | "approved" | "pending_payment" | "paid" | "booked" | "payment_failed";

/**
 * One bookable or timed piece of the itinerary.
 * `catalogId` is the server price source of truth — never trust client `costAED` at checkout.
 */
export interface TripItem {
  id: string;
  catalogId: string;
  kind: TripItemKind;
  title: string;
  location: string;
  day: number;
  /** Local wall-clock HH:MM */
  startTime: string;
  endTime?: string;
  costAED: number;
  photo?: string;
  bookingRef?: string;
  mode?: TravelMode;
  durationMin?: number;
  notes?: string;
}

export interface TripDay {
  day: number;
  date: string;
  /** Two or three timed plans for the day. */
  plans: TripItem[];
}

/**
 * Destination-specific highlight — only present when the curated item is on the
 * trip at an accepted time. Swap away or retime that item and the copy disappears.
 */
export interface TripHighlight {
  itemId: string;
  catalogId: string;
  title: string;
  /** Absolute start as HH:MM on its day. */
  startTime: string;
  day: number;
  date: string;
  /** Short label for UI chrome. */
  label: string;
  /** Exact sentence for the Trip tab (destination-specific). */
  copy: string;
  /** Optional hard cutoff the UI may surface (HH:MM). */
  cutoffTime?: string;
}

export interface CheaperHotelSuggestion {
  catalogId: string;
  title: string;
  location: string;
  costAED: number;
  /** How much cheaper than the current hotel line (trip-priced). */
  savesAED: number;
}

/**
 * Computed facts for the Trip tab — never marketing claims.
 * `totalAED` matches `totalCostAED` and is the checkout recomputation input.
 */
export interface TripFacts {
  withinBudget: boolean;
  totalAED: number;
  overBudgetByAED: number;
  /** Omitted when the highlight plan item is missing or not at the expected time. */
  highlight?: TripHighlight;
  cheaperHotel?: CheaperHotelSuggestion;
}

/**
 * Complete proposed trip — presentation fields for the Trip tab plus a solver graph
 * so reshape / applySwap can reuse evaluate() and the mock tools.
 */
export interface Trip {
  id: string;
  destination: DestinationId;
  destinationLabel: string;
  startDate: string;
  endDate: string;
  travellers: number;
  kids?: number;
  budgetAED: number;
  interests?: string[];
  travel: TripItem;
  /** Homebound leg on the last day (multi-day trips). */
  returnTravel?: TripItem;
  hotel: TripItem;
  days: TripDay[];
  /** @deprecated Prefer facts.totalAED — kept equal for older callers. */
  totalCostAED: number;
  facts: TripFacts;
  status: TripStatus;
  graph: TripGraph;
  createdAt: string;
  checkoutSessionId?: string;
  paidAt?: string;
  bookedAt?: string;
  /** Demo confirmations — only set after payment success or demo confirm. */
  confirmations?: BookingConfirmation[];
}

export interface SwapOption {
  id: string;
  itemId: string;
  catalogId: string;
  title: string;
  location: string;
  costAED: number;
  startTime?: string;
  endTime?: string;
  photo?: string;
  deltaAED: number;
  notes?: string;
}

export interface LateItemFlag {
  itemId: string;
  title: string;
  startTime: string;
  kind: TripItemKind;
  /** True when startTime is strictly after 22:00. */
  past2200: boolean;
}

export interface ApplySwapResult {
  trip: Trip;
  violations: Violation[];
  /** True when evaluate() reports zero violations after the swap. */
  timingsHold: boolean;
  /** Items whose start is after 22:00 — UI can prompt to shift dinner. */
  lateItems: LateItemFlag[];
}

/** Wallet-pass payload compatible with the existing WalletPass demo shape. */
export interface WalletPassData {
  photo?: string;
  title: string;
  time: string;
  date: string;
  note?: string;
  rows: [string, string][];
  ref: string;
}

export interface BookingConfirmation {
  itemId: string;
  kind: TripItemKind;
  confirmationCode: string;
  title: string;
  walletPass?: WalletPassData;
}

export interface BookingResult {
  tripId: string;
  confirmations: BookingConfirmation[];
  bookedAt: string;
  trip: Trip;
}

export type PaymentStatus = "paid" | "pending" | "failed";

/**
 * Copy for the /app pay step only — do not put on the landing page in test mode.
 * Exact string required by product.
 */
export const PAYMENT_TRUST_LINE =
  "Payments are encrypted and handled by Stripe. Glide never sees or stores your card.";
