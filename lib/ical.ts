/** Server-only iCal availability provider.
 *
 *  The free alternative to Hospitable's API: Airbnb, Vrbo, and Booking.com all
 *  publish a read-only iCal feed of their booked/blocked dates at no cost, on
 *  any plan. We fetch those feeds and merge them into one set of unavailable
 *  nights, which is everything the booking calendar needs to grey dates out.
 *
 *  TRADE-OFF vs the Hospitable API (lib/hospitable.ts):
 *    - free, works on any plan, no credentials — just public feed URLs
 *    - availability ONLY. iCal carries no pricing, so quotes stay on the site's
 *      static nightly rate.
 *    - the platforms refresh their feeds roughly every 2-3 hours (sometimes up
 *      to 24), so this is "these dates look taken", not a booking guarantee.
 *      Never treat it as confirmation — always reconcile before accepting.
 *
 *  Configure with a comma-separated list of feed URLs:
 *    ICAL_FEEDS="https://www.airbnb.com/calendar/ical/123.ics?s=...,https://www.vrbo.com/icalendar/abc.ics"
 *
 *  Feed URLs are secrets in practice — they are unguessable and expose your
 *  booking pattern to anyone holding them — so they live in env, server-side,
 *  and are never returned to the browser. Only the resulting date list is.
 */
import "server-only";

const FEEDS = (process.env.ICAL_FEEDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const REQUEST_TIMEOUT_MS = 8_000;
const DAY_MS = 86_400_000;

/** True when at least one feed URL is configured. */
export function isIcalConfigured(): boolean {
  return FEEDS.length > 0;
}

/** Unfold iCal content lines: a leading space/tab continues the previous line
 *  (RFC 5545 §3.1). Must run before any property parsing or long DTSTART lines
 *  split by the exporter are silently missed. */
function unfold(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r\n|\n|\r/)) {
    if ((raw.startsWith(" ") || raw.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += raw.slice(1);
    } else {
      out.push(raw);
    }
  }
  return out;
}

/** Parse an iCal date value into a UTC-midnight Date.
 *  Handles `20260810` (all-day) and `20260810T150000Z` (date-time). */
function parseIcalDate(value: string): Date | null {
  const v = value.trim();
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(v);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Every booked NIGHT in one feed, as ISO dates.
 *
 *  Critical detail: for all-day VEVENTs, iCal DTEND is EXCLUSIVE — a stay of
 *  DTSTART=20260810 / DTEND=20260815 occupies nights 10,11,12,13,14 and frees
 *  the 15th (checkout morning). That happens to be exactly how nights are
 *  counted elsewhere in this codebase, so the half-open range maps straight
 *  through with no off-by-one adjustment. Getting this wrong blocks a
 *  bookable turnover night on every single reservation.
 */
function bookedNightsFromFeed(text: string): string[] {
  const lines = unfold(text);
  const nights: string[] = [];

  let inEvent = false;
  let start: Date | null = null;
  let end: Date | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      start = end = null;
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (start) {
        // A VEVENT with no DTEND is a single night.
        const last = end ?? new Date(start.getTime() + DAY_MS);
        for (let t = start.getTime(); t < last.getTime(); t += DAY_MS) {
          nights.push(isoUTC(new Date(t)));
        }
      }
      inEvent = false;
      start = end = null;
      continue;
    }
    if (!inEvent) continue;

    // Properties may carry parameters: `DTSTART;VALUE=DATE:20260810`
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).split(";")[0].toUpperCase();
    const value = line.slice(colon + 1);

    if (name === "DTSTART") start = parseIcalDate(value);
    else if (name === "DTEND") end = parseIcalDate(value);
  }

  return nights;
}

/** Fetch one feed. Returns [] on any failure — one dead feed must never take
 *  down the calendar, and a failure here should read as "unknown", not
 *  "booked" (failing closed would hide real availability). */
async function fetchFeed(url: string): Promise<string[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8" },
    });
    if (!res.ok) {
      // Do not log the URL — it is an unguessable secret.
      console.error(`[ical] feed responded ${res.status}`);
      return [];
    }
    return bookedNightsFromFeed(await res.text());
  } catch (e) {
    console.error("[ical] feed request failed:", e instanceof Error ? e.message : e);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export type IcalResult = {
  /** Sorted, de-duplicated ISO dates that are booked across every feed. */
  unavailable: string[];
  /** How many configured feeds actually returned data — lets callers tell
   *  "nothing is booked" apart from "every feed failed". */
  feedsOk: number;
  feedsTotal: number;
};

/** Merge every configured feed into one set of unavailable nights, optionally
 *  clipped to [start, end). Feeds are fetched concurrently. */
export async function getUnavailableDates(start?: string, end?: string): Promise<IcalResult> {
  if (FEEDS.length === 0) return { unavailable: [], feedsOk: 0, feedsTotal: 0 };

  const results = await Promise.all(FEEDS.map(fetchFeed));
  const feedsOk = results.filter((r) => r.length > 0).length;

  const set = new Set<string>();
  for (const nights of results) {
    for (const d of nights) {
      if (start && d < start) continue;
      if (end && d >= end) continue;
      set.add(d);
    }
  }

  return {
    unavailable: [...set].sort(),
    feedsOk,
    feedsTotal: FEEDS.length,
  };
}

// Exported for unit testing the parser without network access.
export const __testing = { bookedNightsFromFeed, unfold, parseIcalDate };
