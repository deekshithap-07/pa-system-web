/**
 * Africa Map — public API facade.
 * Delegates to modular AfricaMap component.
 */
import { AfricaMap } from "./components/AfricaMap.js";

let instance = null;

export function setCountrySelectHandler(fn) {
  instance?.setCountrySelectHandler(fn);
}

export function initAfricaMap({
  countries,
  mapPaths,
  mapOverlay,
  mapMetrics,
  byNumbers,
  hero,
  containerId = "africa-map-root",
}) {
  destroyAfricaMap();

  const root = document.getElementById(containerId);
  if (!root) return;

  instance = new AfricaMap();
  instance.mount({
    stageRoot: root,
    countries,
    mapPaths,
    mapOverlay,
    mapMetrics,
    byNumbers,
    hero,
  });

  return instance;
}

export function enableScrollZoom() {
  /* Scroll zoom is initialized automatically in AfricaMap.mount */
  return () => destroyAfricaMap();
}

export function destroyAfricaMap() {
  instance?.destroy();
  instance = null;
}

export const setCountryClickHandler = setCountrySelectHandler;
export function initScrollMap(opts) {
  return initAfricaMap(opts);
}
export function destroyScrollMap() {
  destroyAfricaMap();
}

export { AfricaMap };
