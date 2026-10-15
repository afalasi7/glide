"use client";

import React from "react";
import Link from "next/link";
import { GlideBot } from "@/components/GlideBot";
import { GlassPanel } from "@/components/ui/glass";

/** Floating pill nav that stays legible over photography and cream alike. */
export const Header: React.FC = () => (
  <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
    <GlassPanel thickness="popover" className="glide-glass-header pointer-events-auto px-4 py-2">
      <Link href="/" aria-label="Glide home" className="flex items-center gap-2">
        <GlideBot size={48} />
        <span className="font-display text-2xl font-semibold italic tracking-tight">Glide</span>
      </Link>
    </GlassPanel>
  </header>
);
