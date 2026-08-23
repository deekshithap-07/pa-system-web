import { renderLocationHero } from "../work/LocationBrowse.js";
import { renderCountryScrollTopics } from "../work/CountryScrollTopics.js";

export function renderAfricaHero(data) {
  return renderLocationHero(data);
}

export function renderAfricaOverviewSections(data) {
  return `
    <div class="ao-overview">
      ${renderCountryScrollTopics(data)}
    </div>`;
}

export function mountAfricaOverviewCharts() {}
