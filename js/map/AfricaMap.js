/**
 * AfricaMap — interactive PA network map on Esri satellite hybrid (MapLibre).
 *
 * Drill-down: Africa → Country → Catchment → Community
 * Global view uses CSS overzoom; drill-down uses native zoom at overzoom scale 1.
 */

import { buildDrillDownData, PA_SLUGS } from "./utils/drill-down-data.js";
import { CommunityFactSheet } from "./components/CommunityFactSheet.js";
import { PosterText } from "./PosterText.js";
import {
  computeOverzoomScale,
  formatCoordinates,
  ZOOM_LEVELS,
  FLY_DURATION_MS,
  AFRICA_CENTER,
  getEffectiveContainerPx,
  resolveZoomBounds,
  zoomForDistance,
  flyToDistance,
  preserveDistanceOnResize,
} from "./africa-map-surface.js";
import { buildCatchmentGeoFeatures } from "./drill-layers.js";
import { buildAfricaMapStyle } from "./build-africa-map-style.js";
import { CatchmentTags } from "./CatchmentTags.js";
import { CommunityTags } from "./CommunityTags.js";

const GEO_URL = "data/africa-countries.geojson";
const THEME_BG = "#0A1628";
const THEME_TEXT = "#D6B352";
const PA_FILL = "#C99C37";
const PA_BORDER = "#D6B352";
const PA_BORDER_BRIGHT = "#F0D878";
const NON_PA_FILL = "#0D1C2F";
const NON_PA_BORDER = "#1E2D42";
const PA_SLUG_LIST = [...PA_SLUGS];
const ACTIVE_GOLD = "#C99C37";
const ACTIVE_GOLD_BRIGHT = "#F0D878";
const INACTIVE_BORDER = "#2A3A52";

// Zoom-aware line-width for active (in-network) vs inactive borders
const COUNTRY_ACTIVE_WIDTH = [
  "interpolate", ["linear"], ["zoom"],
  2, ["case", ["==", ["get", "in_network"], true], 3.0, 0.35],
  4, ["case", ["==", ["get", "in_network"], true], 3.4, 0.45],
  6, ["case", ["==", ["get", "in_network"], true], 3.8, 0.55],
  9, ["case", ["==", ["get", "in_network"], true], 4.2, 0.7],
];
const COUNTRY_ACTIVE_OPACITY = [
  "interpolate", ["linear"], ["zoom"],
  2, ["case", ["==", ["get", "in_network"], true], 1.0, 0.28],
  6, ["case", ["==", ["get", "in_network"], true], 1.0, 0.35],
];
const COUNTRY_ACTIVE_DASH = [
  "case", ["==", ["get", "in_network"], true], ["literal", [1, 0]], ["literal", [3, 2]]
];

function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function fmt(n) {
  return (n ?? 0).toLocaleString();
}

function kpi(label, value, accent) {
  return `<div class="tk-kpi"><span class="tk-kpi-v"${accent ? ` style="color:${accent}"` : ""}>${value}</span><span class="tk-kpi-l">${label}</span></div>`;
}

let geoCache = null;

function loadAfricaGeo() {
  if (geoCache) return Promise.resolve(geoCache);
  return fetch(GEO_URL)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      geoCache = d;
      return d;
    });
}

function enrichCountryGeo(geo, byCountry = {}) {
  if (!geo?.features) return geo;
  return {
    ...geo,
    features: geo.features.map((feature) => {
      const slug = feature.properties?.slug;
      const inNetwork =
        feature.properties?.isPaNetwork === true ||
        feature.properties?.in_network === true ||
        PA_SLUGS.has(slug) ||
        Boolean(byCountry[slug]);
      return {
        ...feature,
        properties: {
          ...feature.properties,
          in_network: inNetwork,
        },
      };
    }),
  };
}

export class AfricaMap {
  constructor() {
    this.map = null;
    this.selected = { level: "africa", slug: null };
    this.els = {};
    this._destroyed = false;
    this.overzoomScale = computeOverzoomScale(800);
    this._effectiveContainerPx = getEffectiveContainerPx(800, this.overzoomScale);
    this._countryHandlersBound = false;
    this._catchmentHandlersBound = false;
    this._selectedCountrySlug = null;
    this._selectedCatchmentId = null;
    this._catchmentFeatures = [];
    this.catchmentTags = null;
    this.communityTags = null;
    this._catchmentTagsHub = null;
    this._catchmentTagsRendered = false;
  }

  mount({ root, data }) {
    if (typeof maplibregl === "undefined") {
      console.warn("[AfricaMap] maplibre-gl not loaded");
      this.showMapError(root, "Map library failed to load. Check your network connection and refresh.");
      return null;
    }
    if (!root) return null;
    if (root.childElementCount) root.innerHTML = "";

    this.root = root;
    this.root.classList.add("africa-map-host");
    this.charts = data.charts;
    this.countryHubs = data.countryHubs;
    this.mapPaths = data.mapPaths;
    this.drill = buildDrillDownData({
      countries: data.countries,
      catchments: data.catchments,
      communities: data.communities,
      countryHubs: data.countryHubs,
      mapPaths: data.mapPaths,
      geoLocations: data.geoLocations,
    });

    const stage = document.createElement("div");
    stage.className = "africa-map__stage";
    const overzoom = document.createElement("div");
    overzoom.className = "africa-map__overzoom";
    const mapEl = document.createElement("div");
    mapEl.className = "africa-map__canvas";
    overzoom.appendChild(mapEl);
    stage.appendChild(overzoom);
    root.appendChild(stage);

    this.els.stage = stage;
    this.els.overzoom = overzoom;
    this.els.mapEl = mapEl;

    this.applyOverzoomLayout();

    this.buildGradients();
    this.buildPanel();
    this.buildBreadcrumb();
    this.buildLegend();
    this.attachWheelGuard();
    this.attachResizeObserver();

    this.posterOverlay = new PosterText(root, {
      textColor: THEME_TEXT,
      landColor: THEME_BG,
    });
    this.posterOverlay.mount();
    this.posterOverlay.reset();
    this.updateVisualMode();

    this.factSheet = new CommunityFactSheet(root, {
      charts: this.charts,
      countryHubs: this.countryHubs,
    });
    this.factSheet.mount();

    void this.initMap(mapEl).catch((err) => {
      console.error("[AfricaMap] init failed:", err);
      this.showMapError(this.root, err?.message || "Map failed to initialize");
    });

    window.__paAfricaMap = this;
    return this;
  }

  showMapError(host, message) {
    if (!host) return;
    host.innerHTML = `<div class="tk-map-error"><p>${escapeHtml(message)}</p><button type="button" onclick="location.reload()">Reload page</button></div>`;
  }

  async initMap(mapEl) {
    const workerPath = "vendor/maplibre/maplibre-gl-csp-worker.js";
    if (typeof maplibregl.setWorkerUrl === "function") {
      maplibregl.setWorkerUrl(workerPath);
    }

    const initialStyle = buildAfricaMapStyle();

    if (this._destroyed) return;

    const containerPx = this.root?.clientWidth || 800;
    this.overzoomScale = computeOverzoomScale(containerPx);
    this.applyOverzoomLayout();
    this._effectiveContainerPx = getEffectiveContainerPx(containerPx, this.overzoomScale);

    const initBounds = resolveZoomBounds(AFRICA_CENTER.lat, this._effectiveContainerPx);
    const initZoom = zoomForDistance(
      ZOOM_LEVELS.global,
      AFRICA_CENTER.lat,
      this._effectiveContainerPx
    );

    this.map = new maplibregl.Map({
      container: mapEl,
      style: initialStyle,
      center: [AFRICA_CENTER.lon, AFRICA_CENTER.lat],
      zoom: initZoom,
      minZoom: initBounds.minZoom,
      maxZoom: initBounds.maxZoom,
      attributionControl: false,
      scrollZoom: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    this.map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    this.map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
    this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    this._buildRecenterButton();

    this.catchmentTags = new CatchmentTags(this.map, {
      onSelect: (ct, hub) => this.selectCatchment(hub, ct),
    });
    this.communityTags = new CommunityTags(this.map, {
      onSelect: (com, ct, country) => this.selectCommunity(com, ct, country),
    });

    this.map.on("click", (e) => {
      const hit = e.originalEvent?.target?.closest?.(
        ".maplibregl-marker, .maplibregl-popup, .tk-panel, .tk-breadcrumb, .map-factsheet, .tk-catchment-tag, .tk-community-tag, .tk-marker-anchor, .tk-marker-scale"
      );
      if (hit) return;

      const drillLayers = [
        "pa-countries-fill",
        "pa-countries-line",
        "pa-catchments-fill",
        "pa-catchments-line",
        "catchments-clusters",
        "catchments-points-hit",
        "communities-clusters",
        "communities-points-hit",
      ].filter((id) => this.map.getLayer(id));

      if (drillLayers.length) {
        const feats = this.map.queryRenderedFeatures(e.point, { layers: drillLayers });
        if (feats.length) return;
      }

      if (this.selected.level !== "africa") this.clearSelection();
    });

    this.map.on("moveend", () => this.syncSurface());
    this.map.on("zoomend", () => this.syncSurface());

    this.map.on("load", () => {
      if (this._destroyed) return;
      requestAnimationFrame(() => {
        this.map?.resize();
        loadAfricaGeo()
          .then((geo) => this.renderCountries(geo))
          .catch(() => (this.panelEl().innerHTML = "<p class='tk-muted'>Map data unavailable.</p>"));
        this.syncSurface();
      });
    });
  }

  _resolveOverzoomScale(containerPx) {
    if (this.selected?.level && this.selected.level !== "africa") return 1;
    return computeOverzoomScale(containerPx);
  }

  _refreshOverzoomLayout({ preserveDistance = true } = {}) {
    const px = this.root?.clientWidth || 800;
    const prevEffective = this._effectiveContainerPx;
    const lat = this.map?.getCenter()?.lat ?? AFRICA_CENTER.lat;
    const prevScale = this.overzoomScale;
    this.overzoomScale = this._resolveOverzoomScale(px);
    this.applyOverzoomLayout();
    this._effectiveContainerPx = getEffectiveContainerPx(px, this.overzoomScale);
    if (
      this.map &&
      (prevScale !== this.overzoomScale || prevEffective !== this._effectiveContainerPx)
    ) {
      const bounds = resolveZoomBounds(lat, this._effectiveContainerPx);
      this.map.setMinZoom(bounds.minZoom);
      this.map.setMaxZoom(bounds.maxZoom);
      this.map.resize();
      if (preserveDistance) {
        preserveDistanceOnResize(this.map, {
          lat,
          previousEffectivePx: prevEffective,
          nextEffectivePx: this._effectiveContainerPx,
        });
      }
      this.map.triggerRepaint?.();
    }
  }

  applyOverzoomLayout() {
    const scale = this.overzoomScale;
    const overzoom = this.els.overzoom;
    if (!overzoom) return;
    if (scale <= 1) {
      overzoom.style.width = "100%";
      overzoom.style.height = "100%";
      overzoom.style.transform = "";
      overzoom.style.transformOrigin = "";
      return;
    }
    overzoom.style.width = `${scale * 100}%`;
    overzoom.style.height = `${scale * 100}%`;
    overzoom.style.transform = `scale(${1 / scale})`;
    overzoom.style.transformOrigin = "top left";
  }

  attachResizeObserver() {
    if (typeof ResizeObserver === "undefined") return;
    let resizeTimer = null;
    this._resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const px = this.root?.clientWidth || 800;
        const prevEffective = this._effectiveContainerPx;
        const center = this.map?.getCenter();
        const lat = center?.lat ?? AFRICA_CENTER.lat;

        this.overzoomScale = this._resolveOverzoomScale(px);
        this.applyOverzoomLayout();
        this._effectiveContainerPx = getEffectiveContainerPx(px, this.overzoomScale);

        if (this.map) {
          const bounds = resolveZoomBounds(lat, this._effectiveContainerPx);
          this.map.setMinZoom(bounds.minZoom);
          this.map.setMaxZoom(bounds.maxZoom);
          this.map.resize();
          preserveDistanceOnResize(this.map, {
            lat,
            previousEffectivePx: prevEffective,
            nextEffectivePx: this._effectiveContainerPx,
          });
          this.map.triggerRepaint?.();
          this.syncSurface();
        }
      }, 120);
    });
    this._resizeObserver.observe(this.root);
  }

  getViewState() {
    const center = this.map?.getCenter();
    const containerPx = this.root?.clientWidth || 800;
    return {
      lat: center?.lat ?? AFRICA_CENTER.lat,
      lon: center?.lng ?? AFRICA_CENTER.lon,
      zoom: this.map?.getZoom() ?? 2.4,
      containerPx,
      overzoomScale: this.overzoomScale,
      effectiveContainerPx: getEffectiveContainerPx(containerPx, this.overzoomScale),
    };
  }

  syncSurface() {
    if (!this.map) return;
    const view = this.getViewState();
    const bounds = resolveZoomBounds(view.lat, view.effectiveContainerPx);
    this.map.setMinZoom(bounds.minZoom);
    this.map.setMaxZoom(bounds.maxZoom);
    this.updatePosterCoords(view.lat, view.lon);
    this.updateNavigationLevel(view);
    this.ensureDrillLayers();
  }

  ensureDrillLayers() {
    if (!this.map || this._ensureDrillLayersBusy) return;
    if (this.selected.level === "country" && this.selected.country) {
      const needsLayers = !this.map.getLayer("pa-catchments-fill");
      if (needsLayers || !this._catchmentTagsRendered) {
        this._ensureDrillLayersBusy = true;
        this.renderCatchmentPolygons(this.selected.country);
        this._ensureDrillLayersBusy = false;
      }
    } else if (
      (this.selected.level === "catchment" || this.selected.level === "community") &&
      this.selected.ct &&
      this.selected.country
    ) {
      if (!this.map.getLayer("pa-catchments-fill")) {
        this.renderCatchmentPolygons(this.selected.country);
      }
      const commCount = document.querySelectorAll(".tk-community-tag").length;
      if (commCount === 0) this.renderCommunities(this.selected.ct);
    }
  }

  updateNavigationLevel(view) {
    if (!this.els.levelBadge) return;
    const byLevel = {
      africa: "Global view",
      country: "Country view",
      catchment: "Catchment view",
      community: "Community view",
    };
    this.els.levelBadge.textContent = byLevel[this.selected.level] || "Global view";
    this.updateVisualMode();
  }

  updateVisualMode() {
    if (!this.root) return;
    const level = this.selected.level;
    this.root.classList.remove(
      "tk-view-africa",
      "tk-view-global",
      "tk-view-country",
      "tk-view-catchment",
      "tk-view-community",
      "tk-view-satellite"
    );
    this.root.classList.add(`tk-view-${level}`);
    if (level !== "africa") this.root.classList.add("tk-view-satellite");
    this._refreshOverzoomLayout();
  }

  updatePosterCoords(lat, lon) {
    if (!this.posterOverlay?.coordsEl) return;
    this.posterOverlay.coordsEl.textContent = formatCoordinates(lat, lon);
  }

  panelEl() {
    return this.els.panelBody;
  }

  _restoreMarkers() {
    if (this.selected.level === "country" && this.selected.country) {
      this.renderCatchmentPolygons(this.selected.country);
    } else if (
      (this.selected.level === "catchment" || this.selected.level === "community") &&
      this.selected.ct &&
      this.selected.country
    ) {
      this.renderCommunities(this.selected.ct);
    }
  }

  renderCountries(geo) {
    if (!this.map) return;
    const enriched = enrichCountryGeo(geo, this.drill?.byCountry);
    this._pendingGeo = enriched;

    if (!this.map.isStyleLoaded()) return;

    if (!this.map.getSource("pa-countries")) {
      this.map.addSource("pa-countries", { type: "geojson", data: enriched });

      this.map.addLayer({
        id: "pa-countries-fill",
        type: "fill",
        source: "pa-countries",
        maxzoom: 9,
        paint: {
          "fill-color": "#0D1C2F",
          "fill-opacity": 0.0,
        },
      });

      // Thick gold casing for PA network countries at global zoom
      this.map.addLayer({
        id: "pa-countries-line-casing",
        type: "line",
        source: "pa-countries",
        maxzoom: 9,
        filter: ["==", ["get", "in_network"], true],
        paint: {
          "line-color": "#ffffff",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            2, 5.2,
            4, 5.8,
            6, 6.4,
            9, 7.0,
          ],
          "line-opacity": 0.9,
        },
      });

      this.map.addLayer({
        id: "pa-countries-line",
        type: "line",
        source: "pa-countries",
        maxzoom: 9,
        paint: {
          "line-color": [
            "case", ["==", ["get", "in_network"], true], ACTIVE_GOLD, INACTIVE_BORDER
          ],
          "line-width": COUNTRY_ACTIVE_WIDTH,
          "line-opacity": COUNTRY_ACTIVE_OPACITY,
          "line-dasharray": COUNTRY_ACTIVE_DASH,
        },
      });

      this._bindCountryHandlers();
    } else {
      this.map.getSource("pa-countries").setData(enriched);
    }

    if (this.selected.level === "africa" && !this._initialFitDone) {
      this.fitAfricaView();
      this._initialFitDone = true;
    }
  }

  _bindCountryHandlers() {
    if (this._countryHandlersBound || !this.map) return;
    this._countryHandlersBound = true;
    const byCountry = this.drill?.byCountry || {};

    this.map.on("mousemove", "pa-countries-fill", (e) => {
      if (this.selected.level !== "africa") return;
      const f = e.features?.[0];
      if (!f) return;
      this.map.getCanvas().style.cursor = "pointer";
      const slug = f.properties?.slug;
      const hub = byCountry[slug];
      if (hub) this.panel.showHover(hub, f.properties?.name);
      else this.panel.showPlain(f.properties?.name);
    });

    this.map.on("mouseleave", "pa-countries-fill", () => {
      this.map.getCanvas().style.cursor = "";
      if (this.selected.level === "africa") this.panel.reset();
    });

    this.map.on("click", "pa-countries-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const slug = f.properties?.slug;
      const hub = byCountry[slug];
      if (hub) this.selectCountry(slug, hub, f);
    });

    this.map.on("click", "pa-countries-line", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const slug = f.properties?.slug;
      const hub = byCountry[slug];
      if (hub) this.selectCountry(slug, hub, f);
    });
  }

  fitAfricaView() {
    if (!this.map) return;
    const view = this.getViewState();
    const geo = this._pendingGeo;
    if (geo?.features?.length) {
      let bounds = null;
      const flatten = (g, coords) => {
        if (g.type === "Polygon") coords.push(...g.coordinates[0]);
        else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => coords.push(...p[0]));
      };
      for (const feat of geo.features) {
        if (!feat.geometry) continue;
        const coords = [];
        flatten(feat.geometry, coords);
        for (const c of coords) {
          if (!bounds) bounds = new maplibregl.LngLatBounds(c, c);
          else bounds.extend(c);
        }
      }
      if (bounds) {
        const centerLat = bounds.getCenter().lat;
        const maxZoom = zoomForDistance(
          ZOOM_LEVELS.global,
          centerLat,
          view.effectiveContainerPx
        );
        this.map.fitBounds(bounds, {
          padding: { top: 52, bottom: 88, left: 36, right: 36 },
          duration: 800,
          maxZoom,
        });
        return;
      }
    }
    flyToDistance(this.map, {
      lon: AFRICA_CENTER.lon,
      lat: AFRICA_CENTER.lat,
      distanceMeters: ZOOM_LEVELS.global,
      effectiveContainerPx: view.effectiveContainerPx,
      duration: 800,
    });
  }

  countryBounds(slug) {
    const features = this._pendingGeo?.features;
    if (!features) {
      const src = this.map?.getSource("pa-countries");
      const data = src?._data || src?._options?.data;
      if (data?.features) return data.features.find((feat) => feat.properties?.slug === slug) || null;
      return null;
    }
    return features.find((feat) => feat.properties?.slug === slug) || null;
  }

  flyToFeature(feature, padding = 40, hub = null) {
    if (!feature || !this.map) return;
    const coords = [];
    const flatten = (g) => {
      if (g.type === "Polygon") coords.push(...g.coordinates[0]);
      else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => coords.push(...p[0]));
    };
    flatten(feature.geometry);
    (hub?.catchments || []).forEach((ct) => {
      if (ct.lng != null && ct.lat != null) coords.push([ct.lng, ct.lat]);
    });
    if (!coords.length) return;
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    const view = this.getViewState();
    const centerLat = bounds.getCenter().lat;
    const countryZoom = zoomForDistance(ZOOM_LEVELS.country, centerLat, view.effectiveContainerPx);
    this.map.fitBounds(bounds, {
      padding,
      duration: FLY_DURATION_MS,
      maxZoom: Math.max(countryZoom, 6.4),
    });
  }

  updateCountrySelectionNeutral() {
    if (!this.map?.getLayer("pa-countries-fill")) return;
    this.map.setPaintProperty("pa-countries-fill", "fill-color", "#0D1C2F");
    this.map.setPaintProperty("pa-countries-fill", "fill-opacity", 0.0);
    // Reset to data-driven expression by clearing overrides
    this.map.setPaintProperty("pa-countries-line", "line-color", [
      "case", ["==", ["get", "in_network"], true], ACTIVE_GOLD, INACTIVE_BORDER
    ]);
    this.map.setPaintProperty("pa-countries-line", "line-width", COUNTRY_ACTIVE_WIDTH);
    this.map.setPaintProperty("pa-countries-line", "line-opacity", COUNTRY_ACTIVE_OPACITY);
    this.map.setPaintProperty("pa-countries-line", "line-dasharray", COUNTRY_ACTIVE_DASH);
    if (this.selected.level === "africa" && this.map.getLayer("pa-countries-line-casing")) {
      this.map.setLayoutProperty("pa-countries-line-casing", "visibility", "visible");
    }
  }

  updateDrillHighlightMode() {
    if (!this.map) return;
    const showCatchmentGold = this.selected.level === "country";
    const showGlobalPaBorders = this.selected.level === "africa";

    ["pa-countries-line-casing", "pa-countries-line"].forEach((id) => {
      if (!this.map.getLayer(id)) return;
      this.map.setLayoutProperty(id, "visibility", showGlobalPaBorders ? "visible" : "none");
    });

    if (this.map.getLayer("pa-countries-fill")) {
      this.map.setPaintProperty("pa-countries-fill", "fill-opacity", 0.0);
    }

    ["pa-catchments-fill", "pa-catchments-line"].forEach((id) => {
      if (!this.map.getLayer(id)) return;
      this.map.setLayoutProperty(id, "visibility", showCatchmentGold ? "visible" : "none");
    });
  }

  updateCountrySelection(slug) {
    if (!this.map?.getLayer("pa-countries-fill")) return;
    this._selectedCountrySlug = slug || null;
    if (!slug) {
      this.updateCountrySelectionNeutral();
      return;
    }

    // Selected country: bright gold border, subtle gold wash
    const paFillOpacity = slug
      ? [
          "match",
          ["get", "slug"],
          slug,
          0.08,
          ...PA_SLUG_LIST.filter((s) => s !== slug).flatMap((s) => [s, 0.0]),
          0.0,
        ]
      : ["match", ["get", "slug"], ...PA_SLUG_LIST.flatMap((s) => [s, 0.04]), 0.0];

    const paLineWidth = slug
      ? [
          "match",
          ["get", "slug"],
          slug,
          3.5,
          ...PA_SLUG_LIST.filter((s) => s !== slug).flatMap((s) => [s, 0.8]),
          0.5,
        ]
      : ["match", ["get", "slug"], ...PA_SLUG_LIST.flatMap((s) => [s, 1.5]), 0.5];

    this.map.setPaintProperty("pa-countries-fill", "fill-opacity", 0.0);
    this.map.setPaintProperty("pa-countries-line", "line-width", paLineWidth);
    if (slug) {
      this.map.setPaintProperty("pa-countries-line", "line-color", [
        "match",
        ["get", "slug"],
        slug,
        "#F0D878",
        ...PA_SLUG_LIST.filter((s) => s !== slug).flatMap((s) => [s, "#6B5530"]),
        "#3D4A5C",
      ]);
      this.map.setPaintProperty("pa-countries-line", "line-opacity", [
        "match",
        ["get", "slug"],
        slug,
        0.95,
        ...PA_SLUG_LIST.filter((s) => s !== slug).flatMap((s) => [s, 0.4]),
        0.35,
      ]);
      this.map.setPaintProperty("pa-countries-fill", "fill-color", "#0D1C2F");
    } else {
      const paLine = [
        "match",
        ["get", "slug"],
        ...PA_SLUG_LIST.flatMap((s) => [s, "#9A7B3A"]),
        "#3D4A5C",
      ];
      this.map.setPaintProperty("pa-countries-line", "line-color", paLine);
      this.map.setPaintProperty("pa-countries-line", "line-opacity", 0.5);
      this.map.setPaintProperty("pa-countries-fill", "fill-color", "#0D1C2F");
    }
  }

  clearCatchmentPolygons() {
    this.catchmentTags?.clear();
    ["pa-catchments-fill", "pa-catchments-line"].forEach((id) => {
      if (this.map?.getLayer(id)) this.map.removeLayer(id);
    });
    if (this.map?.getSource("pa-catchments")) this.map.removeSource("pa-catchments");
    this._catchmentHandlersBound = false;
    this._selectedCatchmentId = null;
    this._catchmentFeatures = [];
    this._catchmentTagsHub = null;
    this._catchmentTagsRendered = false;
  }

  renderCatchmentPolygons(hub) {
    if (!this.map || !hub) return;

    const features = buildCatchmentGeoFeatures(hub, this.mapPaths);
    this._catchmentFeatures = features;

    if (!this._catchmentTagsRendered || this._catchmentTagsHub !== hub) {
      this.catchmentTags?.render(hub);
      this._catchmentTagsHub = hub;
      this._catchmentTagsRendered = true;
    }

    const applyLayers = () => {
      if (!this.map || this._destroyed || !features.length) return;

      const data = { type: "FeatureCollection", features };
      if (this.map.getSource("pa-catchments")) {
        this.map.getSource("pa-catchments").setData(data);
      } else {
        this.map.addSource("pa-catchments", { type: "geojson", data });
      }

      if (this.map.getLayer("pa-catchments-fill")) {
        this.highlightCatchmentPolygon(this._selectedCatchmentId);
        return;
      }

      if (!this.map.getLayer("pa-catchments-fill")) {
        this.map.addLayer({
          id: "pa-catchments-fill",
          type: "fill",
          source: "pa-catchments",
          minzoom: 3,
          paint: {
            "fill-color": ACTIVE_GOLD,
            "fill-opacity": 0,
          },
        });
      }

      if (!this.map.getLayer("pa-catchments-line")) {
        this.map.addLayer({
          id: "pa-catchments-line",
          type: "line",
          source: "pa-catchments",
          minzoom: 5,
          maxzoom: 11,
          paint: {
            "line-color": [
              "case",
              ["==", ["get", "in_network"], true], ACTIVE_GOLD,
              ["==", ["get", "status"], "active"], ACTIVE_GOLD,
              INACTIVE_BORDER
            ],
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              5, ["case", ["==", ["get", "in_network"], true], 1.8, 0.4],
              8, ["case", ["==", ["get", "in_network"], true], 2.5, 0.6],
              11, ["case", ["==", ["get", "in_network"], true], 3.0, 0.8],
            ],
            "line-opacity": [
              "interpolate", ["linear"], ["zoom"],
              5, ["case", ["==", ["get", "in_network"], true], 0.85, 0.25],
              8, ["case", ["==", ["get", "in_network"], true], 0.95, 0.35],
            ],
            "line-dasharray": [
              "case",
              ["==", ["get", "in_network"], true], ["literal", [1, 0]],
              ["literal", [4, 2]]
            ],
          },
        });
      }

      if (!this._catchmentHandlersBound) {
        this._bindCatchmentHandlers(hub);
      }
      this.highlightCatchmentPolygon(this._selectedCatchmentId);
    };

    if (!this.map.isStyleLoaded()) {
      this.map.once("idle", applyLayers);
      return;
    }
    applyLayers();
  }

  highlightCatchmentPolygon(catchmentId) {
    this._selectedCatchmentId = catchmentId || null;
    this.catchmentTags?.highlight(catchmentId);
  }

  _bindCatchmentHandlers(hub) {
    if (this._catchmentHandlersBound || !this.map) return;
    this._catchmentHandlersBound = true;

    const onCatchmentClick = (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const id = f.properties?.id;
      const ct = hub.catchments?.find((c) => c.id === id || c.slug === f.properties?.slug);
      if (ct) this.selectCatchment(hub, ct);
    };

    this.map.on("click", "pa-catchments-fill", onCatchmentClick);
    this.map.on("click", "pa-catchments-line", onCatchmentClick);

    this.map.on("mousemove", "pa-catchments-fill", (e) => {
      if (this.selected.level === "community") return;
      const f = e.features?.[0];
      if (!f) return;
      this.map.getCanvas().style.cursor = "pointer";
      const ct = hub.catchments?.find((c) => c.id === f.properties?.id);
      if (ct && this.selected.level === "country") {
        this.panel.render(`
          <div class="tk-panel__eyebrow">${escapeHtml(hub.country.name)}</div>
          <h3 class="tk-panel__title">${escapeHtml(ct.name)}</h3>
          <p class="tk-panel__hint">Click to explore communities</p>`);
      }
    });

    this.map.on("mouseleave", "pa-catchments-fill", () => {
      this.map.getCanvas().style.cursor = "";
      if (this.selected.level === "country") this.panel.showCountry(hub);
    });

    this.map.on("mouseenter", "pa-catchments-line", () => {
      this.map.getCanvas().style.cursor = "pointer";
    });
    this.map.on("mouseleave", "pa-catchments-line", () => {
      this.map.getCanvas().style.cursor = "";
    });
  }

  selectCountry(slug, country, geoFeature = null) {
    this.factSheet?.hide();
    this.communityTags?.clear();
    this.selected = { level: "country", slug, country };
    this._selectedCountrySlug = slug;
    this._refreshOverzoomLayout({ preserveDistance: false });
    this.panel.showCountry(country);
    this.breadcrumb.set(["Africa", country.country.name]);
    const feat = geoFeature || this.countryBounds(slug);
    const center = feat ? this.featureCenter(feat) : null;
    this.posterOverlay?.set({
      title: country.country.name,
      subtitle: "Possibilities Africa",
      lat: center?.lat ?? country.catchments?.[0]?.lat ?? this.map?.getCenter()?.lat,
      lon: center?.lon ?? country.catchments?.[0]?.lng ?? this.map?.getCenter()?.lng,
      drilldown: true,
    });
    this.updateCountrySelection(slug);
    if (feat) this.flyToFeature(feat, 80, country);
    else this.flyToCountryCentroid(country);
    this.renderCatchmentPolygons(country);
    this.map?.once("moveend", () => {
      if (this.selected.level === "country" && this.selected.country === country) {
        this.renderCatchmentPolygons(country);
      }
    });
    this.updateDrillHighlightMode();
    this.updateNavigationLevel(this.getViewState());
  }

  featureCenter(feature) {
    if (!feature?.geometry) return null;
    const coords = [];
    const flatten = (g) => {
      if (g.type === "Polygon") coords.push(...g.coordinates[0]);
      else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => coords.push(...p[0]));
    };
    flatten(feature.geometry);
    if (!coords.length) return null;
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    const c = bounds.getCenter();
    return { lat: c.lat, lon: c.lng };
  }

  flyToCatchmentFeature(feature) {
    if (!feature?.geometry || !this.map) return;
    const ring = feature.geometry.coordinates?.[0];
    if (!ring?.length) return;
    const bounds = ring.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(ring[0], ring[0])
    );
    const view = this.getViewState();
    const centerLat = bounds.getCenter().lat;
    const catchZoom = zoomForDistance(ZOOM_LEVELS.catchment, centerLat, view.effectiveContainerPx);
    const center = bounds.getCenter();
    this.map.flyTo({
      center: [center.lng, center.lat],
      zoom: Math.max(catchZoom, 13.4),
      duration: FLY_DURATION_MS,
      padding: { top: 48, bottom: 48, left: 48, right: 48 },
    });
  }

  catchmentFeatureFor(ct) {
    if (!ct) return null;
    return (this._catchmentFeatures || []).find(
      (f) => f.properties?.id === ct.id || f.properties?.slug === ct.slug
    );
  }

  flyToCountryCentroid(country) {
    const cts = country.catchments || [];
    const withGeo = cts.filter((c) => c.lat != null && c.lng != null);
    if (!withGeo.length || !this.map) return;
    const lat = withGeo.reduce((s, c) => s + c.lat, 0) / withGeo.length;
    const lon = withGeo.reduce((s, c) => s + c.lng, 0) / withGeo.length;
    const view = this.getViewState();
    flyToDistance(this.map, {
      lon,
      lat,
      distanceMeters: ZOOM_LEVELS.country,
      effectiveContainerPx: view.effectiveContainerPx,
    });
  }

  selectCatchment(country, ct) {
    this.factSheet?.hide();
    this.selected = { level: "catchment", slug: ct.slug, ct, country };
    this._refreshOverzoomLayout({ preserveDistance: false });
    this.panel.showCatchment(country, ct);
    this.breadcrumb.set(["Africa", country.country.name, ct.name]);
    this.posterOverlay?.set({
      title: ct.name,
      subtitle: country.country.name,
      lat: ct.lat,
      lon: ct.lng,
      drilldown: true,
    });
    this.highlightCatchmentPolygon(ct.id);
    const catchmentFeature = this.catchmentFeatureFor(ct);
    if (catchmentFeature) this.flyToCatchmentFeature(catchmentFeature);
    else {
      const view = this.getViewState();
      flyToDistance(this.map, {
        lon: ct.lng,
        lat: ct.lat,
        distanceMeters: ZOOM_LEVELS.catchment,
        effectiveContainerPx: view.effectiveContainerPx,
      });
    }
    this.renderCommunities(ct);
    this.updateDrillHighlightMode();
    this.updateNavigationLevel(this.getViewState());
  }

  selectCommunity(com, ct, country) {
    this.selected = { level: "community", com, ct, country };
    this._refreshOverzoomLayout({ preserveDistance: false });
    this.breadcrumb.set(["Africa", country.country.name, ct.name, com.name]);
    this.posterOverlay?.set({
      title: com.name,
      subtitle: country.country.name,
      lat: com.lat,
      lon: com.lng,
      drilldown: true,
      community: true,
    });
    this.communityTags?.highlight(com.id);
    this.factSheet?.show({ community: com, country: country.country, catchment: ct });
    this.factSheet._onClose = () => {
      if (this.selected.level === "community" && this.selected.ct && this.selected.country) {
        this.panel.showCatchment(this.selected.country, this.selected.ct);
        this.panel.show();
      }
    };
    this.panel.hide();
    const view = this.getViewState();
    this.updateDrillHighlightMode();
    this.updateNavigationLevel(view);
    void this._flyToCommunity(com, view);
  }

  async _flyToCommunity(com, view) {
    flyToDistance(this.map, {
      lon: com.lng,
      lat: com.lat,
      distanceMeters: ZOOM_LEVELS.community,
      effectiveContainerPx: view.effectiveContainerPx,
      duration: 1200,
      padding: { top: 48, bottom: 48, left: 48, right: 340 },
    });
    this.map?.once("moveend", () => {
      this.map?.triggerRepaint?.();
    });
  }

  clearSelection() {
    this.factSheet?.hide();
    this.communityTags?.clear();
    this.selected = { level: "africa", slug: null };
    this._selectedCountrySlug = null;
    this._refreshOverzoomLayout({ preserveDistance: false });
    this.panel.reset();
    this.breadcrumb.reset();
    this.posterOverlay?.reset();
    this._removeLegacyClusterLayers();
    this.clearCatchmentPolygons();
    this.updateDrillHighlightMode();
    this.fitAfricaView();
    this.updateNavigationLevel(this.getViewState());
  }

  goTo(level) {
    if (level === "africa") this.clearSelection();
    else if (level === "country" && this.selected.country) {
      const c = this.selected.country;
      this.selectCountry(c.country.slug, c);
    } else if (level === "catchment" && this.selected.ct && this.selected.country) {
      this.selectCatchment(this.selected.country, this.selected.ct);
    }
  }

  _removeLegacyClusterLayers() {
    ["catchments", "communities"].forEach((id) => {
      [
        `${id}-clusters`,
        `${id}-cluster-count`,
        `${id}-points`,
        `${id}-points-hit`,
        `${id}-labels`,
      ].forEach((layerId) => {
        if (this.map?.getLayer(layerId)) this.map.removeLayer(layerId);
      });
      if (this.map?.getSource(id)) this.map.removeSource(id);
    });
  }

  renderCommunities(ct, country = this.selected.country) {
    if (!ct || !country) return;
    this._removeLegacyClusterLayers();
    this.catchmentTags?.highlight(ct.id);
    this.communityTags?.render(ct, country);
  }

  buildPanel() {
    const panel = document.createElement("div");
    panel.className = "tk-panel";
    panel.innerHTML = `<div class="tk-panel__body"><p class="tk-muted">Click a country to explore the PA network</p></div>`;
    this.root.appendChild(panel);
    this.els.panel = panel;
    this.els.panelBody = panel.querySelector(".tk-panel__body");

    const self = this;
    this.panel = {
      render(html) {
        self.els.panelBody.innerHTML = html;
      },
      showHover(country, name) {
        const m = country?.metrics || {};
        this.render(`
          <div class="tk-panel__eyebrow">${escapeHtml(name || "")}</div>
          <h3 class="tk-panel__title">${escapeHtml(country.country.name)}</h3>
          <div class="tk-kpis">
            ${kpi("Catchments", country.catchments?.length ?? 0)}
            ${kpi("Communities", m.communities ?? 0, THEME_TEXT)}
            ${kpi("Pastors", fmt(m.pastors ?? 0), "#C99C37")}
          </div>
          <p class="tk-panel__hint">Click to drill in</p>`);
      },
      showPlain(name) {
        this.render(
          `<div class="tk-panel__eyebrow">REGION</div><h3 class="tk-panel__title">${escapeHtml(name)}</h3><p class="tk-muted">Outside PA network</p>`
        );
      },
      showCountry(country) {
        const m = country.metrics || {};
        this.render(`
          <div class="tk-panel__eyebrow">COUNTRY</div>
          <h3 class="tk-panel__title">${escapeHtml(country.country.name)}</h3>
          <div class="tk-kpis">
            ${kpi("Catchments", country.catchments?.length ?? 0, "#C99C37")}
            ${kpi("Communities", m.communities ?? 0, THEME_TEXT)}
            ${kpi("Pastors", fmt(m.pastors ?? 0), "#8A6820")}
          </div>
          <a class="tk-btn" href="#/country/${country.country.slug}" data-link>Country hub →</a>`);
      },
      showCatchment(country, ct) {
        const m = ct.metrics || {};
        this.render(`
          <div class="tk-panel__eyebrow">${escapeHtml(country.country.name)}</div>
          <h3 class="tk-panel__title">${escapeHtml(ct.name)}</h3>
          <div class="tk-kpis">
            ${kpi("Communities", ct.communities?.length ?? 0, THEME_TEXT)}
            ${kpi("Households", fmt(m.households))}
            ${kpi("Pastors", fmt(m.pastors ?? 0))}
          </div>
          <a class="tk-btn" href="#/catchment/${country.country.slug}/${ct.slug}" data-link>Catchment hub →</a>`);
      },
      showCommunity(country, ct, com) {
        this.render(`
          <div class="tk-panel__eyebrow">${escapeHtml(ct.name)}</div>
          <h3 class="tk-panel__title">${escapeHtml(com.name)}</h3>
          <div class="tk-kpis">
            ${kpi("Households", fmt(com.households))}
            ${kpi("Pastors", fmt(com.pastors), "#C99C37")}
            ${kpi("Shalom", fmt(com.shalomGroups), "#8A6820")}
          </div>
          <a class="tk-btn" href="#/community/${country.country.slug}/${ct.slug}/${com.slug}" data-link>Community hub →</a>`);
      },
      reset() {
        this.render(`<p class="tk-muted">Click a country to explore the PA network</p>`);
        this.show();
      },
      hide() {
        self.els.panel?.classList.add("is-hidden");
      },
      show() {
        self.els.panel?.classList.remove("is-hidden");
      },
    };
  }

  buildBreadcrumb() {
    const el = document.createElement("div");
    el.className = "tk-breadcrumb";
    el.innerHTML = `<button type="button" class="tk-breadcrumb__item">Africa</button>`;
    el.querySelector("button").addEventListener("click", () => this.goTo("africa"));
    this.root.appendChild(el);
    this.els.breadcrumb = el;
    const self = this;
    this.breadcrumb = {
      set(parts) {
        el.innerHTML = "";
        parts.forEach((part, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tk-breadcrumb__item";
          btn.textContent = part;
          if (i === 0) btn.addEventListener("click", () => self.goTo("africa"));
          else if (i === 1) btn.addEventListener("click", () => self.goTo("country"));
          else if (i === 2) btn.addEventListener("click", () => self.goTo("catchment"));
          el.appendChild(btn);
          if (i < parts.length - 1) {
            const sep = document.createElement("span");
            sep.className = "tk-breadcrumb__sep";
            sep.textContent = "/";
            el.appendChild(sep);
          }
        });
      },
      reset() {
        el.innerHTML = `<button type="button" class="tk-breadcrumb__item">Africa</button>`;
        el.querySelector("button").addEventListener("click", () => self.goTo("africa"));
      },
    };
  }

  buildLegend() {
    const el = document.createElement("div");
    el.className = "tk-legend";
    el.innerHTML = `
      <span class="tk-legend__level" data-level-badge>Global view</span>
      <span><i class="tk-legend__swatch" style="background:${PA_FILL};border-color:${PA_BORDER}"></i>PA network</span>
      <span><i class="tk-legend__dot" style="background:#C99C37"></i>Catchment</span>
      <span><i class="tk-legend__dot" style="background:#D6B352"></i>Community</span>`;
    this.root.appendChild(el);
    this.els.levelBadge = el.querySelector("[data-level-badge]");
  }

  buildGradients() {
    const el = document.createElement("div");
    el.className = "tk-gradients";
    el.innerHTML = `<div class="tk-gradients__top"></div><div class="tk-gradients__bottom"></div>`;
    this.root.appendChild(el);
  }

  attachWheelGuard() {
    const stage = this.els.stage;
    if (!stage) return;
    stage.addEventListener(
      "wheel",
      (e) => {
        if (!this.map) return;
        e.preventDefault();
        const view = this.getViewState();
        const bounds = resolveZoomBounds(view.lat, view.effectiveContainerPx);
        const delta = e.deltaY > 0 ? -0.22 : 0.22;
        const next = Math.min(bounds.maxZoom, Math.max(bounds.minZoom, this.map.getZoom() + delta));
        this.map.zoomTo(next, { duration: 120 });
      },
      { passive: false }
    );
  }

  _buildRecenterButton() {
    const btn = document.createElement("button");
    btn.className = "tk-recenter-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Recenter map to Africa");
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`;
    btn.addEventListener("click", () => this.clearSelection());
    this.root.appendChild(btn);
    this.els.recenterBtn = btn;
  }

  destroy() {
    this._destroyed = true;
    this.catchmentTags?.destroy();
    this.communityTags?.destroy();
    this._resizeObserver?.disconnect();
    this.posterOverlay?.destroy();
    this.factSheet?.destroy();
    this.els.recenterBtn?.remove();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.root) {
      this.root.classList.remove("africa-map-host");
      this.root.innerHTML = "";
    }
  }
}
