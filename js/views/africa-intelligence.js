import {
  initAfricaIntelligenceMap,
  setCountrySelectHandler,
  destroyAfricaIntelligenceMap,
} from "../map/africa-intelligence.js";

export function renderAfricaIntelligence(data) {
  const config = data.africaIntelligence || {};

  return `
    <div class="africa-intelligence-page" data-africa-intelligence>
      <div id="africa-intelligence-root" aria-label="Africa Intelligence Map"></div>
    </div>`;
}

export function mountAfricaIntelligence(data, navigate) {
  const page = document.querySelector("[data-africa-intelligence]");
  if (!page) return;

  const scrollY = window.scrollY;
  document.documentElement.classList.add("africa-map-active");
  document.body.classList.add("africa-map-active");
  document.body.dataset.africaScrollY = String(scrollY);
  document.body.style.top = scrollY ? `-${scrollY}px` : "";

  document.getElementById("site-header")?.classList.add("site-header--dark");

  initAfricaIntelligenceMap({
    countries: data.countries,
    mapPaths: data.mapPaths,
    mapOverlay: data.home?.mapOverlay || {},
    mapMetrics: data.mapMetrics,
    config: data.africaIntelligence,
    catchments: data.catchments,
    communities: data.communities,
    countryHubs: data.countryHubs,
    geoLocations: data.geoLocations,
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function destroyAfricaIntelligence() {
  const scrollY = Number(document.body.dataset.africaScrollY || 0);
  document.documentElement.classList.remove("africa-map-active");
  document.body.classList.remove("africa-map-active");
  document.body.style.top = "";
  delete document.body.dataset.africaScrollY;
  document.getElementById("site-header")?.classList.remove("site-header--dark");
  destroyAfricaIntelligenceMap();
  window.scrollTo(0, scrollY);
}
