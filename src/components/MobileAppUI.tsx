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
  Car,
  Navigation,
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
    <div className="relative flex h-full w-full flex-col bg-[#F8F9FA] text-neutral-900 select-none overflow-hidden font-sans">
      {/* Verification modal drawer */}
      <VerificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isHealed={isHealed}
      />

      {/* Top Mobile App Header */}
      <div className="relative z-10 px-4 pt-10 pb-3 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 font-bold text-white text-xs">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold tracking-tight text-neutral-900">Glide</h3>
                <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[9px] font-semibold text-neutral-600">
                  Live Guard
                </span>
              </div>
              <p className="text-[10px] text-neutral-500">Dubai → Ras Al Khaimah</p>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-200 transition active:scale-95"
          >
            <ShieldCheck className="h-3 w-3 text-neutral-800" />
            <span>4 Audits</span>
          </button>
        </div>

        {/* Live Trip Status Pill Banner */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Car className="h-3 w-3 text-neutral-600" />
            <span className="text-neutral-500 font-medium">Status:</span>
            {isHealed ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Healed Schedule
              </span>
            ) : delayMinutes > 0 ? (
              <span className="font-bold text-red-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-600" /> +{delayMinutes}m Delay
              </span>
            ) : (
              <span className="font-semibold text-neutral-800">On Track</span>
            )}
          </div>

          <div className="text-[10px] font-mono text-neutral-500">
            {isHealed ? "0 Forfeits" : delayMinutes >= 45 ? "Sunset at Risk" : "Normal ETA"}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 no-scrollbar">
        {activeTab === "itinerary" && (
          <>
            {/* Delay Conflict Banner */}
            {delayMinutes > 0 && !isHealed && (
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    Conflict Detected
                  </span>
                  <span className="text-[10px] font-mono font-bold text-red-700">
                    +{delayMinutes}m DELAY
                  </span>
                </div>
                <p className="text-[11px] text-neutral-700 leading-snug">
                  Sunset at Jebel Jais (17:48) will be missed by 42m.
                </p>
                <button
                  onClick={onTriggerHeal}
                  disabled={isHealing}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-2 text-xs font-bold text-white active:scale-95 transition"
                >
                  {isHealing ? (
                    <>
                      <Zap className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Healing Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                      <span>Absorb Shock Autonomously</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Healed Card */}
            {isHealed && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Autonomous Healing Complete
                  </span>
                  <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5">
                    0 Missed Stays
                  </span>
                </div>
                <p className="text-[11px] text-neutral-700">
                  Jebel Jais moved to Day 2 morning • Dinner rebooked to 21:15 • Late check-in confirmed.
                </p>
              </div>
            )}

            {/* Stops list */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                <span>Trip Schedule</span>
                <span className="font-mono text-neutral-700">{stops.length} STOPS</span>
              </div>

              {stops.map((stop) => {
                const isConflict = stop.status === "conflict";
                const isWarning = stop.status === "warning";
                const isHealedStop = stop.status === "healed";

                return (
                  <div
                    key={stop.id}
                    className={`rounded-2xl border p-3 bg-white shadow-sm transition ${
                      isConflict
                        ? "border-red-300 ring-1 ring-red-100"
                        : isWarning
                        ? "border-amber-300 ring-1 ring-amber-100"
                        : isHealedStop
                        ? "border-emerald-300 ring-1 ring-emerald-100"
                        : "border-neutral-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            isConflict
                              ? "bg-red-100 text-red-700"
                              : isHealedStop
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {getIcon(stop.iconName)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900">
                            {stop.title}
                          </div>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 text-neutral-400" />
                            {stop.location}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${
                            isConflict
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isHealedStop
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          {stop.currentTime}
                        </div>
                        <span className="text-[9px] text-neutral-400 block mt-0.5 font-medium">
                          {stop.tag}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                      <span className="text-neutral-500 truncate max-w-[65%]">
                        {stop.constraint.description}
                      </span>
                      <span
                        className={`font-semibold font-mono ${
                          isConflict
                            ? "text-red-700"
                            : isHealedStop
                            ? "text-emerald-700"
                            : "text-neutral-600"
                        }`}
                      >
                        {stop.bufferText}
                      </span>
                    </div>

                    {stop.passDetails && (
                      <div className="mt-2 rounded-xl bg-neutral-50 p-2 border border-neutral-200 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="h-3 w-3 text-neutral-700" />
                          <span className="font-mono text-neutral-700 font-bold">
                            {stop.passDetails.code}
                          </span>
                        </div>
                        <span className="text-neutral-800 font-semibold">
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
            <div className="text-xs font-bold text-neutral-900 px-1">
              Synchronized Apple Wallet Passes
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono font-bold">
                    SEVENROOMS DINING PASS
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">
                    Levant & Nar Dinner
                  </h4>
                </div>
                <QrCode className="h-7 w-7 text-neutral-900" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">TIME</span>
                  <span className="font-bold text-neutral-900">
                    {isHealed ? "21:15 Confirmed" : "20:00 Slot"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-medium">GUESTS</span>
                  <span className="font-bold text-neutral-900">2 Guests • Table #14</span>
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 border-t border-neutral-100 pt-2 flex justify-between">
                <span>Ref: #SR-994182-MOD</span>
                <span className="text-emerald-700 font-bold">Pass Active</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center space-y-2 shadow-sm">
              <Navigation className="h-6 w-6 text-neutral-900 mx-auto" />
              <h4 className="text-xs font-bold text-neutral-900">E311 Highway Route</h4>
              <p className="text-[10px] text-neutral-500">
                Dubai Marina → Ras Al Khaimah (180 km)
              </p>
              <div className="rounded-xl bg-neutral-50 p-2.5 text-[10px] font-mono text-neutral-700 text-left border border-neutral-200">
                Origin: Dubai Marina (16:15)<br />
                Stop 2: InterContinental RAK (18:35)<br />
                Stop 3: Levant & Nar Dinner (21:15)<br />
                Day 2: Jebel Jais Summit (08:30)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-neutral-200 bg-white px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === "itinerary" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Itinerary</span>
          </button>
          <button
            onClick={() => setActiveTab("passes")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === "passes" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Passes</span>
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
              activeTab === "map" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Audits</span>
          </button>
        </div>
      </div>
    </div>
  );
};
