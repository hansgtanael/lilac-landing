"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { LuxHeroContent } from "@/lib/sanity";

/**
 * LuxHero, the cinematic opening frame of the /lux prototype.
 *
 * Choreography:
 * 1. The ambient loop fills the viewport under an ultra slow Ken Burns zoom
 *    (scale 1 to 1.07 over ~20s, mirrored forever, linear) so the space
 *    feels alive rather than frozen.
 * 2. On load the copy block rises in bottom-left, one element at a time
 *    (opacity 0 / y 24, 0.12s stagger, the house EASE).
 * 3. As the hero scrolls away the copy drifts up slightly faster than the
 *    video: a gentle two-plane parallax, nothing showy.
 * Reduced motion: the loop is swapped for the poster still, zoom and
 * parallax collapse to zero travel, copy renders in place.
 */

// Small settle before the copy starts rising, then 0.12s per element.
const BASE_DELAY = 0.2;
const STAGGER = 0.12;

// Built-in copy, used verbatim whenever Sanity returns no content. Typed with
// the shared content type so Sanity data and this fallback are interchangeable.
const FALLBACK: LuxHeroContent = {
  eyebrow: "KEUKA LAKE · PENN YAN, NY",
  heading: "Life on the Lake",
  body: "A cozy lakehouse on Keuka Lake. A private dock, sunset views, and room for eight.",
  primaryCta: { label: "Check availability", href: "#stay" },
  secondaryCta: { label: "Explore the house", href: "#film" },
  posterUrl: "/figma/hero-poster.jpg",
  posterAlt: "Keuka Lake sunset over the private dock at Lilac Landing",
  videoUrl: "/figma/hero-loop.mp4",
  videoAlt:
    "Keuka Lake sunset over the private dock at Lilac Landing, water and sky gently moving",
};

export default function LuxHero({ content }: { content: LuxHeroContent | null }) {
  const c = content ?? FALLBACK;
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Swapping <video> for the poster <Image> straight off useReducedMotion
  // mismatches hydration (server always renders the video branch), so the
  // swap waits for mount: first client paint matches the server, then
  // reduced-motion visitors get the still.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showStill = mounted && reduce;

  // Two-plane parallax across the hero's exit: the media eases down a touch
  // (reads as "slower than the page") while the copy lifts away ahead of it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const rawMediaY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const rawContentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const mediaY = reduce ? 0 : rawMediaY;
  const contentY = reduce ? 0 : rawContentY;

  // Autoplay can be blocked even with muted + playsInline; nudge it and fall
  // back to the poster frame quietly. Reduced motion pauses on the poster
  // until the mount swap removes the video entirely.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      v.currentTime = 0;
    } else {
      v.play().catch(() => {
        /* poster frame remains */
      });
    }
  }, [reduce, showStill]);

  const rise = (n: number) => ({
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.9,
      ease: EASE,
      delay: reduce ? 0 : BASE_DELAY + n * STAGGER,
    },
  });

  return (
    <section
      ref={sectionRef}
      id="lux-hero"
      className="relative min-h-[100dvh] w-full overflow-hidden bg-dark"
    >
      {/* Media plane. The Ken Burns wrapper only ever animates scale, and the
          parallax wrapper only y, so both stay on the compositor. */}
      <motion.div style={{ y: mediaY, willChange: "transform" }} className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={reduce ? { scale: 1 } : { scale: 1.07 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }
          }
        >
          {showStill ? (
            <Image
              src={c.posterUrl}
              alt={c.posterAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={c.posterUrl}
              aria-label={c.videoAlt}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={c.videoUrl} type="video/mp4" />
            </video>
          )}
        </motion.div>
      </motion.div>

      {/* Scrim, heavier bottom-left where the copy sits: a bottom-up charcoal
          ramp plus a left-to-right wash. */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark/85 via-dark/25 to-dark/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-dark/50 to-transparent" />

      {/* Copy block, bottom-left. Each child rises on its own 0.12s beat. */}
      <motion.div
        style={{ y: contentY, willChange: "transform" }}
        className="absolute bottom-14 left-5 z-20 max-w-[40rem] pr-5 sm:bottom-16 sm:left-10 md:bottom-20"
      >
        <motion.p
          {...rise(0)}
          className="text-[13px] uppercase tracking-[0.22em] text-light/70"
        >
          {c.eyebrow}
        </motion.p>

        <motion.h1
          {...rise(1)}
          className="mt-4 font-display text-[clamp(3.5rem,10vw,7.5rem)] italic leading-[1.0] text-light"
        >
          {c.heading}
        </motion.h1>

        <motion.p {...rise(2)} className="mt-5 max-w-[46ch] text-lg text-light/85 sm:text-xl">
          {c.body}
        </motion.p>

        <motion.div {...rise(3)} className="mt-9 flex flex-wrap gap-4">
          {/* Primary pill: lilac fill, inverts to deep lilac on hover. */}
          <a
            href={c.primaryCta.href}
            className="flex h-14 items-center rounded-full bg-brand px-7 text-base font-semibold tracking-[0.04em] text-dark transition-colors duration-[400ms] ease-luxe hover:bg-brand-dark hover:text-light active:translate-y-[1px]"
          >
            {c.primaryCta.label}
          </a>

          {/* Ghost pill: hairline border over a blurred charcoal wash. */}
          <a
            href={c.secondaryCta.href}
            className="flex h-14 items-center rounded-full border border-light/45 bg-dark/20 px-7 text-base font-semibold tracking-[0.04em] text-light backdrop-blur-sm transition-colors duration-[400ms] ease-luxe hover:border-light/70 active:translate-y-[1px]"
          >
            {c.secondaryCta.label}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
