"use client";

import React from "react";
import { GlideLogo } from "@/components/GlideLogo";

interface AppleWatchUltra3FrameProps {
  isHealed?: boolean;
  className?: string;
}

export const AppleWatchUltra3Frame: React.FC<AppleWatchUltra3FrameProps> = ({
  isHealed = true,
  className = "",
}) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Top Strap Connector Hint (Alpine Loop / Ocean Band Lug) */}
      <div className="h-6 w-36 rounded-t-lg bg-gradient-to-b from-[#181A20] to-[#252830] border-t border-x border-white/10 shadow-inner flex items-center justify-center">
        <div className="h-1 w-16 rounded-full bg-neutral-600/40" />
      </div>

      {/* Main Apple Watch Ultra 3 49mm Titanium Case */}
      <div className="relative h-[430px] w-[330px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#474B54] via-[#2F323A] to-[#212328] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
        {/* Left Hardware Accent: International Orange Action Button */}
        <div className="absolute -left-[14px] top-[140px] flex flex-col items-center">
          <div className="h-16 w-[7px] rounded-l-md bg-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.4)] border-l border-y border-[#FF7A29]" />
        </div>

        {/* Left Speaker / Siren Grilles (Watch Ultra) */}
        <div className="absolute -left-[5px] top-[225px] flex flex-col gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
        </div>

        {/* Right Hardware Accent: Raised Titanium Guard with Digital Crown & Side Button */}
        <div className="absolute -right-[16px] top-[105px] flex flex-col items-center">
          {/* Digital Crown with Orange Accent Groove */}
          <div className="relative h-18 w-[10px] rounded-r-md bg-gradient-to-r from-[#2B2E36] to-[#454954] border border-white/20 shadow-md flex items-center justify-center overflow-hidden">
            {/* Tactile orange ring in crown center */}
            <div className="h-full w-[2px] bg-[#FF5A00]" />
          </div>
        </div>

        {/* Right Microphone Hole */}
        <div className="absolute -right-[7px] top-[195px] h-2 w-2 rounded-full bg-neutral-900 ring-1 ring-neutral-700" />

        {/* Right Side Flush Button */}
        <div className="absolute -right-[13px] top-[220px] h-12 w-[6px] rounded-r-sm bg-[#383C46] border border-white/10" />

        {/* Flat Sapphire Crystal Lip Ring */}
        <div className="h-full w-full rounded-[44px] bg-[#121418] p-[7px] ring-1 ring-white/10 shadow-inner">
          {/* Edge-to-Edge WatchOS OLED Display */}
          <div className="relative h-full w-full overflow-hidden rounded-[37px] bg-black text-white p-4 flex flex-col justify-between select-none">
            {/* Top Watch Bar: Compact Complication + Time */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-1.5">
                <GlideLogo size={22} variant="emerald" />
                <span className="text-[11px] font-bold tracking-tight text-white">GLIDE</span>
              </div>

              <div className="flex items-baseline gap-1 text-right">
                <span className="font-mono text-base font-black tracking-tight tabular-nums text-white">
                  09:41
                </span>
                <span className="text-[9px] font-mono text-[#FF5A00]">RAK</span>
              </div>
            </div>

            {/* Central Modular Complication: Next Stop Info & Trip Status */}
            <div className="my-auto rounded-2xl bg-[#12151E] border border-emerald-500/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  NEXT STOP • DINNER
                </span>
                {isHealed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    HEALED +75m
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-400">AT RISK</span>
                )}
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  Levant & Nar
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xl font-black text-emerald-400 tabular-nums">
                      21:15
                    </span>
                    <span className="text-[10px] text-neutral-400 line-through">20:00</span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300 bg-white/10 px-2 py-0.5 rounded-md">
                    Table #14
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-[9px] text-neutral-400">
                <span>Terrace • SevenRooms</span>
                <span className="text-emerald-400 font-mono">100% Synced</span>
              </div>
            </div>

            {/* Bottom Sub-Complications Row (Watch Ultra Gauges) */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              {/* Complication 1: Stop Count */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-1.5 flex flex-col items-center">
                <span className="text-[8px] font-semibold text-neutral-400 uppercase">STOP</span>
                <span className="font-mono text-xs font-black text-white">4 / 4</span>
              </div>

              {/* Complication 2: Agent Tool Calls */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-1.5 flex flex-col items-center">
                <span className="text-[8px] font-semibold text-neutral-400 uppercase">TOOLS</span>
                <span className="font-mono text-xs font-black text-emerald-400">4 AUTO</span>
              </div>

              {/* Complication 3: Calls Made */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-1.5 flex flex-col items-center">
                <span className="text-[8px] font-semibold text-neutral-400 uppercase">CALLS</span>
                <span className="font-mono text-xs font-black text-white">0 REQ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strap Connector Hint */}
      <div className="h-6 w-36 rounded-b-lg bg-gradient-to-t from-[#181A20] to-[#252830] border-b border-x border-white/10 shadow-inner flex items-center justify-center">
        <div className="h-1 w-16 rounded-full bg-neutral-600/40" />
      </div>
    </div>
  );
};
