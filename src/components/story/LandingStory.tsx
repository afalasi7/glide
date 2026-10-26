"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
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

function JourneyDiagram() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-paper p-4 shadow-pop sm:p-5">
      <div className="relative h-40 overflow-hidden rounded-[18px] sm:h-44">
        <Image src="/images/hd/jebel_jais_sunset.jpg" alt="Road through the Jebel Jais mountains at sunset" fill sizes="(min-width: 1024px) 480px, 90vw" className="object-cover" priority />
      </div>
      <div className="mt-5 flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 pt-1" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-violet" /><span className="h-10 w-0.5 bg-violet/35" /><span className="h-3 w-3 rounded-full bg-sun" /><span className="h-10 w-0.5 bg-violet/35" /><span className="h-3 w-3 rounded-full bg-mint" />
        </div>
        <div className="grid flex-1 gap-5 text-sm sm:text-base">
          <div className="flex justify-between gap-3"><span className="font-semibold">Depart Dubai</span><span className="num text-ink-soft">15:00</span></div>
          <div className="flex justify-between gap-3"><span className="font-semibold">Jebel Jais</span><span className="text-ink-soft">Sunset stop</span></div>
          <div className="flex justify-between gap-3"><span className="font-semibold">Dinner in RAK</span><span className="num text-ink-soft">20:00</span></div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 border-t border-ink/10 pt-4 text-sm text-ink-soft">
        <GlideBot size={28} /> One trip, with its timing connected.
      </div>
    </div>
  );
}

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

function TripChange() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="trip-change" ref={ref} className="relative overflow-hidden bg-cream py-20 text-ink sm:py-28" data-say="A delay changes the plan. I show you what needs attention and ask before each booking change.">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <Reveal>
            <h2 className="max-w-[15ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">When the day changes, the plan can change with it.</h2>
          </Reveal>
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
                <span className={`absolute left-1 top-7 h-6 w-6 rounded-full border-4 border-ink ${change.color} sm:left-3`} aria-hidden />
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

function WhatsAppPreview() {
  return (
    <Image
      src="/images/glide-whatsapp-chat.png"
      alt="Illustrative WhatsApp conversation with Glide about planning a Riyadh work trip"
      width={832}
      height={1889}
      sizes="(min-width: 640px) 340px, 290px"
      className="mx-auto h-auto w-[290px] max-w-full shadow-pop sm:w-[340px]"
    />
  );
}

function ConnectedPlan() {
  const stops = [
    { name: "Leave Dubai", previous: "Was 15:00", revised: "16:15" },
    { name: "Jebel Jais", previous: "Was Friday sunset", revised: "Sat 08:30" },
    { name: "Dinner", previous: "Was 20:00", revised: TIMES.dinner },
  ];

  return (
    <figure className="w-full border-y-2 border-ink/70 py-2" aria-label="How a 75 minute delay changes the itinerary">
      <figcaption className="flex items-baseline justify-between gap-3 py-4">
        <span className="font-display text-[clamp(1.65rem,4vw,2.3rem)] leading-tight">One delay. Three new times.</span>
        <span className="num shrink-0 text-lg text-coral">+75 min</span>
      </figcaption>
      <div className="flex justify-between border-t border-ink/20 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        <span>Original plan</span><span>After the delay</span>
      </div>
      {stops.map((stop) => (
        <div key={stop.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-ink/20 py-4">
          <div className="min-w-0"><p className="font-semibold">{stop.name}</p><p className="mt-0.5 text-sm text-ink-soft">{stop.previous}</p></div>
          <p className="num whitespace-nowrap text-[clamp(1.45rem,5vw,2rem)] leading-none">{stop.revised}</p>
        </div>
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
      <section className="relative isolate overflow-hidden px-5 pb-18 pt-32 sm:px-8 sm:pb-24 sm:pt-40" data-say="I'm Glide. Tell me about your trip and I'll help bring the plan together.">
        <div className="landing-orb pointer-events-none absolute -right-36 top-4 -z-10 h-96 w-96 rounded-full bg-sun/20 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <h1 className="max-w-[12ch] text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.035em] sm:text-[clamp(3.4rem,8vw,6.8rem)] sm:leading-[0.93]">Your whole trip, one conversation.</h1>
            <p className="mt-7 max-w-[47ch] text-lg leading-relaxed text-ink-soft sm:text-xl">Meet Glide, a personal travel agent designed for WhatsApp. Plan holidays, work trips, and everyday travel in one conversation, with help when plans change.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#how-it-works" className="glide-cta-solid inline-flex min-h-11 items-center rounded-full px-6 py-3 font-semibold">See how it works</Link>
            </div>
          </div>
          <Reveal className="w-full max-w-[510px] justify-self-center lg:justify-self-end" from={55}><JourneyDiagram /></Reveal>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 overflow-x-clip border-y border-ink/10 bg-paper/65 px-5 py-20 sm:px-8 sm:py-28" data-say="Plan in a conversation, see a connected itinerary, and approve each purchase or change.">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2.5rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.025em]">From message to itinerary.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">Tell Glide where you are going. See the plan come together, and review each booking decision before it happens.</p>
          </div>
          <ol className="mt-11 divide-y divide-ink/10 border-y border-ink/10">
            <li className="grid gap-7 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-center lg:gap-16">
              <div><span className="num text-2xl text-violet">01</span><h3 className="mt-3 text-3xl sm:text-4xl">Tell Glide about your trip.</h3><p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-ink-soft">Start in WhatsApp with a destination or an idea. Glide asks for dates, travelers, budget, and the details it needs, whether the trip is a holiday, a business visit, or a short journey.</p></div>
              <Reveal from={55} className="w-full"><WhatsAppPreview /></Reveal>
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
          <div className="mt-10 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-3 md:gap-10">
            <div><h3 className="text-2xl">Holidays</h3><p className="mt-3 leading-relaxed text-ink-soft">Flights, stays, activities, meals, and the space between them.</p></div>
            <div><h3 className="text-2xl">Business travel</h3><p className="mt-3 leading-relaxed text-ink-soft">Arrivals, hotel check-in, transfers, and meeting windows that cannot slip.</p></div>
            <div><h3 className="text-2xl">Everyday journeys</h3><p className="mt-3 leading-relaxed text-ink-soft">Short trips, important stops, and changes to the route as the day unfolds.</p></div>
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
