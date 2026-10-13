"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  UtensilsCrossed,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  QrCode,
  Smartphone,
} from "lucide-react";

interface DynamicIslandWidgetProps {
  isHealed: boolean;
  walletSynced: boolean;
  onDismiss?: () => void;
}

export const DynamicIslandWidget: React.FC<DynamicIslandWidgetProps> = ({
  isHealed,
  walletSynced,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full px-4 sm:px-0">
      <motion.div
        layout
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-4 text-white shadow-2xl ring-1 ring-white/10"
      >
        {/* Top Mini Pill */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-neutral-900 border border-neutral-700 px-2.5 py-0.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  isHealed ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                }`}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                {isHealed ? "Live Pass Updated" : "Pass Monitor"}
              </span>
            </div>
            <span className="text-[11px] font-medium text-neutral-400">
              Apple Wallet
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              title={expanded ? "Collapse" : "Expand Pass"}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setClosed(true)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Activity Content */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                isHealed
                  ? "bg-emerald-500 text-neutral-950 font-bold"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {isHealed ? (
                <UtensilsCrossed className="h-5 w-5" />
              ) : (
                <Smartphone className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-white">
                {isHealed
                  ? "Dinner pushed to 21:15 • Pass Updated"
                  : "Schedule Monitored • All Passes Ready"}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                {isHealed
                  ? "SevenRooms #SR-994182 confirmed • Key Dispatched"
                  : "Listening for road delays and traffic adjustments"}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isHealed ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                <Check className="h-3 w-3" />
                Synced
              </span>
            ) : (
              <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-[10px] font-mono text-neutral-400">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Expandable simulated Apple Wallet Pass Card */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-neutral-800 text-neutral-900"
            >
              <div className="rounded-2xl bg-white p-4 shadow-md border border-neutral-200 space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-neutral-200">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">
                      SevenRooms Verified Pass
                    </span>
                    <h5 className="font-bold text-neutral-900 text-xs">
                      Levant & Nar • InterContinental RAK
                    </h5>
                  </div>
                  <QrCode className="h-6 w-6 text-neutral-900" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">
                      SEATING TIME
                    </span>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      {isHealed ? "21:15" : "20:00"}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      {isHealed ? "Autonomously Modified" : "Original Slot"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">
                      TABLE & PARTY
                    </span>
                    <span className="font-bold text-neutral-900 text-xs">
                      Table #14 • 2 Guests
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Outdoor Terrace
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>REF: SR-994182-MOD</span>
                  <span className="text-emerald-700 font-bold">
                    DIGITAL PASS ACTIVE
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
