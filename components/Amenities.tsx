"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Waves,
  Umbrella,
  ForkKnife,
  WifiHigh,
  Car,
  Fire,
  Key,
  Bathtub,
  Fish,
  Tree,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";

// In-code icon set — amenity labels come from content and map onto these by
// index, cycling back to the start if the content list runs longer.
const ICONS = [
  Waves,
  Umbrella,
  ForkKnife,
  WifiHigh,
  Car,
  Fire,
  Key,
  Bathtub,
  Fish,
  Tree,
];

/** Decimal places a value should render with, derived from the number itself
 *  (2.5 -> 1, 8 -> 0) so the count-up matches the content precision. */
function decimalsOf(n: number): number {
  const dot = String(n).indexOf(".");
  return dot === -1 ? 0 : String(n).length - dot - 1;
}

/** Stats numeral — Playfair italic display digits that count up from 0 the
 *  first time they scroll into view (spring, ~60). */
function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 18 });
  const text = useTransform(spring, (v) => v.toFixed(decimals));

  if (inView) raw.set(value);

  return (
    <p ref={ref} className="font-display text-[3rem] italic leading-[1.1] text-dark">
      {reduce ? value.toFixed(decimals) : <motion.span>{text}</motion.span>}
    </p>
  );
}

export default function Amenities() {
  const site = useSiteContent();
  const { amenities } = site.text;
  const reduce = useReducedMotion();

  const fade = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
  };

  return (
    // Cream canvas — the hills divider above crests into this same tint.
    <section className="bg-cream pb-16 pt-24 md:pb-[var(--sp-amenities-y,6rem)] md:pt-[var(--sp-amenities-y,6rem)]">
      {/* One full-width column — the stats card is gone (Hans, 2026-07-23):
          heading + uncarded count-up row, then the amenity icons spread
          across the whole page width. */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.h2
            {...fade}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-3xl italic tracking-tight text-dark md:text-5xl"
          >
            {amenities.heading}
          </motion.h2>

          {/* Stats — plain row, hairline separators, no card chrome. */}
          {/* 2×2 grid on phones (a fixed row overflowed 360px viewports);
              hairline-separated row from md up. */}
          <motion.div
            {...fade}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="grid grid-cols-2 gap-x-10 gap-y-6 md:flex md:gap-14"
          >
            {amenities.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col gap-1 ${i > 0 ? "md:border-l md:border-dark/10 md:pl-14" : ""}`}
              >
                <CountUp value={stat.value} decimals={decimalsOf(stat.value)} />
                <p className="text-xs leading-[1.33] text-dark/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.ul
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-dark/10 pt-12 sm:grid-cols-3 lg:grid-cols-5"
        >
          {amenities.items.map((label, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.li
                key={label}
                variants={{
                  initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-col items-start gap-3 text-sm text-dark/80"
              >
                <Icon weight="light" size={20} className="shrink-0 text-sage" />
                {label}
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.p
          {...fade}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mt-12 max-w-[52ch] text-sm leading-relaxed text-dark/60"
        >
          {amenities.note}
        </motion.p>
      </div>
    </section>
  );
}
