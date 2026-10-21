import { describe, expect, test } from "bun:test";
import { parsePersistedGlideUser, serializePersistedGlideUser } from "./glide-session";
import { bookTripStub, defaultTripRequest, proposeTripStub } from "./booking-stub";

describe("parsePersistedGlideUser", () => {
  test("returns null for empty or invalid payloads", () => {
    expect(parsePersistedGlideUser(null)).toBeNull();
    expect(parsePersistedGlideUser("")).toBeNull();
    expect(parsePersistedGlideUser("{")).toBeNull();
    expect(parsePersistedGlideUser(JSON.stringify({ name: "" }))).toBeNull();
  });

  test("resumes trip steps and reshaped flag", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "chat", reshaped: true }))).toMatchObject({
      name: "Alex",
      step: "chat",
      reshaped: true,
    });
  });

  test("coerces auth onboarding steps to choose", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "intro" }))).toMatchObject({
      name: "Alex",
      step: "choose",
    });
  });

  test("persists booking + request for booked trips", () => {
    const request = defaultTripRequest();
    const trip = proposeTripStub(request);
    const booking = bookTripStub(trip, "demo");
    const raw = serializePersistedGlideUser({
      name: "Sam",
      step: "route",
      reshaped: false,
      mode: "booked",
      request,
      proposedTrip: trip,
      booking,
    });
    const parsed = parsePersistedGlideUser(raw);
    expect(parsed?.booking?.tripId).toBe(booking.tripId);
    expect(parsed?.request?.where).toBe("Ras Al Khaimah");
    expect(parsed?.mode).toBe("booked");
  });

  test("booked session forces resume out of planning steps", () => {
    const booking = bookTripStub(proposeTripStub(defaultTripRequest()), "demo");
    const parsed = parsePersistedGlideUser(
      JSON.stringify({ name: "Sam", step: "propose", booking }),
    );
    expect(parsed?.step).toBe("route");
  });
});
