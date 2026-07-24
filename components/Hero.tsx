"use client";

import { Fragment, useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Eyebrow from "@/components/ui/Eyebrow";
import { useSiteContent } from "@/components/site-content";

// Hero begins revealing as the loader curtain lifts (~2.0s on first paint).
const BASE_DELAY = 2.0;

function scrollTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  const site = useSiteContent();
  const { hero } = site.text;
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();

  const delay = (n: number) => (reduce ? 0 : BASE_DELAY + n * 0.12);

  // Reduced motion is handled imperatively (pause on the poster frame)
  // instead of branching the markup — branching <Image> vs <video> on a
  // media query caused a hydration mismatch for reduced-motion visitors.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      v.currentTime = 0;
    } else {
      v.play().catch(() => {
        /* autoplay may be blocked; the poster frame remains */
      });
    }
  }, [reduce]);

  // The hero stays pinned while the rest of the page scrolls over it — pause
  // the ambient loop once it is fully covered so it doesn't burn compositor
  // time behind the content.
  useMotionValueEvent(scrollY, "change", (v) => {
    const vid = videoRef.current;
    if (!vid || reduce) return;
    if (v > window.innerHeight * 1.6) {
      if (!vid.paused) vid.pause();
    } else if (vid.paused) {
      vid.play().catch(() => {});
    }
  });

  return (
    <section id="hero" className="sticky top-0 z-0 min-h-screen min-h-[100dvh] w-full overflow-hidden">
      {/* Static media — pinned behind the page, no internal motion. The hero is
          sticky and the sections scroll over it, so the video itself never
          moves; the old scroll parallax translated this wrapper and exposed the
          section's top edge once the hero became pinned. The ambient video loop
          (Higgsfield, from the client's sunset photo) plays for everyone except
          reduced-motion users, who get the still poster. */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/figma/hero-poster.jpg"
          aria-label="Keuka Lake sunset over the private dock at Lilac Landing, water and sky gently moving"
          className="absolute inset-0 h-full w-full object-cover [object-position:center_70%]"
        >
          <source src="/figma/hero-loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient scrim — warm charcoal, transparent → 30% → 62%. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(44,40,37,0) 0%, rgba(44,40,37,0.3) 50%, rgba(44,40,37,0.62) 100%)",
        }}
      />

      {/* Bottom strip — Figma 110:36: copy block left, CTA pair right. */}
      <div className="absolute inset-x-4 bottom-16 z-20 md:inset-x-10 md:bottom-20">
        <div className="flex flex-col gap-9 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <motion.div
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: delay(0) }}
            >
              <Eyebrow className="text-xs text-light/90">{hero.eyebrow}</Eyebrow>
            </motion.div>

            {/* Display/Hero — 112px on the 1440 frame, line-height 0.83. */}
            <motion.h1
              className="mt-3 max-w-5xl font-display text-[clamp(3.25rem,7.8vw,7rem)] italic leading-[0.9] tracking-tight text-light md:leading-[0.83]"
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: delay(1) }}
            >
              {hero.title}
            </motion.h1>

            <motion.p
              className="mt-5 max-w-[48ch] text-xl leading-[1.25] text-light"
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: delay(2) }}
            >
              {hero.tagline.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br className="hidden md:block" />}
                  {i > 0 && " "}
                  {line}
                </Fragment>
              ))}
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: delay(3) }}
          >
            {/* Primary — lilac pill, navy label, hairline ring, nested icon
                circle that nudges on hover; hover inverts to cream. */}
            <button
              onClick={() => scrollTo("#booking")}
              className="group flex h-[42px] items-center gap-2 rounded-full border border-white/30 bg-brand px-5 text-base font-semibold tracking-[0.04em] text-dark transition-colors duration-[400ms] ease-luxe hover:bg-light active:scale-[0.98]"
            >
              {hero.ctaPrimary}
              <span className="flex size-7 items-center justify-center rounded-full bg-white/25 transition-transform duration-[400ms] ease-luxe group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-105">
                <ArrowRight weight="light" className="h-4 w-4" />
              </span>
            </button>

            {/* Secondary — transparent fill, hairline border, cream label. */}
            <button
              onClick={() => scrollTo("#gallery")}
              className="flex h-[42px] items-center rounded-full border border-white/40 px-6 text-base font-semibold tracking-[0.04em] text-light transition-colors duration-[400ms] ease-luxe hover:border-white/70 active:scale-[0.98]"
            >
              {hero.ctaSecondary}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
