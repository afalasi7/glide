"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, Globe, Cpu } from "lucide-react";

interface HeaderProps {
  isHealed: boolean;
  isHealing: boolean;
  totalSavedMinutes: number;
}

export const Header: React.FC<HeaderProps> = ({
  isHealed,
  isHealing,
  totalSavedMinutes,
}) => {
  return (
    <header className="relative border-b border-cyan-950/40 bg-gradient-to-r from-slate-950 via-[#0B0F19] to-slate-950 px-6 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Branding */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
                <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  GLIDE
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-normal">
                    v2.4 Autonomous
                  </span>
                </h1>
                <p className="text-xs font-medium text-slate-400">
                  Autonomous AI Travel Itinerary Shock Absorber
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Dubai Chamber Championship Badge & Live Agent Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Competition Badge */}
          <div className="group relative flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-4 py-1.5 shadow-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="text-xs leading-none">
              <span className="font-semibold text-amber-200">
                Dubai Chamber Create AI Agents
              </span>
              <span className="mx-1.5 text-amber-500/60">•</span>
              <span className="text-amber-400/90 font-medium">
                Youth Category Prototype
              </span>
            </div>
          </div>

          {/* Graph status badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Dependency Engine:</span>
            <span className="font-mono text-cyan-300 font-semibold">
              Topological DAG
            </span>
          </div>

          {/* Healing state indicator */}
          <div
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-300 ${
              isHealing
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 animate-pulse"
                : isHealed
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            <ShieldCheck
              className={`h-3.5 w-3.5 ${
                isHealing
                  ? "text-cyan-400 animate-spin"
                  : isHealed
                  ? "text-emerald-400"
                  : "text-slate-400"
              }`}
            />
            <span>
              {isHealing
                ? "Autonomous Solver Running..."
                : isHealed
                ? `Protected (Saved ${totalSavedMinutes}m)`
                : "Standby Monitor"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
