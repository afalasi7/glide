"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import {
  Navigation,
  Sun,
  UtensilsCrossed,
  Building2,
  Wallet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  badgeColor: string;
  accentBg: string;
  borderColor: string;
  icon: React.ElementType;
  whatItWatches: string;
  actionTaken: string;
  result: string;
  sampleStatus: string;
}

export function MultiAgentSection() {
  const shouldReduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isContentInView = useInView(contentRef, { once: true, margin: "-80px" });

  const agents: AgentProfile[] = [
    {
      id: "route",
      name: "Route Agent",
      role: "GPS & Traffic Telematics",
      badgeColor: "text-blue-300 border-blue-500/30 bg-blue-500/15",
      accentBg: "from-blue-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      icon: Navigation,
      whatItWatches: "Live departure time from Dubai Marina & highway traffic along E311/E611.",
      actionTaken: "Detected 75-minute departure delay and recalculated arrival times across all downstream stops.",
      result: "Recalculated route in 180ms without driver interaction.",
      sampleStatus: "ETA to Ras Al Khaimah: 6:35 PM",
    },
    {
      id: "mountain",
      name: "Mountain Summit Agent",
      role: "Astronomical & Daylight Guard",
      badgeColor: "text-amber-300 border-amber-500/30 bg-amber-500/15",
      accentBg: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      icon: Sun,
      whatItWatches: "Solar angles and sunset cutoffs (5:48 PM) behind the Hajar mountain peaks.",
      actionTaken: "Prevented two hours of driving into pitch-black mountain fog by moving Jebel Jais to tomorrow at 8:30 AM.",
      result: "Preserved scenic mountain golden hour for morning sunlight.",
      sampleStatus: "Moved to Day 2 • 8:30 AM",
    },
    {
      id: "dining",
      name: "Dining Agent",
      role: "Restaurant Reservations",
      badgeColor: "text-emerald-300 border-emerald-500/30 bg-emerald-500/15",
      accentBg: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      icon: UtensilsCrossed,
      whatItWatches: "SevenRooms 15-minute table hold limits and kitchen closing times (10:30 PM).",
      actionTaken: "Rescheduled dinner table at Levant & Nar from 8:00 PM to 9:15 PM.",
      result: "Saved table #14 on the terrace with zero cancellation penalty.",
      sampleStatus: "Table #14 Confirmed • 9:15 PM",
    },
    {
      id: "hotel",
      name: "Hotel Concierge Agent",
      role: "Property PMS & Room Key",
      badgeColor: "text-cyan-300 border-cyan-500/30 bg-cyan-500/15",
      accentBg: "from-cyan-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      icon: Building2,
      whatItWatches: "Hotel late check-in hold policies and digital key readiness.",
      actionTaken: "Notified InterContinental RAK front desk of 6:35 PM arrival and issued the mobile room key.",
      result: "Suite guaranteed; bypass the front desk queue directly to your room.",
      sampleStatus: "Late Arrival Confirmed • Key Ready",
    },
    {
      id: "wallet",
      name: "Wallet",
      role: "Lock Screen & Digital Passes",
      badgeColor: "text-purple-300 border-purple-500/30 bg-purple-500/15",
      accentBg: "from-purple-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      icon: Wallet,
      whatItWatches: "Apple Wallet, Google Wallet, and Samsung Wallet pass states.",
      actionTaken: "Silently updated reservation barcodes, seating times, and directions on your phone.",
      result: "Updated pass visible on lock screen and Apple Watch within 300ms.",
      sampleStatus: "Passes Synced on All Devices",
    },
  ];

  const [activeAgentId, setActiveAgentId] = useState<string>("dining");
  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  return (
    <section id="agents" className="relative py-20 sm:py-28 border-t border-white/10 bg-[#070A12]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
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
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Multi-Agent Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Five specialized agents. <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-emerald-400">Zero phone calls.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
            Glide does not rely on a generic chatbot. Instead, five dedicated agents handle distinct parts of your journey simultaneously — from checking mountain sunset times to renegotiating dining reservations.
          </p>
        </motion.div>

        {/* Agent Cards Grid */}
        <motion.div
          ref={contentRef}
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
          }}
          animate={
            isContentInView
              ? { opacity: 1, transform: "translateY(0px)" }
              : {
                  opacity: shouldReduceMotion ? 1 : 0,
                  transform: shouldReduceMotion ? "translateY(0px)" : "translateY(24px)",
                }
          }
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.23, 1, 0.32, 1] as const }}
          className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Agent Selector List */}
          <div className="lg:col-span-5 space-y-3">
            {agents.map((agent) => {
              const isSelected = agent.id === activeAgentId;
              const Icon = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? `bg-[#13192B] ${agent.borderColor} shadow-xl scale-[1.01]`
                      : "bg-[#0E121E] border-white/10 hover:border-white/20 hover:bg-[#121626]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          isSelected
                            ? "bg-white text-zinc-950 font-bold border-white"
                            : "bg-white/5 text-zinc-300 border-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${agent.badgeColor}`}
                    >
                      Active
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Agent Deep Dive Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent.id}
                initial={{
                  opacity: 0,
                  transform: shouldReduceMotion ? "translateY(0px)" : "translateY(12px)",
                }}
                animate={{
                  opacity: 1,
                  transform: "translateY(0px)",
                }}
                exit={{
                  opacity: 0,
                  transform: shouldReduceMotion ? "translateY(0px)" : "translateY(-12px)",
                }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] as const }}
                className={`rounded-3xl border ${activeAgent.borderColor} bg-gradient-to-b ${activeAgent.accentBg} via-[#111624] to-[#0D101C] p-6 sm:p-8 shadow-2xl space-y-6`}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950 font-bold shadow-md">
                      {React.createElement(activeAgent.icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">
                        {activeAgent.name}
                      </h3>
                      <p className="text-xs text-zinc-300">
                        {activeAgent.role}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Autonomous
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      What this agent monitors
                    </span>
                    <p className="text-sm font-medium text-white leading-relaxed">
                      {activeAgent.whatItWatches}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Action executed automatically
                    </span>
                    <p className="text-sm font-medium text-zinc-200 leading-relaxed">
                      {activeAgent.actionTaken}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-1 text-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Outcome for the traveler
                    </span>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {activeAgent.result}
                    </p>
                  </div>
                </div>

                {/* Live Status Pill */}
                <div className="pt-2 flex items-center justify-between text-xs text-zinc-300 border-t border-white/10">
                  <span className="font-medium">Current Status:</span>
                  <span className="font-bold text-emerald-300">
                    {activeAgent.sampleStatus}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
