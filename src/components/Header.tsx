"use client";

import React from "react";
import Link from "next/link";
import { GlideBot } from "@/components/GlideBot";

const LINKS = [
  { id: "story", href: "/", label: "The story" },
  { id: "devices", href: "/previews", label: "Devices" },
] as const;

/** Floating pill nav that stays legible over photography and cream alike. */
export const Header: React.FC<{ active: "story" | "devices" }> = ({ active }) => (
  <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-cream/85 py-2 pl-3 pr-2 shadow-pop backdrop-blur-xl">
      <Link href="/" aria-label="Glide home" className="mr-3 flex items-center gap-2">
        <GlideBot size={48} />
        <span className="font-display text-2xl font-semibold italic tracking-tight">Glide</span>
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-1">
        {LINKS.map((l) => (
          <Link
            key={l.id}
            href={l.href}
            aria-current={active === l.id ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
              active === l.id ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);
