/** Client session for `/app`, stored under `localStorage['glide-user']`. */

import { isBookedTrip, type BookedTrip, type TripPrefs } from "@/lib/booking";

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

/** Steps safe to resume after a refresh (past fragile onboarding). */
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
  /** Demo RAK story when true; booked trip when set. */
  mode?: "demo" | "booked";
  prefs?: TripPrefs;
  askIndex?: number;
  proposedTrip?: unknown;
  bookedTrip?: BookedTrip | null;
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

function isTripPrefs(value: unknown): value is TripPrefs {
  if (!value || typeof value !== "object") return false;
  const v = value as TripPrefs;
  return (
    (v.destinationId === "rak" || v.destinationId === "hatta") &&
    typeof v.nights === "number" &&
    typeof v.travellers === "number" &&
    (v.budgetBand === "smart" || v.budgetBand === "comfort" || v.budgetBand === "luxe")
  );
}

/**
 * Parse `glide-user` JSON. Returns null when the name is missing/invalid.
 * Mid-onboarding auth steps are coerced to a safe resume point.
 */
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
    const mode = parsed.mode === "booked" || parsed.mode === "demo" ? parsed.mode : undefined;
    const prefs = isTripPrefs(parsed.prefs) ? parsed.prefs : undefined;
    const askIndex = typeof parsed.askIndex === "number" && parsed.askIndex >= 0 ? Math.floor(parsed.askIndex) : undefined;
    const bookedTrip = isBookedTrip(parsed.bookedTrip) ? parsed.bookedTrip : null;
    const proposedTrip = parsed.proposedTrip && typeof parsed.proposedTrip === "object" ? parsed.proposedTrip : undefined;

    // If we have a booked trip, never resume into half-finished planning.
    if (bookedTrip && (step === "ask" || step === "propose" || step === "review" || step === "choose")) {
      step = "route";
    }

    return {
      name,
      step,
      reshaped,
      mode: bookedTrip ? "booked" : mode,
      prefs,
      askIndex,
      proposedTrip,
      bookedTrip,
    };
  } catch {
    return null;
  }
}

export function serializePersistedGlideUser(user: PersistedGlideUser): string {
  const step: ResumableStep = isResumableStep(user.step) ? user.step : "choose";
  const payload: PersistedGlideUser = {
    name: user.name.trim(),
    step,
    reshaped: Boolean(user.reshaped),
    mode: user.mode,
    prefs: user.prefs,
    askIndex: user.askIndex,
    proposedTrip: user.proposedTrip,
    bookedTrip: user.bookedTrip ?? null,
  };
  return JSON.stringify(payload);
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
    /* ignore quota / private-mode failures */
  }
}

export function clearPersistedGlideUser(): void {
  try {
    localStorage.removeItem(GLIDE_USER_KEY);
  } catch {
    /* ignore */
  }
}
