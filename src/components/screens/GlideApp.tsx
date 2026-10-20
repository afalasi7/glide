"use client";

import React, { useEffect, useRef, useState } from "react";
import { BareContext, PlanScreen, ChatScreen } from "./Screens";
import { WelcomeScreen, AuthScreen, IntroScreen, ConnectScreen, AgentScreen, RouteScreen } from "./Onboarding";
import { useGlassColorScheme } from "@/components/ui/glass";

type Step = "welcome" | "signup" | "signin" | "intro" | "connect" | "agent" | "route" | "plan" | "chat";
const TABS: { id: Extract<Step, "route" | "plan" | "chat">; label: string }[] = [
  { id: "route", label: "Trip" },
  { id: "plan", label: "Plan" },
  { id: "chat", label: "Glide" },
];

/** The real flow: onboarding, then the trip. Runs full-screen in the simulators. */
export function GlideApp() {
  const dark = useGlassColorScheme();
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
  const [step, setStep] = useState<Step>("welcome");
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [reshaped, setReshaped] = useState(false);
  const done = (n: string) => {
    setName(n);
    try { localStorage.setItem("glide-user", JSON.stringify({ name: n })); } catch {}
    setStep("intro");
  };
  const inTrip = step === "route" || step === "plan" || step === "chat";

  return (
    <BareContext.Provider value>
      <div className={`glide-glass-screen min-h-[100dvh] w-full ${dark ? "dark" : ""}`}>
        <div ref={appRef} className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden md:max-w-[760px]" data-lenis-prevent>
          <div className="relative min-h-0 flex-1">
            <div key={step} className="absolute inset-0">
              {step === "welcome" && <WelcomeScreen onNext={() => setStep("signup")} onSignIn={() => setStep("signin")} />}
              {step === "signup" && <AuthScreen mode="signup" onSubmit={done} onSwitch={() => setStep("signin")} />}
              {step === "signin" && <AuthScreen mode="signin" onSubmit={done} onSwitch={() => setStep("signup")} />}
              {step === "intro" && <IntroScreen name={name} onNext={() => setStep("connect")} />}
              {step === "connect" && (
                <ConnectScreen connected={connected} onToggle={() => setConnected((c) => !c)} onNext={() => setStep("agent")} />
              )}
              {step === "agent" && <AgentScreen onStart={() => setStep("route")} />}
              {step === "route" && (
                <RouteScreen
                  updated={reshaped}
                  onLate={() => {
                    setReshaped(true);
                    setStep("plan");
                  }}
                />
              )}
              {step === "plan" && <PlanScreen />}
              {step === "chat" && <ChatScreen />}
            </div>
          </div>
          {inTrip && (
            <nav aria-label="Trip" data-slot="tabs-list" data-variant="default" className="glide-glass glide-trip-nav glass-panel flex shrink-0 gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-slot="tabs-trigger"
                  data-active={step === t.id}
                  aria-current={step === t.id ? "page" : undefined}
                  onClick={() => setStep(t.id)}
                  className="flex-1 px-2 py-3 text-[13px] font-medium transition-colors hover:bg-accent"
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </BareContext.Provider>
  );
}
