import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * siteContent — the SINGLETON document behind the MAIN site (route "/").
 *
 * One document (fixed id "siteContent") holds every piece of copy and every
 * photo the home page renders. Its fields mirror the `SiteContent` TypeScript
 * type in lib/content.ts one-to-one:
 *   house    -> house intro + the room carousel (GalleryNoir)
 *   property -> the "A Closer Look" gallery (PropertyStrip)
 *   text     -> every user-visible string, grouped by section:
 *               nav / hero / amenities / experience / about / booking / footer
 *
 * PHOTOS are stored as UPLOADED Sanity image assets (type "image", hotspot on);
 * lib/site-content.ts resolves each one to a plain CDN url string via
 * urlFor(asset).url(), so components receive the exact same `src: string` shape
 * they get from content/content.json today.
 *
 * VIDEOS stay as PATH STRINGS (e.g. "/videos/house-intro.mp4"): the house
 * carousel's first card is a video, and its src / poster / srcCompact point at
 * files under /public. A carousel card can therefore hold EITHER an uploaded
 * photo OR the three video path strings (never both).
 */

// --- small reusable field sets ---------------------------------------------

/** A photo = one uploaded image asset + alt text (+ optional gallery area). */
const photoFields = (withArea = false) => [
  defineField({
    name: "image",
    title: "Photo",
    type: "image",
    options: { hotspot: true },
  }),
  defineField({ name: "alt", title: "Alt text", type: "string" }),
  ...(withArea
    ? [
        defineField({
          name: "area",
          title: "Gallery group",
          type: "string",
          description:
            'Gallery tab this photo files under, e.g. "Outdoors". Consecutive photos sharing an area form one group.',
        }),
      ]
    : []),
];

/** A { title, sub } pair (experience highlights + booking features). */
const titleSubFields = [
  defineField({ name: "title", title: "Title", type: "string" }),
  defineField({ name: "sub", title: "Sub-label", type: "string" }),
];

export const siteContent = defineType({
  name: "siteContent",
  title: "Site Content (Home)",
  type: "document",
  // A singleton: extra copies are disabled via the desk structure
  // (see sanity/structure.ts) and sanity.config.ts document actions. It is
  // always edited at the fixed id "siteContent".
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "Editor-only label; not shown on the site.",
      initialValue: "Site Content",
      readOnly: true,
    }),

    // --- HOUSE (intro + room carousel) -------------------------------------
    defineField({
      name: "house",
      title: "1 · House & Room Carousel",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
        defineField({
          name: "rooms",
          title: "Carousel cards",
          type: "array",
          description:
            "Each card is EITHER a photo OR a video. For a photo card, set Photo and leave the video fields blank. For a video card, leave Photo blank and set the video path fields.",
          of: [
            defineArrayMember({
              type: "object",
              name: "houseRoom",
              fields: [
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "caption", title: "Caption", type: "string" }),
                defineField({
                  name: "image",
                  title: "Photo (photo cards only)",
                  type: "image",
                  options: { hotspot: true },
                  description: "Leave blank for a video card.",
                }),
                defineField({
                  name: "videoSrc",
                  title: "Video path (video cards only)",
                  type: "string",
                  description: 'e.g. "/videos/house-intro.mp4". Leave blank for a photo card.',
                }),
                defineField({
                  name: "poster",
                  title: "Video poster path",
                  type: "string",
                  description: 'Still shown before the video plays, e.g. "/videos/house-intro-poster.jpg".',
                }),
                defineField({
                  name: "srcCompact",
                  title: "Compact video path",
                  type: "string",
                  description: 'Lighter file for the <1024px native strip, e.g. "/videos/house-intro-720.mp4".',
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "caption", media: "image" },
              },
            }),
          ],
        }),
      ],
    }),

    // --- PROPERTY (gallery) -------------------------------------------------
    defineField({
      name: "property",
      title: "2 · Gallery",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "tagline", title: "Tagline", type: "string" }),
        defineField({
          name: "photos",
          title: "Photos",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "propertyPhoto",
              fields: photoFields(true),
              preview: { select: { title: "alt", subtitle: "area", media: "image" } },
            }),
          ],
        }),
      ],
    }),

    // --- TEXT (all copy, grouped by section) -------------------------------
    defineField({
      name: "text",
      title: "3 · Text & Copy",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        // nav ---------------------------------------------------------------
        defineField({
          name: "nav",
          title: "Nav",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "brand", title: "Brand", type: "string" }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "navLink",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string" }),
                    defineField({ name: "href", title: "Link (href)", type: "string" }),
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                }),
              ],
            }),
            defineField({ name: "cta", title: "CTA button", type: "string" }),
          ],
        }),
        // hero --------------------------------------------------------------
        defineField({
          name: "hero",
          title: "Hero",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "tagline",
              title: "Tagline lines",
              type: "array",
              description: "Rendered as one paragraph; lines join with a line break.",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({ name: "ctaPrimary", title: "Primary CTA", type: "string" }),
            defineField({ name: "ctaSecondary", title: "Secondary CTA", type: "string" }),
          ],
        }),
        // amenities ---------------------------------------------------------
        defineField({
          name: "amenities",
          title: "Amenities",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({
              name: "items",
              title: "Amenity items",
              type: "array",
              description: "Mapped by index onto the in-code icon set (icons cycle if longer).",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({ name: "note", title: "Note", type: "text", rows: 3 }),
            defineField({
              name: "stats",
              title: "Stats",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "stat",
                  fields: [
                    defineField({ name: "value", title: "Value", type: "number" }),
                    defineField({ name: "label", title: "Label", type: "string" }),
                  ],
                  preview: { select: { title: "label", subtitle: "value" } },
                }),
              ],
            }),
          ],
        }),
        // experience --------------------------------------------------------
        defineField({
          name: "experience",
          title: "Experience",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "quote", title: "Quote", type: "text", rows: 3 }),
            defineField({
              name: "highlights",
              title: "Highlights",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "highlight",
                  fields: titleSubFields,
                  preview: { select: { title: "title", subtitle: "sub" } },
                }),
              ],
            }),
          ],
        }),
        // about -------------------------------------------------------------
        defineField({
          name: "about",
          title: "About",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({
              name: "intro",
              title: "Intro paragraphs",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 4 })],
            }),
            defineField({
              name: "sections",
              title: "Story bands",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "aboutSection",
                  fields: [
                    defineField({ name: "title", title: "Title", type: "string" }),
                    defineField({
                      name: "paragraphs",
                      title: "Paragraphs",
                      type: "array",
                      of: [defineArrayMember({ type: "text", rows: 4 })],
                    }),
                    defineField({
                      name: "textSide",
                      title: "Text column side",
                      type: "string",
                      options: { list: ["left", "right"], layout: "radio" },
                      description: "Which side the text column sits on (photo takes the other side).",
                    }),
                    defineField({
                      name: "feature",
                      title: "Feature photo",
                      type: "object",
                      description: "Photo beside the text (leave blank for a text-only band).",
                      fields: photoFields(),
                      options: { collapsible: true, collapsed: true },
                    }),
                    defineField({
                      name: "featureShape",
                      title: "Feature shape",
                      type: "string",
                      options: { list: ["tall", "wide"], layout: "radio" },
                      description: '"tall" (685x847) or "wide" (685x458).',
                    }),
                    defineField({
                      name: "pair",
                      title: "Secondary photo row (0-2)",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "object",
                          name: "sectionPhoto",
                          fields: photoFields(),
                          preview: { select: { title: "alt", media: "image" } },
                        }),
                      ],
                    }),
                    defineField({
                      name: "pairStyle",
                      title: "Pair style",
                      type: "string",
                      options: { list: ["bleed", "grid", "overlap"], layout: "radio" },
                    }),
                    defineField({
                      name: "caption",
                      title: "Caption paragraphs",
                      type: "array",
                      of: [defineArrayMember({ type: "text", rows: 2 })],
                    }),
                  ],
                  preview: { select: { title: "title", media: "feature.image" } },
                }),
              ],
            }),
            defineField({ name: "closing", title: "Closing line", type: "string" }),
            defineField({ name: "roomsTitle", title: "Rooms row title", type: "string" }),
            defineField({
              name: "roomsCover",
              title: "Rooms cover photo",
              type: "object",
              description: "Continuous resting cover photo spanning the room columns.",
              fields: photoFields(),
              options: { collapsible: true, collapsed: true },
            }),
            defineField({
              name: "rooms",
              title: "Room columns",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "aboutRoom",
                  fields: [
                    defineField({ name: "title", title: "Title", type: "string" }),
                    defineField({ name: "floor", title: "Floor", type: "string" }),
                    defineField({
                      name: "image",
                      title: "Cover photo",
                      type: "image",
                      options: { hotspot: true },
                    }),
                    defineField({ name: "alt", title: "Cover alt text", type: "string" }),
                    defineField({ name: "desc", title: "Description", type: "string" }),
                    defineField({
                      name: "photos",
                      title: "Popup gallery photos",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "object",
                          name: "roomPhoto",
                          fields: [
                            defineField({
                              name: "image",
                              title: "Photo",
                              type: "image",
                              options: { hotspot: true },
                            }),
                            defineField({ name: "alt", title: "Alt text", type: "string" }),
                          ],
                          preview: { select: { title: "alt", media: "image" } },
                        }),
                      ],
                    }),
                  ],
                  preview: { select: { title: "title", subtitle: "floor", media: "image" } },
                }),
              ],
            }),
          ],
        }),
        // booking -----------------------------------------------------------
        defineField({
          name: "booking",
          title: "Booking",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "lakeLabel", title: "Lake label", type: "string" }),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 4 }),
            defineField({
              name: "features",
              title: "Features",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "bookingFeature",
                  fields: titleSubFields,
                  preview: { select: { title: "title", subtitle: "sub" } },
                }),
              ],
            }),
            defineField({ name: "policyTitle", title: "Policy title", type: "string" }),
            defineField({ name: "policyBody", title: "Policy body", type: "text", rows: 3 }),
            defineField({ name: "sentTitle", title: "Sent title", type: "string" }),
            defineField({ name: "sentBody", title: "Sent body", type: "text", rows: 2 }),
            defineField({
              name: "pricePerNight",
              title: "Price per night",
              type: "number",
              description: "Drives the price header + fee breakdown math.",
            }),
            defineField({ name: "cleaningFee", title: "Cleaning fee", type: "number" }),
            defineField({
              name: "guestsMax",
              title: "Max guests",
              type: "number",
              description: "Drives the guests <select> length + the max-guests note.",
            }),
            defineField({ name: "rating", title: "Rating", type: "string" }),
            defineField({ name: "perNightLabel", title: "Per-night label", type: "string" }),
            defineField({ name: "checkInLabel", title: "Check-in label", type: "string" }),
            defineField({ name: "checkOutLabel", title: "Check-out label", type: "string" }),
            defineField({ name: "addDateLabel", title: "Add-date label", type: "string" }),
            defineField({ name: "guestsLabel", title: "Guests label", type: "string" }),
            defineField({
              name: "guestsMaxNote",
              title: "Max-guests note",
              type: "string",
              description: '"{n}" is replaced with the max guests at render time.',
            }),
            defineField({ name: "reserveLabel", title: "Reserve label", type: "string" }),
            defineField({ name: "chargeNote", title: "Charge note", type: "string" }),
            defineField({ name: "cleaningFeeLabel", title: "Cleaning-fee label", type: "string" }),
            defineField({ name: "serviceFeeLabel", title: "Service-fee label", type: "string" }),
            defineField({ name: "totalLabel", title: "Total label", type: "string" }),
          ],
        }),
        // footer ------------------------------------------------------------
        defineField({
          name: "footer",
          title: "Footer",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "brand", title: "Brand", type: "string" }),
            defineField({ name: "location", title: "Location", type: "string" }),
            defineField({ name: "hostedByPrefix", title: "Hosted-by prefix", type: "string" }),
            defineField({ name: "email", title: "Email", type: "string" }),
            defineField({ name: "listingUrl", title: "Listing URL", type: "string" }),
            defineField({ name: "listingLabel", title: "Listing label", type: "string" }),
            defineField({ name: "availabilityLabel", title: "Availability label", type: "string" }),
            defineField({ name: "availabilityHref", title: "Availability href", type: "string" }),
            defineField({ name: "contactLabel", title: "Contact label", type: "string" }),
            defineField({ name: "copyright", title: "Copyright", type: "string" }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Content (Home)" }),
  },
});
