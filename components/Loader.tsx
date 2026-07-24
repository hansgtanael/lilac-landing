"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WORDMARK = "Lilac Landing";

/** Intro curtain. A hairline draws across the middle, the wordmark sets, then
 *  the screen parts along that line — top half lifts up, bottom half drops down
 *  — revealing the page like curtains opening from the centre. */
export default function Loader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [done, setDone] = useState(false);

  // Hold the curtain, then release it.
  useEffect(() => {
    const total = reduce ? 250 : 2400;
    const timer = setTimeout(() => setShow(false), total);
    return () => clearTimeout(timer);
  }, [reduce]);

  // Once released, unmount after the parting animation finishes.
  useEffect(() => {
    if (show) return;
    const timer = setTimeout(() => setDone(true), reduce ? 450 : 1400);
    return () => clearTimeout(timer);
  }, [show, reduce]);

  // Lock scroll only while the curtain is up.
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (done) return null;

  // Curtains part (top lifts, bottom drops) once released; reduced motion fades.
  const part = { duration: reduce ? 0.35 : 0.95, ease: EASE, delay: reduce ? 0 : 0.28 };
  const topAnim = reduce ? { opacity: show ? 1 : 0 } : { y: show ? "0%" : "-100%" };
  const bottomAnim = reduce ? { opacity: show ? 1 : 0 } : { y: show ? "0%" : "100%" };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-screen h-[100dvh] overflow-hidden">
      {/* Top curtain — lifts up when released. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-cream will-change-transform"
        animate={topAnim}
        transition={part}
      />
      {/* Bottom curtain — drops down when released. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-cream will-change-transform"
        animate={bottomAnim}
        transition={part}
      />

      {/* Content — hairline seam + wordmark + location. Fades just before the
          curtains part so the split reads cleanly along the line. */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.3, ease: EASE }}
      >
        {/* The line the curtains open from. */}
        <motion.div
          className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-dark/20"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        />

        <div className="relative flex flex-col items-center px-6 text-center">
          <h1
            aria-label={WORDMARK}
            className="font-display text-5xl italic text-dark md:text-7xl"
          >
            {WORDMARK.split("").map((char, i) => {
              const isSpace = char === " ";
              return (
                <motion.span
                  key={`${char}-${i}`}
                  aria-hidden="true"
                  className={`inline-block${isSpace ? " w-[0.28em]" : ""}`}
                  initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: reduce ? 0 : 0.3 + i * 0.045,
                  }}
                >
                  {isSpace ? null : char}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            className="mt-5 text-[11px] font-medium uppercase tracking-[0.35em] text-brand-deep"
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : 1.0 }}
          >
            Keuka Lake&nbsp;&middot;&nbsp;New York
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
