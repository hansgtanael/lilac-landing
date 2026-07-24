import { getCalendar, isConfigured } from "@/lib/hospitable";
import { validateRange, validateGuests } from "@/lib/booking";
import { site } from "@/lib/content";

// Builds a live price quote from Hospitable's per-night calendar pricing and
// reports whether the requested nights are actually available. Falls back to
// {configured:false} when the API isn't wired up, so the card uses its static
// nightly rate. Node runtime (outbound fetch + env secret).
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

  if (!isConfigured()) {
    return Response.json(
      { configured: false, nights: range.nights },
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
