"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimationControls, useMotionValue, useSpring, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

export type BotMood = "idle" | "working" | "happy";

interface ArtProps {
  mood?: BotMood;
  /** Pupil offsets in svg units, each within about ±6. */
  px?: MotionValue<number>;
  py?: MotionValue<number>;
  blink?: boolean;
  /** Bigger pupils with a highlight so they read at nav size. */
  small?: boolean;
  /** Nested inside another SVG (e.g. Day road) — fixed user units, not % sizing. */
  embedded?: boolean;
}

function Pupil({ cx, cy, radius, px, py, blink = false, small }: ArtProps & { cx: number; cy: number; radius: number }) {
  const highlightX = useTransform(() => (px?.get() ?? 0) - 3.5);
  const highlightY = useTransform(() => (py?.get() ?? 0) - 3.5);
  // Keep the compact brand mark readable throughout the animation cycle.
  if (small) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={radius} fill="#1C1230" />
        <circle cx={cx - 3.5} cy={cy - 3.5} r={3.4} fill="#fff" />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Native SVG coordinates keep pupils visible in WebKit as well as Chromium. */}
      <motion.ellipse cx={px ?? 0} cy={py ?? 0} rx={radius} ry={radius} fill="#1C1230" animate={{ ry: blink ? 1 : radius }} initial={false} transition={{ duration: 0.08 }} />
      <motion.circle cx={highlightX} cy={highlightY} r={2.8} fill="#fff" opacity={blink ? 0 : 1} />
    </g>
  );
}

/** Glide's road-marked mascot, drawn in SVG for every screen size. */
export function BotArt({ mood = "idle", px, py, blink = false, small = false, embedded = false }: ArtProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 124"
      width={embedded ? 120 : undefined}
      height={embedded ? 124 : undefined}
      role="img"
      aria-label="Glide, your trip agent"
      className={embedded ? "overflow-visible" : "h-full w-full overflow-visible"}
      style={{ colorScheme: "only light" }}
    >
      <defs>
        <clipPath id={`body-${uid}`}>
          <rect x="12" y="24" width="96" height="86" rx="36" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="118" rx="34" ry="5" fill="#1C1230" opacity="0.16" />

      {/* antenna */}
      <line x1="60" y1="24" x2="60" y2="9" stroke="#6B7078" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="7" r="6" fill="#FFB400" stroke="#1C1230" strokeWidth="2.5" />

      {/* body: asphalt grey with road marks */}
      <rect x="12" y="24" width="96" height="86" rx="36" fill="#9CA3AB" />
      <g clipPath={`url(#body-${uid})`}>
        <rect x="0" y="82" width="120" height="40" fill="#868D96" />
        <path d="M-4 100 C 30 84, 62 108, 124 78" fill="none" stroke="#FFB400" strokeWidth="4.5" strokeDasharray="9 7" strokeLinecap="round" />
        <path d="M-4 114 C 36 100, 70 120, 124 98" fill="none" stroke="#FFFBF3" strokeWidth="2.5" strokeDasharray="3 8" strokeLinecap="round" opacity="0.9" />
        {[[24, 40], [96, 44], [30, 70], [92, 70], [102, 90], [18, 90]].map(([cx, cy]) => (
          <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.8" fill="#7A818A" />
        ))}
        <rect x="12" y="24" width="96" height="86" rx="36" fill="none" stroke="#1C1230" strokeWidth="3" />
      </g>

      {/* googly eyes (different sizes, loose pupils) */}
      <g>
        <circle cx="42" cy="54" r="17" fill="#fff" stroke="#1C1230" strokeWidth="3" />
        <Pupil cx={42} cy={54} radius={small ? 11.5 : 10.5} px={px} py={py} blink={blink} small={small} />
      </g>
      <g>
        <circle cx="80" cy="50" r="20" fill="#fff" stroke="#1C1230" strokeWidth="3" />
        <Pupil cx={80} cy={50} radius={small ? 12.5 : 11.5} px={px} py={py} blink={blink} small={small} />
      </g>

      {/* mouth */}
      {mood === "happy" ? (
        <g>
          <path d="M40 80 Q61 106 82 80 Z" fill="#1C1230" stroke="#1C1230" strokeWidth="3" strokeLinejoin="round" />
          <path d="M52 91 Q61 98 70 91 Q61 86 52 91 Z" fill="#FF5A36" />
        </g>
      ) : mood === "working" ? (
        <ellipse cx="61" cy="86" rx="7" ry="6" fill="#1C1230" />
      ) : (
        <path d="M42 82 Q61 98 80 82" fill="none" stroke="#1C1230" strokeWidth="4.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

interface BotProps {
  size?: number;
  mood?: BotMood;
  /** Increment to make the bot hop. */
  hop?: number;
  className?: string;
}

/** Interactive agent: eyes follow the pointer with googly jiggle, it blinks, bobs, wiggles when working and hops on demand. */
export function GlideBot({ size = 96, mood = "idle", hop = 0, className = "" }: BotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const px = useSpring(tx, { stiffness: 260, damping: 9, mass: 0.8 });
  const py = useSpring(ty, { stiffness: 260, damping: 9, mass: 0.8 });
  const [blink, setBlink] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(d / 160, 1) * (size < 56 ? 3 : 6);
      tx.set((dx / d) * k);
      ty.set((dy / d) * k);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [tx, ty, size]);

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, 2200 + Math.random() * 3200);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    if (!hop || reduce) return;
    controls.start({
      y: [0, -26, 0, -6, 0],
      scaleY: [1, 1.1, 0.88, 1.03, 1],
      scaleX: [1, 0.94, 1.1, 0.99, 1],
      transition: { duration: 0.65, ease: "easeOut" },
    });
  }, [hop, controls, reduce]);

  const sway =
    reduce
      ? {}
      : mood === "working"
      ? { rotate: [-9, 9], transition: { duration: 0.3, repeat: Infinity, repeatType: "mirror" as const } }
      : { rotate: [-2.5, 2.5], y: [0, -3], transition: { duration: 2.6, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const } };

  return (
    <div ref={ref} className={className} style={{ width: size, height: size * 1.03 }}>
      <motion.div animate={controls} style={{ transformOrigin: "50% 90%" }} className="h-full w-full">
        <motion.div animate={sway} style={{ transformOrigin: "50% 90%" }} className="h-full w-full">
          <BotArt mood={mood} px={px} py={py} blink={blink} small={size < 56} />
        </motion.div>
      </motion.div>
    </div>
  );
}
