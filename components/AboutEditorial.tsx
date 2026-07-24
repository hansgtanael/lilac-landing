"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";

/** Photo with a scroll-scrubbed parallax drift — the image is oversized
 *  inside a clipping frame so the travel never exposes an edge. */
function ParallaxPhoto({
  src,
  alt,
  className = "",
  drift = 5,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  /** Max travel as % of frame height (negative flips direction). */
  drift?: number;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [`${drift}%`, `${-drift}%`]);
  const y = reduce ? "0%" : raw;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y, willChange: "transform" }}
        className="absolute -inset-y-[10%] inset-x-0"
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}

/** The About section in the Figma "Slow Lake" v2 grammar: one calm story
 *  BAND per area (Main Floor / Upper Level / Outdoors), all on the page
 *  cream (#FDFBF7). Each band pairs an uppercase headline + paragraph text
 *  column with a feature photo, then an optional secondary photo PAIR
 *  (bleed / grid / overlap) and a small editorial CAPTION. After the last
 *  band comes the deep-lilac CLOSING line. All copy and photos come from
 *  `site.text.about` (CMS); a band may omit its feature (text-only) and its
 *  pair, and empty photo srcs are filtered so /cms edits never break. */
export default function AboutEditorial() {
  const site = useSiteContent();
  const { about } = site.text;
  const reduce = useReducedMotion();

  const fade = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  const headingClass =
    "font-display text-[1.6rem] font-bold uppercase tracking-[0.01em] leading-[1.2] text-dark md:text-[1.8rem]";
  const paragraphsClass =
    "flex flex-col gap-5 font-editorial text-[15px] leading-[1.75] text-dark/85 md:text-base max-w-[560px]";

  return (
    <section id="about" className="bg-cream pt-24 lg:pt-[180px]">
      {about.sections.map((s, i) => {
        const textRight = (s.textSide ?? "right") === "right";
        const pairPhotos = (s.pair ?? []).filter((p) => p.src);
        // Feature photo proportion from Figma: tall (685x847), wide (685x458),
        // or a 4/5 fallback for bands without an explicit shape.
        const featAspect =
          s.featureShape === "tall"
            ? "aspect-[685/846]"
            : s.featureShape === "wide"
              ? "aspect-[685/458]"
              : "aspect-[4/5]";
        // First band's opening row hugs the section top; every later row/band
        // block picks up the shared inter-row rhythm.
        const rowMt = i === 0 ? "" : "mt-16 lg:mt-[120px]";
        const paragraphs = (
          <div className={paragraphsClass}>
            {s.paragraphs.map((p, pi) => (
              <p key={pi}>{p}</p>
            ))}
          </div>
        );

        return (
          <div key={i}>
            {/* a) HEADLINE + TEXT + FEATURE */}
            {s.feature ? (
              textRight ? (
                // Feature — text right, photo left (Main Floor).
                <div
                  className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-[47.6%_1fr] lg:gap-0 ${rowMt}`}
                >
                  <div className="lg:pl-[22px]">
                    <ParallaxPhoto
                      src={s.feature.src}
                      alt={s.feature.alt}
                      className={`${featAspect} w-full`}
                    />
                  </div>
                  <motion.div
                    {...fade}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="flex flex-col gap-6 px-6 lg:pl-[140px] lg:pr-[22px] lg:pt-0"
                  >
                    <div className="flex max-w-[566px] flex-col gap-6">
                      <h3 className={headingClass}>{s.title}</h3>
                      {paragraphs}
                    </div>
                  </motion.div>
                </div>
              ) : (
                // Feature — text left, photo right (Upper Level).
                <div
                  className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-[40.8%_1fr] lg:gap-0 ${rowMt}`}
                >
                  <motion.div
                    {...fade}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="flex flex-col gap-6 px-6 lg:pl-[22px]"
                  >
                    <div className="flex max-w-[566px] flex-col gap-6">
                      <h3 className={headingClass}>{s.title}</h3>
                      {paragraphs}
                    </div>
                  </motion.div>
                  <div className="lg:order-2 lg:pl-[145px] lg:pr-[22px]">
                    <ParallaxPhoto
                      src={s.feature.src}
                      alt={s.feature.alt}
                      className={`${featAspect} w-full`}
                    />
                  </div>
                </div>
              )
            ) : (
              // Text-only band (Outdoors) — column starts at x731 of 1440.
              <motion.div
                {...fade}
                transition={{ duration: 0.7, ease: EASE }}
                className={`flex max-w-[569px] flex-col gap-6 px-6 lg:ml-[50.8%] lg:px-0 ${rowMt}`}
              >
                <h3 className={headingClass}>{s.title}</h3>
                {paragraphs}
              </motion.div>
            )}

            {/* b) PAIR row */}
            {pairPhotos.length > 0 && s.pairStyle === "bleed" && (
              <div className="mt-10 grid grid-cols-1 gap-6 overflow-hidden lg:mt-[64px] lg:grid-cols-[52.4%_1fr] lg:gap-[94px] lg:pl-[22px] lg:pr-0">
                <ParallaxPhoto
                  src={pairPhotos[0].src}
                  alt={pairPhotos[0].alt}
                  className="aspect-[733/1146] w-full"
                />
                {pairPhotos[1] && (
                  <ParallaxPhoto
                    src={pairPhotos[1].src}
                    alt={pairPhotos[1].alt}
                    className="aspect-[591/1028] w-full"
                  />
                )}
              </div>
            )}

            {pairPhotos.length > 0 && s.pairStyle === "grid" && (
              <div className="mt-16 grid grid-cols-1 items-start gap-6 lg:mt-[120px] lg:grid-cols-[47.7%_1fr] lg:gap-[140px] lg:pl-[22px] lg:pr-[22px]">
                <ParallaxPhoto
                  src={pairPhotos[0].src}
                  alt={pairPhotos[0].alt}
                  className="aspect-[687/458] w-full"
                />
                {pairPhotos[1] && (
                  <ParallaxPhoto
                    src={pairPhotos[1].src}
                    alt={pairPhotos[1].alt}
                    className="aspect-[569/380] w-full lg:max-w-[569px]"
                  />
                )}
              </div>
            )}

            {pairPhotos.length > 0 && s.pairStyle === "overlap" && (
              <div className="relative mt-16 lg:mt-[120px] lg:pl-[22px] lg:pr-[22px]">
                <ParallaxPhoto
                  src={pairPhotos[0].src}
                  alt={pairPhotos[0].alt}
                  className="aspect-[1396/1010] w-full"
                />
                {pairPhotos[1] && (
                  <>
                    {/* Mobile — the second photo stacks below the first. */}
                    <ParallaxPhoto
                      src={pairPhotos[1].src}
                      alt={pairPhotos[1].alt}
                      className="mt-6 aspect-[569/1018] w-full lg:hidden"
                    />
                    {/* Desktop — overlaps in from the right edge. */}
                    <div className="absolute right-[22px] top-0 hidden w-[39.5%] lg:block">
                      <ParallaxPhoto
                        src={pairPhotos[1].src}
                        alt={pairPhotos[1].alt}
                        className="aspect-[569/1018] max-h-[80%] shadow-[0_24px_60px_rgba(44,40,37,0.18)]"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* c) CAPTION */}
            {s.caption?.length ? (
              <motion.div
                {...fade}
                transition={{ duration: 0.7, ease: EASE }}
                className="mt-8 flex max-w-[332px] flex-col gap-4 px-6 lg:ml-[59%] lg:mt-[80px] lg:px-0"
              >
                {s.caption.map((p, ci) => {
                  const sep = p.indexOf(" - ");
                  if (sep !== -1) {
                    return (
                      <p
                        key={ci}
                        className="font-editorial text-sm leading-[1.65] text-dark/70"
                      >
                        <strong className="font-display font-bold text-dark">
                          {p.slice(0, sep)}
                        </strong>
                        <span>{" - " + p.slice(sep + 3)}</span>
                      </p>
                    );
                  }
                  if (ci === s.caption!.length - 1) {
                    return (
                      <p
                        key={ci}
                        className="font-display text-sm font-bold leading-[1.65] text-dark"
                      >
                        {p}
                      </p>
                    );
                  }
                  return (
                    <p
                      key={ci}
                      className="font-editorial text-sm leading-[1.65] text-dark/70"
                    >
                      {p}
                    </p>
                  );
                })}
              </motion.div>
            ) : null}
          </div>
        );
      })}

      {/* Closing statement — deep lilac on the page cream. */}
      <motion.p
        {...fade}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto max-w-[1080px] px-6 pb-20 pt-12 text-center font-display text-[1.6rem] italic leading-[1.45] text-brand md:text-[2.625rem] lg:pb-[400px] lg:pt-[130px]"
      >
        {about.closing}
      </motion.p>
    </section>
  );
}
