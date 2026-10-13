"use client";

import React from "react";
import Image from "next/image";
import {
  Wifi,
  Battery,
  Utensils,
  Sun,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { GlideLogo } from "@/components/GlideLogo";

interface IPhone16ProMaxFrameProps {
  isHealed?: boolean;
  className?: string;
}

export const IPhone16ProMaxFrame: React.FC<IPhone16ProMaxFrameProps> = ({
  isHealed = true,
  className = "",
}) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Outer Titanium Chassis Frame */}
      <div className="relative h-[690px] w-[330px] rounded-[54px] p-[10px] bg-gradient-to-b from-[#2E323B] via-[#1E2127] to-[#15171C] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)]">
        {/* Hardware Buttons */}
        <div className="absolute -left-[13px] top-[115px] h-7 w-[4px] rounded-l-sm bg-[#383C46]" />
        <div className="absolute -left-[13px] top-[158px] h-12 w-[4px] rounded-l-sm bg-[#383C46]" />
        <div className="absolute -left-[13px] top-[220px] h-12 w-[4px] rounded-l-sm bg-[#383C46]" />
        <div className="absolute -right-[13px] top-[170px] h-16 w-[4px] rounded-r-sm bg-[#383C46]" />
        <div className="absolute -right-[13px] top-[280px] h-12 w-[4px] rounded-r-sm bg-[#2A2E38]" />

        {/* Display Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[45px] bg-[#07090E] text-white flex flex-col select-none ring-1 ring-black font-sans">
          {/* Dynamic Island Pill */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex h-[28px] w-[122px] items-center justify-between rounded-full bg-black px-2.5 shadow-md border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400">Glide</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-400">Dinner 21:15</span>
          </div>

          {/* iOS Status Bar */}
          <div className="relative z-40 flex items-center justify-between px-7 pt-3 pb-1 text-xs text-white">
            <span className="text-[12px] font-semibold tracking-tight font-mono">9:41</span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Screen Content: Mobbin-Grade Itinerary Feed */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-5 pb-5 space-y-3 no-scrollbar">
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <GlideLogo size={28} />
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white leading-none">
                    Glide
                  </h4>
                  <span className="text-[9px] text-zinc-400">Road Trip Protection</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Protected</span>
              </span>
            </div>

            {/* Scenic Hero Destination Card */}
            <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
              <Image
                src="/images/jebel_jais_sunset.jpg"
                alt="Jebel Jais mountain road"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-emerald-300 font-bold block">
                    SUMMIT RESCHEDULED
                  </span>
                  <h5 className="text-xs font-bold text-white leading-tight">
                    Jebel Jais Sunrise Deck
                  </h5>
                  <p className="text-[9px] text-zinc-300">Day 2 • 08:30 AM (Morning Light)</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-white/20">
                  +75m Healed
                </span>
              </div>
            </div>

            {/* Timeline Stops */}
            <div className="space-y-2">
              {/* Stop 1: Traffic Delay */}
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src="/images/dubai_traffic_gridlock.jpg"
                    alt="Dubai traffic"
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">Dubai Marina</span>
                    <span className="text-[9px] font-mono text-amber-300 font-bold">4:15 PM</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 truncate">+75m highway bottleneck absorbed</p>
                </div>
              </div>

              {/* Stop 2: Resort Check-in */}
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src="/images/ic_rak_resort.jpg"
                    alt="InterContinental Resort"
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">InterContinental RAK</span>
                    <span className="text-[9px] font-mono text-cyan-300 font-bold">6:35 PM</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 truncate">Mobile room key dispatched</p>
                </div>
              </div>

              {/* Stop 3: Levant & Nar Dinner */}
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5">
                <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src="/images/levant_nar_dining.jpg"
                    alt="Levant & Nar terrace dining"
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">Levant &amp; Nar</span>
                    <span className="text-[9px] font-mono text-emerald-300 font-bold">9:15 PM</span>
                  </div>
                  <p className="text-[9px] text-emerald-300/80 truncate">Table #14 saved with 0 penalty</p>
                </div>
              </div>
            </div>

            {/* Pass Sync Indicator */}
            <div className="rounded-xl bg-black/60 border border-white/10 p-2 text-center text-[10px] text-zinc-400">
              <span>Apple Wallet &amp; Dynamic Island Live Sync</span>
            </div>
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="relative z-40 pb-2 pt-1 flex justify-center bg-[#07090E]">
            <div className="h-1 w-32 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
