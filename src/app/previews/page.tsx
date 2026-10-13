"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Header } from "@/components/Header";

const SHOTS = {
  fold: { src: "/renders/z_fold_8_ultra_clean_unfolded.jpg", alt: "Glide route map on an unfolded Galaxy Z Fold 8 Ultra", w: 1024, h: 1024 },
  iphone: { src: "/renders/airbnb_route_bw_iphone_1791740518135.jpg", alt: "Glide stops list on an iPhone", w: 768, h: 1376 },
  galaxy: { src: "/renders/s26_ultra_flat.jpg", alt: "Glide itinerary on a Galaxy S26 Ultra", w: 768, h: 1376 },
  folded: { src: "/renders/zfold8_flat_folded.jpg", alt: "Glide route overview on a folded Z Fold 8", w: 768, h: 1376 },
  duo: { src: "/renders/iphoneduo_flat_unfolded.jpg", alt: "Glide schedule and terrain map on an unfolded iPhone Duo", w: 1200, h: 896 },
  desk: { src: "/renders/samsung_s26_ultra.jpg", alt: "Glide itinerary on a Galaxy S26 Ultra on a wooden desk", w: 768, h: 1376 },
};

function Shot({ shot, y, className = "" }: { shot: (typeof SHOTS)[keyof typeof SHOTS]; y?: MotionValue<number>; className?: string }) {
  return (
    <motion.div style={{ y }} className={`overflow-hidden rounded-[6px] shadow-lift ${className}`}>
      <Image src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} sizes="(min-width:1024px) 40vw, 90vw" className="h-auto w-full" />
    </motion.div>
  );
}

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
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <h1 className="max-w-[10ch] text-[clamp(3.4rem,9vw,7rem)] leading-[0.9] tracking-[-0.025em]">
              One plan, <em className="text-violet">every screen.</em>
            </h1>
            <p className="max-w-[42ch] text-xl font-light leading-relaxed text-ink-soft">
              The same route, the same corrected dinner time, on a phone, a folding phone and a tablet-sized fold.
            </p>
          </div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}>
            <Shot shot={SHOTS.fold} />
            <Caption name="Galaxy Z Fold 8 Ultra" note="Unfolded · route map beside the day's stops" />
          </motion.div>
        </section>

        <section ref={ref} className="mx-auto grid max-w-7xl gap-10 px-5 pb-32 sm:px-8 md:grid-cols-3">
          <motion.figure style={{ y: up }}>
            <Shot shot={SHOTS.iphone} />
            <Caption name="iPhone" note="Stops, ratings and timings in one glance" />
          </motion.figure>
          <motion.figure style={{ y: down }} className="md:mt-24">
            <Shot shot={SHOTS.galaxy} />
            <Caption name="Galaxy S26 Ultra" note="Today's itinerary, dark and quiet" />
          </motion.figure>
          <motion.figure style={{ y: far }} className="md:mt-10">
            <Shot shot={SHOTS.folded} />
            <Caption name="Galaxy Z Fold 8, folded" note="Route overview on the cover screen" />
          </motion.figure>
        </section>

        <section className="mx-auto grid max-w-7xl items-end gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
          <figure>
            <Shot shot={SHOTS.duo} />
            <Caption name="iPhone Duo" note="Unfolded · schedule beside a terrain map" />
          </figure>
          <figure>
            <Shot shot={SHOTS.desk} />
            <Caption name="On the desk" note="Galaxy S26 Ultra · the morning of the trip" />
          </figure>
        </section>
      </main>
    </div>
  );
}
