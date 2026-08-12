/**
 * Africa map surface helpers — zoom/distance sync and global-view CSS overzoom.
 */

export const EARTH_CIRCUMFERENCE_M = 40_075_016.686;
export const TILE_SIZE_PX = 512;
export const MIN_DISTANCE_METERS = 100;
export const MAX_DISTANCE_METERS = 20_000_000;
export const MAP_OVERZOOM_SCALE = 5.5;
export const MIN_EFFECTIVE_CONTAINER_PX = 3300;
export const MAX_OVERZOOM_SCALE = 10;

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function zoomToDistance(zoom, latDeg, containerPx) {
  const phi = (Math.abs(latDeg) * Math.PI) / 180;
  const cosLat = Math.max(0.01, Math.cos(phi));
  const fullWidth =
    (EARTH_CIRCUMFERENCE_M * cosLat * containerPx) / (Math.pow(2, zoom) * TILE_SIZE_PX);
  return clamp(Math.round(fullWidth / 2), MIN_DISTANCE_METERS, MAX_DISTANCE_METERS);
}

export function distanceToZoom(distanceMeters, latDeg, containerPx) {
  const phi = (Math.abs(latDeg) * Math.PI) / 180;
  const cosLat = Math.max(0.01, Math.cos(phi));
  const fullWidth = distanceMeters * 2;
  const zoom = Math.log2(
    (EARTH_CIRCUMFERENCE_M * cosLat * containerPx) / (fullWidth * TILE_SIZE_PX)
  );
  return clamp(zoom, 0.5, 20);
}

export function computeOverzoomScale(containerPx) {
  if (!containerPx || containerPx <= 0) return MAP_OVERZOOM_SCALE;
  return Math.min(
    MAX_OVERZOOM_SCALE,
    Math.max(MAP_OVERZOOM_SCALE, MIN_EFFECTIVE_CONTAINER_PX / containerPx)
  );
}

export function formatCoordinates(lat, lon) {
  const northSouth = lat >= 0 ? "N" : "S";
  const eastWest = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${northSouth} / ${Math.abs(lon).toFixed(4)}° ${eastWest}`;
}

/** Half-width distances (meters) for GIS drill-down fly targets. */
export const ZOOM_LEVELS = {
  global: 5_000_000,
  country: 800_000,
  catchment: 80_000,
  community: 4_000,
};

export const FLY_DURATION_MS = 1400;
export const AFRICA_CENTER = { lon: 18, lat: 3 };

export function getEffectiveContainerPx(containerPx, overzoomScale) {
  return containerPx * Math.max(1, overzoomScale || 1);
}

export function resolveZoomBounds(latDeg, effectiveContainerPx) {
  const minZoomFromDistance = distanceToZoom(MAX_DISTANCE_METERS, latDeg, effectiveContainerPx);
  const maxZoomFromDistance = distanceToZoom(MIN_DISTANCE_METERS, latDeg, effectiveContainerPx);
  return {
    minZoom: Math.min(minZoomFromDistance, maxZoomFromDistance),
    maxZoom: Math.max(minZoomFromDistance, maxZoomFromDistance),
  };
}

export function zoomForDistance(distanceMeters, latDeg, effectiveContainerPx) {
  const bounds = resolveZoomBounds(latDeg, effectiveContainerPx);
  return clamp(distanceToZoom(distanceMeters, latDeg, effectiveContainerPx), bounds.minZoom, bounds.maxZoom);
}

export function flyToDistance(
  map,
  { lon, lat, distanceMeters, effectiveContainerPx, duration = FLY_DURATION_MS, padding }
) {
  if (!map) return;
  const zoom = zoomForDistance(distanceMeters, lat, effectiveContainerPx);
  const opts = { center: [lon, lat], zoom, duration };
  if (padding != null) opts.padding = padding;
  map.flyTo(opts);
}

export function fitBoundsToDistance(map, bounds, {
  lat,
  effectiveContainerPx,
  distanceMeters,
  padding = 40,
  duration = FLY_DURATION_MS,
}) {
  if (!map || !bounds) return;
  const maxZoom = zoomForDistance(distanceMeters, lat, effectiveContainerPx);
  map.fitBounds(bounds, { padding, duration, maxZoom });
}

export function preserveDistanceOnResize(map, {
  lat,
  previousEffectivePx,
  nextEffectivePx,
}) {
  if (!map || previousEffectivePx <= 0 || nextEffectivePx <= 0) return;
  const distance = zoomToDistance(map.getZoom(), lat, previousEffectivePx);
  const zoom = zoomForDistance(distance, lat, nextEffectivePx);
  map.setZoom(zoom);
}

export const COMMUNITY_PIN_COLORS = {
  active: "#D6B352",
  growing: "#E8C96A",
  inactive: "#8A6820",
  default: "#C99C37",
};

export function communityPinColor(community) {
  const status = String(community?.status || "").toLowerCase();
  if (status in COMMUNITY_PIN_COLORS) return COMMUNITY_PIN_COLORS[status];
  const stage = String(community?.journeyStage || "").toLowerCase();
  if (stage.includes("active") || stage.includes("growth")) return COMMUNITY_PIN_COLORS.active;
  if (stage.includes("inactive")) return COMMUNITY_PIN_COLORS.inactive;
  return COMMUNITY_PIN_COLORS.default;
}
