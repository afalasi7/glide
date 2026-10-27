"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { HeroTicket } from "@/components/story/HeroTicket";
import { ChatThread } from "@/components/story/ChatThread";
import { WordReveal } from "@/components/story/WordReveal";
import { TripTicket } from "@/components/ui/TripTicket";
import { TIMES } from "./data";

const ease = [0.23, 1, 0.32, 1] as const;

function Reveal({ children, className = "", from = 0 }: { children: React.ReactNode; className?: string; from?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`glide-motion-entry ${className}`}
      initial={reduce ? false : { opacity: 0, transform: `translateX(${from}px) translateY(20px)` }}
      whileInView={{ opacity: 1, transform: "translateX(0px) translateY(0px)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero — image-dominant, copy lean. The photograph carries the fold; the words stay out of
 * its way. The trip ticket sits at the bottom-right and crosses the fold boundary, so the
 * diagram reads as part of the photograph rather than as a second column of UI.
 */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-10%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-ink text-paper"
      data-say="I'm Glide. Tell me about your trip and I'll help bring the plan together."
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src="/images/hd/jebel_jais_sunset.jpg"
          alt="The mountain road through Jebel Jais at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Two scrims with jobs: the vertical one seats the type on the photograph,
          the horizontal one keeps the headline legible on wide screens. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(28,18,48,0.94) 0%, rgba(28,18,48,0.5) 42%, rgba(28,18,48,0.12) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(28,18,48,0.72) 0%, rgba(28,18,48,0.18) 46%, rgba(28,18,48,0) 72%)",
        }}
      />

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8 sm:pb-28"
      >
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_460px] lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper/75">
              A little more room to enjoy the trip
            </p>

            {/* DESIGN.md: one emphasised phrase per headline, italic. */}
            <h1 className="mt-6 max-w-[13ch] text-[clamp(3.2rem,10vw,7.6rem)] leading-[0.92] tracking-[-0.025em]">
              Your whole trip,{" "}
              <em className="font-normal italic text-sun">one conversation.</em>
            </h1>

            <p className="mt-7 max-w-[44ch] text-lg font-light leading-relaxed text-paper/85 sm:text-xl">
              A personal travel agent for WhatsApp. It plans the holiday, the work trip
              and the everyday journey — and reshapes the day when plans change.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="#how-it-works"
                className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-7 py-3.5 font-semibold"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="lg:justify-self-end lg:pb-2">
            <HeroTicket />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* JourneyDiagram is superseded by HeroTicket — it was a rounded card holding the same three
   stops. Removed rather than left as dead code. */

const changes = [
  {
    place: "01 / The change",
    title: "The trip starts late.",
    copy: "A 75-minute delay puts the mountain sunset and the dinner reservation at risk.",
    detail: "+75 min from Dubai Marina",
    color: "bg-coral",
    photo: "/images/hd/traffic_road.jpg",
  },
  {
    place: "02 / The new plan",
    title: "The important stop stays.",
    copy: "In the sample trip, Glide moves Jebel Jais to the following morning and finds a workable dinner time.",
    detail: "Jebel Jais · Day 2, 08:30",
    color: "bg-sun",
    photo: "/images/hd/jebel_jais_sunset.jpg",
  },
  {
    place: "03 / Your decision",
    title: "You approve each change.",
    copy: "A real purchase or reservation change would show the exact option, total price, fees, and terms before it happens.",
    detail: "Review before any transaction",
    color: "bg-mint",
    photo: "/images/hd/levant_nar_dining.jpg",
  },
] as const;

/**
 * Per-step progress dot. Pattern from 21st.dev `@abui/scroll-reveal-content-a`: each of the
 * three steps owns a slice of the section's scroll range and lights up as the reader enters it,
 * so the rail reads as a position indicator rather than decoration.
 */
function StepDot({
  progress,
  index,
  total,
  color,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  color: string;
}) {
  const reduce = useReducedMotion();
  const start = index / total;
  const scale = useTransform(progress, [start, start + 0.16], [0.6, 1]);
  const opacity = useTransform(progress, [start, start + 0.16], [0.45, 1]);

  return (
    <motion.span
      aria-hidden
      className={`absolute left-1 top-7 h-6 w-6 rounded-full border-4 border-ink ${color} sm:left-3`}
      style={reduce ? undefined : { scale, opacity }}
    />
  );
}

function TripChange() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="trip-change" ref={ref} className="relative overflow-hidden bg-cream py-20 text-ink sm:py-28" data-say="A delay changes the plan. I show you what needs attention and ask before each booking change.">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          {/* Source: 21st.dev `@motiondotdev/motion-scroll-word-reveal`. The sentence
              brightens word by word as the reader scrolls into the delay story. */}
          <WordReveal className="max-w-[15ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
            When the day changes, the plan can change with it.
          </WordReveal>
          <p className="max-w-[49ch] text-lg leading-relaxed text-ink-soft lg:justify-self-end">Follow one sample trip from Dubai to Ras Al Khaimah. Scroll to see how a late departure affects the stops that follow.</p>
        </div>

        <div className="relative mt-12 sm:mt-16">
          <svg className="absolute bottom-8 left-[15px] top-8 h-[calc(100%-4rem)] w-1 overflow-visible sm:left-[23px]" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden>
            <path d="M1 0 V100" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" fill="none" />
            <motion.path d="M1 0 V100" stroke="var(--sun)" strokeWidth="2" fill="none" style={{ pathLength: reduce ? 1 : pathLength }} />
          </svg>
          <ol className="space-y-5 sm:space-y-7">
            {changes.map((change, index) => (
              <li key={change.place} className="relative pl-11 sm:pl-16">
                <StepDot progress={pathLength} index={index} total={changes.length} color={change.color} />
                <Reveal from={index % 2 === 0 ? -65 : 65}>
                  <div className="glide-ticket grid overflow-hidden rounded-[20px] border border-ink/15 bg-card text-ink shadow-pop sm:grid-cols-[34%_1fr]">
                    <div className="relative flex min-h-40 flex-col justify-between overflow-hidden bg-violet p-5 text-paper sm:min-h-48">
                      <Image src={change.photo} alt="" fill sizes="(min-width: 640px) 340px, 90vw" className="object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/50" aria-hidden />
                      <span className="relative text-xs font-semibold uppercase tracking-[0.14em]">{change.place}</span>
                      <span className="relative font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-tight">{change.detail}</span>
                    </div>
                    <div className="flex flex-col justify-center border-t-2 border-dashed border-ink/20 p-5 sm:border-l-2 sm:border-t-0 sm:p-8">
                      <h3 className="text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02]">{change.title}</h3>
                      <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-ink-soft">{change.copy}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-8 pl-11 text-sm leading-relaxed text-ink-soft sm:pl-16">This is an illustrative itinerary. Glide has no live provider or payment connection yet.</p>
      </div>
    </section>
  );
}

/* WhatsAppPreview — a 1.6MB flat screenshot — is replaced by ChatThread: real markup that
   themes, animates and belongs to this design system instead of copying WhatsApp's. */

function ConnectedPlan() {
  const reduce = useReducedMotion();
  const stops = [
    { name: "Leave Dubai", previous: "Was 15:00", revised: "16:15" },
    { name: "Jebel Jais", previous: "Was Friday sunset", revised: "Sat 08:30" },
    { name: "Dinner", previous: "Was 20:00", revised: TIMES.dinner },
  ];

  return (
    <figure className="w-full border-y-2 border-ink/70 py-2" aria-label="How a 75 minute delay changes the itinerary">
      <figcaption className="flex items-baseline justify-between gap-3 py-4">
        <span className="font-display text-[clamp(1.65rem,4vw,2.3rem)] leading-tight">One delay. Three new times.</span>
        <motion.span
          initial={reduce ? false : { opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease }}
          className="num shrink-0 text-lg text-coral"
        >
          +75 min
        </motion.span>
      </figcaption>
      <div className="flex justify-between border-t border-ink/20 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        <span>Original plan</span><span>After the delay</span>
      </div>
      {stops.map((stop, i) => (
        /* The rows resolve in reading order as the reader scrolls — the ripple, one stop
           at a time, rather than a table that appears all at once. */
        <motion.div
          key={stop.name}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease, delay: i * 0.12 }}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-ink/20 py-4"
        >
          <div className="min-w-0"><p className="font-semibold">{stop.name}</p><p className="mt-0.5 text-sm text-ink-soft">{stop.previous}</p></div>
          <p className="num whitespace-nowrap text-[clamp(1.45rem,5vw,2rem)] leading-none">{stop.revised}</p>
        </motion.div>
      ))}
      <p className="border-t border-ink/20 py-3 text-sm leading-relaxed text-ink-soft">Glide shows the ripple effect in one place. Booking changes still need your approval.</p>
    </figure>
  );
}

function ApprovalPreview() {
  return (
    <TripTicket
      kind="Dinner reservation"
      place="Levant & Nar"
      time={TIMES.dinner}
      date="Fri 13 Nov"
      image="/images/hd/levant_nar_dining.jpg"
      fields={[{ label: "Current time", value: "20:00" }, { label: "Guests", value: "2" }, { label: "Change fee", value: "AED 0" }]}
      status="Preview · no change made"
      className="w-full"
    />
  );
}

function WalletPreview() {
  return (
    <TripTicket
      kind="Hotel stay"
      place="InterContinental Ras Al Khaimah"
      time={TIMES.hotel}
      date="Fri 13 Nov"
      image="/images/hd/ic_rak_resort.jpg"
      fields={[{ label: "Guests", value: "2 adults" }, { label: "Trip", value: "Ras Al Khaimah" }]}
      status="Trip preview"
      className="w-full max-w-[430px] justify-self-center"
    />
  );
}

export function LandingStory() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Hero />

      <section id="how-it-works" className="scroll-mt-20 overflow-x-clip border-y border-ink/10 bg-paper/65 px-5 py-20 sm:px-8 sm:py-28" data-say="Plan in a conversation, see a connected itinerary, and approve each purchase or change.">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2.5rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.025em]">From message to itinerary.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">Tell Glide where you are going. See the plan come together, and review each booking decision before it happens.</p>
          </div>
          <ol className="mt-11 divide-y divide-ink/10 border-y border-ink/10">
            <li className="grid gap-7 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center lg:gap-16">
              <div><span className="num text-2xl text-violet">01</span><h3 className="mt-3 text-3xl sm:text-4xl">Tell Glide about your trip.</h3><p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-ink-soft">Start in WhatsApp with a destination or an idea. Glide asks for dates, travelers, budget, and the details it needs, whether the trip is a holiday, a business visit, or a short journey.</p></div>
              <Reveal from={55} className="w-full"><ChatThread /></Reveal>
            </li>
            <li className="grid gap-7 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center lg:gap-16">
              <div><span className="num text-2xl text-violet">02</span><h3 className="mt-3 text-3xl sm:text-4xl">See how the details fit.</h3><p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-ink-soft">Routes, stays, meals, and time-sensitive plans form one itinerary. If a delay affects the next stop, Glide can show the knock-on effect instead of leaving you to compare separate confirmations.</p></div>
              <Reveal from={55} className="max-w-[430px]"><ConnectedPlan /></Reveal>
            </li>
            <li className="grid gap-7 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center lg:gap-16">
              <div><span className="num text-2xl text-violet">03</span><h3 className="mt-3 text-3xl sm:text-4xl">Choose before anything changes.</h3><p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-ink-soft">Glide can propose a new booking or a change. Every purchase and reservation change needs your approval of the exact option, total price, fees, and terms before an action is taken.</p></div>
              <Reveal from={55} className="max-w-[430px]"><ApprovalPreview /></Reveal>
            </li>
          </ol>
        </div>
      </section>

      <section className="px-5 py-18 sm:px-8 sm:py-24" aria-labelledby="trip-types-title">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 id="trip-types-title" className="max-w-[15ch] text-[clamp(2.3rem,5vw,4rem)] leading-[1.02] tracking-[-0.025em]">Room for every kind of trip.</h2>
            <p className="max-w-[55ch] self-end text-lg leading-relaxed text-ink-soft">One conversation can bring together the places, reservations, and timing that matter, whether you are away for weeks or crossing town.</p>
          </div>
          {/* Asymmetric on purpose. Three equal columns at 357×96 each was slop tell #3 —
              equal weight, nothing prioritised. The holiday carries the arch-window
              photograph and the scale; the other two are quiet rows. */}
          <div className="mt-12 grid gap-10 border-t border-ink/15 pt-10 lg:grid-cols-[1.12fr_1fr] lg:gap-16">
            <div className="flex gap-6 sm:gap-8">
              <div className="arch-window relative w-[128px] shrink-0 overflow-hidden sm:w-[172px]">
                <Image
                  src="/images/hd/ic_rak_resort.jpg"
                  alt=""
                  fill
                  sizes="172px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-[clamp(1.9rem,3.6vw,2.7rem)] leading-[1.05]">Holidays</h3>
                <p className="mt-3 max-w-[32ch] text-base leading-relaxed text-ink-soft">
                  Flights, stays, activities, meals, and the space between them.
                </p>
              </div>
            </div>

            <dl className="grid content-start">
              <div className="grid gap-1 border-b border-ink/15 pb-6">
                <dt className="text-xl">Business travel</dt>
                <dd className="max-w-[46ch] leading-relaxed text-ink-soft">
                  Arrivals, hotel check-in, transfers, and meeting windows that cannot slip.
                </dd>
              </div>
              <div className="grid gap-1 pt-6">
                <dt className="text-xl">Everyday journeys</dt>
                <dd className="max-w-[46ch] leading-relaxed text-ink-soft">
                  Short trips, important stops, and changes to the route as the day unfolds.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <TripChange />

      <section className="overflow-x-clip px-5 py-20 sm:px-8 sm:py-28" data-say="I keep your route, hotel and reservations close at hand.">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          <div>
            <h2 className="max-w-[15ch] text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.025em]">Built around the way you actually travel.</h2>
            <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-soft">A useful trip plan travels with you. Keep your route, hotel, and reservations close, with a clear view of what changed and what still needs your approval.</p>
            <p className="mt-8 border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-soft">Product preview. Live WhatsApp, travel-provider, and wallet connections are not active yet.</p>
          </div>
          <WalletPreview />
        </div>
      </section>

      <footer className="border-t border-ink/15 bg-paper px-5 py-9 text-ink sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
          <Link href="/" className="inline-flex items-center gap-2 text-ink"><GlideBot size={40} /><span className="font-display text-2xl italic">Glide</span></Link>
          <nav aria-label="Legal" className="flex flex-wrap gap-5 text-sm text-ink-soft"><Link href="/privacy" className="hover:text-ink">Privacy policy</Link><Link href="/terms" className="hover:text-ink">Terms and conditions</Link></nav>
        </div>
      </footer>
    </main>
  );
}
