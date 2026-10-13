"use client";

import React from "react";
import Link from "next/link";
import { GlideLogo } from "@/components/GlideLogo";

interface HeaderProps {
  isHealed: boolean;
  isHealing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isHealed, isHealing }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <GlideLogo size={34} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white leading-none">
                  Glide
                </span>
                <span className="hidden sm:inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Trip Guard
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Road trip peace of mind.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/landing"
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition"
          >
            Story
          </Link>

          <Link
            href="/previews"
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition"
          >
            Devices & Passes
          </Link>

          {/* Status Pill */}
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border border-white/10 bg-white/5 shadow-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isHealing
                  ? "bg-amber-400 animate-pulse"
                  : isHealed
                  ? "bg-emerald-400"
                  : "bg-zinc-400"
              }`}
            />
            <span className="text-zinc-200 text-xs font-medium">
              {isHealing
                ? "Agents Working..."
                : isHealed
                ? "Trip Protected"
                : "Monitoring"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
