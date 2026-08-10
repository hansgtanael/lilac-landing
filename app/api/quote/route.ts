import { getCalendar, isConfigured } from "@/lib/hospitable";
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
    const { days, currency } = await getCalendar(range.checkIn, range.checkOut);
    // Nights are [checkIn, checkOut) — drop any checkout-day row the API returns.
    const nights = days.filter((d) => d.date >= range.checkIn && d.date < range.checkOut);

    const available = nights.length > 0 && nights.every((d) => d.available);
    const priced = nights.filter((d) => d.priceCents !== null);
    const subtotalCents = priced.reduce((sum, d) => sum + (d.priceCents ?? 0), 0);

    return Response.json(
      {
        configured: true,
        available,
        nights: range.nights,
        // Only report a subtotal when every night carried a price; otherwise
        // the card keeps its static math rather than showing a wrong total.
        subtotalCents: priced.length === range.nights ? subtotalCents : null,
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
