import { buildCatchmentHubPayload } from "../utils/catchment-hub-data.js";
import { buildCatchmentGeoMapModel } from "../map/utils/hub-geo-data.js";
import { renderCatchmentHero } from "../components/catchment-hub/CatchmentHero.js";
import { renderCatchmentSummary } from "../components/catchment-hub/CatchmentSummary.js";
import { renderCatchmentMap, bindCatchmentMap } from "../components/catchment-hub/CatchmentMap.js";
import { renderCatchmentCharts } from "../components/catchment-hub/CatchmentCharts.js";
import { renderCatchmentCommunityList, bindCatchmentCommunityList } from "../components/catchment-hub/CatchmentCommunityList.js";
import { renderCatchmentActivityFeed } from "../components/catchment-hub/CatchmentActivityFeed.js";
import { renderCatchmentReports } from "../components/catchment-hub/CatchmentReports.js";
import { renderCatchmentStories } from "../components/catchment-hub/CatchmentStories.js";
import { renderCatchmentInsights } from "../components/catchment-hub/CatchmentInsights.js";
import {
  renderCatchmentSidebar,
  bindCatchmentSidebar,
  destroyCatchmentSidebar,
} from "../components/catchment-hub/CatchmentSidebar.js";
import {
  initCatchmentHubAnimations,
  mountCatchmentHubCharts,
  teardownCatchmentHub,
} from "../components/catchment-hub/catchment-hub-mount.js";
import { ContextMap, destroyContextMap } from "../map/components/ContextMap.js";

export function renderCatchmentHub(countrySlug, catchmentSlug, data) {
  const hub = buildCatchmentHubPayload(countrySlug, catchmentSlug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Catchment not found</h1><p><a href="#/country/${countrySlug}" data-link>Back to country</a></p></div>` };
  }

  hub.geoMap = buildCatchmentGeoMapModel({
    country: hub.country,
    catchment: hub.catchment,
    communities: hub.communities,
    communityMap: hub.communityMap,
    mapPaths: data.mapPaths,
    geoLocations: data.geoLocations,
    countrySlug,
    catchmentSlug,
  });

  const html = `
    <div class="ch-hub cth-hub" data-catchment-hub data-country-slug="${countrySlug}" data-catchment-slug="${catchmentSlug}">
      ${renderCatchmentSidebar(countrySlug)}
      <main class="ch-main">
        ${renderCatchmentHero(hub)}
        ${renderCatchmentSummary(hub.overview, hub.kpis)}
        ${renderCatchmentMap(hub)}
        ${renderCatchmentCharts(hub.charts)}
        ${renderCatchmentCommunityList(hub.communityCards, countrySlug, catchmentSlug, hub.catchmentName)}
        ${renderCatchmentActivityFeed(hub.activities)}
        ${renderCatchmentReports(hub.reports)}
        ${renderCatchmentStories(hub.stories, hub.communities)}
        ${renderCatchmentInsights(hub.insights)}
      </main>
    </div>`;

  return { html, hub };
}

export function mountCatchmentHub(root, hub, data, navigate) {
  const hubEl = root.querySelector("[data-catchment-hub]");
  if (!hubEl) return;

  const countrySlug = hubEl.dataset.countrySlug;
  const catchmentSlug = hubEl.dataset.catchmentSlug;

  bindCatchmentMap(hubEl, countrySlug, catchmentSlug);
  bindCatchmentCommunityList(hubEl);
  bindCatchmentSidebar(hubEl, countrySlug);

  const ctxMap = new ContextMap();
  ctxMap.setNavigateHandler((path) => navigate?.(path, false));
  ctxMap.mount({
    containerId: "context-map-root",
    countries: data.countries,
    mapPaths: data.mapPaths,
    mapOverlay: data.home?.mapOverlay || {},
    mapMetrics: data.mapMetrics,
    activeSlug: countrySlug,
    breadcrumbs: [
      { label: "Africa", href: "africa" },
      { label: hub.countryName, href: `country/${countrySlug}` },
      { label: hub.catchmentName, href: `catchment/${countrySlug}/${catchmentSlug}` },
    ],
  });
  hubEl._contextMap = ctxMap;

  requestAnimationFrame(() => {
    initCatchmentHubAnimations(hubEl);
    if (hub?.charts) mountCatchmentHubCharts(hubEl, hub.charts);
    ScrollTrigger.refresh();
  });
}

export function destroyCatchmentHub(root) {
  const hubEl = root.querySelector("[data-catchment-hub]");
  if (hubEl) {
    hubEl._contextMap?.destroy();
    destroyContextMap();
    destroyCatchmentSidebar(hubEl);
    teardownCatchmentHub(hubEl);
  }
}
