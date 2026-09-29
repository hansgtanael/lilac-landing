/** Hospitable direct-booking widget — configuration and URL building.
 *
 *  The custom booking card (components/BookingCard.tsx) stays the centerpiece:
 *  it shows the brand-matched calendar, availability and the static rate math.
 *  This module only governs the LAST step — pressing RESERVE hands the guest to
 *  Hospitable's hosted booking page, in a modal, to take real dates + payment.
 *
 *  WHY AN IFRAME AND NOT THEIR SCRIPT LOADER:
 *  An iframe needs only `frame-src` in the CSP. A script loader would need
 *  `script-src` for their JS plus `connect-src` for every host it later calls,
 *  which is a far larger hole in a policy that is otherwise `default-src 'self'`
 *  (see next.config.ts). The iframe keeps third-party code out of this origin
 *  entirely — it cannot read the DOM, cookies, or localStorage here.
 *
 *  NOT A SECRET, unlike the iCal feed URLs in lib/ical.ts. This is a public
 *  booking page that guests are meant to reach, so it is deliberately a
 *  NEXT_PUBLIC_ variable and ships to the browser. Do not put an API token here.
 *
 *  Unset -> isBookingWidgetConfigured() is false and RESERVE keeps its existing
 *  behaviour (the email enquiry form). Same contract as every other integration
 *  in this codebase: the site must work before any credentials exist.
 */

const BOOKING_URL = process.env.NEXT_PUBLIC_HOSPITABLE_BOOKING_URL || "";

/** True when a booking URL is configured and is a valid https:// origin.
 *  An http:// or malformed value is treated as unconfigured rather than
 *  rendered — a mixed-content iframe would be blocked by the browser anyway,
 *  and failing back to the enquiry form is the useful outcome. */
export function isBookingWidgetConfigured(): boolean {
  if (!BOOKING_URL) return false;
  try {
    return new URL(BOOKING_URL).protocol === "https:";
  } catch {
    return false;
  }
}

/** Parameters Hospitable's booking widget actually reads.
 *
 *  Taken from their own widget loader (cdn.hsptb.com widget-loader.prod.js),
 *  not guessed: it whitelists exactly these before forwarding anything to the
 *  frame. Names matter — an unrecognised key is dropped in silence, and the
 *  guest re-picks dates they already chose on our card. We were sending
 *  `check_in`, `check_out` and `guests`, none of which exist. All three were
 *  being thrown away.
 *
 *  Note `adults`, not `guests`: their widget splits a party into adults,
 *  children, infants and pets. Our card asks for one number, so it maps to
 *  adults, which is what their own loader defaults to as well. */
const PASSTHROUGH = [
  "locale",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type Prefill = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

/** Build the iframe src, carrying the guest's current selection across so they
 *  do not re-pick dates they already chose on our card.
 *
 *  Campaign parameters on the current page are forwarded too. Their loader
 *  does this and it is worth keeping: without it a booking that began with an
 *  ad click arrives in Hospitable with no idea where it came from, and the ad
 *  spend cannot be judged.
 *
 *  Returns "" when unconfigured so callers can guard on a falsy value. */
export function buildBookingUrl({ checkIn, checkOut, guests }: Prefill = {}): string {
  if (!isBookingWidgetConfigured()) return "";

  const url = new URL(BOOKING_URL);
  if (checkIn) url.searchParams.set("checkin", checkIn);
  if (checkOut) url.searchParams.set("checkout", checkOut);
  if (guests) url.searchParams.set("adults", guests);

  // Campaign attribution from the page the guest is standing on.
  if (typeof window !== "undefined") {
    const here = new URLSearchParams(window.location.search);
    for (const key of PASSTHROUGH) {
      const value = here.get(key);
      if (value && value !== "null") url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/** The configured origin, e.g. "https://booking.hospitable.com".
 *  Exported so the CSP comment in next.config.ts has a single source of truth
 *  to point at, and for diagnostics. Empty when unconfigured. */
export function bookingWidgetOrigin(): string {
  if (!isBookingWidgetConfigured()) return "";
  return new URL(BOOKING_URL).origin;
}
