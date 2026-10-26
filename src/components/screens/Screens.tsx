"use client";

import React, { createContext, useContext } from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { CHAPTERS, clock } from "@/components/story/data";
import { MessageComposer } from "./MessageComposer";
import { GlassPanel, GlassTag, useGlassColorScheme } from "@/components/ui/glass";
import { TripTicket } from "@/components/ui/TripTicket";

export const depart = CHAPTERS.find((chapter) => chapter.key === "depart")!;
export const jais = CHAPTERS.find((chapter) => chapter.key === "jais")!;
export const hotel = CHAPTERS.find((chapter) => chapter.key === "hotel")!;
export const dinner = CHAPTERS.find((chapter) => chapter.key === "dinner")!;
export { clock };

/** Thin ink bezel; `punch` swaps the iPhone island for a Galaxy camera dot. */
export function Phone({ children, punch = false, className = "" }: { children: React.ReactNode; punch?: boolean; className?: string }) {
  const dark = useGlassColorScheme();
  return (
    <div className={`relative w-[280px] shrink-0 rounded-[46px] bg-ink p-[7px] shadow-lift ${className}`}>
      <div className={`glide-glass-screen relative aspect-[9/19] overflow-hidden rounded-[39px] ${dark ? "dark" : ""}`}>
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
  const dark = useGlassColorScheme();
  return (
    <div className={`relative w-full max-w-[640px] rounded-[34px] bg-ink p-[7px] shadow-lift ${className}`}>
      <div className={`glide-glass-screen relative grid aspect-[4/3] grid-cols-2 overflow-hidden rounded-[28px] ${dark ? "dark" : ""}`}>
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
      {hot && <GlassTag className="text-[10px]">New</GlassTag>}
    </li>
  );
}

export function PlanScreen() {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Your trip · updated plan</p>
        <h3 className="mt-1 text-[34px] leading-[0.95] tracking-[-0.02em]">
          Every detail, <em className="text-violet">in sync.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[118px] overflow-hidden rounded-t-[70px] rounded-b-[14px]">
        <Image src={jais.photo} alt="" fill sizes="260px" className="object-cover" />
        <GlassTag className="glide-glass-photo-label absolute bottom-2 left-2 bg-card text-[10px]">Jebel Jais · Day 2 {clock(jais.time)}</GlassTag>
      </div>
      <ul className="glass-panel mx-4 mt-3 rounded-xl px-3">
        <Row time={clock(depart.time)} was={depart.was} label="Leave Dubai Marina" note="Route re-timed" />
        <Row time={clock(hotel.time)} was={hotel.was} label="InterContinental RAK" note="Hotel told · key ready" />
        <Row time={clock(dinner.time)} was={dinner.was} label="Levant & Nar" note="Table saved · no fee" hot />
        <Row time={clock(jais.time)} label="Jebel Jais" note="Day 2 · moved to morning" hot />
      </ul>
      <div className="mt-auto flex items-center gap-2 px-5 pb-5">
        <div className="h-8 w-8"><BotArt mood="happy" small /></div>
        <p className="text-[11px] leading-tight text-ink-soft">Nothing for you to do. Keep driving.</p>
      </div>
    </div>
  );
}

export function ChatScreen() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const latestMessage = React.useRef<HTMLParagraphElement>(null);
  const feed = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, []);
  React.useEffect(() => {
    if (messages.length) latestMessage.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
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
      <div ref={feed} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 py-4 text-[12px] leading-snug" data-lenis-prevent>
        <p className="glide-chat-bubble glass-control max-w-[88%] rounded-xl bg-card px-3 py-2">The day shifted, so I reshaped the rest of your trip. Jebel Jais is now tomorrow at {clock(jais.time)}.</p>
        <p className="glide-chat-bubble glass-control max-w-[88%] rounded-xl bg-card px-3 py-2">I kept your table. Levant &amp; Nar is now {clock(dinner.time)}, no fee.</p>
        <p className="max-w-[88%] text-[11px] text-ink-soft">Guided demo: messages appear here, but live replies are not connected.</p>
        <TripTicket
          kind="Dinner reservation"
          place="Levant & Nar"
          time={clock(dinner.time)}
          date="Fri 13 Nov"
          image={dinner.photo}
          fields={[{ label: "Guests", value: "2" }, { label: "Change fee", value: "AED 0" }]}
          status="Trip preview"
          compact
          className="w-full max-w-[92%] shrink-0"
        />
        <div className="flex flex-wrap gap-1.5">
          {["Apple Wallet", "Google Wallet", "Samsung Wallet"].map((w) => (
            <GlassTag key={w} className="text-[10px]">{w}</GlassTag>
          ))}
        </div>
        {messages.map((message, index) => (
          <p key={index} ref={index === messages.length - 1 ? latestMessage : undefined} className="glide-chat-bubble-user glass-primary max-w-[88%] self-end break-words rounded-xl px-3 py-2">{message}</p>
        ))}
      </div>
      <MessageComposer onSend={(message) => setMessages((previous) => [...previous, message])} />
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
      <GlassPanel className="mx-5 mt-auto mb-5 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Arrive</p>
        <p className="num text-3xl leading-none">{clock(hotel.time)}</p>
        <p className="mt-1 text-[10.5px] text-ink-soft">Hotel is expecting you.</p>
      </GlassPanel>
    </div>
  );
}
