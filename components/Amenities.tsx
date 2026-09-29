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
  Binoculars,
  ForkKnife,
  WifiHigh,
  Car,
  Fire,
  Campfire,
  Lightning,
  Boat,
  WashingMachine,
  Bed,
  Key,
  Bathtub,
  Fish,
  Tree,
  Umbrella,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";

/* Amenity icons, chosen by what the label SAYS.
 *
 * These used to be picked by position — ICONS[i % ICONS.length] — against a
 * list of ten icons and fifteen amenities. So the last five wrapped around and
 * got whatever happened to be at the front: the wood-burning fireplace showed
 * waves, heating and A/C an umbrella, the kayaks a knife and fork. Worse, the
 * list is CMS-editable, so Elle reordering or inserting one amenity silently
 * reassigned the icon on every item after it.
 *
 * Matching on the label instead means an amenity carries its icon wherever it
 * moves in the list, and a new one picks up a sensible icon on its own.
 * Keywords rather than exact strings, so rewording "Two kayaks + life vests"
 * does not break it.
 *
 * Order matters: the first rule that matches wins, so narrower terms sit above
 * broader ones — "lake view" must be tested before "lake". */
const ICON_RULES: [RegExp, PhosphorIcon][] = [
  [/lake view|view of the lake/i, Binoculars],
  [/fireplace|wood.?burn/i, Campfire],
  [/heat|a\/c|air con|hvac/i, Lightning],
  [/kayak|life vest|canoe|paddle/i, Boat],
  [/laundry|washer|dryer/i, WashingMachine],
  [/sofa bed|sleeper|bed\b/i, Bed],
  [/kitchen|cook/i, ForkKnife],
  [/wifi|internet/i, WifiHigh],
  [/parking|car/i, Car],
  [/grill|bbq|barbecue/i, Fire],
  [/keypad|check.?in|lock|key/i, Key],
  [/bath|shower/i, Bathtub],
  [/fish/i, Fish],
  [/outdoor|yard|deck|patio|seating/i, Tree],
  [/beach|umbrella|shade/i, Umbrella],
  [/lake|water|dock|swim/i, Waves],
];

/** Falls back to Waves — this is a lake house, so water is the safe guess for
 *  anything unrecognised, and never looks absurd the way a wrapped index did. */
function iconFor(label: string): PhosphorIcon {
  for (const [pattern, Icon] of ICON_RULES) if (pattern.test(label)) return Icon;
  return Waves;
}

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
            const Icon = iconFor(label);
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

        {/* The closing note ("Lower East Lake Road is a quiet residential
            street...") is deliberately not rendered. The field still exists in
            the CMS, so restoring it is this block coming back — nothing was
            deleted from Elle's content. */}
      </div>
    </section>
  );
}
