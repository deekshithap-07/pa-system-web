import { getCatchmentsByCountry } from "./data.js";
import {
  buildCountryGeoMapModel,
  buildCatchmentGeoMapModel,
} from "../map/utils/hub-geo-data.js";

export function attachCatchmentHubGeoMaps(hub, data) {
  if (!hub?.country) return hub;

  const countryHub = data.countryHubs?.hubs?.[hub.countrySlug];
  const catchmentMap = countryHub?.catchmentMap || hub.catchmentMap;
  const countryCatchments = getCatchmentsByCountry(data.catchments, hub.country.id);

  hub.countryGeoMap = buildCountryGeoMapModel({
    country: hub.country,
    catchments: countryCatchments,
    communities: data.communities,
    catchmentMap,
    mapPaths: data.mapPaths,
    geoLocations: data.geoLocations,
  });

  hub.geoMap = buildCatchmentGeoMapModel({
    country: hub.country,
    catchment: hub.catchment,
    communities: hub.communities || [],
    communityMap: hub.communityMap,
    mapPaths: data.mapPaths,
    geoLocations: data.geoLocations,
    countrySlug: hub.countrySlug,
    catchmentSlug: hub.catchmentSlug,
  });

  return hub;
}

export function attachCommunityHubGeoMap(payload, data) {
  if (!payload?.country || !payload?.catchment) return payload;

  const hubEntry = data.catchmentHubs?.hubs?.[payload.catchment.slug];
  const communityMap = hubEntry?.communityMap || payload.communityMap;

  payload.geoMap = buildCatchmentGeoMapModel({
    country: payload.country,
    catchment: payload.catchment,
    communities: getCommunitiesForCatchment(data, payload.catchment.id),
    communityMap,
    mapPaths: data.mapPaths,
    geoLocations: data.geoLocations,
    countrySlug: payload.country.slug,
    catchmentSlug: payload.catchment.slug,
  });

  payload.siblingCommunities = getCommunitiesForCatchment(data, payload.catchment.id);
  return payload;
}

function getCommunitiesForCatchment(data, catchmentId) {
  return (data.communities?.communities || []).filter((c) => c.catchmentId === catchmentId);
}

export function highlightCatchmentOnMap(root, catchmentId) {
  if (!root || !catchmentId) return;
  root.querySelectorAll(".hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.entityId === catchmentId);
  });
}

export function highlightCommunityOnMap(root, communitySlug) {
  if (!root || !communitySlug) return;
  root.querySelectorAll(".hub-geo-map__community-anchor, .hub-geo-map__community-label").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.entitySlug === communitySlug);
  });
}
