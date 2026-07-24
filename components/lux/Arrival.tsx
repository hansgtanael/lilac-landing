"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { LuxArrivalContent } from "@/lib/sanity";

/**
 * Arrival, the first full-bleed breath of the /lux prototype.
 *
 * Choreography: the living-room photo is oversized (120% tall) and drifts
 * from -8% to 8% as the section crosses the viewport, a slow parallax that
 * gives the room physical depth without ever exposing an edge (8% of 120svh
 * is 9.6svh of travel, inside the 10svh overhang on each side). Over it, one
 * display line rises out of a clip wrapper (y 40 + fade) the first time it
 * enters view. Nothing else. One photo, one line, one breath.
 *
 * Reduced motion: parallax collapses to zero travel and the line renders in
 * its settled state.
 */
// Built-in copy, used verbatim whenever Sanity returns no content.
const FALLBACK: LuxArrivalContent = {
  imageUrl: "/figma/IMG_4256.jpeg",
  imageAlt:
    "Open living and dining room at Lilac Landing with wide views of Keuka Lake",
  heading: "Wake up to the water.",
};

export default function Arrival({ content }: { content: LuxArrivalContent | null }) {
  const c = content ?? FALLBACK;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Progress 0 -> 1 while the section moves from entering the bottom of the
  // viewport to leaving the top; y is a % of the oversized image wrapper.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  // Collapse parallax to zero travel under reduced motion.
  const y = reduce ? "0%" : rawY;

  return (
    <section ref={ref} className="relative h-svh w-full overflow-hidden">
      {/* Parallax media wrapper, transform only, GPU-safe. Taller than the
          viewport (10% overhang top and bottom) so the drift never reveals
          a seam. */}
      <motion.div
        style={{ y, willChange: "transform" }}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
      >
        <Image
          src={c.imageUrl}
          alt={c.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Soft charcoal scrim so the light display line always reads. */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-dark/30 to-dark/50" />

      {/* The one line. Clip wrapper masks the rise; padding keeps the italic
          ascenders and descenders clear of the clip edge once settled. */}
      <div className="absolute inset-0 z-20 grid place-items-center px-6">
        <div className="overflow-hidden px-3 pb-4 pt-2">
          <motion.h2
            className="text-center font-display text-[clamp(2.5rem,6vw,5rem)] italic leading-[1.05] tracking-tight text-light"
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
          >
            {c.heading}
          </motion.h2>
        </div>
      </div>
    </section>
  );
}
