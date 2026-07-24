# Graph Report - lilac-landing-v2  (2026-07-05)

## Corpus Check
- 26 files · ~1,128,599 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 148 nodes · 191 edges · 14 communities (12 shown, 2 thin omitted)
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

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 20 edges
2. `compilerOptions` - 16 edges
3. `Lilac Landing — Version 2 Design Direction` - 14 edges
4. `EASE` - 9 edges
5. `Lilac Landing — project handoff` - 7 edges
6. `scripts` - 6 edges
7. `BookingCard()` - 5 edges
8. `Current design direction (source of truth = client brand brief, DIRECTION.md §13)` - 5 edges
9. `2. Design tokens (mirror of the Figma variable collections)` - 4 edges
10. `GalleryNoir()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `AMENITIES` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Amenities.tsx → lib/useReducedMotion.ts
- `CountUp()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Amenities.tsx → lib/useReducedMotion.ts
- `BookSection()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/BookSection.tsx → lib/useReducedMotion.ts
- `BookingCard()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/BookingCard.tsx → lib/useReducedMotion.ts
- `Experience()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Experience.tsx → lib/useReducedMotion.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+9 more)

### Community 3 - "page.tsx"
Cohesion: 0.14
Nodes (17): AMENITIES, CountUp(), STATS, BookSection(), FEATURES, Experience(), HIGHLIGHTS, Footer() (+9 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.28
Nodes (6): fromISO(), MONTHS, Props, RangeCalendar(), startOfDay(), WEEKDAYS

### Community 6 - "Booking.tsx"
Cohesion: 0.17
Nodes (11): Assets, Component roles (`components/`), Current design direction (source of truth = client brand brief, DIRECTION.md §13), Design tokens, History, Known gotchas, Lilac Landing — project handoff, Open items (+3 more)

### Community 7 - "layout.tsx"
Cohesion: 0.29
Nodes (4): dmSans, fraunces, metadata, playfair

### Community 8 - "BookingCard.tsx"
Cohesion: 0.43
Nodes (6): BookingCard(), fmt(), fmtDate(), MONTHS, nightsBetween(), Props

### Community 12 - "devDependencies"
Cohesion: 0.25
Nodes (8): dependencies, gsap, @gsap/react, motion, next, @phosphor-icons/react, react, react-dom

### Community 14 - "GalleryNoir.tsx"
Cohesion: 0.28
Nodes (3): GalleryNoir(), ROOMS, useMediaQuery()

## Knowledge Gaps
- **80 isolated node(s):** `playfair`, `fraunces`, `dmSans`, `metadata`, `STATS` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `page.tsx` to `BookingCard.tsx`, `GalleryNoir.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `dependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `playfair`, `fraunces`, `dmSans` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13911290322580644 - nodes in this community are weakly interconnected._
- **Should `Lilac Landing — Version 2 Design Direction` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._