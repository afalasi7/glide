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
  withPlanDefaults,
} from "./Booking";
import { useGlassColorScheme } from "@/components/ui/glass";
import {
  confirmDemoCheckout,
  getCheckoutStatus,
  reportCheckoutCancelled,
  requestCheckout,
  resolveCheckoutStatusUi,
} from "@/lib/checkout";
import { planTrip, type PlanTripRequest, type Trip } from "@/lib/planning";
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
  request: PlanTripRequest;
  askIndex: number;
  trip: Trip | null;
};

const EMPTY: Session = {
  name: "",
  step: "welcome",
  connected: false,
  reshaped: false,
  mode: "planning",
  request: withPlanDefaults(),
  askIndex: 0,
  trip: null,
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
  const booked = p.trip?.status === "booked" || p.trip?.status === "paid";
  return {
    name: p.name,
    step: p.step,
    connected: true,
    reshaped: p.reshaped,
    mode: booked ? "booked" : p.mode === "demo" ? "demo" : "planning",
    request: p.request ?? withPlanDefaults(),
    askIndex: p.askIndex ?? 0,
    trip: p.trip ?? null,
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
    mode: session.mode,
    request: session.request,
    askIndex: session.askIndex,
    trip: session.trip,
  };
  writePersistedGlideUser(payload);
  setPersistedCache(payload);
}

function clearCheckoutQuery() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("checkout")) return;
  url.search = "";
  window.history.replaceState({}, "", url.pathname);
}

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
  const [notice, setNotice] = useState<string | null>(null);
  const [demoConfirm, setDemoConfirm] = useState(false);
  const checkoutHandled = useRef(false);

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
  const { name, step, connected, reshaped, mode, request, askIndex, trip } = session;

  const patch = (next: Partial<Session>) => {
    const merged = { ...session, ...next };
    if (merged.name.trim()) persistSession(merged);
    setOverride(merged);
    setConfirmReset(false);
  };

  // Handle Stripe / demo return query params once.
  useEffect(() => {
    if (!ready || checkoutHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    checkoutHandled.current = true;

    const run = async () => {
      const stored = session.trip;
      if (checkout === "demo") {
        setDemoConfirm(true);
        setNotice(params.get("message") ?? "Demo only. Nothing was charged.");
        patch({ step: "review", trip: stored });
        return;
      }
      if (checkout === "cancel") {
        const sessionId = params.get("session_id") ?? undefined;
        if (stored || sessionId) {
          try {
            await reportCheckoutCancelled({ trip: stored ?? undefined, sessionId });
          } catch {
            /* keep plan */
          }
        }
        const outcome = resolveCheckoutStatusUi({ status: "failed" }, stored);
        setNotice(outcome.kind === "failed" ? outcome.notice : null);
        setDemoConfirm(false);
        patch({
          step: "review",
          mode: "planning",
          trip: outcome.kind === "failed" ? outcome.trip : stored,
        });
        clearCheckoutQuery();
        return;
      }
      if (checkout === "success") {
        const sessionId = params.get("session_id") ?? undefined;
        try {
          const status = sessionId
            ? await getCheckoutStatus({ sessionId })
            : stored
              ? await getCheckoutStatus({ trip: stored })
              : { status: "pending" as const };
          const outcome = resolveCheckoutStatusUi(status, stored);
          if (outcome.kind === "paid") {
            setDemoConfirm(false);
            setNotice(null);
            patch({ trip: outcome.trip, mode: "booked", step: "confirming" });
          } else if (outcome.kind === "pending") {
            setDemoConfirm(false);
            setNotice(outcome.notice);
            // Waiting — stay on review with the saved plan; no tickets.
            patch({ step: "review", mode: "planning", trip: stored });
          } else {
            // failed or refunded — message, no tickets, plan kept for retry
            setDemoConfirm(false);
            setNotice(outcome.notice);
            patch({ step: "review", mode: "planning", trip: outcome.trip });
          }
        } catch {
          const outcome = resolveCheckoutStatusUi({ status: "failed" }, stored);
          setNotice(outcome.kind === "failed" ? outcome.notice : null);
          patch({
            step: "review",
            mode: "planning",
            trip: outcome.kind === "failed" ? outcome.trip : stored,
          });
        }
        clearCheckoutQuery();
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for return URLs
  }, [ready]);

  const done = (n: string) => {
    const next: Session = { ...EMPTY, name: n, step: "intro", request: withPlanDefaults() };
    persistSession({ ...next, step: "choose" });
    setOverride(next);
    setConfirmReset(false);
  };

  const startOver = () => {
    clearPersistedGlideUser();
    setPersistedCache(null);
    setOverride(EMPTY);
    setConfirmReset(false);
    setNotice(null);
    setDemoConfirm(false);
    clearCheckoutQuery();
  };

  const beginPlan = (nextRequest?: PlanTripRequest) => {
    patch({
      mode: "planning",
      request: withPlanDefaults(nextRequest ?? {}),
      askIndex: 0,
      trip: null,
      step: "ask",
    });
    setDemoConfirm(false);
    setNotice(null);
  };

  const finishAsk = () => {
    const planned = planTrip(request);
    patch({ trip: planned, step: "propose" });
  };

  const runCheckout = async () => {
    if (!trip || checkoutBusy) return;
    setCheckoutBusy(true);
    setNotice(null);
    try {
      // Persist before redirect so demo/stripe return can restore the full trip.
      persistSession({ ...session, trip, step: "review" });
      const result = await requestCheckout(trip);
      if (result.mode === "stripe") {
        window.location.assign(result.url);
        return;
      }
      setDemoConfirm(true);
      setNotice(result.message);
      const params = new URLSearchParams({ checkout: "demo", trip_id: result.tripId, message: result.message });
      window.history.replaceState({}, "", `/app?${params.toString()}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutBusy(false);
    }
  };

  const runDemoConfirm = async () => {
    if (!trip || checkoutBusy) return;
    setCheckoutBusy(true);
    try {
      const result = await confirmDemoCheckout(trip);
      patch({ trip: result.trip, mode: "booked", step: "confirming" });
      setDemoConfirm(false);
      setNotice(null);
      clearCheckoutQuery();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Demo confirm failed");
    } finally {
      setCheckoutBusy(false);
    }
  };

  const inTrip = step === "route" || step === "plan" || step === "chat";
  const fadeMs = reducedMotion ? 0 : 0.12;
  const booked = mode === "booked" && trip && (trip.status === "booked" || trip.status === "paid" || Boolean(trip.confirmations?.length));

  return (
    <BareContext.Provider value>
      <div className={`glide-glass-screen min-h-[100dvh] w-full ${dark ? "dark" : ""}`}>
        <div ref={appRef} className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden md:max-w-[760px]" data-lenis-prevent>
          <div className="relative min-h-0 flex-1">
            {ready ? (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={step + (trip?.id ?? mode) + (demoConfirm ? "-demo" : "")}
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
                      onPlanIntent={(partial) => beginPlan(partial)}
                    />
                  )}
                  {step === "choose" && (
                    <ChooseTripScreen
                      onDemo={() => patch({ mode: "demo", trip: null, step: "route", reshaped: false })}
                      onPlan={() => beginPlan()}
                    />
                  )}
                  {step === "ask" && (
                    <AskPrefsScreen
                      request={request}
                      index={askIndex}
                      onChange={(next) => patch({ request: next })}
                      onBack={askIndex > 0 ? () => patch({ askIndex: askIndex - 1 }) : () => patch({ step: "choose" })}
                      onNext={() => {
                        if (askIndex >= 3) finishAsk();
                        else patch({ askIndex: askIndex + 1 });
                      }}
                    />
                  )}
                  {step === "propose" && trip && (
                    <ProposeTripScreen
                      trip={trip}
                      onChange={(next) => patch({ trip: next })}
                      onBack={() => patch({ step: "ask", askIndex: 3 })}
                      onReview={() => patch({ step: "review" })}
                    />
                  )}
                  {step === "review" && trip && (
                    <ReviewBookScreen
                      trip={trip}
                      busy={checkoutBusy}
                      notice={notice}
                      onBack={() => {
                        setDemoConfirm(false);
                        patch({ step: "propose" });
                      }}
                      onBook={demoConfirm ? undefined : runCheckout}
                      onDemoConfirm={demoConfirm ? runDemoConfirm : undefined}
                    />
                  )}
                  {step === "confirming" && trip && (
                    <BookingConfirmScreen trip={trip} onEnter={() => patch({ step: "route", mode: "booked" })} />
                  )}
                  {step === "route" && booked && trip && <BookedRouteScreen trip={trip} />}
                  {step === "route" && !booked && (
                    <RouteScreen updated={reshaped} onLate={() => patch({ reshaped: true, step: "plan" })} />
                  )}
                  {step === "plan" && booked && trip && <BookedPlanScreen trip={trip} />}
                  {step === "plan" && !booked && <PlanScreen />}
                  {step === "chat" && (
                    <ChatScreen
                      booked={booked ? trip : null}
                      onPlanIntent={(partial) => beginPlan(partial)}
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
