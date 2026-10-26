import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { LandingStory } from "@/components/story/LandingStory";

export const metadata: Metadata = {
  title: "Glide — Your whole trip, one conversation",
  description: "See how Glide is building a WhatsApp travel agent for holidays, business trips, and everyday journeys.",
};

export function GlideLandingPage() {
  return (
    <>
      <Header />
      <LandingStory />
    </>
  );
}

export default function HowItWorksPage() {
  return <GlideLandingPage />;
}
