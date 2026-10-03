import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { attachCountryHubGeoMap } from "../utils/hub-geo-maps.js";
import {
  renderCountryIntro,
  renderCountryGlance,
  renderCountryVideo,
  bindCountryVideo,
  renderCountryMapPresence,
  renderCountryProgrammes,
  renderCountryTrends,
  renderCountryFeaturedStories,
  renderCountryReports,
  renderCountryUpdates,
  renderCountryNetwork,
  bindCountryMap,
  bindCountryEngage,
  bindCountryProgrammes,
  featuredStories,
  buildCountryTrendCharts,
  initCountryPageAnimations,
} from "../components/work/CountryWbPage.js";
import { mountCountryHubCharts, teardownCountryHub } from "../components/country-hub/country-hub-mount.js";
import { renderPageTrail, bindPageTrail, destroyPageTrail } from "../components/shared/page-trail.js";

export function renderCountryHub(slug, data) {
  const hub = buildCountryHubPayload(slug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };
  }

  attachCountryHubGeoMap(hub, data);
  hub.trendCharts = buildCountryTrendCharts(hub);
  const stories = featuredStories(data, hub);

  const html = `
    <div class="wb-country cp-portal-page" data-country-hub data-country-slug="${slug}">
      ${renderCountryIntro(hub, data)}
      ${renderPageTrail({
        glance: '[data-cp-section="glance"]',
        where: "#cp-map",
        work: '[data-cp-section="programmes"]',
        progress: '[data-cp-section="trends"]',
        stories: '[data-cp-section="stories"]',
        knowledge: '[data-cp-section="reports"]',
        next: '[data-cp-section="network"]',
      }, `${hub.countryName} on this page`)}
      ${renderCountryGlance(hub, data)}
      ${renderCountryVideo(hub)}
      ${renderCountryMapPresence(hub)}
      ${renderCountryProgrammes(hub, data)}
      ${renderCountryTrends(hub, data)}
      ${renderCountryFeaturedStories(hub, stories)}
      ${renderCountryReports(hub)}
      ${renderCountryUpdates(hub, data)}
      ${renderCountryNetwork(hub, data)}
    </div>`;

  return { html, hub };
}

export function mountCountryHub(root, hub) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;

  bindCountryProgrammes(hubEl);
  bindCountryMap(hubEl, hub?.country?.slug || hubEl.dataset.countrySlug);
  bindCountryEngage(hubEl);
  bindCountryVideo(hubEl);
  initCountryPageAnimations(hubEl);
  bindPageTrail(hubEl);

  if (hub?.trendCharts && hubEl.querySelector("[data-chart]")) {
    mountCountryHubCharts(hubEl, hub.trendCharts.configs);
  }
}

export function destroyCountryHub(root) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;
  destroyPageTrail();
  teardownCountryHub(hubEl);
}
