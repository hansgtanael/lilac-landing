"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { WaveLip } from "@/components/WaveEdge";
import { useSiteContent } from "@/components/site-content";

/** "Welcome to Lilac Landing" — the editorial intro right under the hero
 *  (Figma "Slow Lake" concept): centered Lora roman heading and Elle's
 *  intro paragraph set wide in Nunito. */
export default function WelcomeIntro() {
  const site = useSiteContent();
  const { about } = site.text;
  const reduce = useReducedMotion();

  const fade = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
  };

  return (
    <section id="welcome" className="relative bg-cream pb-20 pt-20 lg:pb-[88px] lg:pt-[75px]">
      {/* Crest that rides over the pinned hero as this section scrolls up. */}
      <WaveLip />
      <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-8 px-6 text-center">
        <motion.h2
          {...fade}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="font-display text-[2.25rem] font-medium leading-[1.15] text-dark md:text-[2.5rem]"
        >
          {about.heading}
        </motion.h2>

        {about.intro.map((p, i) => (
          <motion.p
            key={i}
            {...fade}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="max-w-[1160px] text-center font-editorial text-base leading-[1.75] text-dark/85 md:text-lg"
          >
            {p}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
