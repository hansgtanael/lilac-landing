/** Server-only delivery for booking inquiries.
 *
 *  A validated inquiry lands here from app/api/inquiry. How it reaches the owner
 *  is a deployment choice the site owner makes — Hospitable's public API has no
 *  clean "create a lead from a cold enquiry" endpoint, so delivery is pluggable
 *  rather than hardcoded. The default logs the inquiry server-side (visible in
 *  Netlify function logs) and succeeds, so the form works end-to-end today.
 *
 *  To go live, wire ONE channel below (email is the usual choice):
 *    - Email: add Resend/Postmark/SendGrid, send to the owner's inbox.
 *    - Hospitable: if your plan exposes a reservation-request/message endpoint,
 *      forward there using the server-side client in lib/hospitable.ts.
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

/** Deliver an inquiry to the owner. Throws on hard failure so the route can
 *  return 502; returning normally means "accepted". */
export async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  // Default channel: structured server-side log. Replace with a real transport
  // (see file header) before launch.
  console.info("[inquiry] booking request received", {
    name: inquiry.name,
    email: inquiry.email,
    checkIn: inquiry.checkIn,
    checkOut: inquiry.checkOut,
    nights: inquiry.nights,
    guests: inquiry.guests,
    hasMessage: Boolean(inquiry.message),
  });
}
