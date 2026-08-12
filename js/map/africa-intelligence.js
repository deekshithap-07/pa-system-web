import { AfricaIntelligenceMap } from "./components/AfricaIntelligenceMap.js";

let intelligenceInstance = null;

export function initAfricaIntelligenceMap({
  countries,
  mapPaths,
  mapOverlay,
  mapMetrics,
  config,
  catchments,
  communities,
  countryHubs,
  geoLocations,
  containerId = "africa-intelligence-root",
}) {
  destroyAfricaIntelligenceMap();

  const root = document.getElementById(containerId);
  if (!root) return null;

  intelligenceInstance = new AfricaIntelligenceMap();
  intelligenceInstance.mount({
    root,
    countries,
    mapPaths,
    mapOverlay,
    mapMetrics,
    config,
    catchments,
    communities,
    countryHubs,
    geoLocations,
  });

  return intelligenceInstance;
}

export function setCountrySelectHandler(fn) {
  intelligenceInstance?.setCountrySelectHandler(fn);
}

export function setCatchmentSelectHandler(fn) {
  intelligenceInstance?.setCatchmentSelectHandler(fn);
}

export function destroyAfricaIntelligenceMap() {
  intelligenceInstance?.destroy();
  intelligenceInstance = null;
}

/* Legacy scroll-journey map — retained for reference, no longer used on homepage */
export { AfricaIntelligenceMap };
