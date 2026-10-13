"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { GlideLogo } from "@/components/GlideLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

  useEffect(() => {
    setIsScrolled(scrollY.get() > 60);
  }, [scrollY]);

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        shouldReduceMotion ? "duration-0" : "duration-300"
      } ${
        isScrolled
          ? "bg-[#07080B]/95 backdrop-blur-xl border-white/10 shadow-xl shadow-black/60"
          : "bg-[#08090E]/70 backdrop-blur-md border-white/[0.06]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/landing" className="flex items-center gap-3 group">
          <GlideLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                Glide
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Road trip peace of mind.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-300">
          <a
            href="#problem"
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            The Problem
          </a>
          <a
            href="#how-it-works"
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            How It Works
          </a>
          <a
            href="#agents"
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            Agents
          </a>
          <a
            href="#wallets"
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            Wallet
          </a>
          <Link
            href="/previews"
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            Device Previews
          </Link>
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-zinc-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.97]"
          >
            <span>Launch Simulator</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white md:hidden transition-all duration-150 active:scale-[0.97]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.96 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0.96 }}
          style={{ transformOrigin: "top" }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] as const }}
          className="border-b border-white/10 bg-[#0E1322]/95 backdrop-blur-xl px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors duration-150 active:scale-[0.97]"
            >
              The Problem
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors duration-150 active:scale-[0.97]"
            >
              How It Works
            </a>
            <a
              href="#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors duration-150 active:scale-[0.97]"
            >
              Agents
            </a>
            <a
              href="#wallets"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors duration-150 active:scale-[0.97]"
            >
              Wallet
            </a>
            <Link
              href="/previews"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-zinc-400 transition-colors duration-150 active:scale-[0.97]"
            >
              Device Previews
            </Link>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-zinc-950 transition-all duration-150 active:scale-[0.97]"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
