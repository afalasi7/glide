"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Smartphone,
  Tablet,
  Ruler,
  Layers,
  Eye,
} from "lucide-react";
import { MobileAppUI } from "./MobileAppUI";
import { FoldableDeviceFrame } from "./FoldableDeviceFrame";
import { ItineraryStop } from "@/lib/types";

interface RealisticDeviceGalleryProps {
  stops: ItineraryStop[];
  isHealed: boolean;
  isHealing: boolean;
  delayMinutes: number;
  onTriggerHeal: () => void;
}

export const RealisticDeviceGallery: React.FC<RealisticDeviceGalleryProps> = ({
  stops,
  isHealed,
  isHealing,
  delayMinutes,
  onTriggerHeal,
}) => {
  const [activeTab, setActiveTab] = useState<"interactive" | "studio">("interactive");

  return (
    <div className="space-y-8">
      {/* Header bar with Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-cyan-950/60 bg-gradient-to-r from-slate-900/90 via-[#0E1528] to-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hardware Laboratory & Precise Device Specs
            </h3>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
              4 OFFICIAL HARDWARE PROFILES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact physical millimeter specs and display ratios. Foldables feature dual-aspect ratios and interactive unfold toggles.
          </p>
        </div>

        {/* Tab switcher: Interactive Frames vs Photorealistic Studio Renders */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("interactive")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === "interactive"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Interactive Bezels</span>
          </button>
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === "studio"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Photorealistic 8K Renders</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Bezels */}
      {activeTab === "interactive" && (
        <div className="space-y-12">
          {/* Row 1: Normal Smartphones */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Standard Flagship Devices (Exact 6.9" Proportions)
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-items-center">
              {/* iPhone 18 Pro Max */}
              <div className="flex flex-col items-center w-full">
                <div className="mb-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-sm text-white">iPhone 18 Pro Max</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      163.4 x 78.0 x 8.75 mm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    6.9" Super Retina XDR OLED • Rounded Titanium Frame • Dynamic Island
                  </p>
                </div>

                <div className="relative h-[680px] w-[326px] overflow-hidden rounded-[54px] border-[10px] border-slate-900 bg-black shadow-2xl shadow-cyan-950/30 ring-1 ring-white/10 flex flex-col">
                  {/* Dynamic Island cutout */}
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

              {/* Samsung Galaxy S26 Ultra */}
              <div className="flex flex-col items-center w-full">
                <div className="mb-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-sm text-white">Samsung Galaxy S26 Ultra</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      163.6 x 78.1 x 7.9 mm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    6.9" Dynamic AMOLED 2X • Boxy Titanium Sharp Angles • Infinity-O Hole Punch
                  </p>
                </div>

                <div className="relative h-[680px] w-[326px] overflow-hidden rounded-[20px] border-[10px] border-slate-900 bg-black shadow-2xl shadow-cyan-950/30 ring-1 ring-white/10 flex flex-col">
                  {/* Infinity-O Punch Hole */}
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
          </div>

          {/* Row 2: Foldable Devices with Fold/Unfold Mechanics */}
          <div className="pt-6 border-t border-slate-800/80 space-y-10">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Foldable Hardware (Cover vs Unfolded Tablet Canvas)
              </h4>
            </div>

            {/* Samsung Galaxy Z Fold 8 Ultra */}
            <div className="rounded-3xl border border-slate-800 bg-[#0A0E1A]/60 p-6 flex flex-col items-center">
              <FoldableDeviceFrame
                deviceType="zfold8"
                stops={stops}
                isHealed={isHealed}
                isHealing={isHealing}
                delayMinutes={delayMinutes}
                onTriggerHeal={onTriggerHeal}
              />
            </div>

            {/* iPhone Duo (Passport Design) */}
            <div className="rounded-3xl border border-slate-800 bg-[#0A0E1A]/60 p-6 flex flex-col items-center">
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
        </div>
      )}

      {/* Tab 2: Studio Renders */}
      {activeTab === "studio" && (
        <div className="space-y-8">
          {/* Pair 1: Normal Phones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* iPhone 18 Pro Max */}
            <div className="rounded-3xl border border-slate-800 bg-[#0B101D] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">iPhone 18 Pro Max</h4>
                  <span className="text-[11px] font-mono text-cyan-400">
                    163.4 x 78.0 x 8.75 mm • 6.9-inch Display
                  </span>
                </div>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  FLAGSHIP
                </span>
              </div>
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/renders/iphone_18_pro_max.jpg"
                  alt="iPhone 18 Pro Max Mockup"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 text-xs text-slate-400 font-mono flex justify-between">
                <span>Display: 6.9" Super Retina XDR</span>
                <span className="text-emerald-400">Glassmorphism UI</span>
              </div>
            </div>

            {/* Samsung S26 Ultra */}
            <div className="rounded-3xl border border-slate-800 bg-[#0B101D] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">Samsung Galaxy S26 Ultra</h4>
                  <span className="text-[11px] font-mono text-cyan-400">
                    163.6 x 78.1 x 7.9 mm • 6.9-inch Display
                  </span>
                </div>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  BOXY SHARP
                </span>
              </div>
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/renders/samsung_s26_ultra.jpg"
                  alt="Samsung Galaxy S26 Ultra Mockup"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 text-xs text-slate-400 font-mono flex justify-between">
                <span>Display: 6.9" Dynamic AMOLED 2X</span>
                <span className="text-emerald-400">Boxy Frame</span>
              </div>
            </div>
          </div>

          {/* Pair 2: Foldable Previews (Folded and Unfolded side-by-side) */}
          <div className="space-y-8">
            {/* Samsung Galaxy Z Fold 8 Ultra (Folded + Unfolded) */}
            <div className="rounded-3xl border border-slate-800 bg-[#0B101D] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">Samsung Galaxy Z Fold 8 Ultra</h4>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Folded: 158.4 x 72.8 mm (6.3") • Unfolded: 158.4 x 145.6 mm (8.0" Canvas)
                  </span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  DUAL-STATE SHOWCASE (FOLDED & UNFOLDED)
                </span>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/renders/z_fold_8_ultra_duo.jpg"
                  alt="Galaxy Z Fold 8 Ultra Folded and Unfolded"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 text-xs text-slate-400 font-mono flex flex-col sm:flex-row justify-between gap-1">
                <span>Cover: Tall Narrow (6.3", 22:9)</span>
                <span className="text-cyan-300">Inner: 8.0" Multi-Tasking Tablet HUD (6:5)</span>
                <span className="text-emerald-400">Zero Code in UI</span>
              </div>
            </div>

            {/* iPhone Duo Passport (Folded + Unfolded) */}
            <div className="rounded-3xl border border-slate-800 bg-[#0B101D] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">iPhone Duo (Apple Foldable Passport Design)</h4>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Folded: 123.9 x 81.9 mm (5.4") • Unfolded: 123.9 x 161.4 mm (7.6" Canvas, 4:3)
                  </span>
                </div>
                <span className="rounded bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  PASSPORT FORM FACTOR (FOLDED & UNFOLDED)
                </span>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/renders/iphone_duo_passport.jpg"
                  alt="iPhone Duo Passport Design Folded and Unfolded"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 text-xs text-slate-400 font-mono flex flex-col sm:flex-row justify-between gap-1">
                <span>Cover: Shorter & Wider Passport Size (123.9 x 81.9 mm)</span>
                <span className="text-cyan-300">Inner: 7.6" iPad Mini Canvas (4:3)</span>
                <span className="text-emerald-400">Grade 5 Polished Titanium</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
