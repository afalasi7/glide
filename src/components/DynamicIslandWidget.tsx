"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Key,
  CalendarCheck,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  CreditCard,
  QrCode,
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
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full">
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#090D16]/95 p-4 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl ring-1 ring-white/10"
      >
        {/* Top bar with mini Dynamic Island pill */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* Dynamic island pill representation */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                {isHealed ? "Pass Synchronized" : "Glide Pass Monitor"}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Apple Wallet & Island
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              title={expanded ? "Collapse" : "Expand Details"}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setClosed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic content */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                isHealed
                  ? "bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {isHealed ? (
                <UtensilsCrossed className="h-5 w-5" />
              ) : (
                <Smartphone className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {isHealed
                    ? "Glide Active • Dinner pushed to 21:15"
                    : "Glide Active • Schedule Protected"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {isHealed
                  ? "Wallet Pass & Key Updated • SevenRooms Ref #SR-994182"
                  : "Continuous telemetry listening for road delays"}
              </p>
            </div>
          </div>

          {/* Sync indicator pill */}
          <div className="shrink-0">
            {isHealed ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                <Check className="h-3 w-3" />
                Synced
              </span>
            ) : (
              <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-400">
                Standby
              </span>
            )}
          </div>
        </div>

        {/* Expandable details showing simulated Wallet Ticket Card */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs"
            >
              <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-3 border border-slate-800">
                <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Boarding & Dining Pass
                    </span>
                    <h5 className="font-bold text-white text-xs">
                      Levant & Nar • InterContinental RAK
                    </h5>
                  </div>
                  <QrCode className="h-5 w-5 text-slate-300" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      SEATING TIME
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      {isHealed ? "21:15 (Modified)" : "20:00 (Original)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      HOTEL KEY STATUS
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {isHealed ? "Late Arrival (20:00 ETA)" : "Standard Check-in"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Pass ID: PKPass-DXB-994182</span>
                  <span className="text-emerald-400 font-semibold">
                    Live Broadcast Active
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
