/**
 * One-time generator: Natural Earth country shapes → data/map-paths.json
 * Run: node scripts/generate-map-paths.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "map-paths.json");

const AFRICA_ISO = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI",
  "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR",
  "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN",
  "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW",
]);

const BOUNDS = { minLon: -18, maxLon: 54, minLat: -35.5, maxLat: 38 };
const OUT_SIZE = 1000;
const PAD = 28;

function rawProject(lon, lat) {
  const x = (lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon);
  const y = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat);
  return [x, y];
}

function collectRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

function ringToPath(ring) {
  if (!ring.length) return "";
  return ring.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
}

function geometryToPath(geometry, scale, offset) {
  const toPt = ([lon, lat]) => {
    const [rx, ry] = rawProject(lon, lat);
    const x = Math.round((offset.x + rx * scale) * 10) / 10;
    const y = Math.round((offset.y + ry * scale) * 10) / 10;
    return [x, y];
  };

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring.map(toPt))).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poly) => poly.map((ring) => ringToPath(ring.map(toPt))).join(" "))
      .join(" ");
  }
  return "";
}

function geometryCentroid(geometry, scale, offset) {
  const ring = collectRings(geometry)[0];
  if (!ring?.length) return [OUT_SIZE / 2, OUT_SIZE / 2];
  let sx = 0;
  let sy = 0;
  ring.forEach(([lon, lat]) => {
    const [rx, ry] = rawProject(lon, lat);
    sx += offset.x + rx * scale;
    sy += offset.y + ry * scale;
  });
  return [Math.round(sx / ring.length), Math.round(sy / ring.length)];
}

const LOCAL_GEO = path.join(__dirname, "countries.geojson");

let geo;
if (fs.existsSync(LOCAL_GEO)) {
  console.log("Reading local", LOCAL_GEO);
  geo = JSON.parse(fs.readFileSync(LOCAL_GEO, "utf8"));
} else {
  const url =
    "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson";
  console.log("Fetching", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  geo = await res.json();
}

const africaFeatures = geo.features.filter((feature) => {
  const iso =
    feature.properties?.["ISO3166-1-Alpha-2"] ||
    feature.properties?.["ISO_A2_EH"] ||
    feature.properties?.["ISO_A2"] ||
    feature.id;
  return iso && AFRICA_ISO.has(iso);
});

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

for (const feature of africaFeatures) {
  for (const ring of collectRings(feature.geometry)) {
    for (const [lon, lat] of ring) {
      const [x, y] = rawProject(lon, lat);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const spanX = maxX - minX;
const spanY = maxY - minY;
const inner = OUT_SIZE - PAD * 2;
const scale = Math.min(inner / spanX, inner / spanY);
const offset = {
  x: PAD - minX * scale + (inner - spanX * scale) / 2,
  y: PAD - minY * scale + (inner - spanY * scale) / 2,
};

const paths = {};
const centroids = {};

for (const feature of africaFeatures) {
  const iso = feature.properties?.["ISO3166-1-Alpha-2"] || feature.id;
  const d = geometryToPath(feature.geometry, scale, offset);
  if (!d) continue;
  paths[iso] = d;
  centroids[iso] = geometryCentroid(feature.geometry, scale, offset);
}

const output = {
  viewBox: `0 0 ${OUT_SIZE} ${OUT_SIZE}`,
  paths,
  centroids,
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
console.log(`Wrote ${Object.keys(paths).length} countries → ${OUT}`);
