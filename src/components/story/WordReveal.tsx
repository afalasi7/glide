"use client";

import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Scroll-driven, word-by-word headline reveal.
 *
 * Source: 21st.dev → `@motiondotdev/motion-scroll-word-reveal` (official Motion examples
 * catalog). Adapted for this repo: `motion/react` → `framer-motion`, and the scroll container
 * is the page (Lenis) rather than a nested one. The reveal maths is theirs, unaltered.
 *
 * Accessibility: each word span is aria-hidden and the heading carries aria-label, so a
 * screen reader reads the sentence once instead of 15 fragments. Reduced motion gets
 * full opacity with no scroll coupling.
 */

const REST_OPACITY = 0.15;
const REVEAL_SPAN = 0.8;
const WORD_WINDOW = 0.2;

function getWordRange(index: number, count: number) {
  const start = count <= 1 ? 0 : (index / (count - 1)) * REVEAL_SPAN;
  return { start, end: Math.min(1, start + WORD_WINDOW) };
}

export function getWordOpacity(progress: number, { start, end }: { start: number; end: number }, rest = REST_OPACITY) {
  if (progress <= start) return rest;
  if (progress >= end) return 1;
  const t = (progress - start) / (end - start);
  return rest + (1 - rest) * t;
}

function Word({
  children,
  progress,
  index,
  count,
  reducedMotion,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reducedMotion: boolean;
}) {
  const range = getWordRange(index, count);
  const opacity = useTransform(progress, (value) => getWordOpacity(value, range));
  return (
    <motion.span aria-hidden="true" style={reducedMotion ? undefined : { opacity }}>
      {children}
    </motion.span>
  );
}

export function WordReveal({ children, className = "" }: { children: string; className?: string }) {
  const targetRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.85", "center 0.45"],
  });
  const words = children.split(" ");

  return (
    <h2
      id="word-reveal-heading"
      ref={targetRef}
      aria-label={children}
      className={`word-reveal ${className}`}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <Word
            progress={scrollYProgress}
            index={index}
            count={words.length}
            reducedMotion={reducedMotion}
          >
            {word}
          </Word>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h2>
  );
}
