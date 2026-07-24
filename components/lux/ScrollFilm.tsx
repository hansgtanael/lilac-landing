"use client";

/* ----------------------------------------------------------------------------
   ScrollFilm - the /lux centerpiece: a film played by the visitor's scroll.
   The section stands 320svh tall; a sticky viewport pins the video while the
   spring-smoothed scroll progress drives video.currentTime, so scrolling
   reads as a slow walk through the space. Three caption lines crossfade at
   the progress thirds and a 1px hairline along the bottom tracks the
   playhead. Under 1024px or reduced motion the pin collapses to a plain
   h-svh section: the film plays itself as a quiet ambient loop with the
   first caption held statically.

   NOTE: /figma/hero-loop.mp4 is a placeholder slot. The intended asset is a
   stitched sequence of generated slow-dolly clips (Higgsfield), one clip per
   scene: the dock at morning, the light across the water, evening color.
---------------------------------------------------------------------------- */

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { LuxFilmContent } from "@/lib/sanity";

// Shared caption face - display italic over the scrim, same shadow treatment
// as the gallery figcaptions so light text reads on bright frames.
const CAPTION =
  "w-max max-w-[26ch] font-display text-[clamp(1.6rem,3vw,2.6rem)] italic leading-[1.1] tracking-[-0.01em] text-light [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]";

// Built-in copy, used verbatim whenever Sanity returns no content.
const FALLBACK: LuxFilmContent = {
  videoUrl: "/figma/hero-loop.mp4",
  posterUrl: "/figma/hero-poster.jpg",
  note: "A FILM, PLAYED BY YOUR SCROLL",
  scrubAriaLabel:
    "A slow walk through Lilac Landing, from the dock at morning to sunset color over Keuka Lake",
  ambientAriaLabel:
    "Morning on the private dock at Lilac Landing, water gently moving",
  captions: [
    "Morning starts on the dock.",
    "The light moves across the water all day.",
    "Evenings end in color.",
  ],
};

/** Pinned scrub: scroll owns the playhead. The video never plays on its own;
 *  every frame the visitor sees is the one their scroll position asked for. */
function ScrubbedFilm({ content }: { content: LuxFilmContent }) {
  const wrapperRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  // Spring-smooth the raw scroll so the playhead glides between frames
  // instead of tracking the wheel 1:1 - the same premium softening as the
  // gallery pan.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.0004,
  });

  // Hold the video paused for its whole life - the scrub is the only driver.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    // Metadata can land before React attaches onLoadedMetadata (cached asset).
    if (v.readyState >= 1 && Number.isFinite(v.duration)) {
      durationRef.current = v.duration;
    }
    return () => v.pause();
  }, []);

  // Scroll -> playhead. The 0.05s back-off keeps the seek short of the exact
  // end of the file, where some browsers snap to a black frame.
  useMotionValueEvent(progress, "change", (v) => {
    const video = videoRef.current;
    const duration = durationRef.current;
    if (!video || !Number.isFinite(duration) || duration <= 0) return;
    video.currentTime = v * (duration - 0.05);
  });

  // Caption crossfades centered on the progress thirds - one line per scene,
  // one visible at a time.
  const cap1 = useTransform(progress, [0.3, 0.36], [1, 0]);
  const cap2 = useTransform(progress, [0.3, 0.36, 0.64, 0.7], [0, 1, 1, 0]);
  const cap3 = useTransform(progress, [0.64, 0.7], [0, 1]);

  return (
    <section ref={wrapperRef} id="film" className="relative h-[320svh] bg-dark">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster={content.posterUrl}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (!Number.isFinite(d) || d <= 0) return;
            durationRef.current = d;
            // Land on the frame the current scroll position asks for, so a
            // mid-section reload does not open on frame zero.
            e.currentTarget.currentTime = progress.get() * (d - 0.05);
          }}
          aria-label={content.scrubAriaLabel}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={content.videoUrl} type="video/mp4" />
        </video>

        {/* Soft charcoal scrim so the light captions read on bright frames. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent"
        />

        {/* Filmstrip note - quiet, top right, fades in once with the pin. */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="absolute right-6 top-6 z-20 text-[12px] uppercase tracking-[0.18em] text-light/60 md:right-10 md:top-8"
        >
          {content.note}
        </motion.p>

        {/* Scene captions - stacked on one bottom-left anchor so they
            crossfade in place. */}
        <div className="pointer-events-none absolute bottom-16 left-6 z-20 md:bottom-20 md:left-10">
          <motion.p style={{ opacity: cap1 }} className={`absolute bottom-0 left-0 ${CAPTION}`}>
            {content.captions[0]}
          </motion.p>
          <motion.p style={{ opacity: cap2 }} className={`absolute bottom-0 left-0 ${CAPTION}`}>
            {content.captions[1]}
          </motion.p>
          <motion.p style={{ opacity: cap3 }} className={`absolute bottom-0 left-0 ${CAPTION}`}>
            {content.captions[2]}
          </motion.p>
        </div>

        {/* Playhead hairline - fills left to right with the scrub. */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 z-20 h-px origin-left bg-light/80"
        />
      </div>
    </section>
  );
}

/** Touch / reduced-motion fallback: no pin, no scrub. The film plays itself
 *  as a muted ambient loop behind the first caption. */
function AmbientFilm({ reduce, content }: { reduce: boolean; content: LuxFilmContent }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reduced motion is handled imperatively (pause on the poster frame), the
  // same pattern as Hero - branching the markup on a media query caused a
  // hydration mismatch there.
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
    return () => v.pause();
  }, [reduce]);

  return (
    <section id="film" className="relative h-svh w-full overflow-hidden bg-dark">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={content.posterUrl}
        aria-label={content.ambientAriaLabel}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={content.videoUrl} type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent"
      />

      <p className={`absolute bottom-16 left-6 z-20 md:bottom-20 md:left-10 ${CAPTION}`}>
        {content.captions[0]}
      </p>
    </section>
  );
}

export default function ScrollFilm({ content }: { content: LuxFilmContent | null }) {
  const c = content ?? FALLBACK;
  const reduce = useReducedMotion();
  // Pinned scrubbing wants a real wheel or trackpad; under 1024px and under
  // reduced motion the section releases to a normal ambient block.
  const compact = useMediaQuery("(max-width: 1023px)");
  return reduce || compact ? (
    <AmbientFilm reduce={reduce} content={c} />
  ) : (
    <ScrubbedFilm content={c} />
  );
}
