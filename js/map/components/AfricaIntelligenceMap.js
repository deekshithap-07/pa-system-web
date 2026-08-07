import { loadMapRegions, attachCoordinates } from "./RegionLoader.js";
import { createCountryRegions } from "./CountryRegion.js";
import { CountryTooltip } from "./CountryTooltip.js";
import { MapLegend } from "./MapLegend.js";
import { MapControls } from "./MapControls.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { MapDataPanel } from "./MapDataPanel.js";
import { MapSelectionOverlay } from "./MapSelectionOverlay.js";
import { MapClusterLayer } from "./MapClusterLayer.js";
import { MapLevelCards } from "./MapLevelCards.js";
import { MapWheelController } from "./MapWheelController.js";
import {
  computeAfricaViewBox,
  computeViewBoxForBBox,
  expandBBoxWithPoints,
  viewBoxZoomRatio,
  wheelZoomViewBox,
  clampViewBoxWidth,
} from "../utils/geo.js";
import { buildDrillDownData, getMetricValue, PA_SLUGS } from "../utils/drill-down-data.js";
import { applyLabelSpread, estimateLabelSize } from "../utils/label-layout.js";
import { buildCatchmentZones, getCatchmentDrillBBox } from "../utils/catchment-path-project.js";

const LEVEL_LABELS = ["Africa", "Country", "Catchment", "Community"];
const SVG_NS = "http://www.w3.org/2000/svg";

const PROMOTE_COUNTRY_RATIO = 1.75;
const DEMOTE_AFRICA_RATIO = 1.45;
const PROMOTE_CATCHMENT_MUL = 1.38;
const DEMOTE_CATCHMENT_MUL = 0.88;
const PROMOTE_COMMUNITY_MUL = 1.32;
const DEMOTE_COMMUNITY_MUL = 0.86;
const DEMOTE_COUNTRY_MUL = 0.82;
const COUNTRY_FIT_PADDING = 0.14;
const CATCHMENT_FIT_PADDING = 0.1;
const COMMUNITIES_FIT_PADDING = 0.08;
const ZOOM_ANIM_DURATION = 1.05;

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
    this.baseViewBox = null;
    this.countryFitViewBox = null;
    this.catchmentFitViewBox = null;
    this.communitiesFitViewBox = null;
    this._layersVisible = false;
    this._layerKey = null;
    this._animateLayers = false;
    this._prevZoomRatio = 1;
  }

  getZoomRatio() {
    if (!this.baseViewBox || !this.viewState?.width) return 1;
    return viewBoxZoomRatio(this.baseViewBox, this.viewState);
  }

  getCountryFitRatio() {
    if (!this.baseViewBox || !this.countryFitViewBox?.width) return PROMOTE_COUNTRY_RATIO;
    return viewBoxZoomRatio(this.baseViewBox, this.countryFitViewBox);
  }

  getCatchmentFitRatio() {
    if (!this.baseViewBox || !this.catchmentFitViewBox?.width) {
      return this.getCountryFitRatio() * PROMOTE_CATCHMENT_MUL;
    }
    return viewBoxZoomRatio(this.baseViewBox, this.catchmentFitViewBox);
  }

  getZoomThresholds() {
    const countryFit = this.getCountryFitRatio();
    const catchmentFit = this.getCatchmentFitRatio();
    return {
      inCountry: PROMOTE_COUNTRY_RATIO,
      outAfrica: DEMOTE_AFRICA_RATIO,
      inCatchment: countryFit * PROMOTE_CATCHMENT_MUL,
      outCatchment: countryFit * DEMOTE_CATCHMENT_MUL,
      inCommunity: catchmentFit * PROMOTE_COMMUNITY_MUL,
      outCommunity: catchmentFit * DEMOTE_COMMUNITY_MUL,
      outCountry: countryFit * DEMOTE_COUNTRY_MUL,
    };
  }

  updateWheelBounds() {
    if (!this.wheelController || !this.baseViewBox) return;
    const baseW = this.baseViewBox.width;
    if (this.zoomLevel === 0) {
      this.wheelController.setWidthBounds(baseW * 0.28, baseW * 1.02);
    } else if (this.zoomLevel === 1) {
      const fitW = this.countryFitViewBox?.width || baseW * 0.42;
      this.wheelController.setWidthBounds(fitW * 0.52, fitW * 1.08);
    } else {
      const fitW = this.catchmentFitViewBox?.width || baseW * 0.18;
      this.wheelController.setWidthBounds(fitW * 0.48, fitW * 1.1);
    }
  }

  fitCountryView(animate = true) {
    const region = this.getCountryRegion();
    if (!region) return;
    const hub = this.drillData.byCountry[this.selection.country.slug];
    const pathBBox = region.pathEl.getBBox();
    const bbox = expandBBoxWithPoints(pathBBox, hub?.catchments || [], 0.1);
    const target = computeViewBoxForBBox(
      bbox,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      COUNTRY_FIT_PADDING
    );
    this.countryFitViewBox = target;
    this.updateWheelBounds();
    this.applyView(target, animate);
  }

  fitCommunitiesView(catchment = null, animate = true) {
    const region = this.getCountryRegion();
    const hub = this.drillData.byCountry[this.selection.country?.slug];
    if (!region || !hub) return;

    let points = this.getCommunitiesForCountry();
    if (catchment) {
      points = points.filter((c) => c.catchmentId === catchment.id);
    }
    if (!points.length) points = hub.catchments || [];

    let bbox = region.pathEl.getBBox();
    bbox = expandBBoxWithPoints(bbox, points, 0.14);
    const padding = catchment ? CATCHMENT_FIT_PADDING : COMMUNITIES_FIT_PADDING;
    const target = computeViewBoxForBBox(
      bbox,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      padding
    );
    this.communitiesFitViewBox = target;
    this.catchmentFitViewBox = target;
    this.updateWheelBounds();
    this.applyView(target, animate);
  }

  updateLevelCard() {
    const hub = this.selection.country
      ? this.drillData.byCountry[this.selection.country.slug]
      : null;
    this.levelCards?.setLevelFromZoom(this.zoomLevel, {
      drillData: this.drillData,
      paCountries: this.drillData.paCountries,
      country: this.selection.country,
      hub,
      catchment: this.selection.catchment,
      community: this.selection.community,
    });
  }

  syncClusterLayer() {
    if (!this.clusterLayer) return;
    const show = this.zoomLevel === 0;
    this.clusterLayer.setVisible(show);
    if (show && !this.clusterLayer.layer?.childElementCount) {
      this.clusterLayer.render(this.countryRegions, this.drillData, {
        onClusterClick: (region) => this.selectCountry(region),
      });
      this.clusterLayer.animateIn();
    }
  }

  fitCatchmentView(catchment, animate = true) {
    this.fitCommunitiesView(catchment, animate);
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

    if (!this.config?.hideSidebar && this.sidebarEl) {
      this.dataPanel = new MapDataPanel(this.sidebarEl, {
        countries: this.drillData.paCountries,
        drillData: this.drillData.byCountry,
        config: this.config,
        onCountrySelect: (country) => this.focusCountryFromSidebar(country.slug),
        onCountryHover: (country) => this.previewCountryFromSidebar(country?.slug || null),
      });
    }

    this.selectionOverlay = new MapSelectionOverlay(this.overlayEl);
    this.clusterLayer = new MapClusterLayer(this.svg);
    this.levelCards = new MapLevelCards(this.levelCardEl);

    this.legend = new MapLegend(this.legendEl, { mode: "choropleth" });
    this.controls = new MapControls(this.controlsEl, {
      onZoomIn: () => this.zoomStep(1.12),
      onZoomOut: () => this.zoomStep(1 / 1.12),
      onReset: () => this.resetToAfrica(true),
    });

    this.viewState = { x: 0, y: 0, width: 1000, height: 1000 };
    this._suppressClicksUntil = 0;
    this.wheelController = new MapWheelController(this.canvas, {
      getViewState: () => this.viewState,
      applyView: (v, animate) => this.applyView(v, animate),
      onZoomChange: () => this.handleZoomChange(),
      minWidth: 40,
      maxWidth: 2000,
      embedMode: Boolean(this.config?.pageLayout || this.config?.embedMode),
    });

    if (!this.config?.pageLayout) {
      this._onPageWheel = (e) => {
        if (!document.body.classList.contains("africa-map-active")) return;
        if (e.target.closest(".ai-map__sidebar-panel")) return;
        if (e.target.closest(".ai-map__canvas")) return;
        e.preventDefault();
      };
      document.addEventListener("wheel", this._onPageWheel, { passive: false, capture: true });
    }

    this.updateMetricHeader();
    this.bindCountryEvents();

    requestAnimationFrame(() => {
      this.initMapView();
      this.clusterLayer.render(this.countryRegions, this.drillData, {
        onClusterClick: (region) => this.selectCountry(region),
      });
      this.clusterLayer.animateIn();
      this.updateLevelCard();
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
    if (this.zoomLevel >= 2) {
      this.fitCommunitiesView(this.selection.catchment, animate);
    } else if (this.selection.country) {
      this.fitCountryView(animate);
    } else {
      const target = computeAfricaViewBox(this.svg, this.canvas);
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

  handleZoomChange() {
    if (this.animating) return;
    this._suppressClicksUntil = Date.now() + 350;
    clearTimeout(this._scaleDebounce);
    this._scaleDebounce = setTimeout(() => {
      const ratio = this.getZoomRatio();
      const prev = this._prevZoomRatio ?? ratio;
      if (ratio < prev) {
        this.handleZoomOut(ratio);
      } else {
        this.tryAutoPromote(ratio);
      }
      this.syncLayersForScale(ratio);
      this._prevZoomRatio = ratio;
    }, 40);
  }

  tryAutoPromote(ratio) {
    const t = this.getZoomThresholds();

    if (this.zoomLevel === 0 && ratio >= t.inCountry) {
      const region = this.detectCountryAtCenter();
      if (region) this.promoteToCountry(region);
      return;
    }

    if (this.zoomLevel === 1 && !this.selection.catchment) {
      const countryFit = this.getCountryFitRatio();
      const atCeiling = ratio >= countryFit * PROMOTE_CATCHMENT_MUL * 0.95;
      if (ratio >= t.inCatchment || atCeiling) {
        const catchment = this.detectCatchmentAtCenter() || this.nearestCatchmentToCenter();
        this.promoteToCommunities(catchment, null);
      }
      return;
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
    const vb = this.viewState;
    return {
      x: vb.x + vb.width / 2,
      y: vb.y + vb.height / 2,
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
      this.syncLayersForScale(this.getZoomRatio());
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
    this.syncClusterLayer();
    this.updateLevelCard();
    this.fitCountryView(true);
    this.updateScrollHint();
  }

  promoteToCommunities(catchment = null, community = null) {
    if (this.zoomLevel === 2 && !catchment && !community) {
      this.syncLayersForScale(this.getZoomRatio());
      return;
    }

    this.selection.catchment = catchment;
    this.selection.community = null;
    this.zoomLevel = 2;
    this._layerKey = null;
    this._animateLayers = true;

    const hub = this.drillData.byCountry[this.selection.country?.slug];
    const crumbLabel = catchment?.name || this.selection.country?.countryName || "";
    this.breadcrumb.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: this.selection.country?.countryName || this.selection.country?.name || "", slug: this.selection.country?.slug, level: "country" },
      { label: crumbLabel, slug: catchment?.slug || null, level: "catchment" },
    ]);
    if (catchment?.slug) {
      this.selectionOverlay.setSelection({
        type: "catchment",
        data: {
          ...catchment,
          countrySlug: this.selection.country?.slug,
          metrics: hub?.metrics,
        },
        metric: this.activeMetric,
      });
    } else {
      this.selectionOverlay.setSelection(null);
    }
    this.syncClusterLayer();
    this.updateLevelCard();
    this.fitCommunitiesView(catchment, true);
    this.updateScrollHint();
  }

  focusCommunity(community) {
    if (this.selection.community?.id === community.id) return;
    const catchment = this.selection.catchment
      || this.drillData.byCountry[this.selection.country?.slug]?.catchments
        ?.find((ct) => ct.communities?.some((c) => c.id === community.id));
    this.selection.catchment = catchment || null;
    this.selection.community = null;
    this._layerKey = null;
    this.updateLevelCard();
    if (catchment) this.highlightCatchment(catchment.id);
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
    this.promoteToCommunities(catchment, null);
  }

  promoteToCommunity(community) {
    this.focusCommunity(community);
  }

  handleZoomOut(ratio) {
    const t = this.getZoomThresholds();
    if (this.zoomLevel >= 2 && ratio < t.outCatchment) {
      this.clearCatchmentSelection();
    } else if (this.zoomLevel === 1 && ratio < t.outCountry) {
      this.demoteToAfrica();
    } else {
      this.syncLayersForScale(ratio);
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
    this.updateLevelCard();
  }

  demoteToAfrica() {
    this.selection = { country: null, catchment: null, community: null };
    this.zoomLevel = 0;
    this._layerKey = null;
    this._layersVisible = false;
    this.countryFitViewBox = null;
    this.catchmentFitViewBox = null;
    this._prevZoomRatio = 1;
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
    const target = computeAfricaViewBox(this.svg, this.canvas);
    this.baseViewBox = target;
    this.countryFitViewBox = null;
    this.catchmentFitViewBox = null;
    this.communitiesFitViewBox = null;
    this._prevZoomRatio = 1;
    this.updateWheelBounds();
    this.dataPanel?.setActiveCountry(null);
    this.syncClusterLayer();
    this.updateLevelCard();
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
      { label: this.selection.country?.countryName || this.selection.country?.name || "", slug: this.selection.country?.slug, level: "country" },
      { label: this.selection.catchment.name, slug: this.selection.catchment.slug, level: "catchment" },
    ]);
    this.fitCatchmentView(this.selection.catchment, true);
  }

  buildHTML() {
    const hideSidebar = this.config?.hideSidebar;
    const pageLayout = this.config?.pageLayout;
    const mapClass = `ai-map${hideSidebar ? " ai-map--full" : ""}${pageLayout ? " ai-map--embedded" : ""}`;

    return `
      <div class="${mapClass}">
        ${
          hideSidebar
            ? ""
            : `<aside class="ai-map__sidebar" id="ai-map-sidebar" aria-label="PA network countries">
          <div class="ai-map__sidebar-panel" id="ai-map-sidebar-panel"></div>
        </aside>`
        }
        <div class="ai-map__main">
          <div class="ai-map__canvas-wrap">
            ${
              pageLayout
                ? ""
                : `<header class="ai-map__header">
              <div id="ai-map-breadcrumb"></div>
              <h1 id="ai-map-title"></h1>
              <p id="ai-map-subtitle"></p>
            </header>`
            }
            <div class="ai-map__canvas" id="ai-map-canvas">
              ${pageLayout ? `<div class="ai-map__breadcrumb-embed" id="ai-map-breadcrumb"></div>` : ""}
              <div class="ai-map__scroll-hint" id="ai-scroll-hint" aria-hidden="true">
                Scroll or click a country to zoom in · catchment names appear inside
              </div>
              <div class="ai-map__camera" id="ai-map-camera">
                <svg id="ai-map-svg" role="img" aria-label="Interactive map of Africa"></svg>
              </div>
              <div class="ai-map__overlay" id="ai-map-overlay"></div>
              <div class="ai-map__level-card" id="ai-map-level-card" aria-live="polite"></div>
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
    this.levelCardEl = this.root.querySelector("#ai-map-level-card");
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
    const selectedSlug = this.selection.country?.slug;

    this.countryRegions.forEach((region) => {
      const isPa = PA_SLUGS.has(region.country.slug);
      const selected = isPa && region.country.slug === selectedSlug;
      region.setHidden(false);
      region.setSelected(selected);

      if (zoomedIn) {
        region.setHidden(false);
        region.setDimmed(!selected && isPa);
        region.setInteractive(isPa);
        if (selected) {
          region.setChoropleth(0.92);
        } else if (isPa) {
          const val = this.getCountryMetricValue(region.country);
          const intensity = Math.max(0.12, (val / max) * 0.32);
          region.setChoropleth(intensity);
        } else {
          region.setChoropleth(0.06);
        }
        return;
      }

      region.setSelected(false);

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
        if (this.animating) return;
        if (this.zoomLevel >= 1 && this.selection.country?.slug !== country.slug) {
          region.setHovered(true);
          return;
        }
        if (this.zoomLevel >= 1) return;
        region.setHovered(true);
        this.tooltip.show(country, e.clientX, e.clientY);
      });

      region.on("mousemove", (e) => {
        if (this.zoomLevel === 0) this.tooltip.position(e.clientX, e.clientY);
      });

      region.on("mouseleave", () => {
        region.setHovered(false);
        this.tooltip.hide();
      });

      this.bindMapTap(region.pathEl, () => {
        if (this.zoomLevel === 0 || this.selection.country?.slug !== country.slug) {
          this.selectCountry(region);
        }
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
    this.syncClusterLayer();
    this.updateLevelCard();
    this.updateScrollHint();
  }

  flyToCountry(region, animate = true) {
    this.zoomLevel = 1;
    this._layerKey = null;
    this._animateLayers = true;
    this.updateChoropleth();
    this.fitCountryView(animate);
    this.syncClusterLayer();
    this.updateLevelCard();
    this.syncLayersForScale(this.getZoomRatio());
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
      { label: this.selection.country?.countryName || this.selection.country?.name || "", slug: this.selection.country?.slug, level: "country" },
      { label: catchment.name, slug: catchment.slug, level: "catchment" },
    ]);
    this.renderCatchmentLayer();
    this.highlightCatchment(catchment.id);
    this.updateLevelCard();
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
      { label: this.selection.country?.countryName || this.selection.country?.name || "", slug: this.selection.country?.slug, level: "country" },
      { label: this.selection.catchment?.name || "", slug: this.selection.catchment?.slug, level: "catchment" },
      { label: community.name, slug: community.slug, level: "community" },
    ]);
    this.highlightCommunity(community.id);
    this.highlightCatchment(this.selection.catchment?.id);
    this.renderCommunityLayer();
    if (community.x != null && community.y != null) {
      this.panToFeatureBBox(
        { x: community.x - 30, y: community.y - 30, width: 60, height: 60 },
        6,
        true
      );
    }
  }

  flyToCommunity() {
    this.renderCommunityLayer();
  }

  panToFeatureBBox(bbox, _maxScaleCap, animate = true) {
    if (!bbox) return;
    const target = computeViewBoxForBBox(
      bbox,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      0.14
    );
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

  setViewBox(vb) {
    if (!vb?.width) return;
    this.svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  }

  applyView(target, animate = true) {
    gsap.set(this.camera, { x: 0, y: 0, scale: 1, clearProps: "transform" });
    this.animating = animate;

    const done = () => {
      this.viewState = {
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
      };
      this.setViewBox(this.viewState);
      this.animating = false;
      this.wheelController?.syncTarget(this.viewState);
      const ratio = this.getZoomRatio();
      this.tryAutoPromote(ratio);
      this.syncLayersForScale(ratio);
      this.updateChoropleth();
      this.syncClusterLayer();
      this.updateLevelCard();
      this._prevZoomRatio = ratio;
    };

    if (animate) {
      this.wheelController?.syncTarget(target);
      const proxy = { ...this.viewState };
      gsap.to(proxy, {
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
        duration: ZOOM_ANIM_DURATION,
        ease: "power2.inOut",
        onUpdate: () => this.setViewBox(proxy),
        onComplete: done,
      });
    } else {
      this.setViewBox(target);
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

  syncLayersForScale(ratio) {
    void ratio;
    const showCatchments = this.zoomLevel >= 1 && this.selection.country;
    const showCommunities = this.zoomLevel >= 2 && this.selection.country;

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
    } else {
      this.refreshLabelSpread();
    }

    this.showZoomHint(this.zoomLevel <= 2);
    this.updateScrollHint();
  }

  refreshLabelSpread() {
    const catchLabels = this.catchmentLayer?.querySelector(".catchment-labels");
    if (catchLabels?.childElementCount) {
      applyLabelSpread(catchLabels, SVG_NS, {
        labelSelector: ".catchment-name",
        ...this.getLabelSpreadOptions("catchment"),
      });
    }
    const commLabels = this.communityLayer?.querySelector(".community-labels");
    if (commLabels?.childElementCount) {
      applyLabelSpread(commLabels, SVG_NS, {
        labelSelector: ".community-name:not(.is-dimmed)",
        ...this.getLabelSpreadOptions("community"),
      });
    }
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
    const prevRatio = this.getZoomRatio();
    let next = wheelZoomViewBox(
      state,
      cx,
      cy,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      factor
    );
    const bounds = this.wheelController;
    if (bounds) {
      next = clampViewBoxWidth(next, bounds.minWidth, bounds.maxWidth);
    }
    this.applyView(next, true);
    const newRatio = this.getZoomRatio();
    if (newRatio < prevRatio) this.handleZoomOut(newRatio);
    else this.tryAutoPromote(newRatio);
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
    const target = computeAfricaViewBox(this.svg, this.canvas);
    this.baseViewBox = target;
    this.countryFitViewBox = null;
    this.catchmentFitViewBox = null;
    this.communitiesFitViewBox = null;
    this._prevZoomRatio = 1;
    this.updateWheelBounds();
    this.dataPanel?.setActiveCountry(null);
    this.syncClusterLayer();
    this.updateLevelCard();
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
    this.countryRegions.forEach((region) => {
      if (!PA_SLUGS.has(region.country.slug)) return;
      const isMatch = Boolean(slug && region.country.slug === slug);
      const isSelected = this.selection.country?.slug === region.country.slug;
      region.setHovered(isMatch && !isSelected);
    });
  }

  getCentroidZoom(point, padding = 0.16) {
    const bbox = {
      x: (point.x || 500) - 20,
      y: (point.y || 500) - 20,
      width: 40,
      height: 40,
    };
    return computeViewBoxForBBox(
      bbox,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      padding
    );
  }

  getLabelSpreadOptions(layer) {
    const ratio = this.getZoomRatio();
    const zoomFactor = Math.min(2.4, Math.max(1, ratio / 1.4));

    if (layer === "community") {
      return {
        spread: 3 * zoomFactor,
        maxOffset: 140 * zoomFactor,
        gap: 10,
        viewScale: ratio,
      };
    }

    return {
      spread: 1.2 * zoomFactor,
      maxOffset: 36 * zoomFactor,
      gap: 5,
      viewScale: ratio,
    };
  }

  renderCatchmentLayer() {
    this.catchmentLayer.innerHTML = "";
    if (!this.selection.country || this.zoomLevel < 1) return;

    const hub = this.drillData.byCountry[this.selection.country.slug];
    if (!hub?.catchments?.length) return;

    const catchments = hub.catchments;
    const rootG = document.createElementNS(SVG_NS, "g");
    rootG.setAttribute("class", "catchment-layer-root");

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

      const est = estimateLabelSize(ct.name, { fontSize: 7 });
      const label = this.createMapNameLabel({
        name: ct.name,
        x: ct.x,
        y: ct.y,
        className: "catchment-name",
        entityId: ct.id,
        inactive: ct.status === "inactive",
        fontSize: 7,
      });
      label.setAttribute("data-catchment-id", ct.id);
      label.dataset.estWidth = String(est.width);
      label.dataset.estHeight = String(est.height);

      hit.addEventListener("mouseenter", () => label.classList.add("is-hovered"));
      hit.addEventListener("mouseleave", () => label.classList.remove("is-hovered"));
      this.bindMapTap(hit, () => this.promoteToCommunities(ct, null));
      this.bindMapTap(label, () => this.promoteToCommunities(ct, null));

      labelsG.appendChild(anchor);
      labelsG.appendChild(hit);
      labelsG.appendChild(label);
    });

    rootG.appendChild(labelsG);
    this.catchmentLayer.appendChild(rootG);
    applyLabelSpread(labelsG, SVG_NS, {
      labelSelector: ".catchment-name",
      ...this.getLabelSpreadOptions("catchment"),
    });

    if (this.selection.catchment) {
      this.highlightCatchment(this.selection.catchment.id);
    }
  }

  createMapNameLabel({ name, x, y, className, entityId, inactive = false, onClick, onHover, fontSize = 9 }) {
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
    text.setAttribute("font-size", String(fontSize));
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
    const countrySlug = this.selection.country?.slug;
    const hub = this.drillData.byCountry[countrySlug];
    if (!hub) return;

    const pool = this.selection.catchment
      ? hub.catchments
          .find((ct) => ct.id === this.selection.catchment.id)
          ?.communities?.slice() || []
      : this.getCommunitiesForCountry();

    if (!pool.length) return;

    const rootG = document.createElementNS(SVG_NS, "g");
    rootG.setAttribute("class", "community-layer-root");

    const labelsG = document.createElementNS(SVG_NS, "g");
    labelsG.setAttribute("class", "community-labels");

    pool.forEach((com) => {
      if (com.x == null || com.y == null) return;

      const anchor = document.createElementNS(SVG_NS, "circle");
      anchor.setAttribute("cx", com.x);
      anchor.setAttribute("cy", com.y);
      anchor.setAttribute("r", 4);
      anchor.setAttribute("class", "community-anchor community-marker");
      anchor.setAttribute("data-community-id", com.id);
      anchor.setAttribute("aria-hidden", "true");

      const hit = document.createElementNS(SVG_NS, "circle");
      hit.setAttribute("cx", com.x);
      hit.setAttribute("cy", com.y);
      hit.setAttribute("r", 14);
      hit.setAttribute("class", "community-path community-path--hit");
      hit.setAttribute("data-community-id", com.id);
      hit.setAttribute("aria-hidden", "true");

      const label = this.createMapNameLabel({
        name: com.name,
        x: com.x,
        y: com.y,
        className: "community-name",
        entityId: com.id,
        inactive: com.status === "inactive",
        fontSize: 8,
      });
      label.setAttribute("data-community-id", com.id);

      const select = () => this.selectCommunity(com, countrySlug);
      hit.addEventListener("mouseenter", () => label.classList.add("is-hovered"));
      hit.addEventListener("mouseleave", () => label.classList.remove("is-hovered"));
      this.bindMapTap(hit, select);
      this.bindMapTap(label, select);

      labelsG.appendChild(anchor);
      labelsG.appendChild(hit);
      labelsG.appendChild(label);
    });

    rootG.appendChild(labelsG);
    this.communityLayer.appendChild(rootG);

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
    this.scrollHint.style.opacity = "0";
  }

  updateScrollHint() {
    /* Guidance lives in the right sidebar card only */
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
