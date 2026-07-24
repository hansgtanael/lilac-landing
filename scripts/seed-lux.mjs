/**
 * One-time seed for the /lux Sanity singleton.
 *
 * Pushes the exact copy + media paths that /lux already renders (the component
 * FALLBACK values) into the `luxPage` document, so the Studio opens pre-filled
 * instead of blank. Safe to re-run — createOrReplace overwrites the same _id.
 *
 * Usage:
 *   1. Create a Sanity project and put NEXT_PUBLIC_SANITY_PROJECT_ID +
 *      NEXT_PUBLIC_SANITY_DATASET in .env.local.
 *   2. In manage.sanity.io -> API -> Tokens, create an *Editor* token and add
 *      it to .env.local as SANITY_API_WRITE_TOKEN (write access; seed-only —
 *      you can delete it afterwards).
 *   3. Run:  node scripts/seed-lux.mjs
 *
 * This script self-loads .env.local (no --env-file flag needed).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@sanity/client";

// --- minimal .env.local loader (KEY=VALUE lines) ---------------------------
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* no .env.local — rely on the ambient environment */
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID + NEXT_PUBLIC_SANITY_DATASET\n" +
      "and a write token SANITY_API_WRITE_TOKEN in .env.local, then re-run:\n" +
      "  node scripts/seed-lux.mjs",
  );
  process.exit(1);
}

// --- the document, in SCHEMA shape (matches sanity/schemaTypes/luxPage.ts) --
const doc = {
  _id: "luxPage",
  _type: "luxPage",
  title: "Lux Page",
  hero: {
    eyebrow: "KEUKA LAKE · PENN YAN, NY",
    heading: "Life on the Lake",
    body: "A cozy lakehouse on Keuka Lake. A private dock, sunset views, and room for eight.",
    primaryCta: { label: "Check availability", href: "#stay" },
    secondaryCta: { label: "Explore the house", href: "#film" },
    videoPath: "/figma/hero-loop.mp4",
    videoAlt:
      "Keuka Lake sunset over the private dock at Lilac Landing, water and sky gently moving",
    posterPath: "/figma/hero-poster.jpg",
    posterAlt: "Keuka Lake sunset over the private dock at Lilac Landing",
  },
  arrival: {
    imagePath: "/figma/IMG_4256.jpeg",
    imageAlt: "Open living and dining room at Lilac Landing with wide views of Keuka Lake",
    heading: "Wake up to the water.",
  },
  film: {
    videoPath: "/figma/hero-loop.mp4",
    posterPath: "/figma/hero-poster.jpg",
    note: "A FILM, PLAYED BY YOUR SCROLL",
    scrubAriaLabel:
      "A slow walk through Lilac Landing, from the dock at morning to sunset color over Keuka Lake",
    ambientAriaLabel: "Morning on the private dock at Lilac Landing, water gently moving",
    captions: [
      "Morning starts on the dock.",
      "The light moves across the water all day.",
      "Evenings end in color.",
    ],
  },
  rooms: {
    rooms: [
      {
        _key: "room1",
        _type: "room",
        imagePath: "/figma/IMG_4248.jpeg",
        title: "The Great Room",
        line: "Lake-view windows and a long afternoon couch.",
        alignRight: false,
      },
      {
        _key: "room2",
        _type: "room",
        imagePath: "/figma/IMG_4299.jpeg",
        title: "The Deck",
        line: "Coffee out here lasts all summer.",
        alignRight: true,
      },
      {
        _key: "room3",
        _type: "room",
        imagePath: "/figma/IMG_4259.jpeg",
        title: "Primary Bedroom",
        line: "Lake views from under the covers.",
        alignRight: false,
      },
    ],
  },
  concierge: {
    eyebrow: "THE STAY",
    heading: "The Lake Residence",
    body: "A cozy lakeside residence on Keuka Lake, with a private dock and sunset views over the water. Book direct for the best rate, and a host on call whenever you need one.",
    details: [
      { _key: "d1", _type: "detail", label: "Lakefront", sub: "Private dock" },
      { _key: "d2", _type: "detail", label: "Chef's kitchen", sub: "Premium appliances" },
      { _key: "d3", _type: "detail", label: "Keypad entry", sub: "Self check-in" },
    ],
    price: "$550",
    priceUnit: "/ night",
    rating: "★ 4.98",
    fields: [
      { _key: "f1", _type: "field", label: "CHECK-IN", value: "Jul 18, 2026" },
      { _key: "f2", _type: "field", label: "CHECK-OUT", value: "Jul 23, 2026" },
    ],
    guestsLabel: "GUESTS",
    guestsValue: "4 guests",
    reserveLabel: "Reserve",
    reserveNote: "You won't be charged yet",
    conciergeNote: "24/7 concierge included",
  },
};

const client = createClient({ projectId, dataset, apiVersion: "2024-10-01", token, useCdn: false });

client
  .createOrReplace(doc)
  .then((res) => {
    console.log(`✓ Seeded "${res._id}" into ${projectId}/${dataset}. Open /studio to edit.`);
  })
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
