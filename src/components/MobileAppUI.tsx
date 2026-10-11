"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  UtensilsCrossed,
  Sun,
  Building2,
  Compass,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Car,
  Bell,
  Navigation,
  ArrowRight,
  Zap,
} from "lucide-react";
import { ItineraryStop } from "@/lib/types";
import { VerificationDrawer } from "./VerificationDrawer";

interface MobileAppProps {
  deviceName: string;
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
  onTriggerHeal: () => void;
  isFolded?: boolean;
}

export const MobileAppUI: React.FC<MobileAppProps> = ({
  deviceName,
  stops,
  isHealed,
  isHealing,
  delayMinutes,
  onTriggerHeal,
  isFolded = true,
}) => {
  const [activeTab, setActiveTab] = useState<"itinerary" | "passes" | "map">("itinerary");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case "Sun":
        return <Sun className="h-4 w-4" />;
      case "Building2":
        return <Building2 className="h-4 w-4" />;
      case "UtensilsCrossed":
        return <UtensilsCrossed className="h-4 w-4" />;
      default:
        return <Compass className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#080C16] text-slate-100 select-none overflow-hidden font-sans">
      {/* Verification modal drawer */}
      <VerificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isHealed={isHealed}
      />

      {/* Top Mobile App Header */}
      <div className="relative z-10 px-4 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 font-black text-slate-950 text-xs shadow-md shadow-cyan-500/20">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black tracking-tight text-white">GLIDE</h3>
                <span className="rounded bg-cyan-500/10 px-1 py-0.2 text-[8px] font-bold text-cyan-400 border border-cyan-500/30">
                  SHOCK ABSORBER
                </span>
              </div>
              <p className="text-[9px] text-slate-400">Dubai → Ras Al Khaimah</p>
            </div>
          </div>

          {/* Verification check pill */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95"
          >
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>4 Verifications</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Live Trip Status Pill Banner */}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-800/90 bg-[#0F1626]/80 px-2.5 py-1.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Car className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-300 font-medium">Status:</span>
            {isHealed ? (
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Healed Schedule
              </span>
            ) : delayMinutes > 0 ? (
              <span className="font-bold text-rose-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> +{delayMinutes}m Delay
              </span>
            ) : (
              <span className="font-semibold text-slate-300">On Track</span>
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-400">
            {isHealed ? "0 Forfeits" : delayMinutes >= 45 ? "Sunset at Risk" : "Normal ETA"}
          </div>
        </div>
      </div>

      {/* Main Body Content based on tabs or fold state */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 no-scrollbar">
        {activeTab === "itinerary" && (
          <>
            {/* Autonomous Action Trigger Banner if delayed and not healed */}
            {delayMinutes > 0 && !isHealed && (
              <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-slate-900/60 p-3 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    Itinerary Conflict Detected
                  </span>
                  <span className="text-[10px] font-mono text-rose-400">
                    +{delayMinutes}m DELAY
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Late start breaches the 17:48 Jebel Jais sunset cutoff. Trigger Glide to autonomously heal stops.
                </p>
                <button
                  onClick={onTriggerHeal}
                  disabled={isHealing}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2 text-xs font-bold text-slate-950 shadow-md active:scale-95 transition"
                >
                  {isHealing ? (
                    <>
                      <Zap className="h-3.5 w-3.5 animate-spin" />
                      <span>Healing Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Absorb Shock Autonomously</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Healed Success Card */}
            {isHealed && (
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-cyan-950/20 to-slate-900/60 p-3 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Autonomous Healing Complete
                  </span>
                  <span className="text-[10px] rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-bold">
                    0 Missed Stays
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Jebel Jais moved to Day 2 morning • Dinner table rebooked to 21:15 • Late check-in confirmed.
                </p>
              </div>
            )}

            {/* Itinerary Cards Sequence */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Trip Schedule</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {stops.length} STOPS
                </span>
              </div>

              {stops.map((stop, index) => {
                const isConflict = stop.status === "conflict";
                const isWarning = stop.status === "warning";
                const isHealedStop = stop.status === "healed";

                return (
                  <div
                    key={stop.id}
                    className={`relative rounded-2xl border p-3 transition-all ${
                      isConflict
                        ? "border-rose-500/40 bg-rose-950/20"
                        : isWarning
                        ? "border-amber-500/40 bg-amber-950/20"
                        : isHealedStop
                        ? "border-cyan-500/40 bg-cyan-950/20"
                        : "border-slate-850 bg-[#0F1728]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                            isConflict
                              ? "bg-rose-500/20 text-rose-400"
                              : isHealedStop
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {getIcon(stop.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {stop.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 text-slate-500" />
                            {stop.location}
                          </p>
                        </div>
                      </div>

                      {/* Time Pill */}
                      <div className="text-right">
                        <div
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold ${
                            isConflict
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : isHealedStop
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {stop.currentTime}
                        </div>
                        <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">
                          {stop.tag}
                        </span>
                      </div>
                    </div>

                    {/* Constraint & Buffer Note */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate max-w-[65%]">
                        {stop.constraint.description}
                      </span>
                      <span
                        className={`font-semibold font-mono ${
                          isConflict
                            ? "text-rose-400"
                            : isHealedStop
                            ? "text-emerald-300"
                            : "text-slate-400"
                        }`}
                      >
                        {stop.bufferText}
                      </span>
                    </div>

                    {/* Reservation Pass snippet */}
                    {stop.passDetails && (
                      <div className="mt-2 rounded-xl bg-slate-950/70 p-2 border border-slate-850 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="h-3 w-3 text-cyan-400" />
                          <span className="font-mono text-slate-300">
                            {stop.passDetails.code}
                          </span>
                        </div>
                        <span className="text-cyan-300 font-medium">
                          {stop.passDetails.badge}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "passes" && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-white px-1">
              Synchronized Apple & Google Wallet Passes
            </div>
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/40 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    SEVENROOMS DINING PASS
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Levant & Nar Dinner
                  </h4>
                </div>
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">TIME</span>
                  <span className="font-bold text-emerald-300">
                    {isHealed ? "21:15 Confirmed" : "20:00 Slot"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GUESTS</span>
                  <span className="font-bold text-white">2 Guests • Table #14</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                <span>Ref: #SR-994182-MOD</span>
                <span className="text-emerald-400 font-semibold">Pass Valid</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    HOTEL PMS PASS
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    InterContinental RAK
                  </h4>
                </div>
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400">
                Ocean Terrace Suite • Mobile key pre-authorized for arrival window 18:35 - 20:00.
              </p>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center space-y-2">
              <Navigation className="h-8 w-8 text-cyan-400 mx-auto" />
              <h4 className="text-xs font-bold text-white">Live E311 / E611 Route</h4>
              <p className="text-[10px] text-slate-400">
                Distance: 180 km • Highway speed: 120 km/h • RAK Mountain Ascent bypass active.
              </p>
              <div className="rounded-xl bg-slate-900 p-2.5 text-[10px] font-mono text-cyan-300 text-left">
                Origin: Dubai Marina<br />
                Waypoint: Mina Al Arab RAK<br />
                Next Morning: Jebel Jais Summit (08:30)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === "itinerary" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Itinerary</span>
          </button>
          <button
            onClick={() => setActiveTab("passes")}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === "passes" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Passes</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === "map" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Audits</span>
          </button>
        </div>
      </div>
    </div>
  );
};
