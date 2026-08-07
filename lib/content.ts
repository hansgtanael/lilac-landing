import content from "@/content/content.json";

/** Site content, edited through the Sanity Studio at /studio and baked into the
 *  build. Components import `site` from here (never the JSON directly) so
 *  the shape stays typed in one place. The studio's API routes read/write
 *  content/content.json; the dev server hot-reloads this import on save. */
export type RoomEntry = {
  /** Image path, or an .mp4 for a video card (plays once the gallery's intro
   *  choreography lands and the frame is full). */
  src: string;
  title: string;
  caption?: string;
  /** Poster frame shown while a video src hasn't started. */
  poster?: string;
  /** Lighter video file served to the compact (<1024px) native strip. */
  srcCompact?: string;
};
export type PropertyPhoto = {
  src: string;
  alt: string;
  /** Gallery tab this photo files under (e.g. "Outdoors"); consecutive photos
   *  sharing an area form one group, in list order. */
  area?: string;
};

/** Every user-visible string/number, grouped by section, so all copy is
 *  editable through the content system (never hard-coded in components). */
export type NavLink = { label: string; href: string };
export type StatEntry = { value: number; label: string };
export type TitleSub = { title: string; sub: string };

export type TextContent = {
  nav: { brand: string; links: NavLink[]; cta: string };
  hero: {
    eyebrow: string;
    title: string;
    /** Rendered as one paragraph; lines join with a md-only line break. */
    tagline: string[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  amenities: {
    heading: string;
    /** Mapped by index onto the in-code icon set (icons cycle if longer). */
    items: string[];
    note: string;
    stats: StatEntry[];
  };
  experience: {
    eyebrow: string;
    quote: string;
    highlights: TitleSub[];
  };
  about: {
    heading: string;
    intro: string[];
    /** Story bands (Figma Slow Lake v2): headline caps band with a feature
     *  photo beside the text, an optional secondary photo pair, and an
     *  optional small caption. */
    sections: {
      title: string;
      paragraphs: string[];
      /** Which side the TEXT column sits on (photo takes the other side). */
      textSide?: "left" | "right";
      /** Feature photo beside the text (omit for a text-only band). */
      feature?: PropertyPhoto;
      /** Feature photo proportions: "tall" (685x847) or "wide" (685x458). */
      featureShape?: "tall" | "wide";
      /** Secondary photo row under the band (0-2 photos). */
      pair?: PropertyPhoto[];
      /** How the pair renders: "bleed" = right photo runs to the viewport
       *  edge; "grid" = simple two-up; "overlap" = big first photo with the
       *  second overlapping from the right. */
      pairStyle?: "bleed" | "grid" | "overlap";
      /** Small editorial caption paragraphs placed after the pair. A leading
       *  'Label - ' before ' - ' renders in bold serif; a final paragraph
       *  without ' - ' renders entirely in bold serif. */
      caption?: string[];
    }[];
    closing: string;
    /** "View Our Rooms" hover row title (optional; the Studio may omit). */
    roomsTitle?: string;
    /** Continuous resting cover photo spanning the room columns. */
    roomsCover?: PropertyPhoto;
    /** Room columns revealed on hover/focus (each carries its own photo). */
    rooms?: {
      title: string;
      floor: string;
      src: string;
      alt: string;
      desc: string;
      /** Optional per-room gallery for the click-through popup. */
      photos?: { src: string; alt: string }[];
    }[];
  };
  booking: {
    lakeLabel: string;
    heading: string;
    body: string;
    features: TitleSub[];
    policyTitle: string;
    policyBody: string;
    sentTitle: string;
    sentBody: string;
    /** Drives the price header + fee breakdown math. */
    pricePerNight: number;
    cleaningFee: number;
    /** Drives the guests <select> length + the max-guests note. */
    guestsMax: number;
    rating: string;
    perNightLabel: string;
    checkInLabel: string;
    checkOutLabel: string;
    addDateLabel: string;
    guestsLabel: string;
    /** "{n}" is replaced with guestsMax at render time. */
    guestsMaxNote: string;
    reserveLabel: string;
    chargeNote: string;
    cleaningFeeLabel: string;
    serviceFeeLabel: string;
    totalLabel: string;
  };
  footer: {
    brand: string;
    location: string;
    hostedByPrefix: string;
    email: string;
    listingUrl: string;
    listingLabel: string;
    availabilityLabel: string;
    availabilityHref: string;
    contactLabel: string;
    copyright: string;
  };
};

export type SiteContent = {
  house: { title: string; subtitle: string; rooms: RoomEntry[] };
  property: { heading: string; tagline: string; photos: PropertyPhoto[] };
  text: TextContent;
};

export const site: SiteContent = content as SiteContent;
