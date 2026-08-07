import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Shared Sanity connection layer: the read client, the "is it configured?"
 * check, and the image URL builder. The actual content fetch for the site lives
 * in lib/site-content.ts (the `siteContent` singleton); the embedded Studio at
 * /studio uses isSanityConfigured() to decide whether to mount.
 *
 * Everything here is designed to no-op safely when Sanity is not configured
 * (blank NEXT_PUBLIC_SANITY_PROJECT_ID): the client is null and callers fall
 * back to the built-in content/content.json. Nothing throws on the render path.
 */

/** True only when a Sanity project id is present. */
export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}

/** Configured read client, or null when Sanity is not set up. */
export const client: SanityClient | null = isSanityConfigured()
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // false: reads hit the live API, not Sanity's CDN. The pages are ISR
      // (fetched only on regeneration, not per-visitor), so this costs nothing
      // in practice, and it guarantees a webhook-triggered revalidation bakes
      // the just-published content instead of a stale CDN copy.
      useCdn: false,
      perspective: "published",
      // Only needed for private datasets or draft/preview reads. Server-only.
      token: process.env.SANITY_API_READ_TOKEN || undefined,
    })
  : null;

// Image URL builder — bound to the client when configured.
const builder = client ? imageUrlBuilder(client) : null;

/**
 * Build a URL for a Sanity image source. Only usable when Sanity is configured
 * and the field actually holds an uploaded image asset — lib/site-content.ts
 * uses it to resolve every uploaded photo to a plain CDN url string.
 */
export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error("urlFor called but Sanity is not configured");
  }
  return builder.image(source);
}
