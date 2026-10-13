"use client";

import React from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { Status, clock, dinner, hotel, jais, depart } from "./Screens";

export const TRIP_DATE = "Fri 13 Nov";

const btn = "w-full rounded-full px-6 py-3.5 text-base font-semibold tracking-wide";

export function WelcomeScreen({ onNext }: { onNext?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Status time="9:41" />
      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <div className="h-36 w-36"><BotArt mood="happy" /></div>
        <h3 className="mt-6 text-[40px] leading-[0.95] tracking-[-0.02em]">
          Your trip, <em className="text-violet">handled.</em>
        </h3>
        <p className="mt-4 max-w-[26ch] text-[14px] font-light leading-snug text-ink-soft">
          Glide watches your plans and fixes them when you run late.
        </p>
      </div>
      <div className="px-6 pb-7">
        <button type="button" onClick={onNext} className={`${btn} bg-ink text-paper`}>Get started</button>
        <p className="mt-3 text-center text-[11px] text-ink-soft">Step 1 of 3</p>
      </div>
    </div>
  );
}

function Plugin({ name, note, on, onToggle, interactive }: { name: string; note: string; on: boolean; onToggle?: () => void; interactive?: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet/10" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#5B3DF5" strokeWidth="2" strokeLinecap="round">
          <rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[13.5px] font-semibold">{name}</p>
        <p className="truncate text-[11px] text-ink-soft">{note}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={!interactive}
        aria-pressed={on}
        className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold ${on ? "bg-mint-pale text-ink" : "bg-ink text-paper"}`}
      >
        {on ? "Connected" : "Connect"}
      </button>
    </li>
  );
}

/** Plugins live in their own section: the Google Calendar plugin imports the trip date. */
export function ConnectScreen({ connected = true, onToggle, onNext }: { connected?: boolean; onToggle?: () => void; onNext?: () => void }) {
  const interactive = Boolean(onToggle);
  return (
    <div className="flex h-full flex-col">
      <Status time="9:42" />
      <div className="px-5 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Step 2 of 3 · Plugins</p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          Bring your <em className="text-violet">trip in.</em>
        </h3>
      </div>
      <ul className="mt-4 space-y-2 px-5">
        <Plugin name="Google Calendar" note="Imports your trip date" on={connected} onToggle={onToggle} interactive={interactive} />
        <Plugin name="SevenRooms" note="Moves your dinner table" on interactive={false} />
        <Plugin name="Cloudbeds" note="Tells the hotel you're late" on interactive={false} />
      </ul>
      <div className={`mx-5 mt-4 rounded-[22px] bg-ink p-4 text-paper transition-opacity ${connected ? "opacity-100" : "opacity-30"}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-paper/60">Imported from Google Calendar</p>
        <p className="num mt-1 text-[34px] leading-none text-sun">{connected ? TRIP_DATE : "- - -"}</p>
        <p className="mt-1 text-[12px] text-paper/80">Dubai Marina to Ras Al Khaimah</p>
      </div>
      <div className="mt-auto px-5 pb-6">
        <button type="button" onClick={onNext} disabled={!connected && interactive} className={`${btn} bg-ink text-paper disabled:opacity-30`}>Continue</button>
      </div>
    </div>
  );
}

/** The agent area: Glide speaks first, the composer is live, and Start begins the trip. */
export function AgentScreen({ onStart }: { onStart?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Status time="9:43" />
      <div className="flex items-center gap-2 border-b border-ink/10 px-5 pb-2 pt-2">
        <div className="h-9 w-9"><BotArt mood="idle" /></div>
        <div className="leading-tight">
          <p className="font-display text-lg italic">Glide</p>
          <p className="text-[10px] text-ink-soft">Step 3 of 3 · Your trip agent</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-4 py-4 text-[12.5px] leading-snug">
        <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper px-3 py-2">Hi, I&apos;m Glide. I found your trip in Google Calendar: <b>{TRIP_DATE}</b>, Dubai Marina to Ras Al Khaimah.</p>
        <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper px-3 py-2">Three stops: Jebel Jais at sunset, the InterContinental, and dinner at Levant &amp; Nar.</p>
        <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper px-3 py-2">If you run late I&apos;ll move things and message you here. Ready?</p>
      </div>
      <div className="flex items-center gap-2 border-t border-ink/10 bg-paper/70 px-3 pb-5 pt-3">
        <div className="flex-1 rounded-full bg-cream px-4 py-2.5 text-[12.5px] text-ink-soft">Message Glide…</div>
        <button type="button" onClick={onStart} className="rounded-full bg-sun px-5 py-2.5 text-[13px] font-semibold text-ink">Start</button>
      </div>
    </div>
  );
}

const STOPS = [
  { c: depart, name: "Dubai Marina", note: "Leave" },
  { c: jais, name: "Jebel Jais", note: "Sunset deck" },
  { c: hotel, name: "InterContinental RAK", note: "Check in" },
  { c: dinner, name: "Levant & Nar", note: "Dinner" },
];

/** After onboarding: where to go, in order, on the original schedule. */
export function RouteScreen({ onLate }: { onLate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Status time="15:00" />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">{TRIP_DATE} · on schedule</p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          Where <em className="text-violet">to go.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[96px] overflow-hidden rounded-t-[60px] rounded-b-[14px]">
        <Image src={jais.photo} alt="" fill sizes="260px" className="object-cover" />
        <span className="absolute bottom-2 left-2 rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold">Next: Jebel Jais</span>
      </div>
      <ol className="relative mt-3 px-5">
        <span className="absolute bottom-3 left-[29px] top-3 w-0.5 bg-ink/15" aria-hidden />
        {STOPS.map((s, i) => (
          <li key={s.name} className="relative flex items-center gap-3 py-2">
            <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>{i + 1}</span>
            <div className="flex-1 leading-tight">
              <p className="font-display text-[15px] italic">{s.name}</p>
              <p className="text-[10.5px] text-ink-soft">{s.note}</p>
            </div>
            <p className="num text-lg">{s.c.was}</p>
          </li>
        ))}
      </ol>
      <div className="mt-auto px-5 pb-5">
        <button type="button" onClick={onLate} className={`${btn} bg-coral text-ink`}>I&apos;m running 75 min late</button>
      </div>
    </div>
  );
}

export { clock };
