import { buildMapCountries } from "../../utils/data.js";
import { getPathCentroid } from "../utils/geo.js";

const DEFAULT_METRICS = {
  households: 0,
  projects: 0,
  growth: 0,
  status: "Context",
  latestUpdate: null,
  progress: 0,
};

/**
 * Normalizes country records for map components.
 * Single swap point when backend replaces mock JSON.
 */
export function loadMapRegions({ countries, mapPaths, mapOverlay = {}, mapMetrics = {} }) {
  const metrics = mapMetrics.metrics || mapMetrics || {};

  return buildMapCountries(countries, mapPaths).map((country) => {
    const m = metrics[country.isoCode] || {};
    const overlay = mapOverlay[country.isoCode] || {};

    return {
      ...country,
      countryName: country.name,
      population: country.stats?.population ?? 0,
      communities: country.summary?.communities ?? 0,
      households: m.households ?? country.summary?.households ?? 0,
      projects: m.projects ?? overlay.activeProjects ?? 0,
      growth: m.growth ?? 0,
      status: m.status ?? (country.isPaNetwork ? "Active" : "Context"),
      latestUpdate: m.latestUpdate ?? null,
      progress: m.progress ?? 0,
      coordinates: m.coordinates ?? null,
      mapMeta: overlay,
    };
  });
}

export function attachCoordinates(regions, svg) {
  if (!svg) return regions;
  return regions.map((region) => {
    if (region.coordinates) return region;
    const pathEl = svg.querySelector(`[data-slug="${region.slug}"]`);
    const centroid = getPathCentroid(pathEl);
    return {
      ...region,
      coordinates: { x: centroid.x, y: centroid.y },
      bbox: centroid.bbox,
    };
  });
}
