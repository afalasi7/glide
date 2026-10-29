"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { GlideBot } from "@/components/GlideBot";
import { TripTicket } from "@/components/ui/TripTicket";
import { TIMES } from "@/components/story/data";

const ease = [0.23, 1, 0.32, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Hero
   Spotlight motion adapted from the 21st.dev component "Spotlight"
   (manuarora700), driven by framer-motion instead of a keyframe so it
   respects prefers-reduced-motion without a stylesheet rule.
------------------------------------------------------------------- */

function Spotlight({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute blur-[110px] ${className}`}
      style={{
        background:
          "radial-gradient(closest-side, rgba(91,61,245,0.62), rgba(91,61,245,0.10) 55%, transparent 78%)",
      }}
      animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.07, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const liveChips = ["Flight +75 min", "3 stops re-timed", "0 silent changes"];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      <Image
        src="/images/hd/jebel_jais_sunset.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/95 via-ink/75 to-ink" aria-hidden />
      <Spotlight className="left-1/2 top-[-14%] h-[560px] w-[min(1000px,120vw)] -translate-x-1/2" />
      <div
        className="absolute right-[-10%] bottom-[-20%] h-[420px] w-[420px] rounded-full bg-sun/25 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-center px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sun">
          Glide · private beta
        </p>
        <h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,11vw,7rem)] leading-[0.9] tracking-[-0.035em]">
          The day changed. <span className="italic text-violet-300">The trip held.</span>
        </h1>
        <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-paper/80 sm:text-xl">
          One message re-times everything downstream and shows you the ripple before it happens.
          Nothing is booked, moved or paid without your yes.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="#how"
            className="glide-cta-solid inline-flex min-h-11 items-center gap-2 rounded-full px-7 py-3 font-semibold"
          >
            See it recover a day <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/alt-bento"
            className="inline-flex min-h-11 items-center rounded-full border border-paper/35 px-7 py-3 font-semibold"
          >
            Bento version
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap gap-2.5">
          {liveChips.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-2 rounded-full border border-paper/25 bg-paper/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-mint" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Marquee
   Loop behaviour adapted from the 21st.dev component "Logo Marquee"
   (grootstudio): duplicated content translated by exactly -50%, with the
   spacing carried by each item so the seam lands without a gap jump.
------------------------------------------------------------------- */

const routeBits = [
  "DXB → Jebel Jais",
  "Sunset cutoff 17:48",
  "Levant & Nar 21:15",
  "Marina departure 16:15",
  "Hotel flagged 19:35",
  "Jebel Jais Day 2 · 08:30",
  "Table rebooked, no fee",
];

function Marquee() {
  const reduce = useReducedMotion();
  return (
    <div className="border-y border-paper/15 bg-violet py-4 text-paper">
      <div
        className="overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <motion.div
          className="flex w-max"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {[...routeBits, ...routeBits].map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="whitespace-nowrap px-6 font-mono text-[13px] uppercase tracking-[0.14em]"
            >
              {b} <span className="opacity-45">✦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Stats */

const stats = [
  { n: "75", unit: "min", label: "of delay absorbed without losing the evening", tone: "text-coral" },
  { n: "3", unit: "", label: "stops re-timed inside a single reply", tone: "text-sun" },
  { n: "0", unit: "", label: "changes applied without your approval", tone: "text-mint" },
];

function Stats() {
  return (
    <section className="border-b border-paper/10 bg-ink px-5 py-16 text-paper sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="border-t border-paper/25 pt-5">
              <p className={`num text-[clamp(3rem,8vw,4.6rem)] leading-none ${s.tone}`}>
                {s.n}
                <span className="text-[0.4em] tracking-tight"> {s.unit}</span>
              </p>
              <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-paper/70">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Glow features */

const features = [
  {
    t: "It reads the whole day, not one message",
    d: "Departure, drive, sunset and table sit on one clock. A change to any of them re-checks the rest before you see a proposal.",
    glow: "rgba(91,61,245,0.55)",
  },
  {
    t: "It separates what must move from what can hold",
    d: "A late flight costs you a morning, not the dinner you booked. Glide keeps the reservation that still works and only re-times the legs that do not.",
    glow: "rgba(255,180,0,0.42)",
  },
  {
    t: "It shows its working",
    d: "Every proposal arrives with the exact option, total price, fees and terms — laid out as a before-and-after you can read in two seconds.",
    glow: "rgba(47,214,161,0.42)",
  },
];

function Features() {
  return (
    <section id="how" className="scroll-mt-24 border-b border-paper/10 bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sun">How it holds</p>
          <h2 className="mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.98] tracking-[-0.03em]">
            Three decisions, made in the open.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.t} delay={i * 0.08} className="h-full">
              <div className="relative h-full overflow-hidden rounded-3xl border border-paper/15 bg-paper/[0.04] p-7">
                <div
                  className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-[70px]"
                  style={{ background: f.glow, opacity: 0.6 }}
                  aria-hidden
                />
                <div className="relative">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-paper/50">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-xl leading-snug">{f.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/70">{f.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Tiers */

const tiers = [
  {
    name: "Holidays",
    line: "Weeks away, built once and held together",
    items: ["Flights, stays, activities and meals", "Reservations held across time zones", "Weather and daylight factored into the route"],
    accent: false,
  },
  {
    name: "Business",
    line: "Meetings that cannot slip",
    items: ["Arrival, check-in and transfer windows", "Meetings pinned, travel built around them", "Rerouted the moment a flight moves"],
    accent: true,
  },
  {
    name: "Everyday",
    line: "The trips that still have to work",
    items: ["Airport runs, school runs, dinners", "Live traffic and departure watching", "Two or three stops, kept in step"],
    accent: false,
  },
];

function Tiers() {
  return (
    <section className="border-b border-paper/10 bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sun">Where it fits</p>
            <h2 className="mt-4 max-w-[16ch] text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.98] tracking-[-0.03em]">
              Three kinds of trip.
            </h2>
          </div>
          <p className="max-w-[40ch] text-sm leading-relaxed text-paper/65">
            One agent, one thread. What changes is how much has to stay on schedule.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <div
                className={`flex h-full flex-col rounded-3xl border p-7 ${
                  t.accent
                    ? "border-violet/70 bg-violet/15 shadow-[0_0_60px_-20px_rgba(91,61,245,0.9)]"
                    : "border-paper/15 bg-paper/[0.04]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-2xl">{t.name}</h3>
                  {t.accent && (
                    <span className="rounded-full bg-violet px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                      Most asked
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-paper/65">{t.line}</p>
                <ul className="mt-6 space-y-3 border-t border-paper/15 pt-6 text-sm">
                  {t.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
                      <span className="leading-relaxed text-paper/85">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Approval */

function Approval() {
  return (
    <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sun">The last word</p>
          <h2 className="mt-4 max-w-[14ch] text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.98] tracking-[-0.03em]">
            Nothing changes until you approve it.
          </h2>
          <p className="mt-6 max-w-[50ch] leading-relaxed text-paper/75">
            Every proposed change shows the exact option, the total price, the fees and the terms
            first. A trip request never authorises the next action.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold"
            >
              Open the demo app
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center rounded-full border border-paper/35 px-7 py-3 font-semibold"
            >
              Read the conditions
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <GlideBot size={40} />
            <p className="text-sm text-paper/60">
              Preview only — no reservation is held and nothing is charged.
            </p>
          </div>
        </div>

        <Reveal className="mx-auto w-full max-w-[430px]">
          <TripTicket
            kind="Dinner reservation"
            place="Levant & Nar"
            time={TIMES.dinner}
            date="Fri 13 Nov"
            image="/images/hd/levant_nar_dining.jpg"
            fields={[
              { label: "Current time", value: "20:00" },
              { label: "Guests", value: "2" },
              { label: "Change fee", value: "AED 0" },
            ]}
            status="Preview · no change made"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- CTA / Footer */

function Cta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-paper/15 bg-ink px-5 py-24 text-paper sm:px-8">
      <Spotlight className="left-1/2 top-1/2 h-[360px] w-[min(760px,110vw)] -translate-x-1/2 -translate-y-1/2" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[clamp(2.4rem,7vw,4.6rem)] leading-[0.96] tracking-[-0.03em]">
          Give it a trip.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-paper/75">
          Glide is in private testing. The site, the app demo and the conversation are illustrative —
          WhatsApp, booking and payments are not live yet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-8 py-3 font-semibold"
          >
            Open the demo app
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center rounded-full border border-paper/35 px-8 py-3 font-semibold"
          >
            Privacy
          </Link>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  const links = [
    ["Current landing", "/"],
    ["Chat variant", "/alt-conversation"],
    ["Editorial variant", "/alt-editorial"],
    ["Bento variant", "/alt-bento"],
    ["Showcase variant", "/alt-showcase"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ];
  return (
    <footer className="border-t border-paper/15 bg-ink px-5 py-9 text-paper sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <Link href="/" className="inline-flex items-center gap-2 text-paper">
          <GlideBot size={38} />
          <span className="font-display text-2xl italic">Glide</span>
        </Link>
        <nav aria-label="Variants and legal" className="flex flex-wrap gap-5 text-sm text-paper/80">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-paper">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function NoirLanding() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <Hero />
      <Marquee />
      <Stats />
      <Features />
      <Tiers />
      <Approval />
      <Cta />
      <Foot />
    </main>
  );
}
