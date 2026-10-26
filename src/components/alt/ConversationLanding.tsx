"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { TripTicket } from "@/components/ui/TripTicket";
import { TIMES } from "@/components/story/data";

const ease = [0.23, 1, 0.32, 1] as const;

type Msg = { from: "user" | "agent"; text: string };

const opener: Msg[] = [
  { from: "user", text: "We land in Dubai Thursday. Four nights — mountains and good food." },
  { from: "agent", text: "Here is the shape of it: leave Dubai at 15:00, sunset at Jebel Jais, dinner in Ras Al Khaimah at 20:00." },
  { from: "user", text: "Our incoming flight is now running 75 minutes late." },
  {
    from: "agent",
    text: `Then the day moves with it. Jebel Jais shifts to tomorrow at 08:30 and your table holds at ${TIMES.dinner}, no fee. Apply it?`,
  },
];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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

function Bubble({ m }: { m: Msg }) {
  const user = m.from === "user";
  return (
    <li className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[87%] rounded-2xl px-4 py-3 text-[15px] leading-snug ${
          user ? "rounded-br-md bg-violet text-paper" : "rounded-bl-md bg-card text-ink"
        }`}
      >
        {m.text}
      </p>
    </li>
  );
}

function TypingDots() {
  return (
    <li className="flex justify-start" aria-label="Glide is typing">
      <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-card px-4 py-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:0ms] [animation-duration:900ms]"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </span>
    </li>
  );
}

function ChatPanel() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  // Reduced motion skips the sequence by widening what is visible, so no state write is needed.
  const visible = reduce ? opener.length : shown;
  const typing = visible < opener.length;
  const done = !typing;

  useEffect(() => {
    if (reduce || shown >= opener.length) return;
    const wait = shown === 0 ? 500 : 1250;
    const timer = window.setTimeout(() => setShown((n) => n + 1), wait);
    return () => window.clearTimeout(timer);
  }, [shown, reduce]);

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="glide-ticket overflow-hidden rounded-[26px] border border-ink/15 bg-paper shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink/10 px-4 py-3">
          <GlideBot size={38} mood={typing ? "working" : "idle"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Glide</p>
            <p className="truncate text-xs text-ink-soft">{typing ? "typing…" : "Travel agent · guided demo"}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
            Sample trip
          </span>
        </header>

        <ol className="flex min-h-[300px] flex-col gap-3 px-4 py-5 sm:min-h-[340px]">
          <AnimatePresence initial={false}>
            {opener.slice(0, visible).map((m, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.38, ease }}
              >
                <Bubble m={m} />
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && <TypingDots />}
          {done && !reduce && (
            <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }} className="pt-1">
              <Link
                href="#thread"
                className="inline-flex min-h-9 items-center rounded-full bg-violet px-4 py-2 text-sm font-semibold text-paper"
              >
                See the full thread →
              </Link>
            </motion.li>
          )}
        </ol>

        <div className="flex items-center gap-3 border-t border-ink/10 px-4 py-3">
          <span className="flex-1 rounded-full border border-ink/15 px-4 py-2.5 text-sm text-ink-soft">Message Glide</span>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet text-lg font-semibold text-paper" aria-hidden>
            ↑
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">Illustrative conversation. Nothing is booked or sent.</p>
    </div>
  );
}

const ripple = [
  { name: "Leave Dubai", was: "15:00", now: "16:15" },
  { name: "Jebel Jais", was: "Fri sunset", now: "Sat 08:30" },
  { name: "Dinner", was: "20:00", now: TIMES.dinner },
];

function RippleCard() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-ink/15 bg-paper">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">One delay, three ripples</span>
        <span className="num text-lg text-coral">+75 min</span>
      </div>
      <ul>
        {ripple.map((r) => (
          <li key={r.name} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-ink/10 px-5 py-4 last:border-b-0">
            <div className="min-w-0">
              <p className="font-semibold">{r.name}</p>
              <p className="mt-0.5 text-sm text-ink-soft line-through decoration-coral/70">Was {r.was}</p>
            </div>
            <p className="num text-2xl">{r.now}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Thread() {
  const steps = [
    {
      n: "01",
      head: "You say it once.",
      body: "A destination and a few constraints are enough to start. Glide asks for the rest instead of making you fill in a form.",
      art: (
        <div className="rounded-[20px] border border-ink/15 bg-paper p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">First reply</p>
          <p className="mt-3 text-lg leading-snug">
            “Depart Dubai <span className="num text-violet">15:00</span> · Jebel Jais at sunset · dinner in RAK at{" "}
            <span className="num text-violet">{TIMES.dinner}</span>.”
          </p>
          <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink-soft">Three stops, one connected clock.</p>
        </div>
      ),
    },
    {
      n: "02",
      head: "The ripple arrives as a diff.",
      body: "When the day shifts, you see what moved and what held — not a re-read of the whole itinerary.",
      art: <RippleCard />,
    },
    {
      n: "03",
      head: "You approve, then it happens.",
      body: "A proposed change shows the exact option, price, fees, and terms before any action is taken.",
      art: (
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
      ),
    },
  ];

  return (
    <section id="thread" className="scroll-mt-24 border-y border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="num text-2xl text-violet">01</p>
          <h2 className="mt-3 text-[clamp(2.3rem,5vw,3.9rem)] leading-[1] tracking-[-0.025em]">The message becomes the plan.</h2>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-ink-soft">
            Every answer arrives as something you can read at a glance: a ticket, a before-and-after, a price. Never a wall of chat text.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-ink-soft">
            {["No form, no dashboard to learn", "Times stay connected across every stop", "Nothing is applied until you say so"].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mint" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <ol className="space-y-9">
          {steps.map((s) => (
            <li key={s.n}>
              <Reveal>
                <div className="flex items-baseline gap-4">
                  <span className="num text-xl text-violet">{s.n}</span>
                  <div>
                    <h3 className="text-2xl sm:text-3xl">{s.head}</h3>
                    <p className="mt-2 max-w-[52ch] leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="mt-5 max-w-[430px]">
                {s.art}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Proof() {
  const stats = [
    { n: "+75", label: "minutes absorbed without losing the sunset" },
    { n: "3", label: "stops re-timed inside one reply" },
    { n: "0", label: "changes applied without your approval" },
  ];
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[24px] border border-ink/15 bg-cream sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-6 py-8 sm:px-7 ${i > 0 ? "border-t border-ink/10 sm:border-t-0 sm:border-l" : ""}`}>
            <p className="num text-[clamp(2.6rem,6vw,3.6rem)] leading-none text-violet">{s.n}</p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TripTypes() {
  const chips = ["Holiday in Oman, 5 nights", "Client week in Riyadh", "Airport run with two stops"];
  const types = [
    { t: "Holidays", d: "Flights, stays, activities, meals, and the space between them." },
    { t: "Business travel", d: "Arrivals, hotel check-in, transfers, and meeting windows that cannot slip." },
    { t: "Everyday journeys", d: "Short trips, important stops, and changes to the route as the day unfolds." },
  ];
  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-3">
          {chips.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-4 py-2.5 text-sm">
              <GlideBot size={20} />
              {c}
            </span>
          ))}
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <h2 className="max-w-[15ch] text-[clamp(2.3rem,5vw,4rem)] leading-[1.02] tracking-[-0.025em]">Ask for it the way you would say it.</h2>
          <p className="max-w-[55ch] self-end text-lg leading-relaxed text-ink-soft">
            One conversation can bring together the places, reservations, and timing that matter, whether you are away for weeks or crossing town.
          </p>
        </div>
        <div className="mt-10 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-3 md:gap-10">
          {types.map((x) => (
            <div key={x.t}>
              <h3 className="text-2xl">{x.t}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="bg-paper px-5 py-20 text-ink sm:px-8 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Private testing</p>
          <h2 className="mt-4 max-w-[15ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.025em]">
            Try the agent on a trip of your own.
          </h2>
          <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-soft">
            Glide is illustrative today: the site, the app demo, and the conversation above are previews. WhatsApp, booking, and payment connections are not live.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/app" className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold">
            Open the demo app
          </Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-7 py-3 font-semibold">
            How we handle data
          </Link>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="border-t border-ink/15 bg-cream px-5 py-9 text-ink sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <Link href="/" className="inline-flex items-center gap-2 text-ink">
          <GlideBot size={38} />
          <span className="font-display text-2xl italic">Glide</span>
        </Link>
        <nav aria-label="Variants and legal" className="flex flex-wrap gap-5 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">Current landing</Link>
          <Link href="/alt-editorial" className="hover:text-ink">Editorial variant</Link>
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

export function ConversationLanding() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pt-36">
        <div className="landing-orb pointer-events-none absolute -left-40 top-6 -z-10 h-96 w-96 rounded-full bg-violet/15 blur-3xl" aria-hidden />
        <div className="landing-orb pointer-events-none absolute -right-32 top-64 -z-10 h-80 w-80 rounded-full bg-sun/25 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Glide · travel agent for WhatsApp</p>
            <h1 className="mt-5 max-w-[13ch] text-[clamp(2.7rem,11vw,5.2rem)] leading-[0.94] tracking-[-0.03em]">
              Your whole trip, <span className="italic">one conversation</span>.
            </h1>
            <p className="mt-6 max-w-[47ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
              Ask for the trip in a message. Glide shapes the route, the times, and the reservations into one plan — and when the day changes, it shows you the ripple before anything is applied.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#thread" className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3 font-semibold">
                Watch it work
              </Link>
              <Link href="/alt-editorial" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-7 py-3 font-semibold">
                Editorial version
              </Link>
            </div>
            <p className="mt-6 text-sm text-ink-soft">Illustrative preview. No live booking, payment, or WhatsApp connection.</p>
          </div>
          <ChatPanel />
        </div>
      </section>

      <Thread />
      <Proof />
      <TripTypes />
      <CtaBand />
      <Foot />
    </main>
  );
}
