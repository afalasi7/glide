"use client";

import React from "react";
import Image from "next/image";
import { Utensils, Sparkles, ShieldCheck, MapPin } from "lucide-react";

export interface WalletPassProps {
  venueName?: string;
  time?: string;
  tableNumber?: string;
  seatingArea?: string;
  referenceCode?: string;
  status?: string;
  isHealed?: boolean;
  className?: string;
}

export const AppleWalletPass: React.FC<WalletPassProps> = ({
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
      className={`relative w-full max-w-[340px] select-none overflow-hidden rounded-[28px] bg-white text-neutral-900 shadow-2xl transition-transform duration-300 font-sans border border-neutral-200/60 border-t-2 border-gradient ${className}`}
      style={{
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.06)",
        borderImage: "linear-gradient(90deg, #10B981, #38BDF8, #818CF8) 1",
      }}
    >
      {/* Top shimmer accent gradient border */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] z-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #10B981 0%, #38BDF8 50%, #818CF8 100%)",
        }}
      />

      {/* Apple Wallet Header Photo Banner */}
      <div className="relative h-28 w-full overflow-hidden bg-[#111318]">
        <Image
          src="/images/levant_nar_dining.jpg"
          alt="Levant & Nar waterfront dining terrace"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Top Wallet Bar */}
        <div className="relative z-10 p-3.5 flex items-center justify-between font-bold tracking-tight text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-tight uppercase text-neutral-200">
                DINING RESERVATION
              </p>
              <p className="text-xs font-bold tracking-tight text-white leading-tight">Apple Wallet</p>
            </div>
          </div>

          <div className="text-right bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
            <span className="text-[8px] uppercase tracking-wider text-neutral-200 block">SEATING</span>
            <p className="text-xs font-bold font-mono tabular-nums text-emerald-400 leading-tight">
              {time}
            </p>
          </div>
        </div>
      </div>

      {/* Main Pass Body */}
      <div className="bg-white px-5 pt-3.5 pb-4">
        {/* Primary Venue Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
              RESTAURANT
            </span>
            <h3 className="text-2xl font-black tracking-tight text-neutral-950 leading-tight">
              {venueName}
            </h3>
            <p className="text-xs text-neutral-600 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-neutral-400" />
              <span>InterContinental Mina Al Arab</span>
            </p>
          </div>

          {/* Autonomous Status Badge */}
          {isHealed ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/30 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{status}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
              <span>{status}</span>
            </div>
          )}
        </div>

        {/* Key Fields Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-b border-neutral-100">
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral-500">
              TABLE
            </span>
            <p className="text-xs font-extrabold text-neutral-900 mt-0.5">{tableNumber}</p>
          </div>
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral-500">
              SEATING
            </span>
            <p className="text-xs font-bold text-neutral-900 mt-0.5 truncate">{seatingArea}</p>
          </div>
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral-500">
              GUESTS
            </span>
            <p className="text-xs font-bold text-neutral-900 mt-0.5">2 People</p>
          </div>
        </div>

        {/* Secondary Details */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 pb-1 text-xs">
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral-500">
              CONFIRMATION
            </span>
            <p className="font-mono text-[11px] font-bold text-neutral-900 tracking-wider tabular-nums mt-0.5">
              {referenceCode}
            </p>
          </div>
          <div>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-neutral-500">
              SCHEDULE STATUS
            </span>
            <p className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>+75m absorbed</span>
            </p>
          </div>
        </div>
      </div>

      {/* Perforation / Notched Divider */}
      <div className="relative flex items-center justify-between bg-white px-2 py-0">
        <div className="h-4 w-2.5 rounded-r-full bg-[#07080B] -ml-2 border-r border-neutral-200/20" />
        <div className="w-full border-t border-dashed border-neutral-200 mx-2" />
        <div className="h-4 w-2.5 rounded-l-full bg-[#07080B] -mr-2 border-l border-neutral-200/20" />
      </div>

      {/* Barcode & Verification */}
      <div className="bg-[#FAFBFD] px-5 pt-3 pb-3.5 text-center border-t border-neutral-100">
        <div className="mx-auto flex flex-col items-center justify-center">
          <div className="flex h-11 w-full max-w-[230px] items-stretch justify-center gap-[2px] bg-white p-2 rounded-lg border border-neutral-200/80 shadow-xs">
            {[
              2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3,
              1, 4, 2, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2,
            ].map((width, idx) => (
              <span
                key={idx}
                className="bg-neutral-900 self-stretch rounded-[0.5px]"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>

          <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-widest text-neutral-600 tabular-nums">
            {referenceCode}
          </p>
          <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-medium text-neutral-500">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
            <span>SevenRooms API • Real-Time Dynamic Pass</span>
          </div>
        </div>
      </div>
    </div>
  );
};
