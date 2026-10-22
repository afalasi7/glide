import type { Metadata } from "next";
import { preload } from "react-dom";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { GuideHero } from "@/components/story/GuideHero";
import { JourneySteps } from "@/components/story/JourneySteps";
import { Day } from "@/components/story/Day";
import { Moves } from "@/components/story/Moves";
import { Wallet } from "@/components/story/Wallet";
import { Finale } from "@/components/story/Finale";

export const metadata: Metadata = {
  title: "How Glide works — Your personal travel agent",
  description: "See how Glide brings your itinerary together and helps your trip adapt when plans change.",
};

export function GlideLandingPage() {
  preload("/images/hd/jebel_jais_sunset.jpg", { as: "image", fetchPriority: "high" });
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream text-ink">
        <GuideHero />

        <JourneySteps />

        <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sun">See Glide at work</p>
              <h2 className="mt-4 max-w-[13ch] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.94] tracking-[-0.02em] text-paper">One trip. Every detail connected.</h2>
              <p className="mt-5 max-w-[48ch] text-lg font-light leading-relaxed text-paper/80">
                Scroll the Dubai to Ras Al Khaimah story below to see how Glide keeps an itinerary connected as the day changes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-self-end">
              <Link href="#day" className="glide-cta-solid inline-flex min-h-11 items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition-colors">
                Follow the trip
              </Link>
            </div>
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

/** Temporary redirect — home owns the trip guide. Another PR drops this path from the sitemap. */
export default function HowItWorksPage() {
  redirect("/");
}
