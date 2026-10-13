"use client";

import React from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { Status, clock, dinner, hotel, jais, depart } from "./Screens";

export const TRIP_DATE = "Fri 13 Nov";

const btn = "w-full rounded-full px-6 py-3.5 text-base font-semibold tracking-wide";

export function WelcomeScreen({ onNext, onSignIn }: { onNext?: () => void; onSignIn?: () => void }) {
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
        <button type="button" onClick={onSignIn} className={`${btn} mt-2 text-ink`}>I already have an account</button>
      </div>
    </div>
  );
}

const field = "w-full rounded-full bg-paper px-5 py-3.5 text-[14px] text-ink outline-none ring-1 ring-ink/10 placeholder:text-ink-soft focus:ring-2 focus:ring-violet";

/** Sign up and sign in share one screen; the mock account is kept on the device. */
export function AuthScreen({ mode = "signup", onSubmit, onSwitch }: { mode?: "signup" | "signin"; onSubmit?: (name: string) => void; onSwitch?: () => void }) {
  const up = mode === "signup";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const ok = email.includes("@") && pass.length >= 6 && (!up || name.trim().length > 0);
  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(e) => { e.preventDefault(); if (ok) onSubmit?.(name.trim()); }}
    >
      <Status time="9:41" />
      <div className="px-6 pt-4">
        <div className="h-14 w-14"><BotArt mood="happy" /></div>
        <h3 className="mt-3 text-[36px] leading-[0.95] tracking-[-0.02em]">
          {up ? <>Make your <em className="text-violet">account.</em></> : <>Welcome <em className="text-violet">back.</em></>}
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">{up ? "So Glide can keep your trip safe and in sync." : "Sign in to pick up your trip."}</p>
      </div>
      <div className="mt-5 space-y-2.5 px-6">
        {up && <input aria-label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />}
        <input aria-label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
        <input aria-label="Password" type="password" autoComplete={up ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password (6+ characters)" className={field} />
      </div>
      <div className="mt-auto px-6 pb-7">
        <button type="submit" disabled={!ok} className={`${btn} bg-ink text-paper disabled:opacity-35`}>{up ? "Create account" : "Sign in"}</button>
        <button type="button" onClick={onSwitch} className="mt-3 w-full text-center text-[13px] text-ink-soft">
          {up ? "Already have an account? " : "New to Glide? "}<span className="font-semibold text-violet">{up ? "Sign in" : "Sign up"}</span>
        </button>
      </div>
    </form>
  );
}

/** Onboarding about the app: what Glide needs, and a promise to show how. */
export function IntroScreen({ name, onNext }: { name?: string; onNext?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Status time="9:42" />
      <div className="flex flex-1 flex-col justify-center px-7">
        <div className="h-20 w-20"><BotArt mood="idle" /></div>
        <h3 className="mt-5 text-[36px] leading-[0.98] tracking-[-0.02em]">
          {name ? `Nice to meet you, ${name}.` : "Nice to meet you."} <em className="text-violet">One quick thing.</em>
        </h3>
        <p className="mt-4 text-[15px] font-light leading-snug text-ink-soft">
          You have to connect your Google Calendar and your settings so I can see your trip. I&apos;m going to show you how in just a minute.
        </p>
      </div>
      <div className="px-6 pb-7">
        <button type="button" onClick={onNext} className={`${btn} bg-ink text-paper`}>Show me how</button>
        <p className="mt-3 text-center text-[11px] text-ink-soft">Step 1 of 3</p>
      </div>
    </div>
  );
}

/** Calendar access: connecting Google Calendar imports the trip date. */
export function ConnectScreen({ connected = true, onToggle, onNext }: { connected?: boolean; onToggle?: () => void; onNext?: () => void }) {
  const interactive = Boolean(onToggle);
  return (
    <div className="flex h-full flex-col">
      <Status time="9:42" />
      <div className="px-6 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Step 2 of 3 · Calendar access</p>
        <h3 className="mt-1 text-[34px] leading-[0.95] tracking-[-0.02em]">
          Let Glide <em className="text-violet">see your trip.</em>
        </h3>
      </div>
      <div className="mx-6 mt-5 flex items-center gap-3 rounded-[28px] bg-paper p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet/10" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#5B3DF5" strokeWidth="2" strokeLinecap="round">
            <rect x="3.5" y="5" width="17" height="15" rx="4" /><path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] font-semibold">Google Calendar</p>
          <p className="text-[12px] text-ink-soft">Only your trip date</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={!interactive}
          aria-pressed={connected}
          className={`rounded-full px-4 py-2 text-[12px] font-semibold ${connected ? "bg-mint-pale text-ink" : "bg-ink text-paper"}`}
        >
          {connected ? "Allowed" : "Allow"}
        </button>
      </div>
      <div className={`mx-6 mt-4 rounded-[32px] bg-ink p-5 text-paper transition-opacity ${connected ? "opacity-100" : "opacity-30"}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-paper/60">Imported from Google Calendar</p>
        <p className="num mt-1 text-[36px] leading-none text-sun">{connected ? TRIP_DATE : "- - -"}</p>
        <p className="mt-1 text-[12px] text-paper/80">Dubai Marina to Ras Al Khaimah</p>
      </div>
      <p className="mx-7 mt-4 text-[12px] font-light leading-snug text-ink-soft">Dinner and hotel settings are already set up for you.</p>
      <div className="mt-auto px-6 pb-7">
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
      <div className="relative mx-5 mt-3 h-[96px] overflow-hidden rounded-[28px]">
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
