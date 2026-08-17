/**
 * Google Maps–style hybrid: Esri satellite + OpenFreeMap roads, borders, places, POIs.
 *
 * Country view: satellite, thin white borders, city/country labels.
 * Catchment / community: local streets, route shields, named roads, POIs.
 */

const ESRI_ATTRIBUTION =
  "Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, AeroGRID, IGN, IGP, and the GIS User Community";
const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

const FONT = ["Noto Sans Regular"];
const FONT_BOLD = ["Noto Sans Bold"];
const LABEL = "#f7f7f7";
const HALO = "rgba(20, 24, 28, 0.92)";
const ROAD = "#f4f4f0";
const ROAD_CASING = "rgba(18, 22, 26, 0.72)";
const MAJOR_ROAD = "#fff7d6";

function nameField(multiline = true) {
  return [
    "coalesce",
    ["get", "name:en"],
    ["get", "name_en"],
    ["get", "name:latin"],
    ["get", "name"],
  ];
}

function lineGeom() {
  return ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false];
}

function pointGeom() {
  return ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false];
}

function roadFilter(classes, { skipTunnel = true } = {}) {
  const parts = [lineGeom(), ["match", ["get", "class"], classes, true, false]];
  if (skipTunnel) parts.push(["!=", ["get", "brunnel"], "tunnel"]);
  return ["all", ...parts];
}

function roadLine(id, { minzoom = 0, filter, color, opacity = 0.92, widthStops, dasharray }) {
  const paint = {
    "line-color": color,
    "line-opacity": opacity,
    "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], ...widthStops],
  };
  if (dasharray) paint["line-dasharray"] = dasharray;
  return {
    id,
    type: "line",
    source: "openmaptiles",
    "source-layer": "transportation",
    minzoom,
    filter,
    layout: { "line-cap": "round", "line-join": "round" },
    paint,
  };
}

function poiLayer(id, minzoom, extraFilter, { iconSize = 0.9, textSize = 11 } = {}) {
  return {
    id,
    type: "symbol",
    source: "openmaptiles",
    "source-layer": "poi",
    minzoom,
    filter: ["all", pointGeom(), extraFilter],
    layout: {
      "icon-image": ["to-string", ["get", "class"]],
      "icon-size": iconSize,
      "icon-optional": true,
      "icon-allow-overlap": false,
      "text-field": nameField(),
      "text-font": FONT,
      "text-size": textSize,
      "text-anchor": "top",
      "text-offset": [0, 0.7],
      "text-max-width": 9,
      "text-optional": true,
      "text-padding": 2,
    },
    paint: {
      "text-color": LABEL,
      "text-halo-color": HALO,
      "text-halo-width": 1.15,
      "icon-opacity": 0.95,
    },
  };
}

export function buildAfricaMapStyle() {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
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
        id: "boundary-country",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        minzoom: 3,
        filter: [
          "all",
          ["==", ["get", "admin_level"], 2],
          ["!=", ["get", "maritime"], 1],
          ["!=", ["get", "disputed"], 1],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.55, 5, 0.9, 10, 0.75],
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 5, 1, 8, 1.35, 12, 1.8],
        },
      },
      {
        id: "boundary-admin",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        minzoom: 6,
        filter: [
          "all",
          [">=", ["get", "admin_level"], 3],
          ["<=", ["get", "admin_level"], 6],
          ["!=", ["get", "maritime"], 1],
          ["!=", ["get", "disputed"], 1],
        ],
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.45,
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 10, 0.8, 13, 1.1],
          "line-dasharray": [2, 1.5],
        },
      },
      roadLine("roads-path-casing", {
        minzoom: 14,
        filter: roadFilter(["path", "pedestrian", "footway"]),
        color: ROAD_CASING,
        opacity: 0.45,
        widthStops: [14, 1.2, 16, 2.2, 18, 3],
        dasharray: [1.4, 1.2],
      }),
      roadLine("roads-minor-casing", {
        minzoom: 12,
        filter: roadFilter(["minor", "service", "track"]),
        color: ROAD_CASING,
        opacity: 0.7,
        widthStops: [12, 1.4, 14, 3.2, 16, 6, 18, 10],
      }),
      roadLine("roads-secondary-casing", {
        minzoom: 8,
        filter: roadFilter(["secondary", "tertiary"]),
        color: ROAD_CASING,
        opacity: 0.75,
        widthStops: [8, 1.4, 11, 3, 14, 6, 16, 9, 18, 13],
      }),
      roadLine("roads-major-casing", {
        minzoom: 5,
        filter: roadFilter(["motorway", "trunk", "primary"]),
        color: ROAD_CASING,
        opacity: 0.8,
        widthStops: [5, 1.6, 8, 3.2, 11, 5.5, 14, 9, 16, 13, 18, 18],
      }),
      roadLine("roads-path", {
        minzoom: 14,
        filter: roadFilter(["path", "pedestrian", "footway"]),
        color: "#e6e2d8",
        opacity: 0.7,
        widthStops: [14, 0.5, 16, 1, 18, 1.6],
        dasharray: [1.4, 1.2],
      }),
      roadLine("roads-minor", {
        minzoom: 12,
        filter: roadFilter(["minor", "service", "track"]),
        color: ROAD,
        opacity: 0.95,
        widthStops: [12, 0.6, 14, 1.8, 16, 3.6, 18, 6.5],
      }),
      roadLine("roads-secondary", {
        minzoom: 8,
        filter: roadFilter(["secondary", "tertiary"]),
        color: ROAD,
        opacity: 0.96,
        widthStops: [8, 0.6, 11, 1.6, 14, 3.4, 16, 5.5, 18, 8.5],
      }),
      roadLine("roads-major", {
        minzoom: 5,
        filter: roadFilter(["motorway", "trunk", "primary"]),
        color: MAJOR_ROAD,
        opacity: 0.98,
        widthStops: [5, 0.7, 8, 1.6, 11, 3, 14, 5.2, 16, 8, 18, 12],
      }),
      {
        id: "place-country",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 3,
        maxzoom: 8.5,
        filter: ["==", ["get", "class"], "country"],
        layout: {
          "text-field": nameField(),
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 3, 13, 5, 18, 7, 22],
          "text-letter-spacing": 0.04,
          "text-max-width": 8,
          "text-padding": 4,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.4,
        },
      },
      {
        id: "place-city-capital",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 4,
        filter: ["all", ["==", ["get", "class"], "city"], ["==", ["get", "capital"], 2]],
        layout: {
          "icon-image": "circle_11_black",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 4, 0.35, 8, 0.22],
          "icon-optional": true,
          "text-field": nameField(),
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 7, 14, 11, 18],
          "text-anchor": "bottom",
          "text-offset": [0, -0.35],
          "text-max-width": 8,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.25,
        },
      },
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 4.5,
        filter: ["all", ["==", ["get", "class"], "city"], ["!=", ["get", "capital"], 2]],
        layout: {
          "icon-image": "circle_11_black",
          "icon-size": 0.22,
          "icon-optional": true,
          "text-field": nameField(),
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 13, 12, 16],
          "text-anchor": "bottom",
          "text-offset": [0, -0.3],
          "text-max-width": 8,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.2,
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
          "icon-image": "circle_11_black",
          "icon-size": 0.16,
          "icon-optional": true,
          "text-field": nameField(),
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 7, 10, 11, 13, 14, 14],
          "text-anchor": "bottom",
          "text-offset": [0, -0.25],
          "text-max-width": 8,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.1,
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
          "text-field": nameField(),
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 13, 12, 16, 13],
          "text-max-width": 8,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.05,
        },
      },
      {
        id: "road-shield",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 9,
        filter: [
          "all",
          lineGeom(),
          ["has", "ref"],
          ["<=", ["get", "ref_length"], 6],
        ],
        layout: {
          "icon-image": ["concat", "road_", ["to-string", ["get", "ref_length"]]],
          "icon-optional": true,
          "icon-rotation-alignment": "viewport",
          "symbol-placement": ["step", ["zoom"], "point", 12, "line"],
          "symbol-spacing": 220,
          "text-field": ["to-string", ["get", "ref"]],
          "text-font": FONT_BOLD,
          "text-size": 10,
          "text-rotation-alignment": "viewport",
        },
        paint: {
          "text-color": "#1c1c1c",
          "text-halo-color": "#ffffff",
          "text-halo-width": 0.4,
        },
      },
      {
        id: "road-label-major",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 11.5,
        filter: [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false,
        ],
        layout: {
          "symbol-placement": "line",
          "text-field": nameField(),
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 13],
          "text-max-angle": 28,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1.1,
        },
      },
      {
        id: "road-label-minor",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 14,
        filter: ["match", ["get", "class"], ["minor", "service", "track"], true, false],
        layout: {
          "symbol-placement": "line",
          "text-field": nameField(),
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 14, 9, 17, 12],
          "text-max-angle": 30,
        },
        paint: {
          "text-color": LABEL,
          "text-halo-color": HALO,
          "text-halo-width": 1,
        },
      },
      poiLayer(
        "poi-priority",
        13,
        ["match", ["get", "class"], ["hospital", "school", "college", "university", "clinic"], true, false],
        { iconSize: 0.95, textSize: 11.5 }
      ),
      poiLayer(
        "poi-local",
        14.5,
        [
          "match",
          ["get", "class"],
          ["shop", "grocery", "supermarket", "clothes", "laundry", "fuel", "religious", "place_of_worship", "stadium", "pitch", "park"],
          true,
          false,
        ],
        { iconSize: 0.82, textSize: 10.5 }
      ),
      poiLayer("poi-rest", 15.5, [">=", ["get", "rank"], 1], { iconSize: 0.75, textSize: 10 }),
    ],
  };
}
