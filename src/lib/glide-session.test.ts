import { describe, expect, test } from "bun:test";
import {
  parsePersistedGlideUser,
  serializePersistedGlideUser,
} from "./glide-session";

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
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "chat", reshaped: true }))).toEqual({
      name: "Alex",
      step: "chat",
      reshaped: true,
    });
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "plan", reshaped: false }))).toEqual({
      name: "Alex",
      step: "plan",
      reshaped: false,
    });
  });

  test("coerces onboarding steps to route and ignores unknown steps", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "intro" }))).toEqual({
      name: "Alex",
      step: "route",
      reshaped: false,
    });
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "signup", reshaped: true }))).toEqual({
      name: "Alex",
      step: "route",
      reshaped: true,
    });
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Alex", step: "nope" }))).toEqual({
      name: "Alex",
      step: "route",
      reshaped: false,
    });
  });

  test("legacy name-only records default to route", () => {
    expect(parsePersistedGlideUser(JSON.stringify({ name: "Traveler" }))).toEqual({
      name: "Traveler",
      step: "route",
      reshaped: false,
    });
  });

  test("round-trips through serialize", () => {
    const raw = serializePersistedGlideUser({ name: "  Sam  ", step: "plan", reshaped: true });
    expect(parsePersistedGlideUser(raw)).toEqual({ name: "Sam", step: "plan", reshaped: true });
  });
});
