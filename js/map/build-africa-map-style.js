/**
 * Esri satellite base + subtle OpenFreeMap vector overlay (roads, places, street grid).
 */

const ESRI_ATTRIBUTION =
  "Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, AeroGRID, IGN, IGP, and the GIS User Community";
const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

const LABEL_FONT = ["Noto Sans Regular"];
const LABEL_HALO = "#1a2433";
const ROAD_HALO = "#1a2433";

function labelField() {
  return ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name"]];
}

function roadLine(id, {
  minzoom = 0,
  maxzoom = 24,
  filter,
  color = "#f0ebe3",
  opacity = 0.5,
  widthStops,
  dasharray,
}) {
  const paint = {
    "line-color": color,
    "line-opacity": opacity,
    "line-width": ["interpolate", ["linear"], ["zoom"], ...widthStops],
  };
  if (dasharray) paint["line-dasharray"] = dasharray;
  return {
    id,
    type: "line",
    source: "openmaptiles",
    "source-layer": "transportation",
    minzoom,
    maxzoom,
    filter,
    layout: { "line-cap": "round", "line-join": "round" },
    paint,
  };
}

export function buildAfricaMapStyle() {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: ESRI_ATTRIBUTION,
      },
      openmaptiles: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
        maxzoom: 14,
        attribution: OSM_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
        paint: { "raster-opacity": 1, "raster-fade-duration": 0 },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": "#3d7ab8", "fill-opacity": 0.22 },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        minzoom: 8,
        filter: [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false,
        ],
        paint: {
          "line-color": "#7eb8e8",
          "line-opacity": 0.45,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 12, 1.2, 16, 2],
        },
      },
      roadLine("roads-major-casing", {
        minzoom: 5,
        filter: [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary"],
          true,
          false,
        ],
        color: ROAD_HALO,
        opacity: 0.35,
        widthStops: [5, 1.2, 8, 2, 12, 4, 16, 8],
      }),
      roadLine("roads-major", {
        minzoom: 5,
        filter: [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary"],
          true,
          false,
        ],
        color: "#f2ece4",
        opacity: 0.58,
        widthStops: [5, 0.6, 8, 1.2, 12, 2.2, 16, 5],
      }),
      roadLine("roads-secondary", {
        minzoom: 8,
        filter: [
          "match",
          ["get", "class"],
          ["secondary", "tertiary"],
          true,
          false,
        ],
        color: "#e8e0d6",
        opacity: 0.48,
        widthStops: [8, 0.4, 11, 1, 14, 2, 16, 3.5],
      }),
      roadLine("roads-minor", {
        minzoom: 11,
        filter: ["==", ["get", "class"], "minor"],
        color: "#ddd6cc",
        opacity: 0.42,
        widthStops: [11, 0.35, 13, 0.8, 16, 2.5],
      }),
      roadLine("roads-service", {
        minzoom: 13,
        filter: [
          "match",
          ["get", "class"],
          ["service", "track"],
          true,
          false,
        ],
        color: "#d0c8be",
        opacity: 0.36,
        widthStops: [13, 0.3, 15, 0.7, 17, 1.4],
      }),
      roadLine("roads-path", {
        minzoom: 14,
        filter: [
          "match",
          ["get", "class"],
          ["path", "pedestrian", "footway"],
          true,
          false,
        ],
        color: "#c8c0b6",
        opacity: 0.3,
        widthStops: [14, 0.25, 16, 0.6, 18, 1],
        dasharray: [1.5, 1.5],
      }),
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 5,
        filter: ["==", ["get", "class"], "city"],
        layout: {
          "text-field": labelField(),
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 13, 12, 16],
          "text-anchor": "center",
          "text-max-width": 8,
        },
        paint: {
          "text-color": "#f4f4f4",
          "text-halo-color": LABEL_HALO,
          "text-halo-width": 1.2,
          "text-opacity": 0.88,
        },
      },
      {
        id: "place-town",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 7,
        filter: ["==", ["get", "class"], "town"],
        layout: {
          "text-field": labelField(),
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 7, 9, 10, 11, 14, 13],
          "text-anchor": "center",
          "text-max-width": 8,
        },
        paint: {
          "text-color": "#ececec",
          "text-halo-color": LABEL_HALO,
          "text-halo-width": 1.1,
          "text-opacity": 0.82,
        },
      },
      {
        id: "place-village",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 10,
        filter: [
          "match",
          ["get", "class"],
          ["village", "suburb", "hamlet", "neighbourhood"],
          true,
          false,
        ],
        layout: {
          "text-field": labelField(),
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 10, 8, 13, 10, 16, 11],
          "text-anchor": "center",
          "text-max-width": 7,
        },
        paint: {
          "text-color": "#e0e0e0",
          "text-halo-color": LABEL_HALO,
          "text-halo-width": 1,
          "text-opacity": 0.75,
        },
      },
      {
        id: "road-label-major",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 12,
        filter: [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false,
        ],
        layout: {
          "symbol-placement": "line",
          "text-field": labelField(),
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 9, 16, 11],
          "text-max-angle": 30,
        },
        paint: {
          "text-color": "#e8e4dc",
          "text-halo-color": LABEL_HALO,
          "text-halo-width": 1,
          "text-opacity": 0.7,
        },
      },
      {
        id: "road-label-minor",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 14,
        filter: [
          "match",
          ["get", "class"],
          ["minor", "service", "track"],
          true,
          false,
        ],
        layout: {
          "symbol-placement": "line",
          "text-field": labelField(),
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 14, 8, 17, 10],
          "text-max-angle": 30,
        },
        paint: {
          "text-color": "#d8d4cc",
          "text-halo-color": LABEL_HALO,
          "text-halo-width": 0.9,
          "text-opacity": 0.62,
        },
      },
    ],
  };
}
