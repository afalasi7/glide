import { describe, expect, test } from "bun:test";
import {
  parsePersistedGlideUser,
  serializePersistedGlideUser,
} from "./glide-session";
import { bookProposedTrip, buildProposedTrip, defaultPrefs } from "@/lib/booking";

describe("parsePersistedGlideUser", () => {
  test("returns null for empty or invalid payloads", () => {
    expect(parsePersistedGlideUser(null)).toBeNull();
    expect(parsePersistedGlideUser("")).toBeNull();
    expect(parsePersistedGlideUser("{")).toBeNull();
    expect(parsePersistedGlideUser(JSON.stringify({ name: "" }))).toBeNull();
    expect(parsePersistedGlideUser(JSON.stringify({ name: "   " }))).toBeNull();
    expect(parsePersistedGlideUser(JSON.stringify({ name: 12 }))).toBeNull();
  });

  test("resumes trip steps and reshaped flag", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "chat", reshaped: true }))).toMatchObject({
      name: "Alex",
      step: "chat",
      reshaped: true,
    });
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "plan", reshaped: false }))).toMatchObject({
      name: "Alex",
      step: "plan",
      reshaped: false,
    });
  });

  test("coerces auth onboarding steps to choose", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "intro" }))).toMatchObject({
      name: "Alex",
      step: "choose",
    });
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "signup", reshaped: true }))).toMatchObject({
      name: "Alex",
      step: "choose",
      reshaped: true,
    });
  });

  test("legacy name-only records default to choose", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Traveler" }))).toMatchObject({
      name: "Traveler",
      step: "choose",
      reshaped: false,
    });
  });

  test("persists and restores a booked trip", () => {
    const booked = bookProposedTrip(buildProposedTrip(defaultPrefs({ nights: 1 })), "demo", { seed: "s" });
    const raw = serializePersistedGlideUser({
      name: "Sam",
      step: "route",
      reshaped: false,
      mode: "booked",
      bookedTrip: booked,
    });
    const parsed = parsePersistedGlideUser(raw);
    expect(parsed?.bookedTrip?.id).toBe(booked.id);
    expect(parsed?.mode).toBe("booked");
    expect(parsed?.step).toBe("route");
  });

  test("booked trip forces resume out of planning steps", () => {
    const booked = bookProposedTrip(buildProposedTrip(defaultPrefs()), "demo", { seed: "x" });
    const parsed = parsePersistedGlideUser(
      JSON.stringify({ name: "Sam", step: "propose", bookedTrip: booked }),
    );
    expect(parsed?.step).toBe("route");
    expect(parsed?.bookedTrip?.status).toBe("booked-demo");
  });
});
