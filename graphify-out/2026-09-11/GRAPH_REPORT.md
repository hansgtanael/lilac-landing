# Graph Report - lilac-landing-v2  (2026-08-07)

## Corpus Check
- 57 files · ~1,066,986 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 285 nodes · 465 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f916b47`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Lilac Landing — Version 2 Design Direction|Lilac Landing — Version 2 Design Direction]]
- [[_COMMUNITY_RangeCalendar.tsx|RangeCalendar.tsx]]
- [[_COMMUNITY_Booking.tsx|Booking.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_SpacingTuner.tsx|SpacingTuner.tsx]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_GalleryNoir.tsx|GalleryNoir.tsx]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_Elle's requests — master list|Elle's requests — master list]]
- [[_COMMUNITY_content.ts|content.ts]]
- [[_COMMUNITY_site-content.ts|site-content.ts]]
- [[_COMMUNITY_migrate-site.mjs|migrate-site.mjs]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 32 edges
2. `useSiteContent()` - 28 edges
3. `compilerOptions` - 16 edges
4. `Lilac Landing — Version 2 Design Direction` - 14 edges
5. `EASE` - 11 edges
6. `Lilac Landing — project handoff` - 11 edges
7. `validateRange()` - 8 edges
8. `Elle's requests — master list` - 8 edges
9. `POST()` - 7 edges
10. `validateGuests()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `getSiteContent()`  [EXTRACTED]
  app/page.tsx → lib/site-content.ts
- `StudioPage()` --calls--> `isSanityConfigured()`  [EXTRACTED]
  app/studio/[[...tool]]/page.tsx → lib/sanity.ts
- `ParallaxPhoto()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutEditorial.tsx → lib/useReducedMotion.ts
- `Drift()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutScroll.tsx → lib/useReducedMotion.ts
- `OutdoorsCarousel()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/AboutScroll.tsx → lib/useReducedMotion.ts

## Import Cycles
- 1-file cycle: `sanity/structure.ts -> sanity/structure.ts`

## Communities (20 total, 3 thin omitted)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+10 more)

### Community 3 - "page.tsx"
Cohesion: 0.08
Nodes (35): AboutEditorial(), ParallaxPhoto(), AboutScroll(), Drift(), OUTDOORS, OutdoorsCarousel(), Amenities(), CountUp() (+27 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.16
Nodes (12): BookingCard(), fmt(), MONTHS, nightsBetween(), Props, Quote, fromISO(), MONTHS (+4 more)

### Community 6 - "Booking.tsx"
Cohesion: 0.17
Nodes (11): Content system (everything is CMS-driven), Elle's requests — see `ELLE-TASKS.md` (the working checklist), Figma (official MCP, authed as Hans), Gotchas, Lilac Landing — project handoff, /lux route (motion concept, kept), Open threads (priority order), Other sections (+3 more)

### Community 7 - "layout.tsx"
Cohesion: 0.25
Nodes (5): dmSans, fraunces, lora, metadata, nunito

### Community 8 - "SpacingTuner.tsx"
Cohesion: 0.14
Nodes (14): dependencies, gsap, @gsap/react, lenis, motion, next, next-sanity, @phosphor-icons/react (+6 more)

### Community 9 - "next.config.ts"
Cohesion: 0.40
Nodes (4): COMMON_HEADERS, CSP, nextConfig, STUDIO_CSP

### Community 14 - "GalleryNoir.tsx"
Cohesion: 0.21
Nodes (8): StudioPage(), isSanityConfigured(), sanity, schema, schemaTypes, siteContent, titleSubFields, structure()

### Community 16 - "Elle's requests — master list"
Cohesion: 0.22
Nodes (8): 1. Revisions/Comments for Lilac Landing (Jul 9), 2. QR Code please (Jul 10 + Jul 13 follow-up), 3. A sunny pic of the street entrance (Jul 12), 4. Long description (Jul 13), 5. pics from contractor! (Jul 14 - unread until today), 6. Gallery caption plan (from Jul 9, applied Jul 14), Elle's requests — master list, Full long description (for placement decision)

### Community 18 - "content.ts"
Cohesion: 0.15
Nodes (21): GET(), iso(), guardBodySize(), requireSameOrigin(), POST(), GET(), BookSection(), isValidEmail() (+13 more)

### Community 19 - "site-content.ts"
Cohesion: 0.09
Nodes (27): Home(), Footer(), SiteContentProvider(), useDrift(), useSectionProgress(), WaveHills(), WaveLip(), NavLink (+19 more)

### Community 20 - "migrate-site.mjs"
Cohesion: 0.25
Nodes (10): assetCache, build(), client, content, imageRef(), isVideo(), key(), publicDir (+2 more)

## Knowledge Gaps
- **130 isolated node(s):** `lora`, `fraunces`, `dmSans`, `nunito`, `metadata` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `SpacingTuner.tsx` to `dependencies`, `GalleryNoir.tsx`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `sanity` connect `GalleryNoir.tsx` to `SpacingTuner.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `useReducedMotion()` connect `page.tsx` to `content.ts`, `site-content.ts`, `RangeCalendar.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `lora`, `fraunces`, `dmSans` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08240794856808883 - nodes in this community are weakly interconnected._