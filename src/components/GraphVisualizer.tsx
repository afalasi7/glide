"use client";

import React, { useState } from "react";
import {
  Network,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight,
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
  delayMinutes,
}) => {
  const [activeTab, setActiveTab] = useState<"dag" | "diff">("dag");

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/70 p-5 shadow-xl backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Topological Dependency Graph
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] text-cyan-400 font-mono border border-cyan-800/40">
                DAG SOLVER
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Trip constraints modeled as directed graph vertices & time buffers.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl bg-slate-900/80 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("dag")}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              activeTab === "dag"
                ? "bg-cyan-500/20 text-cyan-300 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Graph Nodes
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              activeTab === "diff"
                ? "bg-cyan-500/20 text-cyan-300 font-bold"
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
            {/* Visual connector arrows on larger screens */}
            {stops.map((stop, i) => {
              const isViolated = stop.status === "conflict";
              const isHealedStop = stop.status === "healed";
              return (
                <div
                  key={stop.id}
                  className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 ${
                    isViolated
                      ? "border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/30"
                      : isHealedStop
                      ? "border-cyan-500/40 bg-cyan-950/20 shadow-md shadow-cyan-950/30"
                      : "border-slate-800 bg-slate-900/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className="text-slate-400">Node #{i + 1}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          stop.constraint.type === "hard"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {stop.constraint.type.toUpperCase()}_CONSTRAINT
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs truncate">
                      {stop.title}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                      {stop.currentTime}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
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

          {/* Graph Explanation Note */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-850 p-3 text-xs text-slate-400 flex items-start gap-2.5">
            <GitBranch className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">
                Topological Resilience Analysis:
              </span>{" "}
              Traditional routing treats stops as a fixed sequence. Glide converts
              stops into a directed acyclic graph where flexible nodes (Hotel check-in)
              yield to rigid temporal nodes (Sunset cutoff at 17:48). When delayed past
              the sunset window, the solver decouples the Jebel Jais edge and branches
              it into Day 2 morning, preventing domino cancellation of the SevenRooms dinner.
            </div>
          </div>
        </div>
      ) : (
        /* Diff comparison view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Static App (Traditional) */}
          <div className="rounded-xl border border-rose-900/40 bg-rose-950/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-rose-900/30">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                Static Travel Apps (Failure Mode)
              </span>
              <span className="text-[10px] text-rose-400 font-sans font-bold">
                Manual Panic
              </span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400">✕</span>
                <span>
                  Arrival at Jebel Jais at 18:30 in pitch dark (+42m past sunset cutoff).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400">✕</span>
                <span>
                  Check-in delayed until 20:45; dinner at Levant & Nar missed.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400">✕</span>
                <span>
                  SevenRooms automatic cancellation penalty charged to credit card.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400">✕</span>
                <span>Requires 3+ manual frantic phone calls while driving.</span>
              </li>
            </ul>
          </div>

          {/* Glide Autonomous Solver */}
          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/30">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Glide Autonomous Shock Absorber
              </span>
              <span className="text-[10px] text-emerald-400 font-sans font-bold">
                Zero Friction
              </span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  Sunset node rescheduled to Day 2 08:30 AM (crisp mountain morning light).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  SevenRooms VIP table moved smoothly to 21:15 via API.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  Cloudbeds hotel PMS notified of guaranteed 20:00 arrival.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Apple Wallet pass & Dynamic Island update silently in background.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
