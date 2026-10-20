/** Client session for `/app`, stored under `localStorage['glide-user']`. */

export const GLIDE_USER_KEY = "glide-user";

export type GlideStep =
  | "welcome"
  | "signup"
  | "signin"
  | "intro"
  | "connect"
  | "agent"
  | "route"
  | "plan"
  | "chat";

/** Steps safe to resume after a refresh (past onboarding). */
export const RESUMABLE_STEPS = ["route", "plan", "chat"] as const;
export type ResumableStep = (typeof RESUMABLE_STEPS)[number];

export type PersistedGlideUser = {
  name: string;
  step: ResumableStep;
  reshaped: boolean;
};

const ALL_STEPS: readonly GlideStep[] = [
  "welcome",
  "signup",
  "signin",
  "intro",
  "connect",
  "agent",
  "route",
  "plan",
  "chat",
];

function isResumableStep(value: unknown): value is ResumableStep {
  return value === "route" || value === "plan" || value === "chat";
}

function isGlideStep(value: unknown): value is GlideStep {
  return typeof value === "string" && (ALL_STEPS as readonly string[]).includes(value);
}

/**
 * Parse `glide-user` JSON. Returns null when the name is missing/invalid.
 * Onboarding steps are coerced to `route` so refresh never mid-onboards.
 */
export function parsePersistedGlideUser(raw: string | null | undefined): PersistedGlideUser | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(raw) as { name?: unknown; step?: unknown; reshaped?: unknown };
    if (typeof parsed?.name !== "string") return null;
    const name = parsed.name.trim();
    if (!name) return null;

    const step: ResumableStep = isResumableStep(parsed.step)
      ? parsed.step
      : isGlideStep(parsed.step)
        ? "route"
        : "route";

    const reshaped = parsed.reshaped === true;

    return { name, step, reshaped };
  } catch {
    return null;
  }
}

export function serializePersistedGlideUser(user: PersistedGlideUser): string {
  const step: ResumableStep = isResumableStep(user.step) ? user.step : "route";
  return JSON.stringify({
    name: user.name.trim(),
    step,
    reshaped: Boolean(user.reshaped),
  });
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
