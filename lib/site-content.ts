import type { SanityImageSource } from "@sanity/image-url";
import { client, isSanityConfigured, urlFor } from "@/lib/sanity";
import {
  site,
  type SiteContent,
  type RoomEntry,
  type PropertyPhoto,
} from "@/lib/content";

/**
 * Data layer for the MAIN site (route "/").
 *
 * getSiteContent() fetches the `siteContent` singleton from Sanity and projects
 * it back into the EXACT `SiteContent` shape that components already consume
 * from content/content.json — every uploaded photo asset resolved to a plain
 * CDN url string, every video kept as its stored path string.
 *
 * It falls back to the static `site` (imported from lib/content) whenever Sanity
 * is not configured, the singleton does not exist yet, or anything throws — so
 * the render path never breaks. In particular: with the document absent,
 * getSiteContent() returns the static `site` unchanged.
 */

// The singleton document id. Keep in sync with SITE_CONTENT_ID in
// sanity/structure.ts.
const SITE_CONTENT_ID = "siteContent";

// ---------------------------------------------------------------------------
// Raw (stored) shapes — the document as Sanity returns it: photos are image
// objects carrying an asset reference, videos are path strings. Optional
// everywhere because an editor could clear any field.
// ---------------------------------------------------------------------------

type RawImage = SanityImageSource;

type RawPhoto = { image?: RawImage; alt?: string; area?: string };

type RawHouseRoom = {
  title?: string;
  caption?: string;
  image?: RawImage;
  videoSrc?: string;
  poster?: string;
  srcCompact?: string;
};

type RawTitleSub = { title?: string; sub?: string };

type RawAboutSection = {
  title?: string;
  paragraphs?: string[];
  textSide?: "left" | "right";
  feature?: RawPhoto;
  featureShape?: "tall" | "wide";
  pair?: RawPhoto[];
  pairStyle?: "bleed" | "grid" | "overlap";
  caption?: string[];
};

type RawAboutRoom = {
  title?: string;
  floor?: string;
  image?: RawImage;
  alt?: string;
  desc?: string;
  photos?: { image?: RawImage; alt?: string }[];
};

type RawSiteContent = {
  house?: { title?: string; subtitle?: string; rooms?: RawHouseRoom[] };
  property?: { heading?: string; tagline?: string; photos?: RawPhoto[] };
  text?: {
    nav?: {
      brand?: string;
      links?: { label?: string; href?: string }[];
      cta?: string;
    };
    hero?: {
      eyebrow?: string;
      title?: string;
      tagline?: string[];
      ctaPrimary?: string;
      ctaSecondary?: string;
    };
    amenities?: {
      heading?: string;
      items?: string[];
      note?: string;
      stats?: { value?: number; label?: string }[];
    };
    experience?: { eyebrow?: string; quote?: string; highlights?: RawTitleSub[] };
    about?: {
      heading?: string;
      intro?: string[];
      sections?: RawAboutSection[];
      closing?: string;
      roomsTitle?: string;
      roomsCover?: RawPhoto;
      rooms?: RawAboutRoom[];
    };
    booking?: {
      lakeLabel?: string;
      heading?: string;
      body?: string;
      features?: RawTitleSub[];
      policyTitle?: string;
      policyBody?: string;
      sentTitle?: string;
      sentBody?: string;
      pricePerNight?: number;
      cleaningFee?: number;
      guestsMax?: number;
      rating?: string;
      perNightLabel?: string;
      checkInLabel?: string;
      checkOutLabel?: string;
      addDateLabel?: string;
      guestsLabel?: string;
      guestsMaxNote?: string;
      reserveLabel?: string;
      chargeNote?: string;
      cleaningFeeLabel?: string;
      serviceFeeLabel?: string;
      totalLabel?: string;
    };
    footer?: {
      brand?: string;
      location?: string;
      hostedByPrefix?: string;
      email?: string;
      listingUrl?: string;
      listingLabel?: string;
      availabilityLabel?: string;
      availabilityHref?: string;
      contactLabel?: string;
      copyright?: string;
    };
  };
};

// Whole document — image fields come back as objects with an asset reference,
// which urlFor() can resolve directly (no `asset->` dereference needed).
const SITE_CONTENT_QUERY = `*[_id == "${SITE_CONTENT_ID}"][0]`;

// ---------------------------------------------------------------------------
// Resolve helpers — turn stored image assets into plain url strings.
// ---------------------------------------------------------------------------

/** Resolve an uploaded image asset to a CDN url string ("" when absent). */
function imgUrl(source: RawImage | undefined | null): string {
  if (!source) return "";
  return urlFor(source).url() ?? "";
}

/** A stored photo -> the { src, alt, area? } shape components expect. */
function toPhoto(p: RawPhoto | undefined | null): PropertyPhoto {
  const out: PropertyPhoto = { src: imgUrl(p?.image), alt: p?.alt ?? "" };
  if (p?.area) out.area = p.area;
  return out;
}

/** One carousel card -> a RoomEntry (photo card OR video card). */
function toRoomEntry(r: RawHouseRoom): RoomEntry {
  // A card is a video card when it has no uploaded photo asset.
  const isVideo = !r.image && Boolean(r.videoSrc);
  const out: RoomEntry = {
    src: isVideo ? r.videoSrc ?? "" : imgUrl(r.image),
    title: r.title ?? "",
  };
  if (r.caption) out.caption = r.caption;
  if (isVideo) {
    if (r.poster) out.poster = r.poster;
    if (r.srcCompact) out.srcCompact = r.srcCompact;
  }
  return out;
}

function resolve(doc: RawSiteContent): SiteContent {
  const t = doc.text ?? {};

  const about = t.about ?? {};
  const resolvedAbout: SiteContent["text"]["about"] = {
    heading: about.heading ?? "",
    intro: about.intro ?? [],
    sections: (about.sections ?? []).map((s) => {
      const section: SiteContent["text"]["about"]["sections"][number] = {
        title: s.title ?? "",
        paragraphs: s.paragraphs ?? [],
      };
      if (s.textSide) section.textSide = s.textSide;
      if (s.feature?.image) section.feature = toPhoto(s.feature);
      if (s.featureShape) section.featureShape = s.featureShape;
      if (s.pair) section.pair = s.pair.map(toPhoto);
      if (s.pairStyle) section.pairStyle = s.pairStyle;
      if (s.caption) section.caption = s.caption;
      return section;
    }),
    closing: about.closing ?? "",
  };
  if (about.roomsTitle) resolvedAbout.roomsTitle = about.roomsTitle;
  if (about.roomsCover?.image) resolvedAbout.roomsCover = toPhoto(about.roomsCover);
  if (about.rooms) {
    resolvedAbout.rooms = about.rooms.map((r) => ({
      title: r.title ?? "",
      floor: r.floor ?? "",
      src: imgUrl(r.image),
      alt: r.alt ?? "",
      desc: r.desc ?? "",
      ...(r.photos
        ? { photos: r.photos.map((p) => ({ src: imgUrl(p.image), alt: p.alt ?? "" })) }
        : {}),
    }));
  }

  const nav = t.nav ?? {};
  const hero = t.hero ?? {};
  const amenities = t.amenities ?? {};
  const experience = t.experience ?? {};
  const booking = t.booking ?? {};
  const footer = t.footer ?? {};

  return {
    house: {
      title: doc.house?.title ?? "",
      subtitle: doc.house?.subtitle ?? "",
      rooms: (doc.house?.rooms ?? []).map(toRoomEntry),
    },
    property: {
      heading: doc.property?.heading ?? "",
      tagline: doc.property?.tagline ?? "",
      photos: (doc.property?.photos ?? []).map(toPhoto),
    },
    text: {
      nav: {
        brand: nav.brand ?? "",
        links: (nav.links ?? []).map((l) => ({
          label: l.label ?? "",
          href: l.href ?? "",
        })),
        cta: nav.cta ?? "",
      },
      hero: {
        eyebrow: hero.eyebrow ?? "",
        title: hero.title ?? "",
        tagline: hero.tagline ?? [],
        ctaPrimary: hero.ctaPrimary ?? "",
        ctaSecondary: hero.ctaSecondary ?? "",
      },
      amenities: {
        heading: amenities.heading ?? "",
        items: amenities.items ?? [],
        note: amenities.note ?? "",
        stats: (amenities.stats ?? []).map((s) => ({
          value: s.value ?? 0,
          label: s.label ?? "",
        })),
      },
      experience: {
        eyebrow: experience.eyebrow ?? "",
        quote: experience.quote ?? "",
        highlights: (experience.highlights ?? []).map((h) => ({
          title: h.title ?? "",
          sub: h.sub ?? "",
        })),
      },
      about: resolvedAbout,
      booking: {
        lakeLabel: booking.lakeLabel ?? "",
        heading: booking.heading ?? "",
        body: booking.body ?? "",
        features: (booking.features ?? []).map((f) => ({
          title: f.title ?? "",
          sub: f.sub ?? "",
        })),
        policyTitle: booking.policyTitle ?? "",
        policyBody: booking.policyBody ?? "",
        sentTitle: booking.sentTitle ?? "",
        sentBody: booking.sentBody ?? "",
        pricePerNight: booking.pricePerNight ?? 0,
        cleaningFee: booking.cleaningFee ?? 0,
        guestsMax: booking.guestsMax ?? 0,
        rating: booking.rating ?? "",
        perNightLabel: booking.perNightLabel ?? "",
        checkInLabel: booking.checkInLabel ?? "",
        checkOutLabel: booking.checkOutLabel ?? "",
        addDateLabel: booking.addDateLabel ?? "",
        guestsLabel: booking.guestsLabel ?? "",
        guestsMaxNote: booking.guestsMaxNote ?? "",
        reserveLabel: booking.reserveLabel ?? "",
        chargeNote: booking.chargeNote ?? "",
        cleaningFeeLabel: booking.cleaningFeeLabel ?? "",
        serviceFeeLabel: booking.serviceFeeLabel ?? "",
        totalLabel: booking.totalLabel ?? "",
      },
      footer: {
        brand: footer.brand ?? "",
        location: footer.location ?? "",
        hostedByPrefix: footer.hostedByPrefix ?? "",
        email: footer.email ?? "",
        listingUrl: footer.listingUrl ?? "",
        listingLabel: footer.listingLabel ?? "",
        availabilityLabel: footer.availabilityLabel ?? "",
        availabilityHref: footer.availabilityHref ?? "",
        contactLabel: footer.contactLabel ?? "",
        copyright: footer.copyright ?? "",
      },
    },
  };
}

/**
 * Fetch the `siteContent` singleton and resolve it into the SiteContent shape.
 * Returns the static `site` fallback when Sanity is not configured, the
 * document is missing, or on any error.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured() || !client) return site;
  try {
    const doc = await client.fetch<RawSiteContent | null>(SITE_CONTENT_QUERY);
    if (!doc) return site;
    return resolve(doc);
  } catch {
    return site;
  }
}
