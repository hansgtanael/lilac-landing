import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Sanity data layer for the /lux route.
 *
 * Everything here is designed to no-op safely when Sanity is not configured
 * (blank NEXT_PUBLIC_SANITY_PROJECT_ID): the client is null, getLuxContent()
 * returns null, and callers fall back to their built-in copy. Nothing throws
 * on the render path.
 *
 * NOTE: media (images/videos) are modelled as PATH STRINGS, not uploaded Sanity
 * assets, because the site's CSP and next/image config only permit same-origin
 * media. The image URL builder below is still exported (required + future use).
 */

// The singleton document id. Keep in sync with sanity/structure.ts (LUX_PAGE_ID).
const LUX_PAGE_ID = "luxPage";

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
      useCdn: true,
      perspective: "published",
      // Only needed for private datasets or draft/preview reads. Server-only.
      token: process.env.SANITY_API_READ_TOKEN || undefined,
    })
  : null;

// Image URL builder — bound to the client when configured.
const builder = client ? imageUrlBuilder(client) : null;

/**
 * Build a URL for a Sanity image source. Only usable when Sanity is configured
 * and the field actually holds an uploaded image asset. Currently the lux
 * schema stores image *paths* (strings), so this is provided for completeness
 * and any future migration to uploaded assets.
 */
export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error("urlFor called but Sanity is not configured");
  }
  return builder.image(source);
}

// ---------------------------------------------------------------------------
// Resolved content types — the exact shape each /lux section component consumes.
// These are shared: every component types its hardcoded FALLBACK with the
// matching type, so Sanity data and fallback data are interchangeable.
// ---------------------------------------------------------------------------

export type LuxCta = { label: string; href: string };

export type LuxHeroContent = {
  eyebrow: string;
  heading: string;
  body: string;
  primaryCta: LuxCta;
  secondaryCta: LuxCta;
  posterUrl: string;
  posterAlt: string;
  videoUrl: string;
  videoAlt: string;
};

export type LuxArrivalContent = {
  imageUrl: string;
  imageAlt: string;
  heading: string;
};

export type LuxFilmContent = {
  videoUrl: string;
  posterUrl: string;
  note: string;
  scrubAriaLabel: string;
  ambientAriaLabel: string;
  captions: string[];
};

export type LuxRoom = {
  imageUrl: string;
  title: string;
  line: string;
  right: boolean;
};

export type LuxRoomsContent = {
  rooms: LuxRoom[];
};

export type LuxDetail = { label: string; sub: string };
export type LuxCardField = { label: string; value: string };

export type LuxConciergeContent = {
  eyebrow: string;
  heading: string;
  body: string;
  details: LuxDetail[];
  price: string;
  priceUnit: string;
  rating: string;
  fields: LuxCardField[];
  guestsLabel: string;
  guestsValue: string;
  reserveLabel: string;
  reserveNote: string;
  conciergeNote: string;
};

export type LuxContent = {
  hero: LuxHeroContent;
  arrival: LuxArrivalContent;
  film: LuxFilmContent;
  rooms: LuxRoomsContent;
  concierge: LuxConciergeContent;
};

// GROQ projects the stored document into the resolved shape above (renaming
// *Path -> *Url and alignRight -> right) so the returned object is directly
// usable as props.
const LUX_QUERY = `*[_id == "${LUX_PAGE_ID}"][0]{
  "hero": {
    "eyebrow": hero.eyebrow,
    "heading": hero.heading,
    "body": hero.body,
    "primaryCta": hero.primaryCta{ label, href },
    "secondaryCta": hero.secondaryCta{ label, href },
    "posterUrl": hero.posterPath,
    "posterAlt": hero.posterAlt,
    "videoUrl": hero.videoPath,
    "videoAlt": hero.videoAlt
  },
  "arrival": {
    "imageUrl": arrival.imagePath,
    "imageAlt": arrival.imageAlt,
    "heading": arrival.heading
  },
  "film": {
    "videoUrl": film.videoPath,
    "posterUrl": film.posterPath,
    "note": film.note,
    "scrubAriaLabel": film.scrubAriaLabel,
    "ambientAriaLabel": film.ambientAriaLabel,
    "captions": film.captions
  },
  "rooms": {
    "rooms": rooms.rooms[]{ "imageUrl": imagePath, title, line, "right": alignRight }
  },
  "concierge": {
    "eyebrow": concierge.eyebrow,
    "heading": concierge.heading,
    "body": concierge.body,
    "details": concierge.details[]{ label, sub },
    "price": concierge.price,
    "priceUnit": concierge.priceUnit,
    "rating": concierge.rating,
    "fields": concierge.fields[]{ label, value },
    "guestsLabel": concierge.guestsLabel,
    "guestsValue": concierge.guestsValue,
    "reserveLabel": concierge.reserveLabel,
    "reserveNote": concierge.reserveNote,
    "conciergeNote": concierge.conciergeNote
  }
}`;

/**
 * Fetch the singleton lux document, projected into the resolved LuxContent
 * shape. Returns null when Sanity is not configured, when the document does
 * not exist yet, or on any error — so every caller can fall back cleanly.
 */
export async function getLuxContent(): Promise<LuxContent | null> {
  if (!client) return null;
  try {
    const data = await client.fetch<LuxContent | null>(LUX_QUERY);
    return data ?? null;
  } catch {
    return null;
  }
}
