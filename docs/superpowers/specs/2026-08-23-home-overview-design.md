# Home page overview bands — design

**Date:** 2026-08-23  
**Status:** Approved in conversation (hybrid C + simple English)  
**Goal:** Home plays an overview role so a first-time visitor understands ~60–70% of the site before opening other pages — without repeating About, What we do, or Results deep content.

## References

- [World Bank home](https://www.worldbank.org/ext/en/home) — clear section rhythm: purpose → priorities → light proof → explore  
- [Deloitte Global](https://www.deloitte.com/global/en.html) — connecting narrative, short blocks, plain CTAs  

## Copy principles

- Short sentences. Everyday words. No academic or ministry jargon unless explained in the same line.  
- Avoid prompt-style titles (“What the organisation is about”, “Why”, “How”, “Impact”).  
- Prefer headlines like: “Why we walk with pastors”, “How the work unfolds”, “What families notice”.  
- One job per section; one short lead; one optional CTA.

## What stays (do not redesign)

1. Hero (WB-style spotlight)  
2. Progress snapshot (`impactOverview` pillars)  
3. Africa map  
4. Newsletter  

## New page order

1. Hero  
2. **NEW — Purpose** (`overviewPurpose`)  
3. **NEW — How the work unfolds** (`overviewPath`)  
4. **NEW — What families notice** (`overviewChange`)  
5. Progress snapshot  
6. Africa map  
7. Newsletter  

## Section specs

### 1. Purpose (who + why)

- **Layout:** Two-column on desktop (lead + short list or supporting paragraph); stack on mobile. Soft background (not a card grid).  
- **Content:** Who Possibilities Africa is; why rural churches matter; faith and daily life together.  
- **CTA:** `Who we are →` → `#/about`  
- **Not included:** History, leadership bios, partner lists (stay on About).

### 2. How the work unfolds (how)

- **Layout:** Three equal steps in a row (desktop); stack on mobile. Number or short label + title + one sentence. No five-level hierarchy.  
- **Steps (fixed meaning, simple labels):**  
  1. Pastors lead — trained and supported for about two years  
  2. Nearby places work together — small groups of communities share leaders  
  3. One community at a time — clear stages from first steps to helping neighbours  
- **CTA:** `See what we do →` → `#/work`  
- **Not included:** Full journey stages, Triple-A, PPP/CHIP detail (stay on What we do).

### 3. What families notice (light impact)

- **Layout:** Three theme rows or tiles — title + one plain sentence each. Optional soft visual accent (existing brand colour, not scorecard charts).  
- **Themes:**  
  1. Water and farming that help homes  
  2. Pastors and leaders growing in skill  
  3. Churches running their own local projects  
- **CTA:** `Read stories →` → `#/stories`  
- **Not included:** KPI charts, sector scores, country comparison tables (stay on Results / scorecard). Progress numbers remain only in the existing snapshot below.

## Non-goals / anti-duplication

- Do not re-add “How places are organised” five-step grid on home.  
- Do not embed scorecard panels or “What’s working” cards.  
- Do not copy About’s long mission/playbook blocks verbatim — purpose band is a short overview only.  
- Do not change header/nav or footer for this work.

## Implementation sketch

| Area | Change |
|------|--------|
| `data/home.json` | Add `overviewPurpose`, `overviewPath`, `overviewChange` with simple English copy |
| `js/components/home-sections.js` | Add `renderOverviewPurpose`, `renderOverviewPath`, `renderOverviewChange` |
| `js/views/home.js` | Insert the three renders between hero and `renderImpactOverview` |
| `styles/home.css` (or `home-portal.css` if that owns bands) | Styles for the three bands; match existing PA navy/blue; mobile-first |
| `js/components/home-animations.js` | Reuse existing `data-reveal` / scroll patterns if present |

## Success check

A visitor who only scrolls home can answer:

1. What is Possibilities Africa?  
2. Why does this work matter?  
3. How does the work happen on the ground (in three steps)?  
4. What kinds of change do people see?  
5. Where can they go next (countries, stories, about, what we do)?  

…without needing the Results or About pages for a basic understanding.
