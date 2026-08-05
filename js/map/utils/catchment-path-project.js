/**
 * Project schematic catchment-map paths onto a country's SVG bbox on the Africa map.
 */

function parseViewBox(viewBox = "0 0 160 200") {
  const p = viewBox.split(/\s+/).map(Number);
  return { x: p[0] || 0, y: p[1] || 0, width: p[2] || 160, height: p[3] || 200 };
}

/**
 * Scale path coordinates from a local viewBox into target bbox (SVG map space).
 */
export function projectPathD(pathD, viewBox, targetBbox) {
  if (!pathD || !targetBbox) return "";
  const vb = parseViewBox(viewBox);
  const sx = targetBbox.width / vb.width;
  const sy = targetBbox.height / vb.height;

  return pathD.replace(/([ML])\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)/gi, (_, cmd, xStr, yStr) => {
    const nx = targetBbox.x + (parseFloat(xStr) - vb.x) * sx;
    const ny = targetBbox.y + (parseFloat(yStr) - vb.y) * sy;
    return `${cmd}${nx.toFixed(1)},${ny.toFixed(1)}`;
  });
}

export function getCountryPathBbox(region, inset = 0.1) {
  const bbox = region.pathEl.getBBox();
  return {
    x: bbox.x + bbox.width * inset,
    y: bbox.y + bbox.height * inset,
    width: bbox.width * (1 - inset * 2),
    height: bbox.height * (1 - inset * 2),
  };
}

export function buildCatchmentZones(region, catchmentMap, catchments = []) {
  if (!catchmentMap?.catchments?.length) return [];
  const targetBbox = region?.pathEl
    ? getCountryPathBbox(region, 0.12)
    : region?.bbox
      ? insetBbox(region.bbox, 0.12)
      : null;
  if (!targetBbox) return [];
  return buildCatchmentZonesFromBbox(targetBbox, catchmentMap, catchments);
}

function insetBbox(bbox, inset = 0.1) {
  return {
    x: bbox.x + bbox.width * inset,
    y: bbox.y + bbox.height * inset,
    width: bbox.width * (1 - inset * 2),
    height: bbox.height * (1 - inset * 2),
  };
}

export function buildCatchmentZonesFromBbox(targetBbox, catchmentMap, catchments = []) {
  if (!catchmentMap?.catchments?.length || !targetBbox) return [];
  const catchmentById = Object.fromEntries(catchments.map((c) => [c.id, c]));

  return catchmentMap.catchments
    .map((entry) => {
      if (!entry.path) return null;
      const ct = catchmentById[entry.id] || null;
      return {
        id: entry.id,
        name: entry.name,
        slug: ct?.slug || entry.id.replace(/_/g, "-"),
        status: entry.status || ct?.status,
        d: projectPathD(entry.path, catchmentMap.viewBox, targetBbox),
        catchment: ct,
        x: ct?.x,
        y: ct?.y,
      };
    })
    .filter(Boolean);
}

/**
 * Bounding box that fits country path plus all catchment/community geo points.
 */
export function getCountryDrillBBox(region, hub) {
  const countryBbox = region.pathEl.getBBox();
  let minX = countryBbox.x;
  let minY = countryBbox.y;
  let maxX = countryBbox.x + countryBbox.width;
  let maxY = countryBbox.y + countryBbox.height;

  const addPoint = (x, y) => {
    if (x == null || y == null) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };

  (hub?.catchments || []).forEach((ct) => {
    addPoint(ct.x, ct.y);
    (ct.communities || []).forEach((com) => addPoint(com.x, com.y));
  });

  const span = Math.max(maxX - minX, maxY - minY, 24);
  const pad = span * 0.22;

  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

export function getCatchmentDrillBBox(catchment, hub) {
  const points = [];
  if (catchment.x != null) points.push({ x: catchment.x, y: catchment.y });
  (catchment.communities || []).forEach((c) => {
    if (c.x != null) points.push({ x: c.x, y: c.y });
  });

  if (!points.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const span = Math.max(maxX - minX, maxY - minY, 18);
  const pad = Math.max(span * 0.28, 22);

  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}
