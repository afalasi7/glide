"use client";

import React, { useState } from "react";
import {
  Network,
  ShieldCheck,
  AlertOctagon,
  GitBranch,
} from "lucide-react";
import { ItineraryStop } from "@/lib/types";

interface GraphVisualizerProps {
  stops: ItineraryStop[];
  isHealed: boolean;
  delayMinutes: number;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  stops,
  isHealed,
}) => {
  const [activeTab, setActiveTab] = useState<"dag" | "diff">("dag");

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#11141E] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
              Topological Graph Solver
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 font-mono border border-white/10">
                DAG ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Trip constraints modeled as directed graph vertices and flexible edges.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl bg-[#08090E] p-1 border border-white/[0.08] text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("dag")}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              activeTab === "dag"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Graph Vertices
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              activeTab === "diff"
                ? "bg-white text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Autonomous Diff
          </button>
        </div>
      </div>

      {activeTab === "dag" ? (
        <div className="space-y-4">
          {/* Node graph flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            {stops.map((stop, i) => {
              const isViolated = stop.status === "conflict";
              const isHealedStop = stop.status === "healed";
              return (
                <div
                  key={stop.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    isViolated
                      ? "border-rose-500/40 bg-rose-950/20 shadow-md shadow-rose-950/20"
                      : isHealedStop
                      ? "border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-950/20"
                      : "border-white/[0.08] bg-[#0A0D14]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className="text-slate-400 font-bold">Node #{i + 1}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          stop.constraint.type === "hard"
                            ? "bg-white text-black"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {stop.constraint.type.toUpperCase()}_CONSTRAINT
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs truncate">
                      {stop.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-300 block mt-0.5 font-semibold">
                      {stop.currentTime}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] text-slate-400">
                    <span className="block font-medium truncate">
                      {stop.constraint.description}
                    </span>
                    {isViolated && (
                      <span className="text-rose-400 font-bold mt-1 block">
                        Edge Broken (-{Math.abs(stop.bufferMinutes)}m)
                      </span>
                    )}
                    {isHealedStop && (
                      <span className="text-emerald-400 font-bold mt-1 block">
                        Edge Restructured
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Note */}
          <div className="rounded-xl bg-[#0A0D14] border border-white/[0.06] p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <GitBranch className="h-4 w-4 text-white shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-white">
                Topological Graph Resilience:
              </span>{" "}
              Traditional routing treats stops as a rigid string. When departure lags by 75 minutes,
              the Jebel Jais sunset window at 17:48 is violated. Glide decouples the sunset node,
              promotes hotel check-in to preserve dining, and reschedules the mountain summit
              to Day 2 morning — resolving the domino cascade automatically.
            </div>
          </div>
        </div>
      ) : (
        /* Diff comparison view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {/* Static App (Traditional) */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                Static Travel Apps (Failure Mode)
              </span>
              <span className="text-[10px] rounded bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 font-mono">
                Manual Friction
              </span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  Arrives at Jebel Jais at 18:30 in complete darkness (+42m past sunset).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  Check-in delayed past 20:30; 20:00 dinner reservation forfeited.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  SevenRooms automatic cancellation penalty charged to credit card.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Requires frantic calls to hotel and restaurant while driving.</span>
              </li>
            </ul>
          </div>

          {/* Glide Autonomous Solver */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Glide Autonomous Resolution
              </span>
              <span className="text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 font-mono">
                Zero Phone Calls
              </span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  Sunset node shifted to Day 2 08:30 AM (crisp morning peak visibility).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  SevenRooms table moved to 21:15 via API without penalty.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  Hotel PMS notified of late arrival window with mobile key ready.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Apple Wallet pass and Dynamic Island updated in background.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
