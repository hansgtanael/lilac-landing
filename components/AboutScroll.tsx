"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";
import ViewRooms from "@/components/ViewRooms";

/** A scroll-scrubbed parallax drift, porting Locomotive's data-scroll-speed.
 *  An in-view element translates proportionally to scroll and reads zero as
 *  its center crosses the viewport center; positive speed starts shifted
 *  down/right and drifts up/left. Distance = speed·7 in vh (y) or vw (x).
 *
 *  All hooks live HERE, never inside the parent's render loops, so the rules
 *  of hooks hold no matter how many bands /cms adds. useTransform is called
 *  unconditionally; the reduced-motion fallback is a static JSX branch. */
function Drift({
  speed,
  axis = "y",
  className,
  children,
}: {
  speed: number;
  axis?: "x" | "y";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const d = speed * 7;
  const unit = axis === "x" ? "vw" : "vh";
  // Neutralize motion for reduced-motion users via a flat [0,0] range instead
  // of a separate JSX branch, so the DOM shape (always motion.div) matches
  // between SSR and hydration; Motion re-syncs inline style on mount, so the
  // server's baked-in offset self-corrects rather than staying stuck.
  const raw = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [d, -d]);
  // The whole drift is damped by --drift-scale (SpacingTuner "Text drift",
  // set on #about; baked default 0.3 — Hans's pick, 2026-07-23; 1.0 = the
  // demo's dizzying full travel). var() resolves at paint time, so the
  // slider retunes live mid-scroll.
  const shift = useMotionTemplate`calc(${raw}${unit} * var(--drift-scale, 0.3))`;

  return (
    <motion.div
      ref={ref}
      style={{
        ...(axis === "x" ? { x: shift } : { y: shift }),
        ...(reduce ? {} : { willChange: "transform" }),
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Accent pretitle with the demo's "―" (U+2015) prefix. Exported so the
 *  ViewRooms row can reuse the exact About band label grammar. */
export function Pretitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[1.5rem] text-brand-deep md:text-[length:var(--about-label-size,2.25rem)] ${className}`}
    >
      <span className="mr-1">―</span>
      {children}
    </p>
  );
}

// Shared breakout styling: a bleeding, ghosted serif-italic line. The negative
// margins cancel the section padding so the line runs to the viewport edge;
// overflow-x-clip on the root keeps the nowrap line from widening the page.
const BREAKOUT =
  "-mx-6 whitespace-nowrap text-center font-display font-light uppercase italic leading-none text-dark/10 md:-mx-12";
// Long editorial column text sizing, shared by intro + section paragraphs.
const COLUMN_TEXT = "flex flex-col gap-[1em] text-[clamp(0.95rem,1.6vw,1.25rem)] leading-[1.5]";

// Outdoors stepped carousel (back by request, 2026-07-23): shows TWO photos
// at a time, dwells ~1.5s, then slides fast to the next pair. Set is fixed
// here (sunset/deck/dock pros + iPhone signatures), 6 photos = 3 clean pages.
const OUTDOORS = [
  { src: "/figma/IMG_0703.jpeg", alt: "Lilac Landing - Western Sunsets" },
  { src: "/figma/pro-deck.jpeg", alt: "Expansive furnished deck overlooking the lake" },
  { src: "/figma/rooms-cover-dock.jpeg", alt: "Lilac Landing from the dock" },
  { src: "/figma/pro-deck-lounge.jpeg", alt: "Deck lounge seating under the pergola" },
  { src: "/figma/IMG_4302.jpeg", alt: "Lakeside view" },
  { src: "/figma/pro-deck-view.jpeg", alt: "Deck seating with lake views" },
];
const DWELL_MS = 3000; // hold each pair (slowed from 1.5s — Hans, 2026-07-23)
const SLIDE_MS = 450; // then a FAST slide to the next pair

/** Two-up paged carousel: a track of half-width tiles steps one page (two
 *  photos) per tick. The first page is cloned onto the end so the wraparound
 *  slides forward seamlessly, then snaps back to page 0 with the transition
 *  disabled for one frame. Auto-advance pauses under reduced motion. */
function OutdoorsCarousel() {
  const reduce = useReducedMotion();
  const [page, setPage] = useState(0);
  const [anim, setAnim] = useState(true);
  const pages = Math.ceil(OUTDOORS.length / 2);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setPage((p) => p + 1), DWELL_MS + SLIDE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (page !== pages) return;
    // Landed on the clone — after the slide finishes, snap home untransitioned.
    const t = setTimeout(() => {
      setAnim(false);
      setPage(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    }, SLIDE_MS + 50);
    return () => clearTimeout(t);
  }, [page, pages]);

  const slides = [...OUTDOORS, ...OUTDOORS.slice(0, 2)];
  return (
    <div className="-mx-6 mt-12 overflow-hidden md:-mx-12 md:mt-[7.25rem]">
      <div
        className={`flex ${anim ? "transition-transform duration-[450ms] ease-luxe motion-reduce:transition-none" : ""}`}
        style={{ transform: `translateX(-${page * 100}%)` }}
      >
        {slides.map((p, i) => (
          <div key={`${p.src}-${i}`} className="w-1/2 flex-none px-[3px] md:px-1">
            <div className="relative h-[34vh] min-h-[240px] overflow-hidden md:h-[45vh]">
              <Image src={p.src} alt={p.alt} fill sizes="50vw" className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** About section in the Codrops "TileScroll" text grammar: numbered scroll
 *  blocks with vertical parallax on titles/paragraphs and horizontal drift on
 *  the ghosted breakout lines. Text-only — the story bands' feature/pair/photo
 *  fields are intentionally ignored. All copy comes from `site.text.about`. */
export default function AboutScroll() {
  const site = useSiteContent();
  const { about } = site.text;
  // The ghost breakout lines come from about.closing in /cms, split into
  // sentences: first = the big 13vw line, second = the medium 5vw one. Quotes
  // and trailing periods stripped — uppercase ghost type reads wrong with them.
  const closingLines = about.closing
    .replace(/[“”]/g, "")
    .split(/(?<=\.)\s+/)
    .map((s) => s.replace(/\.$/, ""))
    .filter(Boolean);
  return (
    <section
      id="about"
      className="relative scroll-mt-22 overflow-x-clip bg-cream font-display text-dark"
    >
      {/* INTRO — centered column, mirroring the old header treatment; the
          section's welcome heading now lives in GalleryNoir's title above. */}
      <div className="relative flex flex-col items-center p-6 text-center md:p-12 md:pt-[var(--about-intro-top,5rem)]">
        <Drift speed={2} className={`${COLUMN_TEXT} md:w-[65vw] md:max-w-[860px]`}>
          {about.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Drift>
      </div>

      {/* BREAKOUT — the closing quote as ghost lines: big drifts left
          (speed 3), medium drifts right (−1). */}
      {closingLines.length > 0 && (
        <div className="flex min-h-0 flex-col justify-start px-6 pt-[var(--about-gap-carousel-top,4vh)] pb-[var(--about-gap-carousel-bottom,7vh)] md:px-12">
          <Drift speed={3} axis="x">
            <p className={`${BREAKOUT} text-[13vw]`}>{closingLines[0]}</p>
          </Drift>
          {closingLines[1] && (
            // Full traversal: enters at the LEFT edge and exits at the RIGHT
            // once the section is scrolled past (speed −6 ≈ ±25vw at the
            // baked 0.6 drift scale for this ~50vw-wide line).
            <Drift speed={-6} axis="x">
              <p className={`${BREAKOUT} text-[5vw]`}>{closingLines[1]}</p>
            </Drift>
          )}
        </div>
      )}

      {/* Story bands, generously separated so the drifting text never crowds
          the neighboring band. */}
      {about.sections.map((s, i) => (
        <div key={i} className="mt-[var(--about-gap-band-sm,3vh)] md:mt-[var(--about-gap-band,4vh)]">
          <div className="relative flex min-h-[70svh] flex-col justify-start p-6 md:p-12">
            {/* Label sits OPPOSITE its text block so the drifting column never
                slides up into it: text right → label left (unchanged); text
                left → label pushed right. */}
            <Pretitle className={s.textSide === "right" ? "" : "self-end text-right"}>
              {s.title}
            </Pretitle>
            {s.feature ? (
              // Band with a STATIC feature photo (no drift, no carousel) on
              // the side opposite the text: text right → photo left, and vice
              // versa. Photo proportions follow the CMS featureShape.
              <div
                className={`mt-8 grid grid-cols-1 items-start gap-8 md:mt-[var(--about-gap-label,2rem)] md:gap-12 ${
                  // Photo column width is tunable (SpacingTuner "Feature photo",
                  // --about-feature-w on #about); the photo tracks whichever
                  // side it sits on.
                  s.textSide === "right"
                    ? "md:[grid-template-columns:var(--about-feature-w,45%)_1fr]"
                    : "md:[grid-template-columns:1fr_var(--about-feature-w,45%)]"
                }`}
              >
                {s.textSide === "right" && (
                  <div
                    className={`relative w-full overflow-hidden ${
                      s.featureShape === "wide"
                        ? "aspect-[685/458]"
                        : "[aspect-ratio:var(--about-feature-ar,1.09)]"
                    }`}
                  >
                    <Image
                      src={s.feature.src}
                      alt={s.feature.alt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover object-[var(--about-feature-x,45%)_var(--about-feature-y,41%)]"
                    />
                  </div>
                )}
                <Drift speed={2} className={COLUMN_TEXT}>
                  {s.paragraphs.map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                </Drift>
                {s.textSide !== "right" && (
                  <div
                    className={`relative w-full overflow-hidden ${
                      s.featureShape === "wide"
                        ? "aspect-[685/458]"
                        : "[aspect-ratio:var(--about-feature-ar,1.09)]"
                    }`}
                  >
                    <Image
                      src={s.feature.src}
                      alt={s.feature.alt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover object-[var(--about-feature-x,45%)_var(--about-feature-y,41%)]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <Drift
                speed={2}
                className={`${COLUMN_TEXT} md:w-[60vw] md:min-w-[calc(300px-6rem)] md:max-w-[820px] ${
                  s.textSide === "right" ? "self-end" : "self-start"
                }`}
              >
                {s.paragraphs.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </Drift>
            )}
            {/* Outdoors band only (index 2 today): the two-up stepped carousel. */}
            {i === 2 && <OutdoorsCarousel />}
          </div>
        </div>
      ))}

      {/* "View Our Rooms" hover row, directly under the Outdoors band. */}
      <ViewRooms />
    </section>
  );
}
