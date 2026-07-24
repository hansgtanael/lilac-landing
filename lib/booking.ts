/** Pure booking-input validators shared by the client booking form and the
 *  server API routes, so both enforce identical rules (no client/server drift).
 *  No server-only imports here — safe to use in Client Components. */

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** RFC-5322-lite: good enough to reject obvious garbage without false negatives
 *  on real addresses. Real deliverability is confirmed downstream, not here. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DAY_MS = 86_400_000;

/** Local midnight for an ISO date string, or null if malformed. */
export function parseISODate(s: string): Date | null {
  if (!ISO_DATE_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Reject rollovers like 2026-02-31 -> Mar 3.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export type RangeCheck =
  | { ok: true; nights: number; checkIn: string; checkOut: string }
  | { ok: false; reason: string };

/** Validate a check-in/check-out pair: both well-formed, check-in today or
 *  later, check-out strictly after check-in. Returns the night count on success. */
export function validateRange(checkIn: string, checkOut: string): RangeCheck {
  const inDate = parseISODate(checkIn);
  const outDate = parseISODate(checkOut);
  if (!inDate || !outDate) return { ok: false, reason: "Dates are not valid." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inDate < today) return { ok: false, reason: "Check-in cannot be in the past." };
  if (outDate <= inDate) {
    return { ok: false, reason: "Check-out must be after check-in." };
  }

  const nights = Math.round((outDate.getTime() - inDate.getTime()) / DAY_MS);
  return { ok: true, nights, checkIn, checkOut };
}

/** Guests must be a whole number within 1..max. */
export function validateGuests(guests: unknown, max: number): number | null {
  const g = typeof guests === "number" ? guests : Number(guests);
  if (!Number.isInteger(g) || g < 1 || g > max) return null;
  return g;
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email);
}
