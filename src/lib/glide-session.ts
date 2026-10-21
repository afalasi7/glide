/** Client session for `/app`, stored under `localStorage['glide-user']`. */

import type { PlanTripRequest, Trip } from "@/lib/planning";

export const GLIDE_USER_KEY = "glide-user";

export type GlideStep =
  | "welcome"
  | "signup"
  | "signin"
  | "intro"
  | "connect"
  | "agent"
  | "choose"
  | "ask"
  | "propose"
  | "review"
  | "confirming"
  | "route"
  | "plan"
  | "chat";

export const RESUMABLE_STEPS = [
  "choose",
  "ask",
  "propose",
  "review",
  "confirming",
  "route",
  "plan",
  "chat",
] as const;
export type ResumableStep = (typeof RESUMABLE_STEPS)[number];

export type PersistedGlideUser = {
  name: string;
  step: ResumableStep;
  reshaped: boolean;
  mode?: "demo" | "booked" | "planning";
  request?: PlanTripRequest;
  askIndex?: number;
  /** Full planned trip — needed for demo checkout across serverless instances. */
  trip?: Trip | null;
};

const ALL_STEPS: readonly GlideStep[] = [
  "welcome",
  "signup",
  "signin",
  "intro",
  "connect",
  "agent",
  "choose",
  "ask",
  "propose",
  "review",
  "confirming",
  "route",
  "plan",
  "chat",
];

function isResumableStep(value: unknown): value is ResumableStep {
  return typeof value === "string" && (RESUMABLE_STEPS as readonly string[]).includes(value);
}

function isGlideStep(value: unknown): value is GlideStep {
  return typeof value === "string" && (ALL_STEPS as readonly string[]).includes(value);
}

function isPlanRequest(value: unknown): value is PlanTripRequest {
  if (!value || typeof value !== "object") return false;
  return true;
}

function isTrip(value: unknown): value is Trip {
  if (!value || typeof value !== "object") return false;
  const v = value as Trip;
  return (
    typeof v.id === "string" &&
    typeof v.destination === "string" &&
    typeof v.destinationLabel === "string" &&
    Array.isArray(v.days) &&
    typeof v.facts === "object" &&
    v.facts !== null &&
    typeof v.hotel === "object" &&
    typeof v.travel === "object"
  );
}

export function parsePersistedGlideUser(raw: string | null | undefined): PersistedGlideUser | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed?.name !== "string") return null;
    const name = parsed.name.trim();
    if (!name) return null;

    let step: ResumableStep = "choose";
    if (isResumableStep(parsed.step)) step = parsed.step;
    else if (isGlideStep(parsed.step)) step = "choose";

    const reshaped = parsed.reshaped === true;
    const mode =
      parsed.mode === "booked" || parsed.mode === "demo" || parsed.mode === "planning"
        ? parsed.mode
        : undefined;
    const request = isPlanRequest(parsed.request) ? parsed.request : undefined;
    const askIndex =
      typeof parsed.askIndex === "number" && parsed.askIndex >= 0 ? Math.floor(parsed.askIndex) : undefined;
    const trip = isTrip(parsed.trip) ? parsed.trip : null;

    if (trip?.status === "booked" || trip?.status === "paid") {
      if (step === "ask" || step === "propose" || step === "review" || step === "choose") step = "route";
    }

    return { name, step, reshaped, mode: trip?.status === "booked" ? "booked" : mode, request, askIndex, trip };
  } catch {
    return null;
  }
}

export function serializePersistedGlideUser(user: PersistedGlideUser): string {
  const step: ResumableStep = isResumableStep(user.step) ? user.step : "choose";
  return JSON.stringify({
    name: user.name.trim(),
    step,
    reshaped: Boolean(user.reshaped),
    mode: user.mode,
    request: user.request,
    askIndex: user.askIndex,
    trip: user.trip ?? null,
  } satisfies PersistedGlideUser);
}

export function readPersistedGlideUser(): PersistedGlideUser | null {
  try {
    return parsePersistedGlideUser(localStorage.getItem(GLIDE_USER_KEY));
  } catch {
    return null;
  }
}

export function writePersistedGlideUser(user: PersistedGlideUser): void {
  try {
    localStorage.setItem(GLIDE_USER_KEY, serializePersistedGlideUser(user));
  } catch {
    /* ignore */
  }
}

export function clearPersistedGlideUser(): void {
  try {
    localStorage.removeItem(GLIDE_USER_KEY);
  } catch {
    /* ignore */
  }
}
