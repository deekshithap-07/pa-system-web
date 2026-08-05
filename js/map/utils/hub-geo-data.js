import { attachGeoPoint } from "./geo-project.js";
import { buildCatchmentZonesFromBbox, projectPathD } from "./catchment-path-project.js";
import { getCommunitiesByCatchment } from "../../utils/data.js";

export function pathBBox(pathD) {
  if (!pathD) return { x: 0, y: 0, width: 100, height: 100 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const re = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g;
  let m = re.exec(pathD);
  while (m) {
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    m = re.exec(pathD);
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 100, height: 100 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function expandViewBox(baseBbox, points = [], padRatio = 0.2) {
  let { x: minX, y: minY, width, height } = baseBbox;
  let maxX = minX + width;
  let maxY = minY + height;

  points.forEach((p) => {
    if (p?.x == null || p?.y == null) return;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const span = Math.max(maxX - minX, maxY - minY, 24);
  const pad = span * padRatio;

  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
    string: `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`,
  };
}

function enrichCatchments(catchments, communities, geoLocations) {
  const catchLocs = geoLocations?.catchments || {};
  const commLocs = geoLocations?.communities || {};

  return catchments.map((ct) => {
    const enriched = attachGeoPoint({ ...ct }, catchLocs[ct.id]);
    const ctComms = getCommunitiesByCatchment(communities, ct.id).map((c) =>
      attachGeoPoint({ ...c }, commLocs[c.id])
    );
    return { ...enriched, communities: ctComms };
  });
}

export function buildCountryGeoMapModel({ country, catchments, communities, catchmentMap, mapPaths, geoLocations }) {
  const iso = country.isoCode;
  const countryPath = mapPaths?.paths?.[iso] || "";
  const countryBbox = pathBBox(countryPath);
  const geoCatchments = enrichCatchments(catchments, communities, geoLocations);

  const zones = buildCatchmentZonesFromBbox(
    {
      x: countryBbox.x + countryBbox.width * 0.12,
      y: countryBbox.y + countryBbox.height * 0.12,
      width: countryBbox.width * 0.76,
      height: countryBbox.height * 0.76,
    },
    catchmentMap,
    geoCatchments
  );

  const allCommunities = geoCatchments.flatMap((ct) =>
    (ct.communities || []).map((c) => ({ ...c, catchmentId: ct.id, catchmentSlug: ct.slug }))
  );

  const points = [
    ...geoCatchments.filter((c) => c.x != null),
    ...allCommunities.filter((c) => c.x != null),
  ];

  const viewBox = expandViewBox(countryBbox, points, 0.14);

  return {
    mode: "country",
    countryName: country.name,
    countryPath,
    viewBox: viewBox.string,
    catchmentZones: zones,
    catchments: geoCatchments,
    communities: allCommunities,
  };
}

export function buildCatchmentGeoMapModel({
  country,
  catchment,
  communities,
  communityMap,
  mapPaths,
  geoLocations,
  countrySlug,
  catchmentSlug,
}) {
  const commLocs = geoLocations?.communities || {};
  const geoCommunities = (communities || []).map((c) => attachGeoPoint({ ...c }, commLocs[c.id]));

  const points = geoCommunities.filter((c) => c.x != null);
  let countryPath = "";
  let baseBbox;

  if (mapPaths?.paths?.[country.isoCode]) {
    countryPath = mapPaths.paths[country.isoCode];
    baseBbox = pathBBox(countryPath);
  } else if (points.length) {
    baseBbox = {
      x: points[0].x - 20,
      y: points[0].y - 20,
      width: 40,
      height: 40,
    };
  } else {
    baseBbox = { x: 0, y: 0, width: 100, height: 100 };
  }

  const viewBox = expandViewBox(baseBbox, points, 0.28);

  let catchmentOutline = "";
  if (communityMap?.catchmentPath && communityMap?.viewBox) {
    const zoneBbox = {
      x: viewBox.x + viewBox.width * 0.15,
      y: viewBox.y + viewBox.height * 0.15,
      width: viewBox.width * 0.7,
      height: viewBox.height * 0.7,
    };
    catchmentOutline = projectPathD(communityMap.catchmentPath, communityMap.viewBox, zoneBbox);
  }

  const catchLoc = geoLocations?.catchments?.[catchment.id];
  const catchmentPoint = catchLoc ? attachGeoPoint({ ...catchment }, catchLoc) : null;

  return {
    mode: "catchment",
    countryName: country.name,
    countrySlug,
    catchmentName: catchment.name,
    catchmentSlug,
    countryPath,
    catchmentOutline,
    catchmentPoint,
    viewBox: viewBox.string,
    communities: geoCommunities,
    catchmentZones: [],
    catchments: catchmentPoint ? [catchmentPoint] : [],
  };
}
