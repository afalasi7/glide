"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { DelayControl } from "@/components/DelayControl";
import { RealisticDeviceGallery } from "@/components/RealisticDeviceGallery";
import { TimelineView } from "@/components/Timeline";
import { AgentTerminal } from "@/components/AgentLog";
import { DynamicIslandWidget } from "@/components/DynamicIslandWidget";
import { GraphVisualizer } from "@/components/GraphVisualizer";
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
import { Smartphone, LayoutDashboard, Sparkles, ShieldCheck } from "lucide-react";

export default function Home() {
  const [delayMinutes, setDelayMinutes] = useState<number>(75);
  const [stops, setStops] = useState<ItineraryStop[]>(() =>
    calculateDelayedStops(75)
  );
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [isHealed, setIsHealed] = useState<boolean>(false);
  const [walletSynced, setWalletSynced] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"devices" | "system">("devices");

  // Sync stops whenever delay slider changes (if not already healed)
  const handleSetDelay = (mins: number) => {
    if (isHealing) return;
    setDelayMinutes(mins);
    if (!isHealed) {
      setStops(calculateDelayedStops(mins));
    }
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
        .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${Math.floor(
        d.getMilliseconds() / 10
      )
        .toString()
        .padStart(2, "0")}`;
    };

    // Sequential playback of autonomous tool calls with delays
    for (let i = 0; i < HEALING_STEPS_TEMPLATE.length; i++) {
      const template = HEALING_STEPS_TEMPLATE[i];

      // Add log
      const newEntry: AgentLogEntry = {
        ...template,
        id: `log-${Date.now()}-${i}`,
        timestamp: now(),
      };

      setLogs((prev) => [...prev, newEntry]);

      // When tool call 1 runs (resequence Jebel Jais)
      if (i === 2) {
        setStops((prev) => {
          const next = [...prev];
          if (next[1]) {
            next[1] = {
              ...next[1],
              currentTime: "Day 2 • 08:30",
              title: "Jebel Jais Viewing Deck",
              tag: "Resequencing to Day 2...",
              status: "healed",
            };
          }
          return next;
        });
      }

      // When tool call 2 runs (modify dining reservation)
      if (i === 3) {
        setStops((prev) => {
          const next = [...prev];
          if (next[3]) {
            next[3] = {
              ...next[3],
              currentTime: "21:15",
              status: "healed",
              statusMessage: "SevenRooms confirmed 21:15 table",
            };
          }
          return next;
        });
      }

      // When tool call 4 runs (wallet pass sync)
      if (i === 5) {
        setWalletSynced(true);
      }

      const delay = template.type === "TOOL_CALL" ? 650 : 500;
      await new Promise((res) => setTimeout(res, delay));
    }

    // Complete healing
    setStops(getHealedStops(delayMinutes));
    setIsHealing(false);
    setIsHealed(true);
    setWalletSynced(true);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#06B6D4", "#10B981", "#38BDF8"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        isHealed={isHealed}
        isHealing={isHealing}
        totalSavedMinutes={delayMinutes}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Scenario Banner with View Mode Selector */}
        <div className="rounded-2xl border border-cyan-950/60 bg-gradient-to-r from-slate-900/90 via-[#0E1526] to-slate-900/90 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Live Showcase Scenario
                </span>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  4 Verified Links Loaded
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Dubai Marina → Jebel Jais Sunset → InterContinental RAK → Levant & Nar Dinner
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Testing Glide across 4 mobile hardware profiles: iPhone 18 Pro Max, Samsung S26 Ultra,
                Samsung Z Fold 8 Ultra, and iPhone Duo. The interfaces feature glass UI without intrusive code.
              </p>
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-950/90 p-1.5 border border-slate-800">
              <button
                onClick={() => setViewMode("devices")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "devices"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>4 Mobile Devices Grid</span>
              </button>
              <button
                onClick={() => setViewMode("system")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "system"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>System Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delay Control Simulator Bar */}
        <DelayControl
          delayMinutes={delayMinutes}
          onSetDelay={handleSetDelay}
          onTriggerHeal={handleTriggerHeal}
          onReset={handleReset}
          isHealing={isHealing}
          isHealed={isHealed}
        />

        {/* Tab 1: 4 Devices Grid Mode */}
        {viewMode === "devices" && (
          <RealisticDeviceGallery
            stops={stops}
            isHealed={isHealed}
            isHealing={isHealing}
            delayMinutes={delayMinutes}
            onTriggerHeal={handleTriggerHeal}
          />
        )}

        {/* Tab 2: System Dashboard Mode */}
        {viewMode === "system" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <TimelineView
                stops={stops}
                isHealed={isHealed}
                isHealing={isHealing}
                delayMinutes={delayMinutes}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <AgentTerminal
                logs={logs}
                isHealing={isHealing}
                isHealed={isHealed}
              />

              <GraphVisualizer
                stops={stops}
                isHealed={isHealed}
                delayMinutes={delayMinutes}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Dynamic Island / Apple Wallet sync widget */}
      <DynamicIslandWidget
        isHealed={isHealed}
        walletSynced={walletSynced}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            GLIDE • Autonomous AI Travel Itinerary Shock Absorber
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Dubai Chamber Create AI Agents Competition • Youth Category
          </span>
        </div>
      </footer>
    </div>
  );
}
