"use client";

import React, { createContext, useContext } from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { CHAPTERS } from "@/components/story/data";

export const [depart, jais, hotel, dinner] = CHAPTERS;
export const clock = (t: string) => t.replace(/^Day \d • /, "");

/** Thin ink bezel; `punch` swaps the iPhone island for a Galaxy camera dot. */
export function Phone({ children, punch = false, className = "" }: { children: React.ReactNode; punch?: boolean; className?: string }) {
  return (
    <div className={`relative w-[280px] shrink-0 rounded-[46px] bg-ink p-[7px] shadow-lift ${className}`}>
      <div className="relative aspect-[9/19] overflow-hidden rounded-[39px] bg-cream text-ink">
        {punch ? (
          <span className="absolute left-1/2 top-2.5 z-20 h-3 w-3 -translate-x-1/2 rounded-full bg-ink" />
        ) : (
          <span className="absolute left-1/2 top-2.5 z-20 h-6 w-[88px] -translate-x-1/2 rounded-full bg-ink" />
        )}
        {children}
      </div>
    </div>
  );
}

/** Unfolded foldable: two panes under one thin bezel. */
export function Fold({ left, right, className = "" }: { left: React.ReactNode; right: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-full max-w-[640px] rounded-[34px] bg-ink p-[7px] shadow-lift ${className}`}>
      <div className="relative grid aspect-[4/3] grid-cols-2 overflow-hidden rounded-[28px] bg-cream text-ink">
        <span className="absolute left-1/2 top-0 z-20 h-full w-px bg-ink/25" />
        <div className="relative overflow-hidden">{left}</div>
        <div className="relative overflow-hidden">{right}</div>
      </div>
    </div>
  );
}

/** In the real app the OS draws its own status bar, so screens drop the fake one. */
export const BareContext = createContext(false);

export function Status({ time = "16:15" }: { time?: string }) {
  const bare = useContext(BareContext);
  if (bare) return <div className="pt-[max(env(safe-area-inset-top),12px)]" />;
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold">
      <span className="num">{time}</span>
      <span aria-hidden className="tracking-widest">●●●</span>
    </div>
  );
}

function Row({ time, was, label, note, hot = false }: { time: string; was?: string; label: string; note: string; hot?: boolean }) {
  return (
    <li className="flex items-center gap-3 border-b border-ink/10 py-2.5 last:border-0">
      <div className="w-[52px]">
        <p className={`num text-xl leading-none ${hot ? "text-violet" : ""}`}>{time}</p>
        {was && <p className="num mt-0.5 text-[10px] text-ink-soft line-through">{was}</p>}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate font-display text-[15px] italic">{label}</p>
        <p className="truncate text-[10.5px] text-ink-soft">{note}</p>
      </div>
      {hot && <span className="rounded-full bg-sun px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">New</span>}
    </li>
  );
}

export function PlanScreen() {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Friday · +75 min</p>
        <h3 className="mt-1 text-[34px] leading-[0.95] tracking-[-0.02em]">
          Your day, <em className="text-violet">re-planned.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[118px] overflow-hidden rounded-t-[70px] rounded-b-[14px]">
        <Image src={jais.photo} alt="" fill sizes="260px" className="object-cover" />
        <span className="absolute bottom-2 left-2 rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold">Jebel Jais · Day 2 {clock(jais.time)}</span>
      </div>
      <ul className="mt-2 px-5">
        <Row time={clock(depart.time)} was={depart.was} label="Leave Dubai Marina" note="Route re-timed" />
        <Row time={clock(jais.time)} label="Jebel Jais" note="Moved to tomorrow morning" hot />
        <Row time={clock(hotel.time)} was={hotel.was} label="InterContinental RAK" note="Hotel told · key ready" />
        <Row time={clock(dinner.time)} was={dinner.was} label="Levant & Nar" note="Table saved · no fee" hot />
      </ul>
      <div className="mt-auto flex items-center gap-2 px-5 pb-5">
        <div className="h-8 w-8"><BotArt mood="happy" small /></div>
        <p className="text-[11px] leading-tight text-ink-soft">Nothing for you to do. Keep driving.</p>
      </div>
    </div>
  );
}

export function ChatScreen() {
  return (
    <div className="flex h-full flex-col">
      <Status time="16:18" />
      <div className="flex items-center gap-2 border-b border-ink/10 px-5 pb-2 pt-2">
        <div className="h-9 w-9"><BotArt mood="idle" small /></div>
        <div className="leading-tight">
          <p className="font-display text-lg italic">Glide</p>
          <p className="text-[10px] text-ink-soft">Your trip agent</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-4 py-4 text-[12px] leading-snug">
        <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper px-3 py-2">You are 75 minutes behind. I moved the mountain to tomorrow at {clock(jais.time)}.</p>
        <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper px-3 py-2">I kept your table. Levant &amp; Nar is now {clock(dinner.time)}, no fee.</p>
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-paper p-2">
          <div className="relative h-20 overflow-hidden rounded-xl">
            <Image src={dinner.photo} alt="" fill sizes="240px" className="object-cover" />
            <span className="absolute bottom-1.5 left-2 font-display text-lg italic text-white">Levant &amp; Nar</span>
            <span className="num absolute bottom-1.5 right-2 text-xl text-white">{clock(dinner.time)}</span>
          </div>
          <p className="mt-2 px-1 font-mono text-[10.5px]">levant-nar-2115.pkpass</p>
          <p className="px-1 text-[10px] text-ink-soft">Copied from your updated reservation</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Apple Wallet", "Google Wallet", "Samsung Wallet"].map((w) => (
            <span key={w} className="rounded-full bg-ink px-2.5 py-1 text-[9.5px] font-medium text-paper">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoadScreen() {
  return (
    <div className="flex h-full flex-col">
      <Status time="17:02" />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">On the road</p>
        <h3 className="mt-1 text-[34px] leading-[0.95] tracking-[-0.02em]">
          Dinner is at <em className="text-violet">{clock(dinner.time)}.</em>
        </h3>
      </div>
      <svg viewBox="0 0 240 300" className="mx-auto mt-3 w-[88%]" aria-hidden>
        <path d="M30 280 C 30 220, 190 230, 190 170 S 40 130, 90 70 S 200 40, 180 12" fill="none" stroke="#1C1230" strokeWidth="26" strokeLinecap="round" opacity="0.92" />
        <path d="M30 280 C 30 220, 190 230, 190 170 S 40 130, 90 70 S 200 40, 180 12" fill="none" stroke="#FFB400" strokeWidth="3" strokeDasharray="10 9" strokeLinecap="round" />
        <circle cx="30" cy="280" r="8" fill="#5B3DF5" /><circle cx="180" cy="12" r="8" fill="#FF5A36" />
        <g transform="translate(150 150) scale(0.32)"><BotArt mood="happy" small /></g>
      </svg>
      <div className="mx-5 mt-auto mb-5 rounded-2xl bg-paper px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Arrive</p>
        <p className="num text-3xl leading-none">{clock(hotel.time)}</p>
        <p className="mt-1 text-[10.5px] text-ink-soft">Hotel is expecting you.</p>
      </div>
    </div>
  );
}
