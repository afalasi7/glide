"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { CHAPTERS } from "./data";

/** Pinned scroll story: the winding road draws itself and the chapter photo changes as you scroll. */
export function Day() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setI(Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length)))
  );
  const draw = useTransform(scrollYProgress, [0, 0.96], [0, 1]);
  const c = CHAPTERS[i];

  return (
    <section id="day" ref={ref} className="relative h-[460vh] bg-cream">
      <div className="sticky top-0 grid h-screen items-center gap-6 overflow-hidden px-5 pt-20 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="mx-auto flex h-full w-full max-w-2xl items-center gap-6 sm:gap-10 lg:ml-auto lg:mr-0 lg:max-w-[46rem]">
          {/* The road: a serpentine path with four pins */}
          <svg viewBox="0 0 80 520" className="hidden h-[72vh] shrink-0 sm:block" aria-hidden>
            <path
              id="road"
              d="M40 10 C 8 70, 72 110, 40 170 S 8 270, 40 330 S 72 430, 40 510"
              fill="none"
              stroke="#1C1230"
              strokeOpacity="0.12"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <motion.path
              d="M40 10 C 8 70, 72 110, 40 170 S 8 270, 40 330 S 72 430, 40 510"
              fill="none"
              stroke="#5B3DF5"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ pathLength: draw }}
            />
            {[10, 170, 330, 510].map((y, k) => (
              <circle key={y} cx="40" cy={y} r={k <= i ? 11 : 7} fill={k <= i ? "#FFB400" : "#FFF3DF"} stroke="#1C1230" strokeWidth="2.5" />
            ))}
          </svg>

          <div className="min-w-0 flex-1 space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-ink-soft">
              {i + 1} / {CHAPTERS.length} · {c.place}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
              >
                <p className="num flex items-baseline gap-4 text-[clamp(4.5rem,13vw,10rem)] leading-[0.85]">
                  {c.time}
                  <span className="num text-[0.22em] text-ink/40 line-through decoration-1">{c.was}</span>
                </p>
                <p className="max-w-[34ch] text-2xl font-light leading-snug text-ink sm:text-3xl">{c.problem}</p>
                <p className="max-w-[36ch] text-lg font-normal leading-relaxed text-violet">
                  <span className="font-semibold">Glide: </span>
                  {c.fix}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arch window with the chapter's real photograph */}
        <div className="relative mx-auto h-[46vh] w-full max-w-[420px] lg:h-[74vh]">
          <AnimatePresence initial={false}>
            <motion.div
              key={c.key}
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[28px] shadow-lift"
            >
              <Image src={c.photo} alt={c.place} fill sizes="(min-width:1024px) 420px, 90vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
