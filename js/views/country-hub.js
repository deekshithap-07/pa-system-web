import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { getDocCountryCharts, getDocCountryKpis } from "../utils/doc-hub-kpis.js";
import { buildCountryGeoMapModel } from "../map/utils/hub-geo-data.js";
import { renderCountryHero } from "../components/country-hub/CountryHero.js";
import { renderCountryStories } from "../components/country-hub/CountryStories.js";
import { renderCountryKPIGrid } from "../components/country-hub/CountryKPIGrid.js";
import { renderCountryMap, bindCountryMap } from "../components/country-hub/CountryMap.js";
import { renderCountryCharts } from "../components/country-hub/CountryCharts.js";
import { renderCountryReportsAndUpdates } from "../components/country-hub/CountryReportsAndUpdates.js";
import {
  renderCountrySidebar,
  bindCountrySidebar,
  destroyCountrySidebar,
} from "../components/country-hub/CountrySidebar.js";
import {
  initCountryHubAnimations,
  mountCountryHubCharts,
  teardownCountryHub,
} from "../components/country-hub/country-hub-mount.js";
import { ContextMap, destroyContextMap } from "../map/components/ContextMap.js";
import {
  renderNarrativeRibbon,
  renderCuriosityStrip,
} from "../components/shared/site-bridge.js";

export function renderCountryHub(slug, data) {
  const hub = buildCountryHubPayload(slug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };
  }

  hub.geoMap = buildCountryGeoMapModel({
    country: hub.country,
    catchments: hub.catchments,
    communities: data.communities,
    catchmentMap: hub.catchmentMap,
    mapPaths: data.mapPaths,
    geoLocations: data.geoLocations,
  });

  hub.docKpis = getDocCountryKpis(hub);
  hub.docCharts = getDocCountryCharts(hub.charts);

  const html = `
    <div class="ch-hub" data-country-hub data-country-slug="${slug}">
      ${renderCountrySidebar()}
      <main class="ch-main">
        ${renderCountryHero(hub)}
        ${renderNarrativeRibbon({
          variant: "story",
          eyebrow: "Understanding this country",
          text: hub.overview || hub.description,
          cta: hub.stories?.length
            ? { label: "Read country stories", target: "#ch-stories" }
            : { label: "See country metrics", target: "#ch-kpi-section" },
        })}
        ${renderCountryStories(hub.stories, data.communities)}
        ${renderCuriosityStrip({
          text: "Curious how this country compares?",
          links: [
            { label: "Scorecard rankings", target: "#/scorecard#sc-countries" },
            { label: "Country comparisons", target: "#/scorecard#tab-analysis" },
          ],
        })}
        ${renderNarrativeRibbon({
          variant: "data",
          eyebrow: "Data layer",
          text: "Country-specific metrics, catchment map, and project charts — aligned with the doc structure.",
          cta: { label: "Open catchment map", target: "#ch-map" },
        })}
        ${renderCountryKPIGrid(hub.docKpis)}
        ${renderCountryMap(hub)}
        ${renderCountryCharts(hub.docCharts)}
        ${renderCountryReportsAndUpdates(hub.reports, hub.activities)}
      </main>
    </div>`;

  return { html, hub };
}

export function mountCountryHub(root, hub, data, navigate) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;

  const slug = hubEl.dataset.countrySlug;
  bindCountryMap(hubEl, slug);
  bindCountrySidebar(hubEl);

  const ctxMap = new ContextMap();
  ctxMap.setNavigateHandler((path) => navigate?.(path, false));
  ctxMap.mount({
    containerId: "context-map-root",
    countries: data.countries,
    mapPaths: data.mapPaths,
    mapOverlay: data.home?.mapOverlay || {},
    mapMetrics: data.mapMetrics,
    activeSlug: slug,
    breadcrumbs: [
      { label: "Africa", href: "africa" },
      { label: hub.countryName, href: `country/${slug}` },
    ],
  });
  hubEl._contextMap = ctxMap;

  requestAnimationFrame(() => {
    initCountryHubAnimations(hubEl);
    if (hub?.docCharts) mountCountryHubCharts(hubEl, hub.docCharts);
    ScrollTrigger.refresh();
  });
}

export function destroyCountryHub(root) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (hubEl) {
    hubEl._contextMap?.destroy();
    destroyContextMap();
    destroyCountrySidebar(hubEl);
    teardownCountryHub(hubEl);
  }
}
