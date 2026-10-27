"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * Bubble geometry, colours, timestamps, date pill and composer follow WhatsApp's own iOS
 * conventions, measured from the real screens on Mobbin (iOS · Chat Detail and Chat Bot):
 *
 *   sent      #DCF8C6   received #FFFFFF      (dark: #005C4B / #202C33)
 *   radius    10px, one square corner on the tail side
 *   stamp     12px #8696A0, bottom-right, inside the bubble
 *   receipts  #53BDEB double tick, sent only
 *   date pill 4px radius, #E7E7E7, 12px uppercase #8696A0
 *   composer  64px, white, 16px-radius field, #25D366 send circle
 *
 * The conversation itself is the original copy from the screenshot this replaces.
 * Glide's own identity stops at the header — the chat chrome is WhatsApp's, not ours.
 */
type Msg = { from: "user" | "bot"; text: string; at: string; day?: boolean; date?: string };

const THREAD: Msg[] = [
  { from: "user", text: "Glide, plan my Riyadh work trip.", at: "4:37 PM", day: true, date: "Yesterday" },
  { from: "bot", text: "Happy to help.", at: "4:37 PM" },
  { from: "bot", text: "What dates work?", at: "4:37 PM" },
  { from: "user", text: "13–16 Nov. Two travelers.", at: "9:00 AM", day: true, date: "Today" },
  { from: "bot", text: "I can compare flights, hotel and transfers.", at: "9:01 AM" },
  { from: "user", text: "Keep it under AED 5,000.", at: "9:03 AM" },
  { from: "bot", text: "I’ll stay within that budget.", at: "9:14 AM" },
  { from: "bot", text: "I’ll show each option and total price for approval.", at: "9:15 AM" },
];

/** Read receipt: blue double tick, sent bubbles only (Mobbin: #53BDEB). */
function Receipt() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-label="Read" className="inline-block shrink-0">
      <path d="M1 6.2 3.6 9 9 2.4" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 6.4 8.8 9.2 14.4 2.6" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatThread() {
  const reduce = useReducedMotion();

  return (
    <figure
      className="wa-thread mx-auto w-full max-w-[360px] overflow-hidden rounded-[14px] border border-ink/15 text-ink"
      aria-label="Example conversation: planning a business trip to Riyadh in a fixed budget"
    >
      {/* Header — 64px, white, hairline bottom rule, 24px back arrow, 32px avatar,
          name 17/700 + sub 13, call/video icons right (Mobbin: iOS · Chat Detail). */}
      <header className="flex h-16 items-center gap-3 border-b border-[#E7E7E7] bg-white px-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <path d="M15 5l-7 7 7 7" stroke="#000" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream">
          <GlideBot size={26} />
        </span>
        <div className="min-w-0 flex-1 leading-none">
          <p className="truncate text-[17px] font-bold leading-none text-black">Glide</p>
          <p className="mt-1 truncate text-[13px] leading-none text-[#8696A0]">online</p>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <rect x="2.5" y="6.5" width="13" height="11" rx="2.5" stroke="#000" strokeWidth="1.7" />
          <path d="M16.5 11l4-2.6v7.2l-4-2.6z" stroke="#000" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <path
            d="M6.2 3.8h2.9l1.5 3.7-1.9 1.3a11 11 0 0 0 5.3 5.3l1.3-1.9 3.7 1.5v2.9a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 6a2 2 0 0 1 2-2.2z"
            stroke="#000"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </header>

      {/* Wallpaper: WhatsApp's warm base. No invented doodles. */}
      <div className="wa-wallpaper space-y-1.5 px-3 py-3.5">
        {THREAD.map((m, i) => (
          <React.Fragment key={i}>
            {m.day && (
              <div className="flex justify-center py-2.5">
                <span className="rounded-[4px] bg-[#E7E7E7] px-2 py-0.5 text-[12px] font-medium uppercase text-[#8696A0]">
                  {m.date}
                </span>
              </div>
            )}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, ease, delay: (i % 4) * 0.07 }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.from === "user" ? (
                /* Sent: square top-right tail corner, 10px elsewhere. */
                <p className="max-w-[82%] rounded-[10px] rounded-tr-none bg-[#DCF8C6] px-2 py-1 pr-2 text-[15px] leading-[1.3] text-[#111B21]">
                  {m.text}
                  <span className="float-right ml-2 mt-2 inline-flex translate-y-[3px] items-center gap-1 whitespace-nowrap text-[11px] leading-none text-[#8696A0]">
                    {m.at}
                    <Receipt />
                  </span>
                </p>
              ) : (
                /* Received: square top-left tail corner. Timestamp floats bottom-right,
                   the same anchor WhatsApp uses for both directions. */
                <p className="max-w-[82%] rounded-[10px] rounded-tl-none bg-white px-2 py-1 pr-2 text-[15px] leading-[1.3] text-[#111B21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                  {m.text}
                  <span className="float-right ml-2 mt-2 inline-block translate-y-[3px] whitespace-nowrap text-[11px] leading-none text-[#8696A0]">
                    {m.at}
                  </span>
                </p>
              )}
            </motion.div>
          </React.Fragment>
        ))}
      </div>

      {/* Composer: 64px, white, hairline top rule, 16px-radius field, #25D366 send circle. */}
      <div className="flex h-16 items-center gap-2 border-t border-[#E7E7E7] bg-white px-3">
        <div className="flex h-9 flex-1 items-center rounded-[16px] border border-[#E7E7E7] px-4 text-[16px] text-[#8696A0]">
          Message
        </div>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366] text-white"
        >
          {/* Paper plane — WhatsApp's send glyph, not a generic arrow. */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.05 21 23 12 2.05 3 2 10l15 2-15 2z" />
          </svg>
        </span>
      </div>

      {/* The honest bit, kept from the original screenshot. */}
      <p className="border-t border-[#E7E7E7] bg-white px-4 py-2.5 text-[11px] leading-relaxed text-[#8696A0]">
        Glide travel chat preview. Live WhatsApp service is not connected yet.
      </p>
    </figure>
  );
}
