"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export function DemoCta() {
  return (
    <section className="relative py-20 sm:py-28 border-t border-white/10 bg-[#070A12] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#141A2D] to-[#0E1322] p-8 sm:p-14 shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive Demonstration</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Test the delay simulator <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal text-emerald-400">for yourself.</span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              Select 15, 45, or 75 minutes late. Watch the 5 autonomous agents coordinate in real time to save your dinner table and reschedule your mountain drive.
            </p>

            {/* Feature proof points */}
            <div className="py-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Zero phone calls
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                100% reservations saved
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                Instant wallet pass sync
              </span>
            </div>

            {/* Launch Button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-zinc-950 transition-all duration-200 hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/20 active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Interactive Delay Simulator</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
