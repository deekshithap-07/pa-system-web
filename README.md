# PA Impact Intelligence

Frontend-only data intelligence platform for Possibilities Africa. Runs on **Live Server** or any static host — no backend, no build step.

## Quick start

1. Open this folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Or: `npx serve .` / `python -m http.server 8080`

> Must be served over HTTP (not `file://`) so JSON files load correctly.

## Experience flow

```
Landing Hero → Scroll → GSAP map zoom → Interactive countries
  → Click country → Cinematic transition → Country Dashboard
    → Click catchment → Catchment Dashboard
      → Click community → Community Dashboard
```

## Structure

```
index.html          SPA shell
data/               Static mock JSON (swap for API later)
  countries.json
  catchments.json
  communities.json
  stories.json
  reports.json
  charts.json
  map-paths.json
styles/             CSS (PA branding)
js/
  app.js            Entry point
  router.js         Hash routing + GSAP transitions
  map/scroll-zoom.js  World Bank–style scroll map
  views/              Landing, dashboards, static pages
  components/         Charts, dashboard layout
  utils/              Data loader, formatters, animations
assets/             Images (placeholders)
```

## Tech

- **GSAP + ScrollTrigger** — scroll zoom map, page transitions, KPI counters
- **Chart.js** — line, bar, pie, area, radar charts
- **Vanilla JS** — ES modules, hash router
- **Mock JSON** — no API, database, or auth

## Navigation

| Route | Page |
|-------|------|
| `#/` | Landing + scroll map |
| `#/country/kenya` | Country dashboard |
| `#/catchment/kenya/kwale-south` | Catchment dashboard |
| `#/community/kenya/kwale-south/kanana` | Community dashboard |
| `#/insights` | Insights |
| `#/stories` | Stories |
| `#/reports` | Reports |
| `#/about` | About platform |

## Backend integration (future)

Replace `fetch()` calls in `js/utils/data.js` with API endpoints. Dashboard keys in `data/charts.json` map to `country:ken`, `catchment:kwale_south`, `community:kanana`.
