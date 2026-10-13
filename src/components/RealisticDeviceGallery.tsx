"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Smartphone,
  Eye,
  Ruler,
  Layers,
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
  const [activeTab, setActiveTab] = useState<"studio" | "interactive">("studio");

  return (
    <div className="space-y-8">
      {/* Header bar with Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-800 bg-[#090D16] p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hardware Laboratory & Precise Device Specs
            </h3>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700">
              MONOCHROME FLAT SCREEN SPECIFICATIONS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Flat, front-facing close-up screen mockups. Flagships have single flat views; foldables have separate dedicated Folded and Unfolded views with exact dimensions.
          </p>
        </div>

        {/* View Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition ${
              activeTab === "studio"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Flat Screen Mockups</span>
          </button>
          <button
            onClick={() => setActiveTab("interactive")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition ${
              activeTab === "interactive"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Interactive Bezels</span>
          </button>
        </div>
      </div>

      {/* Tab: Studio Flat Screen Mockups */}
      {activeTab === "studio" && (
        <div className="space-y-12">
          {/* SECTION 1: Standard Flagships (iPhone 18 Pro Max & Samsung S26 Ultra) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-zinc-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                1. Standard Flagship Devices (Flat Front-Facing 6.9" Screens)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* iPhone 18 Pro Max */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-white text-sm">iPhone 18 Pro Max</h5>
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
                    src="/renders/airbnb_bw_iphone.jpg"
                    alt="iPhone 18 Pro Max Flat Screen Mockup"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Super Retina XDR OLED</span>
                  <span className="text-white font-bold">Dynamic Island</span>
                </div>
              </div>

              {/* Samsung Galaxy S26 Ultra */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-white text-sm">Samsung Galaxy S26 Ultra</h5>
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
                    src="/renders/s26_ultra_flat.jpg"
                    alt="Samsung Galaxy S26 Ultra Flat Screen Mockup"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Dynamic AMOLED 2X</span>
                  <span className="text-white font-bold">Infinity-O Hole Punch</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Samsung Galaxy Z Fold 8 Ultra (Folded vs Unfolded) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                2. Samsung Galaxy Z Fold 8 Ultra (Separate Folded & Unfolded Flat Views)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Z Fold 8 Ultra - FOLDED */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                      Folded State
                    </span>
                    <h5 className="font-bold text-white text-sm">
                      Galaxy Z Fold 8 Ultra (Folded)
                    </h5>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                    158.4 x 72.8 x 9.8 mm (6.3")
                  </span>
                </div>
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                  <Image
                    src="/renders/zfold8_flat_folded.jpg"
                    alt="Galaxy Z Fold 8 Ultra Folded Flat View"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Aspect: 22:9 Tall Narrow</span>
                  <span className="text-white font-bold">Cover Display</span>
                </div>
              </div>

              {/* Z Fold 8 Ultra - UNFOLDED */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                      Unfolded State
                    </span>
                    <h5 className="font-bold text-white text-sm">
                      Galaxy Z Fold 8 Ultra (Unfolded)
                    </h5>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                    158.4 x 145.6 x 4.8 mm (8.0")
                  </span>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                  <Image
                    src="/renders/zfold8_flat_unfolded.jpg"
                    alt="Galaxy Z Fold 8 Ultra Unfolded Flat View"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Aspect: 6:5 Tablet Canvas</span>
                  <span className="text-white font-bold">Split Route Map HUD</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: iPhone Duo (Passport Folded vs Unfolded) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                3. iPhone Duo (Passport Form Factor: Folded & Unfolded Flat Views)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* iPhone Duo - FOLDED */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                      Folded State
                    </span>
                    <h5 className="font-bold text-white text-sm">
                      iPhone Duo (Folded Passport)
                    </h5>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                    123.9 x 81.9 x 9.5 mm (5.4")
                  </span>
                </div>
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                  <Image
                    src="/renders/iphoneduo_flat_folded.jpg"
                    alt="iPhone Duo Folded Flat View"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Aspect: Compact 10:16 Booklet</span>
                  <span className="text-white font-bold">Dynamic Island</span>
                </div>
              </div>

              {/* iPhone Duo - UNFOLDED */}
              <div className="rounded-3xl border border-zinc-800 bg-[#0B0D14] p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                      Unfolded State
                    </span>
                    <h5 className="font-bold text-white text-sm">
                      iPhone Duo (Unfolded Canvas)
                    </h5>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-white">
                    123.9 x 161.4 x 4.5 mm (7.6")
                  </span>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black border border-zinc-800">
                  <Image
                    src="/renders/iphoneduo_flat_unfolded.jpg"
                    alt="iPhone Duo Unfolded Flat View"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-xl bg-zinc-900/90 p-3 text-xs text-zinc-300 font-mono flex justify-between border border-zinc-800">
                  <span>Aspect: 4:3 iPad Mini Canvas</span>
                  <span className="text-white font-bold">Split Route HUD</span>
                </div>
              </div>
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
