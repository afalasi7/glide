"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { TripTicket } from "@/components/ui/TripTicket";
import { TIMES } from "@/components/story/data";

const ease = [0.23, 1, 0.32, 1] as const;

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-cream text-ink">
      <Image
        src="/images/hd/jebel_jais_sunset.jpg"
        alt="The road through the Jebel Jais mountains at sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="glide-scrim absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex min-h-[86svh] max-w-6xl flex-col justify-between px-5 pb-14 pt-32 sm:px-8 sm:pb-20 sm:pt-40">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-4 text-xs font-medium uppercase tracking-[0.24em] text-ink-soft">
          <span>Glide</span>
          <span className="hidden sm:inline">Issue 01 · The trip that bends</span>
          <span>Dubai → Ras Al Khaimah</span>
        </div>

        <div className="py-14">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">A 75-minute delay, handled</p>
          <h1 className="mt-5 max-w-[15ch] text-[clamp(3rem,10vw,7.5rem)] leading-[0.9] tracking-[-0.035em]">
            A late flight is not a lost day. <span className="italic">It is a re-plan.</span>
          </h1>
        </div>

        <div className="grid gap-8 border-t border-ink/15 pt-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <p className="max-w-[52ch] text-lg leading-relaxed text-ink-soft">
            Three reservations move at once when a departure slips out of Dubai Marina. This is how a travel agent that lives in your messages keeps the sunset, the table, and the hotel in step — and waits for your yes.
          </p>
          <div className="flex flex-wrap gap-3 md:justify-self-end">
            <Link href="#delay" className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold">
              Read the re-plan
            </Link>
            <Link href="/alt-conversation" className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-7 py-3 font-semibold">
              Chat version
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Standfirst() {
  const facts = [
    { n: "75", label: "minutes late out of the marina" },
    { n: "3", label: "stops that had to move" },
    { n: "0", label: "changes made without approval" },
  ];
  return (
    <section className="bg-paper px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="max-w-[62ch] text-[clamp(1.35rem,2.6vw,2rem)] font-light leading-[1.45] text-ink">
            The old version of travel is a folder of separate confirmations. When one of them moves, you are the one who notices, and you are the one who fixes the rest.
            <span className="font-display italic"> Glide’s version is a single clock.</span>
          </p>
        </Reveal>
        <div className="mt-12 grid border-t border-ink/20 sm:grid-cols-3">
          {facts.map((f, i) => (
            <div key={f.label} className={`py-6 sm:py-7 ${i > 0 ? "border-t border-ink/15 sm:border-l sm:border-t-0 sm:pl-7" : ""}`}>
              <p className="num text-[clamp(2.6rem,7vw,4rem)] leading-none text-violet">{f.n}</p>
              <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-ink-soft">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchFeature() {
  return (
    <section className="bg-cream px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal>
          <div className="relative mx-auto h-[420px] w-full max-w-[380px] overflow-hidden rounded-t-[190px] rounded-b-[10px] border border-ink/15 shadow-pop sm:h-[540px] sm:max-w-[440px] sm:rounded-t-[220px]">
            <Image
              src="/images/hd/levant_nar_dining.jpg"
              alt="A set table at Levant and Nar in Ras Al Khaimah"
              fill
              sizes="(min-width: 1024px) 440px, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">The stop that matters</p>
          <h2 className="mt-4 text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] tracking-[-0.025em]">
            The sunset moved. <span className="italic">Dinner was rebooked.</span>
          </h2>
          <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-ink-soft">
            Not every stop can hold. Glide separates what has to move from what can wait, so a delay costs you a morning instead of the whole evening — and your table is moved to{" "}
            <span className="num text-ink">{TIMES.dinner}</span> with no fee.
          </p>
          <ul className="mt-8 space-y-4 border-t border-ink/15 pt-6">
            {[
              ["Jebel Jais", "moved to Sat 08:30, sunset intact"],
              ["Levant & Nar", `rebooked to ${TIMES.dinner}, no fee`],
              ["Hotel arrival", "flagged, key still ready"],
            ].map(([k, v]) => (
              <li key={k} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-semibold">{k}</span>
                <span className="text-ink-soft">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const stops = [
  { time: "15:00", was: "Was 15:00", now: "16:15", name: "Depart Dubai Marina", note: "The delay lands here first.", color: "bg-coral" },
  { time: "08:30", was: "Was Fri sunset", now: "Sat 08:30", name: "Jebel Jais", note: "Next morning, same view.", color: "bg-sun" },
  { time: TIMES.dinner, was: "Was 20:00", now: TIMES.dinner, name: "Dinner in RAK", note: "Rebooked, no change fee.", color: "bg-mint" },
];

function DelayTimeline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 82%", "end 60%"] });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="delay" ref={ref} className="scroll-mt-24 border-y border-ink/15 bg-paper px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-coral">The re-plan</p>
            <h2 className="mt-4 max-w-[13ch] text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] tracking-[-0.025em]">
              One delay. Three new times.
            </h2>
          </div>
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft lg:justify-self-end">
            Scroll the line. Each stop keeps its place in the trip — only the clock around it changes.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[13px] h-0.5 overflow-hidden bg-ink/15" aria-hidden>
            <motion.div className="h-full origin-left bg-violet" style={{ scaleX: reduce ? 1 : progress }} />
          </div>
          <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            {stops.map((s) => (
              <li key={s.name} className="pl-8 sm:pl-0">
                <span className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-paper ${s.color} sm:relative sm:left-auto sm:block`} aria-hidden />
                <div className="mt-4 sm:mt-6">
                  <p className="num text-[clamp(1.9rem,4vw,2.6rem)] leading-none">{s.now}</p>
                  <p className="mt-2 text-base font-semibold">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-soft line-through decoration-coral/70">{s.was}</p>
                  <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-ink-soft">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-12 border-t border-ink/15 pt-5 text-sm leading-relaxed text-ink-soft">
          Illustrative itinerary. Glide has no live provider or payment connection yet.
        </p>
      </div>
    </section>
  );
}

function Approval() {
  return (
    <section className="bg-cream px-5 py-20 text-ink sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">The last word is yours</p>
          <h2 className="mt-4 max-w-[14ch] text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] tracking-[-0.025em]">
            Nothing changes until you approve it.
          </h2>
          <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-ink-soft">
            Every proposed purchase or reservation change shows the exact option, the total price, the fees, and the terms first. A trip request or an earlier yes never authorises the next one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app" className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold">
              Open the demo app
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-7 py-3 font-semibold">
              Read the conditions
            </Link>
          </div>
        </div>
        <Reveal>
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
            className="mx-auto w-full max-w-[430px]"
          />
        </Reveal>
      </div>
    </section>
  );
}

function Stay() {
  return (
    <section className="bg-cream px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Where it is today</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] tracking-[-0.025em]">A preview, honestly labelled.</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          <p>
            Glide is in private testing. This site, the app demo, and the conversation above are illustrative: no account is created, no reservation is held, and nothing is charged.
          </p>
          <p>
            Public WhatsApp messaging, travel-provider connections, and payments are not active yet. We will publish updated terms and privacy information before they are.
          </p>
          <p className="border-t border-ink/15 pt-5 text-base">
            <Link href="/privacy" className="font-semibold text-violet underline underline-offset-4">
              Privacy policy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="font-semibold text-violet underline underline-offset-4">
              Terms and conditions
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="border-t border-ink/15 bg-paper px-5 py-9 text-ink sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <Link href="/" className="inline-flex items-center gap-2 text-ink">
          <GlideBot size={38} />
          <span className="font-display text-2xl italic">Glide</span>
        </Link>
        <nav aria-label="Variants and legal" className="flex flex-wrap gap-5 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">Current landing</Link>
          <Link href="/alt-conversation" className="hover:text-ink">Chat variant</Link>
          <Link href="/alt-bento" className="hover:text-ink">Bento variant</Link>
          <Link href="/alt-noir" className="hover:text-ink">Noir variant</Link>
          <Link href="/alt-showcase" className="hover:text-ink">Showcase variant</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export function EditorialLanding() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Hero />
      <Standfirst />
      <ArchFeature />
      <DelayTimeline />
      <Approval />
      <Stay />
      <Foot />
    </main>
  );
}
