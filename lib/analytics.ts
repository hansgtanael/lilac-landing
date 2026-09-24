/** Google Analytics 4 — configuration and the cross-domain link list.
 *
 *  WHY GA4 AND NOT A COOKIELESS TOOL (Plausible/Fathom):
 *  the booking itself happens inside Hospitable's iframe, on their origin. This
 *  origin cannot observe it — no postMessage bridge exists, deliberately (see
 *  lib/bookingWidget.ts). What makes the funnel measurable at all is that
 *  Hospitable injects a tracking tag INTO their booking flow and fires real
 *  ecommerce events (view_item, add_to_cart, begin_checkout, add_payment_info,
 *  purchase) into whichever property you name in their dashboard. They support
 *  GA4, GTM and Meta Pixel — and Meta only for page views. So GA4 is the single
 *  option that reports a completed booking. A cookieless tool would measure the
 *  visit beautifully and never see a dollar.
 *
 *  The cost of that choice is cookies: /privacy must say so before this ships,
 *  and a consent banner is a live question, not a settled one.
 *
 *  Unset -> isAnalyticsConfigured() is false, <Analytics /> renders nothing and
 *  the CSP is not widened. Same contract as every other integration here: the
 *  site must work, and stay locked down, before any credentials exist.
 *
 *  NEXT_PUBLIC_, so it ships to the browser and is inlined at BUILD time — set
 *  it on the host BEFORE the deploy that should carry it. A measurement ID is
 *  not a secret; it is visible in the page source of every GA4 site on earth.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** GA4 measurement IDs look like `G-XXXXXXXXXX`. Anything else is treated as
 *  unconfigured rather than injected — a malformed ID yields a tag that loads,
 *  costs a request, and silently records nothing, which is the worst outcome:
 *  a dashboard reading zero is indistinguishable from nobody booking. */
export function isAnalyticsConfigured(): boolean {
  return /^G-[A-Z0-9]{4,}$/.test(GA_ID);
}

export function analyticsId(): string {
  return isAnalyticsConfigured() ? GA_ID : "";
}

/** Hosts GA4 needs in the CSP. Read by next.config.ts, which adds them ONLY
 *  when the ID is configured, so an unmeasured site keeps the tighter policy. */
export const GA_SCRIPT_HOST = "https://www.googletagmanager.com";
export const GA_CONNECT_HOSTS = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
];

/** Domains that must share one GA4 session.
 *
 *  Without this the guest's visit ends at our origin and a completed booking
 *  arrives as a brand new "Direct" session — which severs the booking from the
 *  campaign, referral or search that produced it. That link is the entire
 *  reason to measure this funnel, so losing it quietly is the failure mode
 *  worth the most care.
 *
 *  This list must ALSO be set in the GA4 admin (Data Streams -> Configure tag
 *  settings -> Configure your domains). The tag-side config here covers link
 *  and form navigation; the admin list is what GA4 itself honours.
 *
 *  KNOWN GAP, verify on the first real booking: gtag decorates outbound LINKS
 *  and FORMS with the `_gl` linker parameter. It does not decorate an iframe
 *  src, and our checkout is an iframe (BookingWidgetModal). Attribution may
 *  therefore still break at the frame boundary even with everything below set.
 *  Check a live purchase in GA4 Realtime before trusting the numbers, and if
 *  the session splits, the fix belongs in buildBookingUrl().
 */
export const GA_LINKER_DOMAINS = ["lilaclanding.com", "booking.hospitable.com"];
