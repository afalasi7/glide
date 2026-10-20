"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BareContext, PlanScreen, ChatScreen } from "./Screens";
import { WelcomeScreen, AuthScreen, IntroScreen, ConnectScreen, AgentScreen, RouteScreen } from "./Onboarding";
import { useGlassColorScheme } from "@/components/ui/glass";

type Step = "welcome" | "signup" | "signin" | "intro" | "connect" | "agent" | "route" | "plan" | "chat";
const TABS: { id: Extract<Step, "route" | "plan" | "chat">; label: string }[] = [
  { id: "route", label: "Trip" },
  { id: "plan", label: "Plan" },
  { id: "chat", label: "Glide" },
];

const USER_KEY = "glide-user";

function readStoredName(): string | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown };
    if (typeof parsed?.name !== "string") return null;
    const name = parsed.name.trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore quota / private-mode failures */
  }
}

function writeStoredUser(name: string) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify({ name }));
  } catch {
    /* ignore */
  }
}

/** True only after hydration — keeps SSR and the first client paint on the same tree. */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type Session = {
  name: string;
  step: Step;
  connected: boolean;
  reshaped: boolean;
};

/** The real flow: onboarding, then the trip. Runs full-screen in the simulators. */
export function GlideApp() {
  const dark = useGlassColorScheme();
  const reducedMotion = useReducedMotion();
  const isClient = useIsClient();
  const appRef = useRef<HTMLDivElement>(null);
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

  const persistedName = isClient ? readStoredName() : null;
  const [session, setSession] = useState<Session | null>(null);

  const name = session?.name ?? persistedName ?? "";
  const step = session?.step ?? (persistedName ? "route" : "welcome");
  const connected = session?.connected ?? Boolean(persistedName);
  const reshaped = session?.reshaped ?? false;

  const patch = (next: Partial<Session>) => {
    setSession({ name, step, connected, reshaped, ...next });
  };

  const done = (n: string) => {
    writeStoredUser(n);
    setSession({ name: n, step: "intro", connected: false, reshaped: false });
  };

  const startOver = () => {
    clearStoredUser();
    setSession({ name: "", step: "welcome", connected: false, reshaped: false });
  };

  const inTrip = step === "route" || step === "plan" || step === "chat";
  const ready = isClient;
  const fadeMs = reducedMotion ? 0 : 0.12;

  return (
    <BareContext.Provider value>
      <div className={`glide-glass-screen min-h-[100dvh] w-full ${dark ? "dark" : ""}`}>
        <div ref={appRef} className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden md:max-w-[760px]" data-lenis-prevent>
          <div className="relative min-h-0 flex-1">
            {ready ? (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={step}
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
                  {step === "agent" && <AgentScreen onStart={() => patch({ step: "route" })} />}
                  {step === "route" && (
                    <RouteScreen
                      updated={reshaped}
                      onLate={() => patch({ reshaped: true, step: "plan" })}
                    />
                  )}
                  {step === "plan" && <PlanScreen />}
                  {step === "chat" && <ChatScreen />}
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
              <button
                type="button"
                onClick={startOver}
                className="px-2 pb-2.5 pt-0.5 text-center text-[11px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Start over
              </button>
            </nav>
          )}
        </div>
      </div>
    </BareContext.Provider>
  );
}
