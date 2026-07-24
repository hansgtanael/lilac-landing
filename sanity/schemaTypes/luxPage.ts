import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * luxPage — the SINGLETON document behind the /lux route.
 *
 * One document (fixed id "luxPage") holds every piece of copy and every
 * image/video path for the five cinematic sections. It is grouped into five
 * nested objects that mirror the components one-to-one:
 *   hero      -> components/lux/LuxHero.tsx
 *   arrival   -> components/lux/Arrival.tsx
 *   film      -> components/lux/ScrollFilm.tsx
 *   rooms     -> components/lux/RoomsFilm.tsx
 *   concierge -> components/lux/ConciergeStay.tsx
 *
 * Media are stored as PATH STRINGS (e.g. "/figma/hero-loop.mp4"), not uploaded
 * assets: the site's CSP + next/image config only allow same-origin media, so
 * assets live under /public and are referenced by path. Point a field at a
 * file in /public, or a full URL on a host you have allow-listed.
 */

// --- small reusable shapes -------------------------------------------------

const ctaFields = [
  defineField({
    name: "label",
    title: "Label",
    type: "string",
    validation: (r) => r.required(),
  }),
  defineField({
    name: "href",
    title: "Link (href)",
    type: "string",
    description: 'An in-page anchor like "#stay" or a full URL.',
    validation: (r) => r.required(),
  }),
];

export const luxPage = defineType({
  name: "luxPage",
  title: "Lux Page",
  type: "document",
  // A singleton: creation of extra copies is disabled via the desk structure
  // (see sanity/structure.ts), and it is always edited at the fixed id "luxPage".
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "Editor-only label; not shown on the site.",
      initialValue: "Lux Page",
      readOnly: true,
    }),

    // --- HERO ---------------------------------------------------------------
    defineField({
      name: "hero",
      title: "1 · Hero",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
        defineField({
          name: "primaryCta",
          title: "Primary button",
          type: "object",
          fields: ctaFields,
        }),
        defineField({
          name: "secondaryCta",
          title: "Secondary button",
          type: "object",
          fields: ctaFields,
        }),
        defineField({
          name: "videoPath",
          title: "Background video path",
          type: "string",
          description: 'e.g. "/figma/hero-loop.mp4"',
        }),
        defineField({
          name: "videoAlt",
          title: "Video description (aria-label)",
          type: "string",
        }),
        defineField({
          name: "posterPath",
          title: "Poster image path",
          type: "string",
          description: 'Still shown before/instead of the video, e.g. "/figma/hero-poster.jpg"',
        }),
        defineField({ name: "posterAlt", title: "Poster alt text", type: "string" }),
      ],
    }),

    // --- ARRIVAL ------------------------------------------------------------
    defineField({
      name: "arrival",
      title: "2 · Arrival",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "imagePath",
          title: "Full-bleed image path",
          type: "string",
          description: 'e.g. "/figma/IMG_4256.jpeg"',
        }),
        defineField({ name: "imageAlt", title: "Image alt text", type: "string" }),
        defineField({ name: "heading", title: "Headline", type: "string" }),
      ],
    }),

    // --- FILM (ScrollFilm) --------------------------------------------------
    defineField({
      name: "film",
      title: "3 · Scroll Film",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "videoPath",
          title: "Film video path",
          type: "string",
          description: 'Scrubbed on desktop / looped on mobile, e.g. "/figma/hero-loop.mp4"',
        }),
        defineField({ name: "posterPath", title: "Poster image path", type: "string" }),
        defineField({
          name: "note",
          title: "Corner note",
          type: "string",
          description: 'Small label, e.g. "A FILM, PLAYED BY YOUR SCROLL"',
        }),
        defineField({
          name: "scrubAriaLabel",
          title: "Scrubbed video description (aria-label)",
          type: "string",
        }),
        defineField({
          name: "ambientAriaLabel",
          title: "Ambient video description (aria-label)",
          type: "string",
        }),
        defineField({
          name: "captions",
          title: "Scene captions",
          type: "array",
          description: "Crossfade in order across the scroll. Three reads best.",
          of: [defineArrayMember({ type: "string" })],
        }),
      ],
    }),

    // --- ROOMS (RoomsFilm) --------------------------------------------------
    defineField({
      name: "rooms",
      title: "4 · Rooms",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "rooms",
          title: "Room bands",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "room",
              fields: [
                defineField({
                  name: "imagePath",
                  title: "Image path",
                  type: "string",
                  description: 'e.g. "/figma/IMG_4248.jpeg"',
                }),
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "line", title: "One-liner", type: "string" }),
                defineField({
                  name: "alignRight",
                  title: "Align caption to the right",
                  type: "boolean",
                  initialValue: false,
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "line", media: "imagePath" },
              },
            }),
          ],
        }),
      ],
    }),

    // --- CONCIERGE (ConciergeStay) -----------------------------------------
    defineField({
      name: "concierge",
      title: "5 · Concierge Stay",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({
          name: "details",
          title: "Detail row",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "detail",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "sub", title: "Sub-label", type: "string" }),
              ],
              preview: { select: { title: "label", subtitle: "sub" } },
            }),
          ],
        }),
        defineField({
          name: "price",
          title: "Price",
          type: "string",
          description: 'e.g. "$550"',
        }),
        defineField({
          name: "priceUnit",
          title: "Price unit",
          type: "string",
          description: 'e.g. "/ night"',
        }),
        defineField({
          name: "rating",
          title: "Rating",
          type: "string",
          description: 'e.g. "★ 4.98"',
        }),
        defineField({
          name: "fields",
          title: "Date chips",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "field",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "value", title: "Value", type: "string" }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
        }),
        defineField({ name: "guestsLabel", title: "Guests label", type: "string" }),
        defineField({ name: "guestsValue", title: "Guests value", type: "string" }),
        defineField({ name: "reserveLabel", title: "Reserve button label", type: "string" }),
        defineField({ name: "reserveNote", title: "Reserve note", type: "string" }),
        defineField({ name: "conciergeNote", title: "Concierge note", type: "string" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Lux Page" }),
  },
});
