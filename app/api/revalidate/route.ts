import { revalidatePath } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

// On-demand revalidation: Sanity POSTs here the moment content is published, and
// we immediately purge the affected page caches so edits appear in seconds
// instead of waiting out the 60s ISR window (which stays as a safety-net
// fallback if the webhook ever fails). Node runtime — needs the raw request
// body for HMAC verification plus revalidatePath.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  // Fail safe: without the shared secret we can't authenticate the caller, so
  // refuse rather than revalidate on an unverified request.
  if (!secret) {
    return Response.json({ error: "Revalidation is not configured." }, { status: 500 });
  }

  // Verify the payload came from Sanity (HMAC over the raw body, keyed by the
  // shared secret set on both the webhook and this env var).
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();
  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  // The client edits the main site (siteContent); revalidate both public pages
  // to be safe. Any published change refreshes them within seconds.
  revalidatePath("/");
  revalidatePath("/lux");

  return Response.json({ revalidated: true });
}
