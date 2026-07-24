# Graph Report - lilac-landing-v2  (2026-07-03)

## Corpus Check
- 25 files · ~558,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 130 nodes · 197 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_useReducedMotion|useReducedMotion]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Lilac Landing — Version 2 Design Direction|Lilac Landing — Version 2 Design Direction]]
- [[_COMMUNITY_RangeCalendar.tsx|RangeCalendar.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_BookingCard.tsx|BookingCard.tsx]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 24 edges
2. `compilerOptions` - 16 edges
3. `EASE` - 13 edges
4. `Lilac Landing — Version 2 Design Direction` - 9 edges
5. `Eyebrow()` - 6 edges
6. `BookingCard()` - 5 edges
7. `scripts` - 5 edges
8. `Bezel()` - 4 edges
9. `2. Design tokens (mirror of the Figma variable collections)` - 4 edges
10. `RangeCalendar()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Bedrooms()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Bedrooms.tsx → lib/useReducedMotion.ts
- `Booking()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Booking.tsx → lib/useReducedMotion.ts
- `AMENITIES` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Amenities.tsx → lib/useReducedMotion.ts
- `CountUp()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Amenities.tsx → lib/useReducedMotion.ts
- `BookSection()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/BookSection.tsx → lib/useReducedMotion.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "useReducedMotion"
Cohesion: 0.14
Nodes (17): AMENITIES, CountUp(), STATS, BookSection(), FEATURES, Experience(), HIGHLIGHTS, Footer() (+9 more)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+8 more)

### Community 3 - "page.tsx"
Cohesion: 0.21
Nodes (9): Bedrooms(), ROOMS, Booking(), EMPTY, FormState, Slot, SLOTS, Bezel() (+1 more)

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.15
Nodes (12): 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components, 5. Motion language, 6. Build notes, 7. Open questions, 8. Reconciliation notes — Figma pull, 2026-07-03 (+4 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.28
Nodes (6): fromISO(), MONTHS, Props, RangeCalendar(), startOfDay(), WEEKDAYS

### Community 6 - "devDependencies"
Cohesion: 0.25
Nodes (8): dependencies, gsap, @gsap/react, motion, next, @phosphor-icons/react, react, react-dom

### Community 7 - "layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, playfair

### Community 8 - "BookingCard.tsx"
Cohesion: 0.43
Nodes (6): BookingCard(), fmt(), fmtDate(), MONTHS, nightsBetween(), Props

## Knowledge Gaps
- **68 isolated node(s):** `playfair`, `dmSans`, `metadata`, `STATS`, `ROOMS` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `useReducedMotion` to `BookingCard.tsx`, `page.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `EASE` connect `useReducedMotion` to `BookingCard.tsx`, `page.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `playfair`, `dmSans`, `metadata` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useReducedMotion` be split into smaller, more focused modules?**
  _Cohesion score 0.1431451612903226 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._