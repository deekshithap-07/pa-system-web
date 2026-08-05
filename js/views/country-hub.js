import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { buildCountryGeoMapModel } from "../map/utils/hub-geo-data.js";
import { renderCountryHero } from "../components/country-hub/CountryHero.js";
import { renderCountrySummary } from "../components/country-hub/CountrySummary.js";
import { renderCountryKPIGrid } from "../components/country-hub/CountryKPIGrid.js";
import { renderCountryMap, bindCountryMap } from "../components/country-hub/CountryMap.js";
import { renderCountryCharts } from "../components/country-hub/CountryCharts.js";
import { renderCountryActivityFeed } from "../components/country-hub/CountryActivityFeed.js";
import { renderCountryReports } from "../components/country-hub/CountryReports.js";
import { renderCountryStories } from "../components/country-hub/CountryStories.js";
import { renderCountryInsights } from "../components/country-hub/CountryInsights.js";
import { renderCountryCatchments, bindCountryCatchments } from "../components/country-hub/CountryCommunities.js";
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

function renderDownloads(reports) {
  if (!reports?.length) return `<section class="ch-section" id="ch-downloads" data-reveal-section><p class="ch-empty">No downloads available.</p></section>`;

  return `
    <section class="ch-section" id="ch-downloads" data-reveal-section>
      <div class="ch-section__head">
        <h2>Downloads</h2>
        <p class="ch-section__desc">Data exports and printable resources</p>
      </div>
      <div class="ch-download-list">
        ${reports
          .map(
            (r) => `<a href="${r.downloadUrl}" class="ch-download-item">
              <span class="ch-download-item__title">${r.title}</span>
              <span class="ch-download-item__action">Download &darr;</span>
            </a>`
          )
          .join("")}
      </div>
    </section>`;
}

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

  const html = `
    <div class="ch-hub" data-country-hub data-country-slug="${slug}">
      ${renderCountrySidebar()}
      <main class="ch-main">
        ${renderCountryHero(hub)}
        ${renderCountryKPIGrid(hub.kpis)}
        ${renderCountrySummary(hub)}
        ${renderCountryMap(hub)}
        ${renderCountryCatchments(hub.catchments, hub.countryName, slug)}
        ${renderCountryCharts(hub.charts)}
        ${renderCountryActivityFeed(hub.activities)}
        ${renderCountryStories(hub.stories, data.communities)}
        ${renderCountryReports(hub.reports)}
        ${renderCountryInsights(hub.insights)}
        ${renderDownloads(hub.reports)}
      </main>
    </div>`;

  return { html, hub };
}

export function mountCountryHub(root, hub, data, navigate) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;

  const slug = hubEl.dataset.countrySlug;
  bindCountryMap(hubEl, slug);
  bindCountryCatchments(hubEl, slug);
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
    if (hub?.charts) mountCountryHubCharts(hubEl, hub.charts);
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
