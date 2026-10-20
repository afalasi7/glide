"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { BotArt } from "@/components/GlideBot";
import { CHAPTERS } from "./data";

const SAY = [
  "I've connected your route, hotel and dinner into one trip plan. I'll keep an eye on how it all fits.",
  "A 75-minute delay changes the sunset stop. I'm finding a better fit for your trip.",
  "You'd miss sunset. Moving Jebel Jais to tomorrow morning.",
  "Telling the hotel. Your room key is on your phone.",
  "Re-booking dinner for 21:15. No fee.",
];

const ROAD_PATH = "M40 24 C 6 70, 74 110, 40 148 S 6 220, 40 268 S 74 340, 40 388 S 6 450, 40 492";
const ROAD_STOPS = [24, 148, 268, 388, 492];
const LAST_STOP = ROAD_STOPS.length - 1;
const CHAPTER_COUNT = CHAPTERS.length;
const BOT_SCALE = 0.5;
const BOT_CX = 60 * BOT_SCALE;
const BOT_CHIN_Y = 110 * BOT_SCALE;

function chapterFromScroll(v: number) {
  return Math.min(CHAPTER_COUNT - 1, Math.floor(Math.max(0, Math.min(0.9999, v)) * CHAPTER_COUNT));
}

/** Pinned scroll story: the winding road draws itself; clocks and arch photos change with each chapter. */
export function Day() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const tip = useSpring(scrollYProgress, reduce ? { stiffness: 1000, damping: 100 } : { stiffness: 120, damping: 28, mass: 0.35 });
  const [i, setI] = useState(0);
  const c = CHAPTERS[i];

  const pathRef = useRef<SVGPathElement>(null);
  const [stops, setStops] = useState(ROAD_STOPS.map((y) => ({ x: 40, y })));
  const tipX = useMotionValue(40);
  const tipY = useMotionValue(24);
  const botX = useMotionValue(40 - BOT_CX);
  const botY = useMotionValue(24 - BOT_CHIN_Y);

  const placeOnRoad = useCallback((v: number) => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    if (!length) return;
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, v)) * length);
    tipX.set(pt.x);
    tipY.set(pt.y);
    botX.set(pt.x - BOT_CX);
    botY.set(pt.y - BOT_CHIN_Y);
  }, [tipX, tipY, botX, botY]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    if (!length) return;
    setStops(
      ROAD_STOPS.map((_, k) => {
        const pt = path.getPointAtLength((k / LAST_STOP) * length);
        return { x: pt.x, y: pt.y };
      })
    );
    placeOnRoad(tip.get());
  }, [tip, placeOnRoad]);

  useMotionValueEvent(tip, "change", placeOnRoad);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setI((prev) => {
      const next = chapterFromScroll(v);
      return prev === next ? prev : next;
    });
  });

  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) window.dispatchEvent(new CustomEvent("glide:say", { detail: SAY[i] }));
  }, [inView, i]);

  return (
    <section id="day" ref={ref} className="relative z-0 h-[340vh] scroll-mt-28 isolate overflow-x-clip bg-cream">
      <div className="sticky top-0 z-0 flex h-screen items-center overflow-hidden bg-cream px-4 pt-20 pb-6 sm:px-8 sm:pb-8 lg:pt-24">
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          <div className="mx-auto flex w-full max-w-3xl items-start gap-3 sm:gap-8 lg:ml-auto lg:mr-0 lg:max-w-none lg:gap-10">
            {/* Road + mascot on every breakpoint — slim on mobile, tall on desktop. */}
            <svg
              viewBox="-28 0 130 520"
              className="h-[min(38vh,320px)] w-[52px] shrink-0 overflow-visible sm:h-[min(42vh,400px)] sm:w-[88px] lg:h-[min(72vh,640px)]"
              aria-hidden
            >
              <path ref={pathRef} d={ROAD_PATH} fill="none" stroke="transparent" strokeWidth="7" />
              <path d={ROAD_PATH} fill="none" stroke="var(--foreground)" opacity="0.12" strokeWidth="7" strokeLinecap="round" />
              <motion.path
                d={ROAD_PATH}
                fill="none"
                stroke="var(--violet)"
                strokeWidth="7"
                strokeLinecap="round"
                style={{ pathLength: tip }}
              />
              {stops.map((stop, k) => (
                <circle
                  key={ROAD_STOPS[k]}
                  cx={stop.x}
                  cy={stop.y}
                  r={k <= i ? 12 : 7.5}
                  fill={k <= i ? "var(--sun)" : "var(--cream)"}
                  stroke="var(--foreground)"
                  strokeWidth="2.5"
                />
              ))}
              <motion.circle cx={tipX} cy={tipY} r="7" fill="var(--violet)" />
              <motion.g style={{ x: botX, y: botY }}>
                <g transform={`scale(${BOT_SCALE})`}>
                  <BotArt mood={i >= 3 ? "happy" : "working"} small embedded />
                </g>
              </motion.g>
            </svg>

            <div className="min-w-0 flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-soft sm:text-sm sm:tracking-[0.24em] md:text-base">
                {i + 1} / {CHAPTERS.length} · {c.place}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={c.key}
                  initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? undefined : { opacity: 0, y: -18, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-4 sm:space-y-6 lg:space-y-8"
                >
                  <p className="num flex items-baseline gap-3 text-[clamp(3.5rem,15vw,9.5rem)] leading-[0.8] tracking-[-0.03em] text-ink sm:gap-5">
                    {c.time}
                    {c.was && (
                      <span className="num text-[0.18em] font-medium text-ink-soft line-through decoration-1 decoration-ink/35">
                        {c.was}
                      </span>
                    )}
                  </p>
                  <p className="max-w-[18ch] text-[clamp(1.5rem,6.2vw,3.6rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink">
                    {c.problem}
                  </p>
                  <p className="max-w-[34ch] text-base leading-relaxed text-violet sm:text-xl lg:text-[1.65rem]">
                    <span className="font-semibold">Glide: </span>
                    {c.fix}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative mx-auto h-[min(20vh,160px)] w-full max-w-[360px] self-center overflow-hidden rounded-t-[999px] rounded-b-[40px] shadow-lift sm:h-[min(26vh,240px)] sm:max-w-[460px] lg:mx-0 lg:h-[min(84vh,800px)] lg:max-w-[580px] lg:justify-self-end">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={c.key}
                initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={c.photo}
                  alt={c.place}
                  fill
                  sizes="(min-width:1024px) 560px, 85vw"
                  className="object-cover object-[50%_28%]"
                  priority={i === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
