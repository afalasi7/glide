"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TICKETS } from "./data";

const STUB = ["bg-violet text-paper", "bg-sun text-ink", "bg-ink text-paper"];

/** Each tool call is a boarding-pass strip: notched, perforated, stamped with the real latency. */
export function Moves() {
  return (
    <section data-say="I coordinate your itinerary, reservations and hotel together." className="relative z-20 overflow-x-clip bg-cream py-28 text-ink sm:py-40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="glide-motion-entry max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]"
        >
          A personal agent. <em className="text-violet">Every detail in sync.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="glide-motion-entry mt-6 max-w-[48ch] text-xl font-light leading-relaxed text-ink-soft"
        >
          Glide keeps your itinerary, reservations and hotel plans coordinated. When the day changes, it works through the updates while you stay focused on the trip.
        </motion.p>

        <ul className="mt-16 space-y-5">
          {TICKETS.map((t, i) => (
            <motion.li
              key={t.tool}
              initial={{ opacity: 0, x: i % 2 ? 140 : -140, rotate: i % 2 ? 4 : -4, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ type: "spring", stiffness: 105, damping: 20, delay: i * 0.06 }}
              className="glide-motion-entry glide-ticket relative flex h-40 overflow-hidden rounded-[10px] border border-ink/15 bg-card text-ink sm:h-44"
              style={{
                WebkitMask:
                  "radial-gradient(circle 16px at 34% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 34% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat",
                mask:
                  "radial-gradient(circle 16px at 34% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 34% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat",
              }}
            >
              <div className={`${STUB[i]} relative flex w-[34%] flex-col justify-between overflow-hidden p-5`}>
                <Image src={t.photo} alt="" fill sizes="340px" className="object-cover opacity-30 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" aria-hidden />
                <span className="relative text-xs font-medium uppercase tracking-[0.2em] text-current drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">Move {i + 1}</span>
                <span className="num relative text-2xl leading-tight text-current drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)] sm:text-3xl">{t.result}</span>
              </div>
              <div className="relative flex flex-1 flex-col justify-center border-l-2 border-dashed border-ink/25 p-5 sm:p-7">
                <h3 className="text-3xl leading-none tracking-tight sm:text-4xl">{t.title}</h3>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
