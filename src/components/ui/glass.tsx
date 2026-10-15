"use client";

import React, { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const schemeQuery = "(prefers-color-scheme: dark)";
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(schemeQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

export function useGlassColorScheme() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(schemeQuery).matches, () => false);
}

export function GlassPanel({ thickness = "card", className, ...props }: React.ComponentProps<"div"> & { thickness?: "panel" | "card" | "popover" }) {
  return <div data-slot={thickness} className={cn("glide-glass rounded-xl", { panel: "glass-panel", card: "bg-card", popover: "bg-popover" }[thickness], className)} {...props} />;
}

export function GlassButton({ variant = "primary", className, type = "button", ...props }: React.ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "alert" }) {
  return (
    <button
      data-slot="button"
      data-variant={variant === "primary" ? "default" : variant === "alert" ? "destructive" : variant}
      type={type}
      className={cn("glide-glass inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40", {
        primary: "glass-primary text-primary-foreground",
        secondary: "glass-control bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "bg-transparent text-foreground hover:bg-accent",
        alert: "glide-glass-alert",
      }[variant], className)}
      {...props}
    />
  );
}

export function GlassInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn("glide-glass w-full rounded-xl border px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground", className)} {...props} />;
}

export function GlassTag({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="badge" data-variant="secondary" className={cn("glide-glass glass-control inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground", className)} {...props} />;
}
