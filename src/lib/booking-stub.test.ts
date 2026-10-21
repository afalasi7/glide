import { describe, expect, test } from "bun:test";
import {
  applySwapStub,
  bookTripStub,
  defaultTripRequest,
  defaultWeekendRange,
  guestCount,
  proposeTripStub,
} from "./booking-stub";
import { isBookingResult, isProposedTrip, isTripRequest } from "./booking-types";

describe("booking types + stub", () => {
  test("default weekend is Thu→Sat and request validates", () => {
    const range = defaultWeekendRange(new Date("2026-10-21T12:00:00Z")); // Wed
    expect(range.from).toBe("2026-10-22");
    expect(range.to).toBe("2026-10-24");
    const req = defaultTripRequest();
    expect(isTripRequest(req)).toBe(true);
    expect(req.where).toBe("Ras Al Khaimah");
    expect(req.budgetAed).toBe(3000);
    expect(req.adults).toBe(2);
  });

  test("stub proposes one RAK weekend with alternatives", () => {
    const trip = proposeTripStub(defaultTripRequest());
    expect(isProposedTrip(trip)).toBe(true);
    expect(trip.destination).toBe("Ras Al Khaimah");
    expect(trip.items.some((i) => i.kind === "hotel")).toBe(true);
    expect(trip.items.find((i) => i.id === "hotel")?.alternatives.length).toBeGreaterThan(0);
    expect(trip.summary).toContain("weekend in Ras Al Khaimah");
  });

  test("swap returns timing note; late hotel asks to shift dinner", () => {
    const trip = proposeTripStub(defaultTripRequest());
    const lodge = applySwapStub(trip, "hotel", "alt-hotel-lodge");
    expect(lodge.ok).toBe(true);
    if (lodge.ok) expect(lodge.note).toContain("re-checked your timings");

    const late = applySwapStub(trip, "hotel", "alt-hotel-marjan");
    expect(late.ok).toBe(false);
    if (!late.ok) {
      expect(late.message).toBe("That moves dinner past 22:00. Want me to shift it?");
      expect(late.tripIfShifted.items.find((i) => i.kind === "dining")?.time).toBe("22:15");
    }
  });

  test("booking result shape for demo confirmations", () => {
    const trip = proposeTripStub(defaultTripRequest());
    const booked = bookTripStub(trip, "demo");
    expect(isBookingResult(booked)).toBe(true);
    expect(booked.confirmations.some((c) => c.label === "Hotel booked ✓")).toBe(true);
    expect(guestCount(defaultTripRequest())).toBe(2);
  });
});
