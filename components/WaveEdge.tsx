"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Organic wave dividers from the Figma "Slow Lake" concept (frame 244:2).
 *  Two variants:
 *  - <WaveLip />   — wave crest fixed to the TOP of the section that carries
 *    it. The hero is pinned (sticky), so as the Welcome section scrolls up,
 *    this lip visibly rides over the hero — the overlap IS the motion.
 *  - <WaveHills /> — the two-layer hills band that leads into What's
 *    Included; back hill and front hill scrub at different speeds. */

// Paths are authored at 1440 wide and stretch with preserveAspectRatio="none".
const HERO_WAVE =
  "M0 78 C 180 30, 340 96, 540 66 C 740 36, 880 100, 1080 64 C 1240 36, 1360 70, 1440 46 L 1440 120 L 0 120 Z";
const HILL_BACK =
  "M0 150 C 200 60, 420 130, 640 96 C 880 60, 1080 140, 1240 96 C 1330 72, 1400 90, 1440 78 L 1440 240 L 0 240 Z";
const HILL_FRONT =
  "M0 120 C 260 40, 520 130, 780 88 C 1020 50, 1240 120, 1440 70 L 1440 360 L 0 360 Z";

/** Scroll progress of a ref'd element through the viewport, 0→1. */
function useSectionProgress(ref: React.RefObject<HTMLDivElement | null>) {
  return useScroll({ target: ref, offset: ["start end", "end start"] }).scrollYProgress;
}

function useDrift(
  progress: MotionValue<number>,
  range: [number | string, number | string],
  disabled: boolean,
) {
  const drift = useTransform(progress, [0, 1], range as (number | string)[]);
  return disabled ? 0 : drift;
}

/** Wave crest attached above the carrying section's top edge (the section
 *  must be `relative` and share the `fill-cream` background). It never
 *  enters the hero at rest — it only rises over it while scrolling. */
export function WaveLip() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full translate-y-[1px]">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[68px] w-full md:h-[120px]"
      >
        <path d={HERO_WAVE} className="fill-cream" />
      </svg>
    </div>
  );
}

/** Two-layer hills divider. Ends in cream so the section below no longer
 *  needs its own `bg-linen` (What's Included) — one cream canvas throughout. */
export function WaveHills() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const progress = useSectionProgress(ref);
  const backY = useDrift(progress, [44, -44], reduce);
  const frontY = useDrift(progress, [16, -16], reduce);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative -mb-px h-[140px] overflow-hidden md:h-[240px]">
      <motion.svg
        style={{ y: backY }}
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 block h-full w-full"
      >
        <path d={HILL_BACK} className="fill-warm-gray/55" />
      </motion.svg>
      <motion.svg
        style={{ y: frontY }}
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[34%] block h-full w-full"
      >
        <path d={HILL_FRONT} className="fill-cream" />
      </motion.svg>
      {/* Seals the band to the cream section below whatever the parallax
          offset — the front hill's overshoot never exposes a seam. */}
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-cream" />
    </div>
  );
}
