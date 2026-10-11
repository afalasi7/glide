"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  Compass,
  Building2,
  UtensilsCrossed,
  Sun,
  Maximize2,
  Minimize2,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ItineraryStop } from "@/lib/types";
import { VERIFICATION_LINKS } from "@/lib/verifications";

interface FoldableDeviceFrameProps {
  deviceType: "zfold8" | "iphoneduo";
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
  onTriggerHeal: () => void;
}

export const FoldableDeviceFrame: React.FC<FoldableDeviceFrameProps> = ({
  deviceType,
  stops,
  isHealed,
  isHealing,
  delayMinutes,
  onTriggerHeal,
}) => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [showVerifications, setShowVerifications] = useState(false);

  const isZFold = deviceType === "zfold8";
  const title = isZFold ? "Samsung Galaxy Z Fold 8 Ultra" : "iPhone Duo (Apple Foldable)";
  const subtitle = isZFold
    ? "Tall Folded (158.4 x 72.8 mm) → 8.0\" Canvas (158.4 x 145.6 mm)"
    : "Passport Folded (123.9 x 81.9 mm) → 7.6\" Canvas (123.9 x 161.4 mm, 4:3)";

  // Exact scaled dimensions
  // 1 mm = 4.2 px scale factor
  // S26 Ultra / iPhone 18 PM = ~163mm (~680px height x ~330px width)
  // Z Fold 8 Ultra Folded = 158.4mm x 72.8mm => height ~660px, width ~305px (tall & narrow)
  // Z Fold 8 Ultra Unfolded = 158.4mm x 145.6mm => height ~660px, width ~610px (large inner 8.0" screen)
  // iPhone Duo Folded (Passport) = 123.9mm x 81.9mm => height ~520px, width ~345px (shorter, passport-like wider aspect ratio)
  // iPhone Duo Unfolded (Passport) = 123.9mm x 161.4mm => height ~520px, width ~678px (wider passport booklet / mini tablet)
  const foldedWidth = isZFold ? 305 : 345;
  const foldedHeight = isZFold ? 660 : 520;
  const unfoldedWidth = isZFold ? 610 : 678;
  const unfoldedHeight = isZFold ? 660 : 520;

  const currentWidth = isUnfolded ? unfoldedWidth : foldedWidth;
  const currentHeight = isUnfolded ? unfoldedHeight : foldedHeight;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Device Header Bar */}
      <div className="flex items-center justify-between w-full max-w-2xl mb-3 px-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                isZFold
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {isUnfolded ? "UNFOLDED TABLET MODE" : "FOLDED COVER MODE"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Unfold/Fold Toggle Button */}
        <button
          onClick={() => setIsUnfolded(!isUnfolded)}
          className="flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-200 hover:text-white hover:border-cyan-400 transition active:scale-95 shadow-lg shadow-cyan-950/40"
        >
          {isUnfolded ? (
            <>
              <Minimize2 className="h-4 w-4 text-cyan-400" />
              <span>Fold Device</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 text-cyan-400" />
              <span>Unfold Device</span>
            </>
          )}
        </button>
      </div>

      {/* Realistic Hardware Bezel Frame */}
      <div
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1), height 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`relative overflow-hidden bg-slate-950 shadow-2xl shadow-cyan-950/40 ring-1 ring-white/10 flex flex-col ${
          isZFold
            ? "rounded-[34px] border-[10px] border-slate-900"
            : "rounded-[44px] border-[10px] border-[#1e2330]"
        }`}
      >
        {/* Device specific top camera or dynamic island */}
        {isZFold ? (
          // Samsung punch-hole camera
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 h-3 w-3 rounded-full bg-black ring-1 ring-slate-800" />
        ) : (
          // Apple Passport Dynamic Island
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 h-4 w-24 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-between px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
        )}

        {/* Center fold crease line when unfolded */}
        {isUnfolded && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent z-30 pointer-events-none" />
        )}

        {/* Screen Content UI */}
        <div className="relative flex-1 flex flex-col bg-[#070B14] text-slate-100 select-none overflow-hidden font-sans">
          {/* Top Status Bar */}
          <div className="px-4 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 font-black text-slate-950 text-xs">
                G
              </div>
              <span className="text-xs font-black tracking-tight text-white">GLIDE</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-mono text-cyan-300 border border-cyan-500/30">
                {isUnfolded ? "TABLET HUD" : "COVER HUD"}
              </span>
            </div>

            {/* Verifications Button */}
            <button
              onClick={() => setShowVerifications(!showVerifications)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[9px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>4 Verifications</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {/* Verification Dropdown Sheet */}
          {showVerifications && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Autonomous Verification Links
                </span>
                <button
                  onClick={() => setShowVerifications(false)}
                  className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {VERIFICATION_LINKS.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-slate-850 bg-slate-900/80 p-2.5 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-[11px]">{link.linkTitle}</span>
                      <span className="text-emerald-400 font-mono text-[9px] font-bold">VERIFIED 200 OK</span>
                    </div>
                    <p className="text-[10px] text-slate-300">{link.actionSummary}</p>
                    <div className="text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800 flex justify-between">
                      <span>Ref: {link.referenceId}</span>
                      <span>Auth: {link.secureToken}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Unfolded Dual-Screen View */}
          {isUnfolded ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Screen Pane: Route Radar & Health */}
              <div className="w-1/2 border-r border-slate-800/80 p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#090E1A] to-[#060913] overflow-y-auto no-scrollbar">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-[#0F1626]/80 p-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                      <span>Sheikh Mohammed Bin Zayed Rd (E311)</span>
                      <span className="text-cyan-400 font-mono">180 KM</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Direct coastal routing via Mina Al Arab.
                    </p>
                  </div>

                  {/* Health Score */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Resilience Index</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {isHealed ? "100% HEALED" : "RECOVERY READY"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isHealed ? "bg-emerald-400 w-full" : "bg-cyan-400 w-3/4"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Topological DAG Solver</span>
                      <span>0 Forfeited Tables</span>
                    </div>
                  </div>
                </div>

                {/* Trigger Button */}
                <div className="pt-2">
                  <button
                    onClick={onTriggerHeal}
                    disabled={isHealing || isHealed}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isHealed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isHealed ? "Schedule Fully Protected" : "Trigger Autonomous Heal"}</span>
                  </button>
                </div>
              </div>

              {/* Right Screen Pane: Resequenced Itinerary Schedule */}
              <div className="w-1/2 p-3.5 flex flex-col overflow-y-auto no-scrollbar space-y-2">
                <div className="flex items-center justify-between pb-1 text-xs font-bold text-slate-300">
                  <span>Itinerary Stops</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {isHealed ? "DAG Healed" : "+75m Delta"}
                  </span>
                </div>

                {stops.map((stop) => {
                  const isConflict = stop.status === "conflict";
                  const isHealedStop = stop.status === "healed";
                  return (
                    <div
                      key={stop.id}
                      className={`rounded-xl border p-2 text-xs transition ${
                        isConflict
                          ? "border-rose-500/40 bg-rose-950/20"
                          : isHealedStop
                          ? "border-cyan-500/40 bg-cyan-950/20"
                          : "border-slate-850 bg-slate-900/60"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-[11px] truncate">
                          {stop.title}
                        </span>
                        <span className="font-mono text-[10px] text-cyan-300 font-bold">
                          {stop.currentTime}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                        <span className="truncate max-w-[60%]">{stop.constraint.description}</span>
                        <span className="font-mono text-emerald-300">{stop.bufferText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Folded Cover Screen View */
            <div className="flex-1 flex flex-col p-3 overflow-y-auto no-scrollbar space-y-2.5">
              <div className="rounded-xl border border-slate-800 bg-[#0F1626]/80 p-2.5 text-xs flex justify-between items-center">
                <span className="text-slate-300 font-medium text-[11px]">Cover Schedule</span>
                <span className="font-mono text-cyan-400 text-[10px]">
                  {isHealed ? "Healed" : `+${delayMinutes}m`}
                </span>
              </div>

              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className="rounded-xl border border-slate-850 bg-slate-900/60 p-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-[11px] truncate">
                      {stop.title}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-300">
                      {stop.currentTime}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                    {stop.bufferText}
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <button
                  onClick={() => setIsUnfolded(true)}
                  className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-400 hover:bg-slate-850 transition"
                >
                  Tap to Unfold Tablet Mode →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
