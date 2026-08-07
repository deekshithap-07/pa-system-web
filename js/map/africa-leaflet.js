/**
 * Facade for the Leaflet-based Africa intelligence map.
 * Mirrors js/map/africa-intelligence.js for the SVG engine so callers can
 * swap engines without changing their interface.
 */

import { AfricaLeafletMap } from "./leaflet/AfricaLeafletMap.js";

let instance = null;

export function initAfricaLeafletMap({
  countries,
  mapPaths,
  catchments,
  communities,
  countryHubs,
  geoLocations,
  config = {},
  containerId = "africa-leaflet-root",
}) {
  destroyAfricaLeafletMap();

  const root = document.getElementById(containerId);
  if (!root) return null;

  instance = new AfricaLeafletMap(config);
  instance.mount({
    root,
    data: {
      countries,
      mapPaths,
      catchments,
      communities,
      countryHubs,
      geoLocations,
    },
  });

  return instance;
}

export function destroyAfricaLeafletMap() {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}