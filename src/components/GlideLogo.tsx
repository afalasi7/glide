import React from "react";
import Image from "next/image";

interface GlideLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

/** The real Glide app icon (public/images/glide_logo.jpg), clipped to an iOS-style squircle. */
export const GlideLogo: React.FC<GlideLogoProps> = ({ className = "", size = 36, showWordmark = false }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <span
      className="relative block shrink-0 overflow-hidden bg-black"
      style={{ width: size, height: size, borderRadius: size * 0.225 }}
    >
      <Image src="/images/glide_logo.jpg" alt="Glide" fill sizes={`${size}px`} className="object-cover" priority />
    </span>
    {showWordmark && <span className="font-display text-2xl font-semibold italic tracking-tight">Glide</span>}
  </span>
);
