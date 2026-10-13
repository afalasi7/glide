"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Building2,
  UtensilsCrossed,
  Navigation,
  Calendar,
} from "lucide-react";
import { ItineraryStop } from "@/lib/types";

interface TimelineProps {
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
}

export const TimelineView: React.FC<TimelineProps> = ({
  stops,
  isHealed,
}) => {
  const getIcon = (type: ItineraryStop["type"]) => {
    switch (type) {
      case "scenic":
        return <Sun className="h-4 w-4" />;
      case "hotel":
        return <Building2 className="h-4 w-4" />;
      case "dining":
        return <UtensilsCrossed className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-tight text-white">
          Trip Schedule
        </h2>
        <span className="text-xs text-zinc-300 font-medium">
          {stops.length} stops • Real-time status
        </span>
      </div>

      <div className="relative space-y-3 pl-8">
        {/* Continuous route spine line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/15" />

        <AnimatePresence mode="popLayout">
          {stops.map((stop, index) => {
            const isConflict = stop.status === "conflict";
            const isHealedStop = stop.status === "healed";
            const isWarning = stop.status === "warning";
            const isDay2 = stop.day === 2 || stop.currentTime.includes("Day 2");
            const prevStop = stops[index - 1];
            const isFirstDay2 =
              isDay2 &&
              (!prevStop || (!prevStop.day && !prevStop.currentTime.includes("Day 2")));

            return (
              <React.Fragment key={stop.id}>
                {/* Day 2 divider if resequenced */}
                {isFirstDay2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative -left-8 pt-3 pb-1"
                  >
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3.5 py-2 border border-emerald-500/30 text-emerald-300">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Tomorrow Morning • Day 2
                      </span>
                      <span className="ml-auto text-[11px] font-semibold text-emerald-300">
                        Rescheduled for Morning Sunlight
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="relative group"
                >
                  {/* Station Node on Spine */}
                  <div
                    className={`absolute -left-[31px] top-4 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-md transition-colors z-10 ${
                      isConflict
                        ? "border-rose-400 bg-rose-600 text-white"
                        : isHealedStop
                        ? "border-emerald-400 bg-emerald-600 text-white"
                        : isWarning
                        ? "border-amber-400 bg-amber-600 text-white"
                        : "border-white/20 bg-[#1E2538] text-zinc-300"
                    }`}
                  >
                    {getIcon(stop.type)}
                  </div>

                  {/* Clean High-Contrast Card */}
                  <div
                    className={`rounded-2xl border p-4.5 transition-all shadow-md ${
                      isConflict
                        ? "border-rose-500/40 bg-[#201319] hover:border-rose-500/60"
                        : isHealedStop
                        ? "border-emerald-500/40 bg-[#0F2018] hover:border-emerald-500/60"
                        : isWarning
                        ? "border-amber-500/40 bg-[#221B13] hover:border-amber-500/60"
                        : "border-white/10 bg-[#121624] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {stop.title}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                          <span>{stop.location}</span>
                        </p>
                      </div>

                      {/* Time display */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          {stop.currentTime !== stop.originalTime && (
                            <span className="text-xs line-through text-zinc-400 font-mono">
                              {stop.originalTime}
                            </span>
                          )}
                          <span
                            className={`text-sm font-bold font-mono ${
                              isConflict
                                ? "text-rose-300"
                                : isHealedStop
                                ? "text-emerald-300"
                                : isWarning
                                ? "text-amber-300"
                                : "text-white"
                            }`}
                          >
                            {stop.currentTime}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {stop.durationMin > 0 ? `${stop.durationMin} min stop` : "Departure"}
                        </span>
                      </div>
                    </div>

                    {/* Status note line */}
                    {(stop.statusMessage || stop.bufferText) && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {isConflict ? (
                            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          ) : isHealedStop ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                          )}
                          <span
                            className={
                              isConflict
                                ? "text-rose-200 font-medium"
                                : isHealedStop
                                ? "text-emerald-200 font-medium"
                                : isWarning
                                ? "text-amber-200 font-medium"
                                : "text-zinc-300"
                            }
                          >
                            {stop.statusMessage || stop.bufferText}
                          </span>
                        </div>

                        {stop.constraint?.provider && (
                          <span className="text-[11px] font-semibold text-zinc-400">
                            {stop.constraint.provider}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
