/** Server-only Hospitable API client.
 *
 *  SECURITY: this module reads HOSPITABLE_API_TOKEN, a full-access secret, so it
 *  must only ever be imported from server code (route handlers under app/api/*).
 *  Importing it into a Client Component would leak the token into the browser
 *  bundle. The `import "server-only"` below turns that mistake into a build
 *  error rather than a silent leak.
 *
 *  Everything degrades gracefully: when the token/property are not configured,
 *  `isConfigured()` is false and callers fall back to the site's static pricing
 *  and an open calendar, so the booking UI works before any credentials exist.
 *
 *  ENDPOINT NOTE: paths and response shapes below follow Hospitable's public API
 *  (https://developer.hospitable.com). Confirm them against the exact API
 *  version enabled on your account — they are all isolated here and in
 *  normalizeCalendar() so a shape change is a one-file edit. Parsing is
 *  defensive on purpose (optional chaining, tolerant of missing fields).
 */
import "server-only";

const API_BASE = process.env.HOSPITABLE_API_BASE || "https://public.api.hospitable.com/v2";
const TOKEN = process.env.HOSPITABLE_API_TOKEN || "";
const PROPERTY_ID = process.env.HOSPITABLE_PROPERTY_ID || "";

const REQUEST_TIMEOUT_MS = 8_000;

/** True only when both the secret token and a target property are configured. */
export function isConfigured(): boolean {
  return TOKEN.length > 0 && PROPERTY_ID.length > 0;
}

/** One normalized night of calendar data. */
export type CalendarDay = {
  date: string; // "YYYY-MM-DD"
  available: boolean;
  /** Nightly price in minor units (cents) when Hospitable returns it, else null. */
  priceCents: number | null;
  currency: string | null;
};

export type CalendarResult = {
  days: CalendarDay[];
  currency: string | null;
};

/** Thrown for any upstream failure; callers convert this into a safe fallback. */
export class HospitableError extends Error {}

/** Authenticated GET against the Hospitable API with a hard timeout. */
async function hospitableGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
      signal: ctrl.signal,
      // Availability changes constantly — never cache at the fetch layer.
      cache: "no-store",
    });
    if (!res.ok) {
      // Deliberately do not surface the upstream body (may echo the token or
      // account internals); log server-side, return a generic error.
      console.error(`[hospitable] ${path} -> ${res.status}`);
      throw new HospitableError(`Hospitable responded ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof HospitableError) throw e;
    console.error(`[hospitable] ${path} request failed:`, e);
    throw new HospitableError("Hospitable request failed");
  } finally {
    clearTimeout(timer);
  }
}

/** Raw calendar row shape (subset we rely on). Kept loose on purpose. */
type RawCalendarDay = {
  date?: string;
  day?: string;
  available?: boolean;
  status?: string;
  availability?: { available?: boolean } | boolean;
  price?: { amount?: number; currency?: string } | number;
  pricing?: { price?: { amount?: number; currency?: string } };
};

/** Map Hospitable's calendar payload into our normalized shape. Isolated so an
 *  API-shape change is contained to this function. */
function normalizeCalendar(rows: RawCalendarDay[]): CalendarResult {
  let currency: string | null = null;
  const days: CalendarDay[] = [];

  for (const row of rows) {
    const date = row.date ?? row.day;
    if (!date) continue;

    // `available` may live at the top level, under `availability`, or be
    // implied by a status string.
    let available: boolean;
    if (typeof row.available === "boolean") available = row.available;
    else if (typeof row.availability === "boolean") available = row.availability;
    else if (typeof row.availability?.available === "boolean")
      available = row.availability.available;
    else if (row.status) available = row.status.toLowerCase() === "available";
    else available = true;

    // Price may be a number, a {amount,currency}, or nested under pricing.
    const priceObj =
      typeof row.price === "object" ? row.price : row.pricing?.price;
    const priceCents =
      typeof row.price === "number"
        ? Math.round(row.price)
        : typeof priceObj?.amount === "number"
          ? Math.round(priceObj.amount)
          : null;
    if (priceObj?.currency && !currency) currency = priceObj.currency;

    days.push({ date, available, priceCents, currency: priceObj?.currency ?? null });
  }

  return { days, currency };
}

/** Fetch and normalize the property calendar for a date range (inclusive
 *  start, exclusive end — matching how nights are counted). */
export async function getCalendar(start: string, end: string): Promise<CalendarResult> {
  // Confirm this path/params against your API version (see ENDPOINT NOTE above).
  const raw = await hospitableGet<{ data?: RawCalendarDay[] } | RawCalendarDay[]>(
    `/listings/${PROPERTY_ID}/calendar`,
    { start_date: start, end_date: end },
  );
  const rows = Array.isArray(raw) ? raw : (raw.data ?? []);
  return normalizeCalendar(rows);
}
