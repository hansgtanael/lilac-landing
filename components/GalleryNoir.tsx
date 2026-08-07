"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type Lenis from "lenis";
import {
  animate,
  cubicBezier,
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useSiteContent } from "@/components/site-content";
import type { SiteContent } from "@/lib/content";

// Whole-house tour order (client-picked), one kitchen shot. Each becomes a
// full-viewport panel in the horizontal strip. Content is edited through the Studio
// and imported typed from lib/content; timing/zIndex math below derives from
// ROOMS.length, so any count >= 2 works.

// Scroll budget in svh. Small on purpose: the gather and spread PLAY on their
// own clocks (scroll locks while they run), and browsing the photos is BUTTONS,
// not scroll — the section only needs the trigger runway plus a short tail
// before the pin releases and the page simply scrolls on to the next section.
const INTRO_SVH = 60; // trigger runway (one scroll starts the full clip)
const TAIL_SVH = 40; // short dwell after the spread before the pin releases
const SCROLL_SVH = INTRO_SVH + TAIL_SVH; // pinned scroll range
const SECTION_SVH = SCROLL_SVH + 100; // + the pinned viewport itself

// Choreography — flat-stack variant per the client's direction:
//   pose    every card is pulled to the viewport center (x −i·100%) and waits
//           just below the frame: FLAT, scale 0.8, y 95%, zIndex COUNT−i
//   gather  TIMED: one scroll past the title triggers it; the page locks and
//           cards slide straight up, layering cleanly into a centered stack
//           (stackScale, dev-tunable) — 1.1s each, 0.18s REVERSE stagger,
//           card 0 tops the pile last
//   spread  TIMED, CONTINUOUS: after a short beat the bloom follows in the
//           same locked clip — every card scales stackScale → 1 while
//           sliding one viewport off, alternating left/right; card 0 stays
//           and becomes the strip's first framed photo (1.0s)
//   browse  BUTTONS: left/right pills fade in bottom-center and drive the
//           strip one photo at a time; scrolling never moves the photos, it
//           just carries the visitor on to the next section

const FLIP_DUR = 1.1; // s — per-card rise
const STAGGER = 0.18; // s — reverse stagger between cards
const MEDIA_SETTLE = 1.5; // s — inner media 1.6 → 1 settle
const DEAL_DUR = 1.0; // s — the timed spread bloom
const SPREAD_PAUSE = 0.2; // s — beat between the stack landing and the bloom
const GATHER_TRIGGER = 8 / SCROLL_SVH; // scroll depth that starts the sequence

// Stack size — the scale every card gathers into before the bloom. Hans's
// dev slider (FrameTuner) drives it live; 0.45 is the baked default
// (Hans, 2026-07-15; was 0.35, originally 0.25).
const stackScale = motionValue(0.45);

const CARD_RADIUS = 0; // px — corners stay square through the deck (Hans, 2026-07-15)

const SECTION = "bg-cream font-helvetica tracking-[-0.015em] text-dark";

// The reference's easing pair: enter = easeOutQuart, move = easeInOutQuart.
const enterEase = cubicBezier(0.25, 1, 0.5, 1);
const moveEase = cubicBezier(0.77, 0, 0.175, 1);

/** Dev-only exploration sliders (Hans): photo frame padding + corner radius.
 *  Writes CSS vars on the #gallery section, persists to localStorage. The
 *  baked defaults (24px pad / 0 radius - Hans's pick, 2026-07-14) live as the
 *  vars' fallbacks in Panel; these sliders start there for exploration. */
function FrameTuner() {
  const [open, setOpen] = useState(false);
  const [pad, setPad] = useState(24);
  const [rad, setRad] = useState(0);
  const [stack, setStack] = useState(stackScale.get());
  // Persist only after a deliberate slider move — otherwise stale saves would
  // silently shadow the baked defaults on every mount.
  const touched = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lilac-gallery-frame") ?? "{}");
      if (saved.touched === true) {
        if (typeof saved.pad === "number") setPad(saved.pad);
        if (typeof saved.rad === "number") setRad(saved.rad);
        if (typeof saved.stack === "number") setStack(saved.stack);
        touched.current = true;
      }
    } catch {
      /* fresh start */
    }
  }, []);
  useEffect(() => {
    const el = document.getElementById("gallery");
    if (!el) return;
    el.style.setProperty("--gallery-pad", `${pad}px`);
    el.style.setProperty("--gallery-radius", `${rad}px`);
    stackScale.set(stack);
    if (touched.current) {
      localStorage.setItem(
        "lilac-gallery-frame",
        JSON.stringify({ pad, rad, stack, touched: true }),
      );
    }
  }, [pad, rad, stack]);
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div data-no-edit className="absolute bottom-6 left-6 z-40 font-sans">
      {open ? (
        <div className="w-64 rounded-2xl bg-dark/90 p-4 text-light shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-light/70">Photo frame</p>
            <button onClick={() => setOpen(false)} className="text-light/60 hover:text-light">
              ×
            </button>
          </div>
          <label className="block text-[12px] text-light/80">
            Padding <span className="text-light/50">{pad}px</span>
            <input
              type="range"
              min={0}
              max={96}
              value={pad}
              onChange={(e) => {
                touched.current = true;
                setPad(Number(e.target.value));
              }}
              className="mt-1 w-full accent-[#c4a9c2]"
            />
          </label>
          <label className="mt-3 block text-[12px] text-light/80">
            Corner radius <span className="text-light/50">{rad}px</span>
            <input
              type="range"
              min={0}
              max={40}
              value={rad}
              onChange={(e) => {
                touched.current = true;
                setRad(Number(e.target.value));
              }}
              className="mt-1 w-full accent-[#c4a9c2]"
            />
          </label>
          <label className="mt-3 block text-[12px] text-light/80">
            Stack size <span className="text-light/50">{Math.round(stack * 100)}%</span>
            <input
              type="range"
              min={0.2}
              max={0.6}
              step={0.01}
              value={stack}
              onChange={(e) => {
                touched.current = true;
                setStack(Number(e.target.value));
              }}
              className="mt-1 w-full accent-[#c4a9c2]"
            />
          </label>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-dark/80 px-4 py-2 text-[12px] text-light/90 shadow-lg backdrop-blur-sm"
        >
          Frame
        </button>
      )}
    </div>
  );
}

/** One full-screen photo panel. The flat rise into the stack and the spread
 *  bloom both PLAY on their own clocks (`play`, `dealT` — driven by the stage
 *  machine in PinnedHorizontal); `settled` flips to 1 once browsing begins,
 *  parking every card at its natural strip position. Nothing in here reads
 *  the scroll. The photo sits inside a padded frame (tuner CSS vars
 *  --gallery-pad / --gallery-radius) so it breathes at the viewport edges. */
function Panel({
  room,
  index,
  play,
  dealT,
  settled,
  composed,
  live,
}: {
  room: SiteContent["house"]["rooms"][number];
  index: number;
  play: boolean;
  dealT: MotionValue<number>;
  settled: MotionValue<number>;
  composed: boolean;
  /** True once the gather/spread clip has landed and browsing is on — video
   *  cards hold their poster frame until then, and rewind when the stage
   *  re-arms. */
  live: boolean;
}) {
  const site = useSiteContent();
  const COUNT = site.house.rooms.length;
  // Video card ("src" is an .mp4): playback is gated on `live` so the clip
  // starts exactly when the intro animation ends and the frame is full.
  const isVideo = room.src.endsWith(".mp4");
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!isVideo || !v) return;
    if (live) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [live, isVideo]);
  // Timed rise progress, 0 → 1. Reverse stagger: the LAST card rises first,
  // the top card (index 0) lands on the pile last — the reference's deal-in.
  const flipT = useMotionValue(0);
  const mediaT = useMotionValue(0);
  useEffect(() => {
    if (!play) {
      flipT.set(0);
      mediaT.set(0);
      return;
    }
    const flip = animate(flipT, 1, {
      duration: FLIP_DUR,
      delay: (COUNT - 1 - index) * STAGGER,
      ease: enterEase,
    });
    const media = animate(mediaT, 1, { duration: MEDIA_SETTLE, ease: enterEase });
    return () => {
      flip.stop();
      media.stop();
    };
  }, [play, index, flipT, mediaT]);

  // Deal direction: card 0 stays and grows to the framed full view; the rest
  // slide one viewport off, alternating left/right (even left, odd right).
  const dealOff = index === 0 ? 0 : index % 2 === 0 ? -100 : 100;

  const y = useTransform(flipT, (t) => `${95 * (1 - t)}%`);
  // dealT arrives already eased (animated with moveEase) — read it raw.
  // stackScale is live (dev slider), so the stack resizes as Hans tunes it.
  const scale = useTransform([flipT, dealT, stackScale] as const, (v: number[]) => {
    const [f, d, s] = v;
    return d > 0 ? s + (1 - s) * d : 0.8 + (s - 0.8) * f;
  });
  // x pulls the card onto the viewport (−index·100%) through pose/rise/spread,
  // slides it off during the bloom, then steps to its natural strip position
  // once browsing begins — both step endpoints are off-screen for every card
  // except card 0 (which is identical on both sides), so it can never flash.
  const x = useTransform([settled, dealT] as const, (v: number[]) => {
    const [s, d] = v;
    if (s >= 1) return "0%";
    return `${-index * 100 + dealOff * d}%`;
  });
  // Card corners ease from the deck radius down to the frame radius (baked
  // default 0 - sharp edges per Hans; still explorable via the dev tuner).
  const radius = useTransform(dealT, (d) => CARD_RADIUS * (1 - d));
  const frameRadius = useMotionTemplate`max(${radius}px, var(--gallery-radius, 0px))`;
  // Inner media settles 1.6 → 1 as the stack forms. (No pan parallax — the
  // client found it disorienting.)
  const mediaScale = useTransform(mediaT, (t) => 1.6 - 0.6 * t);

  // Two variants for the composed browse layout: card index 2 centers its
  // photo between title/caption columns; every other card leads with the photo.
  const variant = index === 2 ? "center" : "left";
  // The rounded photo clip — mediaScale + fill Image. Reused across both
  // states; panels are offscreen when `composed` flips, so no remount flash
  // is possible. Only the responsive `sizes` hint changes per use.
  const clip = (sizes: string) => (
    <motion.div
      style={{ borderRadius: frameRadius }}
      className="relative h-full w-full overflow-hidden"
    >
      <motion.div style={{ scale: mediaScale }} className="absolute inset-0 will-change-transform">
        {isVideo ? (
          <video
            ref={videoRef}
            src={room.src}
            poster={room.poster}
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={room.src}
            alt={room.title}
            fill
            priority={index === 0}
            sizes={sizes}
            className="object-cover"
          />
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <motion.figure
      style={{ y, scale, x, zIndex: COUNT - index, padding: composed ? 0 : "var(--gallery-pad, 24px)" }}
      className="relative h-svh w-screen shrink-0 bg-cream will-change-transform"
    >
      {!composed ? (
        // STATE A — classic padded photo card. Photos only, no text: this is
        // the pose / gather / spread look and the browse look for card 0.
        clip("100vw")
      ) : variant === "center" ? (
        // STATE B (center) — narrow centered photo with title left, caption right.
        <>
          <div className="absolute inset-y-[10svh] left-1/2 w-[34%] -translate-x-1/2">
            {clip("(min-width:1024px) 40vw, 100vw")}
          </div>
          <div className="absolute inset-y-0 left-[7%] flex w-[20%] flex-col justify-center">
            <h3 className="font-display text-[1.75rem] italic leading-[1.05] text-dark md:text-[2rem]">
              {room.title}
            </h3>
          </div>
          {room.caption && (
            <div className="absolute inset-y-0 right-[7%] flex w-[20%] flex-col justify-center">
              <p className="max-w-[36ch] font-editorial text-base leading-[1.7] text-dark/70">
                {room.caption}
              </p>
            </div>
          )}
        </>
      ) : (
        // STATE B (left) — photo on the left, title + caption stacked at right.
        <>
          <div className="absolute inset-y-[10svh] left-[6%] w-[52%]">
            {clip("(min-width:1024px) 55vw, 100vw")}
          </div>
          <div className="absolute inset-y-0 right-[8%] flex w-[26%] flex-col justify-center gap-4 text-left">
            <h3 className="font-display text-[2rem] italic leading-[1.05] text-dark md:text-[2.5rem]">
              {room.title}
            </h3>
            {room.caption && (
              <p className="max-w-[36ch] font-editorial text-base leading-[1.7] text-dark/70">
                {room.caption}
              </p>
            )}
          </div>
        </>
      )}
    </motion.figure>
  );
}

/** "The House" heading — raised top-center spot. It fades out as the spread
 *  blooms (opacity driven by the stage machine), so it is never seen behind
 *  the framed photos during the pan. */
function Title({ opacity }: { opacity: MotionValue<number> }) {
  const site = useSiteContent();
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center px-6 pt-[5svh] text-center"
    >
      <div>
        {/* Sized for the longer "Welcome to Lilac Landing" line (was 9vw/7rem
            for "The House"). */}
        <h2 className="font-display text-[clamp(2rem,5.5vw,4.25rem)] italic leading-[0.92] tracking-[-0.02em] text-dark">
          {site.house.title}
        </h2>
        <p className="mt-3 font-display text-[clamp(1.1rem,2.8vw,2rem)] italic tracking-[-0.01em] text-dark/55">
          {site.house.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

/** Motion path: the section pins full-screen; the first scroll triggers ONE
 *  continuous clip — the timed gather flows straight into the spread bloom
 *  (Hans, 2026-07-14) — and from there the photos are browsed with the
 *  bottom-center buttons. The scroll never moves the photos — scrolling on
 *  simply releases the pin and carries the visitor to the next section.
 *  Locking Lenis while the clip plays keeps it skip-proof. */
function PinnedHorizontal() {
  const site = useSiteContent();
  const ROOMS = site.house.rooms;
  const COUNT = ROOMS.length;
  const PANELS = COUNT + 1;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Stage machine: idle → gather (timed, scroll locked) → stacked →
  // spread (timed, scroll locked) → browsing (buttons live). Scrolling back
  // above the section re-arms the whole sequence.
  const stage = useRef<"idle" | "gather" | "stacked" | "spread" | "browsing">("idle");
  const gatherTimer = useRef<number | null>(null);
  const [play, setPlay] = useState(false);
  const [panning, setPanning] = useState(false);
  const [index, setIndex] = useState(0);
  const dealT = useMotionValue(0);
  const settled = useMotionValue(0);
  // Strip offset in % of the strip's own width; buttons animate it one photo
  // at a time with the reference's move ease.
  const stripPct = useMotionValue(0);
  const stripX = useMotionTemplate`${stripPct}%`;

  useEffect(() => () => {
    if (gatherTimer.current !== null) window.clearTimeout(gatherTimer.current);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (COUNT <= 1) return;
      setIndex((cur) => {
        if (dir === 1 && cur === COUNT - 1) {
          // Pan RIGHT onto the trailing clone of photo 1, then snap invisibly
          // back to the real first panel once the pan lands.
          animate(stripPct, -((COUNT / PANELS) * 100), {
            duration: 0.8,
            ease: moveEase,
            onComplete: () => stripPct.set(0),
          });
          return 0;
        }
        if (dir === -1 && cur === 0) {
          // Snap onto the identical clone, then pan LEFT to the last panel.
          stripPct.set(-((COUNT / PANELS) * 100));
          animate(stripPct, -(((COUNT - 1) / PANELS) * 100), { duration: 0.8, ease: moveEase });
          return COUNT - 1;
        }
        const next = cur + dir;
        animate(stripPct, -((next / PANELS) * 100), { duration: 0.8, ease: moveEase });
        return next;
      });
    },
    [stripPct],
  );

  // Arrow keys browse too, once the buttons are live.
  useEffect(() => {
    if (!panning) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panning, go]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const lenis = (window as unknown as { __lilacLenis?: Lenis }).__lilacLenis;
    const s = stage.current;
    // The gather/spread clip plays ONCE per page load: once it has run, the
    // stage never returns to "idle", so scrolling back up simply shows the
    // settled photo strip instead of replaying. A refresh remounts this
    // component and plays the intro fresh.
    if (s === "idle" && v > GATHER_TRIGGER) {
      stage.current = "gather";
      setPlay(true);
      lenis?.stop();
      const total = (FLIP_DUR + (COUNT - 1) * STAGGER) * 1000 + 80;
      gatherTimer.current = window.setTimeout(() => {
        if (stage.current !== "gather") return;
        // One continuous motion: the bloom follows the landed stack after a
        // short beat — the scroll lock holds through the whole clip.
        stage.current = "spread";
        animate(dealT, 1, {
          duration: DEAL_DUR,
          delay: SPREAD_PAUSE,
          ease: moveEase,
          onComplete: () => {
            settled.set(1);
            setPanning(true);
            stage.current = "browsing";
            lenis?.start();
          },
        });
      }, total);
    }
  });

  // The heading bows out as the bloom starts and stays gone for the rest of the
  // visit (the clip plays once — no scroll-up reset).
  const titleOpacity = useTransform(dealT, (d) => Math.max(0, 1 - d * 2.5));

  return (
    <section ref={ref} id="gallery" className={`relative scroll-mt-22 ${SECTION}`} style={{ height: `${SECTION_SVH}svh` }}>
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <Title opacity={titleOpacity} />
        <FrameTuner />
        <motion.div
          style={{ x: stripX }}
          className="relative z-20 flex h-svh w-max will-change-transform"
        >
          {ROOMS.map((room, i) => (
            <Panel
              key={room.src}
              room={room}
              index={i}
              play={play}
              dealT={dealT}
              settled={settled}
              composed={panning && i > 0}
              live={panning}
            />
          ))}
          {/* Trailing clone of panel 0 — the wrap-around pan lands here, then the
              strip snaps back to the real first panel while they look identical. */}
          <figure
            aria-hidden
            className="relative h-svh w-screen shrink-0 bg-cream"
            style={{ padding: "var(--gallery-pad, 24px)" }}
          >
            <div
              style={{ borderRadius: "var(--gallery-radius, 0px)" }}
              className="relative h-full w-full overflow-hidden"
            >
              {/* A video card 0 shows its poster here — the clone is only seen
                  during the brief wrap-around pan. */}
              {ROOMS[0].src.endsWith(".mp4") ? (
                <Image
                  src={ROOMS[0].poster ?? ""}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <Image src={ROOMS[0].src} alt="" fill sizes="100vw" className="object-cover" />
              )}
            </div>
          </figure>
        </motion.div>

        {/* Browse controls — fade in bottom-center once the spread lands.
            Buttons are the ONLY way the photos move; scrolling just leaves. */}
        {panning && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: enterEase }}
            className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-5"
          >
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="flex size-12 items-center justify-center rounded-full border border-light/40 bg-dark/35 text-light backdrop-blur-sm transition-all duration-300 ease-luxe hover:bg-dark/60 active:scale-95"
            >
              <CaretLeft size={20} />
            </button>
            <span className="min-w-14 text-center text-sm tracking-[0.08em] text-light/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
              {index + 1} / {COUNT}
            </span>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="flex size-12 items-center justify-center rounded-full border border-light/40 bg-dark/35 text-light backdrop-blur-sm transition-all duration-300 ease-luxe hover:bg-dark/60 active:scale-95"
            >
              <CaretRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Touch / reduced-motion gallery: a heading over a native horizontal
 *  scroll-snap card row — no pinning or scroll-jacking, so it feels right on
 *  phones and tablets where sticky scrubbing fights momentum scrolling. */
function NativeStrip() {
  const site = useSiteContent();
  const ROOMS = site.house.rooms;
  return (
    <section id="gallery" className={`relative scroll-mt-22 ${SECTION} py-20 md:py-24`}>
      <div className="px-6 text-center">
        <h2 className="font-display text-[clamp(2.25rem,11vw,4rem)] italic leading-[0.95] tracking-[-0.02em] text-dark">
          {site.house.title}
        </h2>
        <p className="mt-2 font-display text-lg italic tracking-[-0.01em] text-dark/55 sm:text-xl">
          {site.house.subtitle}
        </p>
        <p className="mt-4 text-[13px] tracking-[-0.01em] text-dark/45">Swipe to explore &rarr;</p>
      </div>

      {/* Phone-first swipe strip: big center-snapping cards with a peek of
          the next one, titles anchored bottom-left over a legibility
          gradient, momentum contained to the strip. */}
      <ul className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-4 [scrollbar-width:none] sm:gap-4 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {ROOMS.map((room, i) => (
          <li key={room.src} className="shrink-0 snap-center">
            <figure className="relative aspect-[3/4] w-[86vw] overflow-hidden sm:w-[54vw] md:w-[40vw]">
              {room.src.endsWith(".mp4") ? (
                // No pinned choreography here — the ambient clip just plays.
                // srcCompact serves the lighter encode to small screens.
                <video
                  src={room.srcCompact ?? room.src}
                  poster={room.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={room.src}
                  alt={room.title}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 640px) 86vw, (max-width: 768px) 54vw, 40vw"
                  className="object-cover"
                />
              )}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark/60 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-5 right-5 font-display text-2xl italic leading-tight tracking-[-0.01em] text-light">
                {room.title}
              </figcaption>
            </figure>
            {room.caption && (
              <p className="mt-2 max-w-[86vw] px-1 font-editorial text-sm text-dark/60 sm:max-w-[54vw] md:max-w-[40vw]">
                {room.caption}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function GalleryNoir() {
  const reduce = useReducedMotion();
  // Pinned scroll-choreography on wide screens; native swipe gallery on
  // tablet / mobile (< 1024px) and under reduced motion.
  const compact = useMediaQuery("(max-width: 1023px)");
  return reduce || compact ? <NativeStrip /> : <PinnedHorizontal />;
}
