"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const GREETING = "Hi, I'm Glide, your personal travel agent. I keep your trip together and help when plans change.";
/** 32px-wide frame of the hero photo, so the first paint is the mountain instead of the ink field. */
const HERO_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAFxQWgAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDAAgYGBwYHCEhISEhISckJygoKCcnJycoKCgrKyszMzMrKysoKCsrMDAzMzc5NzQ0MzQ5OTw8PEhIRUVUVFdnZ3z/xABcAAEBAQEAAAAAAAAAAAAAAAAFAwYCAQEBAAAAAAAAAAAAAAAAAAADBRAAAgEEAwEBAAAAAAAAAAAAAAEDMSERAlEUEgSREQEBAQEAAAAAAAAAAAAAAAAAARFh/8AAEQgADgAgAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AxTnlar+WLr6pVbOQ7Tg5a8uxM4p9L9uXlF+9sqmaerxUL2TQ2QO1/9k=";

/** Full-bleed opening for the trip guide: photo, brand line, and one clear next step. */
export function GuideHero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reducedMotion ? 1 : 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, reducedMotion ? 1 : 0]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("glide:say", { detail: GREETING }));
  }, []);

  return (
    <section
      ref={ref}
      data-say={GREETING}
      className="relative flex min-h-svh items-end overflow-hidden bg-ink text-paper"
    >
      <motion.div
        style={{ y, scale, backgroundImage: `url("${HERO_PLACEHOLDER}")` }}
        className="absolute inset-0 bg-[#6a4a38] bg-cover bg-center"
      >
        <Image
          src="/images/hd/jebel_jais_sunset.jpg"
          alt="A mountain road at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" aria-hidden />
      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-36 sm:px-8 sm:pb-24">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-paper drop-shadow-[0_1px_12px_rgba(0,0,0,0.55)]">A little more room to enjoy the trip</p>
        <h1 className="max-w-[12ch] text-[clamp(3.4rem,10vw,8rem)] leading-[0.9] tracking-[-0.025em] text-paper drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
          Your trip, <em className="font-normal text-sun">in good hands.</em>
        </h1>
        <p className="mt-7 max-w-[42ch] text-xl font-light leading-relaxed text-paper drop-shadow-[0_1px_16px_rgba(0,0,0,0.5)] sm:text-2xl">
          Glide is your personal travel agent: it brings the moving parts together, then helps your plans keep up when the day changes.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="#day"
            className="glide-cta-solid inline-flex min-h-11 items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition-colors"
          >
            Follow the trip
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
