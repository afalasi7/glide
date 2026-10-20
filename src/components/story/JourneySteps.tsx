"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass";

const STEPS = [
  {
    number: "01",
    title: "Bring your trip together",
    description: "Share where you’re going, when you’re travelling, and the stops and bookings that matter. Glide starts with the shape of your whole trip.",
    detail: "Your route · dates · reservations",
    image: "/images/hd/traffic_road.jpg",
    alt: "A road winding through the mountains",
  },
  {
    number: "02",
    title: "Get a plan that fits",
    description: "Glide connects your drive times, hotel arrival, meal reservations and time-sensitive stops into one itinerary, so each part makes sense with the next.",
    detail: "One itinerary · connected details",
    image: "/images/hd/jebel_jais_sunset.jpg",
    alt: "Jebel Jais mountain road at sunset",
  },
  {
    number: "03",
    title: "Let the day change",
    description: "Traffic, a late start or a stop that runs long can affect everything after it. Glide works out what changed and which plans need attention.",
    detail: "A change · the full picture",
    image: "/images/hd/ic_rak_resort.jpg",
    alt: "A resort in Ras Al Khaimah",
  },
  {
    number: "04",
    title: "Keep moving, together",
    description: "Glide reshapes the itinerary around what still matters, coordinates the next steps for affected plans, and keeps the updated details close at hand.",
    detail: "Updated plans · details in one place",
    image: "/images/hd/levant_nar_dining.jpg",
    alt: "Dinner on the terrace at Levant & Nar",
  },
];

const VIEWPORT = { once: false, amount: 0.15 };
const EASE = [0.23, 1, 0.32, 1] as const;

export function JourneySteps() {
  return (
    <section className="mx-auto max-w-7xl overflow-x-clip px-5 py-24 sm:px-8 sm:py-36" aria-labelledby="steps-title">
      <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-[1fr_0.8fr] md:items-end">
        <motion.div
          className="glide-motion-entry"
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet">From first plan to final stop</p>
          <h2 id="steps-title" className="mt-4 max-w-[12ch] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.94] tracking-[-0.02em]">
            A travel agent that keeps up.
          </h2>
        </motion.div>
        <motion.p
          className="glide-motion-entry max-w-[42ch] text-lg font-light leading-relaxed text-ink-soft md:justify-self-end"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.75, delay: 0.12, ease: EASE }}
        >
          Your itinerary is connected, not a list of separate bookings. When one thing shifts, Glide can see what that means for the rest of your trip.
        </motion.p>
      </div>

      <ol className="grid gap-5 md:grid-cols-2">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.number}
            className="glide-motion-entry glide-step-card group min-w-0"
            initial={{ opacity: 0, x: index % 2 ? 90 : -90, y: 30, rotate: index % 2 ? 2 : -2 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            viewport={VIEWPORT}
            transition={{ type: "spring", stiffness: 105, damping: 20, delay: index % 2 ? 0.08 : 0 }}
          >
            <GlassPanel className="h-full overflow-hidden">
              <div className="relative h-56 overflow-hidden sm:h-72">
                <Image src={step.image} alt={step.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                <span className="glide-step-badge absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-paper font-mono text-sm font-semibold text-ink shadow-pop">{step.number}</span>
              </div>
              <div className="space-y-4 p-6 sm:p-8">
                <h3 className="text-3xl leading-tight tracking-tight sm:text-4xl">{step.title}</h3>
                <p className="max-w-[48ch] text-base leading-relaxed text-ink-soft sm:text-lg">{step.description}</p>
                <p className="border-t border-ink/10 pt-4 text-xs font-medium uppercase tracking-[0.16em] text-violet">{step.detail}</p>
              </div>
            </GlassPanel>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
