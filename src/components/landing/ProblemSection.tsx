"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Sunset,
  Utensils,
  Building2,
  Activity,
  TrendingDown,
  Clock,
  WifiOff,
  Mountain,
  AlertCircle,
  CalendarX2,
  Zap,
} from "lucide-react";

interface TelemetryPoint {
  time: string;
  speed: number;
  location: string;
  status: string;
  delta: string;
  details: string;
}

export function ProblemSection() {
  const [activePointIndex, setActivePointIndex] = useState<number>(3); // Default to standstill point
  const shouldReduceMotion = useReducedMotion();

  const headerRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isFeatureInView = useInView(featureRef, { once: true, margin: "-80px" });
  const isCardsInView = useInView(cardsRef, { once: true, margin: "-80px" });

  const telemetryData: TelemetryPoint[] = [
    {
      time: "15:00",
      speed: 118,
      location: "Dubai Marina",
      status: "Cruising Speed",
      delta: "+0m",
      details: "E11/E311 interchange clear · On schedule for sunset",
    },
    {
      time: "15:25",
      speed: 84,
      location: "Dubai Silicon Oasis",
      status: "Moderate Slowdown",
      delta: "+12m",
      details: "First wave of Friday commuter traffic building",
    },
    {
      time: "15:50",
      speed: 38,
      location: "Mirdif / Airport Merge",
      status: "Heavy Braking",
      delta: "+35m",
      details: "Merge congestion before Sharjah border bottleneck",
    },
    {
      time: "16:15",
      speed: 12,
      location: "Sharjah Border Standstill",
      status: "Total Gridlock",
      delta: "+75m",
      details: "7 lanes locked bumper-to-bumper · Sunset window broken",
    },
    {
      time: "16:40",
      speed: 18,
      location: "National Paints Corridor",
      status: "Stop-and-Go Crawl",
      delta: "+75m",
      details: "Average 14 km/h exhaust haze · Table hold slipping",
    },
  ];

  const activePoint = telemetryData[activePointIndex];

  return (
    <section
      id="problem"
      className="relative py-24 sm:py-36 border-t border-white/10 bg-[#06080F] overflow-hidden"
    >
      {/* Ambient background glow simulating highway dusk */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 h-[540px] w-[540px] rounded-full bg-rose-600/10 blur-[160px]" />
        <div className="absolute bottom-1/4 -right-48 h-[540px] w-[540px] rounded-full bg-amber-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 space-y-16 sm:space-y-24">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
          }}
          animate={
            isHeaderInView
              ? { opacity: 1, transform: "translateY(0px)" }
              : {
                  opacity: shouldReduceMotion ? 1 : 0,
                  transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                }
          }
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] as const }}
          className="max-w-4xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 border border-rose-500/30 px-3.5 py-1 text-xs font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Friday 4:15 PM • Sheikh Mohammed Bin Zayed Road
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04]">
            One 75-minute delay on the E311. <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-rose-400">Every plan unravels downstream.</span>
          </h2>

          <p className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl">
            A weekend escape from Dubai Marina to Ras Al Khaimah is a sequence of fixed windows. When gridlock hits between Mirdif and the Sharjah border, you don&apos;t just lose travel time. Sunset at Jebel Jais disappears into freezing mountain fog, Levant &amp; Nar releases your table after 15 minutes, and your phone loses signal on the mountain pass before you can call ahead.
          </p>
        </motion.div>

        {/* Cinematic Full-Bleed Photograph with Text & Telemetry Overlay */}
        <div
          ref={featureRef}
          className="relative rounded-3xl border border-white/15 bg-[#0C101C] overflow-hidden shadow-2xl shadow-black/90"
        >
          {/* Background Photograph Container with clip-path image reveal */}
          <div className="relative min-h-[580px] lg:min-h-[520px] w-full overflow-hidden">
            <motion.div
              initial={{
                clipPath: shouldReduceMotion
                  ? "inset(0 0 0% 0 round 24px)"
                  : "inset(0 0 100% 0 round 24px)",
                opacity: shouldReduceMotion ? 1 : 0.4,
              }}
              animate={
                isFeatureInView
                  ? {
                      clipPath: "inset(0 0 0% 0 round 24px)",
                      opacity: 1,
                    }
                  : {
                      clipPath: shouldReduceMotion
                        ? "inset(0 0 0% 0 round 24px)"
                        : "inset(0 0 100% 0 round 24px)",
                      opacity: shouldReduceMotion ? 1 : 0.4,
                    }
              }
              transition={{
                duration: 0.9,
                ease: [0.23, 1, 0.32, 1] as const,
              }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src="/images/dubai_traffic_gridlock.jpg"
                alt="Bumper to bumper traffic gridlock on Dubai highway during Friday evening rush hour"
                fill
                priority
                className="object-cover object-center filter brightness-[0.78] contrast-[1.1]"
              />
            </motion.div>

            {/* Cinematic Gradient Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C101C] via-[#0C101C]/70 to-transparent lg:bg-gradient-to-r lg:from-[#0C101C] lg:via-[#0C101C]/85 lg:to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 pointer-events-none" />

            {/* Overlaid Content Grid */}
            <div className="relative z-10 h-full p-6 sm:p-10 flex flex-col justify-between">
              {/* Top Bar Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 rounded-xl bg-black/85 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-xs text-white">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold tracking-tight">E311 Northbound</span>
                  <span className="text-zinc-400">· Past Last Salik Gate</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 backdrop-blur-md px-3 py-1.5 border border-rose-500/40 text-xs font-mono font-bold text-rose-300">
                  <Clock className="h-3.5 w-3.5 text-rose-400" />
                  <span>DEPARTURE DELAY: +75 MIN</span>
                </div>
              </div>

              {/* Middle Section: Story & Large Velocity Readout */}
              <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                {/* Left: The Visceral Human Moment */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-black/75 backdrop-blur-md px-3 py-1 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    <TrendingDown className="h-4 w-4" />
                    <span>VELOCITY COLLAPSE • 7 LANES DEAD STILL</span>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-white">
                      12
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-2xl font-bold text-rose-400 font-mono">km/h</span>
                      <p className="text-xs text-zinc-400 font-mono">
                        posted limit: 120 km/h (-90% drop)
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-xl bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    You left Dubai Marina 75 minutes late. You&apos;re trapped past the exit ramps. Waze adds 10 minutes every 5 minutes. Sunset on Jebel Jais is in 93 minutes, and your phone battery is draining into the cradle.
                  </p>
                </div>

                {/* Right: Authentic Highway Velocity Telemetry Graph */}
                <div className="lg:col-span-5 rounded-2xl bg-[#090D18]/95 backdrop-blur-xl border border-white/15 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-rose-400" />
                      <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                        Highway Velocity Telemetry
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      LIVE GPS TRACE
                    </span>
                  </div>

                  {/* Telemetry Histogram with Y-Axis Markers */}
                  <div className="relative pt-2">
                    {/* Y-Axis Speed Marks */}
                    <div className="absolute left-0 inset-y-2 flex flex-col justify-between text-[9px] font-mono text-zinc-400 pointer-events-none pr-1 border-r border-white/10">
                      <span>120k</span>
                      <span>60k</span>
                      <span>0k</span>
                    </div>

                    {/* Bars Container */}
                    <div className="ml-8 flex items-end justify-between h-28 pt-2 px-1 relative">
                      {/* Grid guideline at 120 km/h */}
                      <div className="absolute inset-x-0 top-3 border-b border-white/5" />
                      {/* Grid guideline at 60 km/h */}
                      <div className="absolute inset-x-0 top-16 border-b border-white/5" />

                      {telemetryData.map((pt, idx) => {
                        const heightPct = Math.max(12, (pt.speed / 120) * 100);
                        const isSelected = idx === activePointIndex;
                        const isCritical = pt.speed <= 20;

                        return (
                          <div
                            key={pt.time}
                            onClick={() => setActivePointIndex(idx)}
                            className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer group px-1"
                          >
                            <span
                              className={`text-[9px] font-mono transition-opacity ${
                                isSelected ? "text-rose-400 font-bold opacity-100" : "text-zinc-500 opacity-60 group-hover:opacity-100"
                              }`}
                            >
                              {pt.speed}k
                            </span>

                            {/* Stagger-animated telemetry bar (delay 30-80ms each) */}
                            <div className="w-full max-w-[28px] flex justify-center items-end h-20">
                              <motion.div
                                style={{
                                  height: `${heightPct}%`,
                                  transformOrigin: "bottom",
                                }}
                                initial={{
                                  opacity: shouldReduceMotion ? 1 : 0,
                                  transform: shouldReduceMotion ? "scaleY(1)" : "scaleY(0)",
                                }}
                                animate={
                                  isFeatureInView
                                    ? {
                                        opacity: 1,
                                        transform: "scaleY(1)",
                                      }
                                    : {
                                        opacity: shouldReduceMotion ? 1 : 0,
                                        transform: shouldReduceMotion ? "scaleY(1)" : "scaleY(0)",
                                      }
                                }
                                transition={{
                                  duration: 0.5,
                                  delay: shouldReduceMotion ? 0 : 0.15 + idx * 0.06,
                                  ease: [0.23, 1, 0.32, 1] as const,
                                }}
                                className={`w-full rounded-t-md transition-colors ${
                                  isCritical
                                    ? "bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/30"
                                    : isSelected
                                    ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-md shadow-amber-500/20"
                                    : "bg-white/15 group-hover:bg-white/30"
                                }`}
                              />
                            </div>

                            <span
                              className={`text-[10px] font-mono transition-colors ${
                                isSelected
                                  ? "text-white font-bold"
                                  : "text-zinc-400"
                              }`}
                            >
                              {pt.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Point Telemetry Readout */}
                  <div className="rounded-xl bg-black/70 border border-white/10 p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        CHECKPOINT
                      </span>
                      <p className="text-white font-bold">{activePoint.location}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{activePoint.details}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-rose-400 font-bold font-mono text-sm block">
                        {activePoint.speed} km/h
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {activePoint.delta}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                  <span className="font-semibold text-white">Impact analysis:</span>
                  <span>1 highway bottleneck cascades through 3 downstream reservations</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Data sourced from E311 highway telematics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Cascade Effects — Stagger revealed on scroll */}
        <div ref={cardsRef} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The downstream cascade without Glide
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              3 uncoordinated failure points
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Jebel Jais — Astronomical & Mountain Elevation Failure */}
            <motion.div
              initial={{
                opacity: shouldReduceMotion ? 1 : 0,
                transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
              }}
              animate={
                isCardsInView
                  ? { opacity: 1, transform: "translateY(0px)" }
                  : {
                      opacity: shouldReduceMotion ? 1 : 0,
                      transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                    }
              }
              transition={{
                duration: 0.6,
                delay: shouldReduceMotion ? 0 : 0.08,
                ease: [0.23, 1, 0.32, 1] as const,
              }}
              className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#101428] via-[#0B0D1A] to-[#070912] overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-indigo-500/50 transition-all"
            >
              {/* Panoramic Mountain Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="/images/jebel_jais_sunset.jpg"
                  alt="Winding mountain hairpin roads to Jebel Jais peak"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101428] via-black/30 to-transparent" />

                <div className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 border border-indigo-500/40 text-[10px] font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                  <Mountain className="h-3 w-3 text-indigo-400" />
                  <span>ELEVATION: 1,934M</span>
                </div>

                <div className="absolute top-3 right-3 rounded-md bg-rose-950/85 backdrop-blur-md px-2 py-0.5 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-300">
                  SUNSET: 5:48 PM
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                    <Sunset className="h-3.5 w-3.5" />
                    <span>ASTRONOMICAL CUTOFF EXPIRED</span>
                  </div>
                  <h4 className="text-lg font-black text-white tracking-tight mt-1">
                    Pitch-Black Summit Drive
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-2.5">
                    The sun sinks behind the Hajar peaks at 5:48 PM sharp. Arriving 45 minutes late forces a 30-kilometer ascent up steep hairpin curves into freezing mountain fog — where temperatures drop to 9°C with zero summit visibility.
                  </p>
                </div>

                {/* Bespoke Alpine Elevation & Solar Gauge */}
                <div className="rounded-2xl bg-black/60 border border-white/10 p-3.5 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Solar Window:</span>
                    <span className="text-rose-400 font-bold">Closed at 17:48</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[100%]" />
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-white/10">
                    <span className="text-zinc-400">Summit Arrival:</span>
                    <span className="text-white font-bold">18:30 (Pitch Dark)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Levant & Nar — SevenRooms Policy & Table Cancellation */}
            <motion.div
              initial={{
                opacity: shouldReduceMotion ? 1 : 0,
                transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
              }}
              animate={
                isCardsInView
                  ? { opacity: 1, transform: "translateY(0px)" }
                  : {
                      opacity: shouldReduceMotion ? 1 : 0,
                      transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                    }
              }
              transition={{
                duration: 0.6,
                delay: shouldReduceMotion ? 0 : 0.16,
                ease: [0.23, 1, 0.32, 1] as const,
              }}
              className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1C1610] via-[#120E0A] to-[#0A0806] overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-amber-500/50 transition-all"
            >
              {/* Restaurant Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="/images/levant_nar_dining.jpg"
                  alt="Levant & Nar outdoor waterfront terrace candlelit dining tables"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1610] via-black/30 to-transparent" />

                <div className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  <Utensils className="h-3 w-3 text-amber-400" />
                  <span>SEVENROOMS POLICY</span>
                </div>

                <div className="absolute top-3 right-3 rounded-md bg-amber-950/85 backdrop-blur-md px-2 py-0.5 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                  HOLD: 15 MINUTES
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                    <CalendarX2 className="h-3.5 w-3.5" />
                    <span>TABLE AUTO-RELEASED</span>
                  </div>
                  <h4 className="text-lg font-black text-white tracking-tight mt-1">
                    The Strict 15-Minute Grace Period
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-2.5">
                    Levant &amp; Nar terrace tables have a 15-minute hold limit on Friday evenings. At 8:16 PM, Table 14 is automatically reassigned to waiting walk-ins, your AED 500 deposit is forfeited, and the kitchen stops seating at 10:00 PM.
                  </p>
                </div>

                {/* Bespoke Restaurant Ledger Slip */}
                <div className="rounded-2xl bg-black/60 border border-white/10 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-zinc-400">Booking Ref: SR-9941</span>
                    <span className="text-amber-400 font-bold">Terrace Table 14</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex justify-between items-center">
                    <span>Grace Cutoff: 8:15 PM</span>
                    <span className="font-bold text-rose-300 font-mono">AED 500 Penalty</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 text-zinc-400 border-t border-white/10">
                    <span>Kitchen Closes:</span>
                    <span className="text-white font-mono font-bold">22:30 Sharp</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: InterContinental RAK — Mountain Canyon Signal Blackout */}
            <motion.div
              initial={{
                opacity: shouldReduceMotion ? 1 : 0,
                transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
              }}
              animate={
                isCardsInView
                  ? { opacity: 1, transform: "translateY(0px)" }
                  : {
                      opacity: shouldReduceMotion ? 1 : 0,
                      transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                    }
              }
              transition={{
                duration: 0.6,
                delay: shouldReduceMotion ? 0 : 0.24,
                ease: [0.23, 1, 0.32, 1] as const,
              }}
              className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0E1724] via-[#09101A] to-[#060A10] overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-cyan-500/50 transition-all"
            >
              {/* Resort Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="/images/ic_rak_resort.jpg"
                  alt="InterContinental Ras Al Khaimah Mina Al Arab resort villas"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1724] via-black/30 to-transparent" />

                <div className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  <WifiOff className="h-3 w-3 text-cyan-400" />
                  <span>WADI DEAD ZONE</span>
                </div>

                <div className="absolute top-3 right-3 rounded-md bg-cyan-950/85 backdrop-blur-md px-2 py-0.5 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                  NO SIGNAL: 38 KM
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>FRONT DESK ISOLATION</span>
                  </div>
                  <h4 className="text-lg font-black text-white tracking-tight mt-1">
                    Canyon Cellular Blackout
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-2.5">
                    Wadi and mountain canyon passes have zero 5G or LTE reception. Trapped in traffic, you cannot phone the front desk to notify them of your late arrival. Unconfirmed suites are flagged as no-show and reassigned to standby arrivals.
                  </p>
                </div>

                {/* Bespoke Network & PMS Status Monitor */}
                <div className="rounded-2xl bg-black/60 border border-white/10 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-zinc-400">Carrier Telemetry:</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                      Searching... (0 Bars)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[11px] flex justify-between items-center">
                    <span>Front Desk Hold:</span>
                    <span className="font-bold text-cyan-300 font-mono">No-Show Flag at 21:00</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 text-zinc-400 border-t border-white/10">
                    <span>Suite Status:</span>
                    <span className="text-white font-mono font-bold">Queue Reallocation Risk</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
