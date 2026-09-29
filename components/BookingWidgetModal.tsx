"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { buildBookingUrl, bookingWidgetOrigin } from "@/lib/bookingWidget";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Abandon the widget and fall back to the email enquiry form, keeping the
   *  guest's dates. The booking must never dead-end: a guest who cannot or will
   *  not use the checkout still has to be able to reach the owner. */
  onEmailInstead: () => void;
  checkIn: string;
  checkOut: string;
  guests: string;
};

/** How long to wait before assuming the widget will not appear.
 *  A cross-origin iframe fires onLoad even for an error page, so we cannot
 *  detect a 404 inside it — but we CAN detect "nothing ever loaded", which is
 *  the case that strands a guest (network dead, frame blocked, host down). */
const LOAD_TIMEOUT_MS = 12_000;

/** How long to keep covering the frame after its HTML loads.
 *
 *  onLoad fires when the document arrives, which is SECONDS before Hospitable
 *  has fetched rates and availability. In that gap it renders a default month
 *  — September here — with every date disabled, because the real calendar data
 *  has not landed yet. Uncovered, that reads as a broken booking page: a
 *  calendar you cannot click, on the wrong month, with the dates you just
 *  picked nowhere in sight. Guests conclude they have to enter everything
 *  twice, or that the page is dead.
 *
 *  So the cover stays up until the widget signals it has rendered real content
 *  (see READY_MESSAGE below), and this is the backstop for when no such signal
 *  ever comes. Better a few honest seconds of "loading" than an interactive
 *  lie. */
const CONTENT_GRACE_MS = 6_000;

/** Hospitable's widget posts `{ iframeHeight }` to its parent when its content
 *  resizes — their own loader listens for exactly this to size the frame. The
 *  first one therefore means "something real has rendered", which is the
 *  closest thing to a readiness signal a cross-origin frame can give us.
 *  Treated as a bonus, never a requirement: if it never arrives, the grace
 *  timer above uncovers the frame anyway. */
const READY_MESSAGE = "iframeHeight";

/** Hospitable booking widget in a modal over the booking card.
 *
 *  Placement rationale: the card is the designed surface and stays visible
 *  behind this; the widget only owns the transaction. Guests never leave the
 *  homepage, so the brand holds right up to the payment step.
 *
 *  Follows the same popup contract as ViewRooms/PropertyStrip — portal,
 *  Escape, body-scroll lock, Lenis pause — so all three dialogs on the site
 *  behave identically.
 */
export default function BookingWidgetModal({
  open,
  onClose,
  onEmailInstead,
  checkIn,
  checkOut,
  guests,
}: Props) {
  // Portals need the DOM; render nothing until mounted or SSR mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The iframe is slow enough on first paint to look broken, so hold a spinner
  // until onLoad. Re-armed on every open: a guest who closes and reopens with
  // new dates gets a fresh src, and the stale "loaded" state would otherwise
  // show an empty frame while the new URL fetches.
  const [loaded, setLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    setContentReady(false);
    setStalled(false);
  }, [open, checkIn, checkOut, guests]);

  // Uncover as soon as the widget says it has drawn something, and otherwise
  // when the grace period expires. Whichever happens first.
  useEffect(() => {
    if (!open || !loaded || contentReady) return;
    const origin = bookingWidgetOrigin();
    const onMessage = (e: MessageEvent) => {
      if (origin && e.origin !== origin) return;
      const data = e.data as Record<string, unknown> | null;
      if (data && typeof data === "object" && READY_MESSAGE in data) setContentReady(true);
    };
    window.addEventListener("message", onMessage);
    const t = setTimeout(() => setContentReady(true), CONTENT_GRACE_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(t);
    };
  }, [open, loaded, contentReady]);

  // Watchdog: if the frame has not loaded in time, surface the email route
  // rather than leaving a spinner turning forever. The iframe stays mounted, so
  // a slow connection that arrives late still shows the real widget.
  useEffect(() => {
    if (!open || loaded) return;
    const t = setTimeout(() => setStalled(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [open, loaded, checkIn, checkOut, guests]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [open, onClose]);

  if (!mounted || !open) return null;

  // Built at render, not in state, so the prefill always reflects the dates
  // showing on the card at the moment RESERVE was pressed.
  const src = buildBookingUrl({ checkIn, checkOut, guests });
  if (!src) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Complete your booking"
      className="fixed inset-0 z-[95] flex flex-col bg-cream"
    >
      <div className="flex items-center justify-between border-b border-dark/10 px-5 py-4 md:px-8">
        <div>
          <p className="font-display text-xl italic leading-none text-dark">Complete your booking</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-dark/55">
            Secure checkout · Lilac Landing
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Always present, not only on failure: some guests simply prefer to
              ask a person before paying. Hiding this until something breaks
              would lose those enquiries silently. */}
          <button
            type="button"
            onClick={onEmailInstead}
            className="hidden rounded-full px-4 py-2 text-xs uppercase tracking-wide text-dark/55 transition-colors duration-200 hover:bg-dark/5 hover:text-dark sm:block"
          >
            Email instead
          </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking"
          className="grid h-10 w-10 place-items-center rounded-full text-dark transition duration-200 ease-out hover:bg-dark/5 active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        </div>
      </div>

      {/* data-lenis-prevent: Lenis is stopped while the modal is open and would
          otherwise swallow wheel events before they reach the iframe. */}
      <div data-lenis-prevent className="relative flex-1">
        {/* Opaque, not translucent: the point is to HIDE the widget's
            half-loaded state, not to veil it. A default month with every date
            greyed out, showing through, is what made this look broken. */}
        {!contentReady && !stalled && (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-cream px-6"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-dark/15 border-t-dark/50" />
              <p className="text-sm text-dark/60">
                {checkIn && checkOut
                  ? "Bringing your dates through to checkout\u2026"
                  : "Opening secure checkout\u2026"}
              </p>
            </div>
          </div>
        )}
        {!loaded && stalled && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-cream px-6">
            <div className="flex max-w-sm flex-col items-center gap-4 text-center">
              <p className="font-display text-2xl italic text-dark">
                The booking window isn&apos;t loading
              </p>
              <p className="text-sm leading-relaxed text-dark/60">
                Send your dates straight to us instead and we&apos;ll confirm by email.
              </p>
              <button
                type="button"
                onClick={onEmailInstead}
                className="flex h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-semibold uppercase tracking-[0.04em] text-dark transition-colors duration-300 ease-luxe hover:bg-brand-deep hover:text-light active:scale-[0.98]"
              >
                Email your request
              </button>
            </div>
          </div>
        )}
        <iframe
          src={src}
          title="Booking"
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          /* payment: Hospitable takes card details in-frame, and without this
             the Payment Request API is unavailable to it. Note the site-wide
             Permissions-Policy in next.config.ts must ALSO allow payment, or
             this attribute has nothing to delegate. */
          allow="payment; clipboard-write"
          /* No sandbox attribute: a payment flow needs scripts, forms, popups
             and same-origin storage, so a sandbox permissive enough to work
             would grant everything it nominally restricts. Isolation here comes
             from the cross-origin boundary itself — the frame cannot touch this
             origin's DOM, cookies or storage. */
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>,
    document.body,
  );
}
