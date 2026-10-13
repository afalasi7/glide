"use client";

import React, { useRef } from "react";
import { Phone } from "@/components/screens/Screens";
import { ConnectScreen, AgentScreen } from "@/components/screens/Onboarding";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function Devices() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const c = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <section ref={ref} data-say="Same plan, every screen." className="overflow-hidden bg-violet py-28 text-paper sm:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-7">
          <h2 className="text-[clamp(3rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.02em]">
            One plan, <em className="text-sun">every screen.</em>
          </h2>
          <p className="max-w-[44ch] text-xl font-light leading-relaxed text-paper/80">
            It starts with sign up, then calendar access: allow Google Calendar, import your trip date, then tap Start and Glide shows you where to go.
          </p>
          <Link href="/previews" className="btn inline-block rounded-full bg-sun px-9 py-4 text-base font-semibold tracking-wide text-ink shadow-lift">
            Browse the devices
          </Link>
        </div>

        <div className="relative mx-auto flex h-[640px] w-full max-w-[600px] items-center justify-center">
          <motion.div style={{ y: a }} className="absolute left-0 top-6 origin-top-left scale-[0.8] sm:scale-90">
            <Phone><ConnectScreen /></Phone>
          </motion.div>
          <motion.div style={{ y: c }} className="absolute right-0 top-24 origin-top-right scale-[0.8] sm:scale-90">
            <Phone punch><AgentScreen /></Phone>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
