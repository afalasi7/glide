"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CHAPTERS } from "./data";

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * The three stops the hero ticket shows, and how each is signed.
 * `note` carries the chronology — without it the rescheduled morning stop reads as a bug,
 * because it sorts after the evening departure.
 */
const STOPS = [
  { key: "depart", note: "Depart", day: "", chip: "bg-violet" },
  { key: "jais", note: "Rescheduled", day: "Day 2", chip: "bg-sun" },
  { key: "dinner", note: "Dinner", day: "", chip: "bg-mint" },
] as const;

/**
 * Hero diagram — the whole trip as one boarding pass.
 *
 * DESIGN.md's "ticket strip" vocabulary: side notches, dashed perforation, mono times,
 * a torn-off status stub. Not a rounded card with a shadow — an artifact you could tear.
 *
 * Every time on it is the solver's own output (see ./data), so nothing here is invented.
 */
export function HeroTicket() {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.25 }}
      className="hero-ticket relative w-full max-w-[440px] text-ink"
      aria-label="Sample trip: Dubai Marina, then Jebel Jais the next morning, then dinner in Ras Al Khaimah"
    >
      <div
        className="relative overflow-hidden rounded-[10px] border border-ink/15 bg-paper"
        style={{
          /* Two side notches punched out at the tear line. Real perforation, not a dashed border. */
          WebkitMask:
            "radial-gradient(circle 12px at 0 79%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 12px at 100% 79%, #0000 98%, #000) right / 51% 100% no-repeat",
          mask: "radial-gradient(circle 12px at 0 79%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 12px at 100% 79%, #0000 98%, #000) right / 51% 100% no-repeat",
        }}
      >
        {/* Mono is reserved for tool names and references (DESIGN.md). */}
        <div className="flex items-baseline justify-between gap-3 border-b border-ink/15 px-5 pb-3 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Glide / trip 001
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Fri 13 Nov
          </span>
        </div>

        <div className="px-5 pb-5 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Dubai&nbsp;&rarr;&nbsp;Ras Al Khaimah
          </p>

          <ol className="relative mt-4">
            {/* The road the stops sit on. */}
            <span
              aria-hidden
              className="absolute left-[6px] top-[14px] bottom-[18px] w-px bg-ink/15"
            />
            {STOPS.map((stop, i) => {
              const chapter = CHAPTERS.find((c) => c.key === stop.key)!;
              return (
                <motion.li
                  key={stop.key}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, ease, delay: 0.5 + i * 0.12 }}
                  className="relative flex items-baseline gap-4 py-2.5 pl-6"
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-[15px] h-[13px] w-[13px] rounded-full border-[3px] border-paper ${stop.chip}`}
                    style={{ boxShadow: "0 0 0 1px rgba(28,18,48,0.18)" }}
                  />
                  <span className="num shrink-0 text-[26px] leading-none">
                    {chapter.time}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight">
                      {chapter.place}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                      {stop.day && (
                        <span className="rounded-full bg-ink/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
                          {stop.day}
                        </span>
                      )}
                      <span>{stop.note}</span>
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Dashed tear line between body and stub. */}
        <div aria-hidden className="border-t-2 border-dashed border-ink/25" />

        {/* The stub: torn off, inverted, carrying the summary. */}
        <div className="flex items-baseline justify-between gap-3 bg-ink px-5 py-3.5 text-paper">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/80">
            3 stops · timing connected
          </span>
          <span className="num text-[15px] text-sun">+75 min</span>
        </div>
      </div>
    </motion.figure>
  );
}
