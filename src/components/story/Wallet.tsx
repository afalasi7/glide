"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WalletPass, type PassKind, type WalletBrand } from "./WalletPass";

const KINDS: PassKind[] = ["hotel", "dinner", "summit"];
const BRANDS: { id: WalletBrand; label: string }[] = [
  { id: "google", label: "Google Wallet" },
  { id: "samsung", label: "Samsung Wallet" },
];

/** Three passes start stacked and fan out as you scroll into the section. */
export function Wallet() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
  const [brand, setBrand] = useState<WalletBrand>("google");

  const x = [useTransform(scrollYProgress, [0, 1], [320, -24]), useTransform(scrollYProgress, [0, 1], [0, 0]), useTransform(scrollYProgress, [0, 1], [-320, 24])];
  const rot = [useTransform(scrollYProgress, [0, 1], [8, -4]), useTransform(scrollYProgress, [0, 1], [0, 0]), useTransform(scrollYProgress, [0, 1], [-8, 4])];

  return (
    <section ref={ref} data-say="Your passes update themselves. Nothing to open." className="overflow-hidden bg-cream py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
            Your wallet <em className="text-violet">already knows.</em>
          </h2>
          <div role="group" aria-label="Wallet brand" className="flex gap-1 rounded-full bg-paper p-1 shadow-pop">
            {BRANDS.map((b) => (
              <button
                key={b.id}
                aria-pressed={brand === b.id}
                onClick={() => setBrand(b.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium tracking-wide ${brand === b.id ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 max-w-[50ch] text-xl font-light leading-relaxed text-ink-soft">
          Room key, dinner and summit entry update themselves the moment the plan changes. Nothing to open, nothing to re-scan.
        </p>

        <ul className="mt-20 flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-6">
          {KINDS.map((k, i) => (
            <motion.li key={k} style={{ x: x[i], rotate: rot[i], zIndex: i === 1 ? 2 : 1 }} className="max-lg:!transform-none">
              <WalletPass kind={k} brand={brand} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
