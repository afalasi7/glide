"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radio, GitBranch, Cpu, CheckCircle2, ArrowRight, Sparkles, Terminal, Shield, RefreshCw } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      step: "Detect",
      title: "Detects the delay before you even realize you're late",
      description:
        "While you're on the road, Glide monitors your departure and highway traffic. When you leave Dubai Marina 75 minutes late, Glide immediately calculates the ripple effect on every stop on your schedule.",
      highlights: [
        "Tracks departure timing and highway traffic on E311",
        "Calculates exact mountain sunset cutoff (5:48 PM)",
        "Checks restaurant 15-minute table hold policy",
      ],
      icon: Radio,
      accentColor: "blue",
      visual: (
        <div className="rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-xl space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-white font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              DELAY DETECTED
            </span>
            <span className="text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
              +75 min late
            </span>
          </div>
          <div className="space-y-2 text-zinc-300">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
              <span>Dubai Marina Departure</span>
              <span className="text-amber-300 font-bold">4:15 PM (Was 3:00 PM)</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex justify-between items-center text-rose-200">
              <span>Jebel Jais Mountain Sunset</span>
              <span className="font-bold">5:48 PM (Missed by 42m)</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
              <span>Levant & Nar Dinner (8:00 PM)</span>
              <span className="text-rose-300 font-bold">Table at risk</span>
            </div>
          </div>
          <div className="pt-2 text-xs text-zinc-300 flex items-center justify-between border-t border-white/10">
            <span>Automatic Action:</span>
            <span className="text-emerald-300 font-bold">Multi-Agent Replan Triggered</span>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      step: "Restructure",
      title: "Intelligently reorders stops to save your weekend",
      description:
        "Instead of forcing you into a freezing, pitch-black mountain drive, Glide moves Jebel Jais to tomorrow morning at 8:30 AM when the light is perfect. You route straight to the resort first to check in and relax.",
      highlights: [
        "Mountain summit shifted to tomorrow morning for crystal-clear views",
        "Direct highway routing straight to hotel check-in",
        "Zero stressful driving on dark, winding mountain hairpins",
      ],
      icon: GitBranch,
      accentColor: "purple",
      visual: (
        <div className="rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-xl space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-white font-bold flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-emerald-400" />
              UPDATED ROUTE SEQUENCE
            </span>
            <span className="text-emerald-300 text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              OPTIMIZED
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
              <span className="h-6 w-6 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div className="flex-1">
                <span className="text-white font-bold block">Dubai Marina</span>
                <span className="text-zinc-400 text-[11px]">Departed 4:15 PM</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div className="flex-1">
                <span className="text-emerald-300 font-bold block">InterContinental RAK (Check-in)</span>
                <span className="text-zinc-300 text-[11px]">Arrive 6:35 PM • Key Ready</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <span className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div className="flex-1">
                <span className="text-emerald-300 font-bold block">Levant & Nar Dinner</span>
                <span className="text-zinc-300 text-[11px]">Rescheduled to 9:15 PM</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30">
              <span className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <div className="flex-1">
                <span className="text-blue-300 font-bold block">Jebel Jais Viewing Deck</span>
                <span className="text-zinc-300 text-[11px]">Tomorrow • 8:30 AM Morning Golden Hour</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      step: "Execute",
      title: "Reschedules reservations without making a single phone call",
      description:
        "Glide talks directly to restaurant and hotel reservation platforms. Your table is moved to 9:15 PM, the front desk is notified of late arrival, and the updated pass pops up on your phone.",
      highlights: [
        "Restaurant table moved to 9:15 PM with zero penalty fees",
        "Hotel front desk alerted and mobile room key provisioned",
        "Live wallet pass and Dynamic Island updated automatically",
      ],
      icon: Cpu,
      accentColor: "emerald",
      visual: (
        <div className="rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-white font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              CONFIRMED CHANGES
            </span>
            <span className="text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-xs">
              0 CALLS MADE
            </span>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-black/40 p-3 border border-white/10 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold flex justify-between">
                <span>Levant & Nar Dinner</span>
                <span>Confirmed</span>
              </div>
              <p className="text-zinc-300 text-[11px]">
                Moved to 9:15 PM • Table #14 Terrace • Reference #SR-994182
              </p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/10 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold flex justify-between">
                <span>InterContinental RAK</span>
                <span>Room Secured</span>
              </div>
              <p className="text-zinc-300 text-[11px]">
                Late check-in confirmed • Mobile room key active
              </p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/10 text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold flex justify-between">
                <span>Apple & Google Wallet</span>
                <span>Pushed</span>
              </div>
              <p className="text-zinc-300 text-[11px]">
                Updated reservation passes sent to your lock screen
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 border-t border-white/10 bg-[#090D16]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider">Autonomous Trip Resolution</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How Glide heals broken trips <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-emerald-400">in real time.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
            From the moment you hit traffic to the second your new dinner time arrives on your lock screen, Glide handles everything in three seamless steps.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="mt-16 space-y-20">
          {steps.map((s, idx) => {
            const isReversed = idx % 2 === 1;
            const Icon = s.icon;

            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-14 ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content Side */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                      STEP {s.num} — {s.step}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-base text-zinc-300 leading-relaxed">
                    {s.description}
                  </p>

                  <ul className="space-y-2 pt-1">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Side */}
                <div className="w-full lg:w-[460px] shrink-0">
                  {s.visual}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
