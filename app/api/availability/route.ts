import { getCalendar, getCapacity, isConfigured } from "@/lib/hospitable";
import { getUnavailableDates, isIcalConfigured } from "@/lib/ical";
import { ISO_DATE_RE, parseISODate } from "@/lib/booking";

// Feeds the booking calendar the list of nights to gray out. Two sources, in
// preference order:
//
//   1. Hospitable API  — real-time, also carries pricing. Needs a paid plan.
//   2. iCal feeds      — free on every plan (Airbnb/Vrbo publish them), but
//                        availability only and 2-3h stale.
//
// Whichever answers, the client only ever sees a list of date strings; feed
// URLs and API tokens stay server-side. Node runtime (outbound fetch + env).
export const runtime = "nodejs";

const DAY_MS = 86_400_000;
const MAX_SPAN_DAYS = 400; // cap the window a single request can pull

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  // Neither source wired up -> report it plainly and let the UI leave the
  // calendar fully open. Never an error; the site must work before any
  // credentials or feed URLs exist.
  if (!isConfigured() && !isIcalConfigured()) {
    return Response.json(
      { configured: false, unavailable: [], currency: null, minStay: {}, priceFromCents: null, guestsMax: null },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate any supplied bounds; otherwise default to the next year.
  let start = startParam && ISO_DATE_RE.test(startParam) ? parseISODate(startParam) : null;
  let end = endParam && ISO_DATE_RE.test(endParam) ? parseISODate(endParam) : null;
  if (!start || start < today) start = today;
  if (!end || end <= start) end = new Date(start.getTime() + 365 * DAY_MS);
  // Clamp the span so a crafted request can't ask for years of data.
  if ((end.getTime() - start.getTime()) / DAY_MS > MAX_SPAN_DAYS) {
    end = new Date(start.getTime() + MAX_SPAN_DAYS * DAY_MS);
  }

  // --- source 1: Hospitable (preferred — real-time, and carries pricing) ----
  if (isConfigured()) {
    try {
      // Capacity rides along with the calendar: both are property facts the
      // booking card needs before a guest touches anything, and one request
      // pair on mount beats two round trips.
      const [{ days, currency }, capacity] = await Promise.all([
        getCalendar(iso(start), iso(end)),
        getCapacity(),
      ]);
      const unavailable = days.filter((d) => !d.available).map((d) => d.date);
      // Minimum nights required to START a stay on each date. Only dates that
      // actually constrain anything are sent (>1), keeping the payload small —
      // this property returns a mix of 3 and 7. The UI treats a missing key as
      // "no minimum", so omitting the 1s is lossless.
      const minStay: Record<string, number> = {};
      for (const d of days) {
        if (typeof d.minStay === "number" && d.minStay > 1) minStay[d.date] = d.minStay;
      }
      // Cheapest bookable night in the window, for the card's "from $X" headline.
      // Only AVAILABLE nights count: advertising a rate no one can actually
      // book is the same broken promise as the static number this replaces.
      const bookablePrices = days
        .filter((d) => d.available && typeof d.priceCents === "number")
        .map((d) => d.priceCents as number);
      const priceFromCents = bookablePrices.length ? Math.min(...bookablePrices) : null;

      return Response.json(
        {
          configured: true,
          source: "hospitable",
          unavailable,
          currency,
          minStay,
          priceFromCents,
          guestsMax: capacity.maxGuests,
        },
        { headers: { "cache-control": "no-store" } },
      );
    } catch {
      // Fall through to iCal if it is configured, so one dead upstream does not
      // black out the calendar. Otherwise fail OPEN below.
      if (!isIcalConfigured()) {
        return Response.json(
          {
            configured: true,
            source: "hospitable",
            unavailable: [],
            currency: null,
            minStay: {},
            priceFromCents: null,
            guestsMax: null,
            degraded: true,
          },
          { headers: { "cache-control": "no-store" } },
        );
      }
    }
  }

  // --- source 2: iCal feeds (free fallback) ---------------------------------
  const { unavailable, feedsOk, feedsTotal } = await getUnavailableDates(iso(start), iso(end));
  return Response.json(
    {
      configured: true,
      source: "ical",
      unavailable,
      currency: null,
      // iCal carries availability only — no min-stay rules, pricing or
      // capacity exist in a calendar feed.
      minStay: {},
      priceFromCents: null,
      guestsMax: null,
      // Every feed failed -> the empty list means "unknown", not "all free".
      // Surfaced so the UI can soften its wording rather than promise availability.
      degraded: feedsTotal > 0 && feedsOk === 0,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
