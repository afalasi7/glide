import type { Metadata } from "next";
import { LenisProvider } from "@/components/LenisProvider";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MultiAgentSection } from "@/components/landing/MultiAgentSection";
import { WalletSection } from "@/components/landing/WalletSection";
import { DemoCta } from "@/components/landing/DemoCta";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Glide — Your trip, handled.",
  description:
    "When road trips run late, Glide heals them before you realize. 5 specialized agents reschedule mountain summits, protect restaurant reservations, and update native digital passes. Zero phone calls made.",
  keywords: [
    "Glide",
    "Autonomous Travel Agent",
    "Multi-Agent AI",
    "Travel Itinerary Protection",
    "Apple Wallet Pass",
    "Google Wallet",
  ],
  openGraph: {
    title: "Glide — Your trip, handled.",
    description:
      "5 specialized agents reschedule mountain summits, protect restaurant reservations, and update native digital passes in real time.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#080B12] text-white selection:bg-white/20 font-sans antialiased">
        {/* 1. Global Navigation */}
        <Navbar />

        {/* Main Landing Page Flow */}
        <main>
          {/* 2. Hero Section */}
          <Hero />

          {/* 3. Problem Section */}
          <ProblemSection />

          {/* 4. How Glide Works (3-step visual) */}
          <HowItWorks />

          {/* 5. Multi-Agent System (Dedicated 5-agent architecture) */}
          <MultiAgentSection />

          {/* 6. Digital Wallet Integration */}
          <WalletSection />

          {/* 7. Live Interactive Simulator CTA */}
          <DemoCta />
        </main>

        {/* 8. Footer */}
        <Footer />
      </div>
    </LenisProvider>
  );
}
