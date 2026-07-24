import { getCalendar, isConfigured } from "@/lib/hospitable";
import { ISO_DATE_RE, parseISODate } from "@/lib/booking";

// Proxies Hospitable's calendar so the booking calendar can gray out booked
// nights. Secret token stays server-side; the client only ever sees a list of
// unavailable date strings. Node runtime (outbound fetch + env secret).
export const runtime = "nodejs";

const DAY_MS = 86_400_000;
const MAX_SPAN_DAYS = 400; // cap the window a single request can pull

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  // Not wired up yet -> report it plainly and let the UI leave the calendar
  // fully open. Never an error; the site must work before credentials exist.
  if (!isConfigured()) {
    return Response.json(
      { configured: false, unavailable: [], currency: null },
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

  try {
    const { days, currency } = await getCalendar(iso(start), iso(end));
    const unavailable = days.filter((d) => !d.available).map((d) => d.date);
    return Response.json(
      { configured: true, unavailable, currency },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    // Upstream hiccup -> fail open (calendar stays usable) rather than blocking
    // the whole booking flow on Hospitable being reachable.
    return Response.json(
      { configured: true, unavailable: [], currency: null, degraded: true },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
