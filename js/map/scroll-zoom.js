/**
 * @deprecated Use africa-map.js — scroll zoom not yet implemented.
 * Re-exports for backward compatibility with dashboard routes.
 */
export {
  initAfricaMap as initScrollMap,
  destroyAfricaMap as destroyScrollMap,
  setCountrySelectHandler as setCountryClickHandler,
  enableScrollZoom,
} from "./africa-map.js";
