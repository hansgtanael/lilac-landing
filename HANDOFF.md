# Lilac Landing — project handoff

Paste-in brief for continuing this project in a fresh chat. Read this first.
Updated 2026-07-14 (supersedes everything older; DIRECTION.md is historical).

## What it is

A premium vacation-rental site for **Lilac Landing**, Elle Chan's newly built
lakehouse on **Keuka Lake, Penn Yan, NY** (elle@wearetrademark.com). Goal:
drive **direct bookings** off Airbnb. High stakes for Hans: impressing Elle
may lead to a job. Tone: warm, luxurious, photography-first.

## Where it lives / how to run

- Active project: **`lilac-landing-v2/`**. Do NOT edit `lilac-landing/` (v1, frozen).
- Stack: Next.js 16 App Router, Tailwind v4, motion/react v12, Lenis 1.3
  (site-wide smooth scroll via `components/SmoothScroll.tsx`, instance on
  `window.__lilacLenis`), Playfair Display italic (display) + DM Sans (body).
- Dev server: preview config **`lilac-v2`** (`.claude/launch.json`), lands on
  **port 3020** (3017 is often taken). Routes: `/` (site), `/cms` (studio),
  `/lux` (motion concept), any page + `?edit=1` (in-place text editing).
- **Live deploy is STALE**: https://lilaclanding.netlify.app was a manual
  drag-drop of an old build (pre all corrections). Rebuild (`npm run build`)
  and re-drop to publish. Not a git repo. No CLI/Git deploy configured.

## Content system (everything is CMS-driven)

- **`content/content.json`** = single source for ALL site copy + photos.
  Typed access via `lib/content.ts` (`import { site } from "@/lib/content"`).
  Shape: `house` (title/subtitle/rooms[]) · `property` (heading/tagline/photos[])
  · `text` (nav/hero/amenities/experience/booking/footer — every string, plus
  pricePerNight/cleaningFee/guestsMax as numbers driving real logic).
- **`/cms`** = Framer-style local studio (sidebar collections, photo pickers,
  cmd+S). APIs: GET/PUT `/api/content` (validator preserves the full text
  tree), GET `/api/photos` (lists public/figma + public/photos). Dev-only
  (403 in prod); edits write to disk and ship with the next deploy.
- **`?edit=1`** = click-any-text preview editing; "Save edits" writes
  `content/text-edits.json` + clipboard. "Bake it in" = read that file, write
  the edits into content.json/components, then clear it.
- All components are wired to `site.*` — never hardcode copy.

## "The House" section (GalleryNoir.tsx) — current motion design

All client-approved, verified; don't change without Hans:
1. Section pins (200svh total). Title = big centered Playfair, raised
   (`pt-[9svh]`), fades out as the spread starts.
2. **Two-state panels + loop (Jul 15 PM):** rooms[0] is now "Lilac Landing"
   (exterior; PLACEHOLDER src slowlake-out-deck.jpeg until Hans uploads the
   pro lake-front shot via /cms), 7 rooms total. During pose/gather/spread
   every card is the CLASSIC padded photo (photos only, no text). Once
   browsing starts, panels 1+ switch to Piaule compositions (invisible flip,
   they're offscreen): index 2 = centered photo with title left / caption
   right; every other index = photo left / title+caption right; card 0 stays
   the full framed photo. Browse buttons LOOP endlessly and SEAMLESSLY: a
   static aria-hidden clone of panel 0 trails the strip (PANELS = COUNT+1
   in every strip-position formula); next-from-last pans FORWARD onto the
   clone then snaps to 0; prev-from-first snaps onto the clone then pans
   back. Backgrounds reverted to cream Jul 15 PM (Welcome/House/About all
   bg-cream, wave lip fill-cream + 1px overlap to kill the seam); Title at
   pt-[5svh] z-30 so the 45% stack can't cover "Relax and Rewind"; the MF
   feature export was re-cropped (685x846, beige dead-zone removed) with
   the bleed pair pulled up to lg:mt-[64px].
3. **One continuous clip (Jul 14 PM):** the first scroll locks Lenis and
   plays gather AND spread as one skip-proof sequence — cards rise FLAT
   from the bottom into a centered stack (`stackScale` motionValue,
   default 0.35, third FrameTuner slider; 1.1s each, 0.18s reverse
   stagger — card 0 lands on top), 0.2s beat, then the bloom: all cards
   scale stackScale→1 sliding off alternately; card 0 stays as photo 1.
   No 3D fold (client rejected it).
4. **Browse = BUTTONS ONLY:** Caret pills + "n / N" counter bottom-center
   (also arrow keys). Scroll never moves photos; scrolling releases the pin
   to the next section.
5. Photos sit in a padded frame: **24px padding, 0 radius** (baked defaults;
   dev-only "Frame" slider pill bottom-left persists only after touch).
6. Reduced motion / <1024px → NativeStrip (swipe row).

## Other sections

- **PropertyStrip.tsx** = Airbnb-style: 5-photo collage + "Show all N photos"
  → full-screen modal (esc closes, Lenis stop/start). Content-driven, any count.
- Hero: Higgsfield-style video loop (`public/figma/hero-loop.mp4` + poster).
- **Slow Lake editorial flow** (Jul 14, from Figma concept frame 244:2 in the
  Lilac file — Hans's Chata Sękata-inspired design): page order is now
  Hero (+wave) → WelcomeIntro → GalleryNoir → AboutEditorial → WaveHills →
  Amenities (bg-linen) → PropertyStrip → Experience → BookSection.
  - **WaveEdge.tsx** = WaveHero (cream wave over the hero's bottom, parallax)
    + WaveHills (two-layer hills divider that crests into the linen zone).
  - **WelcomeIntro.tsx** = centered eyebrow + Playfair SemiBold Italic
    "Welcome to Lilac Landing" + wide Nunito intro (reads `text.about`
    eyebrow/heading/intro).
  - **AboutEditorial.tsx** = Main Floor (text left / right-bleed photo),
    Upper Level (photo left / text right), Outdoors (text band), 3-photo
    mosaic, closing statement — all from `text.about` (sections now carry
    optional `photo`, plus `mosaic[]`). Photos parallax-drift on scroll.
  - Editorial prose uses **Nunito** (`font-editorial`, layout.tsx).
  - AboutHouse.tsx was deleted (superseded).
  - **Slow Lake v2 (Jul 15, from Hans's rebuilt Figma frame 244:2):** display
    font is now **Lora** everywhere (Playfair removed from layout.tsx;
    lib/flags.ts DISPLAY_FONT="lora"; Fraunces A/B kept dormant). Welcome =
    centered ROMAN Lora heading + centered wide intro (no eyebrow). About =
    three light-bg story bands (THE MAIN FLOOR / THE UPPER LEVEL /
    THE OUTDOORS): Lora bold caps headline + Hans's rewritten paragraphs,
    feature photo beside text, secondary photo pair (`pairStyle`:
    bleed/grid/overlap), small caption; closing lilac italic line. The
    gather/spread gallery sits in the gap between Welcome and Main Floor.
    CMS shape: about.sections[{title, paragraphs, textSide, feature, pair,
    pairStyle, caption}] — invite/essentials/coordinates/mosaic/align knobs
    REMOVED per the new design. NOTE: Hans's Figma copy flips bedrooms to
    Jul 13 naming (primary DOWNSTAIRS, king upstairs) — implemented as
    written, unresolved vs the earlier Jul 9 decision; confirm with Elle.
    Photo slots are best-guess repo picks; Hans may re-pick in /cms.
  - **Exact-layout pass (Jul 15 PM):** About rebuilt to the frame's real
    geometry (1440 base: 22px edges, 140px gutters, 120px row rhythm,
    feature aspects 685/1156 tall / 685/526 wide via `featureShape`).
    Photos are now the EXACT images from Hans's Figma slots, exported at
    2x into `public/figma/slowlake-*.jpeg` (7 files; several are Elle's
    pro contractor shots, e.g. the deck/pergola). The Outdoors overlap
    slot was empty in Figma, so that band is the single big deck photo.
    GalleryNoir section + panel cards are bg-light to match About.
  - **Color zones (Hans's Figma fills, Jul 14 PM):** Welcome = bg-light
    (#FDFBF7, hero wave matches); Main Floor = bg-dark (linen/cream copy);
    Upper Level = light; Outdoors + mosaic = one bg-dark band; closing =
    brand-deep; Amenities + PropertyStrip + Experience = bg-linen.
  - **Pinned-hero overlap (Jul 14 PM):** Hero is `sticky top-0 z-0`; all
    later sections live in a `relative z-10 bg-cream` wrapper in page.tsx
    (with `mt-[68px] md:mt-[120px]` = wave-lip height, so nothing peeks into
    the hero at rest). WaveLip (WaveEdge.tsx) sits ABOVE the Welcome
    section's top edge and visibly rides over the frozen hero on scroll —
    WaveHero (bottom-of-hero drift variant) is gone. Hero copy back at its
    original bottom-16/20; the ambient loop pauses once scrolled 1.6
    viewports (it stays mounted behind the page).
  - **GalleryNoir (Jul 14 PM):** "The House" title restored top-center
    (fades on bloom). Gather + spread are now ONE continuous scroll-locked
    clip (gather → 0.2s beat → bloom; SPREAD_TRIGGER removed). Stack scale
    is dev-tunable — `stackScale` motionValue, default 0.35 (was 0.25),
    third slider in the FrameTuner pill, persisted with pad/radius.
- BookingCard: fee math from CMS numbers. Booking → Logify planned, not built;
  form currently has no backend.

## Elle's requests — see `ELLE-TASKS.md` (the working checklist)

Applied: her 19-caption gallery order (17 live), room renames, 8 guests,
effusive booking copy, enriched amenities, QR codes (`assets/qr/`, →
lilaclanding.com, for her physical sign — needs emailing to her).
**Pending on Hans:** save her 4 emailed photos into `public/figma/`
(IMG_5150/5154-HEIC/5159 + IMG_5179) → they become gallery #2 and #18;
reply to her Jul 14 email (76 pro contractor photos, Google Photos link,
cool-vs-warm grading decision); confirm primary/king bedroom naming
(her Jul 9 list and Jul 13 description contradict each other).

## Figma (official MCP, authed as Hans)

File `u5L4DHYVJzeUSjlJvtqiZD` "Lilac Landing — Website": desktop mirror
re-skinned cream + content-synced (+ mobile/tablet), sections named 01–07,
two prototype flows wired (mirror + Luxury Concept frame at node 191:2).
**Design-system build is PAUSED at Phase 0 scope-lock** (dual theme modes,
Foundations page, ~9 components, publish-ready) — resume via
figma:figma-generate-library skill. upload_assets recipe: call with nodeId →
POST multipart to submitUrl.

## /lux route (motion concept, kept)

Cinematic direction demo: scroll-scrubbed ScrollFilm (video.currentTime driven
by scroll — the slot for **Higgsfield slow-dolly clips** Hans wants to
generate from listing photos; Higgsfield MCP connected, generation costs
credits, ask first), Ken Burns rooms, concierge booking.

## Gotchas

- **Fast Refresh corrupts GalleryNoir state** if edited while the page is
  open (hook-order state slots → phantom counter values). Judge on fresh reload.
- The Claude preview pane: ~800px wide by default (mobile variants render —
  resize to 1280×800), compositor screenshots lag/crop (verify via DOM),
  browser scroll restoration fights probes (`history.scrollRestoration`).
- CMS sidebar buttons' textContent includes count badges ("Booking23") —
  match with startsWith in tests.
- Gmail MCP cannot download attachments. Figma MCP may need re-auth.
- Run `graphify update .` from inside lilac-landing-v2 after code changes;
  NEVER overwrite the root `Ridgestone CM/graphify-out` (whole-repo graph).
- No em-dashes anywhere in site copy (client-approved style).

## Open threads (priority order)

1. Elle's pending photos + her Jul 14 reply (she's waiting).
2. Redeploy to Netlify — the live site still shows pre-correction content.
3. Figma design-system build (paused; the client-handoff deliverable).
4. Higgsfield clips for /lux ScrollFilm.
5. Booking backend (Logify direction).
