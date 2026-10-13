"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { GlideLogo } from "@/components/GlideLogo";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isCardInView = useInView(cardRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#090D16]">
      {/* Scroll-progress indicator at the very top (thin emerald line) */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          transformOrigin: "0%",
        }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-emerald-400 z-[100] pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.8)]"
      />

      {/* Ambient background illumination */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-1/2 -right-48 h-[400px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Headline with high contrast & human voice */}
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-sans tracking-wide">
              Live UAE Itinerary Protection
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto"
          >
            Running 75 minutes late? <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-emerald-400">
              Your dinner table just moved to 9:15 PM.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-base sm:text-xl text-zinc-300 font-normal leading-relaxed"
          >
            When unexpected road delays hit, Glide seamlessly reschedules mountain summits, protects dining reservations, and pushes updated passes directly to your Apple, Google, and Samsung Wallet. Zero phone calls made.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={itemVariants}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-zinc-950 transition-all duration-200 hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/10 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Launch Delay Simulator</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>

            <a
              href="#agents"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:bg-white/10 hover:border-white/30 hover:text-white active:scale-95"
            >
              <span>See Multi-Agent System</span>
            </a>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xs text-zinc-400 font-medium"
          >
            Real UAE road trip: Dubai Marina → Jebel Jais → InterContinental RAK → Levant &amp; Nar Dinner
          </motion.p>
        </motion.div>

        {/* Live Trip Preview Card with Photographic Stations */}
        <motion.div
          ref={cardRef}
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
          }}
          animate={
            isCardInView
              ? { opacity: 1, transform: "translateY(0px)" }
              : {
                  opacity: shouldReduceMotion ? 1 : 0,
                  transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                }
          }
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] as const }}
          className="mt-12 sm:mt-16"
        >
          <div className="relative mx-auto max-w-4xl rounded-3xl border border-white/15 bg-[#121624] p-5 sm:p-7 shadow-2xl shadow-black/60 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <GlideLogo size={40} />
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Autonomous Trip Resolution • Dubai to Ras Al Khaimah
                  </h2>
                  <p className="text-xs text-zinc-300">
                    4 Waypoints · 5 Coordinating AI Agents · Instant Wallet Push
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Trip Protected
                </span>
              </div>
            </div>

            {/* 4 Stations with Real Photographs */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isCardInView ? "visible" : "hidden"}
              className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              {/* Waypoint 1: Traffic Jam */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-white/10 bg-[#161C2E] overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src="/images/dubai_traffic_gridlock.jpg"
                    alt="Dubai highway traffic jam"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161C2E] via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 font-bold border border-amber-500/30">
                    +75m Jam
                  </span>
                </div>
                <div className="p-3 pt-1">
                  <h3 className="text-xs font-bold text-white">Dubai Marina</h3>
                  <p className="text-[11px] text-zinc-300 mt-0.5">Departed 4:15 PM (Was 3:00)</p>
                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-zinc-300 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>Route Agent detected delta</span>
                  </div>
                </div>
              </motion.div>

              {/* Waypoint 2: Jebel Jais */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-emerald-500/30 bg-[#0F2218] overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src="/images/jebel_jais_sunset.jpg"
                    alt="Jebel Jais mountain sunset"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2218] via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 rounded-md bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                    Tomorrow 8:30 AM
                  </span>
                </div>
                <div className="p-3 pt-1">
                  <h3 className="text-xs font-bold text-white">Jebel Jais Summit</h3>
                  <p className="text-[11px] text-emerald-200 mt-0.5">Moved to morning light</p>
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Avoided dark mountain fog</span>
                  </div>
                </div>
              </motion.div>

              {/* Waypoint 3: InterContinental Hotel */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-white/10 bg-[#161C2E] overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src="/images/ic_rak_resort.jpg"
                    alt="InterContinental RAK resort hotel"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161C2E] via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 font-bold border border-cyan-500/30">
                    Arrive 6:35 PM
                  </span>
                </div>
                <div className="p-3 pt-1">
                  <h3 className="text-xs font-bold text-white">InterContinental RAK</h3>
                  <p className="text-[11px] text-zinc-300 mt-0.5">Mobile Key Ready</p>
                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-zinc-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Hotel Agent noted late arrival</span>
                  </div>
                </div>
              </motion.div>

              {/* Waypoint 4: Levant & Nar Dinner */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-emerald-500/30 bg-[#0F2218] overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-24 w-full">
                  <Image
                    src="/images/levant_nar_dining.jpg"
                    alt="Levant & Nar dining terrace"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2218] via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 rounded-md bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                    Table #14 · 9:15 PM
                  </span>
                </div>
                <div className="p-3 pt-1">
                  <h3 className="text-xs font-bold text-white">Levant &amp; Nar</h3>
                  <p className="text-[11px] text-emerald-200 mt-0.5">Held &amp; Moved with 0 Fees</p>
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>SevenRooms API rebooked</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom Autonomous Action Banner */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B0F1A] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-200">
                <Zap className="h-3.5 w-3.5 text-emerald-400 fill-current animate-pulse" />
                <span className="font-bold text-white">Autonomous Result:</span>
                <span className="text-zinc-300">0 cancellations · 0 forfeited deposits · 0 phone calls made</span>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Test delay in simulator</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
