"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { LuxConciergeContent } from "@/lib/sanity";

/**
 * ConciergeStay, the quiet booking moment of the /lux prototype.
 *
 * Choreography: every child fade-rises (y 24 + fade) the first time it enters
 * view, in a small reading-order stagger: eyebrow, headline, body, detail row.
 * The concierge card sits out one extra beat and lands last, so the eye
 * finishes on the reserve action. Everything animates once; the fields are
 * static direction-prototype chrome (hairline hover only, no real inputs).
 *
 * Reduced motion: every child renders in its settled state, no stagger.
 */

const CHIP =
  "rounded-xl border border-dark/10 bg-cream p-4 transition-colors duration-[400ms] ease-luxe hover:border-dark/25";

// Built-in copy, used verbatim whenever Sanity returns no content.
// details = the detail row (label over sub); fields = the two static date chips.
const FALLBACK: LuxConciergeContent = {
  eyebrow: "THE STAY",
  heading: "The Lake Residence",
  body: "A cozy lakeside residence on Keuka Lake, with a private dock and sunset views over the water. Book direct for the best rate, and a host on call whenever you need one.",
  details: [
    { label: "Lakefront", sub: "Private dock" },
    { label: "Chef's kitchen", sub: "Premium appliances" },
    { label: "Keypad entry", sub: "Self check-in" },
  ],
  price: "$550",
  priceUnit: "/ night",
  rating: "★ 4.98",
  fields: [
    { label: "CHECK-IN", value: "Jul 18, 2026" },
    { label: "CHECK-OUT", value: "Jul 23, 2026" },
  ],
  guestsLabel: "GUESTS",
  guestsValue: "4 guests",
  reserveLabel: "Reserve",
  reserveNote: "You won't be charged yet",
  conciergeNote: "24/7 concierge included",
};

export default function ConciergeStay({
  content,
}: {
  content: LuxConciergeContent | null;
}) {
  const c = content ?? FALLBACK;
  const reduce = useReducedMotion();

  // Shared fade-rise, spread onto each animated child. `n` sets the stagger
  // slot; the card passes a later n so it settles after the copy.
  const rise = (n: number) => ({
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: reduce ? 0 : 0.9,
      ease: EASE,
      delay: reduce ? 0 : n * 0.1,
    },
  });

  return (
    <section id="stay" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          {/* Copy column: eyebrow, display line, body, detail row. */}
          <div className="md:col-span-6">
            <motion.p
              {...rise(0)}
              className="text-[13px] uppercase tracking-[0.22em] text-brand-deep"
            >
              {c.eyebrow}
            </motion.p>

            <motion.h2
              {...rise(1)}
              className="mt-4 font-display text-[clamp(2.5rem,5vw,3.75rem)] italic leading-[1.05] tracking-tight text-dark"
            >
              {c.heading}
            </motion.h2>

            <motion.p
              {...rise(2)}
              className="mt-6 max-w-[46ch] text-lg leading-[1.65] text-ink/70"
            >
              {c.body}
            </motion.p>

            <motion.dl {...rise(3)} className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
              {c.details.map((d) => (
                <div key={d.label}>
                  <dt className="text-base font-bold text-dark">{d.label}</dt>
                  <dd className="mt-1 text-sm text-ink/55">{d.sub}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Concierge card: lands one beat after the copy (n=5). Soft tinted
              shadow in the ink charcoal so the lift reads warm, not gray. */}
          <motion.div
            {...rise(5)}
            className="rounded-[22px] border border-dark/10 bg-linen p-8 shadow-[0_20px_55px_rgba(44,40,37,0.14)] md:col-span-5 md:col-start-8 md:self-start"
          >
            {/* Price row */}
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-semibold text-dark">
                {c.price} <span className="text-base font-normal text-ink/60">{c.priceUnit}</span>
              </p>
              <p className="text-sm font-medium text-ink/75">{c.rating}</p>
            </div>

            {/* Date chips, static in this direction prototype. */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {c.fields.map((f) => (
                <div key={f.label} className={CHIP}>
                  <p className="text-[11px] uppercase tracking-wide text-ink/55">{f.label}</p>
                  <p className="mt-1 font-medium text-dark">{f.value}</p>
                </div>
              ))}
            </div>

            <div className={`mt-3 ${CHIP}`}>
              <p className="text-[11px] uppercase tracking-wide text-ink/55">{c.guestsLabel}</p>
              <p className="mt-1 font-medium text-dark">{c.guestsValue}</p>
            </div>

            {/* Reserve pill: lilac fill inverting to deep lilac + warm white. */}
            <button
              type="button"
              className="mt-6 h-14 w-full rounded-full bg-brand font-semibold uppercase tracking-[0.04em] text-dark transition-colors duration-[400ms] ease-luxe hover:bg-brand-dark hover:text-light active:scale-[0.98]"
            >
              {c.reserveLabel}
            </button>

            <p className="mt-4 text-center text-[13px] text-ink/55">
              {c.reserveNote}
            </p>

            <div className="mt-6 h-px w-full bg-dark/10" />

            <div className="mt-6 flex items-center gap-3">
              <span aria-hidden className="size-[7px] shrink-0 rounded-full bg-sage" />
              <p className="text-sm font-medium text-dark/80">{c.conciergeNote}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
