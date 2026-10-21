/**
 * Shared booking contract for `/app`.
 * Programmer owns the real planner/solver + Stripe server; UI consumes this shape.
 */

export type TripItemKind = "transfer" | "hotel" | "dining" | "activity" | "scenic";

export type TripRequest = {
  where: string;
  /** ISO date YYYY-MM-DD */
  from: string;
  /** ISO date YYYY-MM-DD */
  to: string;
  adults: number;
  kids: number;
  budgetAed: number;
};

export type TripItemAlternative = {
  id: string;
  title: string;
  time: string;
  priceAed: number;
  /** When true, swapping in this option needs a dinner shift confirm. */
  movesDinnerPast22?: boolean;
  photo?: string;
  place?: string;
};

export type TripItem = {
  id: string;
  kind: TripItemKind;
  title: string;
  time: string;
  priceAed: number;
  day: number;
  place?: string;
  photo?: string;
  alternatives: TripItemAlternative[];
};

export type ProposedDay = {
  day: number;
  label: string;
  items: TripItem[];
};

export type ProposedTrip = {
  id: string;
  destination: string;
  days: ProposedDay[];
  items: TripItem[];
  totalAed: number;
  summary: string;
};

export type BookingResult = {
  tripId: string;
  mode: "stripe" | "demo";
  bookedAt: string;
  confirmations: { itemId: string; label: string }[];
  walletPasses: { id: string; title: string; detail: string }[];
  checkoutUrl?: string;
};

export function isTripRequest(value: unknown): value is TripRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as TripRequest;
  return (
    typeof v.where === "string" &&
    typeof v.from === "string" &&
    typeof v.to === "string" &&
    typeof v.adults === "number" &&
    typeof v.kids === "number" &&
    typeof v.budgetAed === "number"
  );
}

export function isProposedTrip(value: unknown): value is ProposedTrip {
  if (!value || typeof value !== "object") return false;
  const v = value as ProposedTrip;
  return (
    typeof v.id === "string" &&
    typeof v.destination === "string" &&
    typeof v.totalAed === "number" &&
    Array.isArray(v.days) &&
    Array.isArray(v.items)
  );
}

export function isBookingResult(value: unknown): value is BookingResult {
  if (!value || typeof value !== "object") return false;
  const v = value as BookingResult;
  return (
    typeof v.tripId === "string" &&
    (v.mode === "stripe" || v.mode === "demo") &&
    Array.isArray(v.confirmations) &&
    Array.isArray(v.walletPasses)
  );
}
