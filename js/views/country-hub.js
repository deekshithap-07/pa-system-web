import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { attachCountryHubGeoMap } from "../utils/hub-geo-maps.js";
import {
  renderCountryIntro,
  renderCountryGlance,
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
  initCountryPageAnimations,
} from "../components/work/CountryWbPage.js";
import { mountCountryHubCharts, teardownCountryHub } from "../components/country-hub/country-hub-mount.js";

export function renderCountryHub(slug, data) {
  const hub = buildCountryHubPayload(slug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };
  }

  attachCountryHubGeoMap(hub, data);
  const stories = featuredStories(data, hub);

  const html = `
    <div class="wb-country cp-portal-page" data-country-hub data-country-slug="${slug}">
      ${renderCountryIntro(hub, data)}
      ${renderCountryGlance(hub)}
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
  initCountryPageAnimations(hubEl);

  if (hub?.charts && hubEl.querySelector("[data-chart]")) {
    const branded = Object.fromEntries(
      Object.entries(hub.charts).map(([key, cfg]) => [
        key,
        {
          ...cfg,
          color: cfg.color && cfg.color.startsWith("#00") ? "#e8a91a" : cfg.color || "#e8a91a",
        },
      ])
    );
    mountCountryHubCharts(hubEl, branded);
  }
}

export function destroyCountryHub(root) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;
  teardownCountryHub(hubEl);
}
