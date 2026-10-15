"use client";

import React, { useRef } from "react";
import { Phone, Fold, PlanScreen, ChatScreen } from "@/components/screens/Screens";
import { WelcomeScreen, ConnectScreen, AgentScreen, RouteScreen } from "@/components/screens/Onboarding";
import { motion, useScroll, useTransform } from "framer-motion";
import { Header } from "@/components/Header";

function Caption({ name, note }: { name: string; note: string }) {
  return (
    <div className="mt-5 space-y-1">
      <p className="font-display text-2xl italic leading-none">{name}</p>
      <p className="text-sm font-light tracking-wide opacity-70">{note}</p>
    </div>
  );
}

export default function PreviewsPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const down = useTransform(scrollYProgress, [0, 1], [-40, 100]);

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section data-say="It starts with onboarding." className="bg-violet text-paper">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <h1 className="max-w-[10ch] text-[clamp(3.4rem,9vw,7rem)] leading-[0.9] tracking-[-0.025em]">
                One plan, <em className="text-sun">every screen.</em>
              </h1>
              <p className="max-w-[42ch] text-xl font-light leading-relaxed text-paper/80">
                Onboarding first: allow Google Calendar access, import your trip date, tap Start. Then Glide shows you where to go.
              </p>
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
              <Fold left={<ConnectScreen />} right={<AgentScreen />} />
              <div className="mt-5 space-y-1">
                <p className="font-display text-2xl italic leading-none">Foldable, unfolded</p>
                <p className="text-sm font-light tracking-wide text-paper/70">Calendar access on one side, the agent on the other</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-sun text-ink">
          <div className="mx-auto grid max-w-7xl justify-items-center gap-14 px-5 py-28 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["1 · Welcome", "Meet Glide", <WelcomeScreen key="a" />],
              ["2 · Calendar access", "Google Calendar imports the date", <ConnectScreen key="b" />],
              ["3 · Agent", "Say Start and it begins", <AgentScreen key="c" />],
              ["4 · Where to go", "The route, in order", <RouteScreen key="d" />],
            ].map(([n, note, screen], i) => (
              <figure key={n as string} className={i % 2 ? "xl:mt-16" : ""}>
                <Phone punch={i % 2 === 1}>{screen as React.ReactNode}</Phone>
                <Caption name={n as string} note={note as string} />
              </figure>
            ))}
          </div>
        </section>

        <section ref={ref} className="bg-ink text-paper">
          <div className="mx-auto grid max-w-7xl justify-items-center gap-14 px-5 py-28 sm:px-8 md:grid-cols-2">
            <motion.figure style={{ y: up }}>
              <Phone><PlanScreen /></Phone>
              <Caption name="When you run late" note="The re-planned day in one glance" />
            </motion.figure>
            <motion.figure style={{ y: down }} className="md:mt-24">
              <Phone punch><ChatScreen /></Phone>
              <Caption name="In the chat" note="Glide sends the new dinner pass" />
            </motion.figure>
          </div>
        </section>
      </main>
    </div>
  );
}
