/**
 * Client-safe booking entry — types and copy only.
 *
 * Jordan's checkout/outcome.ts (PR #5) should import from:
 *   `@/lib/booking/client`
 *
 * Do NOT import `@/lib/booking` from Client Components — that barrel pulls
 * Redis (`@upstash/redis`) and fulfillment/Stripe server paths.
 */

export { REFUND_MESSAGE } from "./messages";

export type { CompactTripSelection } from "./selection";
export {
  selectionFromTrip,
  tripFromSelection,
  selectionToMetadata,
  selectionFromMetadata,
} from "./selection";

/** Booking lifecycle statuses mirrored for UI (no store import). */
export type BookingRecordStatus = "pending" | "booked" | "failed" | "refunded";

export {
  PAYMENT_TRUST_LINE,
  type CheapestFix,
  type CheapestFixKind,
  type CheaperHotelSuggestion,
  type TripFacts,
  type PaymentStatus,
} from "@/lib/planning";
