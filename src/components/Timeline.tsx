"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Sun,
  Building2,
  UtensilsCrossed,
  Compass,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { ItineraryStop } from "@/lib/types";

interface TimelineViewProps {
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  stops,
  isHealed,
  isHealing,
  delayMinutes,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Sun":
        return <Sun className="h-5 w-5" />;
      case "Building2":
        return <Building2 className="h-5 w-5" />;
      case "UtensilsCrossed":
        return <UtensilsCrossed className="h-5 w-5" />;
      default:
        return <Compass className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: ItineraryStop["status"]) => {
    switch (status) {
      case "conflict":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300 animate-pulse">
            <AlertCircle className="h-3 w-3 text-rose-400" />
            Constraint Broken
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            Buffer Strained
          </span>
        );
      case "healed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Autonomously Healed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Optimal Route
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Section Header with Graph Health Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Trip Graph Sequence
            </h3>
            <span className="text-xs text-slate-400">
              ({stops.length} Nodes Modeled)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time topological evaluation with hard sunset & reservation constraints.
          </p>
        </div>

        {/* Global Health Pill */}
        <div className="flex items-center gap-2">
          {isHealed ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Graph Healed: 100% Reliability
            </div>
          ) : delayMinutes >= 45 ? (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
              Cascading Delay: 2 Violations
            </div>
          ) : delayMinutes > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Schedule Tightened
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Baseline Schedule Stable
            </div>
          )}
        </div>
      </div>

      {/* Timeline Node Cards */}
      <div className="relative pl-6 sm:pl-8 space-y-4">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-slate-700 to-emerald-500 opacity-40" />

        <AnimatePresence mode="popLayout">
          {stops.map((stop, index) => {
            const isConflict = stop.status === "conflict";
            const isWarning = stop.status === "warning";
            const isHealedStop = stop.status === "healed";

            return (
              <motion.div
                key={stop.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
                className="relative group"
              >
                {/* Node circle dot on vertical connector */}
                <div
                  className={`absolute -left-[30px] sm:-left-[38px] top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 z-10 ${
                    isConflict
                      ? "border-rose-500 bg-rose-950 text-rose-400 shadow-lg shadow-rose-900/50"
                      : isWarning
                      ? "border-amber-500 bg-amber-950 text-amber-400 shadow-lg shadow-amber-900/50"
                      : isHealedStop
                      ? "border-cyan-400 bg-slate-950 text-cyan-300 shadow-lg shadow-cyan-900/50 ring-2 ring-cyan-500/20"
                      : "border-slate-700 bg-slate-900 text-slate-400 group-hover:border-cyan-500 group-hover:text-cyan-400"
                  }`}
                >
                  <span className="text-[11px] font-bold font-mono">
                    {index + 1}
                  </span>
                </div>

                {/* Stop Card */}
                <div
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    isConflict
                      ? "border-rose-500/40 bg-gradient-to-br from-[#1c1017] via-[#16121f] to-[#0d1117] shadow-lg shadow-rose-950/20"
                      : isWarning
                      ? "border-amber-500/40 bg-gradient-to-br from-[#1c1810] via-[#16121f] to-[#0d1117]"
                      : isHealedStop
                      ? "border-cyan-500/40 bg-gradient-to-br from-[#0c1c24] via-[#0b1626] to-[#0B0F19] shadow-lg shadow-cyan-950/20"
                      : "border-slate-800 bg-[#0F172A]/70 hover:border-slate-700"
                  }`}
                >
                  {/* Subtle top indicator highlight */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      isConflict
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-500"
                        : isHealedStop
                        ? "bg-gradient-to-r from-cyan-400 to-emerald-400"
                        : "bg-transparent"
                    }`}
                  />

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Left: Time, Title, Tags */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time badge */}
                        <div
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold ${
                            isConflict
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : isHealedStop
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{stop.currentTime}</span>
                          {stop.currentTime !== stop.originalTime && (
                            <span className="line-through text-slate-500 text-[10px] ml-1">
                              {stop.originalTime}
                            </span>
                          )}
                        </div>

                        {/* Tag */}
                        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                          {stop.tag}
                        </span>

                        {/* Rescheduled Pill if moved */}
                        {stop.isRescheduled && (
                          <span className="rounded-md bg-cyan-400/10 border border-cyan-400/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {stop.rescheduledLabel || "Rescheduled"}
                          </span>
                        )}

                        {/* Status Pill */}
                        {getStatusBadge(stop.status)}
                      </div>

                      {/* Main Title & Venue Icon */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            isConflict
                              ? "bg-rose-500/10 text-rose-400"
                              : isHealedStop
                              ? "bg-cyan-500/10 text-cyan-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {getIcon(stop.iconName)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {stop.title}
                          </h4>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {stop.location}
                          </p>
                        </div>
                      </div>

                      {/* Constraint Details & Status explanation */}
                      <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-medium text-slate-400">
                            Constraint:
                          </span>
                          <span
                            className={`font-semibold ${
                              stop.constraint.type === "hard"
                                ? "text-amber-300"
                                : "text-slate-400"
                            }`}
                          >
                            {stop.constraint.description}
                          </span>
                        </div>
                        {stop.constraint.cutoff && (
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>Policy / Window:</span>
                            <span className="font-mono text-slate-300">
                              {stop.constraint.cutoff}
                            </span>
                          </div>
                        )}
                        {stop.statusMessage && (
                          <div
                            className={`pt-1 text-[11px] font-medium ${
                              isConflict
                                ? "text-rose-400"
                                : isWarning
                                ? "text-amber-400"
                                : isHealedStop
                                ? "text-cyan-300"
                                : "text-emerald-400"
                            }`}
                          >
                            {stop.statusMessage}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Live Buffer Pill & Booking Ref / Pass Preview */}
                    <div className="flex flex-col md:items-end justify-between gap-3 md:min-w-[200px]">
                      {/* Buffer Pill */}
                      <div
                        className={`rounded-xl border px-3 py-2 text-right transition-all ${
                          isConflict
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                            : isWarning
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                            : isHealedStop
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-800 bg-slate-900/60 text-slate-300"
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                          Temporal Safety Margin
                        </span>
                        <span className="font-mono text-xs font-bold">
                          {stop.bufferText}
                        </span>
                      </div>

                      {/* Ticket / Reservation Pass Preview if present */}
                      {stop.passDetails && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs space-y-1 w-full">
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span className="flex items-center gap-1 font-mono text-cyan-400">
                              <QrCode className="h-3 w-3" />
                              {stop.passDetails.code}
                            </span>
                            <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[9px] text-cyan-300 font-bold border border-cyan-800/40">
                              LIVE SYNC
                            </span>
                          </div>
                          <div className="font-semibold text-white text-[11px] truncate">
                            {stop.passDetails.badge}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {stop.passDetails.time}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
