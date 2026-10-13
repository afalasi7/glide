"use client";

import React from "react";
import Link from "next/link";
import { Award, ExternalLink, ShieldCheck } from "lucide-react";
import { GlideLogo } from "@/components/GlideLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080E] py-14 text-zinc-400 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <GlideLogo size={28} />
              <span className="text-base font-bold text-white tracking-tight">
                Glide
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Intelligent itinerary protection and real-time coordination for road trips across the UAE.
            </p>
          </div>

          {/* Col 2: Route */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Demonstration Route
            </h4>
            <ul className="space-y-1.5 text-zinc-300">
              <li>Dubai Marina (Origin)</li>
              <li>Jebel Jais Viewing Deck (Summit)</li>
              <li>InterContinental RAK (Resort)</li>
              <li>Levant & Nar (Dinner)</li>
            </ul>
          </div>

          {/* Col 3: Multi-Agent System */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Specialized Agents
            </h4>
            <ul className="space-y-1.5 text-zinc-300">
              <li>Route Agent (Traffic & GPS)</li>
              <li>Mountain Agent (Daylight & Sunset)</li>
              <li>Dining Agent (SevenRooms API)</li>
              <li>Hotel Agent (PMS & Mobile Key)</li>
              <li>Wallet Agent (Native Pass Sync)</li>
            </ul>
          </div>

          {/* Col 4: Digital Passes */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Hardware Ecosystem
            </h4>
            <ul className="space-y-1.5 text-zinc-300">
              <li>Apple Wallet & Dynamic Island</li>
              <li>Google Wallet & Material Design</li>
              <li>Samsung Wallet & One UI</li>
              <li>Apple Watch Ultra Complication</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © 2026 Glide · Autonomous Travel Protection. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white transition-colors">
              Delay Simulator
            </Link>
            <Link href="/landing" className="hover:text-white transition-colors">
              Landing Page
            </Link>
            <Link href="/previews" className="hover:text-white transition-colors">
              Device Previews
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
