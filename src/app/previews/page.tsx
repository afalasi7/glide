"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Smartphone,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { GlideLogo } from "@/components/GlideLogo";
import {
  IPhone16ProMaxFrame,
  GooglePixel9ProFrame,
  SamsungGalaxyS25UltraFrame,
  AppleWatchUltra3Frame,
} from "@/components/devices";
import {
  AppleWalletPass,
  GoogleWalletPass,
  SamsungWalletPass,
} from "@/components/wallet";

// Motion container & item variants for stagger cascade (Emil Kowalski: 60ms stagger, scale 0.95 -> 1, <300ms)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const },
  },
};

export default function PreviewsPage() {
  const [isHealed, setIsHealed] = useState<boolean>(true);
  const [activePassTab, setActivePassTab] = useState<"apple" | "google" | "samsung">("apple");

  return (
    <div className="min-h-screen bg-[#07080B] text-white selection:bg-white/20 font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07080B]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Back to App & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to App</span>
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <GlideLogo size={24} variant="emerald" />
              <div>
                <h1 className="text-xs font-bold tracking-tight text-white leading-none">
                  Glide Previews
                </h1>
                <span className="text-[10px] text-neutral-400">
                  Cross-Platform Hardware Showcase
                </span>
              </div>
            </div>
          </div>

          {/* Healed State Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHealed(!isHealed)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition active:scale-95 ${
                isHealed
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-neutral-900 border-neutral-700 text-neutral-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isHealed ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                }`}
              />
              <span>{isHealed ? "State: Healed (+75m)" : "State: Original"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 overflow-hidden">
        {/* Subtle ambient gradient behind hero text */}
        <div className="pointer-events-none absolute -top-16 left-1/3 h-[320px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-4 right-1/4 h-[240px] w-[380px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Cross-Platform Hardware & Wallets</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            One Plan. Every Screen.
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            When departure delays push your dinner to 9:15 PM and summit to tomorrow morning, Glide synchronizes the new plan instantly across your phone, smartwatch, and digital wallet passes.
          </p>
        </div>
      </section>

      {/* Main Showcase Grid: 4 Devices */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-b border-white/[0.08] pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Device Displays
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            Real-time synchronization across iOS, Android & watchOS
          </span>
        </div>

        {/* Responsive Grid with Stagger Cascade Animation - mt-2 for visual tightness */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 items-start justify-items-center"
        >
          {/* Device 1: iPhone 16 Pro Max */}
          <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
            <IPhone16ProMaxFrame isHealed={isHealed} />
            <div className="mt-5 text-center space-y-1 w-full max-w-[320px]">
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-sm font-bold text-white">iPhone 16 Pro Max</h4>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-white/10">
                  iOS 18
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Dynamic Island • Live Schedule View
              </p>
              <p className="text-[11px] text-neutral-400">
                6.9&quot; Display • Real-time notifications
              </p>
            </div>
          </motion.div>

          {/* Device 2: Google Pixel 9 Pro */}
          <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
            <GooglePixel9ProFrame isHealed={isHealed} />
            <div className="mt-5 text-center space-y-1 w-full max-w-[320px]">
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-sm font-bold text-white">Google Pixel 9 Pro</h4>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-white/10">
                  Android 15
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Material Design 3 • Google Wallet Pass
              </p>
              <p className="text-[11px] text-neutral-400">
                6.8&quot; Display • Native push update
              </p>
            </div>
          </motion.div>

          {/* Device 3: Samsung Galaxy S25 Ultra */}
          <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
            <SamsungGalaxyS25UltraFrame isHealed={isHealed} />
            <div className="mt-5 text-center space-y-1 w-full max-w-[320px]">
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-sm font-bold text-white">Samsung Galaxy S25 Ultra</h4>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-white/10">
                  One UI 7
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Samsung Smart Pass • Live Barcode
              </p>
              <p className="text-[11px] text-neutral-400">
                6.9&quot; Display • Titanium Gray
              </p>
            </div>
          </motion.div>

          {/* Device 4: Apple Watch Ultra 3 */}
          <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
            <AppleWatchUltra3Frame isHealed={isHealed} />
            <div className="mt-5 text-center space-y-1 w-full max-w-[320px]">
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-sm font-bold text-white">Apple Watch Ultra 3</h4>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-white/10">
                  watchOS 11
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Glance Complication • Next Stop Alert
              </p>
              <p className="text-[11px] text-neutral-400">
                49mm Titanium • Immediate wrist feedback
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 2: Reusable Wallet Pass Inspection Suite */}
        <section className="mt-20 pt-12 border-t border-white/[0.08]">
          <div className="max-w-2xl mb-16 space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Native Digital Wallet Passes
              </h3>
            </div>
            <p className="text-xs text-neutral-300">
              When dinner moves to 9:15 PM, Glide instantly pushes revised passes to Apple Wallet, Google Wallet, and Samsung Wallet. No app launch required.
            </p>
          </div>

          {/* Pass Format Selector for Desktop and Mobile */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => setActivePassTab("apple")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition active:scale-95 ${
                activePassTab === "apple"
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              Apple Wallet
            </button>
            <button
              onClick={() => setActivePassTab("google")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition active:scale-95 ${
                activePassTab === "google"
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              Google Wallet
            </button>
            <button
              onClick={() => setActivePassTab("samsung")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold border transition active:scale-95 ${
                activePassTab === "samsung"
                  ? "bg-white text-black border-white shadow-md"
                  : "bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              Samsung Wallet
            </button>
          </div>

          {/* Passes Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center">
            {/* Apple Wallet Pass */}
            <div
              className={`flex flex-col items-center w-full transition duration-300 ${
                activePassTab === "apple"
                  ? "ring-2 ring-emerald-500/50 rounded-[32px] p-2"
                  : "opacity-75 md:opacity-100"
              }`}
            >
              <AppleWalletPass
                venueName="Levant & Nar"
                time="21:15"
                tableNumber="Table #14"
                seatingArea="Outdoor Terrace"
                referenceCode="SR-994182-MOD"
                status={isHealed ? "Autonomously Modified" : "Confirmed • Original"}
                isHealed={isHealed}
              />
              <div className="mt-4 text-center">
                <span className="text-xs font-bold text-white">Apple Wallet Pass</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Apple PKPass format with Live Activity lock screen card
                </p>
              </div>
            </div>

            {/* Google Wallet Pass */}
            <div
              className={`flex flex-col items-center w-full transition duration-300 ${
                activePassTab === "google"
                  ? "ring-2 ring-emerald-500/50 rounded-[32px] p-2"
                  : "opacity-75 md:opacity-100"
              }`}
            >
              <GoogleWalletPass
                venueName="Levant & Nar"
                time="21:15"
                tableNumber="Table #14"
                seatingArea="Outdoor Terrace"
                referenceCode="SR-994182-MOD"
                status={isHealed ? "Autonomously Modified" : "Confirmed • Original"}
                isHealed={isHealed}
              />
              <div className="mt-4 text-center">
                <span className="text-xs font-bold text-white">Google Wallet Pass</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Material Design 3 card with Google Wallet instant sync
                </p>
              </div>
            </div>

            {/* Samsung Wallet Pass */}
            <div
              className={`flex flex-col items-center w-full transition duration-300 ${
                activePassTab === "samsung"
                  ? "ring-2 ring-emerald-500/50 rounded-[32px] p-2"
                  : "opacity-75 md:opacity-100"
              }`}
            >
              <SamsungWalletPass
                venueName="Levant & Nar"
                time="21:15"
                tableNumber="Table #14"
                seatingArea="Outdoor Terrace"
                referenceCode="SR-994182-MOD"
                status={isHealed ? "Autonomously Modified" : "Confirmed • Original"}
                isHealed={isHealed}
              />
              <div className="mt-4 text-center">
                <span className="text-xs font-bold text-white">Samsung Wallet Pass</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  One UI pass format with quick access swipe tab
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
