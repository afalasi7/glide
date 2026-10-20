"use client";

import { motion } from "framer-motion";
import { GlideBot } from "@/components/GlideBot";
import { WalletPass, BRAND_LABEL, type WalletBrand } from "./WalletPass";
import { TIMES } from "./data";
import { GlassPanel, GlassTag } from "@/components/ui/glass";

const BRANDS: WalletBrand[] = ["apple", "google", "samsung"];
/** Glide copies the updated reservation's wallet file and sends it to you in the chat. */
export function Wallet() {
  return (
    <section data-say="I copy your new dinner pass and send it to you here." className="relative z-10 overflow-hidden bg-cream py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="glide-motion-entry max-w-[12ch] text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em]"
            >
              Your trip details, <em className="text-violet">within reach.</em>
            </motion.h2>
            <p className="max-w-[50ch] text-xl font-light leading-relaxed text-ink-soft">
              When a booking changes, Glide keeps the updated details and pass close at hand. Here, dinner moves to {TIMES.dinner}, and the new pass is ready in your chat. Add it to Apple, Google or Samsung Wallet.
            </p>
          </div>

          <motion.div
            className="glide-motion-entry"
            initial={{ opacity: 0, x: 65, y: 24 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 115, damping: 22 }}
          >
            <GlassPanel className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <GlideBot size={40} />
                <div className="space-y-3">
                  <p className="glide-wallet-note rounded-[20px] rounded-tl-md bg-paper px-4 py-3 text-base leading-snug text-ink">
                    Dinner at Levant &amp; Nar is now <b>{TIMES.dinner}</b>. Here is the updated pass.
                  </p>
                  <div className="glide-pass-file flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-white px-4 py-3 text-ink">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet text-[11px] font-semibold tracking-wide text-paper">Pass</span>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">Dinner at Levant &amp; Nar</p>
                      <p className="text-xs text-ink-soft">Updated for {TIMES.dinner} · no fee</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2" aria-label="Wallet destinations in the demo">
                    {BRANDS.map((b) => (
                      <li key={b}>
                        <GlassTag className="bg-[#FFFBF3] px-4 py-2 font-semibold tracking-wide text-[#1C1230]" style={{ backgroundColor: "#FFFBF3", color: "#1C1230" }}>{BRAND_LABEL[b]}</GlassTag>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>

        <ul className="mt-20 flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-6">
          {BRANDS.map((b, i) => (
            <motion.li
              key={b}
              style={{ zIndex: i === 1 ? 2 : 1 }}
              initial={{ opacity: 0, x: i === 0 ? -150 : i === 2 ? 150 : 0, y: i === 1 ? 64 : 24, rotate: i === 0 ? -6 : i === 2 ? 6 : 0, scale: 0.94 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 110, damping: 20, delay: i * 0.08 }}
              className="glide-motion-entry"
            >
              <WalletPass brand={b} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
