"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TICKETS } from "./data";

const STUB = ["bg-violet text-paper", "bg-sun text-ink", "bg-ink text-paper", "bg-coral text-ink"];

/** Each tool call is a boarding-pass strip: notched, perforated, stamped with the real latency. */
export function Moves() {
  return (
    <section data-say="Four calls. Zero from you." className="bg-ink py-28 text-paper sm:py-40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <h2 className="max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
          Four moves. <em className="text-sun">Zero calls.</em>
        </h2>
        <p className="mt-6 max-w-[48ch] text-xl font-light leading-relaxed text-paper/75">
          A deterministic solver decides what is broken and what fixes it. Language models only explain it to you afterwards.
        </p>

        <ul className="mt-16 space-y-5">
          {TICKETS.map((t, i) => (
            <motion.li
              key={t.tool}
              initial={{ opacity: 0, x: i % 2 ? 90 : -90, rotate: i % 2 ? 2.5 : -2.5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              className="relative flex h-40 overflow-hidden rounded-[10px] bg-paper text-ink sm:h-44"
              style={{
                WebkitMask:
                  "radial-gradient(circle 16px at 34% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 34% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat",
                mask:
                  "radial-gradient(circle 16px at 34% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 16px at 34% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat",
              }}
            >
              <div className={`${STUB[i]} relative flex w-[34%] flex-col justify-between overflow-hidden p-5`}>
                <Image src={t.photo} alt="" fill sizes="340px" className="object-cover opacity-30 mix-blend-luminosity" />
                <span className="relative text-xs font-medium uppercase tracking-[0.2em]">Move {i + 1}</span>
                <span className="num relative text-2xl leading-tight sm:text-3xl">{t.result}</span>
              </div>
              <div className="relative flex flex-1 flex-col justify-between border-l-2 border-dashed border-ink/25 p-5 sm:p-7">
                <h3 className="text-3xl leading-none tracking-tight sm:text-4xl">{t.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs font-medium text-ink-soft">
                  <span>{t.tool}</span>
                  <span>200 OK · {t.ms}ms</span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
