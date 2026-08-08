/**
 * GIS drill-down layers — catchment zones anchored to real lat/lng coordinates.
 */
import { svgToLatLng } from "./utils/geo-project.js";
import { buildCatchmentZonesFromBbox } from "./utils/catchment-path-project.js";

function pathBBox(pathD) {
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

export function parseSvgPathPoints(pathD) {
  if (!pathD) return [];
  const points = [];
  const re = /([ML])\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)/gi;
  let m = re.exec(pathD);
  while (m) {
    points.push({ x: parseFloat(m[2]), y: parseFloat(m[3]) });
    m = re.exec(pathD);
  }
  return points;
}

export function svgRingToGeo(ring) {
  if (!ring?.length) return [];
  const coords = ring.map((p) => {
    const { lng, lat } = svgToLatLng(p.x, p.y);
    return [lng, lat];
  });
  if (coords.length > 2) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  }
  return coords;
}

function ringCentroid(ring) {
  const closed =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const n = closed ? ring.length - 1 : ring.length;
  if (!n) return [0, 0];
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return [sx / n, sy / n];
}

function translateRing(ring, dLng, dLat) {
  return ring.map(([lng, lat]) => [lng + dLng, lat + dLat]);
}

function scaleRing(ring, center, scale) {
  if (!scale || !Number.isFinite(scale) || scale <= 0) return ring;
  return ring.map(([lng, lat]) => [
    center[0] + (lng - center[0]) * scale,
    center[1] + (lat - center[1]) * scale,
  ]);
}

function ringMaxRadius(ring, center) {
  let maxR = 0;
  const n = ring.length > 1 ? ring.length - 1 : ring.length;
  for (let i = 0; i < n; i++) {
    const dLng = ring[i][0] - center[0];
    const dLat = ring[i][1] - center[1];
    maxR = Math.max(maxR, Math.hypot(dLng, dLat));
  }
  return maxR || 0.01;
}

function coverageRadiusDeg(catchment, communities, minDeg = 0.18, pad = 1.55) {
  if (catchment?.lng == null || catchment?.lat == null) return minDeg;
  let maxD = 0;
  const add = (lng, lat) => {
    maxD = Math.max(maxD, Math.hypot(lng - catchment.lng, lat - catchment.lat));
  };
  (communities || []).forEach((c) => {
    if (c.lng != null && c.lat != null) add(c.lng, c.lat);
  });
  return Math.max(minDeg, maxD * pad);
}

function anchorRingToCatchment(ring, catchment) {
  if (!catchment?.lng || !catchment?.lat || ring.length < 4) return ring;
  const [cx, cy] = ringCentroid(ring);
  let anchored = translateRing(ring, catchment.lng - cx, catchment.lat - cy);
  const center = [catchment.lng, catchment.lat];
  const targetR = coverageRadiusDeg(catchment, catchment.communities);
  const currentR = ringMaxRadius(anchored, center);
  const scale = Math.min(2.5, Math.max(0.35, targetR / currentR));
  return scaleRing(anchored, center, scale);
}

function buildGeoBboxRing(catchment, communities, minDeg = 0.22) {
  if (catchment?.lng == null || catchment?.lat == null) return null;
  const points = [[catchment.lng, catchment.lat]];
  (communities || []).forEach((c) => {
    if (c.lng != null && c.lat != null) points.push([c.lng, c.lat]);
  });
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  points.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });
  const padLng = Math.max(minDeg, (maxLng - minLng) * 0.45 + minDeg * 0.5);
  const padLat = Math.max(minDeg * 0.65, (maxLat - minLat) * 0.45 + minDeg * 0.35);
  return [
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
    [minLng - padLng, maxLat + padLat],
    [minLng - padLng, minLat - padLat],
  ];
}

function catchmentRingFromZone(zone) {
  const ct = zone.catchment;
  let ring = svgRingToGeo(parseSvgPathPoints(zone.d));

  if (ct?.lng != null && ct?.lat != null) {
    if (ring.length >= 4) {
      ring = anchorRingToCatchment(ring, ct);
    } else {
      ring = buildGeoBboxRing(ct, ct.communities) || [];
    }
  }

  if (ring.length < 4 && ct) {
    ring = buildGeoBboxRing(ct, ct.communities) || [];
  }

  return ring.length >= 4 ? ring : null;
}

export function buildCatchmentGeoFeatures(hub, mapPaths) {
  const catchmentMap = hub?.catchmentMap;
  const country = hub?.country;
  const catchments = hub?.catchments || [];

  if (!catchments.length || !country) return [];

  const zonesById = new Map();

  if (catchmentMap?.catchments?.length) {
    const iso = country.isoCode;
    const countryPath = mapPaths?.paths?.[iso] || "";
    if (countryPath) {
      const countryBbox = pathBBox(countryPath);
      const targetBbox = {
        x: countryBbox.x + countryBbox.width * 0.12,
        y: countryBbox.y + countryBbox.height * 0.12,
        width: countryBbox.width * 0.76,
        height: countryBbox.height * 0.76,
      };
      const zones = buildCatchmentZonesFromBbox(targetBbox, catchmentMap, catchments);
      zones.forEach((zone) => zonesById.set(zone.id, zone));
    }
  }

  return catchments
    .map((ct) => {
      const zone = zonesById.get(ct.id);
      const ring = zone ? catchmentRingFromZone(zone) : buildGeoBboxRing(ct, ct.communities);
      if (!ring) return null;
      return {
        type: "Feature",
        properties: {
          id: ct.id,
          slug: ct.slug,
          name: ct.name,
          status: ct.status || zone?.status || "inactive",
          in_network: (ct.status === "active" || ct.status === "growing") && (ct.communities?.length > 0),
        },
        geometry: { type: "Polygon", coordinates: [ring] },
      };
    })
    .filter(Boolean);
}

export function buildCountryGeoFeature(geoFeature) {
  if (!geoFeature) return null;
  return {
    type: "Feature",
    properties: { ...geoFeature.properties },
    geometry: geoFeature.geometry,
  };
}
