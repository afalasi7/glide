import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { GlassPanel } from "@/components/ui/glass";
import { Day } from "@/components/story/Day";
import { Moves } from "@/components/story/Moves";
import { Wallet } from "@/components/story/Wallet";
import { Finale } from "@/components/story/Finale";

export const metadata: Metadata = {
  title: "How Glide works — Your personal travel agent",
  description: "See how Glide brings your itinerary together and helps your trip adapt when plans change.",
};

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

export function GlideLandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream text-ink">
        <section className="relative flex min-h-svh items-end overflow-hidden bg-ink text-paper">
          <Image src="/images/hd/jebel_jais_sunset.jpg" alt="A mountain road at sunset" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" aria-hidden />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pb-24">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-paper/75">A little more room to enjoy the trip</p>
            <h1 className="max-w-[12ch] text-[clamp(3.4rem,10vw,8rem)] leading-[0.9] tracking-[-0.025em]">
              Your trip, <em className="font-normal text-sun">in good hands.</em>
            </h1>
            <p className="mt-7 max-w-[42ch] text-xl font-light leading-relaxed text-paper/90 sm:text-2xl">
              Glide is your personal travel agent: it brings the moving parts together, then helps your plans keep up when the day changes.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-36" aria-labelledby="steps-title">
          <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-[1fr_0.8fr] md:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet">From first plan to final stop</p>
              <h2 id="steps-title" className="mt-4 max-w-[12ch] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.94] tracking-[-0.02em]">
                A travel agent that keeps up.
              </h2>
            </div>
            <p className="max-w-[42ch] text-lg font-light leading-relaxed text-ink-soft md:justify-self-end">
              Your itinerary is connected, not a list of separate bookings. When one thing shifts, Glide can see what that means for the rest of your trip.
            </p>
          </div>

          <ol className="grid gap-5 md:grid-cols-2">
            {STEPS.map((step) => (
              <li key={step.number} className="min-w-0">
                <GlassPanel className="h-full overflow-hidden">
                  <div className="relative h-56 sm:h-72">
                    <Image src={step.image} alt={step.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    <span className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-paper font-mono text-sm font-semibold text-ink shadow-pop">{step.number}</span>
                  </div>
                  <div className="space-y-4 p-6 sm:p-8">
                    <h3 className="text-3xl leading-tight tracking-tight sm:text-4xl">{step.title}</h3>
                    <p className="max-w-[48ch] text-base leading-relaxed text-ink-soft sm:text-lg">{step.description}</p>
                    <p className="border-t border-ink/10 pt-4 text-xs font-medium uppercase tracking-[0.16em] text-violet">{step.detail}</p>
                  </div>
                </GlassPanel>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sun">See Glide at work</p>
              <h2 className="mt-4 max-w-[13ch] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.94] tracking-[-0.02em]">One trip. Every detail connected.</h2>
              <p className="mt-5 max-w-[48ch] text-lg font-light leading-relaxed text-paper/75">
                The current prototype walks through a Dubai to Ras Al Khaimah trip. Calendar, booking and wallet actions in the demo illustrate how Glide is designed to help.
              </p>
            </div>
            <Link href="#day" className="glide-glass glass-control inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-8 py-4 text-base font-semibold text-secondary-foreground transition-colors hover:bg-accent md:justify-self-end">
              Follow the trip
            </Link>
          </div>
        </section>

        <Day />
        <Moves />
        <Wallet />
        <Finale />
      </main>
    </>
  );
}

export default function HowItWorksPage() {
  return <GlideLandingPage />;
}
