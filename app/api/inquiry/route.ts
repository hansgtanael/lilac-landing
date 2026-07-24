import { requireSameOrigin, guardBodySize } from "@/app/api/guard";
import { validateRange, validateGuests, isValidEmail } from "@/lib/booking";
import { deliverInquiry } from "@/lib/inquiry";
import { site } from "@/lib/content";

// Receives a booking inquiry from the booking card, validates every field
// server-side, and hands it to the pluggable delivery step. Node runtime.
export const runtime = "nodejs";

const GUESTS_MAX = site.text.booking.guestsMax;
const MAX_BODY = 8_192;
const MAX_NAME = 120;
const MAX_MESSAGE = 2_000;

export async function POST(request: Request) {
  // CSRF (same-origin) + body-size cap before touching the payload.
  const denied = requireSameOrigin(request) ?? guardBodySize(request, MAX_BODY);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body was not valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Name: required, trimmed, length-capped.
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (name.length < 1 || name.length > MAX_NAME) {
    return Response.json({ error: "A name is required." }, { status: 400 });
  }

  if (!isValidEmail(b.email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  const checkIn = typeof b.checkIn === "string" ? b.checkIn : "";
  const checkOut = typeof b.checkOut === "string" ? b.checkOut : "";
  const range = validateRange(checkIn, checkOut);
  if (!range.ok) return Response.json({ error: range.reason }, { status: 400 });

  const guests = validateGuests(b.guests, GUESTS_MAX);
  if (guests === null) {
    return Response.json({ error: "Guest count is out of range." }, { status: 400 });
  }

  // Message: optional, length-capped.
  let message: string | undefined;
  if (b.message !== undefined && b.message !== null) {
    if (typeof b.message !== "string" || b.message.length > MAX_MESSAGE) {
      return Response.json({ error: "Message is too long." }, { status: 400 });
    }
    message = b.message.trim() || undefined;
  }

  try {
    await deliverInquiry({
      name,
      email: b.email,
      checkIn: range.checkIn,
      checkOut: range.checkOut,
      guests,
      nights: range.nights,
      message,
    });
  } catch {
    return Response.json(
      { error: "We couldn't send your request. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
