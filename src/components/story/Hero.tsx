"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} data-say="Hi, I'm Glide, your personal travel agent. I keep your trip together and help when plans change." className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-paper">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src="/images/hd/jebel_jais_sunset.jpg" alt="The Jebel Jais mountain road at sunset" fill priority sizes="100vw" className="object-cover object-[75%_center]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40" aria-hidden />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end gap-8 px-5 pb-44 sm:px-8 sm:pb-32">
        <h1 className="max-w-[14ch] text-[clamp(3.4rem,10.5vw,8rem)] leading-[0.9] tracking-[-0.025em]">
          Your personal <em className="font-normal text-sun">travel agent.</em>
        </h1>
        <div className="flex flex-wrap items-end justify-between gap-8 lg:pr-[320px]">
          <p className="max-w-[40ch] text-xl font-light leading-relaxed text-paper/90 sm:text-2xl">
            Glide helps plan your itinerary and keep every detail together, then handles the changes along the way. Running
            late? It can rework the day, save dinner and update your hotel while you keep driving.
          </p>
          <Link
            href="/how-it-works"
            className="btn glide-glass glass-control rounded-full bg-card px-9 py-4 text-base font-medium tracking-wide text-foreground hover:bg-popover"
          >
            How Glide works
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
