"use client";

import React from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";

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
    { label: "On Time", sublabel: "3:00 PM", value: 0 },
    { label: "+15 min", sublabel: "3:15 PM", value: 15 },
    { label: "+45 min", sublabel: "3:45 PM", value: 45 },
    { label: "+75 min", sublabel: "4:15 PM", value: 75 },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Departure Delay Simulator
          </h2>
          <p className="text-xs text-zinc-300 mt-0.5">
            Test what happens when life gets in the way of your schedule
          </p>
        </div>

        {delayMinutes > 0 ? (
          <span className="text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
            +{delayMinutes}m late
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            On schedule
          </span>
        )}
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10">
        {presets.map((preset) => {
          const isSelected = delayMinutes === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onSetDelay(preset.value)}
              disabled={isHealing}
              className={`py-2 px-1 text-center rounded-lg transition-all ${
                isSelected
                  ? "bg-white text-zinc-950 font-bold shadow-md scale-[1.02]"
                  : "text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              } disabled:opacity-50`}
            >
              <div className="text-xs">{preset.label}</div>
              <div className={`text-[10px] ${isSelected ? "text-zinc-700 font-semibold" : "text-zinc-400"}`}>
                {preset.sublabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <div className="pt-1">
        {!isHealed ? (
          <button
            onClick={onTriggerHeal}
            disabled={isHealing || delayMinutes === 0}
            className={`w-full py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              delayMinutes > 0 && !isHealing
                ? "bg-white text-zinc-950 hover:bg-zinc-100 hover:shadow-xl hover:shadow-white/10 active:scale-[0.99] cursor-pointer"
                : "bg-white/10 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {isHealing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                <span>5 Autonomous Agents Fixing Your Trip...</span>
              </>
            ) : delayMinutes > 0 ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Fix My Trip with AI Agents</span>
              </>
            ) : (
              <span>Trip is on schedule (Select a delay above to test)</span>
            )}
          </button>
        ) : (
          <div className="w-full flex items-center gap-2.5">
            <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Trip fixed! Mountain moved to morning, dinner at 9:15 PM</span>
            </div>
            <button
              onClick={onReset}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
