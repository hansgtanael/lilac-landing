# Lilac Landing — Version 2 Design Direction

> **Status:** Direction locked · first build complete & reconciled against the Figma frames (2026-07-03) — see §8 for frame-verified deltas
> **Source of truth:** [Figma — Lilac Landing](https://www.figma.com/design/u5L4DHYVJzeUSjlJvtqiZD/Untitled) (file key `u5L4DHYVJzeUSjlJvtqiZD`)
> **Relationship to v1:** `../lilac-landing/` is **frozen**. It is reference material only — v2 is a fresh build, not an edit. Do not modify v1.

---

## 1. What v2 is

A ground-up rebuild of the Lilac Landing site (Keuka Lake vacation rental, hosted by Elle Chan) designed **Figma-first**. The Figma file carries a complete, validated token system — every color, size, and radius decision lives there as a variable, and code must consume the same values. v1 grew code-first and was rethemed later; v2 inverts that: the Figma frames are the spec.

**Figma anchors:**

| Frame | Node ID | Notes |
|---|---|---|
| Desktop page (1440) | `18:2` | Canonical layout — section order is the contract |
| Mobile screen (375) | `113:5` | Booking card fills width; text wraps verified |
| Tablet screen (768) | `113:96` | Two-column booking section |
| Archived concepts | `Archive — Var 2 Bold Forest`, `Archive — gallery-noir-editorial`, `Archive — gallery-minimal-scandi` | On-canvas explorations, not in scope |

---

## 2. Design tokens (mirror of the Figma variable collections)

The Figma file holds 5 collections / ~94 variables, each with WEB code syntax already assigned. Code tokens must use those exact CSS custom-property names.

### Color — "Lilac Landing lavender & blue" palette

| Token | Value | Role |
|---|---|---|
| `--swatch--brand` | `#c4a8c4` | Lilac — eyebrows, accents, primary CTA fill |
| `--swatch--brand-dark` | `#8d6f8d` | Deep lilac — hover/pressed accent |
| `--swatch--dark` | `#1a3a4a` | Lake navy — page canvas |
| `--swatch--blue-deep` | `#152e3b` | Panel/card surfaces on the canvas |
| `--swatch--blue` | `#2d6475` | Mid teal — icons, secondary hovers |
| `--swatch--light` | `#fdfbf7` | Cream — text on dark, light input chips |
| `--swatch--gray` | `#e2dfda` | Warm gray — rare, light-surface support |
| `--swatch--light-faded` | `#ffffff1a` | Hairlines, bezel shells (10% white) |
| `--swatch--dark-faded` | `#3532331a` | Hairlines on light chips |

**Theme layer** (`--_theme---*`): `background` → dark, `background-alt` → blue-deep, `text` → light, `text-alt` → brand, `border` → light. Button primary: lilac fill / navy text, hover inverts to cream. Button secondary: transparent fill / `light-faded` border / cream text.

### Typography

- **Display:** Playfair Display *Italic* — Hero 112 / H1 80 / H2 48 / H3 32. Line-heights tight: 0.83–1.1.
- **Body:** DM Sans — Large 20 / Base 16 / Small 12, line-height 1.25–1.33.
- **Labels:** DM Sans Medium, 11–12px, uppercase, **35% letter-spacing** (`tracking-[0.35em]`) — the signature luxury move; applies to every eyebrow.
- **Buttons:** DM Sans SemiBold 16, ~4% tracking.
- Never introduce a third family. If Neue Haas Grotesk ever enters licensing, it swaps in via the `font/primary-family` variable only.

### Spacing, radius, borders

- Size scale: rem-based, 0–256px (`--size--0rem` … `--size--16rem`).
- Component spacing: `space/1–8` = 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64.
- **Section rhythm:** `section-space` xsmall 40 · small 80 · main 120 · **large 160** (default between major sections) · page-top 240.
- Radius: small 8 · main 16 · round 9999 (all CTAs are full pills). Borders: 1px hairlines only.
- Grid: 12 columns, 16px gutter, 16px site margin.

---

## 3. Page architecture (from Figma desktop `18:2`)

Section order is fixed:

1. **Hero** — full-bleed lake photo, bottom-left aligned. Eyebrow → Playfair italic display title → subcopy → two pill CTAs (lilac primary "Check Availability", outline secondary). Floating glass-pill nav.
2. **The Experience** — centered editorial pull quote (guest review), thin 64px lilac divider, three icon highlights (On the Lake / Sunset Views / Private Dock).
3. **The House (Gallery)** — photo grid with featured 2×2 tile, every image in a double-bezel shell.
4. **What's Included (Amenities)** — two columns: amenity checklist left, stats panel right (3 Bedrooms / 4 Beds / 2.5 Baths / 8 Guests) in a dark bezel card.
5. **Where You'll Sleep (Bedrooms)** — three double-bezel room cards with tracked uppercase captions.
6. **Booking** — two-column: pitch + contact fields + "Direct Booking Policy" panel left; **booking card** right ($550/night, dates, guests, lilac Reserve pill, live fee breakdown → $550 × n nights + $200 cleaning + $0 service). Card is sticky on desktop, full-width on mobile.
7. **Footer** — brand block + links on navy, hairline separations.

---

## 4. Signature components

- **Double-bezel card** — outer shell `white/5` fill + 1px `light-faded` ring + 4px inset, inner core `blue-deep` with `radius/main`. Used for: gallery tiles, bedroom cards, stats panel, booking card, confirmation states.
- **Pill CTA** — full-round, lilac fill, navy label, nested icon circle that nudges on hover; double-bezel ring around primary submits.
- **Light input chips** — form fields render as cream/light chips with dark text *on purpose* — the strongest contrast block on the page (per Figma booking card).
- **Eyebrow** — 11px DM Sans Medium, uppercase, 35% tracking, lilac.
- **Stats numeral** — Playfair italic display digits over tracked labels.

---

## 5. Motion language

Principles proven in v1 — carry the vocabulary, rebuild the implementation:

- **One ease:** `cubic-bezier(0.32, 0.72, 0, 1)` everywhere.
- Hero: staged fade/rise entrance after loader; slow image parallax on scroll.
- Sections: once-only viewport reveals, 40px rise, staggered children (0.06–0.12s).
- Gallery: GSAP ScrollTrigger scrubbed scale/opacity on desktop; one-shot fade on mobile.
- Stats: count-up from 0 on first view (spring, ~60 stiffness).
- Booking card: fee breakdown unfolds (height + opacity); total re-keys and slides on change.
- **Reduced motion is a contract:** every animation collapses to its end state under `prefers-reduced-motion`.

---

## 6. Build notes

- **Stack:** fresh Next.js (App Router) + Tailwind v4 (`@theme` tokens mapped 1:1 to the Figma variables) + `motion/react` + GSAP for scroll scrubs. Same stack as v1 — the rebuild is about design provenance, not tech churn.
- **Workflow:** for each section, pull `get_design_context` / screenshots from the Figma node before building; the Figma variables' code syntax gives the exact CSS custom-property names.
- **Content:** copy, photos (7 property photos), Airbnb listing URL, and host contact carry over from v1 — lift them from `../lilac-landing/`, don't rewrite history.
- **v1 as reference:** `../lilac-landing/components/` holds working implementations of the calendar, booking math, motion guards. Read, copy, adapt — never edit in place.

## 7. Open questions

- [ ] Loader concept for v2 — keep v1's curtain lift or design new in Figma first?
- [ ] ScrollStory ("Swim. Fish. Watch the sunset.") — not yet in the Figma file; design it there before building.
- [ ] Real booking backend (v1 logs to console) — inquiry email? Airbnb deep-link? TBD.
- [ ] Domain/deploy target (v1 folder references Netlify; confirm for v2).

---

## 8. Reconciliation notes — Figma pull, 2026-07-03

Verified against the live file with the Figma MCP. Where the frame and the prose above disagree, the frame won (per §1). Deltas adopted in code:

- **Nav (`4:5`)** — the "floating glass pill" is actually a **full-width glass bar**: 1380 wide, 44 tall, radius 12 (not fully round), `white/20` fill + 6px blur, logo in DM Sans Regular 20 (not Playfair italic), links DM Sans 20 centered, lilac Book Direct pill right.
- **Hero (`110:36`)** — copy block bottom-left and the **CTA pair bottom-right**, one row. Title line-height 0.83. Subcopy 20px full-opacity cream, two lines. Primary pill has a `white/32` hairline ring and `white/24` icon circle.
- **Stats panel (`110:19`)** — the 2×2 double-bezel card (`6:18`) is **hidden in the file**, replaced by a **flat blue-deep card** (radius 24, p-40, soft shadow): vertical rows, Playfair-italic 48 numerals, **sentence-case 12px labels**, hairline dividers. Dock badge hidden with it.
- **Booking card (`81:47`)** — **flat card, not double-bezel**: blue-deep, `light-faded` border, radius 28, p-32, deep shadow. **Check-in / check-out chips** (label 12px 35%-tracked + value 16px) instead of a bare calendar — code keeps v1's RangeCalendar folding out beneath the chips. Guests helper sits **inside** the chip. **RESERVE uppercase**, plain full-width lilac pill (h-56), no bezel ring, no icon.
- **Copy** — highlight note is "West-facing sunset views" (`5:13`); footer host + email on one line (`7:34`).

Known contradictions inside the Figma file (not adopted, flag for design):

- Hero subcopy (`4:16`) says "**10 guests**" but stats (`110:32`), booking card (`81:66`), and v1 content all say **8**. Code keeps 8.
- The gallery sections inside the page frame are the **archived concepts** (`Archive — gallery-noir-editorial`, `Archive — gallery-minimal-scandi`) — out of scope per §1, so code keeps §3's gallery + bedrooms design. The final gallery frame still needs to be designed in Figma.
- The booking section's left column in Figma (`81:20`) still carries template placeholder content ("The Shore Residence", oceanfront copy, features trio) — code keeps §6's pitch + contact fields + policy panel.

---

## 9. Exact-frame build — 2026-07-03 (user request)

The live site now mirrors desktop frame `18:2` **verbatim**, overriding §3's idealized section list. Page composition ([app/page.tsx](app/page.tsx)): Hero → Experience → `GalleryNoir` ("Relax and rewind", from `90:7`) → Amenities → `PropertyStrip` ("The Property", from `90:32`) → `BookSection` (Shore image + "The Shore Residence" summary + live booking card, from `81:4`) → Footer. The frame's imagery was exported from Figma into `public/figma/` (hero, 3 noir tiles, 5 property tiles, shore).

Consequences to be aware of:

- The two gallery sections are the **archived concepts** §1 declared out of scope — they are in the build now because they are what the frame shows.
- **Placeholder content is reproduced as-is**: "The Shore Residence" oceanfront copy, "10 guests" in the hero subcopy (stats/booking still say 8), and the property-strip caption "Every room, a reason to stay." in `#2a2a2a` — near-invisible on the navy canvas, exactly as in the frame. Fix these in Figma, then re-sync.
- The doc-based sections built earlier (`Gallery.tsx` bezel grid, `Bedrooms.tsx`, `Booking.tsx` contact form) remain in `components/`, currently unused — swap them back into `page.tsx` if the direction reverts.
- Booking card stays live (chips open the fold-out calendar, fee math runs); guests default to 4 per the frame.

---

## 10. Arc redesign — 2026-07-04 (user request)

Full visual redesign modeled on **arcprojects.build** ("copy the style and design"), replacing the §9 Figma-exact navy look. Analyzed live via Playwright; design system extracted and reproduced:

- **Canvas**: white; **ink** `#171717`; **muted** ink @45%; single **accent** deep lilac `#7d4a7d` (stands in for Arc's burnt orange `#a63a00`). Tokens in `globals.css` under "Arc-style editorial layer" (`paper/ink/muted/accent`).
- **Type**: Neue Haas Grotesk Display → Helvetica Neue/Arial stack, weight 500 everywhere, -0.01em tracking. Statements ~2.1rem, body 15px, captions 13px. Playfair no longer used on the page.
- **Language**: square corners, no shadows, 16px edge padding, huge white gaps (`pb-40/60`), full-viewport photos alternating with two-tone statements (accent line + ink continuation + small link), editorial captions (bold name + gray note).
- **Composition** ([app/page.tsx](app/page.tsx)): Hero (sunset dock, parallax, Nav overlay: stacked links top-left + giant `Lilac.` wordmark top-right) → Statement → 3-up strip (`GalleryNoir`, #gallery) → FullBleed → Statement → asymmetric pair (`PropertyStrip`, #property) → Amenities (flat ruled stats) → FullBleed → BookSection (#booking, statement + flat booking card; calendar/fee logic intact, verified) → dark `#171717` Footer (mailing list, giant wordmark, accent back-to-top tile).
- New: `Statement.tsx`, `FullBleed.tsx`. Loader now white/ink wordmark. Nav is absolute (scrolls away, like Arc) — no fixed bar, no hamburger.
- **Unused leftovers** kept in components/: `Experience.tsx`, `ImagesSlider.tsx`, `ProgressSlider.tsx`, `Gallery.tsx`, `Bedrooms.tsx`, `Booking.tsx`, `ui/Eyebrow` (navy-era). Photos: client images in `public/figma/IMG_*.jpeg` (1200px, sips-optimized); navy-era PNGs still present.

---

## 11. Merged direction — 2026-07-04 (user-decided via Q&A)

§10's pure-Arc look is superseded by a **merge of Arc structure and the previous site's character**. The user picked, axis by axis:

- **Color: navy canvas, Arc structure.** Lake navy everywhere; Arc's statements/captions/white-space rhythm intact. Done by re-pointing the §10 semantic tokens in `globals.css` — `--swatch--paper → dark`, `--swatch--ink → light`, `--swatch--ink-muted → cream @45%`, `--swatch--accent → brand lilac`. Components written against paper/ink/muted/accent re-skinned without edits.
- **Type: serif only for the wordmark.** Playfair italic lives exclusively in "Lilac." (nav bar, loader, footer). All content stays grotesk weight 500.
- **Shape: soft middle ground.** 16px radius on photo tiles/cards, 12px on chips/calendar, hairlines, no heavy shadows. Reserve + Book Direct are pills.
- **Nav & motion: previous behavior.** Fixed glass bar (Book Direct pill, hamburger overlay) is back; whileInView fade-ups on statements/figures/booking; navy curtain loader; hero parallax.

Booking card is blue-deep with cream chips + lilac Reserve again (§9-era character on the Arc layout). Footer is Arc's composition on `blue-deep` with the Playfair wordmark and a lilac back-to-top tile.

**Turbopack gotcha (recurred here):** after a mid-edit JSX syntax error, the dev server kept serving stale compiled `globals.css`; `touch` did NOT trigger a rebuild — only a real content change to the file did. If token edits don't show up, make a trivial CSS content change (e.g. tweak a comment) rather than restarting.

**§11 addendum (same day):** hero reverted to the previous overlay layout — eyebrow / "Life on the Lake" / subcopy bottom-left, Check Availability + Explore the House pills bottom-right, gradient scrim — on the parallax sunset photo. Headline is grotesk per the type rule (Playfair stays wordmark-only). Statement 1 rewritten ("Built for the water.") so it doesn't repeat the hero copy.

---

## 12. Revert to pre-Arc version — 2026-07-04 (user request)

The Arc experiment (§10) and the merge (§11) are **rolled back**. Live site = the §9-era navy design with the client's real photos, scroll effects kept: Playfair italic display type + DM Sans body, glass nav bar, curtain loader ("Lilac Landing"), parallax hero (IMG_0703 sunset dock, "Life on the Lake" overlay + CTA pills), Experience pull-quote, "Relax and rewind" ProgressSlider carousel (5 client photos, description-card buttons), Figma Amenities (icons + count-up stats card), "The Property" 5-tile strip (still prop-*.png placeholders), Shore booking section (blue-deep card, cream chips, uppercase RESERVE — flow re-verified: $1,850 total for 3 nights), original footer.

Deltas vs. the literal §9 state: PropertyStrip caption is now visible cream/60 (was the near-invisible #2a2a2a from Figma) and hero keeps the real sunset photo rather than the Figma placeholder. The §10/§11 components (`Statement.tsx`, `FullBleed.tsx`) and the Arc token layer in globals.css remain in the repo, unused. globals.css body + `--font-sans` restored to the Figma theme vars.

---

## 13. Client brand brief applied — 2026-07-04 (source of truth for visuals)

Elle Chan's written brand brief supersedes all prior directions (§§9-12 kept as history). Design read: luxury vacation-rental landing, warm editorial/resort, photography-first. Dials: VARIANCE 7 / MOTION 6 / DENSITY 3.

**Palette (globals.css swatches, brief-named):** canvas cream `#F5EFE4` (`--swatch--cream`, now the theme background), elevated linen `#FBF8F1`, ink charcoal `#2C2825` (now `--swatch--dark` — all `text-dark`/`bg-dark` usages became warm charcoal, including photo overlays and the loader), dusty lilac `#C4A9C2` (`brand`, CTA fills) with text-safe deep lilac `#7A5A78` (`brand-deep`, eyebrows/accent text on cream, WCAG AA), sage `#8FA68A` (icon glyphs only), terracotta `#C4846A` (reserved, unused so far), slate blue `#7B9BAE` (`blue`, only the calendar "Clear" link). Semantic `paper/ink/muted/accent` repointed accordingly.

**Type:** Playfair Display italic display + DM Sans body (both brief-named; already loaded). Glass nav wordmark now Playfair italic charcoal on warm-white glass.

**Texture:** `.grain-overlay` (fixed, pointer-events-none, feTurbulence data-URI at 4.5% multiply) rendered from page.tsx — the brief's soft grain.

**Section notes:** hero scrim + gallery panels are warm charcoal (no cold navy); shore image now melts into cream via a cream-rise gradient; stats card + booking card are linen with warm tinted shadows; footer is the charcoal close. BookSection's duplicate "The Experience" eyebrow removed (page eyebrow count now 2: hero + Experience pull-quote, at the taste-skill cap). Em-dash audit clean in visible strings.

**Known copy issues (client to resolve):** hero says "10 guests" vs 8 elsewhere; "The Shore Residence" oceanfront copy is still template placeholder; PropertyStrip still uses prop-*.png placeholder photos.

**§13 addendum — hero video loop (2026-07-04):** the sunset dock photo is now an ambient 10s video loop (Higgsfield kling3_0_turbo from IMG_0703: slow water ripples, drifting clouds, swaying leaves, a bird crossing the lake mid-loop; upscaled via ByteDance 2K/aigc/30fps). Served as [public/figma/hero-loop.mp4](public/figma/hero-loop.mp4) (6.2MB, 1660px H.264 CRF26 faststart, re-encoded FROM the 2K master with ffmpeg-static); the 26MB 2K master is kept at `assets/hero-loop-master-2k.mp4` (outside public/, not deployed). Hero renders `<video autoplay muted loop playsinline poster=IMG_0703>` with the still photo for reduced-motion users; parallax unchanged. Higgsfield job ids: generate 23f59af1, upscale a32e389c.

**§13 addendum 2 — seamless reframed hero loop (2026-07-04):** hero video v2. The photo was outpainted to 1:1 (Higgsfield outpaint job 4a76de70, water extended below the dock) so the dock sits ~62% down instead of at the bottom edge; regenerated with kling3_0 pro using the SAME image as start_image AND end_image (job add7a417: drifting clouds, multiple birds crossing the sky, subtle water/leaves), upscaled to 1440 sq 2K/30fps (job 9b80ff01). Seamlessness is guaranteed in the encode: ffmpeg xfade blends the last 1s over the first 1s (tail into head, offset 0) producing a 9.00s loop whose end and start are adjacent source frames, zero jump. Files: web [public/figma/hero-loop.mp4](public/figma/hero-loop.mp4) (4.9MB, CRF26 faststart) + matching first-frame poster `hero-poster.jpg` (also the reduced-motion still); masters in `assets/` (`hero-loop-v2-master-2k.mp4`, `hero-reframed-master.png`). Hero eyebrow switched to cream (light lilac vanished over the brighter reframed water).

**§13 addendum 3 — hero loop v3, rustle + verified seam (2026-07-04):** regenerated (kling3_0 pro, job 5507d0df, upscale 79778748) with visible foliage rustle added to the clouds/birds/water motion; same seamless recipe (start=end frame anchor + ffmpeg xfade tail-into-head). Seam verified numerically: PSNR between the loop's last and first frame = 32.3dB vs 31.8dB for an ordinary adjacent-frame pair mid-video, i.e. the loop point moves exactly like normal motion. Web file 4.8MB / 9.00s + regenerated matching `hero-poster.jpg`; master `assets/hero-loop-v3-master-2k.mp4`.

**§13 addendum 4 (2026-07-04):** guest count settled at **10** everywhere (booking card select 1-10 + "Maximum 10 guests", stats card "Guests Max 10" — matches the hero copy; the 8-vs-10 discrepancy from §8/§13 is resolved). "The Property" strip now uses real client photos (IMG_4223 living/lake view, 4238 bedroom, 4244 bath vanity, 4256 living-dining, 4299 deck pergola lake view) — prop-*.png placeholders retired. Remaining copy issue: "The Shore Residence" template copy in the booking section.

**§13 addendum 5 (2026-07-04):** section order changed — the Experience block (guest-review pull quote + On the Lake / Sunset / Private Dock highlights) moved from right-after-hero to below The Property photos. New page order: Hero → GalleryNoir → Amenities → PropertyStrip → Experience → BookSection.

**§13 addendum 6 (2026-07-04):** "What's Included" (Amenities.tsx) rebuilt from the client's `services-section.html` extract — a sticky split + "stomp" scroll pattern. Left column pins (md:sticky h-100dvh, space-between): pill eyebrow + Playfair-italic heading "Everything you'll reach for" + neighborhood note up top, count-up stats (3/4/2.5/10) anchored at the bottom. Right column: the 12 amenities grouped into 4 numbered themed lines (On the Water / Kitchen & Grill / Rest & Recharge / Play & Arrival), each a DM Sans 600 giant line that rises out of an overflow-hidden row on scroll, with real amenities as hover-lit tag pills and a lilac hover arrow. Adapted to brand palette (cream/charcoal, lilac accents, no mono/Montserrat). The extract's `addEventListener('scroll')` stomp driver was reimplemented with Motion `useScroll`+`useTransform` per one StompLine component (scroll-listener ban); count-up + blur-drift reveal honor reduced motion. Collapses to single column below md.

**§13 addendum 7 (2026-07-04):** §13-addendum-6 stomp/split reverted per user. "What's Included" back to the old two-column layout (heading "What's Included" + sage-icon amenity checklist + neighborhood note) — but the stats moved to the LEFT and restyled in the services-extract aesthetic: a "The House" eyebrow pill + a 2x2 grid of bordered rounded stat tiles (count-up 3/4/2.5/10) with lilac hover borders, replacing the old solid linen card. Grid is now md:[403px_560px] with stats as the first/left child, content right.

**§13 addendum 8 (2026-07-04):** "What's Included" final form — old two-column layout restored (heading "What's Included" + sage-icon amenity checklist + neighborhood note on the LEFT; linen stats card on the RIGHT). The stats card keeps its container, but each numeral now uses the services-extract "stomp" scroll effect (StompLine: Motion useScroll, numeral rises out of an overflow-hidden row) layered with the existing count-up. No sticky pin, no themed-group stomp lines (that was addendum 6, discarded).

**§13 addendum 9 (2026-07-04):** right side of "What's Included" changed from the linen stats card to the services-extract "stacked column" style — bare border-separated column (no card chrome): each stat = tiny tracked number prefix (01-04) + giant Playfair numeral (stomp-in via StompLine + count-up) + uppercase label, hairline dividers between. Left column (heading + checklist + note) unchanged.

**§13 addendum 10 (2026-07-04):** "What's Included" now uses the full services-extract split scroll effect. LEFT column (heading + checklist + note) is md:sticky top-0 h-100dvh justify-between (py-15vh) — it PINS full-viewport; note anchored bottom. RIGHT stacked stats column given 16vh gaps + py-15vh so the section (~1492px) is tall enough to pin against; each numeral still stomps + counts up. Verified: leftTop stays 0 while rightTop scrolls 40→-660, releasing near section end. Collapses to normal single column below md.

**§13 addendum 11 (2026-07-04):** all the services-extract experiments (addenda 6-10: stomp, stacked column, sticky pin) reverted. "What's Included" is back to the original brand-brief form — static two-column: heading + sage-icon checklist + neighborhood note LEFT, solid linen stats card (rounded-3xl, count-up 3/4/2.5/10, hairline rows) RIGHT. No StompLine/useScroll, no sticky.

**§13 addendum 12 (2026-07-04):** "Relax and rewind" (GalleryNoir.tsx) rebuilt from the user's CardsParallax sticky-stack component. Replaced the ProgressSlider carousel with 6 full-viewport sticky cards that pin in turn while the next scrolls over (scroll-driven). Client-picked whole-house-tour order + single kitchen shot: Great Room (IMG_4248) → Kitchen & Dining (IMG_4304) → TV Lounge (IMG_4224) → Primary Bedroom (IMG_4259) → Queen Room (IMG_4238) → Bunk Room (IMG_4228), each with a Playfair-italic room title + DM Sans description of what you're seeing, over a warm bottom scrim. Adapted from the source: brand fonts/colors (not Tiempos/Manrope/lowercase), rounded-3xl cards on cream, modern next/image fill, and a Motion useScroll scale+dim recede per card (StackCard) replacing the plain CSS — reduced-motion + last-card skip the transform. ProgressSlider.tsx now unused.

**§13 addendum 13 (2026-07-04):** "Relax and rewind" rebuilt again as a DARK horizontal scroll-hijack from the user's style reference (Helvetica stack via new `--font-helvetica` token, tracking -0.015em, charcoal #2C2825 bg, white text). Section pins (Motion sticky + useScroll → x, no scroll listener; section height = calc(100svh + panDistance)); vertical scroll drives a horizontal pan through an intro text panel + the 6 room photos (whole-house order, captions with 01/06 label + masked-line reveal), then releases to normal vertical scroll into the cream "What's Included". Reduced-motion → NativeScroll (native snap-x overflow-x-auto, no pin). Nav restyled to the reference: charcoal glass bar (bg-dark/70) with white Helvetica links (tight tracking); wordmark kept Playfair for brand identity; mobile overlay now dark. Only the relax-and-rewind section + nav use the reference style; rest of site stays cream/Playfair. Preview note: Motion pan + reveals freeze in the backgrounded preview tab (verified by forcing end-states); they run in a real browser.

**§13 addendum 14 (2026-07-04):** side-scroll gallery refined + nav. Photos are now FULL-SCREEN panels (w-screen h-[100svh], no rounded/gaps) that pan horizontally; the intro text panel was removed and "Relax and rewind" is a persistent sticky top-left overlay inside the pinned container (stays put while photos pan; pushed to pt-24 to clear the nav). Captions bottom-left per room. Nav: rounded-full pill (matches CTA pills), bg-dark/30 + backdrop-blur-lg (transparent-with-blur), border-white/15, h-12 — verified readable over both the dark gallery and cream sections. distance = (6 photos)*100vw - 100vw.

**§13 addendum 15 (2026-07-04):** added a "gather then spread" reveal to the side-scroll gallery. Scroll-scrubbed (not useInView — that left panels at identity): scrollYProgress [0,0.16]→spread, [0.16,1]→pan. Each PanelMotion derives x/scale/rotate/opacity from the shared `spread` MotionValue — hidden(0): x=-i*100% (own-width %, lands every panel on slot 0 = viewport center), scale 0.66, rotate (i-2.5)*3.5deg fan, back cards opacity 0.4; spread(1): identity. So at progress 0 the 6 photos are a fanned stack gathered center; scrolling spreads them into the full-screen row, then the pan runs. Verified: converged transforms correct at progress 0 (screenshot shows the fanned deck); scrub + pan freeze in the backgrounded preview tab but run in a real browser.

**§13 addendum 16 (2026-07-04):** gather reworked to the oliverbernotat/minimal.gallery storyboard the user sent — replaced the horizontal fan + pan with a VERTICAL center-stack cascade on near-black (#0c0a09). Section h-260svh pinned; 6 cinematic 16:9 frames (grid-area 1/1 = all centered), each rises from y:82vh and settles into a shallow vertical cascade (restY = (i-2.5)*7vh) with stagger (start=(i/6)*0.82), scrubbed by scrollYProgress. Reduced-motion → static centered column. **The spread is NOT built yet** — user said they'll define it next; the gather currently ends in the settled stack. Nav/title unchanged. (Horizontal-pan code from addenda 13-15 removed.)

**§13 addendum 17 (2026-07-04):** studied oliverbernotat.de (minimal.gallery ref) via Playwright — gather = cinematic 16:9 frames stack vertically centered on black; spread = frames disperse into an asymmetric editorial grid on black (alt large 8-col / small 4-col, flipping sides, titles under). Site uses a bespoke virtual-scroll that ignores synthetic wheel, so the live transition couldn't be stepped through — end-states + storyboard were enough. Rebuilt GalleryNoir to the user's pick ("fly into grid, scroll it"): one h-360svh pinned section, near-black #060505, scrollYProgress phases — [0,0.16] gather (each GridFrame rises from belowY into a scaled centered stack, staggered), [0.16,0.34] spread (flies to its real grid slot: x/y→0, scale→1), [0.34,1] the whole grid translates up (gridY, scrolls through all 6 rooms) then releases to cream. Each frame measures its grid-slot center (offsetLeft/Top) to compute the gather offset to viewport center. Verified: gather start (frames belowY, scale .58, opacity 0) + grid layout render correct; scrub freezes in preview, runs in real browser. Reduced-motion → static grid.
