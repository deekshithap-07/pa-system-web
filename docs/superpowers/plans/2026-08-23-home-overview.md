# Home Overview Bands Implementation Plan

> **For agentic workers:** Implement task-by-task. Spec: `docs/superpowers/specs/2026-08-23-home-overview-design.md`

**Goal:** Insert three overview bands between hero and progress snapshot, in simple English.

**Files:**
- `data/home.json` — copy for the three sections
- `js/components/home-sections.js` — render helpers
- `js/views/home.js` — wire order
- `styles/home.css` — band styles

## Task 1: Data + render + wire + styles

Add `overviewPurpose`, `overviewPath`, `overviewChange` to JSON; render functions; insert in home view; CSS for desktop/mobile; `data-reveal` for existing animations.

**Test:** Hard refresh `#/` — scroll sees Purpose → Path → Change → Progress → Map → Newsletter.
