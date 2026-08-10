"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSiteContent } from "@/components/site-content";

/** "View Our Rooms" — Bellavista full-viewport rooms treatment, v2 grammar:
 *  hovering (or focusing) a room TITLE fades that room's photo across the
 *  ENTIRE block, replacing the resting cover. The MASK (var --rooms-mask)
 *  dims the RESTING COVER ONLY, so the titles and wordmark read cleanly
 *  against it, then lifts as a room photo comes in so that photo shows at
 *  full brightness. Small underlined "View Our Rooms" wordmark sits at the
 *  bottom of the visible viewport.
 *
 *  The block is h-[calc(var(--rooms-vh,100svh)+240px)] and `isolate`: the
 *  height var is tunable (viewport share), the 240px overhang runs behind
 *  the later <WaveHills /> sibling (pulled up in page.tsx), whose hill SVGs
 *  have transparent tops — the photo shows through above the crests.
 *
 *  Layer stack (desktop), bottom → top:
 *    0. resting cover photo (container base)
 *    1. three full-container room photos, each opacity 0 → 100 while its
 *       title is hovered/focused (slow 1200ms fade — no harsh reveal)
 *    2. column divider hairlines (non-interactive)
 *    3. mask, opacity var(--rooms-mask,0.45) at rest -> 0 while hovering
 *    4. titles/desc + bottom wordmark (z-30, soft text-shadow)
 *
 *  Hover state is React state (a title's reveal targets a SIBLING layer, out
 *  of reach of CSS group-hover). Initial state null on server and client, so
 *  hydration is stable. Reduced motion drops transitions via motion-reduce. */
export default function ViewRooms() {
  const site = useSiteContent();
  const { about } = site.text;
  const [hovered, setHovered] = useState<number | null>(null);
  // Clicking a room opens its photo popup (per-room `photos` from the Studio).
  const [openRoom, setOpenRoom] = useState<number | null>(null);
  // Portal target exists only after mount (SSR has no document).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape + body-scroll lock + Lenis pause while the popup is open — the
  // same contract as PropertyStrip's lightbox.
  useEffect(() => {
    if (openRoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenRoom(null);
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
  }, [openRoom]);

  if (!about.rooms?.length) return null;

  const rooms = about.rooms;
  const cover = about.roomsCover;
  const fade =
    "transition-opacity duration-[1200ms] ease-luxe motion-reduce:transition-none";

  return (
    <div id="view-rooms" className="mt-[10vh] md:mt-[14vh]">
      {/* DESKTOP — full-viewport hover stage. The section (#about) has no
          horizontal padding, so the block is already edge-to-edge. */}
      <div className="relative isolate hidden h-[calc(var(--rooms-vh,76svh)+240px)] overflow-hidden md:block">
        {/* 0. resting cover */}
        {cover && (
          <Image src={cover.src} alt={cover.alt} fill sizes="100vw" className="object-cover" />
        )}
        {/* 1. full-bleed room photos — one fades in per hovered title */}
        {rooms.map((r, i) => (
          <Image
            key={r.src}
            src={r.src}
            alt={r.alt}
            fill
            sizes="100vw"
            className={`z-10 object-cover ${fade} ${hovered === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {/* 2. divider hairlines (template's thin panel gaps) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3">
          <div />
          <div className="border-x border-light/20" />
          <div />
        </div>
        {/* 3. mask — dims the RESTING COVER so the titles and the wordmark read
               cleanly against it, then lifts as a room photo fades in so that
               photo shows at full brightness. Transitions on the same 1200ms
               curve as the photo, so dim-out and fade-in move together rather
               than stepping. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-20 bg-dark ${fade} ${
            hovered === null ? "opacity-[var(--rooms-mask,0.45)]" : "opacity-0"
          }`}
        />
        {/* 4. titles — hover/focus the TEXT to reveal that room full-bleed */}
        <div className="absolute inset-0 z-30 grid grid-cols-3">
          {rooms.map((r, i) => (
            <div key={r.src} className="flex flex-col items-center justify-center px-4 text-center">
              <button
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                onClick={() => setOpenRoom(i)}
                /* Two-layer shadow: a tight dark edge for letterform contrast
                   plus a wide soft halo that separates the text from whatever
                   is behind it. Needed because the mask now lifts on hover, so
                   these titles can land on a bright white bedroom wall with no
                   dim behind them at all. Cheaper than re-dimming the photo,
                   which is the thing we deliberately stopped doing. */
                className="cursor-pointer outline-none [text-shadow:0_1px_3px_rgba(44,40,37,0.65),0_2px_28px_rgba(44,40,37,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-light/70"
              >
                <span className="block font-display text-[clamp(1.5rem,2.4vw,2.75rem)] font-light uppercase italic leading-none text-light/90">
                  {r.title}
                </span>
                <span className="mt-2 block text-[clamp(0.7rem,1vw,0.95rem)] uppercase tracking-wide text-light/70">
                  {r.floor}
                </span>
                {/* mx-auto: the 26ch box is a block, so without it the box sits
                    flush-left in the button and the centered text reads off-axis
                    against the wider title above it. */}
                <span
                  className={`mx-auto mt-4 block max-w-[26ch] text-sm font-normal normal-case not-italic text-light/90 md:text-base ${fade} ${
                    hovered === i ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {r.desc}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom wordmark — small, underlined, above the wave-overlap zone. */}
        {about.roomsTitle && (
          <p className="pointer-events-none absolute inset-x-0 bottom-[calc(240px+6svh)] z-30 text-center [text-shadow:0_1px_3px_rgba(44,40,37,0.65),0_2px_28px_rgba(44,40,37,0.85)]">
            <span className="inline-block border-b border-light/60 pb-2 text-[clamp(0.85rem,1.1vw,1.05rem)] uppercase tracking-[0.22em] text-light/90">
              {about.roomsTitle}
            </span>
          </p>
        )}
      </div>

      {/* MOBILE — static stacked rows; the pb keeps the wordmark clear of the
          -140px WaveHills overlap that rides over the block's bottom. */}
      <div className="grid grid-cols-1 pb-40 md:hidden">
        {rooms.map((r, i) => (
          <button
            key={r.src}
            type="button"
            onClick={() => setOpenRoom(i)}
            className="relative block h-[36svh] min-h-[260px] w-full overflow-hidden text-left"
          >
            <Image src={r.src} alt={r.alt} fill sizes="100vw" className="object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-dark opacity-[var(--rooms-mask,0.45)]" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="font-display text-[2.4rem] font-light uppercase italic leading-none text-light/90">
                {r.title}
              </span>
              <span className="mt-2 text-xs uppercase tracking-wide text-light/70">{r.floor}</span>
              <p className="mt-3 max-w-[30ch] text-sm text-light/90">{r.desc}</p>
            </div>
          </button>
        ))}
        {about.roomsTitle && (
          <p className="mt-8 text-center">
            {/* Sits on the section cream (not a photo) — dark ink, not light. */}
            <span className="inline-block border-b border-dark/40 pb-2 text-[0.85rem] uppercase tracking-[0.22em] text-dark/70">
              {about.roomsTitle}
            </span>
          </p>
        )}
      </div>

      {/* ROOM POPUP — full-screen gallery of the clicked room's photos.
          PORTALED to <body>: the page's z-10 cream wrapper is a stacking
          context that would otherwise trap this under the z-40 nav. */}
      {mounted &&
        openRoom !== null &&
        rooms[openRoom] &&
        createPortal(
          (() => {
            const r = rooms[openRoom];
            const photos = r.photos?.length ? r.photos : [{ src: r.src, alt: r.alt }];
            return (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`${r.title}, ${r.floor} — photos`}
                className="fixed inset-0 z-[90] flex flex-col bg-cream"
              >
                <div className="flex items-center justify-between border-b border-dark/10 px-5 py-4 md:px-8">
                  <div>
                    <p className="font-display text-xl italic leading-none text-dark">{r.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-dark/55">{r.floor}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenRoom(null)}
                    aria-label="Close room photos"
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
                </div>
                {/* data-lenis-prevent: Lenis is stopped while the popup is
                    open and would otherwise swallow wheel events before they
                    reach this inner scroller. */}
                <div data-lenis-prevent className="flex-1 overflow-y-auto">
                  <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6">
                    <p className="mb-6 text-sm leading-relaxed text-dark/60">{r.desc}</p>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {photos.map((p) => (
                        <figure key={p.src}>
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                              src={p.src}
                              alt={p.alt}
                              fill
                              sizes="(max-width: 768px) 100vw, 1152px"
                              className="object-cover"
                            />
                          </div>
                          <figcaption className="mt-2 text-sm leading-snug text-dark/55">
                            {p.alt}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })(),
          document.body,
        )}
    </div>
  );
}
