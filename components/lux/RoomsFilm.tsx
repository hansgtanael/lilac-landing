"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { LuxRoom, LuxRoomsContent } from "@/lib/sanity";

// Immersive room story: three stacked full-bleed photo bands, one room each.
// Choreography per band, driven by the band's OWN scroll progress:
//   approach  the photo arrives oversized (scale 1.12) and settles to 1 by the
//             time the band is centered, a slow Ken Burns "coming to rest"
//   passage   a gentle vertical parallax drifts the frame through the whole
//             pass, so the room feels held rather than pasted
//   caption   title + one-liner fade-rise once into the frame over a soft
//             bottom scrim; band 2 sits bottom-right so the rhythm breathes
// Ken Burns + parallax run on desktop only (>= 1024px) and never under
// reduced motion; both fallbacks get the static, settled frame with captions.

// Built-in copy, used verbatim whenever Sanity returns no content.
const FALLBACK: LuxRoomsContent = {
  rooms: [
    {
      imageUrl: "/figma/IMG_4248.jpeg",
      title: "The Great Room",
      line: "Lake-view windows and a long afternoon couch.",
      right: false,
    },
    {
      imageUrl: "/figma/IMG_4299.jpeg",
      title: "The Deck",
      line: "Coffee out here lasts all summer.",
      right: true,
    },
    {
      imageUrl: "/figma/IMG_4259.jpeg",
      title: "Primary Bedroom",
      line: "Lake views from under the covers.",
      right: false,
    },
  ],
};

/** One full-bleed room band: scroll-scrubbed Ken Burns settle + parallax on
 *  the photo, fade-rise caption pinned to a bottom corner. */
function Band({
  room,
  kenBurns,
  reduce,
}: {
  room: LuxRoom;
  kenBurns: boolean;
  reduce: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // 0 when the band's top meets the viewport bottom, 1 when its bottom leaves
  // the top; each band scrubs only while it is actually on screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Settle finishes just past center (0.55) so the frame is at rest while you
  // read the caption, then holds. Parallax spans the full pass.
  const scale = useTransform(scrollYProgress, [0, 0.55], [1.12, 1], { clamp: true });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  // Hero's fade-rise idiom: reduced motion starts at the end state, so the
  // whileInView pass is a no-op and captions are simply visible.
  const rise = (n: number) => ({
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.5 } as const,
    transition: { duration: 0.9, ease: EASE, delay: reduce ? 0 : n * 0.12 },
  });

  return (
    <figure ref={ref} className="relative h-svh w-full overflow-hidden bg-dark">
      {/* Media wrapper is 12% taller than the band so the parallax drift
          (max 4% of its own height) never exposes an edge. Transform only. */}
      <motion.div
        style={kenBurns ? { scale, y, willChange: "transform" } : undefined}
        className="absolute inset-x-0 -inset-y-[6%]"
      >
        <Image src={room.imageUrl} alt={room.title} fill sizes="100vw" className="object-cover" />
      </motion.div>

      {/* Soft bottom scrim, warm charcoal like the hero, keeps text-light legible. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-10 h-[45%]"
        style={{
          background: "linear-gradient(180deg, rgba(44,40,37,0) 0%, rgba(44,40,37,0.55) 100%)",
        }}
      />

      <figcaption
        className={`absolute inset-x-6 bottom-10 z-20 md:inset-x-12 md:bottom-14 ${
          room.right ? "text-right" : ""
        }`}
      >
        <motion.h3 className="font-display text-3xl italic text-light md:text-4xl" {...rise(0)}>
          {room.title}
        </motion.h3>
        <motion.p className="mt-2 text-base text-light/75" {...rise(1)}>
          {room.line}
        </motion.p>
      </figcaption>
    </figure>
  );
}

export default function RoomsFilm({ content }: { content: LuxRoomsContent | null }) {
  const c = content ?? FALLBACK;
  const reduce = useReducedMotion();
  // Scrubbed Ken Burns on wide screens only; phones and tablets (< 1024px)
  // keep the same stacked bands with static, settled photos.
  const desktop = useMediaQuery("(min-width: 1024px)");
  const kenBurns = !reduce && desktop;

  return (
    <section id="rooms" className="relative bg-dark">
      {c.rooms.map((room) => (
        <Band key={room.imageUrl} room={room} kenBurns={kenBurns} reduce={reduce} />
      ))}
    </section>
  );
}
