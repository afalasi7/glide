"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

/** Page-wide smooth scrolling. Scroll-linked animation reads native scroll through framer-motion's useScroll. */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/app" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // Anchor links such as #day glide instead of jumping
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      const href = a?.getAttribute("href");
      if (href && href.length > 1 && document.querySelector(href)) {
        e.preventDefault();
        lenis.scrollTo(href);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
