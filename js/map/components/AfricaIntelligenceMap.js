import { loadMapRegions, attachCoordinates } from "./RegionLoader.js";
import { createCountryRegions } from "./CountryRegion.js";
import { CountryTooltip } from "./CountryTooltip.js";
import { MapLegend } from "./MapLegend.js";
import { MapControls } from "./MapControls.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { MapDataPanel } from "./MapDataPanel.js";
import { MapSelectionOverlay } from "./MapSelectionOverlay.js";
import { MapWheelController } from "./MapWheelController.js";
import { computeAfricaZoom, computeZoomToBBox } from "../utils/geo.js";
import { buildDrillDownData, getMetricValue, PA_SLUGS } from "../utils/drill-down-data.js";
import { applyLabelSpread, estimateLabelSize } from "../utils/label-layout.js";
import { buildCatchmentZones, getCountryDrillBBox, getCatchmentDrillBBox } from "../utils/catchment-path-project.js";

const LEVEL_LABELS = ["Africa", "Country", "Catchment", "Community"];
const SVG_NS = "http://www.w3.org/2000/svg";

const ZOOM_STEP_COUNTRY = 1.04;
const ZOOM_STEP_OUT_AFRICA = 0.96;
const ZOOM_PROMOTE_CATCHMENT = 1.03;
const ZOOM_DEMOTE_CATCHMENT = 0.94;
const ZOOM_PROMOTE_COMMUNITY = 1.03;
const ZOOM_DEMOTE_COMMUNITY = 0.93;
const ZOOM_DEMOTE_COUNTRY = 0.92;
const WHEEL_MAX_ABOVE_FIT = 1.42;
const WHEEL_MIN_BELOW_FIT = 0.88;
const COUNTRY_FIT_PADDING = 0.08;
const CATCHMENT_FIT_PADDING = 0.12;

/**
 * World Bank–style Africa Intelligence Map:
 * Africa → Country → Catchment → Community (scroll-zoom drill-down)
 */
export class AfricaIntelligenceMap {
  constructor() {
    this.regions = [];
    this.countryRegions = [];
    this.activeMetric = "communities";
    this.zoomLevel = 0;
    this.selection = { country: null, catchment: null, community: null };
    this.animating = false;
    this.tooltip = new CountryTooltip();
    this.wheelController = null;
    this._scaleDebounce = null;
    this.baseScale = 1;
    this.levelFitScale = 1;
    this.countryFitScale = 1;
    this.catchmentFitScale = 1;
    this._layersVisible = false;
    this._layerKey = null;
    this._animateLayers = false;
  }

  getZoomThresholds() {
    const africa = this.baseScale || 1;
    const level = this.levelFitScale || africa;
    return {
      inCountry: africa * ZOOM_STEP_COUNTRY,
      outAfrica: africa * ZOOM_STEP_OUT_AFRICA,
      inCatchment: level * ZOOM_PROMOTE_CATCHMENT,
      outCatchment: level * ZOOM_DEMOTE_CATCHMENT,
      inCommunity: level * ZOOM_PROMOTE_COMMUNITY,
      outCommunity: level * ZOOM_DEMOTE_COMMUNITY,
      outCountry: (this.countryFitScale || africa) * ZOOM_DEMOTE_COUNTRY,
    };
  }

  updateWheelBounds() {
    if (!this.wheelController) return;
    const africa = this.baseScale || 1;
    if (this.zoomLevel === 0) {
      this.wheelController.setScaleBounds(africa * 0.85, africa * 2.2);
    } else if (this.zoomLevel === 1) {
      const fit = this.countryFitScale || this.levelFitScale || africa;
      this.wheelController.setScaleBounds(fit * WHEEL_MIN_BELOW_FIT, fit * WHEEL_MAX_ABOVE_FIT);
    } else if (this.zoomLevel >= 2) {
      const fit = this.catchmentFitScale || this.levelFitScale || africa;
      this.wheelController.setScaleBounds(fit * WHEEL_MIN_BELOW_FIT, fit * WHEEL_MAX_ABOVE_FIT);
    }
  }

  fitCountryView(animate = true) {
    const region = this.getCountryRegion();
    if (!region) return;
    const hub = this.drillData.byCountry[this.selection.country.slug];
    const bbox = getCountryDrillBBox(region, hub);
    const target = computeZoomToBBox(bbox, this.svg, this.canvas, COUNTRY_FIT_PADDING, 10);
    this.countryFitScale = target.scale;
    this.levelFitScale = target.scale;
    this.updateWheelBounds();
    this.applyView(target, animate);
  }

  fitCatchmentView(catchment, animate = true) {
    const bbox = getCatchmentDrillBBox(catchment);
    if (!bbox) return;
    const target = computeZoomToBBox(bbox, this.svg, this.canvas, CATCHMENT_FIT_PADDING, 10);
    this.catchmentFitScale = target.scale;
    this.levelFitScale = target.scale;
    this.updateWheelBounds();
    this.applyView(target, animate);
  }

  mount({
    root,
    countries,
    mapPaths,
    mapOverlay,
    mapMetrics,
    config,
    catchments,
    communities,
    countryHubs,
    geoLocations,
  }) {
    this.destroy();
    this.root = root;
    this.config = config || {};
    this.mapPaths = mapPaths;
    this.regions = loadMapRegions({ countries, mapPaths, mapOverlay, mapMetrics });
    this.drillData = buildDrillDownData({ countries, catchments, communities, countryHubs, mapPaths, geoLocations });
    this.activeMetric = config?.defaultMetric || "communities";

    root.innerHTML = this.buildHTML();
    this.cacheElements();
    this.buildSVG();
    this.countriesLayer = this.svg.querySelector("#countries-layer");
    this.regions = attachCoordinates(this.regions, this.svg);
    this.countryRegions = createCountryRegions(this.regions, this.countriesLayer);

    this.catchmentLayer = this.svg.querySelector("#catchment-layer");
    this.communityLayer = this.svg.querySelector("#community-layer");

    this.breadcrumb = new Breadcrumb(this.breadcrumbEl);
    this.breadcrumb.onAfricaReset(() => this.resetToAfrica(true));
    this.breadcrumb.onNavigate((level, slug) => this.navigateBreadcrumb(level, slug));

    this.dataPanel = new MapDataPanel(this.sidebarEl, {
      countries: this.drillData.paCountries,
      drillData: this.drillData.byCountry,
      config: this.config,
      onCountrySelect: (country) => this.focusCountryFromSidebar(country.slug),
      onCountryHover: (country) => this.previewCountryFromSidebar(country?.slug || null),
    });

    this.selectionOverlay = new MapSelectionOverlay(this.overlayEl);

    this.legend = new MapLegend(this.legendEl, { mode: "choropleth" });
    this.controls = new MapControls(this.controlsEl, {
      onZoomIn: () => this.zoomStep(1.12),
      onZoomOut: () => this.zoomStep(1 / 1.12),
      onReset: () => this.resetToAfrica(true),
    });

    this.viewState = { x: 0, y: 0, scale: 1 };
    this._suppressClicksUntil = 0;
    this.wheelController = new MapWheelController(this.canvas, {
      getViewState: () => this.viewState,
      applyView: (v, animate) => this.applyView(v, animate),
      onScaleChange: (newScale, prevScale) => this.handleScaleChange(newScale, prevScale),
      minScale: 0.35,
      maxScale: 4,
    });

    this._onPageWheel = (e) => {
      if (!document.body.classList.contains("africa-map-active")) return;
      if (e.target.closest(".ai-map__sidebar-panel")) return;
      if (e.target.closest(".ai-map__canvas")) return;
      e.preventDefault();
    };
    document.addEventListener("wheel", this._onPageWheel, { passive: false, capture: true });

    this.updateMetricHeader();
    this.bindCountryEvents();

    requestAnimationFrame(() => {
      this.initMapView();
      this.controls.setVisible(true);
      this.legend.setVisible(true);
      this.updateChoropleth();
      this.updateLegendRange();
      window.addEventListener("resize", this._onResize);
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      this._resizeObserver.observe(this.canvas);
    });
  }

  initMapView(attempt = 0) {
    if (this.canvas.clientWidth < 50 || this.canvas.clientHeight < 50) {
      if (attempt < 60) requestAnimationFrame(() => this.initMapView(attempt + 1));
      return;
    }
    // Wait one frame so country paths are laid out before getBBox
    requestAnimationFrame(() => {
      this.resetToAfrica(false);
      this.camera?.classList.add("is-ready");
      this.showZoomHint(true);
    });
  }

  _onResize = () => {
    if (!this.canvas || !this.svg) return;
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this.refitCurrentLevel(false), 120);
  };

  refitCurrentLevel(animate = false) {
    if (this.selection.catchment) {
      this.fitCatchmentView(this.selection.catchment, animate);
    } else if (this.selection.country) {
      this.fitCountryView(animate);
    } else {
      const target = computeAfricaZoom(this.svg, this.canvas);
      this.applyView(target, animate);
    }
  }

  navigateBreadcrumb(level, slug) {
    if (level === "africa") {
      this.resetToAfrica(true);
      return;
    }
    if (level === "country" && this.selection.country) {
      this.selection.catchment = null;
      this.selection.community = null;
      const region = this.countryRegions.find((r) => r.country.slug === (slug || this.selection.country.slug));
      if (region) this.selectCountry(region, true);
      return;
    }
    if (level === "catchment" && this.selection.catchment) {
      this.selection.community = null;
      this.selectCatchment(this.selection.catchment, this.selection.country?.slug, true);
    }
  }

  handleScaleChange(newScale, prevScale) {
    if (this.animating) return;
    this._suppressClicksUntil = Date.now() + 350;
    clearTimeout(this._scaleDebounce);
    this._scaleDebounce = setTimeout(() => {
      if (newScale < prevScale) {
        this.handleZoomOut(newScale);
      } else {
        this.tryAutoPromote(newScale);
      }
      this.syncLayersForScale(newScale);
    }, 40);
  }

  tryAutoPromote(scale) {
    const t = this.getZoomThresholds();

    if (this.zoomLevel === 0 && scale >= t.inCountry) {
      const region = this.detectCountryAtCenter();
      if (region) this.promoteToCountry(region);
      return;
    }

    if (this.zoomLevel === 1 && !this.selection.catchment) {
      const fit = this.countryFitScale || this.levelFitScale || this.baseScale;
      const atCeiling = scale >= fit * WHEEL_MAX_ABOVE_FIT * 0.98;
      if (scale >= t.inCatchment || atCeiling) {
        const catchment = this.detectCatchmentAtCenter() || this.nearestCatchmentToCenter();
        if (catchment) this.promoteToCatchment(catchment);
      }
      return;
    }

    if (this.zoomLevel >= 2 && this.selection.catchment && !this.selection.community) {
      const fit = this.catchmentFitScale || this.levelFitScale || this.baseScale;
      const atCeiling = scale >= fit * WHEEL_MAX_ABOVE_FIT * 0.98;
      if (scale >= t.inCommunity || atCeiling) {
        const community = this.detectCommunityAtCenter() || this.nearestCommunityToCenter();
        if (community) this.promoteToCommunity(community);
      }
    }
  }

  getCountryCatchmentRadius() {
    const region = this.getCountryRegion();
    if (!region) return 48;
    try {
      const bb = region.pathEl.getBBox();
      return Math.max(bb.width, bb.height) * 0.22;
    } catch {
      return 48;
    }
  }

  nearestCatchmentToCenter() {
    const hub = this.drillData.byCountry[this.selection.country?.slug];
    if (!hub?.catchments?.length) return null;

    const pt = this.viewportCenterToSvg();
    let best = null;
    let bestDist = Infinity;

    for (const ct of hub.catchments) {
      if (ct.x == null || ct.y == null) continue;
      const d = Math.hypot(pt.x - ct.x, pt.y - ct.y);
      if (d < bestDist) {
        bestDist = d;
        best = ct;
      }
    }

    return best;
  }

  nearestCommunityToCenter() {
    const communities = this.getCommunitiesForCountry();
    if (!communities.length) return null;

    const pt = this.viewportCenterToSvg();
    const pool = this.selection.catchment
      ? communities.filter((c) => c.catchmentId === this.selection.catchment.id)
      : communities;

    let best = null;
    let bestDist = Infinity;

    for (const com of pool) {
      if (com.x == null || com.y == null) continue;
      const d = Math.hypot(pt.x - com.x, pt.y - com.y);
      if (d < bestDist) {
        bestDist = d;
        best = com;
      }
    }

    return best;
  }

  viewportCenterToSvg() {
    const { x, y, scale } = this.viewState;
    const cx = this.canvas.clientWidth / 2;
    const cy = this.canvas.clientHeight / 2;
    const vb = this.svg.viewBox.baseVal;
    return {
      x: ((cx - x) / scale) * (vb.width / this.canvas.clientWidth),
      y: ((cy - y) / scale) * (vb.height / this.canvas.clientHeight),
    };
  }

  detectCountryAtCenter() {
    const pt = this.viewportCenterToSvg();
    const point = this.svg.createSVGPoint();
    point.x = pt.x;
    point.y = pt.y;

    for (const region of this.countryRegions) {
      if (!PA_SLUGS.has(region.country.slug)) continue;
      try {
        if (region.pathEl.isPointInFill(point)) return region;
      } catch {
        /* path not ready */
      }
    }

    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const els = document.elementsFromPoint(cx, cy);
    for (const el of els) {
      const path = el.closest?.(".country-path.is-pa");
      if (path && !path.classList.contains("is-dimmed")) {
        const slug = path.dataset.slug;
        return this.countryRegions.find((r) => r.country.slug === slug) || null;
      }
    }
    return null;
  }

  detectCatchmentAtCenter() {
    const hub = this.drillData.byCountry[this.selection.country?.slug];
    if (!hub?.catchments?.length) return null;

    const pt = this.viewportCenterToSvg();
    const maxDist = this.getCountryCatchmentRadius();
    let best = null;
    let bestDist = maxDist;

    for (const ct of hub.catchments) {
      if (ct.x == null || ct.y == null) continue;
      const d = Math.hypot(pt.x - ct.x, pt.y - ct.y);
      if (d < bestDist) {
        bestDist = d;
        best = ct;
      }
    }

    return best;
  }

  detectCommunityAtCenter() {
    const communities = this.getCommunitiesForCountry();
    if (!communities.length) return null;

    const pt = this.viewportCenterToSvg();
    const region = this.getCountryRegion();
    let maxDist = 28;
    if (region) {
      try {
        const bb = region.pathEl.getBBox();
        maxDist = Math.max(bb.width, bb.height) * 0.12;
      } catch {
        /* ignore */
      }
    }
    let best = null;
    let bestDist = maxDist;

    const pool = this.selection.catchment
      ? communities.filter((c) => c.catchmentId === this.selection.catchment.id)
      : communities;

    for (const com of pool) {
      if (com.x == null || com.y == null) continue;
      const d = Math.hypot(pt.x - com.x, pt.y - com.y);
      if (d < bestDist) {
        bestDist = d;
        best = com;
      }
    }

    return best;
  }

  promoteToCountry(region) {
    const { country } = region;
    if (this.selection.country?.slug === country.slug) {
      this.syncLayersForScale(this.viewState.scale);
      return;
    }
    this.selection = { country, catchment: null, community: null };
    this.zoomLevel = 1;
    this.tooltip.hide();
    this._layerKey = null;
    this._animateLayers = true;

    this.countryRegions.forEach((r) => {
      const selected = r.country.slug === country.slug;
      r.setSelected(selected);
      r.setHovered(false);
    });

    const hub = this.drillData.byCountry[country.slug];
    this.breadcrumb.setCountry(country);
    this.selectionOverlay.setSelection({
      type: "country",
      data: {
        ...country,
        countryName: country.countryName || country.name,
        metrics: hub?.metrics,
      },
      metric: this.activeMetric,
    });
    this.updateChoropleth();
    this.dataPanel?.setActiveCountry(country.slug);
    this.fitCountryView(true);
    this.updateScrollHint();
  }

  getCountryRegion() {
    if (!this.selection.country) return null;
    return this.countryRegions.find((r) => r.country.slug === this.selection.country.slug) || null;
  }

  getCommunitiesForCountry() {
    const hub = this.drillData.byCountry[this.selection.country?.slug];
    if (!hub) return [];
    return hub.catchments.flatMap((ct) =>
      (ct.communities || []).map((com) => ({ ...com, catchmentId: com.catchmentId || ct.id }))
    );
  }

  promoteToCatchment(catchment) {
    if (this.selection.catchment?.id === catchment.id) {
      this.syncLayersForScale(this.viewState.scale);
      return;
    }
    this.selection.catchment = catchment;
    this.selection.community = null;
    this.zoomLevel = 2;
    this._layerKey = null;
    this._animateLayers = true;

    this.selectionOverlay.setSelection({
      type: "catchment",
      data: { ...catchment, countrySlug: this.selection.country?.slug },
      metric: this.activeMetric,
    });
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || "", slug: this.selection.country?.slug, level: "country" },
      { label: catchment.name, slug: catchment.slug, level: "catchment" },
    ]);
    this.fitCatchmentView(catchment, true);
    this.updateScrollHint();
  }

  promoteToCommunity(community) {
    if (this.selection.community?.id === community.id) return;

    const catchment = this.selection.catchment
      || this.drillData.byCountry[this.selection.country?.slug]?.catchments
        ?.find((ct) => ct.communities?.some((c) => c.id === community.id));

    if (catchment && !this.selection.catchment) {
      this.selection.catchment = catchment;
    }

    this.selection.community = community;
    this.zoomLevel = 3;
    this._layerKey = null;
    this._animateLayers = true;

    this.selectionOverlay.setSelection({
      type: "community",
      data: {
        ...community,
        countrySlug: this.selection.country?.slug,
        catchmentSlug: this.selection.catchment?.slug,
      },
      metric: this.activeMetric,
    });
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || "", slug: this.selection.country?.slug, level: "country" },
      { label: this.selection.catchment?.name || "", slug: this.selection.catchment?.slug, level: "catchment" },
      { label: community.name, slug: community.slug, level: "community" },
    ]);
    this.syncLayersForScale(this.viewState.scale);
    this.updateScrollHint();
  }

  handleZoomOut(scale) {
    const t = this.getZoomThresholds();
    if (this.selection.community && scale < t.outCommunity) {
      this.demoteToCatchment();
    } else if (this.selection.catchment && scale < t.outCatchment) {
      this.clearCatchmentSelection();
    } else if (this.zoomLevel === 1 && scale < t.outCountry) {
      this.demoteToAfrica();
    } else {
      this.syncLayersForScale(scale);
    }
  }

  clearCatchmentSelection() {
    if (!this.selection.country) return;
    this.selection.catchment = null;
    this.selection.community = null;
    this.zoomLevel = 1;
    this._layerKey = null;
    const hub = this.drillData.byCountry[this.selection.country.slug];
    this.breadcrumb.setCountry(this.selection.country);
    this.selectionOverlay.setSelection({
      type: "country",
      data: {
        ...this.selection.country,
        countryName: this.selection.country.countryName || this.selection.country.name,
        metrics: hub?.metrics,
      },
      metric: this.activeMetric,
    });
    this.fitCountryView(true);
  }

  demoteToAfrica() {
    this.selection = { country: null, catchment: null, community: null };
    this.zoomLevel = 0;
    this._layerKey = null;
    this._layersVisible = false;
    this.levelFitScale = this.baseScale;
    this.countryFitScale = this.baseScale;
    this.catchmentFitScale = this.baseScale;
    this.selectionOverlay.setSelection(null);
    this.breadcrumb.setItems([{ label: "Africa", slug: null, level: "africa" }]);
    this.countryRegions.forEach((r) => {
      r.setSelected(false);
      r.setHidden(false);
      r.setInteractive(PA_SLUGS.has(r.country.slug));
    });
    this.catchmentLayer.innerHTML = "";
    this.communityLayer.innerHTML = "";
    this.updateChoropleth();
    const target = computeAfricaZoom(this.svg, this.canvas);
    this.baseScale = target.scale;
    this.levelFitScale = target.scale;
    this.countryFitScale = target.scale;
    this.catchmentFitScale = target.scale;
    this.updateWheelBounds();
    this.dataPanel?.setActiveCountry(null);
    this.applyView(target, true);
  }

  demoteToCountry() {
    if (!this.selection.country) return;
    this.selection.catchment = null;
    this.selection.community = null;
    this.zoomLevel = 1;
    this.communityLayer.innerHTML = "";

    const hub = this.drillData.byCountry[this.selection.country.slug];
    this.breadcrumb.setCountry(this.selection.country);
    this.selectionOverlay.setSelection({
      type: "country",
      data: {
        ...this.selection.country,
        countryName: this.selection.country.countryName || this.selection.country.name,
        metrics: hub?.metrics,
      },
      metric: this.activeMetric,
    });
    this._layerKey = null;
    this.fitCountryView(true);
  }

  demoteToCatchment() {
    if (!this.selection.catchment) return;
    this.selection.community = null;
    this.zoomLevel = 2;
    this._layerKey = null;
    this.highlightCommunity(null);
    this.selectionOverlay.setSelection({
      type: "catchment",
      data: { ...this.selection.catchment, countrySlug: this.selection.country?.slug },
      metric: this.activeMetric,
    });
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || "", slug: this.selection.country?.slug, level: "country" },
      { label: this.selection.catchment.name, slug: this.selection.catchment.slug, level: "catchment" },
    ]);
    this.fitCatchmentView(this.selection.catchment, true);
  }

  buildHTML() {
    return `
      <div class="ai-map">
        <aside class="ai-map__sidebar" id="ai-map-sidebar" aria-label="PA network countries">
          <div class="ai-map__sidebar-panel" id="ai-map-sidebar-panel"></div>
        </aside>
        <div class="ai-map__main">
          <div class="ai-map__canvas-wrap">
            <header class="ai-map__header">
              <div id="ai-map-breadcrumb"></div>
              <h1 id="ai-map-title"></h1>
              <p id="ai-map-subtitle"></p>
            </header>
            <div class="ai-map__canvas" id="ai-map-canvas">
              <div class="ai-map__scroll-hint" id="ai-scroll-hint" aria-hidden="true">
                Scroll or click a country to zoom in · catchments &amp; communities appear inside
              </div>
              <div class="ai-map__camera" id="ai-map-camera">
                <svg id="ai-map-svg" role="img" aria-label="Interactive map of Africa"></svg>
              </div>
              <div class="ai-map__overlay" id="ai-map-overlay"></div>
              <div id="ai-map-controls"></div>
              <div id="ai-map-legend"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  cacheElements() {
    this.sidebarEl = this.root.querySelector("#ai-map-sidebar-panel");
    this.breadcrumbEl = this.root.querySelector("#ai-map-breadcrumb");
    this.titleEl = this.root.querySelector("#ai-map-title");
    this.subtitleEl = this.root.querySelector("#ai-map-subtitle");
    this.canvas = this.root.querySelector("#ai-map-canvas");
    this.camera = this.root.querySelector("#ai-map-camera");
    this.svg = this.root.querySelector("#ai-map-svg");
    this.overlayEl = this.root.querySelector("#ai-map-overlay");
    this.controlsEl = this.root.querySelector("#ai-map-controls");
    this.legendEl = this.root.querySelector("#ai-map-legend");
    this.scrollHint = this.root.querySelector("#ai-scroll-hint");
  }

  buildSVG() {
    const viewBox = this.mapPaths.viewBox;
    const [, , w, h] = viewBox.split(" ").map(Number);
    this.svg.setAttribute("viewBox", viewBox);

    const ocean = document.createElementNS(SVG_NS, "rect");
    ocean.setAttribute("class", "map-ocean ai-map-ocean");
    ocean.setAttribute("width", w);
    ocean.setAttribute("height", h);
    this.svg.appendChild(ocean);

    const countriesG = document.createElementNS(SVG_NS, "g");
    countriesG.setAttribute("id", "countries-layer");
    this.svg.appendChild(countriesG);

    const catchG = document.createElementNS(SVG_NS, "g");
    catchG.setAttribute("id", "catchment-layer");
    catchG.setAttribute("class", "catchment-layer");
    this.svg.appendChild(catchG);

    const commG = document.createElementNS(SVG_NS, "g");
    commG.setAttribute("id", "community-layer");
    commG.setAttribute("class", "community-layer");
    this.svg.appendChild(commG);
  }

  updateMetricHeader(label, desc) {
    const metric = this.getActiveMetricConfig();
    if (this.titleEl) this.titleEl.textContent = label || metric?.label || "Community reach across Africa";
    if (this.subtitleEl) {
      this.subtitleEl.textContent =
        desc || metric?.description || "Most recent values across PA network countries";
    }
  }

  getActiveMetricConfig() {
    for (const theme of this.config.themes || []) {
      const found = theme.metrics.find((m) => m.id === this.activeMetric);
      if (found) return found;
    }
    return null;
  }

  getCountryMetricValue(country) {
    const hub = this.drillData.byCountry[country.slug];
    if (hub) return getMetricValue(hub, this.activeMetric);
    return getMetricValue(country, this.activeMetric);
  }

  updateChoropleth() {
    const paRegions = this.countryRegions.filter((r) => PA_SLUGS.has(r.country.slug));
    const values = paRegions.map((r) => this.getCountryMetricValue(r.country));
    const max = Math.max(...values, 1);
    const zoomedIn = this.zoomLevel >= 1;

    this.countryRegions.forEach((region) => {
      const isPa = PA_SLUGS.has(region.country.slug);
      if (zoomedIn) {
        const selected = isPa && region.country.slug === this.selection.country?.slug;
        region.setHidden(!selected);
        region.setDimmed(false);
        region.setInteractive(false);
        if (selected) region.setChoropleth(0.88);
        return;
      }
      region.setHidden(false);
      if (!isPa) {
        region.setDimmed(false);
        region.setInteractive(false);
        region.setChoropleth(0);
        return;
      }
      const val = this.getCountryMetricValue(region.country);
      const intensity = Math.max(0.35, val / max);
      region.setChoropleth(intensity);
      region.setDimmed(false);
      region.setInteractive(true);
    });
  }

  updateLegendRange() {
    const paRegions = this.countryRegions.filter((r) => PA_SLUGS.has(r.country.slug));
    const values = paRegions.map((r) => this.getCountryMetricValue(r.country));
    const max = Math.max(...values, 1);
    this.legend?.setChoroplethRange(0, max, this.getActiveMetricConfig()?.unit || "");
  }

  bindCountryEvents() {
    this.countryRegions.forEach((region) => {
      const { country } = region;
      const isPa = PA_SLUGS.has(country.slug);

      if (!isPa) {
        region.setDimmed(true);
        region.setInteractive(false);
        return;
      }

      region.on("mouseenter", (e) => {
        if (this.animating || this.zoomLevel >= 1) return;
        region.setHovered(true);
        this.tooltip.show(country, e.clientX, e.clientY);
      });

      region.on("mousemove", (e) => this.tooltip.position(e.clientX, e.clientY));

      region.on("mouseleave", () => {
        region.setHovered(false);
        this.tooltip.hide();
      });

      this.bindMapTap(region.pathEl, () => {
        if (this.zoomLevel === 0) this.selectCountry(region);
      });
    });
  }

  shouldIgnoreMapClick() {
    return Date.now() < (this._suppressClicksUntil || 0) || this.animating;
  }

  bindMapTap(element, handler) {
    let downX = 0;
    let downY = 0;
    let dragged = false;

    element.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
      downY = e.clientY;
      dragged = false;
    });
    element.addEventListener("pointermove", (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) dragged = true;
    });
    element.addEventListener("click", (e) => {
      if (dragged || this.shouldIgnoreMapClick()) return;
      handler(e);
    });
  }

  selectCountry(region, fromBreadcrumb = false) {
    const { country } = region;
    this.selection = { country, catchment: null, community: null };
    this.tooltip.hide();

    this.countryRegions.forEach((r) => {
      const selected = r.country.slug === country.slug;
      r.setSelected(selected);
      r.setHovered(false);
    });

    const hub = this.drillData.byCountry[country.slug];
    this.breadcrumb.setCountry(country);
    this.selectionOverlay.setSelection({
      type: "country",
      data: {
        ...country,
        countryName: country.countryName || country.name,
        metrics: hub?.metrics,
        chartSparkline: hub?.chartSparkline,
      },
      metric: this.activeMetric,
    });
    this.showZoomHint(true);
    this.dataPanel?.setActiveCountry(country.slug);
    this.flyToCountry(region, !fromBreadcrumb);
    this.updateScrollHint();
  }

  flyToCountry(region, animate = true) {
    this.zoomLevel = 1;
    this._layerKey = null;
    this._animateLayers = true;
    this.updateChoropleth();
    this.fitCountryView(animate);
    this.syncLayersForScale(this.viewState?.scale || 1);
  }

  selectCatchment(catchment, countrySlug, fromBreadcrumb = false) {
    this.selection.catchment = catchment;
    this.selection.community = null;
    this.zoomLevel = 2;
    this._layerKey = null;
    this._animateLayers = true;
    this.selectionOverlay.setSelection({
      type: "catchment",
      data: { ...catchment, countrySlug },
      metric: this.activeMetric,
    });
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || "", slug: this.selection.country?.slug, level: "country" },
      { label: catchment.name, slug: catchment.slug, level: "catchment" },
    ]);
    this.renderCatchmentLayer();
    this.highlightCatchment(catchment.id);
    this.renderCommunityLayer();
    if (!fromBreadcrumb) {
      this.fitCatchmentView(catchment, true);
    }
    this.updateScrollHint();
  }

  flyToCatchment(catchment, animate = true) {
    this.fitCatchmentView(catchment, animate);
  }

  selectCommunity(community, countrySlug) {
    const catchment = this.selection.catchment
      || this.drillData.byCountry[this.selection.country?.slug]?.catchments
        ?.find((ct) => ct.communities?.some((c) => c.id === community.id));

    if (catchment && !this.selection.catchment) {
      this.selection.catchment = catchment;
    }

    this.selection.community = community;
    this.selectionOverlay.setSelection({
      type: "community",
      data: {
        ...community,
        countrySlug,
        catchmentSlug: this.selection.catchment?.slug,
      },
      metric: this.activeMetric,
    });
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || "", slug: this.selection.country?.slug, level: "country" },
      { label: this.selection.catchment?.name || "", slug: this.selection.catchment?.slug, level: "catchment" },
      { label: community.name, slug: community.slug, level: "community" },
    ]);
    this.highlightCommunity(community.id);
    this.highlightCatchment(this.selection.catchment?.id);
    this.renderCommunityLayer();
  }

  flyToCommunity() {
    this.renderCommunityLayer();
  }

  panToFeatureBBox(bbox, maxScaleCap, animate = true) {
    if (!bbox) return;
    const current = this.viewState?.scale || 1;
    const cap = Math.min(maxScaleCap, current * 1.06);
    const target = computeZoomToBBox(bbox, this.svg, this.canvas, 0.18, cap);
    this.applyView(target, animate);
  }

  refreshSelection() {
    if (this.selection.community) {
      this.selectionOverlay.setSelection({
        type: "community",
        data: {
          ...this.selection.community,
          countrySlug: this.selection.country?.slug,
          catchmentSlug: this.selection.catchment?.slug,
        },
        metric: this.activeMetric,
      });
    } else if (this.selection.catchment) {
      this.selectionOverlay.setSelection({
        type: "catchment",
        data: { ...this.selection.catchment, countrySlug: this.selection.country?.slug },
        metric: this.activeMetric,
      });
    } else if (this.selection.country) {
      const hub = this.drillData.byCountry[this.selection.country.slug];
      this.selectionOverlay.setSelection({
        type: "country",
        data: {
          ...this.selection.country,
          countryName: this.selection.country.countryName || this.selection.country.name,
          metrics: hub?.metrics,
        },
        metric: this.activeMetric,
      });
    }
  }

  applyView(target, animate = true) {
    gsap.set(this.camera, { transformOrigin: "0 0" });
    this.animating = animate;

    const done = () => {
      this.viewState = { x: target.x, y: target.y, scale: target.scale };
      this.animating = false;
      this.wheelController?.syncTarget(this.viewState);
      this.tryAutoPromote(target.scale);
      this.syncLayersForScale(target.scale);
      this.updateChoropleth();
    };

    if (animate) {
      this.wheelController?.syncTarget(target);
      gsap.to(this.camera, {
        x: target.x,
        y: target.y,
        scale: target.scale,
        duration: 0.65,
        ease: "power3.inOut",
        onComplete: done,
      });
    } else {
      gsap.set(this.camera, { x: target.x, y: target.y, scale: target.scale });
      done();
    }
  }

  layerStateKey() {
    return [
      this.selection.country?.slug || "",
      this.selection.catchment?.id || "",
      this.selection.community?.id || "",
      this.zoomLevel,
    ].join("|");
  }

  syncLayersForScale(scale) {
    void scale;
    const showCatchments = this.zoomLevel >= 1 && this.selection.country;
    const showCommunities = this.zoomLevel >= 2 && this.selection.catchment;

    if (!showCatchments) {
      if (this._layersVisible) {
        this.fadeOutLayers(() => {
          this.catchmentLayer.innerHTML = "";
          this.communityLayer.innerHTML = "";
          this._layersVisible = false;
          this._layerKey = null;
        });
      }
      this.showZoomHint(this.zoomLevel === 0);
      return;
    }

    const key = this.layerStateKey();
    if (key !== this._layerKey) {
      this._layerKey = key;
      this.renderCatchmentLayer();
      if (showCommunities) {
        this.renderCommunityLayer();
      } else {
        this.communityLayer.innerHTML = "";
      }
      if (this.selection.catchment) this.highlightCatchment(this.selection.catchment.id);
      if (this.selection.community) this.highlightCommunity(this.selection.community.id);
      this._layersVisible = true;
      if (this._animateLayers) {
        this._animateLayers = false;
        this.animateMapLayerEntrance();
      }
    }

    this.showZoomHint(this.zoomLevel <= 2);
    this.updateScrollHint();
  }

  fadeOutLayers(done) {
    const layers = [this.catchmentLayer, this.communityLayer].filter((el) => el?.childElementCount);
    if (!layers.length || typeof gsap === "undefined") {
      done?.();
      return;
    }
    gsap.to(layers, {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in",
      onComplete: () => {
        layers.forEach((el) => {
          gsap.set(el, { opacity: 1 });
        });
        done?.();
      },
    });
  }

  animateMapLayerEntrance(extraSelector) {
    if (typeof gsap === "undefined") return;

    const catchmentItems = this.catchmentLayer?.querySelectorAll(
      ".catchment-zone, .catchment-name, .catchment-anchor"
    );
    const communityItems = this.communityLayer?.querySelectorAll(
      extraSelector || ".community-name, .community-anchor"
    );

    const animateGroup = (items, fromScale, stagger) => {
      if (!items?.length) return;
      gsap.from(items, {
        opacity: 0,
        scale: fromScale,
        transformOrigin: "center center",
        duration: 0.42,
        stagger,
        ease: "power2.out",
        clearProps: "opacity",
      });
    };

    animateGroup(catchmentItems, 0.35, 0.035);
    animateGroup(communityItems, 0.25, 0.02);
  }

  zoomStep(factor) {
    this._suppressClicksUntil = Date.now() + 350;
    const cx = this.canvas.clientWidth / 2;
    const cy = this.canvas.clientHeight / 2;
    const state = this.viewState;
    const prevScale = state.scale;
    const newScale = Math.max(0.35, Math.min(4, state.scale * factor));
    const ratio = newScale / state.scale;
    this.applyView(
      {
        x: cx - (cx - state.x) * ratio,
        y: cy - (cy - state.y) * ratio,
        scale: newScale,
      },
      true
    );
    if (newScale < prevScale) this.handleZoomOut(newScale);
    else this.tryAutoPromote(newScale);
  }

  getPaCountriesBBox() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let found = false;

    this.countryRegions.forEach((r) => {
      if (!PA_SLUGS.has(r.country.slug)) return;
      const bb = r.pathEl.getBBox();
      minX = Math.min(minX, bb.x);
      minY = Math.min(minY, bb.y);
      maxX = Math.max(maxX, bb.x + bb.width);
      maxY = Math.max(maxY, bb.y + bb.height);
      found = true;
    });

    if (!found) return null;
    const pad = Math.max(maxX - minX, maxY - minY) * 0.1;
    return {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }

  resetToAfrica(animate = true) {
    this.selection = { country: null, catchment: null, community: null };
    this.zoomLevel = 0;
    this._layerKey = null;
    this._layersVisible = false;
    this._animateLayers = false;
    this.selectionOverlay.setSelection(null);
    this.breadcrumb.setItems([{ label: "Africa", slug: null, level: "africa" }]);
    this.countryRegions.forEach((r) => {
      r.setSelected(false);
      r.setHidden(false);
      r.setInteractive(PA_SLUGS.has(r.country.slug));
    });
    this.catchmentLayer.innerHTML = "";
    this.communityLayer.innerHTML = "";
    this.updateChoropleth();
    const target = computeAfricaZoom(this.svg, this.canvas);
    this.baseScale = target.scale;
    this.levelFitScale = target.scale;
    this.countryFitScale = target.scale;
    this.catchmentFitScale = target.scale;
    this.updateWheelBounds();
    this.dataPanel?.setActiveCountry(null);
    this.applyView(target, animate);
  }

  focusCountryFromSidebar(slug) {
    const region = this.countryRegions.find((r) => r.country.slug === slug);
    if (!region) return;
    this.tooltip.hide();
    this.selection.catchment = null;
    this.selection.community = null;
    this.selectCountry(region);
  }

  previewCountryFromSidebar(slug) {
    if (this.zoomLevel >= 1) return;
    this.countryRegions.forEach((region) => {
      if (!PA_SLUGS.has(region.country.slug)) return;
      region.setHovered(Boolean(slug && region.country.slug === slug));
    });
  }

  getCentroidZoom(point, scaleMul = 4) {
    const viewBox = this.svg.viewBox.baseVal;
    const vbW = viewBox.width || 1000;
    const vbH = viewBox.height || 1000;
    const scaleX = this.canvas.clientWidth / vbW;
    const scaleY = this.canvas.clientHeight / vbH;
    const cx = (point.x || 500) * scaleX;
    const cy = (point.y || 500) * scaleY;
    const containerW = this.canvas.clientWidth;
    const containerH = this.canvas.clientHeight;
    const scale = Math.min(scaleMul, 8);
    return {
      x: containerW / 2 - cx * scale,
      y: containerH / 2 - cy * scale,
      scale,
    };
  }

  getLabelSpreadOptions(layer) {
    const scale = this.viewState?.scale || 1;
    const base = this.baseScale || 1;
    const zoomFactor = Math.min(1.8, Math.max(1, scale / base));

    if (layer === "community") {
      return {
        spread: 2.4 * zoomFactor,
        maxOffset: 95 * zoomFactor,
        gap: 8,
        viewScale: scale,
      };
    }

    return {
      spread: 1.8 * zoomFactor,
      maxOffset: 72 * zoomFactor,
      gap: 10,
      viewScale: scale,
    };
  }

  renderCatchmentLayer() {
    this.catchmentLayer.innerHTML = "";
    if (!this.selection.country || this.zoomLevel < 1) return;

    const hub = this.drillData.byCountry[this.selection.country.slug];
    if (!hub?.catchments?.length) return;

    const region = this.getCountryRegion();
    const catchmentFocus = this.zoomLevel >= 2 && this.selection.catchment;
    const catchments = catchmentFocus
      ? hub.catchments.filter((ct) => ct.id === this.selection.catchment.id)
      : hub.catchments;
    const rootG = document.createElementNS(SVG_NS, "g");
    rootG.setAttribute("class", "catchment-layer-root");

    const zonesG = document.createElementNS(SVG_NS, "g");
    zonesG.setAttribute("class", "catchment-zones");
    const zones = buildCatchmentZones(region, hub.catchmentMap, hub.catchments).filter(
      (zone) => !catchmentFocus || zone.id === this.selection.catchment.id
    );

    zones.forEach((zone) => {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", zone.d);
      path.setAttribute("class", `catchment-zone catchment-zone--${zone.status || "inactive"}`);
      path.setAttribute("data-catchment-id", zone.id);
      const ct = hub.catchments.find((item) => item.id === zone.id);
      if (ct) this.bindMapTap(path, () => this.selectCatchment(ct, this.selection.country?.slug));
      zonesG.appendChild(path);
    });
    rootG.appendChild(zonesG);

    const labelsG = document.createElementNS(SVG_NS, "g");
    labelsG.setAttribute("class", "catchment-labels");

    catchments.forEach((ct) => {
      if (ct.x == null || ct.y == null) return;

      const anchor = document.createElementNS(SVG_NS, "circle");
      anchor.setAttribute("cx", ct.x);
      anchor.setAttribute("cy", ct.y);
      anchor.setAttribute("r", 4);
      anchor.setAttribute("class", "catchment-anchor");
      anchor.setAttribute("data-catchment-id", ct.id);
      anchor.setAttribute("aria-hidden", "true");

      const hit = document.createElementNS(SVG_NS, "circle");
      hit.setAttribute("cx", ct.x);
      hit.setAttribute("cy", ct.y);
      hit.setAttribute("r", 16);
      hit.setAttribute("class", "catchment-path catchment-path--hit");
      hit.setAttribute("data-catchment-id", ct.id);
      hit.setAttribute("aria-hidden", "true");

      const est = estimateLabelSize(ct.name, { fontSize: 13 });
      const label = this.createMapNameLabel({
        name: ct.name,
        x: ct.x,
        y: ct.y,
        className: "catchment-name",
        entityId: ct.id,
        inactive: ct.status === "inactive",
      });
      label.setAttribute("data-catchment-id", ct.id);
      label.dataset.estWidth = String(est.width);
      label.dataset.estHeight = String(est.height);

      hit.addEventListener("mouseenter", () => label.classList.add("is-hovered"));
      hit.addEventListener("mouseleave", () => label.classList.remove("is-hovered"));
      this.bindMapTap(hit, () => this.selectCatchment(ct, this.selection.country?.slug));
      this.bindMapTap(label, () => this.selectCatchment(ct, this.selection.country?.slug));

      labelsG.appendChild(anchor);
      labelsG.appendChild(hit);
      labelsG.appendChild(label);
    });

    rootG.appendChild(labelsG);
    this.catchmentLayer.appendChild(rootG);
    labelsG.querySelectorAll(".catchment-name").forEach((label) => this.decorateMapNameLabel(label));
    applyLabelSpread(labelsG, SVG_NS, {
      labelSelector: ".catchment-name",
      ...this.getLabelSpreadOptions("catchment"),
    });

    if (this.selection.catchment) {
      this.highlightCatchment(this.selection.catchment.id);
    }
  }

  createMapNameLabel({ name, x, y, className, entityId, inactive = false, onClick, onHover }) {
    const baseClass = className.split(" ")[0];
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", `${className}${inactive ? " is-inactive" : ""}`);
    if (entityId) g.setAttribute("data-entity-id", entityId);
    g.setAttribute("transform", `translate(${x},${y})`);
    g.dataset.anchorX = String(x);
    g.dataset.anchorY = String(y);
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", name);

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("class", `${baseClass}__text`);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = name;
    g.appendChild(text);

    if (onClick) g.addEventListener("click", onClick);
    if (onHover) {
      g.addEventListener("mouseenter", () => onHover(true));
      g.addEventListener("mouseleave", () => onHover(false));
    }

    g.setAttribute("data-base-class", baseClass);
    return g;
  }

  decorateMapNameLabel(g) {
    const text = g.querySelector("text");
    if (!text) return;
    try {
      const tb = text.getBBox();
      if (tb.width <= 0) return;
      const baseClass = g.getAttribute("data-base-class") || g.getAttribute("class")?.split(" ")[0] || "map-name";
      const padX = 7;
      const padY = 4;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("class", `${baseClass}__bg`);
      rect.setAttribute("x", tb.x - padX);
      rect.setAttribute("y", tb.y - padY);
      rect.setAttribute("width", tb.width + padX * 2);
      rect.setAttribute("height", tb.height + padY * 2);
      rect.setAttribute("rx", 4);
      g.insertBefore(rect, text);
    } catch {
      /* bbox unavailable */
    }
  }

  renderCommunityLayer() {
    this.communityLayer.innerHTML = "";
    if (!this.selection.country || this.zoomLevel < 2 || !this.selection.catchment) return;

    const catchmentId = this.selection.catchment.id;
    const communities = this.getCommunitiesForCountry().filter((com) => com.catchmentId === catchmentId);

    if (!communities.length) return;

    const labelsG = document.createElementNS(SVG_NS, "g");
    labelsG.setAttribute("class", "community-labels");

    communities.forEach((com) => {
      if (com.x == null || com.y == null) return;

      const isDimmed = false;

      const anchor = document.createElementNS(SVG_NS, "circle");
      anchor.setAttribute("cx", com.x);
      anchor.setAttribute("cy", com.y);
      anchor.setAttribute("r", 3.5);
      anchor.setAttribute("class", `community-anchor${isDimmed ? " is-dimmed" : ""}`);
      anchor.setAttribute("data-community-id", com.id);
      anchor.setAttribute("aria-hidden", "true");

      const hit = document.createElementNS(SVG_NS, "circle");
      hit.setAttribute("cx", com.x);
      hit.setAttribute("cy", com.y);
      hit.setAttribute("r", 10);
      hit.setAttribute("class", "community-path--hit");
      hit.setAttribute("data-community-id", com.id);
      hit.setAttribute("aria-hidden", "true");

      const est = estimateLabelSize(com.name, { fontSize: 11 });
      const label = this.createMapNameLabel({
        name: com.name,
        x: com.x,
        y: com.y,
        className: `community-name community-marker${isDimmed ? " is-dimmed" : ""}`,
        entityId: com.id,
        inactive: com.status === "inactive",
      });
      label.setAttribute("data-community-id", com.id);
      label.dataset.estWidth = String(est.width);
      label.dataset.estHeight = String(est.height);

      hit.addEventListener("mouseenter", () => label.classList.add("is-hovered"));
      hit.addEventListener("mouseleave", () => label.classList.remove("is-hovered"));

      labelsG.appendChild(anchor);
      labelsG.appendChild(hit);
      labelsG.appendChild(label);
    });

    this.communityLayer.appendChild(labelsG);
    labelsG.querySelectorAll(".community-name").forEach((label) => this.decorateMapNameLabel(label));
    applyLabelSpread(labelsG, SVG_NS, {
      labelSelector: ".community-name:not(.is-dimmed)",
      ...this.getLabelSpreadOptions("community"),
    });

    if (this.selection.community) {
      this.highlightCommunity(this.selection.community.id);
    }
  }

  highlightCatchment(id) {
    this.catchmentLayer?.querySelectorAll(".catchment-zone").forEach((p) => {
      p.classList.toggle("is-selected", p.dataset.catchmentId === id);
      p.classList.toggle("is-dimmed", id && p.dataset.catchmentId !== id);
    });
    this.catchmentLayer?.querySelectorAll(".catchment-path").forEach((p) => {
      p.classList.toggle("is-selected", p.dataset.catchmentId === id);
    });
    this.catchmentLayer?.querySelectorAll(".catchment-name").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.catchmentId === id);
      el.classList.toggle("is-dimmed", id && el.dataset.catchmentId !== id);
    });
    this.catchmentLayer?.querySelectorAll(".catchment-anchor").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.catchmentId === id);
    });
  }

  highlightCommunity(id) {
    this.communityLayer?.querySelectorAll(".community-marker").forEach((m) => {
      m.classList.toggle("is-selected", m.dataset.communityId === id);
    });
    this.communityLayer?.querySelectorAll(".community-anchor").forEach((m) => {
      m.classList.toggle("is-selected", m.dataset.communityId === id);
    });
  }

  showZoomHint(show) {
    if (!this.scrollHint) return;
    this.scrollHint.style.opacity = show ? "1" : "0";
    if (show) this.updateScrollHint();
  }

  updateScrollHint() {
    if (!this.scrollHint) return;

    const hub = this.drillData?.byCountry?.[this.selection.country?.slug];
    const catchmentCount = hub?.catchments?.length || 0;

    if (this.zoomLevel === 0) {
      this.scrollHint.textContent = "Scroll or click a country to zoom in · catchments & communities appear inside";
      return;
    }

    if (this.zoomLevel === 1 && catchmentCount === 0) {
      const name = this.selection.country?.countryName || this.selection.country?.name || "this country";
      this.scrollHint.textContent = `Catchment boundaries are not mapped for ${name} yet · try Kenya, Malawi, Zambia, or Ethiopia`;
      return;
    }

    if (this.zoomLevel === 1) {
      this.scrollHint.textContent = "Scroll to zoom into a catchment · region names are shown on the map";
      return;
    }

    if (this.zoomLevel === 2) {
      this.scrollHint.textContent = "Scroll to zoom into communities within this catchment";
      return;
    }

    this.scrollHint.textContent = "Scroll out to return to catchment or country view";
  }

  setCountrySelectHandler(fn) {
    this._countrySelectHandler = fn;
  }

  destroy() {
    this.tooltip.hide();
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("wheel", this._onPageWheel, { capture: true });
    this._resizeObserver?.disconnect();
    clearTimeout(this._resizeTimer);
    clearTimeout(this._scaleDebounce);
    this.wheelController?.destroy();
    this.wheelController = null;
    document.getElementById("site-header")?.classList.remove("site-header--dark");
    if (this.root) this.root.innerHTML = "";
    this.regions = [];
    this.countryRegions = [];
    this.animating = false;
    this.zoomLevel = 0;
  }
}
