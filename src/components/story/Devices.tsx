"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function Devices() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const b = useTransform(scrollYProgress, [0, 1], [-30, 60]);
  const c = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <section ref={ref} data-say="Same plan, every screen." className="overflow-hidden bg-paper py-28 sm:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-7">
          <h2 className="text-[clamp(3rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.02em]">
            One plan, <em className="text-coral">every screen.</em>
          </h2>
          <p className="max-w-[44ch] text-xl font-light leading-relaxed text-ink-soft">
            Phone, folding phone, tablet. The new schedule lands on all of them at once.
          </p>
          <Link href="/previews" className="btn inline-block rounded-full bg-ink px-9 py-4 text-base font-medium tracking-wide text-paper shadow-lift">
            Browse the devices
          </Link>
        </div>

        <div className="relative mx-auto grid h-[560px] w-full max-w-[560px] grid-cols-6 items-center">
          <motion.div style={{ y: a }} className="relative col-span-3 col-start-1 aspect-[9/16] overflow-hidden rounded-[6px] shadow-lift">
            <Image src="/renders/airbnb_route_bw_iphone_1791740518135.jpg" alt="Glide itinerary on an iPhone" fill sizes="300px" className="object-cover" />
          </motion.div>
          <motion.div style={{ y: b }} className="relative z-10 col-span-3 col-start-3 -ml-6 aspect-square overflow-hidden rounded-[6px] shadow-lift">
            <Image src="/renders/z_fold_8_ultra_clean_unfolded.jpg" alt="Glide route map on an unfolded foldable" fill sizes="300px" className="object-cover" />
          </motion.div>
          <motion.div style={{ y: c }} className="relative col-span-2 col-start-5 -mt-24 aspect-[9/16] overflow-hidden rounded-[6px] shadow-lift max-sm:hidden">
            <Image src="/renders/s26_ultra_flat.jpg" alt="Glide itinerary on a Galaxy phone" fill sizes="200px" className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
