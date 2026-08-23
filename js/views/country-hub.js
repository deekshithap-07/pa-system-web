import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import {
  renderCountryStoryHero,
  renderByTheNumbers,
  renderCountryOverview,
  renderCountryLatest,
  renderCountryProjects,
  bindCountryStoryHero,
  bindNumbersCarousel,
  bindOverviewTabs,
  featuredStories,
} from "../components/work/CountryWbPage.js";
import { renderChart, destroyCharts } from "../components/charts.js";
import { numberCardsFromHub } from "../utils/work-locations.js";
import { bindLocationMenus } from "../components/work/LocationBrowse.js";

export function renderCountryHub(slug, data) {
  const hub = buildCountryHubPayload(slug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };
  }

  const stories = featuredStories(data, hub);

  const html = `
    <div class="wb-country" data-country-hub data-country-slug="${slug}">
      ${renderCountryStoryHero(hub, stories)}
      ${renderByTheNumbers(hub)}
      ${renderCountryOverview(hub)}
      ${renderCountryLatest(hub, stories)}
      ${renderCountryProjects(hub)}
    </div>`;

  return { html, hub };
}

export function mountCountryHub(root, hub) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;

  bindCountryStoryHero(hubEl);
  bindNumbersCarousel(hubEl);
  bindOverviewTabs(hubEl);
  bindLocationMenus(hubEl);

  const cards = numberCardsFromHub(hub);
  cards.forEach((card) => {
    const canvas = hubEl.querySelector(`[data-wb-num="${card.key}"]`);
    if (canvas) renderChart(canvas, card.config);
  });
}

export function destroyCountryHub(root) {
  const hubEl = root.querySelector("[data-country-hub]");
  if (!hubEl) return;
  const hero = hubEl.querySelector("[data-cstory]");
  if (hero?._timer) clearInterval(hero._timer);
  hubEl._locMenuOff?.();
  destroyCharts();
}
