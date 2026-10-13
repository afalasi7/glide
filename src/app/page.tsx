"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { DelayControl } from "@/components/DelayControl";
import { TimelineView } from "@/components/Timeline";
import { AgentTerminal } from "@/components/AgentLog";
import { DynamicIslandWidget } from "@/components/DynamicIslandWidget";
import {
  INITIAL_STOPS,
  ItineraryStop,
  AgentLogEntry,
} from "@/lib/types";
import {
  calculateDelayedStops,
  getHealedStops,
  HEALING_STEPS_TEMPLATE,
} from "@/lib/agentEngine";
import { MapPin, ArrowRight } from "lucide-react";

export default function Home() {
  const [delayMinutes, setDelayMinutes] = useState<number>(75);
  const [stops, setStops] = useState<ItineraryStop[]>(() =>
    calculateDelayedStops(75)
  );
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [isHealed, setIsHealed] = useState<boolean>(false);
  const [walletSynced, setWalletSynced] = useState<boolean>(false);

  // Sync stops whenever delay preset changes
  const handleSetDelay = (mins: number) => {
    if (isHealing) return;
    setDelayMinutes(mins);
    setIsHealed(false);
    setWalletSynced(false);
    setStops(calculateDelayedStops(mins));
    setLogs([]);
  };

  // Reset to initial baseline state
  const handleReset = () => {
    setIsHealing(false);
    setIsHealed(false);
    setWalletSynced(false);
    setDelayMinutes(0);
    setStops(INITIAL_STOPS.map((s) => ({ ...s })));
    setLogs([]);
  };

  // Run autonomous shock absorber sequence
  const handleTriggerHeal = async () => {
    if (isHealing || isHealed) return;

    setIsHealing(true);
    setLogs([]);

    const now = () => {
      const d = new Date();
      return `${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
    };

    // Sequential playback of autonomous tool calls with delays
    for (let i = 0; i < HEALING_STEPS_TEMPLATE.length; i++) {
      const template = HEALING_STEPS_TEMPLATE[i];

      const newEntry: AgentLogEntry = {
        ...template,
        id: `log-${Date.now()}-${i}`,
        timestamp: now(),
      };

      setLogs((prev) => [...prev, newEntry]);

      // Tool call 1: resequence Jebel Jais to Day 2 morning
      if (i === 2) {
        setStops((prev) => {
          const next = [...prev];
          if (next[1]) {
            next[1] = {
              ...next[1],
              currentTime: "Day 2 • 08:30",
              title: "Jebel Jais Viewing Deck",
              tag: "Morning Summit",
              status: "healed",
              day: 2,
              statusMessage: "Rescheduled to Day 2 08:30 for morning light",
            };
          }
          return next;
        });
      }

      // Tool call 2: modify dining reservation via SevenRooms
      if (i === 3) {
        setStops((prev) => {
          const next = [...prev];
          if (next[3]) {
            next[3] = {
              ...next[3],
              currentTime: "21:15",
              status: "healed",
              statusMessage: "SevenRooms confirmed 21:15 • Table #14",
              bufferText: "+75m kitchen buffer (Closes 22:30)",
            };
          }
          return next;
        });
      }

      // Tool call 3: flag hotel late arrival in Cloudbeds PMS
      if (i === 4) {
        setStops((prev) => {
          const next = [...prev];
          if (next[2]) {
            next[2] = {
              ...next[2],
              status: "healed",
              statusMessage: "Cloudbeds PMS: Late arrival noted & mobile key ready",
              bufferText: "Check-in window secured",
            };
          }
          return next;
        });
      }

      // Tool call 4: push wallet pass sync
      if (i === 5) {
        setWalletSynced(true);
      }

      const delay = template.type === "TOOL_CALL" ? 500 : 350;
      await new Promise((res) => setTimeout(res, delay));
    }

    setStops(getHealedStops(delayMinutes));
    setIsHealing(false);
    setIsHealed(true);
    setWalletSynced(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FFFFFF", "#10B981", "#38BDF8"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col font-sans selection:bg-white/20 pb-20">
      {/* Top Bar */}
      <Header isHealed={isHealed} isHealing={isHealing} />

      {/* Main Single Column Container */}
      <main className="mx-auto w-full max-w-xl px-4 py-6 space-y-4">
        {/* Route Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white text-sm">Dubai → Ras Al Khaimah Road Trip</span>
            <span className="text-[11px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              4 Stops · 150 km
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-semibold overflow-x-auto pb-1">
            <span className="shrink-0">Dubai Marina</span>
            <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="shrink-0">Jebel Jais</span>
            <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="shrink-0">InterContinental RAK</span>
            <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="shrink-0">Levant & Nar Dinner</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
              isHealed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : delayMinutes > 0
                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                : "bg-white/5 border-white/10 text-zinc-300"
            }`}
          >
            {isHealed
              ? "All 4 stops protected: mountain drive moved to tomorrow morning when visibility is pristine. Dinner table pushed to 9:15 PM. Zero calls made."
              : delayMinutes > 0
              ? `Leaving ${delayMinutes} minutes late means arriving at the mountain in total darkness (6:30 PM) and forfeiting your 8:00 PM dinner reservation.`
              : "All stops are currently on schedule with comfortable drive times."}
          </div>
        </div>

        {/* Delay Control */}
        <DelayControl
          delayMinutes={delayMinutes}
          onSetDelay={handleSetDelay}
          onTriggerHeal={handleTriggerHeal}
          onReset={handleReset}
          isHealing={isHealing}
          isHealed={isHealed}
        />

        {/* Live Timeline */}
        <TimelineView
          stops={stops}
          isHealed={isHealed}
          isHealing={isHealing}
          delayMinutes={delayMinutes}
        />

        {/* Multi-Agent Coordination Actions */}
        <AgentTerminal
          logs={logs}
          isHealing={isHealing}
          isHealed={isHealed}
        />
      </main>

      {/* Apple Wallet / Live Pass Notification */}
      <DynamicIslandWidget
        isHealed={isHealed}
        walletSynced={walletSynced}
      />
    </div>
  );
}
