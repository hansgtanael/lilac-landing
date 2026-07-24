/**
 * One-time (re-runnable) migration for the MAIN site Sanity singleton.
 *
 * Reads content/content.json, uploads every PHOTO under /public to Sanity as an
 * image asset (each file uploaded once, cached by path), keeps every VIDEO as
 * its original path string, then writes the whole `siteContent` document
 * (fixed id "siteContent"). Safe to re-run — createOrReplace overwrites the
 * same _id (a fresh run re-uploads the assets, but the document stays single).
 *
 * Usage:
 *   1. NEXT_PUBLIC_SANITY_PROJECT_ID + NEXT_PUBLIC_SANITY_DATASET in .env.local.
 *   2. In manage.sanity.io -> API -> Tokens, create an *Editor* token and add
 *      it to .env.local as SANITY_API_WRITE_TOKEN (write access).
 *   3. Run:  npm run migrate:site   (or: node scripts/migrate-site.mjs)
 *
 * This script self-loads .env.local (no --env-file flag needed).
 */
import { readFileSync, createReadStream, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
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
      "  npm run migrate:site",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

// --- read the source content ------------------------------------------------
const content = JSON.parse(
  readFileSync(join(root, "content", "content.json"), "utf8"),
);
const publicDir = join(root, "public");

// --- image upload, cached by public path ------------------------------------
const assetCache = new Map(); // path -> assetId
let uploadCount = 0;

async function uploadImage(path) {
  if (assetCache.has(path)) return assetCache.get(path);
  const file = join(publicDir, path.replace(/^\//, ""));
  if (!existsSync(file)) {
    throw new Error(`Missing image file for "${path}" (expected at ${file})`);
  }
  const filename = basename(file);
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename,
  });
  assetCache.set(path, asset._id);
  uploadCount += 1;
  console.log(`  ↑ uploaded ${path} -> ${asset._id}`);
  return asset._id;
}

/** Build a Sanity image reference field from a /public photo path. */
async function imageRef(path) {
  const assetId = await uploadImage(path);
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

const isVideo = (src) => typeof src === "string" && src.toLowerCase().endsWith(".mp4");

// A stable _key generator scoped to a prefix.
const key = (prefix, i) => `${prefix}-${i}`;

// --- assemble the document --------------------------------------------------
async function build() {
  const c = content;

  // house.rooms: photo cards -> image asset, the .mp4 card -> path strings.
  const houseRooms = [];
  for (let i = 0; i < c.house.rooms.length; i++) {
    const r = c.house.rooms[i];
    const base = { _key: key("room", i), _type: "houseRoom", title: r.title };
    if (r.caption) base.caption = r.caption;
    if (isVideo(r.src)) {
      base.videoSrc = r.src;
      if (r.poster) base.poster = r.poster;
      if (r.srcCompact) base.srcCompact = r.srcCompact;
    } else {
      base.image = await imageRef(r.src);
    }
    houseRooms.push(base);
  }

  // property.photos: every src -> image asset (+ alt + area).
  const propertyPhotos = [];
  for (let i = 0; i < c.property.photos.length; i++) {
    const p = c.property.photos[i];
    const photo = {
      _key: key("photo", i),
      _type: "propertyPhoto",
      image: await imageRef(p.src),
      alt: p.alt,
    };
    if (p.area) photo.area = p.area;
    propertyPhotos.push(photo);
  }

  const T = c.text;

  // about.sections: feature + pair photos -> image assets.
  const sections = [];
  for (let i = 0; i < T.about.sections.length; i++) {
    const s = T.about.sections[i];
    const section = {
      _key: key("section", i),
      _type: "aboutSection",
      title: s.title,
      paragraphs: s.paragraphs,
    };
    if (s.textSide) section.textSide = s.textSide;
    if (s.feature) {
      section.feature = { image: await imageRef(s.feature.src), alt: s.feature.alt };
    }
    if (s.featureShape) section.featureShape = s.featureShape;
    if (s.pair) {
      section.pair = [];
      for (let j = 0; j < s.pair.length; j++) {
        section.pair.push({
          _key: key("pair", j),
          _type: "sectionPhoto",
          image: await imageRef(s.pair[j].src),
          alt: s.pair[j].alt,
        });
      }
    }
    if (s.pairStyle) section.pairStyle = s.pairStyle;
    if (s.caption) section.caption = s.caption;
    sections.push(section);
  }

  // about.rooms: cover + per-room gallery photos -> image assets.
  const aboutRooms = [];
  if (T.about.rooms) {
    for (let i = 0; i < T.about.rooms.length; i++) {
      const r = T.about.rooms[i];
      const room = {
        _key: key("aroom", i),
        _type: "aboutRoom",
        title: r.title,
        floor: r.floor,
        image: await imageRef(r.src),
        alt: r.alt,
        desc: r.desc,
      };
      if (r.photos) {
        room.photos = [];
        for (let j = 0; j < r.photos.length; j++) {
          room.photos.push({
            _key: key("rphoto", j),
            _type: "roomPhoto",
            image: await imageRef(r.photos[j].src),
            alt: r.photos[j].alt,
          });
        }
      }
      aboutRooms.push(room);
    }
  }

  const about = {
    heading: T.about.heading,
    intro: T.about.intro,
    sections,
    closing: T.about.closing,
  };
  if (T.about.roomsTitle) about.roomsTitle = T.about.roomsTitle;
  if (T.about.roomsCover) {
    about.roomsCover = {
      image: await imageRef(T.about.roomsCover.src),
      alt: T.about.roomsCover.alt,
    };
  }
  if (aboutRooms.length) about.rooms = aboutRooms;

  const doc = {
    _id: "siteContent",
    _type: "siteContent",
    title: "Site Content",
    house: {
      title: c.house.title,
      subtitle: c.house.subtitle,
      rooms: houseRooms,
    },
    property: {
      heading: c.property.heading,
      tagline: c.property.tagline,
      photos: propertyPhotos,
    },
    text: {
      nav: {
        brand: T.nav.brand,
        links: T.nav.links.map((l, i) => ({
          _key: key("link", i),
          _type: "navLink",
          label: l.label,
          href: l.href,
        })),
        cta: T.nav.cta,
      },
      hero: {
        eyebrow: T.hero.eyebrow,
        title: T.hero.title,
        tagline: T.hero.tagline,
        ctaPrimary: T.hero.ctaPrimary,
        ctaSecondary: T.hero.ctaSecondary,
      },
      amenities: {
        heading: T.amenities.heading,
        items: T.amenities.items,
        note: T.amenities.note,
        stats: T.amenities.stats.map((s, i) => ({
          _key: key("stat", i),
          _type: "stat",
          value: s.value,
          label: s.label,
        })),
      },
      experience: {
        eyebrow: T.experience.eyebrow,
        quote: T.experience.quote,
        highlights: T.experience.highlights.map((h, i) => ({
          _key: key("hl", i),
          _type: "highlight",
          title: h.title,
          sub: h.sub,
        })),
      },
      about,
      booking: {
        lakeLabel: T.booking.lakeLabel,
        heading: T.booking.heading,
        body: T.booking.body,
        features: T.booking.features.map((f, i) => ({
          _key: key("feat", i),
          _type: "bookingFeature",
          title: f.title,
          sub: f.sub,
        })),
        policyTitle: T.booking.policyTitle,
        policyBody: T.booking.policyBody,
        sentTitle: T.booking.sentTitle,
        sentBody: T.booking.sentBody,
        pricePerNight: T.booking.pricePerNight,
        cleaningFee: T.booking.cleaningFee,
        guestsMax: T.booking.guestsMax,
        rating: T.booking.rating,
        perNightLabel: T.booking.perNightLabel,
        checkInLabel: T.booking.checkInLabel,
        checkOutLabel: T.booking.checkOutLabel,
        addDateLabel: T.booking.addDateLabel,
        guestsLabel: T.booking.guestsLabel,
        guestsMaxNote: T.booking.guestsMaxNote,
        reserveLabel: T.booking.reserveLabel,
        chargeNote: T.booking.chargeNote,
        cleaningFeeLabel: T.booking.cleaningFeeLabel,
        serviceFeeLabel: T.booking.serviceFeeLabel,
        totalLabel: T.booking.totalLabel,
      },
      footer: {
        brand: T.footer.brand,
        location: T.footer.location,
        hostedByPrefix: T.footer.hostedByPrefix,
        email: T.footer.email,
        listingUrl: T.footer.listingUrl,
        listingLabel: T.footer.listingLabel,
        availabilityLabel: T.footer.availabilityLabel,
        availabilityHref: T.footer.availabilityHref,
        contactLabel: T.footer.contactLabel,
        copyright: T.footer.copyright,
      },
    },
  };

  return doc;
}

// --- run --------------------------------------------------------------------
console.log(`Migrating site content into ${projectId}/${dataset} ...`);
console.log("Uploading photos (videos stay as path strings):");

build()
  .then((doc) => client.createOrReplace(doc))
  .then((res) => {
    console.log("");
    console.log("Summary:");
    console.log(`  document:        ${res._id}`);
    console.log(`  photos uploaded: ${uploadCount} (unique files)`);
    console.log(`  house cards:     ${content.house.rooms.length}`);
    console.log(`  gallery photos:  ${content.property.photos.length}`);
    console.log(`  about sections:  ${content.text.about.sections.length}`);
    console.log(`  about rooms:     ${(content.text.about.rooms || []).length}`);
    console.log(`\n✓ Done. Open /studio -> "Site Content (Home)" to edit.`);
  })
  .catch((err) => {
    console.error("\nMigration failed:", err.message);
    process.exit(1);
  });
