"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";

/** "The Property" — restyled after the Bellavista template's "A CLOSER LOOK"
 *  gallery (2026-07-23): a deep-plum full-bleed band, centered tagline over a
 *  big uppercase title, and a horizontal snap-scroll rail of every photo with
 *  alternating tile widths. Clicking any tile still opens the full-screen
 *  caption gallery (Elle's numbered captions live there). */
export default function PropertyStrip() {
  const site = useSiteContent();
  const PHOTOS = site.property.photos;
  const N = PHOTOS.length;

  // Lightbox tabs — grouped from each photo's `area` field (content.json), in
  // list order. Photos without an area fall into a catch-all "Photos" tab.
  const GROUPS = PHOTOS.reduce<{ title: string; idx: number[] }[]>((acc, p, i) => {
    const title = p.area ?? "Photos";
    const g = acc.find((x) => x.title === title);
    if (g) g.idx.push(i);
    else acc.push({ title, idx: [i] });
    return acc;
  }, []);

  const groupOf = (i: number) => Math.max(0, GROUPS.findIndex((g) => g.idx.includes(i)));
  const reduce = useReducedMotion();
  // `active` is both "is the gallery open" and "which photo to open on".
  const [active, setActive] = useState<number | null>(null);
  // Which area tab is showing inside the lightbox.
  const [tab, setTab] = useState(0);
  // `current` tracks the photo nearest the top as the gallery scrolls.
  const [current, setCurrent] = useState(0);
  // Portal target exists only after mount (SSR has no document).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const scrollRef = useRef<HTMLDivElement>(null);
  // One-shot jump target: opening from a rail tile scrolls to that photo once
  // its tab renders; plain tab switches reset to the top instead.
  const pendingJump = useRef<number | null>(null);

  const open = useCallback((i: number) => {
    pendingJump.current = i;
    setTab(groupOf(i));
    setActive(i);
  }, []);
  const close = useCallback(() => setActive(null), []);

  // Escape + body-scroll lock + Lenis pause while the gallery is open.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (window as unknown as { __lilacLenis?: { stop(): void; start(): void } })
      .__lilacLenis;
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [active, close]);

  // On open (or tab switch): jump to the clicked photo if one is pending,
  // otherwise start the tab at the top, then keep the counter in sync with a
  // thin observation band near the top of the scroll area.
  useEffect(() => {
    if (active === null) return;
    const root = scrollRef.current;
    if (!root) return;

    const jump = pendingJump.current;
    pendingJump.current = null;
    const target =
      jump !== null ? root.querySelector<HTMLElement>(`[data-photo-index="${jump}"]`) : null;
    if (target) {
      setCurrent(jump!);
      root.scrollTo({ top: Math.max(target.offsetTop - 8, 0), behavior: "auto" });
    } else {
      setCurrent(GROUPS[tab]?.idx[0] ?? 0);
      root.scrollTo({ top: 0, behavior: "auto" });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.photoIndex);
          if (!Number.isNaN(idx)) setCurrent(idx);
        }
      },
      { root, rootMargin: "-8% 0px -80% 0px", threshold: 0 },
    );
    root.querySelectorAll<HTMLElement>("[data-photo-index]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [active, tab]);

  const rise = {
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
  } as const;

  return (
    <section
      id="property"
      className="scroll-mt-22 bg-cream py-20 md:py-[var(--sp-property-y,3rem)]"
    >
      {/* Centered header — small tracked line over the big uppercase title,
          per the reference's "A CLOSER LOOK" block. */}
      <div className="mb-10 px-6 text-center md:mb-14">
        <motion.p
          {...rise}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-xs uppercase tracking-[0.25em] text-dark/55 md:text-sm"
        >
          {site.property.tagline}
        </motion.p>
        <motion.h2
          {...rise}
          transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
          className="mt-4 font-display text-[clamp(2.5rem,7vw,6rem)] font-light uppercase leading-[0.95] text-dark"
        >
          {site.property.heading}
        </motion.h2>
      </div>

      {/* Auto-rotating photo rail — the set is doubled and marquees −50% on a
          linear infinite loop (--rail-speed, SpacingTuner "Gallery speed").
          Per-tile mr (not container gap) keeps the two halves exactly equal so
          the seam never shows. Any tile still opens the lightbox; widths
          alternate on the BASE index so both halves match. */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="overflow-hidden pb-4"
      >
        <div className="flex w-max animate-[marquee-x_var(--rail-speed,120s)_linear_infinite] motion-reduce:[animation-play-state:paused]">
          {[...PHOTOS, ...PHOTOS].map((photo, idx) => {
            const i = idx % PHOTOS.length;
            return (
              <button
                key={`${photo.src}-${idx}`}
                type="button"
                onClick={() => open(i)}
                aria-label={`View photo: ${photo.alt}`}
                className={`group relative mr-3 h-[46svh] max-h-[560px] min-h-[300px] flex-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-deep md:mr-4 ${
                  i % 3 === 0 ? "w-[78vw] md:w-[44vw]" : "w-[62vw] md:w-[24vw]"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={i % 3 === 0 ? "(max-width: 768px) 78vw, 44vw" : "(max-width: 768px) 62vw, 24vw"}
                  className={
                    reduce
                      ? "object-cover"
                      : "object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                  }
                  priority={idx === 0}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-dark/10 opacity-0 transition-opacity duration-300 ease-luxe group-hover:opacity-100"
                />
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Full-screen gallery, grouped by room area. PORTALED to <body>: the
          page's z-10 cream wrapper is a stacking context, so without the
          portal this dialog would paint UNDER the z-40 nav (the logo used to
          overlap the close button). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
        {active !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="All property photos"
            className="fixed inset-0 z-[80] flex flex-col bg-cream"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {/* Top bar: close on the left, live photo counter centered. */}
            <div className="relative flex items-center border-b border-dark/10 px-5 py-4 md:px-8">
              <button
                type="button"
                onClick={close}
                aria-label="Close gallery"
                className="grid h-10 w-10 place-items-center rounded-full text-dark transition duration-200 ease-out hover:bg-dark/5 active:scale-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-medium tabular-nums text-dark/70">
                {Math.max(0, GROUPS[tab]?.idx.indexOf(current) ?? 0) + 1} /{" "}
                {GROUPS[tab]?.idx.length ?? N}
              </span>
            </div>

            {/* Area tabs — click through to the section of photos to view. */}
            <div className="flex justify-start gap-6 overflow-x-auto border-b border-dark/10 px-5 md:justify-center md:gap-10 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {GROUPS.map((group, gi) => (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => setTab(gi)}
                  className={`whitespace-nowrap border-b-2 py-3 text-xs uppercase tracking-[0.18em] transition-colors duration-200 ease-out md:text-sm ${
                    gi === tab
                      ? "border-dark text-dark"
                      : "border-transparent text-dark/45 hover:text-dark/75"
                  }`}
                >
                  {group.title}
                </button>
              ))}
            </div>

            {/* Scrollable photo column for the active tab. data-lenis-prevent:
                Lenis is stopped while the dialog is open and would otherwise
                swallow wheel events before they reach this inner scroller. */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="relative flex-1 overflow-y-auto"
            >
              <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                  {(GROUPS[tab]?.idx ?? []).map((i, pos) => {
                    const photo = PHOTOS[i];
                    const full = pos % 3 === 0;
                    return (
                      <figure
                        key={photo.src}
                        data-photo-index={i}
                        className={full ? "md:col-span-2" : undefined}
                      >
                        <div
                          className={`relative overflow-hidden ${
                            full ? "aspect-[16/10]" : "aspect-[4/3]"
                          }`}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            sizes={
                              full
                                ? "(max-width: 768px) 100vw, 1024px"
                                : "(max-width: 768px) 100vw, 512px"
                            }
                            className="object-cover"
                          />
                        </div>
                        <figcaption className="mt-2 text-sm leading-snug text-dark/55">
                          {photo.alt}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
