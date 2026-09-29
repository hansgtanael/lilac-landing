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
 *  ENDPOINT NOTE: paths follow Hospitable's public API v2
 *  (https://developer.hospitable.com). Path verified 2026-08-07; response
 *  SHAPES verified 2026-09-11 against this property's live account — see
 *  RawCalendarDay for a real row. The earlier speculative typing was wrong in
 *  three ways that each broke the integration outright (rows nested under
 *  data.days, `status` an object not a string, `day` a weekday name), so treat
 *  the documented shape as authoritative and the remaining tolerance in
 *  normalizeCalendar() as version-insurance rather than guesswork.
 *
 *  SCOPE: this client is READ-ONLY (calendar availability + pricing). Hospitable
 *  v2 has no endpoint that accepts a cold booking enquiry from a website form —
 *  messages require an existing `reservation_uuid` — so the booking form cannot
 *  be delivered through Hospitable. See lib/inquiry.ts.
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
  /** Minimum nights required to START a stay on this date, when reported.
   *  This property returns 3 and 7 depending on the date, so a guest can pick a
   *  range the card accepts but Hospitable will refuse at checkout. Surfaced
   *  here so the booking UI can enforce it; nothing consumes it yet. */
  minStay: number | null;
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

/** Raw calendar row shape.
 *
 *  Verified 2026-09-11 against a live response for this property. An actual row:
 *
 *    { date: "2026-09-11", day: "FRIDAY", min_stay: 7, note: null,
 *      closed_for_checkin: false, closed_for_checkout: false,
 *      status: { reason: "BLOCKED", source: null,
 *                source_type: "ADVANCED_NOTICE", available: false },
 *      price: { amount: 48900, currency: "USD", formatted: "$489.00" } }
 *
 *  Two traps this shape sets, both of which the earlier speculative typing fell
 *  into (see the git history of normalizeCalendar):
 *    - `day` is a WEEKDAY NAME, not a date. Never fall back to it for `date`.
 *    - `status` is an OBJECT, not a string. Calling string methods on it throws.
 *
 *  `amount` is in MINOR UNITS — 48900 alongside formatted "$489.00" — which is
 *  what CalendarDay.priceCents expects, no conversion.
 *
 *  Alternative shapes below are kept optional for resilience across API
 *  versions, but the verified shape is the one that is actually returned. */
type RawCalendarDay = {
  date?: string;
  /** Weekday name ("FRIDAY"). Deliberately unused — never a date. */
  day?: string;
  min_stay?: number;
  available?: boolean;
  status?: { available?: boolean; reason?: string } | string;
  availability?: { available?: boolean } | boolean;
  price?: { amount?: number; currency?: string } | number;
  pricing?: { price?: { amount?: number; currency?: string } };
};

/** Envelope returned by /properties/{uuid}/calendar. */
type RawCalendarResponse =
  | RawCalendarDay[]
  | { data?: RawCalendarDay[] | { days?: RawCalendarDay[] } };

/** Map Hospitable's calendar payload into our normalized shape. Isolated so an
 *  API-shape change is contained to this function. */
function normalizeCalendar(rows: RawCalendarDay[]): CalendarResult {
  let currency: string | null = null;
  const days: CalendarDay[] = [];

  for (const row of rows) {
    // `date` only. NOT `row.date ?? row.day` — `day` is a weekday name
    // ("FRIDAY"), so that fallback silently produced junk dates.
    const date = row.date;
    if (!date) continue;

    // Verified shape puts this at `status.available`. The other branches are
    // version-tolerance, kept in preference order; the string branch is guarded
    // by a typeof check because `status` is an object here and calling
    // .toLowerCase() on it throws.
    let available: boolean;
    if (typeof row.status === "object" && typeof row.status?.available === "boolean")
      available = row.status.available;
    else if (typeof row.available === "boolean") available = row.available;
    else if (typeof row.availability === "boolean") available = row.availability;
    else if (typeof row.availability === "object" && typeof row.availability?.available === "boolean")
      available = row.availability.available;
    else if (typeof row.status === "string") available = row.status.toLowerCase() === "available";
    // Unknown shape -> treat as bookable. Fails OPEN, matching every other
    // availability path here: never invent a booking that does not exist.
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

    days.push({
      date,
      available,
      priceCents,
      currency: priceObj?.currency ?? null,
      minStay: typeof row.min_stay === "number" ? row.min_stay : null,
    });
  }

  return { days, currency };
}

/** Fetch and normalize the property calendar for a date range (inclusive
 *  start, exclusive end — matching how nights are counted). */
export async function getCalendar(start: string, end: string): Promise<CalendarResult> {
  // Verified 2026-08-07 against developer.hospitable.com: the calendar is keyed
  // by PROPERTY uuid, not listing id — `/listings/{id}/calendar` (used here
  // previously) 404s. Hospitable models one property as having many channel
  // listings; pricing returned is the take-home price for the property.
  // Dates are `start_date` / `end_date` in YYYY-MM-DD.
  const raw = await hospitableGet<RawCalendarResponse>(
    `/properties/${PROPERTY_ID}/calendar`,
    { start_date: start, end_date: end },
  );

  // Verified 2026-09-11: the payload is
  //   { data: { listing_id, provider, start_date, end_date, days: [...] } }
  // so the rows are at `data.days`, NOT `data`. The previous `raw.data ?? []`
  // handed normalizeCalendar an OBJECT, and `for...of` over it threw on every
  // single call — the whole Hospitable path failed closed to `degraded` and
  // silently fell through to iCal. Unwrap defensively: accept a bare array, a
  // `{data: [...]}`, or the real `{data: {days: [...]}}`.
  const payload: unknown = Array.isArray(raw) ? raw : raw?.data;
  const rows: RawCalendarDay[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { days?: RawCalendarDay[] } | undefined)?.days)
      ? ((payload as { days: RawCalendarDay[] }).days)
      : [];
  return normalizeCalendar(rows);
}

/* ---------------------------------------------------------------------------
 * Fees and taxes
 *
 * The calendar gives nightly rates only. Everything a guest is ALSO charged
 * lives in two other endpoints, both verified 2026-09-11:
 *
 *   /properties/{uuid}/pricing  -> cleaning_fee and friends, in minor units
 *   /properties/{uuid}/taxes    -> array of tax rules, per channel
 *
 * Without these the card understated a real 3-night stay by ~18% ($1,667 shown
 * against $1,964 actually charged) — the guest would have seen one number on
 * the card and a bigger one in the checkout modal seconds later.
 * ------------------------------------------------------------------------- */

/** A `{ default: { value: { amount } } }` fee block, flattened to cents.
 *  `overrides.direct` wins when present: fees can differ per channel, and a
 *  website booking is the `direct` channel. */
function feeCents(block: RawFeeBlock | undefined): number {
  const direct = block?.overrides?.direct;
  const chosen = direct ?? block?.default;
  const amount = chosen?.value?.amount;
  return typeof amount === "number" ? amount : 0;
}

type RawFeeValue = { value?: { amount?: number }; calculation_method?: string };
type RawFeeBlock = { default?: RawFeeValue; overrides?: { direct?: RawFeeValue | null } };

export type PropertyPricing = {
  currency: string | null;
  /** Per-stay cleaning fee in cents. */
  cleaningFeeCents: number;
};

export async function getPricing(): Promise<PropertyPricing> {
  const raw = await hospitableGet<{ data?: RawPricing } | RawPricing>(
    `/properties/${PROPERTY_ID}/pricing`,
    {},
  );
  const p = (raw as { data?: RawPricing })?.data ?? (raw as RawPricing);
  return {
    currency: p?.currency ?? null,
    cleaningFeeCents: feeCents(p?.cleaning_fee),
  };
}

type RawPricing = { currency?: string; cleaning_fee?: RawFeeBlock };

/** The property's own capacity, as Hospitable holds it.
 *
 *  Max guests used to live in the CMS, which made it a second editable copy of
 *  a fact Hospitable already owns — and Hospitable is what refuses an
 *  over-capacity booking at checkout, so the CMS copy could only ever be the
 *  one that was wrong. Elle changes the sleeping arrangements in one place now.
 *
 *  Null on any failure; callers fall back to DEFAULT_MAX_GUESTS so the guest
 *  selector is never empty during an outage. */
export async function getCapacity(): Promise<{ maxGuests: number | null }> {
  try {
    const raw = await hospitableGet<{ data?: RawProperty } | RawProperty>(
      `/properties/${PROPERTY_ID}`,
      {},
    );
    const d = (raw as { data?: RawProperty })?.data ?? (raw as RawProperty);
    const max = d?.capacity?.max;
    return { maxGuests: typeof max === "number" && max > 0 ? Math.floor(max) : null };
  } catch {
    return { maxGuests: null };
  }
}

type RawProperty = { capacity?: { max?: number } };

/** One tax rule, reduced to what a quote needs. */
export type TaxRule = {
  name: string;
  /** Fractional rate (0.04 = 4%). Only percent rules are modelled. */
  rate: number;
  /** Which charge components this tax applies to. */
  subjects: string[];
  /** Rule does not apply to stays longer than this, when set. */
  maxNights: number | null;
};

type RawTax = {
  name?: string;
  charge_type?: string;
  value?: { value?: number };
  subjects?: string[];
  max_number_of_nights?: number | null;
  is_active?: Record<string, boolean>;
};

/** Tax rules that apply to DIRECT bookings (the website channel).
 *
 *  Rules inactive for `direct` are dropped: this property has three 4% rules
 *  active for direct and vrbo but NOT for Airbnb, because Airbnb remits those
 *  itself. Applying an Airbnb-inactive rule here would overcharge. */
export async function getTaxes(): Promise<TaxRule[]> {
  const raw = await hospitableGet<{ data?: RawTax[] } | RawTax[]>(
    `/properties/${PROPERTY_ID}/taxes`,
    {},
  );
  const rows = Array.isArray(raw) ? raw : ((raw as { data?: RawTax[] })?.data ?? []);
  return rows
    .filter((t) => t.is_active?.direct === true && t.charge_type === "percent")
    .map((t) => ({
      name: t.name ?? "Tax",
      rate: typeof t.value?.value === "number" ? t.value.value : 0,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      maxNights: typeof t.max_number_of_nights === "number" ? t.max_number_of_nights : null,
    }))
    .filter((t) => t.rate > 0);
}

/** Total tax in cents for a stay.
 *
 *  Each rule is applied only to the components its `subjects` list names, so a
 *  rule covering nightly-rate but not cleaning-fees is charged correctly rather
 *  than on the whole subtotal.
 *
 *  Returns `exact: false` when a rule had to be skipped (a night cap exceeded),
 *  so callers can present the figure as an estimate instead of a promise. */
export function computeTaxCents(
  rules: TaxRule[],
  { nightlyCents, cleaningCents, nights }: { nightlyCents: number; cleaningCents: number; nights: number },
): { taxCents: number; exact: boolean } {
  let total = 0;
  let exact = true;
  for (const r of rules) {
    if (r.maxNights !== null && nights > r.maxNights) {
      // Cap exceeded: the rule's behaviour past its limit is not something we
      // can infer, so skip it and flag the total as approximate rather than
      // silently guessing in either direction.
      exact = false;
      continue;
    }
    let base = 0;
    if (r.subjects.includes("nightly-rate")) base += nightlyCents;
    if (r.subjects.includes("cleaning-fees")) base += cleaningCents;
    total += Math.round(base * r.rate);
  }
  return { taxCents: total, exact };
}
