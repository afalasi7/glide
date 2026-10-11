"use client";

import React from "react";
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Car,
  Clock,
  Navigation,
} from "lucide-react";

interface DelayControlProps {
  delayMinutes: number;
  onSetDelay: (mins: number) => void;
  onTriggerHeal: () => void;
  onReset: () => void;
  isHealing: boolean;
  isHealed: boolean;
}

export const DelayControl: React.FC<DelayControlProps> = ({
  delayMinutes,
  onSetDelay,
  onTriggerHeal,
  onReset,
  isHealing,
  isHealed,
}) => {
  const presets = [
    { label: "+15m Traffic", value: 15, desc: "Minor congestion on E311" },
    { label: "+45m Delay", value: 45, desc: "Sharjah slowdown" },
    { label: "+75m Leaving Late", value: 75, desc: "Late packing & departure" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A]/80 p-5 shadow-xl backdrop-blur-xl transition-all">
      {/* Background Accent subtle glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Section Info & Trigger Simulator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sliders className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Interactive Delay Simulator
            </h2>
            <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              The Chaos Trigger
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Inject real-world friction into the trip. Watch static plans shatter
            before the autonomous shock absorber heals the DAG.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => {
            const isSelected = delayMinutes === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onSetDelay(preset.value)}
                disabled={isHealing}
                className={`group flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${
                  isSelected
                    ? "border-rose-500/60 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-950/40"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                }`}
                title={preset.desc}
              >
                <Clock
                  className={`h-3.5 w-3.5 ${
                    isSelected
                      ? "text-rose-400"
                      : "text-slate-400 group-hover:text-cyan-400"
                  }`}
                />
                <span>{preset.label}</span>
                {isSelected && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider & Primary Trigger Action Bar */}
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-4 lg:grid-cols-12 lg:items-center">
        {/* Custom Minutes Slider */}
        <div className="lg:col-span-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-cyan-400" />
              Custom Travel Delta:
            </span>
            <span className="font-mono text-xs font-bold text-white">
              +{delayMinutes} mins delay
              {delayMinutes >= 45 && (
                <span className="ml-2 text-[11px] font-semibold text-rose-400">
                  (Violates Sunset Cutoff)
                </span>
              )}
            </span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={delayMinutes}
              disabled={isHealing}
              onChange={(e) => onSetDelay(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 transition-all focus:outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0m (On Time)</span>
            <span>+30m</span>
            <span>+60m</span>
            <span>+90m</span>
            <span>+120m (Severe)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-3 pt-1 lg:pt-0">
          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isHealing}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Trigger Autonomous Shock Absorber */}
          <button
            onClick={onTriggerHeal}
            disabled={isHealing || isHealed || delayMinutes === 0}
            className={`group relative flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
              isHealed
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 cursor-default"
                : delayMinutes > 0
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110"
                : "border border-slate-800 bg-slate-800/60 text-slate-400"
            }`}
          >
            {isHealing ? (
              <>
                <Zap className="h-4 w-4 animate-spin text-slate-950" />
                <span>Autonomous Healing in Progress...</span>
              </>
            ) : isHealed ? (
              <>
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Itinerary Graph Healed</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-slate-950 fill-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Trigger Autonomous Shock Absorber</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
