"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { GlideBot } from "@/components/GlideBot";
import { GlassPanel } from "@/components/ui/glass";

const THEME_KEY = "glide-theme";
const DARK_CLASS = "glide-theme-dark";
/** Track 52×32, thumb 24×24, inset 4 → travel 20px. */
const THUMB = 24;
const INSET = 4;
const TRACK_Y = 6;
const TRAVEL = 52 - INSET * 2 - THUMB; // 20

function readDark() {
  return document.documentElement.classList.contains(DARK_CLASS);
}

function subscribeTheme(notify: () => void) {
  window.addEventListener("glide:theme-change", notify);
  return () => window.removeEventListener("glide:theme-change", notify);
}

/** Floating pill nav that stays legible over photography and cream alike. */
export const Header: React.FC = () => {
  const dark = useSyncExternalStore(subscribeTheme, readDark, () => false);

  const toggle = () => {
    const next = !readDark();
    document.documentElement.classList.toggle(DARK_CLASS, next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("glide:theme-change"));
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <GlassPanel thickness="popover" className="glide-glass-header pointer-events-auto px-3 py-2 text-ink sm:px-4">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Glide home" className="flex items-center gap-2 text-ink">
            <GlideBot size={48} />
            <span className="font-display text-2xl font-semibold italic tracking-tight text-ink">Glide</span>
          </Link>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggle}
            className="glide-theme-switch relative h-11 w-[3.25rem] shrink-0 rounded-full"
          >
            {/* Idle track icons — opposite of the active thumb, strong enough to read. */}
            <span
              className="pointer-events-none absolute"
              style={{ top: TRACK_Y + INSET, left: INSET, width: THUMB, height: THUMB, opacity: dark ? 1 : 0 }}
              aria-hidden
            >
              <IconSlot>
                <SunIcon color="rgb(255 251 243 / 0.85)" />
              </IconSlot>
            </span>
            <span
              className="pointer-events-none absolute"
              style={{ top: TRACK_Y + INSET, left: INSET + TRAVEL, width: THUMB, height: THUMB, opacity: dark ? 0 : 1 }}
              aria-hidden
            >
              <IconSlot>
                <MoonIcon color="rgb(28 18 48 / 0.62)" />
              </IconSlot>
            </span>
            {/* Active violet thumb — icon dead-centered via absolute 50%/translate. */}
            <span
              className="glide-theme-switch-thumb absolute rounded-full transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                top: TRACK_Y + INSET,
                left: INSET,
                width: THUMB,
                height: THUMB,
                transform: `translateX(${dark ? TRAVEL : 0}px)`,
              }}
              aria-hidden
            >
              <IconSlot>{dark ? <MoonIcon color="#FFFBF3" /> : <SunIcon color="#FFFBF3" />}</IconSlot>
            </span>
          </button>
        </div>
      </GlassPanel>
    </header>
  );
};

function IconSlot({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="pointer-events-none absolute"
      style={{ top: "50%", left: "50%", width: 14, height: 14, marginTop: -7, marginLeft: -7 }}
    >
      {children}
    </span>
  );
}

/** 14×14 sun centered on (7,7). */
function SunIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="2.2" stroke={color} strokeWidth="1.5" />
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M7 1.4v1.1" />
        <path d="M7 11.5v1.1" />
        <path d="M1.4 7h1.1" />
        <path d="M11.5 7h1.1" />
        <path d="M3.1 3.1l.78.78" />
        <path d="M10.12 10.12l.78.78" />
        <path d="M10.9 3.1l-.78.78" />
        <path d="M3.88 10.12l-.78.78" />
      </g>
    </svg>
  );
}

/** 14×14 crescent with mass on (7,7). */
function MoonIcon({ color }: { color: string }) {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <defs>
        <mask id={`moon-${uid}`}>
          <rect width="14" height="14" fill="#fff" />
          <circle cx="9.3" cy="5.2" r="4" fill="#000" />
        </mask>
      </defs>
      <circle cx="7" cy="7" r="4.4" fill={color} mask={`url(#moon-${uid})`} />
    </svg>
  );
}
