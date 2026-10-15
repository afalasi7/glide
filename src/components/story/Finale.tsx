"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { TIMES } from "./data";

export function Finale() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <>
      <section ref={ref} data-say="Your plans are in place. Go enjoy the trip." className="relative flex min-h-[90svh] items-end overflow-hidden bg-ink text-paper">
        <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[14%]">
          <Image src="/images/hd/levant_nar_dining.jpg" alt="Dinner on the terrace at Levant & Nar" fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-5 pb-20 sm:px-8 sm:pb-28">
          <h2 className="max-w-[12ch] text-[clamp(3.4rem,10vw,8rem)] leading-[0.9] tracking-[-0.025em]">
            Dinner is at <em className="text-sun">{TIMES.dinner}.</em> Enjoy the trip.
          </h2>
        </div>
      </section>
      <footer className="bg-ink py-10 text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
          <span className="inline-flex items-center gap-2.5">
            <GlideBot size={44} />
            <span className="font-display text-2xl font-semibold italic">Glide</span>
          </span>
        </div>
      </footer>
    </>
  );
}
