/**
 * Facade for the interactive Africa map (Esri satellite base).
 */
import { AfricaMap } from "./AfricaMap.js";

let instance = null;

export function initAfricaMap({
  countries,
  mapPaths,
  catchments,
  communities,
  countryHubs,
  geoLocations,
  charts,
  containerId = "home-africa-map-root",
}) {
  destroyAfricaMap();

  const root = document.getElementById(containerId);
  if (!root) return null;

  instance = new AfricaMap();
  const mounted = instance.mount({
    root,
    data: {
      countries,
      mapPaths,
      catchments,
      communities,
      countryHubs,
      geoLocations,
      charts,
    },
  });

  if (!mounted) {
    instance.destroy();
    instance = null;
    return null;
  }

  return instance;
}

export function destroyAfricaMap() {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
