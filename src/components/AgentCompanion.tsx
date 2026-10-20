"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setScrolling(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("glide:say", onSay);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer.current);
    };
  }, [pathname]);

  if (pathname !== "/" && pathname !== "/how-it-works") return null;

  const mood: BotMood = happy ? "happy" : scrolling ? "working" : "idle";

  const onFinale = text.startsWith("Your plans are in place");

  return (
    <div
      className={`pointer-events-none fixed right-3 z-40 hidden items-end gap-2 transition-[bottom,opacity] duration-300 sm:right-5 sm:flex ${
        onFinale ? "bottom-[5.5rem] opacity-90 sm:bottom-28" : "bottom-3 sm:bottom-5"
      }`}
    >
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="glide-glass glass-control relative mb-6 max-w-[190px] rounded-[22px] rounded-br-md bg-card px-4 py-3 text-sm font-medium leading-snug text-ink sm:max-w-[250px] sm:text-[15px]"
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
