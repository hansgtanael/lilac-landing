# Graph Report - lilac-landing-v2  (2026-07-04)

## Corpus Check
- 30 files · ~1,128,124 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 164 nodes · 242 edges · 21 communities (14 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_useReducedMotion|useReducedMotion]]
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
- [[_COMMUNITY_ProgressSlider.tsx|ProgressSlider.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_useReducedMotion|useReducedMotion]]
- [[_COMMUNITY_FullBleed.tsx|FullBleed.tsx]]
- [[_COMMUNITY_Nav.tsx|Nav.tsx]]
- [[_COMMUNITY_Hero.tsx|Hero.tsx]]
- [[_COMMUNITY_useReducedMotion.ts|useReducedMotion.ts]]
- [[_COMMUNITY_PropertyStrip.tsx|PropertyStrip.tsx]]

## God Nodes (most connected - your core abstractions)
1. `useReducedMotion()` - 28 edges
2. `compilerOptions` - 16 edges
3. `EASE` - 14 edges
4. `Lilac Landing — Version 2 Design Direction` - 14 edges
5. `cn()` - 7 edges
6. `Eyebrow()` - 6 edges
7. `BookingCard()` - 5 edges
8. `scripts` - 5 edges
9. `Bezel()` - 4 edges
10. `2. Design tokens (mirror of the Figma variable collections)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `BookSection()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/BookSection.tsx → lib/useReducedMotion.ts
- `Experience()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/Experience.tsx → lib/useReducedMotion.ts
- `GatherFrame()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/GalleryNoir.tsx → lib/useReducedMotion.ts
- `StickyTitle()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/GalleryNoir.tsx → lib/useReducedMotion.ts
- `GalleryNoir()` --calls--> `useReducedMotion()`  [EXTRACTED]
  components/GalleryNoir.tsx → lib/useReducedMotion.ts

## Import Cycles
- None detected.

## Communities (21 total, 7 thin omitted)

### Community 0 - "useReducedMotion"
Cohesion: 0.26
Nodes (7): ROOMS, EMPTY, FormState, Slot, SLOTS, Bezel(), Eyebrow()

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+8 more)

### Community 3 - "page.tsx"
Cohesion: 0.32
Nodes (5): Experience(), HIGHLIGHTS, Props, Statement(), EASE

### Community 4 - "Lilac Landing — Version 2 Design Direction"
Cohesion: 0.11
Nodes (17): 10. Arc redesign — 2026-07-04 (user request), 11. Merged direction — 2026-07-04 (user-decided via Q&A), 12. Revert to pre-Arc version — 2026-07-04 (user request), 13. Client brand brief applied — 2026-07-04 (source of truth for visuals), 1. What v2 is, 2. Design tokens (mirror of the Figma variable collections), 3. Page architecture (from Figma desktop `18:2`), 4. Signature components (+9 more)

### Community 5 - "RangeCalendar.tsx"
Cohesion: 0.28
Nodes (6): fromISO(), MONTHS, Props, RangeCalendar(), startOfDay(), WEEKDAYS

### Community 6 - "Booking.tsx"
Cohesion: 0.29
Nodes (4): GalleryNoir(), GatherFrame(), ROOMS, StickyTitle()

### Community 7 - "layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, playfair

### Community 8 - "BookingCard.tsx"
Cohesion: 0.43
Nodes (6): BookingCard(), fmt(), fmtDate(), MONTHS, nightsBetween(), Props

### Community 11 - "ProgressSlider.tsx"
Cohesion: 0.19
Nodes (14): ProgressBarProps, ProgressSlider(), ProgressSliderContext, ProgressSliderContextType, ProgressSliderProps, SliderBtn(), SliderBtnGroup(), SliderBtnProps (+6 more)

### Community 13 - "devDependencies"
Cohesion: 0.25
Nodes (8): dependencies, gsap, @gsap/react, motion, next, @phosphor-icons/react, react, react-dom

### Community 14 - "page.tsx"
Cohesion: 0.33
Nodes (3): BookSection(), FEATURES, Footer()

### Community 15 - "useReducedMotion"
Cohesion: 0.38
Nodes (6): AMENITIES, CountUp(), STATS, Bedrooms(), Booking(), useReducedMotion()

## Knowledge Gaps
- **83 isolated node(s):** `playfair`, `dmSans`, `metadata`, `STATS`, `ROOMS` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useReducedMotion()` connect `useReducedMotion` to `useReducedMotion`, `page.tsx`, `Booking.tsx`, `BookingCard.tsx`, `page.tsx`, `Nav.tsx`, `Hero.tsx`, `useReducedMotion.ts`, `PropertyStrip.tsx`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `EASE` connect `page.tsx` to `useReducedMotion`, `Booking.tsx`, `BookingCard.tsx`, `page.tsx`, `useReducedMotion`, `Nav.tsx`, `Hero.tsx`, `useReducedMotion.ts`, `PropertyStrip.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `playfair`, `dmSans`, `metadata` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Lilac Landing — Version 2 Design Direction` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._