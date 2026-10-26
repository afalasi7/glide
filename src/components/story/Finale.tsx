"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { TIMES } from "./data";

export function Finale() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <>
      <section ref={ref} data-say="Your plans are in place. Go enjoy the trip." className="relative z-20 flex min-h-[90svh] items-end overflow-hidden bg-ink text-paper">
        <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[14%]">
          <Image src="/images/hd/levant_nar_dining.jpg" alt="Dinner on the terrace at Levant & Nar" fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/15" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-5 pb-20 sm:px-8 sm:pb-28">
          <motion.h2
            initial={{ opacity: 0, y: 58 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            className="glide-motion-entry max-w-[12ch] text-[clamp(3.4rem,10vw,8rem)] leading-[0.9] tracking-[-0.025em] text-paper drop-shadow-[0_2px_28px_rgba(0,0,0,0.6)]"
          >
            Dinner is at <em className="text-sun">{TIMES.dinner}.</em> Enjoy the trip.
          </motion.h2>
        </div>
      </section>
      <footer className="relative z-20 border-t border-ink/15 bg-paper py-12 text-ink">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-ink" aria-label="Glide home">
              <GlideBot size={44} />
              <span className="font-display text-2xl font-semibold italic text-ink">Glide</span>
            </Link>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              <Link href="/terms" className="transition-colors hover:text-ink">
                Terms and conditions
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">
                Privacy policy
              </Link>
            </nav>
          </div>
          <p className="text-sm text-ink-soft">© 2026 Glide. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
