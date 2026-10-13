"use client";

import React from "react";
import Image from "next/image";
import { Utensils, CheckCircle2, ChevronUp, Sparkles, MapPin } from "lucide-react";
import { WalletPassProps } from "./AppleWalletPass";

export const SamsungWalletPass: React.FC<WalletPassProps> = ({
  venueName = "Levant & Nar",
  time = "21:15",
  tableNumber = "Table #14",
  seatingArea = "Outdoor Terrace",
  referenceCode = "SR-994182-MOD",
  status = "Autonomously Modified",
  isHealed = true,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-[340px] select-none overflow-hidden rounded-[26px] bg-[#0A0E1A] text-white shadow-2xl border border-[#4B8BF5]/30 font-sans ${className}`}
    >
      {/* Photo Header with Samsung Wallet Brand Bar */}
      <div className="relative h-28 w-full overflow-hidden bg-[#0A0E1A]">
        <Image
          src="/images/levant_nar_dining.jpg"
          alt="Levant & Nar dining terrace"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-black/40 to-black/30" />

        <div className="relative z-10 flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/15">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-[#1428A0] text-white font-black text-[9px]">
              S
            </div>
            <span className="text-[11px] font-bold text-white">Samsung Wallet</span>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B8BF5] bg-[#4B8BF5]/15 px-2.5 py-0.5 rounded-full border border-[#4B8BF5]/30">
            ONE UI 7
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-4 pt-1 space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
              {venueName}
            </h3>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-zinc-500" />
              <span>InterContinental Ras Al Khaimah</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-zinc-400">DINNER TIME</span>
            <p className="text-sm font-bold font-mono tabular-nums text-[#4B8BF5]">{time}</p>
          </div>
        </div>

        {/* Autonomous Healing Pill (Samsung Blue #4B8BF5 Accent) */}
        {isHealed && (
          <div className="flex items-center justify-between rounded-xl bg-[#4B8BF5]/15 border border-[#4B8BF5]/35 px-3 py-2 text-xs text-[#99BEFF]">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-[#4B8BF5]" />
              <span>Table Shifted (+75m Absorbed)</span>
            </div>
            <span className="font-mono text-[10px] text-[#4B8BF5] font-bold">Guaranteed</span>
          </div>
        )}

        {/* Field Details */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2 text-center">
            <span className="block text-[8px] font-mono uppercase text-zinc-400 font-medium">TABLE</span>
            <p className="text-xs font-bold text-white mt-0.5">{tableNumber}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2 text-center">
            <span className="block text-[8px] font-mono uppercase text-zinc-400 font-medium">LOCATION</span>
            <p className="text-xs font-bold text-white mt-0.5 truncate">{seatingArea}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2 text-center">
            <span className="block text-[8px] font-mono uppercase text-zinc-400 font-medium">GUESTS</span>
            <p className="text-xs font-bold text-white mt-0.5">2 People</p>
          </div>
        </div>

        {/* Barcode Strip */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-2.5 flex flex-col items-center">
          <div className="flex h-9 w-full max-w-[210px] items-stretch justify-center gap-[2px] bg-white p-1.5 rounded-lg">
            {[
              2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3,
              1, 4, 2, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2,
            ].map((width, idx) => (
              <span
                key={idx}
                className="bg-neutral-900 self-stretch rounded-[0.5px]"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
          <span className="mt-1 font-mono text-[9px] text-zinc-400 tracking-wider tabular-nums">
            {referenceCode}
          </span>
        </div>

        {/* Quick Action Pill at Bottom with Swipe Hint */}
        <div className="pt-1.5">
          <div className="mx-auto flex items-center justify-center gap-1.5 rounded-full bg-[#4B8BF5]/15 border border-[#4B8BF5]/30 px-3.5 py-2 text-[11px] font-bold text-[#4B8BF5] hover:bg-[#4B8BF5]/25 transition cursor-pointer">
            <ChevronUp className="h-3.5 w-3.5 animate-bounce" />
            <span>Swipe up to open Samsung Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
