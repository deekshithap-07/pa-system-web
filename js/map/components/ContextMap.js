/**
 * Persistent contextual Africa map — shown on Country Hub and future drill-down pages.
 */
import { loadMapRegions } from "./RegionLoader.js";

let instance = null;

export class ContextMap {
  constructor() {
    this.root = null;
    this.onNavigate = null;
  }

  mount({ containerId, countries, mapPaths, mapOverlay, mapMetrics, activeSlug = null, breadcrumbs = [] }) {
    this.destroy();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.root = container;
    this.activeSlug = activeSlug;
    this.regions = loadMapRegions({ countries, mapPaths, mapOverlay, mapMetrics });

    container.innerHTML = `
      <div class="context-map context-map--hero">
        <nav class="context-map__crumbs" aria-label="Geographic navigation">
          ${breadcrumbs
            .map((b, i) => {
              if (i === breadcrumbs.length - 1) {
                return `<span class="context-map__crumb is-current">${b.label}</span>`;
              }
              return `<button type="button" class="context-map__crumb" data-context-nav="${b.href || "africa"}">${b.label}</button><span class="context-map__sep">/</span>`;
            })
            .join("")}
        </nav>
        <div class="context-map__frame">
          <svg class="context-map__svg" viewBox="${mapPaths.viewBox}" role="img" aria-label="Africa context map">
            <rect class="map-ocean" width="1000" height="1000" fill="transparent"/>
          </svg>
        </div>
        <p class="context-map__hint">Transformation map · ${activeSlug ? "selected country highlighted" : "select a country"}</p>
      </div>`;

    const svg = container.querySelector(".context-map__svg");
    this.regions.forEach((c) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", c.path);
      path.setAttribute("data-slug", c.slug);
      path.classList.add("context-map__country");
      if (c.isPaNetwork) path.classList.add("is-pa");
      if (c.slug === activeSlug) path.classList.add("is-active");
      svg.appendChild(path);
    });

    container.querySelectorAll(".context-map__country").forEach((pathEl) => {
      const country = this.regions.find((r) => r.slug === pathEl.dataset.slug);
      if (!country) return;

      pathEl.addEventListener("click", () => {
        if (country.slug === activeSlug) return;
        this.onNavigate?.(`country/${country.slug}`);
      });
    });

    container.querySelectorAll("[data-context-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.contextNav;
        if (target === "africa") this.onNavigate?.("africa");
        else if (target.startsWith("country/") || target.startsWith("catchment/")) this.onNavigate?.(target);
      });
    });

    instance = this;
  }

  setNavigateHandler(fn) {
    this.onNavigate = fn;
  }

  destroy() {
    if (this.root) this.root.innerHTML = "";
    this.root = null;
    instance = null;
  }
}

export function destroyContextMap() {
  instance?.destroy();
}

export function getContextMap() {
  return instance;
}
