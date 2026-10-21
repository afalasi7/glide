import { describe, expect, test } from "bun:test";
import { planTrip } from "@/lib/planning";
import {
  FAILED_NOTICE,
  PENDING_NOTICE,
  REFUND_MESSAGE,
  resolveCheckoutStatusUi,
} from "./outcome";

describe("resolveCheckoutStatusUi", () => {
  const plan = planTrip({ destination: "ras-al-khaimah", budgetAED: 3000 });

  test("paid uses status trip and shows tickets path", () => {
    const booked = { ...plan, status: "booked" as const, confirmations: [] };
    const out = resolveCheckoutStatusUi({ status: "paid", trip: booked }, plan);
    expect(out.kind).toBe("paid");
    if (out.kind === "paid") expect(out.trip.status).toBe("booked");
  });

  test("pending is a waiting state with no tickets", () => {
    const out = resolveCheckoutStatusUi({ status: "pending" }, plan);
    expect(out).toEqual({ kind: "pending", notice: PENDING_NOTICE });
  });

  test("refunded shows REFUND_MESSAGE, keeps plan, clears booking", () => {
    const paidLooking = {
      ...plan,
      status: "paid" as const,
      confirmations: [{ itemId: "x", kind: "hotel" as const, confirmationCode: "X", title: "H" }],
      paidAt: "2026-01-01T00:00:00.000Z",
    };
    const out = resolveCheckoutStatusUi(
      { status: "refunded", message: REFUND_MESSAGE },
      paidLooking,
    );
    expect(out.kind).toBe("refunded");
    if (out.kind === "refunded") {
      expect(out.notice).toBe(REFUND_MESSAGE);
      expect(out.trip?.status).toBe("proposed");
      expect(out.trip?.confirmations).toBeUndefined();
      expect(out.trip?.id).toBe(plan.id);
    }
  });

  test("failed keeps plan with cancel copy", () => {
    const out = resolveCheckoutStatusUi({ status: "failed" }, plan);
    expect(out.kind).toBe("failed");
    if (out.kind === "failed") {
      expect(out.notice).toBe(FAILED_NOTICE);
      expect(out.trip?.id).toBe(plan.id);
      expect(out.trip?.status).toBe("proposed");
    }
  });
});
