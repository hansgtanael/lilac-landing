# Graph Report - lilac-landing-v2  (2026-07-24)

## Corpus Check
- 69 files · ~1,398,012 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 388 nodes · 668 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Lilac Landing — Version 2 Design Direction|Lilac Landing — Version 2 Design Direction]]
- [[_COMMUNITY_RangeCalendar.tsx|RangeCalendar.tsx]]
- [[_COMMUNITY_Booking.tsx|Booking.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_BookingCard.tsx|BookingCard.tsx]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_GalleryNoir.tsx|GalleryNoir.tsx]]
- [[_COMMUNITY_SpacingTuner.tsx|SpacingTuner.tsx]]
- [[_COMMUNITY_Elle's requests — master list|Elle's requests — master list]]
- [[_COMMUNITY_seed-lux.mjs|seed-lux.mjs]]
- [[_COMMUNITY_content.ts|content.ts]]
- [[_COMMUNITY_site-content.ts|site-content.ts]]
- [[_COMMUNITY_migrate-site.mjs|migrate-site.mjs]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 44 edges
2. `useSiteContent()` - 28 edges
3. `EASE` - 17 edges
4. `compilerOptions` - 16 edges
5. `Lilac Landing — Version 2 Design Direction` - 14 edges
6. `guardStudioRequest()` - 11 edges
7. `Lilac Landing — project handoff` - 11 edges
8. `guardBodySize()` - 10 edges
9. `validateRange()` - 8 edges
10. `scripts` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Arrival()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/lux/Arrival.tsx → lib/useReducedMotion.ts
- `LuxHero()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/lux/LuxHero.tsx → lib/useReducedMotion.ts
- `POST()` --calls--> `validateGuests()`  [EXTRACTED]
  app/api/inquiry/route.ts → lib/booking.ts
- `POST()` --calls--> `validateRange()`  [EXTRACTED]
  app/api/inquiry/route.ts → lib/booking.ts
- `StudioPage()` --calls--> `useReducedMotion()`  [EXTRACTED]
  app/cms/page.tsx → lib/useReducedMotion.ts

## Import Cycles
- 1-file cycle: `sanity/structure.ts -> sanity/structure.ts`

## Communities (21 total, 2 thin omitted)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, gsap, @gsap/react, lenis, motion, next, next-sanity, @phosphor-icons/react (+25 more)

### Community 3 - "page.tsx"
Cohesion: 0.09
Nodes (33): AboutEditorial(), ParallaxPhoto(), AboutScroll(), Drift(), OUTDOORS, OutdoorsCarousel(), Amenities(), CountUp() (+25 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.28
Nodes (6): fromISO(), MONTHS, Props, RangeCalendar(), startOfDay(), WEEKDAYS

### Community 6 - "Booking.tsx"
Cohesion: 0.17
Nodes (11): Content system (everything is CMS-driven), Elle's requests — see `ELLE-TASKS.md` (the working checklist), Figma (official MCP, authed as Hans), Gotchas, Lilac Landing — project handoff, /lux route (motion concept, kept), Open threads (priority order), Other sections (+3 more)

### Community 7 - "layout.tsx"
Cohesion: 0.14
Nodes (12): dmSans, fraunces, lora, metadata, nunito, EDITABLE_TAGS, editableFrom(), EditMode() (+4 more)

### Community 8 - "BookingCard.tsx"
Cohesion: 0.07
Nodes (22): ACRONYMS, Active, ArrayGroup(), ArrayItem(), dotCls, emptyLike(), fileName(), humanize() (+14 more)

### Community 9 - "next.config.ts"
Cohesion: 0.40
Nodes (4): COMMON_HEADERS, CSP, nextConfig, STUDIO_CSP

### Community 12 - "devDependencies"
Cohesion: 0.10
Nodes (32): cleanJson(), Content, FILE, GET(), isRecord(), isString(), JsonValue, parseContent() (+24 more)

### Community 14 - "GalleryNoir.tsx"
Cohesion: 0.07
Nodes (28): LuxHome(), StudioPage(), Arrival(), FALLBACK, ConciergeStay(), FALLBACK, FALLBACK, LuxHero() (+20 more)

### Community 15 - "SpacingTuner.tsx"
Cohesion: 0.14
Nodes (12): enterEase, GalleryNoir(), moveEase, NativeStrip(), Panel(), PinnedHorizontal(), stackScale, Title() (+4 more)

### Community 16 - "Elle's requests — master list"
Cohesion: 0.22
Nodes (8): 1. Revisions/Comments for Lilac Landing (Jul 9), 2. QR Code please (Jul 10 + Jul 13 follow-up), 3. A sunny pic of the street entrance (Jul 12), 4. Long description (Jul 13), 5. pics from contractor! (Jul 14 - unread until today), 6. Gallery caption plan (from Jul 9, applied Jul 14), Elle's requests — master list, Full long description (for placement decision)

### Community 17 - "seed-lux.mjs"
Cohesion: 0.50
Nodes (3): client, doc, root

### Community 18 - "content.ts"
Cohesion: 0.19
Nodes (16): GET(), iso(), GET(), BookSection(), Stage, parseISODate(), RangeCheck, validateGuests() (+8 more)

### Community 19 - "site-content.ts"
Cohesion: 0.11
Nodes (23): Home(), Footer(), NavLink, PropertyPhoto, RoomEntry, site, SiteContent, StatEntry (+15 more)

### Community 20 - "migrate-site.mjs"
Cohesion: 0.25
Nodes (10): assetCache, build(), client, content, imageRef(), isVideo(), key(), publicDir (+2 more)

## Knowledge Gaps
- **163 isolated node(s):** `FILE`, `Room`, `Photo`, `Content`, `JsonValue` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `page.tsx` to `layout.tsx`, `BookingCard.tsx`, `GalleryNoir.tsx`, `SpacingTuner.tsx`, `content.ts`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `sanity` connect `dependencies` to `GalleryNoir.tsx`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `FILE`, `Room`, `Photo` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09210526315789473 - nodes in this community are weakly interconnected._
- **Should `Lilac Landing — Version 2 Design Direction` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._