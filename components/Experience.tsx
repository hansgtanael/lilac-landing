"use client";

import { motion } from "motion/react";
import { Waves, Sun, Anchor } from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Eyebrow from "@/components/ui/Eyebrow";
import { useSiteContent } from "@/components/site-content";

// In-code icon set — highlight copy comes from content and maps onto these by
// index, cycling if the content list runs longer.
const ICONS = [Waves, Sun, Anchor];

export default function Experience() {
  const site = useSiteContent();
  const { experience } = site.text;
  const reduce = useReducedMotion();

  const fade = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
  };

  return (
    <section className="bg-cream py-25 md:py-[var(--sp-experience-y,3rem)]">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div {...fade} transition={{ duration: 0.7, ease: EASE }}>
          <Eyebrow>{experience.eyebrow}</Eyebrow>
        </motion.div>

        {/* Guest review as the centered editorial pull quote. */}
        <motion.blockquote
          {...fade}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="mt-8 font-display text-[clamp(1.75rem,3.5vw,3rem)] italic leading-[1.1] text-dark"
        >
          {experience.quote}
        </motion.blockquote>

        {/* Thin 64px lilac divider. */}
        <motion.div
          {...fade}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mx-auto my-10 h-px w-16 bg-brand"
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.12 } },
          }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {experience.highlights.map(({ title, sub }, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={title}
                variants={{
                  initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex flex-col items-center"
              >
                <Icon weight="light" size={28} className="text-sage" />
                <p className="mt-4 text-sm font-medium text-dark">{title}</p>
                <p className="mt-1 text-xs text-dark/55">{sub}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
