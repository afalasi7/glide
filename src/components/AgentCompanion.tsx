"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GlideBot, type BotMood } from "@/components/GlideBot";

/** Sections announce what the agent should say via `data-say`; the story can also dispatch a "glide:say" event. */
export function AgentCompanion() {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const [hop, setHop] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const [happy, setHappy] = useState(false);
  const [clearOfCodes, setClearOfCodes] = useState(false);

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/how-it-works") return;
    let frame = 0;
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // The corner the bubble occupies when it is pinned bottom-right.
      const zoneLeft = Math.max(0, vw - 380);
      const zoneTop = vh - 176;
      let hit = false;
      document.querySelectorAll("svg[aria-label^='Code']").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.left < vw - 8 && r.right > zoneLeft && r.top < vh - 8 && r.bottom > zoneTop) hit = true;
      });
      setClearOfCodes((prev) => (prev === hit ? prev : hit));
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

  const mood: BotMood = happy ? "happy" : scrolling ? "working" : "idle";

  const onFinale = text.startsWith("Your plans are in place");
  const place = clearOfCodes
    ? "top-[5.25rem]"
    : onFinale
      ? "bottom-[5.5rem] opacity-90 sm:bottom-28"
      : "bottom-3 sm:bottom-5";

  return (
    <div className={`pointer-events-none fixed right-4 z-40 flex w-max max-w-[calc(100vw-3rem)] items-end gap-2 sm:right-8 ${place}`}>
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="glide-glass glass-control relative mb-6 min-w-0 max-w-[min(15.5rem,calc(100vw-7rem))] rounded-[22px] rounded-br-md bg-card px-4 py-3 text-sm font-medium leading-snug break-words text-ink sm:text-[15px]"
            aria-live="polite"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
      <GlideBot size={onFinale ? 64 : 84} mood={mood} hop={hop} className="shrink-0 drop-shadow-lg" />
    </div>
  );
}
