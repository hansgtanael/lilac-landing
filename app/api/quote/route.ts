import { getCalendar, getPricing, getTaxes, computeTaxCents, isConfigured } from "@/lib/hospitable";
import { getUnavailableDates, isIcalConfigured } from "@/lib/ical";
import { validateRange, validateGuests } from "@/lib/booking";
import { site } from "@/lib/content";

// Builds a price quote for a requested range and reports whether those nights
// are actually available.
//
//   - Hospitable configured: live per-night pricing AND availability.
//   - iCal only (free path): availability YES, pricing NO — iCal carries no
//     rates, so subtotalCents stays null and the card keeps its static math.
//     Still worth answering: it stops a guest requesting dates already taken.
//   - Neither: {configured:false}, card uses its static nightly rate.
//
// Node runtime (outbound fetch + env secret).
export const runtime = "nodejs";

const GUESTS_MAX = site.text.booking.guestsMax;
/** Order-of-magnitude reference for the unit guard below — NOT a price.
 *
 *  This used to read the CMS nightly rate, but pricing has moved wholly to
 *  Hospitable, and a guard that reads an editable field is a guard someone can
 *  switch off by mistake: a typo in the Studio would silently widen or narrow
 *  the band that protects every quote. A constant in code cannot be edited by
 *  accident, and it only ever needs to be within ~10x of reality. */
const EXPECTED_NIGHTLY_USD = 500;

/** Guard against a price-unit mismatch.
 *
 *  lib/hospitable.ts assumes the API returns nightly price in MINOR units
 *  (cents). If a future API version — or a different plan tier — returns a
 *  major-unit decimal instead (550 meaning $550, not $5.50), every quote would
 *  be off by exactly 100x, and the card would quote $5.50/night on a $550
 *  property. A guest seeing that is a support incident at best and a
 *  chargeback argument at worst.
 *
 *  So: sanity-check the API's average nightly rate against the rate the CMS
 *  already holds. A 10x band is deliberately wide — real dynamic pricing swings
 *  2-3x between off-season and peak, and legitimately should not be suppressed.
 *  Only a unit error lands outside it.
 *
 *  Out of band -> drop the subtotal and let the card fall back to static math,
 *  which is this route's existing answer to "we are not sure" everywhere else.
 *  Never show a number we cannot stand behind. */
function nightlyLooksSane(subtotalCents: number, nights: number): boolean {
  if (nights <= 0) return false;
  const apiNightly = subtotalCents / 100 / nights;
  return (
    apiNightly >= EXPECTED_NIGHTLY_USD / 10 && apiNightly <= EXPECTED_NIGHTLY_USD * 10
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guestsParam = url.searchParams.get("guests") ?? "";

  // Server-side input validation mirrors the client rules exactly (lib/booking).
  const range = validateRange(checkIn, checkOut);
  if (!range.ok) return Response.json({ error: range.reason }, { status: 400 });
  if (validateGuests(guestsParam, GUESTS_MAX) === null) {
    return Response.json({ error: "Guest count is out of range." }, { status: 400 });
  }

  // QUOTE VOLUME — the one booking-intent signal this site owns outright.
  //
  // Everything downstream of RESERVE happens inside Hospitable's iframe and is
  // invisible here, so without this line the funnel has no denominator: a month
  // with two bookings reads identically whether forty people priced a stay or
  // four did. That ratio is what diagnoses the funnel; the booking count alone
  // never can.
  //
  // Server-side and therefore ad-blocker-proof, costs no third-party request,
  // sets no cookie and needs no consent — it is a log line, not tracking. It
  // deliberately records no IP, no name and no email. Dates and party size
  // describe the STAY, not the person, and cannot identify a guest.
  //
  // Grep the Netlify function logs for "[quote]" to count them.
  console.log(
    `[quote] nights=${range.nights} guests=${guestsParam} ` +
      `checkIn=${range.checkIn} leadDays=${Math.round(
        (Date.parse(range.checkIn) - Date.now()) / 86_400_000,
      )}`,
  );

  // Free path: no Hospitable, but iCal feeds can still answer "is it free?".
  if (!isConfigured()) {
    if (!isIcalConfigured()) {
      return Response.json(
        { configured: false, nights: range.nights },
        { headers: { "cache-control": "no-store" } },
      );
    }
    const { unavailable, feedsOk, feedsTotal } = await getUnavailableDates(
      range.checkIn,
      range.checkOut,
    );
    const allFeedsDown = feedsTotal > 0 && feedsOk === 0;
    return Response.json(
      {
        configured: true,
        source: "ical",
        // null (not true) when every feed failed — absence of data is not proof
        // the nights are free, and claiming otherwise invites a double booking.
        available: allFeedsDown ? null : unavailable.length === 0,
        nights: range.nights,
        subtotalCents: null, // iCal has no pricing; the card keeps static math
        currency: null,
        degraded: allFeedsDown,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    // Three calls in parallel: the calendar carries nightly rates only, while
    // the fee and tax config a guest is also charged live elsewhere. Fees and
    // taxes change rarely but are fetched per request rather than cached, since
    // quoting a stale fee is the exact failure this is meant to remove.
    const [{ days, currency }, pricing, taxRules] = await Promise.all([
      getCalendar(range.checkIn, range.checkOut),
      getPricing(),
      getTaxes(),
    ]);
    // Nights are [checkIn, checkOut) — drop any checkout-day row the API returns.
    const nights = days.filter((d) => d.date >= range.checkIn && d.date < range.checkOut);

    // Minimum stay, enforced server-side as well as in the calendar: the UI
    // rule can be bypassed by calling this route directly, and a quote that
    // silently ignores it would report a bookable range Hospitable will refuse.
    const checkInDay = nights.find((d) => d.date === range.checkIn);
    const requiredNights =
      typeof checkInDay?.minStay === "number" && checkInDay.minStay > 1 ? checkInDay.minStay : 1;
    const meetsMinStay = range.nights >= requiredNights;

    const available = nights.length > 0 && nights.every((d) => d.available) && meetsMinStay;
    const priced = nights.filter((d) => d.priceCents !== null);
    const subtotalCents = priced.reduce((sum, d) => sum + (d.priceCents ?? 0), 0);
    // Every night priced AND the result plausible. Either check failing means
    // the card shows its own static math instead of a suspect live total.
    const trustSubtotal =
      priced.length === range.nights && nightlyLooksSane(subtotalCents, range.nights);
    if (priced.length === range.nights && !trustSubtotal) {
      console.error(
        `[quote] live pricing rejected: ${subtotalCents} cents over ${range.nights} night(s) ` +
          `is implausible against the ~$${EXPECTED_NIGHTLY_USD}/night this property ` +
          `charges — check whether the ` +
          `Hospitable calendar returns major units rather than cents (lib/hospitable.ts).`,
      );
    }

    // Full charge breakdown, so the card can stop guessing. Only computed when
    // the nightly subtotal is trustworthy — taxing a number we already refused
    // to display would compound the error rather than fix it.
    const cleaningFeeCents = trustSubtotal ? pricing.cleaningFeeCents : null;
    const tax =
      trustSubtotal && cleaningFeeCents !== null
        ? computeTaxCents(taxRules, {
            nightlyCents: subtotalCents,
            cleaningCents: cleaningFeeCents,
            nights: range.nights,
          })
        : null;
    const totalCents =
      trustSubtotal && cleaningFeeCents !== null && tax
        ? subtotalCents + cleaningFeeCents + tax.taxCents
        : null;

    return Response.json(
      {
        configured: true,
        available,
        nights: range.nights,
        cleaningFeeCents,
        taxCents: tax?.taxCents ?? null,
        totalCents,
        // False when a tax rule was skipped (night cap). The card should say
        // "estimated" rather than quote a figure it cannot stand behind.
        totalExact: tax?.exact ?? false,
        // Surfaced so the card can explain WHY a range is unavailable rather
        // than just greying out the button.
        minStayNights: requiredNights,
        meetsMinStay,
        // Only report a subtotal when every night carried a price AND that
        // price is plausible; otherwise the card keeps its static math rather
        // than showing a wrong total.
        subtotalCents: trustSubtotal ? subtotalCents : null,
        currency: currency ?? "USD",
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { configured: true, available: null, nights: range.nights, degraded: true },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
