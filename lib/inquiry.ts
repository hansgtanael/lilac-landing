/** Server-only delivery for booking inquiries.
 *
 *  A validated inquiry lands here from app/api/inquiry. Hospitable's public API
 *  has no endpoint that accepts a cold enquiry from a website (messages require
 *  an existing reservation_uuid), so delivery is email.
 *
 *  Transport is Resend, chosen because it needs no SDK — one authenticated POST
 *  — and its free tier comfortably covers a single property.
 *
 *  Configure:
 *    RESEND_API_KEY    secret, from resend.com
 *    INQUIRY_TO_EMAIL  where enquiries land (the owner's inbox)
 *    INQUIRY_FROM_EMAIL  a verified sender on your Resend domain
 *
 *  UNCONFIGURED BEHAVIOUR IS DELIBERATE AND LOUD: if the key is missing this
 *  THROWS, so the API route returns 502 and the guest is told to email directly
 *  rather than seeing a false "we'll be in touch". The previous version logged
 *  and returned success, which silently discarded every lead — a guest saw
 *  confirmation and nobody was ever told. Never restore that behaviour.
 */
import "server-only";

export type Inquiry = {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  message?: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const TO_EMAIL = process.env.INQUIRY_TO_EMAIL || "";
const FROM_EMAIL = process.env.INQUIRY_FROM_EMAIL || "";

const SEND_TIMEOUT_MS = 10_000;

/** True only when every value needed to actually deliver mail is present. */
export function isInquiryDeliveryConfigured(): boolean {
  return RESEND_API_KEY.length > 0 && TO_EMAIL.length > 0 && FROM_EMAIL.length > 0;
}

/** Escape untrusted guest input before it goes into the HTML body. Without
 *  this, a name like `<img onerror=...>` would render in the owner's mail
 *  client. The plain-text part needs no escaping. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBody(i: Inquiry): { subject: string; text: string; html: string } {
  const subject = `Booking request — ${i.name}, ${i.checkIn} to ${i.checkOut} (${i.nights} night${i.nights === 1 ? "" : "s"})`;

  const rows: [string, string][] = [
    ["Name", i.name],
    ["Email", i.email],
    ["Check in", i.checkIn],
    ["Check out", i.checkOut],
    ["Nights", String(i.nights)],
    ["Guests", String(i.guests)],
  ];
  if (i.message) rows.push(["Message", i.message]);

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nReply straight to this email to reach the guest.`;

  const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#2c2825">
  <h2 style="margin:0 0 16px;font-size:18px">New booking request</h2>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#6b6560;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`,
      )
      .join("")}
  </table>
  <p style="margin:20px 0 0;color:#6b6560">Reply straight to this email to reach the guest.</p>
</div>`;

  return { subject, text, html };
}

/** Deliver an inquiry to the owner. Throws on any failure so the route returns
 *  502 and the guest sees a real error — never a false confirmation. */
export async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  if (!isInquiryDeliveryConfigured()) {
    // Loud on the server so a misconfigured deploy is obvious in the logs.
    console.error(
      "[inquiry] delivery is NOT configured (need RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL) — refusing to accept a booking request that would be lost",
    );
    throw new Error("Inquiry delivery is not configured.");
  }

  const { subject, text, html } = buildBody(inquiry);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      // reply_to is the guest, so the owner just hits Reply.
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: inquiry.email,
        subject,
        text,
        html,
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      // Log status only — the body can echo the API key back in some errors.
      console.error(`[inquiry] resend responded ${res.status}`);
      throw new Error("Inquiry delivery failed.");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Inquiry delivery failed.") throw e;
    console.error("[inquiry] send failed:", e instanceof Error ? e.message : e);
    throw new Error("Inquiry delivery failed.");
  } finally {
    clearTimeout(timer);
  }
}

// Exported for tests — lets the body builder be exercised without network I/O.
export const __testing = { buildBody, esc };
