"use client";

import React from "react";

interface GlideLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  variant?: "emerald" | "white" | "monochrome";
}

/**
 * Glide Luxury Logo
 * Features a sculpted, white, high-end luxury 'G' monogram.
 * Designed with classical high-contrast serif geometry and modern architectural refinement.
 */
export const GlideLogo: React.FC<GlideLogoProps> = ({
  className = "",
  size = 34,
  showWordmark = false,
  variant = "white",
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Luxury Monogram Medallion */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-b from-[#141824] via-[#0C0F17] to-[#06080D] border border-white/20 shadow-lg shadow-black/80 overflow-hidden group"
        style={{ width: size, height: size }}
      >
        {/* Subtle luxury light sweep reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.04] pointer-events-none" />
        
        {/* Very subtle emerald ambient rim glow */}
        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400/20 blur-sm pointer-events-none" />

        {/* Sculpted Pure White Luxury "G" SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-[74%] h-[74%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          {/* Outer high-contrast luxury serif G contour */}
          <path
            d="M 78 28
               C 74 21, 65 16, 52 16
               C 31 16, 17 31, 17 51
               C 17 71, 32 85, 53 85
               C 71 85, 82 74, 83 57
               L 52 57
               L 52 48
               L 92 48
               C 92 68, 77 93, 52 93
               C 26 93, 8 74, 8 51
               C 8 26, 27 8, 53 8
               C 68 8, 80 15, 87 25
               Z"
            fill="url(#luxuryWhiteG)"
          />

          {/* Elegant top serif terminal teardrop / finial accent */}
          <circle cx="81" cy="26" r="3.5" fill="#FFFFFF" />

          {/* Modern interior horizontal glide slash / precision spur */}
          <path
            d="M 52 48 L 88 48 L 88 56 L 52 56 Z"
            fill="#FFFFFF"
          />

          {/* Gradients for high-end platinum/white brilliance */}
          <defs>
            <linearGradient
              id="luxuryWhiteG"
              x1="20"
              y1="10"
              x2="85"
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F4F4F8" />
              <stop offset="100%" stopColor="#D9DCE5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white leading-none font-sans">
            Glide
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400 mt-0.5">
            Road Trip Peace of Mind
          </span>
        </div>
      )}
    </div>
  );
};
