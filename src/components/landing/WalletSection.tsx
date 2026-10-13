"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { QrCode, Smartphone, Sparkles, Check, Wifi, Shield, ArrowUpRight, Zap } from "lucide-react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative transition-shadow duration-300 ${className}`}
      >
        <div style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function WalletSection() {
  return (
    <section id="wallets" className="relative py-20 sm:py-28 border-t border-white/10 bg-[#090D16]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Native Wallet Integration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Updates appear directly <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-emerald-400">on your lock screen and wrist.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
            No proprietary apps to open, no emails to search while driving. As soon as Glide adjusts your dinner or hotel arrival, the updated barcode and seating time are already on your Apple Wallet, Google Wallet, and Samsung Wallet passes.
          </p>
        </div>

        {/* 3 Wallet Passes Side by Side with 3D Tilt */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Apple Wallet */}
          <TiltCard className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#161B2B] to-[#101422] p-6 shadow-2xl hover:border-emerald-500/40">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm shadow-xs">
                  
                </div>
                <span className="text-xs font-bold text-white">Apple Wallet</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Pass Updated
              </span>
            </div>

            {/* Apple Pass Content */}
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                    DINING RESERVATION
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">Levant & Nar</h4>
                  <p className="text-xs text-zinc-300">InterContinental RAK Waterfront</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-zinc-200 border border-white/10">
                  <QrCode className="h-6 w-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black/50 border border-white/10 p-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">SEATING TIME</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">21:15</span>
                  <span className="text-[10px] text-emerald-300 block">Auto-Shifted (+75m)</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">TABLE</span>
                  <span className="font-semibold text-white">#14 (Terrace)</span>
                  <span className="text-[10px] text-zinc-400 block">2 Guests</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-300 border-t border-dashed border-white/15">
                <span>Confirmation: SR-994182</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready to Scan
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-xs text-zinc-300 flex items-center justify-between">
              <span>Dynamic Island:</span>
              <span className="text-white font-semibold">Active Glance</span>
            </div>
          </TiltCard>

          {/* Card 2: Google Wallet */}
          <TiltCard className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#161B2B] to-[#101422] p-6 shadow-2xl hover:border-cyan-500/40">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                  G
                </div>
                <span className="text-xs font-bold text-white">Google Wallet</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                <Wifi className="h-3 w-3" />
                Hotel Key Synced
              </span>
            </div>

            {/* Google Pass Content */}
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                    RESORT STAY & KEY
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">InterContinental RAK</h4>
                  <p className="text-xs text-zinc-300">Mina Al Arab Island Suite</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <Shield className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black/50 border border-white/10 p-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">ARRIVAL WINDOW</span>
                  <span className="font-mono text-cyan-300 font-bold text-base">18:35 - 20:00</span>
                  <span className="text-[10px] text-cyan-400 block">Late Arrival Flagged</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">DIGITAL KEY</span>
                  <span className="font-semibold text-white">Suite #408</span>
                  <span className="text-[10px] text-emerald-400 block">Pre-Authorized</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-300 border-t border-dashed border-white/15">
                <span>Reservation: IC-4089</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> NFC Active
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-xs text-zinc-300 flex items-center justify-between">
              <span>Android Fast Pair:</span>
              <span className="text-white font-semibold">Instant Notification</span>
            </div>
          </TiltCard>

          {/* Card 3: Samsung Wallet */}
          <TiltCard className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#161B2B] to-[#101422] p-6 shadow-2xl hover:border-purple-500/40">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                  S
                </div>
                <span className="text-xs font-bold text-white">Samsung Wallet</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                <Shield className="h-3 w-3" />
                Summit Pass
              </span>
            </div>

            {/* Samsung Pass Content */}
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                    MOUNTAIN PASS
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">Jebel Jais Viewing Deck</h4>
                  <p className="text-xs text-zinc-300">Ras Al Khaimah Heights</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-300 border border-purple-500/20">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black/50 border border-white/10 p-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">UPDATED TIME</span>
                  <span className="font-mono text-purple-300 font-bold text-base">Tomorrow 8:30 AM</span>
                  <span className="text-[10px] text-purple-400 block">Morning Sunlight</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">EXPERIENCE</span>
                  <span className="font-semibold text-white">Panoramic Deck</span>
                  <span className="text-[10px] text-emerald-400 block">Zero Haze</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-300 border-t border-dashed border-white/15">
                <span>Pass: JJ-SUMMIT-02</span>
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Barcode Ready
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-xs text-zinc-300 flex items-center justify-between">
              <span>Galaxy Cover Screen:</span>
              <span className="text-white font-semibold">Synced</span>
            </div>
          </TiltCard>
        </div>

        {/* Feature summary callout */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#121624] p-5 sm:p-6 text-center text-sm text-zinc-300 shadow-md">
          <p className="max-w-2xl mx-auto leading-relaxed">
            Zero friction. Zero apps to configure. When Glide’s agents adjust your itinerary, your digital passes update on your lock screen before you park the car.
          </p>
        </div>
      </div>
    </section>
  );
}
