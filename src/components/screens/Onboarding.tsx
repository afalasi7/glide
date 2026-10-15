"use client";

import React from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { Status, clock, dinner, hotel, jais, depart } from "./Screens";
import { MessageComposer } from "./MessageComposer";
import { GlassButton, GlassInput, GlassPanel, GlassTag } from "@/components/ui/glass";

export const TRIP_DATE = "Fri 13 Nov";

const btn = "w-full py-3.5 tracking-wide";

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
        <GlassButton onClick={onNext} className={btn}>Get started</GlassButton>
        <GlassButton variant="ghost" onClick={onSignIn} className={`${btn} mt-2`}>I already have an account</GlassButton>
      </div>
    </div>
  );
}

/** Sign up and sign in share one screen; the mock account is kept on the device. */
export function AuthScreen({ mode = "signup", onSubmit, onSwitch }: { mode?: "signup" | "signin"; onSubmit?: (name: string) => void; onSwitch?: () => void }) {
  const up = mode === "signup";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const ok = email.includes("@") && pass.length >= 6 && (!up || name.trim().length > 0);
  return (
    <form
      className="flex h-full flex-col gap-4 overflow-y-auto overscroll-contain"
      data-lenis-prevent
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
        {/* Google authentication will be connected separately. */}
        <GlassButton variant="secondary" className={`${btn} gap-3`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z" />
            <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59C7.19 7.72 9.4 5.96 12 5.96Z" />
          </svg>
          Continue with Google
        </GlassButton>
        <div className="flex items-center gap-3 py-2 text-[12px] text-ink-soft">
          <span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
          <span>or</span>
          <span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
        </div>
        {up && <GlassInput aria-label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />}
        <GlassInput aria-label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <GlassInput aria-label="Password" type="password" autoComplete={up ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password (6+ characters)" />
      </div>
      <div className="mt-auto shrink-0 px-6 pb-7">
        <GlassButton type="submit" disabled={!ok} className={btn}>{up ? "Create account" : "Sign in"}</GlassButton>
        <GlassButton variant="ghost" onClick={onSwitch} className="mt-3 w-full flex-wrap gap-x-1 text-center text-[13px]">
          {up ? "Already have an account? " : "New to Glide? "}<span className="font-semibold text-violet">{up ? "Sign in" : "Sign up"}</span>
        </GlassButton>
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
        <GlassButton onClick={onNext} className={btn}>Show me how</GlassButton>
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
      <GlassPanel className="mx-6 mt-5 flex items-center gap-3 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet/10" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#5B3DF5" strokeWidth="2" strokeLinecap="round">
            <rect x="3.5" y="5" width="17" height="15" rx="4" /><path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] font-semibold">Google Calendar</p>
          <p className="text-[12px] text-ink-soft">Only your trip date</p>
        </div>
        <GlassButton
          variant={connected ? "secondary" : "primary"}
          onClick={onToggle}
          disabled={!interactive}
          aria-pressed={connected}
          className="px-4 py-2 text-[12px]"
        >
          {connected ? "Allowed" : "Allow"}
        </GlassButton>
      </GlassPanel>
      <GlassPanel thickness="panel" className={`mx-6 mt-4 p-5 transition-opacity ${connected ? "opacity-100" : "opacity-30"}`}>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Imported from Google Calendar</p>
        <p className="num mt-1 text-[36px] leading-none text-violet">{connected ? TRIP_DATE : "- - -"}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Dubai Marina to Ras Al Khaimah</p>
      </GlassPanel>
      <p className="mx-7 mt-4 text-[12px] font-light leading-snug text-ink-soft">Dinner and hotel settings are already set up for you.</p>
      <div className="mt-auto px-6 pb-7">
        <GlassButton onClick={onNext} disabled={!connected && interactive} className={btn}>Continue</GlassButton>
      </div>
    </div>
  );
}

/** The agent area: Glide speaks first, the composer is live, and Start begins the trip. */
export function AgentScreen({ onStart }: { onStart?: () => void }) {
  const [messages, setMessages] = React.useState<string[]>([]);
  const latestMessage = React.useRef<HTMLParagraphElement>(null);
  React.useEffect(() => {
    if (messages.length) latestMessage.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  return (
    <div className="flex h-full flex-col">
      <Status time="9:43" />
      <GlassPanel thickness="panel" className="mx-4 mt-2 flex shrink-0 items-center gap-2 p-3">
        <div className="h-9 w-9"><BotArt mood="idle" small /></div>
        <div className="leading-tight">
          <p className="font-display text-lg italic">Glide</p>
          <p className="text-[10px] text-ink-soft">Step 3 of 3 · Your trip agent</p>
        </div>
      </GlassPanel>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 py-4 text-[12.5px] leading-snug" data-lenis-prevent>
        <p className="glide-chat-bubble glass-control max-w-[88%] rounded-xl bg-card px-3 py-2">Hi, I&apos;m Glide. I found your trip in Google Calendar: <b>{TRIP_DATE}</b>, Dubai Marina to Ras Al Khaimah.</p>
        <p className="glide-chat-bubble glass-control max-w-[88%] rounded-xl bg-card px-3 py-2">Three stops: Jebel Jais at sunset, the InterContinental, and dinner at Levant &amp; Nar.</p>
        <p className="glide-chat-bubble glass-control max-w-[88%] rounded-xl bg-card px-3 py-2">If you run late I&apos;ll move things and message you here. Ready?</p>
        {messages.map((message, index) => (
          <p key={index} ref={index === messages.length - 1 ? latestMessage : undefined} className="glide-chat-bubble-user glass-primary max-w-[88%] self-end break-words rounded-xl px-3 py-2">{message}</p>
        ))}
      </div>
      <MessageComposer onSend={(message) => setMessages((previous) => [...previous, message])} onStart={onStart} />
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
        <GlassTag className="glide-glass-photo-label absolute bottom-2 left-2 bg-card text-[10px]">Next: Jebel Jais</GlassTag>
      </div>
      <ol className="glass-panel relative mx-5 mt-3 rounded-xl px-4">
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
        <GlassButton variant="alert" onClick={onLate} className={btn}>I&apos;m running 75 min late</GlassButton>
      </div>
    </div>
  );
}

export { clock };
