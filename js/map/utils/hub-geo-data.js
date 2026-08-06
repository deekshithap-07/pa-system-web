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
  let geoCommunities = (communities || []).map((c) => attachGeoPoint({ ...c }, commLocs[c.id]));

  if (communityMap?.communities?.length) {
    geoCommunities = geoCommunities.map((c) => {
      const mapEntry = communityMap.communities.find((m) => m.id === c.id || m.slug === c.slug);
      if (!mapEntry?.path) return c;
      const bb = pathBBox(mapEntry.path);
      return { ...c, x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
    });

    const points = geoCommunities.filter((c) => c.x != null);
    const base = communityMap.viewBox
      ? (() => {
          const p = communityMap.viewBox.split(/\s+/).map(Number);
          return { x: p[0] || 0, y: p[1] || 0, width: p[2] || 220, height: p[3] || 200 };
        })()
      : { x: 0, y: 0, width: 220, height: 200 };
    const viewBox = expandViewBox(base, points, 0.1);

    let bgPath = "";
    const countryPathRaw = mapPaths?.paths?.[country.isoCode] || "";
    if (countryPathRaw) {
      const cb = pathBBox(countryPathRaw);
      bgPath = projectPathD(countryPathRaw, `${cb.x} ${cb.y} ${cb.width} ${cb.height}`, {
        x: base.x + base.width * 0.06,
        y: base.y + base.height * 0.06,
        width: base.width * 0.88,
        height: base.height * 0.88,
      });
    }

    return {
      mode: "catchment",
      layout: "schematic",
      countryName: country.name,
      countrySlug,
      catchmentName: catchment.name,
      catchmentSlug,
      countryPath: bgPath,
      viewBox: viewBox.string,
      communities: geoCommunities,
      catchmentZones: [],
      catchments: [],
    };
  }

  const countryPath = mapPaths?.paths?.[country.isoCode] || "";
  const countryBbox = pathBBox(countryPath || "M0,0 L100,0 L100,100 Z");

  const points = geoCommunities.filter((c) => c.x != null);
  const baseBbox = countryPath ? countryBbox : points.length
    ? { x: points[0].x - 20, y: points[0].y - 20, width: 40, height: 40 }
    : { x: 0, y: 0, width: 100, height: 100 };

  const viewBox = expandViewBox(baseBbox, points, points.length ? 0.22 : 0.28);

  const catchLoc = geoLocations?.catchments?.[catchment.id];
  const catchmentPoint = catchLoc ? attachGeoPoint({ ...catchment }, catchLoc) : null;

  return {
    mode: "catchment",
    layout: "geo",
    countryName: country.name,
    countrySlug,
    catchmentName: catchment.name,
    catchmentSlug,
    countryPath,
    catchmentPoint,
    viewBox: viewBox.string,
    communities: geoCommunities,
    catchmentZones: [],
    catchments: catchmentPoint ? [catchmentPoint] : [],
  };
}
