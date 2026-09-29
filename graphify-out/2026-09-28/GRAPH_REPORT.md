# Graph Report - lilac-landing-v2  (2026-09-28)

## Corpus Check
- 72 files · ~1,084,527 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 387 nodes · 650 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca0ce052`
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
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_GalleryNoir.tsx|GalleryNoir.tsx]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_Elle's requests — master list|Elle's requests — master list]]
- [[_COMMUNITY_content.ts|content.ts]]
- [[_COMMUNITY_site-content.ts|site-content.ts]]
- [[_COMMUNITY_migrate-site.mjs|migrate-site.mjs]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_contact.ts|contact.ts]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 32 edges
2. `useSiteContent()` - 28 edges
3. `compilerOptions` - 16 edges
4. `Lilac Landing — Version 2 Design Direction` - 14 edges
5. `GET()` - 11 edges
6. `EASE` - 11 edges
7. `Lilac Landing — deployment & handoff` - 11 edges
8. `Lilac Landing — project handoff` - 11 edges
9. `BookSection()` - 9 edges
10. `site` - 9 edges

## Surprising Connections (you probably didn't know these)
- `buildBookingUrl()` --indirect_call--> `key()`  [INFERRED]
  lib/bookingWidget.ts → scripts/migrate-site.mjs
- `POST()` --calls--> `deliverInquiry()`  [EXTRACTED]
  app/api/inquiry/route.ts → lib/inquiry.ts
- `GET()` --calls--> `validateGuests()`  [EXTRACTED]
  app/api/quote/route.ts → lib/booking.ts
- `GET()` --calls--> `validateRange()`  [EXTRACTED]
  app/api/quote/route.ts → lib/booking.ts
- `StudioPage()` --calls--> `isSanityConfigured()`  [EXTRACTED]
  app/studio/[[...tool]]/page.tsx → lib/sanity.ts

## Import Cycles
- 1-file cycle: `sanity/structure.ts -> sanity/structure.ts`

## Communities (21 total, 3 thin omitted)

### Community 1 - "compilerOptions"
Cohesion: 0.06
Nodes (32): dependencies, gsap, @gsap/react, lenis, motion, next, next-sanity, @phosphor-icons/react (+24 more)

### Community 2 - "dependencies"
Cohesion: 0.08
Nodes (23): 1. Checkout widget, 1. What this is, 2. Live availability + pricing, 2. Requirements, 3. Email enquiries (the fallback path — still required), 3. Environment variables, 4. Local development, 4. Optional: iCal as a backup availability source (+15 more)

### Community 3 - "page.tsx"
Cohesion: 0.08
Nodes (39): AboutEditorial(), ParallaxPhoto(), AboutScroll(), Drift(), OUTDOORS, OutdoorsCarousel(), Amenities(), CountUp() (+31 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.16
Nodes (12): Home(), SiteContentProvider(), useDrift(), useSectionProgress(), WaveHills(), WaveLip(), buildBody(), deliverInquiry() (+4 more)

### Community 6 - "Booking.tsx"
Cohesion: 0.17
Nodes (11): Content system (everything is CMS-driven), Elle's requests — see `ELLE-TASKS.md` (the working checklist), Figma (official MCP, authed as Hans), Gotchas, Lilac Landing — project handoff, /lux route — REMOVED 2026-07-26, Open threads (priority order), Other sections (+3 more)

### Community 7 - "layout.tsx"
Cohesion: 0.10
Nodes (16): dmSans, fraunces, lora, metadata, nunito, Analytics(), analyticsId(), GA_CONNECT_HOSTS (+8 more)

### Community 8 - "SpacingTuner.tsx"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 14 - "GalleryNoir.tsx"
Cohesion: 0.21
Nodes (8): StudioPage(), isSanityConfigured(), schema, schemaTypes, siteContent, titleSubFields, structure(), sanity

### Community 15 - "README.md"
Cohesion: 0.12
Nodes (26): guardBodySize(), requireSameOrigin(), POST(), BookSection(), nightsFrom(), Props, Stage, fromISO() (+18 more)

### Community 16 - "Elle's requests — master list"
Cohesion: 0.22
Nodes (8): 1. Revisions/Comments for Lilac Landing (Jul 9), 2. QR Code please (Jul 10 + Jul 13 follow-up), 3. A sunny pic of the street entrance (Jul 12), 4. Long description (Jul 13), 5. pics from contractor! (Jul 14 - unread until today), 6. Gallery caption plan (from Jul 9, applied Jul 14), Elle's requests — master list, Full long description (for placement decision)

### Community 18 - "content.ts"
Cohesion: 0.09
Nodes (35): GET(), iso(), GET(), nightlyLooksSane(), parseISODate(), CalendarDay, CalendarResult, computeTaxCents() (+27 more)

### Community 19 - "site-content.ts"
Cohesion: 0.09
Nodes (26): metadata, metadata, metadata, Footer(), LEGAL_LINKS, LegalPage(), NavLink, PropertyPhoto (+18 more)

### Community 20 - "migrate-site.mjs"
Cohesion: 0.25
Nodes (10): assetCache, build(), client, content, imageRef(), isVideo(), key(), publicDir (+2 more)

### Community 22 - "contact.ts"
Cohesion: 0.32
Nodes (9): BookingWidget(), Props, BookingWidgetModal(), Props, bookingWidgetOrigin(), buildBookingUrl(), isBookingWidgetConfigured(), PASSTHROUGH (+1 more)

## Knowledge Gaps
- **172 isolated node(s):** `metadata`, `lora`, `fraunces`, `dmSans`, `nunito` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `compilerOptions` to `GalleryNoir.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `sanity` connect `GalleryNoir.tsx` to `compilerOptions`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `useReducedMotion()` connect `page.tsx` to `RangeCalendar.tsx`, `README.md`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `metadata`, `lora`, `fraunces` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07578084997439836 - nodes in this community are weakly interconnected._