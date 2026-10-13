"use client";

import React from "react";
import Image from "next/image";
import { Utensils, Clock, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { WalletPassProps } from "./AppleWalletPass";

export const GoogleWalletPass: React.FC<WalletPassProps> = ({
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
      className={`relative w-full max-w-[340px] select-none overflow-hidden rounded-[28px] bg-[#1C1B1F] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.15)] border border-[#49454F]/40 font-sans ${className}`}
    >
      {/* Header Photo with Google Wallet Bar */}
      <div className="relative h-28 w-full overflow-hidden bg-[#141218]">
        <Image
          src="/images/levant_nar_dining.jpg"
          alt="Levant & Nar dining terrace"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1F] via-black/40 to-black/30" />

        <div className="relative z-10 flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/15">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-[11px] font-semibold tracking-tight text-white">Google Wallet</span>
          </div>

          <span className="text-[9px] font-bold tracking-wider uppercase text-[#CAC4D0] bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
            DINING PASS
          </span>
        </div>
      </div>

      {/* Main Material 3 Surface */}
      <div className="p-4 pt-1 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
              {venueName}
            </h3>
            <p className="text-xs text-[#CAC4D0] flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-[#CAC4D0]/70" />
              <span>InterContinental Mina Al Arab</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-[#CAC4D0]">SEATING TIME</span>
            <p className="text-sm font-bold font-mono tabular-nums text-[#A8C7FA]">{time}</p>
          </div>
        </div>

        {/* Primary Chips (Material 3 Style) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#2B2930] border border-[#49454F]/30 p-2.5 text-center">
            <span className="block text-[8px] font-mono uppercase text-[#CAC4D0]">TABLE</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{tableNumber}</span>
          </div>
          <div className="rounded-xl bg-[#2B2930] border border-[#49454F]/30 p-2.5 text-center">
            <span className="block text-[8px] font-mono uppercase text-[#CAC4D0]">AREA</span>
            <span className="text-xs font-bold text-white mt-0.5 block truncate">{seatingArea}</span>
          </div>
          <div className="rounded-xl bg-[#2B2930] border border-[#49454F]/30 p-2.5 text-center">
            <span className="block text-[8px] font-mono uppercase text-[#CAC4D0]">PARTY</span>
            <span className="text-xs font-bold text-white mt-0.5 block">2 Guests</span>
          </div>
        </div>

        {/* Status Chip (Google Blue #A8C7FA Accent) */}
        {isHealed && (
          <div className="rounded-xl bg-[#004A77]/40 border border-[#A8C7FA]/40 p-2.5 flex items-center justify-between text-xs text-[#D3E3FD]">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#A8C7FA]" />
              <span>Table Shifted (+75m Absorbed)</span>
            </div>
            <span className="font-mono text-[10px] text-[#A8C7FA] font-bold">21:15 OK</span>
          </div>
        )}

        {/* Barcode Strip */}
        <div className="rounded-2xl bg-[#2B2930]/80 border border-[#49454F]/30 p-3 flex flex-col items-center">
          <div className="flex h-9 w-full max-w-[220px] items-stretch justify-center gap-[2px] bg-white p-1.5 rounded-lg">
            {[
              2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3,
              1, 4, 2, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2,
            ].map((width, idx) => (
              <span
                key={idx}
                className="bg-black self-stretch rounded-[0.5px]"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
          <span className="mt-1.5 font-mono text-[9px] text-[#CAC4D0] tracking-wider tabular-nums">
            {referenceCode}
          </span>
        </div>
      </div>
    </div>
  );
};
