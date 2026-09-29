/** The path that always works.
 *
 *  Every other route to a booking depends on something being configured:
 *  Hospitable checkout needs NEXT_PUBLIC_HOSPITABLE_BOOKING_URL, the enquiry
 *  form needs a Resend key and a verified sending domain. Each is worth having
 *  and each can be absent, expire, or fail upstream.
 *
 *  A mailto: link depends on nothing. No key, no domain, no network call of
 *  ours, no server. It is the floor under the whole booking flow: whatever else
 *  is broken or unconfigured, a guest who wants these dates can still reach the
 *  owner, with the dates already written out for them.
 *
 *  Client-safe. The address is the owner's published contact address, already
 *  rendered in the footer of every page — nothing secret is exposed by it.
 */

export type EnquiryDraft = {
  checkIn?: string;
  checkOut?: string;
  guests?: string | number;
  nights?: number;
};

/** "2026-11-06" -> "November 6, 2026". Falls back to the raw string so a
 *  malformed date still reaches the owner rather than being dropped. */
export function prettyDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

/** One-line summary of what the guest picked, for a subject line. */
export function draftSummary(d: EnquiryDraft): string {
  const parts: string[] = [];
  if (d.checkIn && d.checkOut) parts.push(`${prettyDate(d.checkIn)} to ${prettyDate(d.checkOut)}`);
  if (d.guests) parts.push(`${d.guests} guest${String(d.guests) === "1" ? "" : "s"}`);
  return parts.join(", ");
}

/** A mailto: URL carrying the guest's selection, so the owner can reply with a
 *  real answer instead of first asking which dates they meant.
 *
 *  Everything is encodeURIComponent'd: an unescaped newline or ampersand in a
 *  mailto query silently truncates the body in several mail clients, which
 *  would drop exactly the dates this exists to carry. */
export function buildMailto(address: string, brand: string, d: EnquiryDraft): string {
  if (!address) return "";

  const summary = draftSummary(d);
  const subject = summary ? `Booking enquiry — ${summary}` : `Booking enquiry — ${brand}`;

  const lines = [`Hello,`, ``, `I'd like to enquire about staying at ${brand}.`];
  if (d.checkIn && d.checkOut) {
    lines.push(``, `Check-in:  ${prettyDate(d.checkIn)}`, `Check-out: ${prettyDate(d.checkOut)}`);
    if (d.nights) lines.push(`Nights:    ${d.nights}`);
  }
  if (d.guests) lines.push(`Guests:    ${d.guests}`);
  lines.push(``, `Thank you,`, ``);

  return (
    `mailto:${address}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(lines.join("\n"))}`
  );
}
