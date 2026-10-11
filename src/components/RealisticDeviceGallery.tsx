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
  const [activeTab, setActiveTab] = useState<"interactive" | "studio">("studio");
  const [colorTheme, setColorTheme] = useState<"bw" | "glass">("bw");

  return (
    <div className="space-y-8">
      {/* Header bar with Mode & Theme Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-[#090D16] p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hardware Laboratory & Precise Device Specs
            </h3>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700">
              MONOCHROME & GLASS EDITIONS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Galaxy Z Fold 8 Ultra features separate, dedicated Folded and Unfolded studio mockups with exact hardware millimeters.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Color Mode */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setColorTheme("bw")}
              className={`rounded-lg px-2.5 py-1 font-bold transition ${
                colorTheme === "bw"
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Black & White
            </button>
            <button
              onClick={() => setColorTheme("glass")}
              className={`rounded-lg px-2.5 py-1 font-bold transition ${
                colorTheme === "glass"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Electric Glass
            </button>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("studio")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition ${
                activeTab === "studio"
                  ? "bg-white text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Studio Renders</span>
            </button>
            <button
              onClick={() => setActiveTab("interactive")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition ${
                activeTab === "interactive"
                  ? "bg-white text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Interactive Bezels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Studio Renders */}
      {activeTab === "studio" && (
        <div className="space-y-12">
          {/* 1. Galaxy Z Fold 8 Ultra - Dedicated Folded & Unfolded Gallery */}
          <div className="rounded-3xl border border-zinc-800 bg-[#07090E] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-zinc-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Samsung Galaxy Z Fold 8 Ultra</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                    Dual Hardware Mockup
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Separate high-resolution mockups for Cover Display (Folded) and Dynamic AMOLED 2X Canvas (Unfolded).
                </p>
              </div>
              <div className="text-right text-[11px] font-mono text-zinc-400">
                <span>Total Height: 158.4 mm</span> • <span>Thickness: 4.8 mm / 9.8 mm</span>
              </div>
            </div>

            {/* Side-by-side Z Fold 8 Ultra cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Z Fold 8 Ultra - FOLDED */}
              <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#0B0D14] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      State 1: Cover Screen
                    </span>
                    <h5 className="font-bold text-white text-xs">
                      Galaxy Z Fold 8 Ultra (Folded)
                    </h5>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] font-mono text-white font-bold">
                    6.3" 22:9
                  </span>
                </div>

                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black border border-zinc-800/80">
                  <Image
                    src="/renders/z_fold_8_ultra_clean_folded.jpg"
                    alt="Galaxy Z Fold 8 Ultra Folded Standalone"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="rounded-xl bg-zinc-900/90 p-3 space-y-1.5 text-[11px] font-mono border border-zinc-800">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">DIMENSIONS:</span>
                    <span className="text-white font-bold">158.4 x 72.8 x 9.8 mm</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">DISPLAY:</span>
                    <span>6.3-inch Dynamic AMOLED Cover</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">FORM FACTOR:</span>
                    <span>Tall & Narrow Pocketable</span>
                  </div>
                </div>
              </div>

              {/* Z Fold 8 Ultra - UNFOLDED */}
              <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#0B0D14] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      State 2: Tablet Inner Canvas
                    </span>
                    <h5 className="font-bold text-white text-xs">
                      Galaxy Z Fold 8 Ultra (Unfolded)
                    </h5>
                  </div>
                  <span className="rounded bg-white px-2 py-0.5 text-[9px] font-mono text-black font-bold">
                    8.0" 6:5
                  </span>
                </div>

                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black border border-zinc-800/80">
                  <Image
                    src="/renders/z_fold_8_ultra_clean_unfolded.jpg"
                    alt="Galaxy Z Fold 8 Ultra Unfolded Standalone"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="rounded-xl bg-zinc-900/90 p-3 space-y-1.5 text-[11px] font-mono border border-zinc-800">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">DIMENSIONS:</span>
                    <span className="text-white font-bold">158.4 x 145.6 x 4.8 mm</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">DISPLAY:</span>
                    <span>8.0-inch Dynamic AMOLED 2X Canvas</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">LAYOUT:</span>
                    <span>Split Screen Itinerary & Live Vector Map</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Flagship Smartphones Gallery (iPhone 18 Pro Max & Samsung S26 Ultra) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* iPhone 18 Pro Max */}
            <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">iPhone 18 Pro Max</h4>
                  <span className="text-[11px] font-mono text-zinc-400">
                    163.4 x 78.0 x 8.75 mm • 6.9-inch Display
                  </span>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                  6.9" TITANIUM
                </span>
              </div>
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                <Image
                  src={
                    colorTheme === "bw"
                      ? "/renders/airbnb_bw_iphone.jpg"
                      : "/renders/iphone_18_pro_max.jpg"
                  }
                  alt="iPhone 18 Pro Max Mockup"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-400 font-mono flex justify-between border border-zinc-800">
                <span>Super Retina XDR OLED</span>
                <span className="text-white font-bold">
                  {colorTheme === "bw" ? "Monochrome Editorial" : "Electric Glass"}
                </span>
              </div>
            </div>

            {/* Samsung S26 Ultra */}
            <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">Samsung Galaxy S26 Ultra</h4>
                  <span className="text-[11px] font-mono text-zinc-400">
                    163.6 x 78.1 x 7.9 mm • 6.9-inch Display
                  </span>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                  BOXY SHARP
                </span>
              </div>
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                <Image
                  src="/renders/samsung_s26_ultra.jpg"
                  alt="Samsung Galaxy S26 Ultra Mockup"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-400 font-mono flex justify-between border border-zinc-800">
                <span>Dynamic AMOLED 2X</span>
                <span className="text-white font-bold">Infinity-O Bezel</span>
              </div>
            </div>
          </div>

          {/* 3. iPhone Duo (Passport Design) */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm">iPhone Duo (Passport Form Factor)</h4>
                <span className="text-[11px] font-mono text-zinc-400">
                  Folded: 123.9 x 81.9 mm (5.4") • Unfolded: 123.9 x 161.4 mm (7.6" Canvas, 4:3)
                </span>
              </div>
              <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-white border border-zinc-700">
                PASSPORT PROPORTION
              </span>
            </div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
              <Image
                src={
                  colorTheme === "bw"
                    ? "/renders/airbnb_bw_foldables.jpg"
                    : "/renders/iphone_duo_passport.jpg"
                }
                alt="iPhone Duo Passport Design"
                fill
                className="object-cover"
              />
            </div>
            <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-400 font-mono flex flex-col sm:flex-row justify-between gap-1 border border-zinc-800">
              <span>Cover: Shorter & Wider Passport Size (123.9 x 81.9 mm)</span>
              <span className="text-white">Inner: 7.6" iPad Mini Canvas (4:3)</span>
              <span className="text-zinc-300">Grade 5 Polished Titanium</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Bezels */}
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
    </div>
  );
};
