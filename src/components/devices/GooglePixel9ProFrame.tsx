"use client";

import React from "react";
import { Wifi, Battery, ChevronLeft, MoreVertical } from "lucide-react";
import { GoogleWalletPass } from "@/components/wallet/GoogleWalletPass";

interface GooglePixel9ProFrameProps {
  isHealed?: boolean;
  className?: string;
}

export const GooglePixel9ProFrame: React.FC<GooglePixel9ProFrameProps> = ({
  isHealed = true,
  className = "",
}) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Outer Pixel 9 Pro Polished Metal Chassis */}
      <div className="relative h-[690px] w-[330px] rounded-[48px] p-[10px] bg-gradient-to-b from-[#252830] via-[#1B1E24] to-[#14161A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)]">
        {/* Hardware Buttons */}
        {/* Power Button (Right Top) */}
        <div className="absolute -right-[13px] top-[140px] h-10 w-[4px] rounded-r-sm bg-[#353842]" />
        {/* Volume Rocker (Right Lower - Pixel unique button layout where volume is below power) */}
        <div className="absolute -right-[13px] top-[200px] h-20 w-[4px] rounded-r-sm bg-[#353842]" />

        {/* Display Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[39px] bg-[#121316] text-white flex flex-col select-none ring-1 ring-black">
          {/* Centered Pixel Front Camera Punch Hole */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex h-4 w-4 items-center justify-center rounded-full bg-black ring-1 ring-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
          </div>

          {/* Android Status Bar */}
          <div className="relative z-40 flex items-center justify-between px-6 pt-3 pb-2 text-xs text-neutral-300">
            <span className="text-[12px] font-medium tracking-tight font-sans">9:41</span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Android App Bar for Google Wallet */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#1A1B1F]">
            <div className="flex items-center gap-2.5">
              <ChevronLeft className="h-4 w-4 text-neutral-300" />
              <span className="text-xs font-semibold text-white">Google Wallet</span>
            </div>
            <MoreVertical className="h-4 w-4 text-neutral-400" />
          </div>

          {/* Screen Scroll Area: Google Wallet Pass Display */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-4 space-y-3 no-scrollbar flex flex-col items-center">
            {/* Google Wallet Active Pass Banner */}
            <div className="w-full flex items-center justify-between px-1 text-[11px] text-neutral-400">
              <span>Saved Pass</span>
              <span className="text-emerald-400 font-medium">Synced via Glide API</span>
            </div>

            {/* Google Wallet Pass Component */}
            <GoogleWalletPass
              venueName="Levant & Nar"
              time="21:15"
              tableNumber="Table #14"
              seatingArea="Outdoor Terrace"
              referenceCode="SR-994182-MOD"
              status={isHealed ? "Autonomously Modified" : "Confirmed • Original"}
              isHealed={isHealed}
            />

            {/* Quick Helper Text */}
            <p className="text-[10px] text-neutral-400 text-center pt-1">
              Autonomous pass updated by Glide
            </p>
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="relative z-40 pb-2 pt-1 flex justify-center bg-[#121316]">
            <div className="h-1 w-24 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
