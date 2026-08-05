import { loadMapRegions, attachCoordinates } from "./RegionLoader.js";
import { createCountryRegions } from "./CountryRegion.js";
import { CountryTooltip } from "./CountryTooltip.js";
import { MapLegend } from "./MapLegend.js";
import { MapControls } from "./MapControls.js";
import { Breadcrumb } from "./Breadcrumb.js";
import { ZoomController } from "./ZoomController.js";
import { NavigationTransition } from "./NavigationTransition.js";
import { formatNumber } from "../../utils/format.js";

export class AfricaMap {
  constructor() {
    this.regions = [];
    this.countryRegions = [];
    this.scrollTriggers = [];
    this.onCountrySelect = null;
    this.selecting = false;
    this.tooltip = new CountryTooltip();
    this.navTransition = new NavigationTransition();
  }

  mount({
    stageRoot,
    countries,
    mapPaths,
    mapOverlay,
    mapMetrics,
    byNumbers,
    hero,
  }) {
    this.destroy();
    this.stageRoot = stageRoot;
    this.mapPaths = mapPaths;
    this.hero = hero;
    this.byNumbers = byNumbers;
    this.regions = loadMapRegions({ countries, mapPaths, mapOverlay, mapMetrics });

    stageRoot.innerHTML = this.buildStageHTML();
    this.cacheElements();
    this.buildSVG();
    this.regions = attachCoordinates(this.regions, this.svg);
    this.countryRegions = createCountryRegions(this.regions, this.svg);

    this.zoom = new ZoomController({
      camera: this.camera,
      svg: this.svg,
      container: this.canvas,
      heroSlot: this.heroSlot,
    });

    this.breadcrumb = new Breadcrumb(this.breadcrumbEl);
    this.breadcrumb.onAfricaReset(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.zoom.reset();
    });

    this.legend = new MapLegend(this.legendEl);
    this.controls = new MapControls(this.controlsEl, {
      onZoomIn: () => this.zoom.zoomBy(0.35),
      onZoomOut: () => this.zoom.zoomBy(-0.35),
      onReset: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    });

    this.renderSidebar();
    this.renderByNumbers();
    this.bindCountryEvents();
    this.initScrollZoom();
    this.setUIProgress(0);

    requestAnimationFrame(() => {
      this.zoom.apply();
      ScrollTrigger.refresh();
    });
  }

  buildStageHTML() {
    const h = this.hero || {};
    return `
      <div class="map-pin-wrapper" id="map-pin-wrapper">
        <div class="map-stage-inner">
          <!-- Map canvas: full stage, animates from hero slot → Africa focus -->
          <div class="map-stage-canvas" id="map-stage-canvas">
            <div class="africa-map__camera" id="africa-map-camera">
              <svg id="africa-map-svg" role="img" aria-label="Interactive map of Africa"></svg>
            </div>
            <div id="map-controls-root"></div>
            <div id="map-legend-root"></div>
          </div>

          <!-- Hero layer: copy overlays map at scroll start -->
          <div class="map-hero-layer" id="map-hero-layer">
            <div class="container map-hero-grid">
              <div class="map-hero-content" id="map-hero-content">
                <p class="eyebrow">${h.eyebrow || "Transformation Intelligence"}</p>
                <h1>${h.headline || "What is happening across Africa?"}</h1>
                <p class="map-hero-sub">${h.subheading || ""}</p>
                <div class="map-hero-actions">
                  <a href="#map-scroll-stage" class="btn btn-primary map-scroll-cta">Explore Africa</a>
                  <a href="${h.secondaryCta?.target || "#/insights"}" class="btn btn-secondary"${h.secondaryCta?.target?.startsWith("#/") ? " data-link" : ""}>${h.secondaryCta?.label || "View Insights"}</a>
                </div>
              </div>
              <div class="map-hero-slot" id="map-hero-slot" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Immersive UI (revealed on scroll) -->
          <div class="map-immersive-ui" id="map-immersive-ui">
            <div class="map-stage-top">
              <div id="map-breadcrumb-root"></div>
              <a href="#/insights" class="map-explore-btn" data-link>Explore More Data</a>
            </div>
            <div class="map-by-numbers" id="map-by-numbers" aria-label="Africa by the numbers"></div>
            <div class="map-stage-body">
              <aside class="map-sidebar" id="map-sidebar" aria-label="PA network countries"></aside>
              <div class="map-stage-copy" id="map-stage-copy">
                <h2>Explore transformation across Africa</h2>
                <p>Scroll to focus the map · Select a country to measure impact</p>
              </div>
            </div>
          </div>

          <div class="map-scroll-hint" id="map-scroll-hint">
            <span>Scroll to explore Africa</span>
            <span class="map-scroll-hint__arrow">↓</span>
          </div>
        </div>
      </div>`;
  }

  cacheElements() {
    this.pinWrapper = this.stageRoot.querySelector("#map-pin-wrapper");
    this.heroLayer = this.stageRoot.querySelector("#map-hero-layer");
    this.heroContent = this.stageRoot.querySelector("#map-hero-content");
    this.heroSlot = this.stageRoot.querySelector("#map-hero-slot");
    this.immersiveUI = this.stageRoot.querySelector("#map-immersive-ui");
    this.breadcrumbEl = this.stageRoot.querySelector("#map-breadcrumb-root");
    this.byNumbersEl = this.stageRoot.querySelector("#map-by-numbers");
    this.sidebarEl = this.stageRoot.querySelector("#map-sidebar");
    this.canvas = this.stageRoot.querySelector("#map-stage-canvas");
    this.camera = this.stageRoot.querySelector("#africa-map-camera");
    this.svg = this.stageRoot.querySelector("#africa-map-svg");
    this.stageCopy = this.stageRoot.querySelector("#map-stage-copy");
    this.controlsEl = this.stageRoot.querySelector("#map-controls-root");
    this.legendEl = this.stageRoot.querySelector("#map-legend-root");
    this.scrollHint = this.stageRoot.querySelector("#map-scroll-hint");
  }

  buildSVG() {
    const viewBox = this.mapPaths.viewBox;
    const [, , w, h] = viewBox.split(" ").map(Number);
    this.svg.setAttribute("viewBox", viewBox);
    const ocean = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    ocean.setAttribute("class", "map-ocean");
    ocean.setAttribute("width", w);
    ocean.setAttribute("height", h);
    this.svg.appendChild(ocean);
  }

  renderByNumbers() {
    if (!this.byNumbersEl || !this.byNumbers) return;
    const kpis = this.byNumbers.liveKpis || [];
    const featured = kpis[0];
    const rest = kpis.slice(1, 4);

    this.byNumbersEl.innerHTML = `
      <div class="map-by-numbers__head">
        <h3>By the numbers: Africa</h3>
        <a href="#/insights" class="map-explore-btn map-explore-btn--sm" data-link>Explore More Data</a>
      </div>
      <div class="map-by-numbers__grid">
        <div class="map-by-numbers__featured">
          <p class="map-by-numbers__metric-label">${featured?.label || "Communities"}</p>
          <p class="map-by-numbers__metric-value">${formatNumber(featured?.value || 0)}${featured?.suffix || ""}</p>
          <div class="map-by-numbers__spark" aria-hidden="true"></div>
        </div>
        <ul class="map-by-numbers__list">
          ${rest
            .map(
              (k) => `<li>
                <span class="map-by-numbers__list-label">${k.label}</span>
                <span class="map-by-numbers__list-value">${k.prefix || ""}${formatNumber(k.value)}${k.suffix || ""}</span>
              </li>`
            )
            .join("")}
        </ul>
      </div>`;
  }

  renderSidebar() {
    const paCountries = this.regions.filter((c) => c.isPaNetwork);
    this.sidebarEl.innerHTML = `
      <div class="map-sidebar__search">
        <input type="search" placeholder="Search countries…" aria-label="Search countries" id="map-country-search">
      </div>
      <p class="map-sidebar__title">PA Network</p>
      <ul class="map-sidebar__list" role="list">
        ${paCountries
          .map(
            (c) => `<li>
              <button type="button" class="map-sidebar__item" data-sidebar-slug="${c.slug}">
                <span>${c.countryName}</span>
                <span class="map-sidebar__meta">${c.communities} communities · ${c.progress || 0}%</span>
              </button>
            </li>`
          )
          .join("")}
      </ul>`;

    this.sidebarEl.querySelectorAll("[data-sidebar-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.sidebarSlug;
        const region = this.countryRegions.find((r) => r.country.slug === slug);
        if (region && this.zoom.isFullyInteractive()) this.handleCountrySelect(region);
        else {
          document.getElementById("map-scroll-stage")?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            if (this.zoom.isFullyInteractive()) this.handleCountrySelect(region);
          }, 800);
        }
      });
    });

    this.sidebarEl.querySelector("#map-country-search")?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      this.sidebarEl.querySelectorAll(".map-sidebar__item").forEach((btn) => {
        btn.closest("li").style.display = btn.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }

  bindCountryEvents() {
    this.countryRegions.forEach((region) => {
      const { country } = region;

      region.on("mouseenter", (e) => {
        if (!this.zoom.isInteractive() || this.selecting) return;
        region.setHovered(true);
        this.breadcrumb.setCountry(country);
        this.highlightSidebar(country.slug);
        this.tooltip.show(country, e.clientX, e.clientY);
      });

      region.on("mousemove", (e) => {
        if (!this.zoom.isInteractive() || this.selecting) return;
        this.tooltip.position(e.clientX, e.clientY);
      });

      region.on("mouseleave", () => {
        region.setHovered(false);
        if (!this.selecting) {
          this.breadcrumb.setItems([{ label: "Africa", slug: null }]);
          this.highlightSidebar(null);
        }
        this.tooltip.hide();
      });

      region.on("click", () => {
        if (!this.zoom.isInteractive() || this.selecting) return;
        this.handleCountrySelect(region);
      });

      region.on("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && this.zoom.isInteractive() && !this.selecting) {
          e.preventDefault();
          this.handleCountrySelect(region);
        }
      });
    });
  }

  highlightSidebar(slug) {
    this.sidebarEl?.querySelectorAll(".map-sidebar__item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sidebarSlug === slug);
    });
  }

  async handleCountrySelect(region) {
    if (this.selecting) return;
    this.selecting = true;
    const { country, pathEl } = region;

    this.tooltip.hide();
    this.breadcrumb.setCountry(country);
    this.highlightSidebar(country.slug);

    this.countryRegions.forEach((r) => {
      const selected = r.country.slug === country.slug;
      r.setSelected(selected);
      r.setDimmed(!selected);
      r.setInteractive(false);
    });

    gsap.to([this.heroContent, this.immersiveUI, this.scrollHint], {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
    });

    await this.zoom.zoomToCountry(pathEl, 1.25);

    await this.navTransition.toCountryHub({
      camera: this.camera,
      onNavigate: () => this.onCountrySelect?.(country),
    });

    this.selecting = false;
  }

  setUIProgress(progress) {
    const interaction = this.zoom.getInteractionProgress();
    const immersive = Math.min(1, Math.max(0, (progress - 0.18) / 0.45));
    const heroFade = Math.max(0, 1 - progress * 3.5);
    const byNumbersIn = progress > 0.28 && progress < 0.62 ? 1 : Math.max(0, 1 - Math.abs(progress - 0.45) * 4);

    gsap.to(this.heroContent, { opacity: heroFade, y: -20 * (1 - heroFade), duration: 0.12, overwrite: true });
    gsap.to(this.heroLayer, { pointerEvents: heroFade > 0.3 ? "auto" : "none", duration: 0 });
    gsap.to(this.immersiveUI, { opacity: immersive, duration: 0.12, overwrite: true });
    gsap.to(this.byNumbersEl, { opacity: byNumbersIn * immersive, y: (1 - byNumbersIn) * 12, duration: 0.12, overwrite: true });
    gsap.to(this.scrollHint, { opacity: heroFade * 0.8, duration: 0.12, overwrite: true });
    gsap.to(this.stageCopy, { opacity: Math.max(0, immersive - 0.5), duration: 0.12, overwrite: true });

    gsap.to(this.sidebarEl, {
      opacity: interaction,
      x: (1 - interaction) * -20,
      duration: 0.15,
      overwrite: true,
    });

    this.controls.setVisible(interaction > 0.6);
    this.legend.setVisible(interaction > 0.5);

    const canInteract = this.zoom.isInteractive();
    this.countryRegions.forEach((r) => {
      r.setInteractive(canInteract);
      if (!canInteract) r.setHovered(false);
    });

    this.pinWrapper.classList.toggle("is-hero", progress < 0.15);
    this.pinWrapper.classList.toggle("is-immersive", progress >= 0.15);
    this.pinWrapper.classList.toggle("is-map-focused", this.zoom.isFullyInteractive());

    document.getElementById("site-header")?.classList.toggle("site-header--dark", progress > 0.2);
    document.body.classList.toggle("map-journey-active", progress > 0.1);
  }

  initScrollZoom() {
    const stage = document.getElementById("map-scroll-stage");
    if (!stage || !this.pinWrapper) return;

    const st = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      pin: this.pinWrapper,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        this.zoom.setScrollProgress(self.progress);
        this.setUIProgress(self.progress);
      },
    });

    this.scrollTriggers.push(st);

    stage.querySelector(".map-scroll-cta")?.addEventListener("click", (e) => {
      e.preventDefault();
      const y = stage.offsetTop + stage.offsetHeight * 0.35;
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    ScrollTrigger.refresh();
  }

  setCountrySelectHandler(fn) {
    this.onCountrySelect = fn;
  }

  destroy() {
    this.scrollTriggers.forEach((st) => st.kill());
    this.scrollTriggers = [];
    this.tooltip.hide();
    document.getElementById("site-header")?.classList.remove("site-header--dark");
    document.body.classList.remove("map-journey-active");
    if (this.stageRoot) this.stageRoot.innerHTML = "";
    this.regions = [];
    this.countryRegions = [];
    this.selecting = false;
  }
}
