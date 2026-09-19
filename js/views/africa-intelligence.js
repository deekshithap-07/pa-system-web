import {
  renderRegionPage,
  renderPlacesGroupedPage,
  bindLocationMenus,
} from "../components/work/LocationBrowse.js";
import {
  mountCountryScrollTopics,
  destroyCountryScrollTopics,
} from "../components/work/CountryScrollTopics.js";
import {
  renderWhereWeWorkPage,
  mountWhereWeWorkPage,
  destroyWhereWeWorkPage,
} from "../components/work/where-we-work-page.js";

export function renderAfricaIntelligence(data, section = "overview", regionId = null) {
  if (section === "region") return renderRegionPage(data, regionId);
  if (section === "places") return renderPlacesGroupedPage(data);

  return renderWhereWeWorkPage(data);
}

export function mountAfricaIntelligence(data) {
  const page = document.querySelector("[data-africa-intelligence], [data-work-place]");
  if (!page) return;

  if (page.hasAttribute("data-where-we-work")) {
    mountWhereWeWorkPage(data);
    return;
  }

  bindLocationMenus(page);
  mountCountryScrollTopics(page);
}

export function destroyAfricaIntelligence() {
  const page = document.querySelector("[data-africa-intelligence], [data-work-place]");
  page?._locMenuOff?.();
  destroyCountryScrollTopics(page || document);
  destroyWhereWeWorkPage();
}
