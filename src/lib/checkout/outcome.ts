import { REFUND_MESSAGE } from "@/lib/booking/client";
import type { Trip } from "@/lib/planning";

export type CheckoutStatusValue = "paid" | "pending" | "failed" | "refunded";

export type CheckoutStatusPayload = {
  status: CheckoutStatusValue;
  trip?: Trip;
  message?: string;
};

/** UI outcome after reading checkout status (Stripe return or poll). */
export type CheckoutUiOutcome =
  | { kind: "paid"; trip: Trip }
  | { kind: "pending"; notice: string }
  | { kind: "failed"; notice: string; trip: Trip | null }
  | { kind: "refunded"; notice: string; trip: Trip | null };

const FAILED_NOTICE = "Payment didn't go through, so nothing was booked. Your plan is saved.";
const PENDING_NOTICE = "Payment is still processing. Hang tight — nothing is booked yet.";

/**
 * Map checkout status + the session-held plan into screen state.
 * - paid → confirmations / tickets
 * - pending → waiting (no tickets)
 * - refunded → REFUND_MESSAGE, plan kept, no tickets
 * - failed → cancel copy, plan kept
 */
export function resolveCheckoutStatusUi(
  status: CheckoutStatusPayload,
  storedPlan: Trip | null,
): CheckoutUiOutcome {
  if (status.status === "paid") {
    const trip = status.trip ?? storedPlan;
    if (trip) return { kind: "paid", trip };
    return { kind: "failed", notice: FAILED_NOTICE, trip: storedPlan };
  }

  if (status.status === "pending") {
    return { kind: "pending", notice: PENDING_NOTICE };
  }

  if (status.status === "refunded") {
    // Keep the proposed plan (strip paid/booked markers) so the traveller can retry.
    const plan = stripBooking(storedPlan ?? status.trip ?? null);
    return {
      kind: "refunded",
      notice: status.message?.trim() || REFUND_MESSAGE,
      trip: plan,
    };
  }

  return { kind: "failed", notice: FAILED_NOTICE, trip: stripBooking(storedPlan) };
}

function stripBooking(trip: Trip | null): Trip | null {
  if (!trip) return null;
  return {
    ...trip,
    status: "proposed",
    confirmations: undefined,
    paidAt: undefined,
    bookedAt: undefined,
    checkoutSessionId: undefined,
  };
}

export { REFUND_MESSAGE, FAILED_NOTICE, PENDING_NOTICE };
