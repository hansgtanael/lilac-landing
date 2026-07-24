"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useSiteContent } from "@/components/site-content";

function scrollTo(href: string) {
  // The hero is the pinned sticky layer at the page top — scrollIntoView on it
  // is unreliable, so the brand always glides to absolute top instead.
  if (href === "#hero") {
    const lenis = (window as unknown as { __lilacLenis?: { scrollTo(t: number): void } })
      .__lilacLenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Nav() {
  const site = useSiteContent();
  const { nav } = site.text;
  const LINKS = nav.links;
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Hide the bar while the pinned gallery fills the screen — it slides up out of
  // view for that section, then returns.
  const [hidden, setHidden] = useState(false);
  // Over the pinned hero the bar reads light; once the cream sections have
  // scrolled over it, the copy flips to ink.
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.75);
      const g = document.querySelector("#gallery");
      if (!g) return setHidden(false);
      const r = g.getBoundingClientRect();
      setHidden(r.top <= 0 && r.bottom >= window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    // Defer so the overlay can begin its exit before the scroll fires.
    requestAnimationFrame(() => scrollTo(href));
  };

  return (
    <>
      {/* Minimal bar — no pill, no fill: a flat strip hugging the top edge.
          Light copy over the pinned hero (soft text-shadow for legibility),
          ink once the cream sections scroll over it. */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-transform duration-500 ease-luxe ${
          hidden ? "-translate-y-full" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-3 transition-colors duration-500 ease-luxe md:px-10 md:py-4 ${
            pastHero ? "" : "[text-shadow:0_1px_14px_rgba(0,0,0,0.35)]"
          }`}
        >
          <button
            onClick={() => handleNav("#hero")}
            className={`font-display text-2xl font-semibold italic transition-colors duration-500 ease-luxe ${
              pastHero ? "text-dark" : "text-light"
            }`}
          >
            {nav.brand}
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className={`font-helvetica text-[14px] font-semibold tracking-[-0.01em] transition-colors duration-300 ease-luxe ${
                  pastHero
                    ? "text-dark/80 hover:text-dark"
                    : "text-light hover:text-light"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleNav("#booking")}
            className="hidden h-9 items-center rounded-full bg-brand px-6 font-helvetica text-[14px] font-bold uppercase tracking-[0.08em] text-dark [text-shadow:none] transition-colors duration-300 ease-luxe hover:bg-brand-dark active:scale-[0.98] md:flex"
          >
            {nav.cta}
          </button>

          {/* Hamburger — two bars morph into an X. */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative h-5 w-6 md:hidden"
          >
            <span
              className={`absolute left-0 h-px w-6 transition-all duration-300 ease-luxe ${
                open || pastHero ? "bg-dark" : "bg-light"
              }`}
              style={{
                top: open ? "50%" : "30%",
                transform: open ? "translateY(-50%) rotate(45deg)" : "none",
              }}
            />
            <span
              className={`absolute left-0 h-px w-6 transition-all duration-300 ease-luxe ${
                open || pastHero ? "bg-dark" : "bg-light"
              }`}
              style={{
                top: open ? "50%" : "70%",
                transform: open ? "translateY(-50%) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu. */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-8 bg-light/95 backdrop-blur-3xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {LINKS.map((link, i) => (
              <motion.button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="font-display text-3xl italic text-dark"
                initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                  delay: reduce ? 0 : 0.1 + i * 0.05,
                }}
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
