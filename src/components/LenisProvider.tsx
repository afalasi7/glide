'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';

interface LenisContextValue {
  lenis: Lenis | null;
  scroll: number;
  progress: number;
  velocity: number;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scroll: 0,
  progress: 0,
  velocity: 0,
});

export function useLenis(
  callback?: (data: { scroll: number; progress: number; velocity: number }) => void
) {
  const context = useContext(LenisContext);

  useEffect(() => {
    if (callback && context.lenis) {
      const handler = (e: { scroll: number; progress: number; velocity: number }) => {
        callback(e);
      };
      context.lenis.on('scroll', handler);
      return () => {
        context.lenis?.off('scroll', handler);
      };
    }
  }, [callback, context.lenis]);

  return context;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenisState, setLenisState] = useState<LenisContextValue>({
    lenis: null,
    scroll: 0,
    progress: 0,
    velocity: 0,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
    });

    setLenisState({
      lenis,
      scroll: 0,
      progress: 0,
      velocity: 0,
    });

    lenis.on('scroll', (e: { scroll: number; progress: number; velocity: number }) => {
      setLenisState((prev) => ({
        ...prev,
        scroll: e.scroll,
        progress: e.progress,
        velocity: e.velocity,
      }));
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smooth anchor scroll for nav links
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const target = anchor.getAttribute('href');
      if (target && target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -60 });
        }
      }
    };

    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // Delegated click handler for dynamically mounted links
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(href, { offset: -60 });
          }
        }
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      cancelAnimationFrame(rafId);
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      document.removeEventListener('click', handleDocumentClick);
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisState}>
      {children}
    </LenisContext.Provider>
  );
}
