"use client";

import React from "react";
import { MobileAppUI } from "./MobileAppUI";
import { FoldableDeviceFrame } from "./FoldableDeviceFrame";
import { ItineraryStop } from "@/lib/types";

interface DeviceGridProps {
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
  onTriggerHeal: () => void;
}

export const DeviceGrid: React.FC<DeviceGridProps> = ({
  stops,
  isHealed,
  isHealing,
  delayMinutes,
  onTriggerHeal,
}) => {
  return (
    <div className="space-y-8">
      {/* Section Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-cyan-950/60 bg-gradient-to-r from-slate-900/90 to-[#0F162A]/90 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Realistic Hardware Dimensions & Foldable Mechanics
            </h3>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
              1:1 ASPECT PROPORTIONS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact specs: iPhone 18 Pro Max (6.9" 163.4 x 78mm), Galaxy S26 Ultra (6.9" 163.6 x 78.1mm boxy frame),
            Galaxy Z Fold 8 Ultra (158.4 x 72.8mm tall folded), and iPhone Duo (passport form factor 123.9 x 81.9mm folded, wider 4:3 unfolded).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Glass UI • Zero Code</span>
        </div>
      </div>

      {/* Row 1: Traditional Flagships (iPhone 18 Pro Max & Samsung S26 Ultra) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-items-center">
        {/* Device 1: iPhone 18 Pro Max */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-2 text-center">
            <h4 className="text-sm font-bold text-white">iPhone 18 Pro Max</h4>
            <p className="text-[11px] text-slate-400">
              6.9" Display • 163.4 x 78.0 x 8.75 mm • Dynamic Island Island Pro
            </p>
          </div>
          {/* Scaled frame: height 680px, width 328px */}
          <div className="relative h-[680px] w-[328px] overflow-hidden rounded-[54px] border-[10px] border-slate-900 bg-black shadow-2xl shadow-cyan-950/30 ring-1 ring-white/10 flex flex-col">
            {/* Dynamic Island pill */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-5 w-28 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-between px-2.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            </div>
            <MobileAppUI
              deviceName="iPhone 18 Pro Max"
              stops={stops}
              isHealed={isHealed}
              isHealing={isHealing}
              delayMinutes={delayMinutes}
              onTriggerHeal={onTriggerHeal}
            />
          </div>
        </div>

        {/* Device 2: Samsung Galaxy S26 Ultra */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-2 text-center">
            <h4 className="text-sm font-bold text-white">Samsung Galaxy S26 Ultra</h4>
            <p className="text-[11px] text-slate-400">
              6.9" Display • 163.6 x 78.1 x 7.9 mm • Boxy Sharp Corners
            </p>
          </div>
          {/* Scaled frame: height 680px, width 328px with sharp rectangular corners */}
          <div className="relative h-[680px] w-[328px] overflow-hidden rounded-[20px] border-[10px] border-slate-900 bg-black shadow-2xl shadow-cyan-950/30 ring-1 ring-white/10 flex flex-col">
            {/* Centered Infinity-O Camera */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-3.5 w-3.5 rounded-full bg-black ring-1 ring-slate-800" />
            <MobileAppUI
              deviceName="Samsung S26 Ultra"
              stops={stops}
              isHealed={isHealed}
              isHealing={isHealing}
              delayMinutes={delayMinutes}
              onTriggerHeal={onTriggerHeal}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Foldable Devices with Exact Mechanics */}
      <div className="pt-6 border-t border-slate-800/80 space-y-12">
        {/* Device 3: Samsung Galaxy Z Fold 8 Ultra */}
        <FoldableDeviceFrame
          deviceType="zfold8"
          stops={stops}
          isHealed={isHealed}
          isHealing={isHealing}
          delayMinutes={delayMinutes}
          onTriggerHeal={onTriggerHeal}
        />

        {/* Device 4: iPhone Duo (Apple Foldable Passport Design) */}
        <FoldableDeviceFrame
          deviceType="iphoneduo"
          stops={stops}
          isHealed={isHealed}
          isHealing={isHealing}
          delayMinutes={delayMinutes}
          onTriggerHeal={onTriggerHeal}
        />
      </div>
    </div>
  );
};
