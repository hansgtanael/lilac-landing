"use client";

import { useEffect, useRef, useState } from "react";
import { buildBookingUrl, bookingWidgetOrigin, isBookingWidgetConfigured } from "@/lib/bookingWidget";

type Props = {
  /** Abandon the widget and reach a person instead. Booking must never
   *  dead-end, and some guests simply prefer to ask before paying. */
  onEmailInstead: () => void;
};

/** Height before the widget reports its own — their loader's default, so it is
 *  the closest thing to a correct first guess. Only ever visible for the second
 *  or so before the first message lands. */
const DEFAULT_HEIGHT = 900;

/** Refuse absurd values. A malformed or hostile message must not be able to
 *  stretch the page to a million pixels or collapse the widget to nothing. */
const MIN_HEIGHT = 420;
const MAX_HEIGHT = 2400;

/** Backstop for uncovering the frame if no height message ever arrives. */
const CONTENT_GRACE_MS = 6_000;

/** Hospitable's booking widget, inline — the booking UI itself, not a step
 *  after one.
 *
 *  WHY THIS REPLACED OUR OWN CARD:
 *  running two calendars over one property meant keeping them in agreement,
 *  and every disagreement was a bug the guest paid for. Our card sent prefill
 *  parameters Hospitable ignored, so dates had to be picked twice; it offered
 *  arrival days the property does not accept, and quoted a full price for
 *  those weeks; and it printed a $0 service fee against a real 4% charge. Each
 *  was fixed, and each existed only because a second calendar existed.
 *
 *  This has one calendar. Availability, minimum stay, arrival-day rules, fees
 *  and taxes are all answered by the system that takes the money, so they
 *  cannot drift from it.
 *
 *  What it costs: Hospitable's widget cannot be re-coloured (their own feature
 *  request for it has been open for years), so the magenta is permanent and
 *  does not match the site.
 *
 *  SIZING: a cross-origin frame cannot measure itself from out here, but this
 *  one posts its content height to its parent as it changes — the same signal
 *  Hospitable's own loader uses. Listening for it means the frame is exactly as
 *  tall as its content: no inner scrollbar, nothing clipped, no dead space.
 */
export default function BookingWidget({ onEmailInstead }: Props) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const origin = bookingWidgetOrigin();

    const onMessage = (e: MessageEvent) => {
      // Origin check first: any page can postMessage to us, and this one
      // controls the height of a block on the page.
      if (origin && e.origin !== origin) return;
      const data = e.data as { iframeHeight?: unknown } | null;
      if (!data || typeof data !== "object") return;

      const raw =
        typeof data.iframeHeight === "number"
          ? data.iframeHeight
          : typeof data.iframeHeight === "string"
            ? parseInt(data.iframeHeight, 10)
            : NaN;
      if (!Number.isFinite(raw)) return;

      // +2px: the reported height and the rendered height can disagree by a
      // sub-pixel after layout rounding, and one stray pixel is all it takes
      // for the frame to decide it needs a scrollbar.
      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(raw) + 2)));
      setReady(true);
    };

    window.addEventListener("message", onMessage);
    const t = setTimeout(() => setReady(true), CONTENT_GRACE_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(t);
    };
  }, []);

  if (!isBookingWidgetConfigured()) return null;

  // No prefill: this IS the calendar now, so there is nothing to carry over.
  // Campaign parameters still ride along, which is the other half of what
  // buildBookingUrl does.
  const src = buildBookingUrl();
  if (!src) return null;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative w-full overflow-hidden border border-dark/10 bg-linen shadow-[0_20px_45px_rgba(44,40,37,0.1)]"
        style={{ height }}
      >
        {/* Opaque cover: the widget renders a default month with every date
            disabled while it fetches rates, which reads as a broken calendar.
            Better a few honest seconds of loading than an interactive lie. */}
        {!ready && (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-linen"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-dark/15 border-t-dark/50" />
              <p className="text-sm text-dark/60">Loading availability&hellip;</p>
            </div>
          </div>
        )}

        <iframe
          ref={frameRef}
          src={src}
          title="Check availability and book"
          className="h-full w-full border-0"
          /* No scrollbar inside the frame, ever. The widget reports its own
             content height as it changes (see the message listener above), so
             the frame is already as tall as what it holds — a scrollbar here
             would only ever be chrome for a pixel of rounding, and a panel
             that scrolls inside a page that also scrolls is miserable to use
             on a trackpad. */
          scrolling="no"
          /* payment: Hospitable takes card details in-frame. The site-wide
             Permissions-Policy in next.config.ts must also allow payment, or
             this has nothing to delegate and the card field silently refuses
             input. */
          allow="payment; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* Always present, not only after a failure: the booking path must never
          dead-end, and delivery can break upstream at any moment. */}
      <p className="text-center text-sm text-dark/55">
        Questions first?{" "}
        <button
          type="button"
          onClick={onEmailInstead}
          className="underline underline-offset-2 transition-colors hover:text-dark"
        >
          Email us about these dates
        </button>
      </p>
    </div>
  );
}
