"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Car,
  Check,
  FileText,
  Globe,
  KeyRound,
  Plane,
  Plus,
  Receipt,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { GlideBot } from "@/components/GlideBot";
import { TripTicket } from "@/components/ui/TripTicket";
import { CHAPTERS, TIMES } from "@/components/story/data";

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
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, tone = "text-violet" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${tone}`}>{children}</span>
  );
}

/* ---------------------------------------------------------------- Hero
   Centred hero with a product showcase underneath, following the pattern
   used by Flighty, TravelPerk and PamPam on Mobbin: one headline, one
   short paragraph, one primary action, then the product itself.
------------------------------------------------------------------- */

function Phone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto w-[248px] rounded-[2.6rem] border border-ink/20 bg-paper p-2.5 shadow-[0_50px_90px_-40px_rgba(28,18,48,0.55)] ${className}`}
    >
      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-ink/15" aria-hidden />
      <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white">
        <Image
          src="/images/glide-whatsapp-chat.png"
          alt="A Glide conversation arranging a road trip inside a messaging app"
          width={832}
          height={1889}
          priority
          sizes="(min-width: 1024px) 248px, 248px"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
      <div
        className="pointer-events-none absolute left-1/2 top-[-10rem] h-[460px] w-[min(900px,120vw)] -translate-x-1/2 rounded-full bg-violet/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-sun/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-mint/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Eyebrow>Glide · private beta</Eyebrow>
        <h1 className="mt-6 text-[clamp(3rem,12vw,7rem)] leading-[0.9] tracking-[-0.04em]">
          Have a nice trip.
        </h1>
        <p className="mt-3 font-display text-[clamp(1.5rem,5vw,2.75rem)] italic leading-tight text-violet">
          Glide keeps the clock.
        </p>
        <p className="mx-auto mt-7 max-w-[58ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
          One message becomes a route, a set of times and the reservations between them. When the day
          moves, Glide re-times everything downstream and shows you the cost of the change before it
          happens.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="#how"
            className="glide-cta-solid inline-flex min-h-11 items-center gap-2 rounded-full px-7 py-3 font-semibold"
          >
            See how it works <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          Illustrative preview. No live booking, payment or messaging connection.
        </p>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <Reveal delay={0.05} className="hidden lg:block">
          <TripTicket
            kind="Hotel check-in"
            place="InterContinental RAK"
            time={TIMES.hotel}
            date="Sat 14 Nov"
            image="/images/hd/ic_rak_resort.jpg"
            fields={[
              { label: "Guests", value: "2" },
              { label: "Change fee", value: "AED 0" },
            ]}
            status="Preview · no change made"
            className="mx-auto max-w-[280px]"
          />
        </Reveal>

        <Reveal delay={0.12}>
          <Phone />
        </Reveal>

        <Reveal delay={0.18} className="hidden lg:block">
          <TripTicket
            kind="Dinner reservation"
            place="Levant & Nar"
            time={TIMES.dinner}
            date="Fri 13 Nov"
            image="/images/hd/levant_nar_dining.jpg"
            fields={[
              { label: "Guests", value: "2" },
              { label: "Change fee", value: "AED 0" },
            ]}
            status="Preview · no change made"
            className="mx-auto max-w-[280px]"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Coverage
   The honest stand-in for a "trusted by" logo bar: what the product
   actually handles, rather than partners we do not have.
------------------------------------------------------------------- */

const covers = [
  "Flights",
  "Stays",
  "Tables",
  "Transfers",
  "Weather",
  "Traffic",
  "Time zones",
  "Fees & terms",
];

function Coverage() {
  return (
    <section className="border-y border-ink/10 bg-paper px-5 py-7 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2.5">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          One thread covers
        </span>
        {covers.map((c) => (
          <span
            key={c}
            className="rounded-full border border-ink/15 bg-cream px-3.5 py-1.5 text-sm text-ink"
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Feature trio
   Photo-led cards in the shape used by PamPam and Going: image, title,
   one sentence.
------------------------------------------------------------------- */

const trio = [
  {
    photo: "/images/hd/jebel_jais_sunset.jpg",
    alt: "Sunset over the mountains at Jebel Jais",
    title: "Light, not just time",
    body: "Sunset is a deadline Glide plans against, so the mountain stop happens while you can still see it.",
  },
  {
    photo: "/images/hd/levant_nar_dining.jpg",
    alt: "A set table at Levant and Nar",
    title: "The table is part of the route",
    body: "A reservation sits on the same clock as the drive that gets you there, and holds for as long as it says it will.",
  },
  {
    photo: "/images/hd/traffic_road.jpg",
    alt: "A road in traffic at dusk",
    title: "Traffic is an input",
    body: "Friday-evening congestion is counted in minutes and folded into every departure scheduled after it.",
  },
];

function FeatureTrio() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Built differently</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            The whole day, not one booking.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {trio.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08} className="h-full">
              <article className="group h-full overflow-hidden rounded-3xl border border-ink/15 bg-card">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={t.photo}
                    alt={t.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl leading-snug">{t.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Showroom
   Full-bleed image with the product laid over it and the caption below,
   following Joby Aviation's section on Mobbin.
------------------------------------------------------------------- */

function Showroom() {
  return (
    <section className="bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-ink/15">
            <Image
              src="/images/hd/ic_rak_resort.jpg"
              alt="A resort in Ras Al Khaimah at dusk"
              fill
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="glide-scrim absolute inset-0" aria-hidden />
            <div className="relative flex min-h-[460px] flex-col justify-end p-6 sm:min-h-[560px] sm:p-10">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <p className="max-w-[16ch] font-display text-[clamp(1.9rem,4.5vw,3.4rem)] italic leading-[1.02] text-ink">
                  The whole day, held in one ticket.
                </p>
                <TripTicket
                  kind="Dinner reservation"
                  place="Levant & Nar"
                  time={TIMES.dinner}
                  date="Fri 13 Nov"
                  image="/images/hd/levant_nar_dining.jpg"
                  fields={[
                    { label: "Was", value: "20:00" },
                    { label: "Guests", value: "2" },
                  ]}
                  status="Preview · no change made"
                  className="w-full max-w-[320px]"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-10 max-w-[30ch] text-center text-[clamp(1.6rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em]">
            Every change arrives as a preview — times, fees and terms — before anything moves.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- How it works
   Three numbered steps under one centred heading, following Going's
   "How Going Works" section on Mobbin.
------------------------------------------------------------------- */

const steps = [
  {
    n: "1",
    t: "Say it",
    d: "Message Glide the way you would message a friend. No forms, no tabs, no six confirmations to reconcile afterwards.",
  },
  {
    n: "2",
    t: "See the ripple",
    d: "Every stop downstream is re-checked and returned as a before-and-after you can read in a couple of seconds.",
  },
  {
    n: "3",
    t: "Approve",
    d: "Accept or decline that exact change. A trip request never authorises the next action on its own.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Three moves, and you are on your way.
          </h2>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((s, i) => (
            <li key={s.n} className="h-full text-center sm:text-left">
              <Reveal delay={i * 0.08} className="h-full">
                <span className="mx-auto grid size-11 place-items-center rounded-full border border-violet/35 bg-violet/10 font-mono text-sm font-semibold text-violet sm:mx-0">
                  {s.n}
                </span>
                <h3 className="mt-5 text-xl">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Deep dive
   Alternating full rows with a chip, a paragraph, a two-column checklist
   and a visual — the shape ToDesktop uses for "How it works".
------------------------------------------------------------------- */

function Bubbles() {
  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-violet px-4 py-3 text-sm leading-relaxed text-paper">
        We land in Dubai Thursday. Four nights — mountains, good food, no early mornings.
      </div>
      <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-ink/15 bg-card px-4 py-3 text-sm leading-relaxed text-ink">
        Four nights in Ras Al Khaimah, departing Thursday 15:00. Jebel Jais at sunset, table held for
        20:00. Shall I apply it?
      </div>
      <div className="ml-auto w-fit rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink-soft">
        Yes — apply
      </div>
      <div className="w-fit rounded-2xl rounded-bl-md border border-ink/15 bg-card px-4 py-3 text-xs leading-relaxed text-ink-soft">
        Preview only. Nothing is booked, held or charged in this demo.
      </div>
    </div>
  );
}

function ClockPanel() {
  const rows = [
    ["Departure", "15:00", "16:15"],
    ["Jebel Jais", "17:42", "Moved to tomorrow"],
    ["Check-in", "17:00", "18:05"],
    ["Dinner", "20:00", TIMES.dinner],
  ];
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-3xl border border-ink/15 bg-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        The day, re-timed
      </p>
      <ul className="mt-5 divide-y divide-ink/10">
        {rows.map(([label, was, now]) => (
          <li key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
            <span className="text-sm">{label}</span>
            <span className="flex items-center gap-2 font-mono text-sm tabular-nums">
              <s className="text-ink-soft/70">{was}</s>
              <ArrowRight className="size-3.5 text-violet" aria-hidden />
              <span className="font-semibold text-violet">{now}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink-soft">
        Illustrative scenario. The preview computes these values locally; nothing is sent to a
        provider.
      </p>
    </div>
  );
}

const deepDive = [
  {
    chip: "Step 1",
    title: "Ask in plain language",
    body: "Glide reads the request the way a person would — a destination, a mood, a constraint — and turns it into a dated route rather than a search results page.",
    items: [
      "Flights and arrival times",
      "Stays and check-in windows",
      "Tables and hold windows",
      "Transfers between stops",
      "Weather along the route",
      "Daylight at each stop",
    ],
    visual: <Bubbles />,
  },
  {
    chip: "Step 2",
    title: "Glide builds one clock",
    body: "Every stop gets a time, and every time depends on the one before it. Move the first and the rest are re-checked before you are asked to decide anything.",
    items: [
      "Departure watch",
      "Drive time in real traffic",
      "Sunset and first light",
      "Check-in and check-out",
      "Reservation hold times",
      "Time zones across cities",
    ],
    visual: <ClockPanel />,
  },
  {
    chip: "Step 3",
    title: "You approve the change",
    body: "Nothing runs on its own. The proposal lands with the exact option, the total price, the fees and the terms attached, and waits for your yes.",
    items: [
      "Before and after shown",
      "Total price in full",
      "Every fee itemised",
      "Terms attached",
      "One tap to accept",
      "One tap to decline",
    ],
    visual: (
      <TripTicket
        kind="Dinner reservation"
        place="Levant & Nar"
        time={TIMES.dinner}
        date="Fri 13 Nov"
        image="/images/hd/levant_nar_dining.jpg"
        fields={[
          { label: "Was", value: "20:00" },
          { label: "Guests", value: "2" },
          { label: "Change fee", value: "AED 0" },
        ]}
        status="Preview · awaiting your approval"
        className="mx-auto w-full max-w-[340px]"
      />
    ),
  },
];

function DeepDive() {
  return (
    <section className="border-t border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl space-y-20 sm:space-y-28">
        {deepDive.map((row, i) => (
          <Reveal key={row.chip}>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                <span className="inline-block rounded-full border border-violet/35 bg-violet/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-violet">
                  {row.chip}
                </span>
                <h3 className="mt-5 text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] tracking-[-0.02em]">
                  {row.title}
                </h3>
                <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-soft">{row.body}</p>
                <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {row.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : undefined}>{row.visual}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Timeline
   The +75 scenario, told chronologically from the solver's own values in
   CHAPTERS. Each row carries what was planned and what the preview shows.
------------------------------------------------------------------- */

function Timeline() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Eyebrow>The +75 scenario</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            A day, and the day it becomes.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Leave 75 minutes late on a Friday and watch what has to move. These are the values the
            preview computes locally — an illustration of the mechanic, not a record of a real trip.
          </p>
        </div>

        <ol className="relative mt-14 space-y-5 border-l border-ink/20 pl-6 sm:pl-10">
          {CHAPTERS.map((c, i) => (
            <li key={c.key} className="relative">
              <span
                className="absolute -left-[30px] top-8 size-3 rounded-full bg-violet ring-4 ring-cream sm:-left-[46px]"
                aria-hidden
              />
              <Reveal delay={i * 0.05}>
                <div className="grid gap-5 rounded-3xl border border-ink/15 bg-card p-5 sm:grid-cols-[1fr_200px] sm:items-center sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm tabular-nums">
                      {c.was ? (
                        <>
                          <s className="text-ink-soft/70">{c.was}</s>
                          <ArrowRight className="size-3.5 text-violet" aria-hidden />
                        </>
                      ) : null}
                      <span className="font-semibold text-violet">{c.time}</span>
                    </div>
                    <p className="mt-2 text-base font-semibold">{c.place}</p>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                      {c.problem}
                    </p>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed">{c.fix}</p>
                  </div>
                  <div className="relative h-32 overflow-hidden rounded-2xl border border-ink/10 sm:h-36">
                    <Image
                      src={c.photo}
                      alt={c.place}
                      fill
                      sizes="(min-width: 640px) 200px, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Checks
   The eight values that have to agree before a plan holds, laid out as a
   compact grid in the shape Linear uses for its feature blocks.
------------------------------------------------------------------- */

const checks = [
  { icon: Plane, t: "Departure", d: "Live status, not the schedule you printed." },
  { icon: Car, t: "Drive time", d: "Measured against traffic, not an average." },
  { icon: Sun, t: "Sunset", d: "Daylight is a deadline, not a detail." },
  { icon: KeyRound, t: "Check-in", d: "Arrival moves, the hotel already knows." },
  { icon: UtensilsCrossed, t: "Table hold", d: "How long the reservation waits for you." },
  { icon: Receipt, t: "Fees", d: "Every charge shown before you accept." },
  { icon: FileText, t: "Terms", d: "The rules attached to the change, in full." },
  { icon: Globe, t: "Time zones", d: "One clock across every city on the trip." },
];

function Checks() {
  return (
    <section className="border-y border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The moving parts</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Eight things that have to agree.
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((c, i) => (
            <Reveal key={c.t} delay={(i % 4) * 0.05} className="h-full">
              <div className="flex h-full flex-col gap-3 bg-card p-6">
                <c.icon className="size-5 text-violet" strokeWidth={1.5} aria-hidden />
                <h3 className="text-base font-semibold">{c.t}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Region */

const region = [
  {
    code: "DXB",
    city: "Dubai",
    note: "Home base. Friday-evening traffic is counted in minutes, never assumed.",
  },
  {
    code: "RUH",
    city: "Riyadh",
    note: "Meetings pinned first, with the travel built around them rather than before them.",
  },
  {
    code: "MCT",
    city: "Muscat",
    note: "Cross-border days where the drive is the itinerary, not the gap between it.",
  },
  {
    code: "RAK",
    city: "Ras Al Khaimah",
    note: "Mountain roads and sunset windows that close earlier than the timetable suggests.",
  },
];

function Region() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Where it works</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Built around the region, not a template.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">
            The same plan does not survive everywhere. Glide works against the roads, the light and
            the working week you actually have.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {region.map((r, i) => (
            <Reveal key={r.code} delay={(i % 4) * 0.05} className="h-full">
              <div className="flex h-full flex-col gap-3 bg-card p-6">
                <span className="font-mono text-3xl font-semibold tracking-[0.04em] text-violet">
                  {r.code}
                </span>
                <h3 className="text-base font-semibold">{r.city}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{r.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Asks */

const sampleAsks = [
  {
    q: "We land in Dubai Thursday. Four nights — mountains, good food, no early mornings.",
    a: "Departs 15:00 · Jebel Jais at sunset · table held for 20:00",
  },
  {
    q: "Riyadh Sunday to Wednesday. Meetings are 09:30, 14:00 and 16:30 — keep me near the office.",
    a: "Hotel opposite the office · transfers slotted around each meeting",
  },
  {
    q: "Pick up Mum from DXB, drop the bags, then straight to the restaurant by 19:30.",
    a: "Live departure watch · route re-timed if the flight slips",
  },
  {
    q: "Five nights in Oman. Beaches, one night in the mountains, somewhere for seafood.",
    a: "Coast → Jebel Akhdar → coast, every drive under two hours",
  },
  {
    q: "Table for four somewhere worth crossing town for, and a way back that avoids the bridge.",
    a: "Reservation held · return leg timed to the traffic, not the clock",
  },
  {
    q: "Move the mountain stop to the morning and leave everything else where it is.",
    a: "One stop re-timed · the rest of the day untouched",
  },
];

function Asks() {
  return (
    <section className="border-t border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Say it the way you would say it</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            The request, and what it becomes.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {sampleAsks.map((s, i) => (
            <Reveal key={s.q} delay={(i % 3) * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-ink/15 bg-card p-6">
                <p className="text-[15px] leading-relaxed">“{s.q}”</p>
                <p className="mt-auto border-t border-ink/10 pt-4 font-mono text-[11px] leading-relaxed text-violet">
                  {s.a}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-soft">
          Sample requests for layout. Glide is in private testing and is not connected to any
          messaging or booking provider.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Comparison */

const compareRows: Array<[string, string]> = [
  ["Six tabs and four confirmation emails", "One thread"],
  ["A screenshot of a screenshot of the plan", "One ticket that holds the whole day"],
  ["You find the clash at the airport", "The clash is shown before it happens"],
  ["“Did anyone tell the hotel?”", "The change is the message"],
  ["Every change means starting again", "One approval per change"],
];

function Comparison() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Eyebrow>The difference</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            The same trip, two ways.
          </h2>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-3xl border border-ink/15 sm:grid-cols-2">
          <div className="border-b border-ink/15 bg-paper p-5 sm:border-b-0 sm:border-r">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Without Glide
            </p>
          </div>
          <div className="bg-violet/10 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet">
              With Glide
            </p>
          </div>

          {compareRows.map(([without, withGlide]) => (
            <React.Fragment key={without}>
              <div className="flex gap-3 border-t border-ink/10 bg-paper p-5">
                <X className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
                <span className="text-sm leading-relaxed text-ink-soft">
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] sm:hidden">
                    Without ·{" "}
                  </span>
                  {without}
                </span>
              </div>
              <div className="flex gap-3 border-t border-ink/10 bg-violet/10 p-5">
                <Check className="mt-0.5 size-4 shrink-0 text-violet" aria-hidden />
                <span className="text-sm leading-relaxed">
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-violet sm:hidden">
                    With ·{" "}
                  </span>
                  {withGlide}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Contract */

const contract = [
  "Nothing is booked without an explicit yes.",
  "A trip request is not a standing yes for the next action.",
  "Every change shows its exact option, price, fees and terms first.",
  "One change, one approval — never bundled together.",
  "Declining leaves the plan exactly as it was.",
  "Nothing runs in the background on your behalf.",
];

function Contract() {
  return (
    <section className="border-y border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>The approval contract</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Six rules Glide does not bend.
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contract.map((c, i) => (
            <Reveal key={c} delay={(i % 3) * 0.06} className="h-full">
              <li className="flex h-full flex-col gap-3 rounded-3xl border border-ink/15 bg-card p-6">
                <span className="font-mono text-sm font-semibold text-violet">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-relaxed">{c}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Statement */

function Statement() {
  return (
    <section className="bg-cream px-5 py-24 text-center sm:px-8 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <span className="mx-auto block h-px w-16 bg-violet" aria-hidden />
        <p className="mt-9 text-[clamp(1.9rem,5vw,3.6rem)] leading-[1.08] tracking-[-0.025em]">
          One thread holds the whole day — the flight, the drive, the light and the table.
        </p>
        <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Preview · no reservation held · nothing charged
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Decides */

const decide = [
  {
    t: "What is fixed",
    d: "Arrivals, meetings and check-in deadlines — the things that cannot move without costing you more than time.",
  },
  {
    t: "What is movable",
    d: "Leisure stops, sightseeing and reservations that carry a hold window, which exist to be re-arranged.",
  },
  {
    t: "What it costs to move",
    d: "Fare differences, cancellation charges and hold lapses, priced before anything is proposed to you.",
  },
  {
    t: "What it proposes",
    d: "The smallest change that puts the day back together. Not a new plan — the plan you had, repaired.",
  },
];

function Decides() {
  return (
    <section className="bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>How Glide decides</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            It sorts the day before it touches anything.
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2">
          {decide.map((d, i) => (
            <Reveal key={d.t} delay={(i % 2) * 0.06} className="h-full">
              <li className="flex h-full flex-col gap-3 rounded-3xl border border-ink/15 bg-card p-6">
                <span className="font-mono text-sm font-semibold text-violet">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl leading-snug">{d.t}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{d.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Change in full */

const changeRows: Array<[string, string, string]> = [
  ["Start time", "20:00", "21:15"],
  ["Date", "Fri 13 Nov", "Fri 13 Nov"],
  ["Guests", "2", "2"],
  ["Seating", "Main room", "Terrace, if free"],
];

const priceRows: Array<[string, string]> = [
  ["Change fee", "AED 0"],
  ["Fare difference", "AED 0"],
  ["New deposit", "None"],
  ["Total now", "AED 0"],
];

function ChangeInFull() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Eyebrow>Before anything moves</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            A change, shown in full.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">
            This is the shape of every proposal Glide puts in front of you: what is moving, what it
            costs, and the terms that travel with it. Nothing is applied until you act on it.
          </p>
        </div>

        <Reveal>
          <div className="mt-12 overflow-hidden rounded-3xl border border-ink/15 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 px-6 py-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  Proposed change
                </p>
                <p className="mt-1 text-lg font-semibold">Dinner reservation · Levant &amp; Nar</p>
              </div>
              <span className="rounded-full border border-violet/45 bg-violet/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-violet">
                Awaiting your approval
              </span>
            </div>

            <div className="grid gap-px bg-ink/10 md:grid-cols-2">
              <div className="bg-card p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  What changes
                </p>
                <dl className="mt-5 divide-y divide-ink/10">
                  {changeRows.map(([label, before, after]) => (
                    <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                      <dt className="text-sm">{label}</dt>
                      <dd className="flex items-center gap-2 font-mono text-sm tabular-nums">
                        <s className="text-ink-soft/70">{before}</s>
                        <ArrowRight className="size-3.5 text-violet" aria-hidden />
                        <span className="font-semibold text-violet">{after}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-card p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  What it costs
                </p>
                <dl className="mt-5 divide-y divide-ink/10">
                  {priceRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                      <dt className="text-sm">{label}</dt>
                      <dd className="font-mono text-sm font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-ink/10 pt-5 text-sm leading-relaxed text-ink-soft">
                  Terms: existing cancellation terms hold, the original price is honoured, and no new
                  fee is introduced by this change.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-ink/15 px-6 py-5">
              <span className="glide-cta-solid inline-flex min-h-11 cursor-default items-center rounded-full px-6 py-2.5 text-sm font-semibold">
                Accept this change
              </span>
              <span className="inline-flex min-h-11 cursor-default items-center rounded-full border border-ink/25 px-6 py-2.5 text-sm font-semibold">
                Decline
              </span>
              <p className="text-xs leading-relaxed text-ink-soft">
                Illustrative preview — the buttons are not live and nothing is applied.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Three questions */

const questions = [
  {
    q: "What does this change cost me before I say yes?",
    a: "The total, the fee and any fare difference, in one place, before the change exists.",
  },
  {
    q: "What have you moved that I did not ask you to move?",
    a: "Nothing, unless it is listed. Glide separates what must move from what can hold, and shows you both.",
  },
  {
    q: "What happens to the rest of my trip if I say no?",
    a: "Nothing. Declining leaves the plan exactly as it was, with no partial changes waiting in the wings.",
  },
];

function ThreeQuestions() {
  return (
    <section className="border-y border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Eyebrow>Worth asking</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Three questions to ask any travel agent.
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {questions.map((q, i) => (
            <Reveal key={q.q} delay={i * 0.06}>
              <div className="flex flex-col gap-4 rounded-3xl border border-ink/15 bg-card p-6 sm:flex-row sm:gap-8 sm:p-8">
                <span className="font-mono text-sm font-semibold text-violet sm:pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl leading-snug sm:text-2xl">{q.q}</h3>
                  <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">{q.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          Glide answers all three before anything is booked, moved or charged.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Glossary */

const glossary = [
  { t: "Ripple", d: "The set of times and bookings that move when one thing does." },
  { t: "Hold window", d: "How long a reservation waits for you before it lapses." },
  { t: "Approval", d: "The single action that authorises exactly one change, and nothing else." },
  { t: "Fee", d: "What the change costs, shown before you accept rather than after." },
  { t: "Terms", d: "The rules attached to the change, shown in full rather than summarised." },
  { t: "Preview", d: "The plan as proposed, before anything has been applied to anything." },
];

function Glossary() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Plain words</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            What we mean when we say these.
          </h2>
        </div>

        <dl className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {glossary.map((g, i) => (
            <Reveal key={g.t} delay={(i % 3) * 0.05} className="h-full">
              <div className="flex h-full flex-col gap-2 bg-card p-6">
                <dt className="text-base font-semibold">{g.t}</dt>
                <dd className="text-sm leading-relaxed text-ink-soft">{g.d}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Honesty */

const live = [
  "Itinerary building from a message",
  "Ripple previews before any change",
  "Approval required for each step",
  "Local time, route and fee logic",
  "The full app demo",
];

const notYet = [
  "WhatsApp or any messaging connection",
  "Real flight, hotel or table bookings",
  "Payments and account creation",
  "Travel-provider integrations",
  "Sending anything on your behalf",
];

function Honesty() {
  return (
    <section className="bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Plainly</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            What this is today.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full rounded-3xl border border-mint/50 bg-mint/12 p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                Live in the preview
              </p>
              <ul className="mt-6 space-y-3.5">
                {live.map((l) => (
                  <li key={l} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
                    <span className="leading-relaxed">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <div className="h-full rounded-3xl border border-ink/20 bg-paper p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                Not connected yet
              </p>
              <ul className="mt-6 space-y-3.5">
                {notYet.map((l) => (
                  <li key={l} className="flex items-start gap-3 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
                    <span className="leading-relaxed text-ink-soft">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- FAQ */

const faqs = [
  {
    q: "Does Glide actually book anything?",
    a: "Not yet. This site, the app demo and every conversation on it are previews. Flights, tables, hotels and payments are not connected, and no account is created.",
  },
  {
    q: "What happens when my plans change?",
    a: "You message Glide the same way you asked for the trip. It works out what has to move and what can stay, then shows the before and after — times, prices, fees and terms — before anything happens.",
  },
  {
    q: "Do I have to approve every change?",
    a: "Yes. A trip request or an earlier yes never authorises the next one. Each change is a separate preview that you accept or decline.",
  },
  {
    q: "How does it handle traffic and delays?",
    a: "Drive time is counted against real congestion and departure status is watched live, so a late start reshapes every time scheduled after it rather than just the first one.",
  },
  {
    q: "Which trips is it for?",
    a: "Holidays, business travel and ordinary journeys across town. Anything with more than two stops that has to hold together when the day shifts.",
  },
  {
    q: "When does messaging connect?",
    a: "Later. Public messaging, travel-provider connections and payments go live before launch, and updated terms and privacy information will be published with them.",
  },
];

function Faq() {
  return (
    <section className="border-t border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] tracking-[-0.025em]">
            Before you ask.
          </h2>
          <p className="mt-5 max-w-[38ch] leading-relaxed text-ink-soft">
            Glide is honest about what it is today. The rest is published as it ships.
          </p>
        </div>

        <ul className="divide-y divide-ink/10 border-y border-ink/15">
          {faqs.map((f) => (
            <li key={f.q}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus
                    className="mt-1 size-5 shrink-0 text-violet transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- CTA + Footer
   Three closing actions under one heading, following TravelPerk's
   closing band on Mobbin.
------------------------------------------------------------------- */

const ctaCards = [
  {
    t: "Compare the variants",
    d: "Five takes on the same product, built to be read side by side.",
    href: "/alt-bento",
    cta: "See another take",
    accent: true,
  },
  {
    t: "How we handle data",
    d: "What is collected, what is not, and what changes when launch arrives.",
    href: "/privacy",
    cta: "Read the policy",
    accent: false,
  },
];

function CtaBand() {
  return (
    <section className="bg-cream px-5 py-20 text-ink sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="text-violet">Next step</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.98] tracking-[-0.03em]">
            Take it for a lap.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          {ctaCards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.07} className="h-full">
              <div
                className={`flex h-full flex-col rounded-3xl border p-7 ${
                  c.accent ? "border-violet/60 bg-violet/12" : "border-ink/15 bg-paper"
                }`}
              >
                <h3 className="text-2xl leading-snug">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.d}</p>
                <Link
                  href={c.href}
                  className={`mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold ${
                    c.accent
                      ? "glide-cta-solid"
                      : "border border-ink/25 text-ink hover:bg-ink/5"
                  }`}
                >
                  {c.cta} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <GlideBot size={36} />
          <p className="text-sm text-ink-soft">
            Private testing. No reservation is held and nothing is charged.
          </p>
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
    ["Noir variant", "/alt-noir"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ];
  return (
    <footer className="border-t border-ink/15 bg-paper px-5 py-9 text-ink sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <Link href="/" className="inline-flex items-center gap-2 text-ink">
          <GlideBot size={38} />
          <span className="font-display text-2xl italic">Glide</span>
        </Link>
        <nav aria-label="Variants and legal" className="flex flex-wrap gap-5 text-sm text-ink-soft">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function ShowcaseLanding() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Hero />
      <Coverage />
      <FeatureTrio />
      <Showroom />
      <HowItWorks />
      <DeepDive />
      <Timeline />
      <Checks />
      <Region />
      <Asks />
      <Comparison />
      <Contract />
      <Decides />
      <ChangeInFull />
      <Statement />
      <ThreeQuestions />
      <Glossary />
      <Honesty />
      <Faq />
      <CtaBand />
      <Foot />
    </main>
  );
}
