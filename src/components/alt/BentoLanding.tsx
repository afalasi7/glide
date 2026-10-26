"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Eye,
  ArrowRight,
  Plus,
} from "lucide-react";
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
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
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

/* ---------------------------------------------------------------- Hero */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-cream px-5 pb-16 pt-28 sm:px-8 sm:pt-36">
      <div
        className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-violet/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-sun/25 blur-3xl"
        aria-hidden
      />
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Glide · private beta</Eyebrow>
          <h1 className="mt-5 max-w-[14ch] text-[clamp(2.8rem,10vw,5rem)] leading-[0.94] tracking-[-0.03em]">
            Ask once. <span className="italic">Get the whole trip.</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            Glide turns a message into a route, a set of times, and the reservations between them —
            then shows you exactly what a change costs before it happens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#what"
              className="glide-cta-solid inline-flex min-h-11 items-center gap-2 rounded-full px-7 py-3 font-semibold"
            >
              See what it does <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-7 py-3 font-semibold"
            >
              Open the demo app
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Illustrative preview. No live booking, payment, or WhatsApp connection.
          </p>
        </div>

        <Reveal delay={0.1} className="mx-auto w-full max-w-[430px]">
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
          />
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink/15 bg-paper px-4 py-3">
            <GlideBot size={34} />
            <p className="min-w-0 flex-1 text-sm leading-snug text-ink-soft">
              “Dinner holds at <span className="num text-ink">{TIMES.dinner}</span>. Want me to apply
              the rest?”
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Bento
   Section shape adapted from the 21st.dev component "Bento Feature Grid"
   (ln-dev7 / bento-01), recoloured to Glide's tokens.
------------------------------------------------------------------- */

const tiles = [
  {
    icon: MessageSquare,
    label: "One conversation",
    body: "Flights, stays, tables and timing live in a single thread instead of six confirmations.",
    accent: "bg-violet/10 text-violet",
    wide: true,
  },
  {
    icon: GitBranch,
    label: "A connected plan",
    body: "Move one stop and every time downstream is re-checked automatically.",
    accent: "bg-sun/25 text-ink",
    wide: false,
  },
  {
    icon: Eye,
    label: "The ripple, first",
    body: "Before-and-after times, fees and terms shown before anything is applied.",
    accent: "bg-coral/15 text-coral",
    wide: false,
  },
  {
    icon: ShieldCheck,
    label: "Approval first",
    body: "Nothing is booked, moved or paid until you say yes to that exact change.",
    accent: "bg-mint/25 text-ink",
    wide: true,
  },
];

function Bento() {
  return (
    <section id="what" className="scroll-mt-24 border-b border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <Eyebrow>What Glide does</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] tracking-[-0.025em]">
            Four jobs, one thread.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tiles.map(({ icon: Icon, label, body, accent, wide }, i) => (
            <Reveal key={label} delay={i * 0.06} className={wide ? "sm:col-span-2" : undefined}>
              <div
                className={`group flex h-full flex-col gap-5 rounded-2xl border border-ink/15 bg-card p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${
                  wide ? "sm:flex-row sm:items-center sm:gap-8" : ""
                }`}
              >
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-xl border border-ink/10 ${accent}`}
                >
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </div>
                <div className={wide ? "sm:flex-1" : undefined}>
                  <h3 className="text-base font-semibold">{label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
                {wide && (
                  <p className="shrink-0 border-t border-ink/10 pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                    {i === 0 ? "message → itinerary" : "preview → approve → done"}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Ask cards
   Interaction pattern adapted from the 21st.dev component
   "Testimonial Section" (uvain): a scrollable row where one card opens
   in place and the track fades at whichever edge still hides cards.
   Content is trip requests rather than testimonials, so nothing reads
   as an endorsement we cannot back.
------------------------------------------------------------------- */

type Ask = {
  id: string;
  code: string;
  title: string;
  meta: string;
  quote: string;
  result: string;
  tone: string;
  ink: string;
};

const asks: Ask[] = [
  {
    id: "rak",
    code: "RAK",
    title: "A long weekend in RAK",
    meta: "Landing Thursday",
    quote:
      "We land in Dubai Thursday. Four nights — mountains, good food, no early mornings.",
    result: "Departs 15:00 · Jebel Jais at sunset · table held for 20:00",
    tone: "#FFE9BF",
    ink: "#1C1230",
  },
  {
    id: "riyadh",
    code: "RUH",
    title: "A client week in Riyadh",
    meta: "3 meetings, 1 hotel",
    quote:
      "Riyadh Sunday to Wednesday. Meetings are 09:30, 14:00 and 16:30 — keep me near the office.",
    result: "Hotel opposite the office · transfers slotted around each meeting",
    tone: "#E7E0FF",
    ink: "#1C1230",
  },
  {
    id: "airport",
    code: "DXB",
    title: "An airport run, two stops",
    meta: "Traffic-dependent",
    quote:
      "Pick up Mum from DXB, drop bags, then straight to the restaurant by 19:30.",
    result: "Live departure watch · route re-timed if the flight slips",
    tone: "#C4F5E1",
    ink: "#1C1230",
  },
  {
    id: "oman",
    code: "MCT",
    title: "A holiday in Oman",
    meta: "Five nights",
    quote:
      "Five nights in Oman. Beaches, one night in the mountains, and somewhere to eat seafood.",
    result: "Coast → Jebel Akhdar → coast, with every drive under two hours",
    tone: "#DCEBFF",
    ink: "#1C1230",
  },
  {
    id: "dinner",
    code: "DXB",
    title: "Dinner across town",
    meta: "One evening",
    quote:
      "Table for four somewhere worth crossing town for, and a way back that avoids the bridge.",
    result: "Reservation held · return leg timed to the traffic, not the clock",
    tone: "#FFE0D6",
    ink: "#1C1230",
  },
];

const FADE = "8%";

function AskRow() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const reduce = useReducedMotion();

  const syncEdges = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    syncEdges();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncEdges]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-ask-card]") as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  const mask =
    atStart && atEnd
      ? undefined
      : `linear-gradient(to right, transparent 0%, #000 ${atStart ? "0%" : FADE}, #000 ${
          atEnd ? "100%" : `calc(100% - ${FADE})`
        }, transparent 100%)`;

  return (
    <section className="border-b border-ink/10 bg-cream px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-xl">
          <Eyebrow>What you can ask</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] tracking-[-0.025em]">
            Say it the way you would say it.
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Tap a card to see the request and what Glide turns it into.
          </p>
        </div>

        <div
          ref={trackRef}
          onScroll={syncEdges}
          role="group"
          aria-label="Example trip requests"
          tabIndex={0}
          style={
            mask
              ? ({ maskImage: mask, WebkitMaskImage: mask } as React.CSSProperties)
              : undefined
          }
          className="flex items-start gap-3 overflow-x-auto pb-2 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 [&::-webkit-scrollbar]:hidden"
        >
          {asks.map((a) => {
            const open = openId === a.id;
            return (
              <article
                key={a.id}
                data-ask-card
                style={{ backgroundColor: a.tone, color: a.ink }}
                className="w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl p-4 sm:w-[330px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-xl bg-paper/70 font-mono text-sm font-semibold tracking-[0.08em]">
                    {a.code}
                  </span>
                  <span className="rounded-full bg-paper/70 px-2.5 py-1 text-[11px] font-semibold">
                    {a.meta}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{a.title}</p>
                    <p className="mt-1 truncate text-xs opacity-70">Tap to read the request</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setOpenId((cur) => (cur === a.id ? null : a.id))}
                    aria-expanded={open}
                    aria-label={open ? `Hide the ${a.title} example` : `Read the ${a.title} example`}
                    initial={false}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
                  >
                    <motion.span
                      className="grid place-items-center"
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    >
                      <Plus className="size-4" aria-hidden />
                    </motion.span>
                  </motion.button>
                </div>

                <AnimateHeight open={open} quote={a.quote} result={a.result} />
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="max-w-[52ch] text-xs leading-relaxed text-ink-soft">
            Sample requests for layout. Glide is in private testing and is not connected to WhatsApp
            or any booking provider.
          </p>
          <div className="flex gap-2">
            <StepButton onClick={() => scrollBy(-1)} disabled={atStart} label="Previous examples">
              <ArrowRight className="size-4 rotate-180" aria-hidden />
            </StepButton>
            <StepButton onClick={() => scrollBy(1)} disabled={atEnd} label="Next examples">
              <ArrowRight className="size-4" aria-hidden />
            </StepButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimateHeight({ open, quote, result }: { open: boolean; quote: string; result: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={
        reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32, mass: 0.8 }
      }
      className="overflow-hidden"
      aria-hidden={!open}
    >
      <div className="pt-5">
        <p className="text-[15px] font-medium leading-[1.4]">“{quote}”</p>
        <p className="mt-3 border-t border-ink/15 pt-3 font-mono text-[11px] leading-relaxed">
          {result}
        </p>
      </div>
    </motion.div>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-9 place-items-center rounded-xl border border-ink/15 bg-paper text-ink-soft transition-colors enabled:hover:text-ink disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40"
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- FAQ */

const faqs = [
  {
    q: "Does Glide actually book anything?",
    a: "Not yet. This site, the app demo, and every conversation on it are previews. Flights, tables, hotels and payments are not connected, and no account is created.",
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
    q: "Which trips is it for?",
    a: "Holidays, business travel, and ordinary journeys across town. Anything with more than two stops that has to hold together when the day shifts.",
  },
  {
    q: "When does WhatsApp connect?",
    a: "Later. Public messaging, travel-provider connections and payments go live before launch, and updated terms and privacy information will be published with them.",
  },
];

function Faq() {
  return (
    <section className="border-b border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] leading-[1] tracking-[-0.025em]">
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

/* ------------------------------------------------------------- CTA/Footer */

function Cta() {
  return (
    <section className="bg-cream px-5 py-20 text-ink sm:px-8 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow tone="text-violet">Private testing</Eyebrow>
          <h2 className="mt-4 max-w-[15ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.025em]">
            Try it on a trip of your own.
          </h2>
          <p className="mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
            WhatsApp, booking and payment connections are not live yet. Everything above is a
            preview of how the agent will behave.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/app"
            className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold"
          >
            Open the demo app
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-7 py-3 font-semibold"
          >
            How we handle data
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
    ["Noir variant", "/alt-noir"],
    ["Showcase variant", "/alt-showcase"],
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

export function BentoLanding() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Hero />
      <Bento />
      <AskRow />
      <Faq />
      <Cta />
      <Foot />
    </main>
  );
}
