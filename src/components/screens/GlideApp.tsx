"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BareContext, PlanScreen, ChatScreen } from "./Screens";
import { WelcomeScreen, ConnectScreen, AgentScreen, RouteScreen } from "./Onboarding";

type Step = "welcome" | "connect" | "agent" | "route" | "plan" | "chat";
const TABS: { id: Extract<Step, "route" | "plan" | "chat">; label: string }[] = [
  { id: "route", label: "Where to go" },
  { id: "plan", label: "Plan" },
  { id: "chat", label: "Glide" },
];

/** The real flow: onboarding, then the trip. Runs full-screen in the simulators. */
export function GlideApp() {
  const [step, setStep] = useState<Step>("welcome");
  const [connected, setConnected] = useState(false);
  const inTrip = step === "route" || step === "plan" || step === "chat";

  return (
    <BareContext.Provider value>
      <div className="mx-auto flex h-[100dvh] max-w-[480px] flex-col overflow-hidden bg-cream text-ink">
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              {step === "welcome" && <WelcomeScreen onNext={() => setStep("connect")} />}
              {step === "connect" && (
                <ConnectScreen connected={connected} onToggle={() => setConnected((c) => !c)} onNext={() => setStep("agent")} />
              )}
              {step === "agent" && <AgentScreen onStart={() => setStep("route")} />}
              {step === "route" && <RouteScreen onLate={() => setStep("plan")} />}
              {step === "plan" && <PlanScreen />}
              {step === "chat" && <ChatScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
        {inTrip && (
          <nav aria-label="Trip" className="flex gap-1 border-t border-ink/10 bg-paper px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-current={step === t.id ? "page" : undefined}
                onClick={() => setStep(t.id)}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-medium ${step === t.id ? "bg-ink text-paper" : "text-ink-soft"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </BareContext.Provider>
  );
}
