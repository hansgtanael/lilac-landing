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

type Prefill = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

/** Build the iframe src, carrying the guest's current selection across so they
 *  do not re-pick dates they already chose on our card.
 *
 *  The parameter names follow Hospitable's booking-page convention. If a future
 *  version ignores them the widget simply opens unfilled — a cosmetic
 *  regression, never a broken booking — so this stays best-effort by design and
 *  never blocks the modal from opening.
 *
 *  Returns "" when unconfigured so callers can guard on a falsy value. */
export function buildBookingUrl({ checkIn, checkOut, guests }: Prefill = {}): string {
  if (!isBookingWidgetConfigured()) return "";

  const url = new URL(BOOKING_URL);
  if (checkIn) url.searchParams.set("check_in", checkIn);
  if (checkOut) url.searchParams.set("check_out", checkOut);
  if (guests) url.searchParams.set("guests", guests);
  return url.toString();
}

/** The configured origin, e.g. "https://booking.hospitable.com".
 *  Exported so the CSP comment in next.config.ts has a single source of truth
 *  to point at, and for diagnostics. Empty when unconfigured. */
export function bookingWidgetOrigin(): string {
  if (!isBookingWidgetConfigured()) return "";
  return new URL(BOOKING_URL).origin;
}
