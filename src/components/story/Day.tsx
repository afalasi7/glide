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
  const botRef = useRef<SVGGElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<{ l: number; t: number; r: number; b: number }[]>([]);
  const [stops, setStops] = useState(ROAD_STOPS.map((y) => ({ x: 40, y })));
  const tipX = useMotionValue(40);
  const tipY = useMotionValue(24);

  const measureBlocks = useCallback(() => {
    const sticky = stickyRef.current;
    const copy = copyRef.current;
    if (!sticky || !copy) return;
    const root = sticky.getBoundingClientRect();
    const blocks: { l: number; t: number; r: number; b: number }[] = [];
    const add = (rect: DOMRect, pad: number) => {
      if (rect.width < 2 || rect.height < 2) return;
      blocks.push({
        l: rect.left - root.left - pad,
        t: rect.top - root.top - pad,
        r: rect.right - root.left + pad,
        b: rect.bottom - root.top + pad,
      });
    };
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) add(rect, 8);
      }
      node = walker.nextNode();
    }
    sticky.querySelectorAll(".glide-day-stop").forEach((el) => add(el.getBoundingClientRect(), 6));
    if (photoRef.current) add(photoRef.current.getBoundingClientRect(), 8);
    blocksRef.current = blocks;
  }, []);

  const placeBubble = useCallback(() => {
    const sticky = stickyRef.current;
    const bubble = bubbleRef.current;
    const art = botRef.current?.querySelector("svg");
    if (!sticky || !bubble || !art) return;
    const root = sticky.getBoundingClientRect();
    const bot = art.getBoundingClientRect();
    const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? root.top + 84;
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    const minTop = Math.max(8, headerBottom - root.top + 6);
    const maxTop = Math.max(minTop, root.height - bh - 8);
    const maxLeft = Math.max(8, root.width - bw - 8);
    const mascot = {
      l: bot.left - root.left - 4,
      t: bot.top - root.top - 4,
      r: bot.right - root.left + 4,
      b: bot.bottom - root.top + 4,
    };
    const blocked = (l: number, t: number) => {
      const r = l + bw;
      const b = t + bh;
      if (r > mascot.l && l < mascot.r && b > mascot.t && t < mascot.b) return true;
      return blocksRef.current.some((box) => r > box.l && l < box.r && b > box.t && t < box.b);
    };
    const preferL = bot.right - root.left + 10;
    const preferT = bot.top - root.top + 2;
    let pos: { l: number; t: number } | null = null;
    const attempt = (l: number, t: number) => {
      if (pos || l < 8 || t < minTop || l > maxLeft || t > maxTop || blocked(l, t)) return;
      pos = { l, t };
    };
    attempt(preferL, preferT);
    const reach = Math.max(maxTop - preferT, preferT - minTop);
    for (let step = 8; step <= reach && !pos; step += 8) {
      attempt(preferL, preferT + step);
      attempt(preferL, preferT - step);
    }
    if (!pos) {
      let floor = minTop;
      for (const box of blocksRef.current) {
        if (preferL < box.r && preferL + bw > box.l) floor = Math.max(floor, box.b + 2);
      }
      const l = Math.max(8, Math.min(preferL, maxLeft));
      const t = Math.max(minTop, Math.min(floor, maxTop));
      pos = { l, t };
    }
    bubble.style.transform = `translate(${Math.round(pos.l)}px, ${Math.round(pos.t)}px)`;
  }, []);

  const placeOnRoad = useCallback((v: number) => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    if (!length) return;
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, v)) * length);
    tipX.set(pt.x);
    tipY.set(pt.y);
    // User units, not CSS pixels, so the body stays on the stroke when the viewBox is scaled.
    botRef.current?.setAttribute(
      "transform",
      `translate(${pt.x - BOT_CX} ${pt.y - BOT_CHIN_Y}) scale(${BOT_SCALE})`,
    );
    placeBubble();
  }, [tipX, tipY, placeBubble]);

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
    measureBlocks();
    placeOnRoad(tip.get());
    placeBubble();
  }, [i, tip, placeOnRoad, placeBubble, measureBlocks]);

  useEffect(() => {
    const settle = () => {
      measureBlocks();
      placeBubble();
    };
    const id = window.setTimeout(settle, 480);
    window.addEventListener("resize", settle);
    const bubble = bubbleRef.current;
    const observer = bubble ? new ResizeObserver(settle) : null;
    if (bubble) observer?.observe(bubble);
    document.fonts?.ready.then(settle);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", settle);
      observer?.disconnect();
    };
  }, [i, measureBlocks, placeBubble]);

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
      <div ref={stickyRef} className="sticky top-0 z-0 flex h-screen items-start overflow-hidden bg-cream px-4 pt-24 pb-3 sm:items-center sm:px-8 sm:pt-20 sm:pb-8 lg:pt-24">
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          <div className="mx-auto flex w-full max-w-3xl items-start gap-3 sm:gap-8 lg:ml-auto lg:mr-0 lg:max-w-none lg:gap-10">
            {/* Road + mascot on every breakpoint — slim on mobile, tall on desktop.
                The phone frame scales this svg; mascot x/y stay the owner's values. */}
            <div className="glide-day-road-frame sm:contents">
            <svg
              viewBox="-28 0 130 520"
              className="glide-day-road h-[min(38vh,320px)] w-[52px] shrink-0 overflow-visible sm:h-[min(42vh,400px)] sm:w-[88px] lg:h-[min(72vh,640px)]"
              aria-hidden
            >
              <path ref={pathRef} d={ROAD_PATH} fill="none" stroke="transparent" strokeWidth="7" />
              <path className="glide-day-track" d={ROAD_PATH} fill="none" stroke="var(--foreground)" opacity="0.12" strokeWidth="7" strokeLinecap="round" />
              <motion.path
                className="glide-day-line"
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
                  className="glide-day-stop"
                  cx={stop.x}
                  cy={stop.y}
                  r={k <= i ? 12 : 7.5}
                  fill={k <= i ? "var(--sun)" : "var(--cream)"}
                  stroke="var(--foreground)"
                  strokeWidth="2.5"
                />
              ))}
              <motion.circle cx={tipX} cy={tipY} r="7" fill="var(--violet)" />
              <g ref={botRef}>
                <BotArt mood={i >= 3 ? "happy" : "working"} small embedded />
              </g>
            </svg>
            </div>

            <div ref={copyRef} data-day-copy className="min-w-0 flex-1 space-y-4 sm:space-y-6 lg:space-y-8">
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

          <div ref={photoRef} className="relative mx-auto h-[min(22svh,180px)] w-full max-w-[360px] self-center overflow-hidden rounded-t-[999px] rounded-b-[40px] shadow-lift sm:h-[min(26vh,240px)] sm:max-w-[460px] lg:mx-0 lg:h-[min(84vh,800px)] lg:max-w-[580px] lg:justify-self-end">
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
        <p
          ref={bubbleRef}
          data-road-say
          className="pointer-events-none absolute top-0 left-0 z-20 max-w-[min(15rem,calc(100vw-2rem))] rounded-2xl rounded-bl-md bg-paper px-3 py-2 text-[13px] font-medium leading-snug text-ink shadow-lift sm:text-sm"
          aria-live="polite"
        >
          {SAY[i]}
        </p>
      </div>
    </section>
  );
}
