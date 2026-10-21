import { describe, expect, test } from "bun:test";
import { parsePersistedGlideUser, serializePersistedGlideUser } from "./glide-session";
import { planTrip, withPlanDefaults } from "@/lib/planning";

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

  test("persists full Trip for demo checkout handoff", () => {
    const request = withPlanDefaults({ destination: "ras-al-khaimah", budgetAED: 3000 });
    const trip = planTrip(request);
    const raw = serializePersistedGlideUser({
      name: "Sam",
      step: "review",
      reshaped: false,
      mode: "planning",
      request,
      trip,
    });
    const parsed = parsePersistedGlideUser(raw);
    expect(parsed?.trip?.id).toBe(trip.id);
    expect(parsed?.trip?.facts.totalAED).toBe(trip.facts.totalAED);
    expect(parsed?.request?.destination).toBe("ras-al-khaimah");
  });

  test("booked trip resumes into route", () => {
    const trip = { ...planTrip(), status: "booked" as const, confirmations: [] };
    const parsed = parsePersistedGlideUser(
      JSON.stringify({ name: "Sam", step: "propose", trip }),
    );
    expect(parsed?.step).toBe("route");
    expect(parsed?.mode).toBe("booked");
  });
});
