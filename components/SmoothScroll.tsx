"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Site-wide inertial scroll (reference: oliverbernotat.de, which ships Lenis
 *  1.3 with exactly this config — lerp 0.15, smooth wheel, multipliers 1).
 *  Lenis lerps the real scroll position toward the wheel target every frame,
 *  so scroll-driven choreography (gallery gather/pan, scrub film) glides
 *  instead of tracking the wheel's detents 1:1. Touch scrolling stays native;
 *  anchors are handled by Lenis; reduced motion opts out entirely.
 *  The instance is shared on window so sections can add idle snap points
 *  (see GalleryNoir). */
export default function SmoothScroll() {
  const reduce = useReducedMotion();

  // A refresh always restarts at the hero: the pinned-hero choreography only
  // reads right entered from the top, so opt out of the browser's scroll
  // memory and pin the load position to 0.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      lerp: 0.15,
      smoothWheel: true,
      // Stop anchor jumps 88px short so section headers clear the fixed nav.
      anchors: { offset: -88 },
      autoRaf: true,
    });
    (window as unknown as { __lilacLenis?: Lenis }).__lilacLenis = lenis;
    return () => {
      delete (window as unknown as { __lilacLenis?: Lenis }).__lilacLenis;
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
