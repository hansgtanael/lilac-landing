# Graph Report - lilac-landing-v2  (2026-07-23)

## Corpus Check
- 50 files · ~1,386,687 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 289 nodes · 464 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
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
- [[_COMMUNITY_GalleryNoir.tsx|GalleryNoir.tsx]]
- [[_COMMUNITY_Elle's requests — master list|Elle's requests — master list]]
- [[_COMMUNITY_content.ts|content.ts]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 44 edges
2. `EASE` - 17 edges
3. `compilerOptions` - 16 edges
4. `site` - 14 edges
5. `Lilac Landing — Version 2 Design Direction` - 14 edges
6. `guardStudioRequest()` - 11 edges
7. `Lilac Landing — project handoff` - 11 edges
8. `guardBodySize()` - 8 edges
9. `Elle's requests — master list` - 8 edges
10. `useMediaQuery()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Drift()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutScroll.tsx → lib/useReducedMotion.ts
- `OutdoorsCarousel()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutScroll.tsx → lib/useReducedMotion.ts
- `StudioPage()` --calls--> `useReducedMotion()`  [EXTRACTED]
  app/cms/page.tsx → lib/useReducedMotion.ts
- `ParallaxPhoto()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutEditorial.tsx → lib/useReducedMotion.ts
- `AboutEditorial()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutEditorial.tsx → lib/useReducedMotion.ts

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.07
Nodes (26): dependencies, gsap, @gsap/react, lenis, motion, next, @phosphor-icons/react, react (+18 more)

### Community 3 - "page.tsx"
Cohesion: 0.09
Nodes (28): AboutEditorial(), ParallaxPhoto(), Amenities(), CountUp(), ICONS, BookSection(), Experience(), ICONS (+20 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.17
Nodes (12): BookingCard(), fmt(), fmtDate(), MONTHS, nightsBetween(), Props, fromISO(), MONTHS (+4 more)

### Community 6 - "Booking.tsx"
Cohesion: 0.17
Nodes (11): Content system (everything is CMS-driven), Elle's requests — see `ELLE-TASKS.md` (the working checklist), Figma (official MCP, authed as Hans), Gotchas, Lilac Landing — project handoff, /lux route (motion concept, kept), Open threads (priority order), Other sections (+3 more)

### Community 7 - "layout.tsx"
Cohesion: 0.14
Nodes (12): dmSans, fraunces, lora, metadata, nunito, EDITABLE_TAGS, editableFrom(), EditMode() (+4 more)

### Community 8 - "BookingCard.tsx"
Cohesion: 0.06
Nodes (29): ACRONYMS, Active, ArrayGroup(), ArrayItem(), dotCls, emptyLike(), fileName(), humanize() (+21 more)

### Community 9 - "next.config.ts"
Cohesion: 0.50
Nodes (3): CSP, nextConfig, SECURITY_HEADERS

### Community 12 - "devDependencies"
Cohesion: 0.12
Nodes (27): cleanJson(), Content, FILE, GET(), isRecord(), isString(), JsonValue, parseContent() (+19 more)

### Community 14 - "GalleryNoir.tsx"
Cohesion: 0.13
Nodes (8): enterEase, GalleryNoir(), moveEase, stackScale, ROOMS, RoomsFilm(), ScrollFilm(), useMediaQuery()

### Community 16 - "Elle's requests — master list"
Cohesion: 0.22
Nodes (8): 1. Revisions/Comments for Lilac Landing (Jul 9), 2. QR Code please (Jul 10 + Jul 13 follow-up), 3. A sunny pic of the street entrance (Jul 12), 4. Long description (Jul 13), 5. pics from contractor! (Jul 14 - unread until today), 6. Gallery caption plan (from Jul 9, applied Jul 14), Elle's requests — master list, Full long description (for placement decision)

### Community 18 - "content.ts"
Cohesion: 0.22
Nodes (4): closingLines, Drift(), OUTDOORS, OutdoorsCarousel()

## Knowledge Gaps
- **124 isolated node(s):** `FILE`, `Room`, `Photo`, `Content`, `JsonValue` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `page.tsx` to `RangeCalendar.tsx`, `layout.tsx`, `BookingCard.tsx`, `GalleryNoir.tsx`, `content.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `SmoothScroll()` connect `layout.tsx` to `page.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `EASE` connect `page.tsx` to `BookingCard.tsx`, `RangeCalendar.tsx`, `GalleryNoir.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `FILE`, `Room`, `Photo` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08896103896103896 - nodes in this community are weakly interconnected._