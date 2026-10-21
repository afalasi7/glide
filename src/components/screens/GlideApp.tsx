"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BareContext, PlanScreen, ChatScreen } from "./Screens";
import { WelcomeScreen, AuthScreen, IntroScreen, ConnectScreen, AgentScreen, RouteScreen } from "./Onboarding";
import {
  AskPrefsScreen,
  BookedPlanScreen,
  BookedRouteScreen,
  BookingConfirmScreen,
  ChooseTripScreen,
  ProposeTripScreen,
  ReviewBookScreen,
  buildProposedTrip,
  defaultPrefs,
} from "./Booking";
import { useGlassColorScheme } from "@/components/ui/glass";
import {
  bookProposedTrip,
  startCheckout,
  type BookedTrip,
  type ProposedTrip,
  type TripPrefs,
} from "@/lib/booking";
import {
  clearPersistedGlideUser,
  readPersistedGlideUser,
  writePersistedGlideUser,
  type GlideStep,
  type PersistedGlideUser,
  type ResumableStep,
} from "@/lib/glide-session";

type Step = GlideStep;
const TABS: { id: Extract<ResumableStep, "route" | "plan" | "chat">; label: string }[] = [
  { id: "route", label: "Trip" },
  { id: "plan", label: "Plan" },
  { id: "chat", label: "Glide" },
];

type Session = {
  name: string;
  step: Step;
  connected: boolean;
  reshaped: boolean;
  mode: "demo" | "booked" | "planning";
  prefs: TripPrefs;
  askIndex: number;
  proposed: ProposedTrip | null;
  booked: BookedTrip | null;
};

const EMPTY: Session = {
  name: "",
  step: "welcome",
  connected: false,
  reshaped: false,
  mode: "planning",
  prefs: defaultPrefs(),
  askIndex: 0,
  proposed: null,
  booked: null,
};

let persistedCache: PersistedGlideUser | null | undefined;
const persistListeners = new Set<() => void>();

function getPersistedSnapshot(): PersistedGlideUser | null {
  if (persistedCache === undefined) persistedCache = readPersistedGlideUser();
  return persistedCache;
}

function subscribePersisted(notify: () => void) {
  persistListeners.add(notify);
  return () => persistListeners.delete(notify);
}

function setPersistedCache(next: PersistedGlideUser | null) {
  persistedCache = next;
  persistListeners.forEach((notify) => notify());
}

function sessionFromPersisted(p: PersistedGlideUser): Session {
  const proposed =
    p.proposedTrip && typeof p.proposedTrip === "object" ? (p.proposedTrip as ProposedTrip) : null;
  return {
    name: p.name,
    step: p.step,
    connected: true,
    reshaped: p.reshaped,
    mode: p.bookedTrip ? "booked" : p.mode === "demo" ? "demo" : "planning",
    prefs: p.prefs ?? defaultPrefs(),
    askIndex: p.askIndex ?? 0,
    proposed,
    booked: p.bookedTrip ?? null,
  };
}

function persistSession(session: Session) {
  if (!session.name.trim()) return;
  const step: ResumableStep =
    session.step === "welcome" ||
    session.step === "signup" ||
    session.step === "signin" ||
    session.step === "intro" ||
    session.step === "connect" ||
    session.step === "agent"
      ? "choose"
      : (session.step as ResumableStep);
  const payload: PersistedGlideUser = {
    name: session.name.trim(),
    step,
    reshaped: session.reshaped,
    mode: session.mode === "booked" ? "booked" : session.mode === "demo" ? "demo" : undefined,
    prefs: session.prefs,
    askIndex: session.askIndex,
    proposedTrip: session.proposed ?? undefined,
    bookedTrip: session.booked,
  };
  writePersistedGlideUser(payload);
  setPersistedCache(payload);
}

/** The real flow: onboarding, plan/book, then the trip. */
export function GlideApp() {
  const dark = useGlassColorScheme();
  const reducedMotion = useReducedMotion();
  const appRef = useRef<HTMLDivElement>(null);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const persisted = useSyncExternalStore(subscribePersisted, getPersistedSnapshot, () => null);
  const [override, setOverride] = useState<Session | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [testModeNote, setTestModeNote] = useState<string | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      if (appRef.current) appRef.current.style.height = `${viewport?.height ?? window.innerHeight}px`;
    };
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const session: Session = override ?? (persisted ? sessionFromPersisted(persisted) : EMPTY);
  const { name, step, connected, reshaped, mode, prefs, askIndex, proposed, booked } = session;

  const patch = (next: Partial<Session>) => {
    const merged = { ...session, ...next };
    if (merged.name.trim()) persistSession(merged);
    setOverride(merged);
    setConfirmReset(false);
  };

  const done = (n: string) => {
    const next: Session = { ...EMPTY, name: n, step: "intro" };
    persistSession({ ...next, step: "choose" });
    setOverride(next);
    setConfirmReset(false);
  };

  const startOver = () => {
    clearPersistedGlideUser();
    setPersistedCache(null);
    setOverride(EMPTY);
    setConfirmReset(false);
    setTestModeNote(null);
  };

  const beginPlan = (nextPrefs?: TripPrefs) => {
    const prefsNext = nextPrefs ?? defaultPrefs();
    patch({
      mode: "planning",
      prefs: prefsNext,
      askIndex: 0,
      proposed: null,
      booked: null,
      step: "ask",
    });
  };

  const finishAsk = () => {
    const trip = buildProposedTrip(prefs);
    patch({ proposed: trip, step: "propose" });
  };

  const runCheckout = async () => {
    if (!proposed || checkoutBusy) return;
    setCheckoutBusy(true);
    setTestModeNote(null);
    const result = await startCheckout(proposed);
    if (result.ok && result.mode === "stripe") {
      setTestModeNote("Test mode · redirecting to Stripe Checkout");
      window.location.href = result.url;
      setCheckoutBusy(false);
      return;
    }
    setTestModeNote("Test mode · /api/checkout unavailable, confirming as demo");
    const bookedTrip = bookProposedTrip(proposed, "demo", { seed: proposed.id });
    patch({ booked: bookedTrip, mode: "booked", step: "confirming", reshaped: false });
    setCheckoutBusy(false);
  };

  const inTrip = step === "route" || step === "plan" || step === "chat";
  const fadeMs = reducedMotion ? 0 : 0.12;

  return (
    <BareContext.Provider value>
      <div className={`glide-glass-screen min-h-[100dvh] w-full ${dark ? "dark" : ""}`}>
        <div ref={appRef} className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden md:max-w-[760px]" data-lenis-prevent>
          <div className="relative min-h-0 flex-1">
            {ready ? (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={step + (booked?.id ?? proposed?.id ?? mode)}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: fadeMs, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {step === "welcome" && <WelcomeScreen onNext={() => patch({ step: "signup" })} onSignIn={() => patch({ step: "signin" })} />}
                  {step === "signup" && <AuthScreen mode="signup" onSubmit={done} onSwitch={() => patch({ step: "signin" })} />}
                  {step === "signin" && <AuthScreen mode="signin" onSubmit={done} onSwitch={() => patch({ step: "signup" })} />}
                  {step === "intro" && <IntroScreen name={name} onNext={() => patch({ step: "connect" })} />}
                  {step === "connect" && (
                    <ConnectScreen
                      connected={connected}
                      onToggle={() => patch({ connected: !connected })}
                      onNext={() => patch({ step: "agent" })}
                    />
                  )}
                  {step === "agent" && (
                    <AgentScreen
                      onStart={() => patch({ step: "choose" })}
                      onPlanIntent={(next) => beginPlan(next)}
                    />
                  )}
                  {step === "choose" && (
                    <ChooseTripScreen
                      onDemo={() => patch({ mode: "demo", booked: null, step: "route", reshaped: false })}
                      onPlan={() => beginPlan()}
                    />
                  )}
                  {step === "ask" && (
                    <AskPrefsScreen
                      prefs={prefs}
                      index={askIndex}
                      onChange={(next) => patch({ prefs: next })}
                      onBack={askIndex > 0 ? () => patch({ askIndex: askIndex - 1 }) : () => patch({ step: "choose" })}
                      onNext={() => {
                        if (askIndex >= 3) finishAsk();
                        else patch({ askIndex: askIndex + 1 });
                      }}
                    />
                  )}
                  {step === "propose" && proposed && (
                    <ProposeTripScreen
                      trip={proposed}
                      onChange={(trip) => patch({ proposed: trip })}
                      onBack={() => patch({ step: "ask", askIndex: 3 })}
                      onReview={() => patch({ step: "review" })}
                    />
                  )}
                  {step === "review" && proposed && (
                    <ReviewBookScreen
                      trip={proposed}
                      busy={checkoutBusy}
                      testModeNote={testModeNote}
                      onBack={() => patch({ step: "propose" })}
                      onBook={() => setTestModeNote("Ready to pay · demo prices · nothing charged yet")}
                      onPay={runCheckout}
                    />
                  )}
                  {step === "confirming" && booked && (
                    <BookingConfirmScreen booked={booked} onEnter={() => patch({ step: "route" })} />
                  )}
                  {step === "route" && mode === "booked" && booked && <BookedRouteScreen booked={booked} />}
                  {step === "route" && mode !== "booked" && (
                    <RouteScreen
                      updated={reshaped}
                      onLate={() => patch({ reshaped: true, step: "plan" })}
                    />
                  )}
                  {step === "plan" && mode === "booked" && booked && <BookedPlanScreen booked={booked} />}
                  {step === "plan" && mode !== "booked" && <PlanScreen />}
                  {step === "chat" && (
                    <ChatScreen
                      booked={mode === "booked" ? booked : null}
                      onPlanIntent={(next) => beginPlan(next)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
          {ready && inTrip && (
            <nav aria-label="Trip" data-slot="tabs-list" data-variant="default" className="glide-glass glide-trip-nav glass-panel flex shrink-0 flex-col gap-1">
              <div className="flex gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    data-slot="tabs-trigger"
                    data-active={step === t.id}
                    aria-current={step === t.id ? "page" : undefined}
                    onClick={() => patch({ step: t.id })}
                    className="flex-1 px-2 py-3 text-[13px] font-medium transition-colors hover:bg-accent"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {confirmReset ? (
                <div className="flex items-stretch gap-1 px-1 pb-1" role="group" aria-label="Confirm start over">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="glass-control flex min-h-11 flex-1 items-center justify-center rounded-[15px] px-2 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    Keep going
                  </button>
                  <button
                    type="button"
                    onClick={startOver}
                    className="glide-glass-alert flex min-h-11 flex-1 items-center justify-center rounded-[15px] px-2 text-[12px] font-semibold transition-colors"
                  >
                    Yes, start over
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex min-h-11 w-full items-center justify-center rounded-[15px] px-2 text-[12px] font-medium text-ink-soft transition-colors hover:bg-accent hover:text-ink"
                >
                  Start over
                </button>
              )}
            </nav>
          )}
        </div>
      </div>
    </BareContext.Provider>
  );
}
