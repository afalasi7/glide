"use client";

import React from "react";
import { Wifi, Battery, ChevronLeft, MoreVertical } from "lucide-react";
import { SamsungWalletPass } from "@/components/wallet/SamsungWalletPass";

interface SamsungGalaxyS25UltraFrameProps {
  isHealed?: boolean;
  className?: string;
}

export const SamsungGalaxyS25UltraFrame: React.FC<SamsungGalaxyS25UltraFrameProps> = ({
  isHealed = true,
  className = "",
}) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Outer Galaxy S25 Ultra Boxy Sharp Titanium Chassis */}
      <div className="relative h-[690px] w-[330px] rounded-[24px] p-[10px] bg-gradient-to-b from-[#2A2D35] via-[#1B1E26] to-[#12141C] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)]">
        {/* Hardware Buttons (Right Side Flat Titanium Rail) */}
        {/* Volume Rocker (Right Top) */}
        <div className="absolute -right-[13px] top-[150px] h-16 w-[4px] rounded-r-xs bg-[#3A3E4A]" />
        {/* Power Button (Right Middle) */}
        <div className="absolute -right-[13px] top-[230px] h-10 w-[4px] rounded-r-xs bg-[#3A3E4A]" />

        {/* Display Screen with sharp corners matching Samsung Ultra */}
        <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-[#0A0D18] text-white flex flex-col select-none ring-1 ring-black">
          {/* Centered Infinity-O Camera Punch Hole */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black ring-1 ring-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          </div>

          {/* Samsung One UI Status Bar */}
          <div className="relative z-40 flex items-center justify-between px-5 pt-3 pb-2 text-xs text-slate-300">
            <span className="text-[12px] font-bold tracking-tight font-sans">10:00</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="h-3 w-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-semibold">98%</span>
                <Battery className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Samsung Wallet App Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-blue-500/15 bg-[#121626]">
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 text-slate-300" />
              <span className="text-xs font-bold text-white">Samsung Wallet</span>
            </div>
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </div>

          {/* Screen Scroll Area: Samsung Wallet Pass Display */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-3 space-y-3 no-scrollbar flex flex-col items-center">
            {/* Live Pass Pill */}
            <div className="w-full flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Smart Pass • Auto-Synced</span>
              <span className="text-emerald-400 font-medium">SevenRooms Hook</span>
            </div>

            {/* Samsung Wallet Pass Component */}
            <SamsungWalletPass
              venueName="Levant & Nar"
              time="21:15"
              tableNumber="Table #14"
              seatingArea="Outdoor Terrace"
              referenceCode="SR-994182-MOD"
              status={isHealed ? "Autonomously Modified" : "Confirmed • Original"}
              isHealed={isHealed}
            />

            {/* Quick Helper Text */}
            <p className="text-[10px] text-slate-400 text-center pt-1">
              Protected by Glide Autonomous Agent Engine
            </p>
          </div>

          {/* Samsung One UI Bottom Gesture Bar */}
          <div className="relative z-40 pb-2 pt-1 flex justify-center bg-[#0A0D18]">
            <div className="h-1 w-28 rounded-full bg-slate-400/50" />
          </div>
        </div>
      </div>
    </div>
  );
};
