"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GlideBot, type BotMood } from "@/components/GlideBot";

/** Sections announce what the agent should say via `data-say`; the story can also dispatch a "glide:say" event. */
export function AgentCompanion() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [hop, setHop] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const [happy, setHappy] = useState(false);
  const [roadOnScreen, setRoadOnScreen] = useState(false);
  const [passOnScreen, setPassOnScreen] = useState(false);

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/how-it-works") return;
    let frame = 0;
    const measure = () => {
      const road = document.querySelector(".glide-day-road");
      const roadBox = road?.getBoundingClientRect();
      const roadVisible = !!roadBox && roadBox.width > 2 && roadBox.bottom > 72 && roadBox.top < window.innerHeight - 24;
      let pass = false;
      document.querySelectorAll("svg[aria-label^='Code']").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth) pass = true;
      });
      setRoadOnScreen((prev) => (prev === roadVisible ? prev : roadVisible));
      setPassOnScreen((prev) => (prev === pass ? prev : pass));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/how-it-works") return;

    const say = (t: string) => {
      setText((prev) => {
        if (prev !== t) {
          setHop((h) => h + 1);
          setHappy(true);
          setTimeout(() => setHappy(false), 1400);
        }
        return t;
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const t = (e.target as HTMLElement).dataset.say;
          if (e.isIntersecting && t) say(t);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    const nodes = document.querySelectorAll<HTMLElement>("[data-say]");
    nodes.forEach((el) => io.observe(el));
    // Speak as soon as the opening section is on screen, without waiting for a scroll.
    const opener = nodes[0]?.dataset.say;
    if (opener) say(opener);

    const onSay = (e: Event) => say((e as CustomEvent<string>).detail);
    window.addEventListener("glide:say", onSay);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("glide:say", onSay);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [pathname]);

  if (pathname !== "/" && pathname !== "/how-it-works") return null;
  // One mascot at a time. Below 640px the float stays off. On larger screens it fades
  // instead of vanishing when the road or a pass code is in view.
  const tucked = roadOnScreen || passOnScreen;

  const mood: BotMood = happy ? "happy" : scrolling ? "working" : "idle";

  const onFinale = text.startsWith("Your plans are in place");
  const place = onFinale ? "bottom-[5.5rem] opacity-90 sm:bottom-28" : "bottom-3 sm:bottom-5";

  return (
    <motion.div
      aria-hidden={tucked}
      animate={{ opacity: tucked ? 0 : 1 }}
      transition={{ duration: reduce ? 0 : 0.28, ease: [0.23, 1, 0.32, 1] }}
      className={`pointer-events-none fixed right-4 z-40 hidden w-max max-w-[calc(100vw-3rem)] items-end gap-2 sm:right-8 sm:flex ${place}`}
    >
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8 }}
            transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glide-glass glass-control relative mb-6 min-w-0 max-w-[min(15.5rem,calc(100vw-7rem))] rounded-[22px] rounded-br-md bg-card px-4 py-3 text-sm font-medium leading-snug break-words text-ink sm:text-[15px]"
            aria-live="polite"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
      <GlideBot size={onFinale ? 64 : 84} mood={mood} hop={hop} className="shrink-0 drop-shadow-lg" />
    </motion.div>
  );
}
