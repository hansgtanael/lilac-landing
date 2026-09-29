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

// Nav targets are structural (they point at section anchors), so they're fixed
// in code rather than read from editable content: "The House" jumps to the
// main-floor band, and Availability / Book Direct jump to the booking CALENDAR
// (#reserve) instead of the lake photo at the top of the booking section.
const HREF_REMAP: Record<string, string> = {
  "#gallery": "#main-floor",
  "#booking": "#reserve",
};
const navHref = (href: string) => HREF_REMAP[href] ?? href;

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

  /* Same popup contract as every other dialog on the site (ViewRooms,
   * PropertyStrip, the booking modal): Escape closes, the page behind cannot
   * scroll, and Lenis is paused — without that last part the smooth-scroll
   * instance keeps driving the page under the open panel. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
  }, [open]);

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
        className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-luxe ${
          hidden && !open ? "-translate-y-full" : ""
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

          {/* Brand left, hamburger right, nothing between. The inline link row
              and the booking pill both live in the panel now: a hamburger
              beside a visible link row is two doors into the same room, and
              the bar reads calmer over the hero without them. */}

          {/* Hamburger — two bars morph into an X. */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-50 h-5 w-6"
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

      {/* Slide-over menu. Enters from the right edge, travels left.
          Everything the bar used to show inline lives here now. */}
      <AnimatePresence>
        {open && (
          <>
            {/* Scrim. Dismisses on click, and darkens the page enough that the
                panel reads as the only live surface. */}
            <motion.div
              className="fixed inset-0 z-40 bg-dark/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-50 flex w-[min(420px,86vw)] flex-col bg-cream shadow-[-30px_0_80px_rgba(44,40,37,0.25)]"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {/* pt clears the bar the hamburger sits in, so the X is never
                  covered by the panel it opened. */}
              <div className="flex flex-1 flex-col justify-center gap-7 px-10 pb-12 pt-24">
                {LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    onClick={() => handleNav(navHref(link.href))}
                    className="text-left font-display text-3xl italic text-dark transition-colors duration-300 ease-luxe hover:text-brand-deep"
                    initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                      delay: reduce ? 0 : 0.12 + i * 0.05,
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}

                {/* No booking CTA here. The hero already carries one, and
                    "Availability" above remaps to #reserve (HREF_REMAP), so the
                    calendar is still one tap from this menu — a second button
                    saying the same thing only split the emphasis. */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
