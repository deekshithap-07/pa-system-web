import {
  renderAfricaHero,
  renderAfricaOverviewSections,
  mountAfricaOverviewCharts,
} from "../components/africa-overview/AfricaOverviewSections.js";
import {
  renderRegionPage,
  renderCountriesIndex,
  renderPlacesGroupedPage,
  bindLocationMenus,
} from "../components/work/LocationBrowse.js";
import {
  mountCountryScrollTopics,
  destroyCountryScrollTopics,
} from "../components/work/CountryScrollTopics.js";

export function renderAfricaIntelligence(data, section = "overview", regionId = null) {
  if (section === "region") return renderRegionPage(data, regionId);
  if (section === "countries") return renderCountriesIndex(data);
  if (section === "places") return renderPlacesGroupedPage(data);

  return `
    <div class="africa-intelligence-page africa-intelligence-page--scroll" data-africa-intelligence>
      ${renderAfricaHero(data)}
      ${renderAfricaOverviewSections(data)}
    </div>`;
}

export function mountAfricaIntelligence(data) {
  const page = document.querySelector("[data-africa-intelligence], [data-work-place]");
  if (!page) return;
  mountAfricaOverviewCharts(page);
  bindLocationMenus(page);
  mountCountryScrollTopics(page);
}

export function destroyAfricaIntelligence() {
  const page = document.querySelector("[data-africa-intelligence], [data-work-place]");
  page?._locMenuOff?.();
  destroyCountryScrollTopics(page || document);
}
