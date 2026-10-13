"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { WalletPass, BRAND_LABEL, type WalletBrand } from "./WalletPass";
import { TIMES } from "./data";

const BRANDS: WalletBrand[] = ["apple", "google", "samsung"];

/** Glide copies the updated reservation's wallet file and sends it to you in the chat. */
export function Wallet() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
  const x = [useTransform(scrollYProgress, [0, 1], [300, -20]), useTransform(scrollYProgress, [0, 1], [0, 0]), useTransform(scrollYProgress, [0, 1], [-300, 20])];
  const rot = [useTransform(scrollYProgress, [0, 1], [8, -4]), useTransform(scrollYProgress, [0, 1], [0, 0]), useTransform(scrollYProgress, [0, 1], [-8, 4])];

  return (
    <section ref={ref} data-say="I copy your new dinner pass and send it to you here." className="overflow-hidden bg-cream py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <h2 className="max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
              Your pass, <em className="text-violet">in the chat.</em>
            </h2>
            <p className="max-w-[50ch] text-xl font-light leading-relaxed text-ink-soft">
              When the restaurant confirms the new time, Glide copies the wallet file from the updated reservation and sends it to you in the chat. Tap it once and it opens in Apple, Google or Samsung Wallet.
            </p>
          </div>

          <div className="rounded-[28px] bg-paper p-5 shadow-pop sm:p-6">
            <div className="flex items-start gap-3">
              <GlideBot size={40} />
              <div className="space-y-3">
                <p className="rounded-[20px] rounded-tl-md bg-cream px-4 py-3 text-base leading-snug">
                  Dinner at Levant &amp; Nar is now <b>{TIMES.dinner.replace("Day 1 • ", "")}</b>. Here is the updated pass.
                </p>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-white px-4 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet font-mono text-[11px] font-semibold text-paper">PASS</span>
                  <div className="leading-tight">
                    <p className="font-mono text-sm font-medium">levant-nar-2115.pkpass</p>
                    <p className="text-xs text-ink-soft">Copied from reservation SR-994182-MOD</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((b) => (
                    <span key={b} className="rounded-full bg-ink px-4 py-2 text-xs font-medium tracking-wide text-paper">Add to {BRAND_LABEL[b]}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-20 flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-6">
          {BRANDS.map((b, i) => (
            <motion.li key={b} style={{ x: x[i], rotate: rot[i], zIndex: i === 1 ? 2 : 1 }} className="max-lg:!transform-none">
              <WalletPass brand={b} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
