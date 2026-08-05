/**
 * Affine lat/lng → SVG projection calibrated to map-paths.json centroids.
 */

const CALIBRATION = [
  { lng: 37.91, lat: -0.02, x: 702, y: 446 },
  { lng: 34.89, lat: -6.37, x: 678, y: 527 },
  { lng: 34.3, lat: -13.25, x: 659, y: 584 },
  { lng: 27.85, lat: -13.15, x: 598, y: 586 },
  { lng: 40.49, lat: 9.15, x: 707, y: 356 },
  { lng: 29.36, lat: -3.37, x: 616, y: 482 },
  { lng: 29.87, lat: -1.94, x: 616, y: 470 },
  { lng: -7.09, lat: 31.79, x: 201, y: 142 },
  { lng: 22.94, lat: -30.56, x: 548, y: 750 },
  { lng: -14.45, lat: 14.5, x: 142, y: 305 },
  { lng: 30.8, lat: 26.82, x: 580, y: 210 },
  { lng: 3.05, lat: 6.52, x: 380, y: 400 },
];

function fitAffine(points, field) {
  let s11 = 0;
  let s12 = 0;
  let s13 = 0;
  let s22 = 0;
  let s23 = 0;
  const s33 = points.length;
  let t1 = 0;
  let t2 = 0;
  let t3 = 0;

  for (const p of points) {
    s11 += p.lng * p.lng;
    s12 += p.lng * p.lat;
    s13 += p.lng;
    s22 += p.lat * p.lat;
    s23 += p.lat;
    const v = p[field];
    t1 += p.lng * v;
    t2 += p.lat * v;
    t3 += v;
  }

  const m = [
    [s11, s12, s13, t1],
    [s12, s22, s23, t2],
    [s13, s23, s33, t3],
  ];

  for (let i = 0; i < 3; i++) {
    let piv = i;
    for (let r = i + 1; r < 3; r++) {
      if (Math.abs(m[r][i]) > Math.abs(m[piv][i])) piv = r;
    }
    [m[i], m[piv]] = [m[piv], m[i]];
    for (let r = i + 1; r < 3; r++) {
      const f = m[r][i] / m[i][i];
      for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c];
    }
  }

  const out = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    out[i] = m[i][3];
    for (let j = i + 1; j < 3; j++) out[i] -= m[i][j] * out[j];
    out[i] /= m[i][i];
  }
  return out;
}

const X_PARAMS = fitAffine(CALIBRATION, "x");
const Y_PARAMS = fitAffine(CALIBRATION, "y");

export function latLngToSvg(lng, lat) {
  return {
    x: X_PARAMS[0] * lng + X_PARAMS[1] * lat + X_PARAMS[2],
    y: Y_PARAMS[0] * lng + Y_PARAMS[1] * lat + Y_PARAMS[2],
  };
}

export function attachGeoPoint(entity, loc) {
  if (!loc || loc.lat == null || loc.lng == null) return entity;
  const { x, y } = latLngToSvg(loc.lng, loc.lat);
  return { ...entity, lat: loc.lat, lng: loc.lng, x, y };
}
