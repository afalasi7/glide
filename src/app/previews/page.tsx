"use client";

import React, { useRef } from "react";
import { Phone, Fold, PlanScreen, ChatScreen, RoadScreen } from "@/components/screens/Screens";
import { motion, useScroll, useTransform } from "framer-motion";
import { Header } from "@/components/Header";

function Caption({ name, note }: { name: string; note: string }) {
  return (
    <div className="mt-5 space-y-1">
      <p className="font-display text-2xl italic leading-none">{name}</p>
      <p className="text-sm font-light tracking-wide text-ink-soft">{note}</p>
    </div>
  );
}

export default function PreviewsPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const down = useTransform(scrollYProgress, [0, 1], [-40, 100]);
  const far = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <div className="min-h-screen pb-28">
      <Header active="devices" />

      <main>
        <section data-say="Same plan on every device." className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <h1 className="max-w-[10ch] text-[clamp(3.4rem,9vw,7rem)] leading-[0.9] tracking-[-0.025em]">
              One plan, <em className="text-violet">every screen.</em>
            </h1>
            <p className="max-w-[42ch] text-xl font-light leading-relaxed text-ink-soft">
              The same route, the same corrected dinner time, on a phone, a folding phone and a tablet-sized fold.
            </p>
          </div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
            <Fold left={<PlanScreen />} right={<ChatScreen />} />
            <Caption name="Foldable, unfolded" note="The plan on one side, Glide's chat on the other" />
          </motion.div>
        </section>

        <section ref={ref} className="mx-auto grid max-w-7xl justify-items-center gap-14 px-5 pb-32 sm:px-8 md:grid-cols-3">
          <motion.figure style={{ y: up }}>
            <Phone><PlanScreen /></Phone>
            <Caption name="iPhone" note="The re-planned day in one glance" />
          </motion.figure>
          <motion.figure style={{ y: down }} className="md:mt-24">
            <Phone punch><ChatScreen /></Phone>
            <Caption name="Galaxy" note="Glide sends the new dinner pass in the chat" />
          </motion.figure>
          <motion.figure style={{ y: far }} className="md:mt-10">
            <Phone><RoadScreen /></Phone>
            <Caption name="On the road" note="Arrival time, hotel already told" />
          </motion.figure>
        </section>
      </main>
    </div>
  );
}
