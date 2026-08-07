/**
 * AfricaIntelligenceLeaflet — a premium Leaflet.js interactive map for
 * Possibilities Africa.
 *
 * Drill-down levels:
 *   AFRICA  → choropleth of real country polygons (PA countries highlighted)
 *   COUNTRY → catchments plotted from real lat/lng
 *   CATCHMENT → communities as clustered, styled markers
 *
 * Every feature links to the existing hub routes. Styled to match the PA
 * navy / dark-teal brand, dark basemap, vendored country GeoJSON so it can
 * render offline. Leaflet + MarkerCluster are loaded via CDN.
 */

import { buildDrillDownData } from "../utils/drill-down-data.js";

const GEO_URL = "data/africa-countries.geojson";

const STATUS_COLOR = {
  Active: "#F5A623",
  Growing: "#00C48C",
  Emerging: "#009FDA",
  Network: "#7A8BA6",
};

const PA_FILL = "#0E3A66";
const NON_PA_FILL = "#122A3A";
const PA_BORDER = "#7DD3FC";
const NON_PA_BORDER = "#24475E";
const CT_COLOR = "#00C48C";
const COM_COLOR = "#34D3FF";

let geoCache = null;

function loadAfricaGeo() {
  if (geoCache) return Promise.resolve(geoCache);
  return fetch(GEO_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`GeoJSON ${r.status}`);
      return r.json();
    })
    .then((d) => {
      geoCache = d;
      return d;
    });
}

function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function fmt(n) {
  return (n ?? 0).toLocaleString();
}

function statusColor(status) {
  return STATUS_COLOR[status] || STATUS_COLOR.Emerging;
}

function kpi(label, value, accent) {
  return `<div class="al-kpi"><span class="al-kpi-v"${accent ? ` style="color:${accent}"` : ""}>${value}</span><span class="al-kpi-l">${label}</span></div>`;
}

const iconCache = {};

function buildIcon(inner, size, color, ring) {
  const key = `${size}|${color}|${ring || ""}`;
  if (iconCache[key]) return iconCache[key];
  const icon = L.divIcon({
    className: "al-marker",
    html: `<svg class="al-marker__svg" width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      ${ring ? `<circle class="al-marker__ring" cx="12" cy="12" r="8.6" fill="none" stroke="${ring}" stroke-width="2"/>` : ""}
      ${inner}
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  iconCache[key] = icon;
  return icon;
}

function catchmentPin(color = CT_COLOR) {
  return buildIcon(
    `<circle cx="12" cy="12" r="7.4" fill="${color}"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="#062032" stroke-opacity="0.45" stroke-width="1.5"/><circle cx="12" cy="12" r="2.6" fill="#fff"/>`,
    24,
    color
  );
}

function communityDot(color = COM_COLOR) {
  return buildIcon(
    `<circle cx="12" cy="12" r="5.6" fill="${color}"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="1.5"/>`,
    16,
    color,
    "rgba(52,211,255,0.28)"
  );
}

export class AfricaLeafletMap {
  constructor(config = {}) {
    this.config = config;
    this.map = null;
    this.geoLayer = null;
    this.clusterLayer = null;
    this.selected = { level: "africa", slug: null };
    this.els = {};
  }

  mount({ root, data }) {
    if (typeof L === "undefined") {
      console.warn("[AfricaLeaflet] Leaflet not loaded");
      return null;
    }
    if (!root || root.childElementCount) return null;

    this.root = root;
    this.drill = this.buildDrill(data);

    this.map = L.map(root, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 14,
      scrollWheelZoom: false,
      worldCopyJump: true,
    }).setView([3, 20], 3);

    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(this.map);

    this.buildPanel();
    this.buildBreadcrumb();
    this.buildLegend();
    this.buildPosterText();
    this.buildGradients();
    this.attachWheelGuard();

    this.map.on("click", (e) => {
      const target = e.originalEvent?.target;
      const hitFeature =
        target?.classList?.contains?.("leaflet-interactive") ||
        target?.closest?.(".al-marker, .marker-cluster, .leaflet-marker-icon") ||
        target?.closest?.(".leaflet-interactive");
      if (hitFeature) return;
      if (this.selected.level !== "africa") this.clearSelection();
    });

    loadAfricaGeo()
      .then((geo) => {
        if (this._destroyed || !this.map) return;
        this.renderCountries(geo);
      })
      .catch(() => {
        this.panelEl().innerHTML = "<p class='al-neutral'>Map data unavailable.</p>";
      });

    this.posterText?.set("Africa", "7 countries · 17 catchments · 64 communities");
    requestAnimationFrame(() => {
      this.els.posterText?.classList.add("is-visible");
    });
    window.__paLeafletMap = this;
    return this.map;
  }

  buildDrill(data) {
    return buildDrillDownData({
      countries: data.countries,
      catchments: data.catchments,
      communities: data.communities,
      countryHubs: data.countryHubs,
      mapPaths: data.mapPaths,
      geoLocations: data.geoLocations,
    });
  }

  /* ------------------------------------------------------------- */
  /* Countries                                                       */
  /* ------------------------------------------------------------- */

  renderCountries(geo) {
    const byCountry = this.drill?.byCountry || {};

    this.geoLayer = L.geoJSON(geo, {
      style: (f) => {
        const active = !!byCountry[f.properties.slug];
        return {
          color: active ? PA_BORDER : NON_PA_BORDER,
          weight: active ? 1.4 : 0.8,
          fillColor: active ? PA_FILL : NON_PA_FILL,
          fillOpacity: active ? 0.9 : 0.35,
        };
      },
      onEachFeature: (f, layer) => {
        const slug = f.properties?.slug;
        const country = byCountry[slug];
        const enter = () => {
          if (this.selected.level !== "africa") {
            layer.setStyle({ weight: 2.6, color: "#ffffff", fillOpacity: 1 });
            layer.bringToFront();
            return;
          }
          layer.setStyle({ weight: 2.6, color: "#ffffff", fillOpacity: 1 });
          layer.bringToFront();
          if (country) this.panel.showHover(country, f.properties?.name);
          else this.panel.showPlain(f.properties?.name);
        };
        const leave = () => {
          if (this.selected.level === "country" && this.selected.slug === slug) return;
          this.geoLayer.resetStyle(layer);
          this.panel.hideHover();
        };
        layer.on({
          mouseover: enter,
          pointerover: enter,
          mouseout: leave,
          pointerout: leave,
          click: () => {
            if (country) this.selectCountry(slug, country);
          },
        });
      },
    }).addTo(this.map);

    this.fitAfrica();
  }

  fitAfrica() {
    if (!this.geoLayer || !this.map) return;
    const b = this.geoLayer.getBounds();
    if (b.isValid()) this.map.fitBounds(b, { padding: [10, 10] });
  }

  countryBounds(slug) {
    let b = null;
    this.geoLayer?.eachLayer((layer) => {
      if (layer.feature?.properties?.slug === slug) b = layer.getBounds();
    });
    return b;
  }

  /* ------------------------------------------------------------- */
  /* Selection / drill-down                                          */
  /* ------------------------------------------------------------- */

  focusCountry(slug) {
    const b = this.countryBounds(slug);
    if (b && b.isValid()) {
      this.map.flyToBounds(b, { duration: 1.1, padding: [26, 26], maxZoom: 6.5 });
    }
  }

  selectCountry(slug, country) {
    this.selected = { level: "country", slug, country };
    this.panel.showCountry(country);
    this.breadcrumb.set(["Africa", country.country.name]);
    this.posterText?.set(
      country.country.name,
      `${country.catchments.length} catchments · ${fmt(country.metrics?.communities ?? 0)} communities · ${fmt(country.metrics?.pastors ?? 0)} pastors`
    );
    this.focusCountry(slug);
    this.renderCatchments(country);
  }

  selectCatchment(country, ct) {
    this.selected = { level: "catchment", slug: ct.slug, ct, country };
    this.panel.showCatchment(country, ct);
    this.breadcrumb.set(["Africa", country.country.name, ct.name]);
    this.posterText?.set(
      ct.name,
      `${country.country.name} · ${ct.communities?.length ?? 0} communities · ${fmt(ct.metrics?.pastors ?? 0)} pastors`
    );
    this.map.flyTo([ct.lat, ct.lng], 7, { duration: 1.4 });
    this.renderCommunities(ct);
  }

  selectCommunity(com, ct, country) {
    this.selected = { level: "community", com, ct, country };
    this.panel.showCommunity(country, ct, com);
    this.breadcrumb.set(["Africa", country.country.name, ct.name, com.name]);
    this.posterText?.set(
      com.name,
      `${ct.name} · ${fmt(com.households ?? 0)} households · ${fmt(com.pastors ?? 0)} pastors`
    );
    this.map.flyTo([com.lat, com.lng], 9.5, { duration: 1.3 });
  }

  goTo(level) {
    if (level === "africa") {
      this.clearSelection();
    } else if (level === "country" && this.selected.country) {
      const c = this.selected.country;
      this.selected = { level: "country", slug: c.country.slug, country: c };
      this.panel.showCountry(c);
      this.breadcrumb.set(["Africa", c.country.name]);
      this.posterText?.set(c.country.name, `${c.catchments.length} catchments · ${fmt(c.metrics?.communities ?? 0)} communities · ${fmt(c.metrics?.pastors ?? 0)} pastors`);
      this.focusCountry(c.country.slug);
      this.renderCatchments(c);
    } else if (level === "catchment" && this.selected.ct && this.selected.country) {
      const c = this.selected.country;
      this.selected = { level: "catchment", slug: this.selected.ct.slug, ct: this.selected.ct, country: c };
      this.panel.showCatchment(c, this.selected.ct);
      this.breadcrumb.set(["Africa", c.country.name, this.selected.ct.name]);
      this.posterText?.set(this.selected.ct.name, `${c.country.name} · ${this.selected.ct.communities?.length ?? 0} communities · ${fmt(this.selected.ct.metrics?.pastors ?? 0)} pastors`);
      this.renderCommunities(this.selected.ct);
    }
  }

  clearSelection() {
    this.selected = { level: "africa", slug: null };
    this.panel.reset();
    this.breadcrumb.reset();
    this.posterText?.reset();
    this.clearCluster();
    this.geoLayer?.eachLayer((l) => this.geoLayer.resetStyle(l));
    this.fitAfrica();
  }

  /* ------------------------------------------------------------- */
  /* Markers                                                          */
  /* ------------------------------------------------------------- */

  clearCluster() {
    if (this.clusterLayer) {
      this.map.removeLayer(this.clusterLayer);
      this.clusterLayer = null;
    }
  }

  renderCatchments(country) {
    this.clearCluster();
    const cluster = L.markerClusterGroup({ maxClusterRadius: 55, spiderfyOnMaxZoom: true });
    (country.catchments || []).forEach((ct) => {
      if (ct.lat == null || ct.lng == null) return;
      const marker = L.marker([ct.lat, ct.lng], {
        icon: catchmentPin(statusColor(ct.status)),
        title: ct.name,
        riseOnHover: true,
      });
      marker.bindPopup(this.catchmentPopup(country, ct), { maxWidth: 300, className: "al-popup" });
      marker.on("click", (e) => {
        L.DomEvent.stop(e);
        this.selectCatchment(country, ct);
      });
      cluster.addLayer(marker);
    });
    cluster.addTo(this.map);
    this.clusterLayer = cluster;
  }

  renderCommunities(ct) {
    this.clearCluster();
    const cluster = L.markerClusterGroup({ maxClusterRadius: 42, spiderfyOnMaxZoom: true });
    (ct.communities || []).forEach((com) => {
      if (com.lat == null || com.lng == null) return;
      const marker = L.marker([com.lat, com.lng], {
        icon: communityDot(com.status === "inactive" ? "#8A94A6" : COM_COLOR),
        title: com.name,
        riseOnHover: true,
      });
      marker.bindPopup(this.communityPopup(ct, com), { maxWidth: 300, className: "al-popup" });
      marker.on("click", (e) => {
        L.DomEvent.stop(e);
        this.selectCommunity(com, ct, this.selected.country);
      });
      cluster.addLayer(marker);
    });
    cluster.addTo(this.map);
    this.clusterLayer = cluster;
  }

  /* ------------------------------------------------------------- */
  /* Popups                                                           */
  /* ------------------------------------------------------------- */

  catchmentPopup(country, ct) {
    const slug = country.country.slug;
    return `
      <div class="al-popup__head">
        <span class="al-popup__eyebrow">${escapeHtml(country.country.name)} · CATCHMENT</span>
        <h3 class="al-popup__title">${escapeHtml(ct.name)}</h3>
      </div>
      <div class="al-popup__kpis">
        ${kpi("Communities", ct.communities?.length ?? 0, CT_COLOR)}
        ${kpi("Households", fmt(ct.metrics?.households))}
        ${kpi("Pastors", fmt(ct.metrics?.pastors || 0))}
      </div>
      <div class="al-popup__acts">
        <a class="al-btn" href="#/catchment/${slug}/${ct.slug}" data-link>Open catchment hub →</a>
      </div>`;
  }

  communityPopup(ct, com) {
    const countrySlug = this.selected.country?.country?.slug || com.countrySlug || "";
    const ctSlug = this.selected.ct?.slug || ct.slug || "";
    return `
      <div class="al-popup__head">
        <span class="al-popup__eyebrow">${escapeHtml(ct.name)} · COMMUNITY</span>
        <h3 class="al-popup__title">${escapeHtml(com.name)}</h3>
      </div>
      <div class="al-popup__kpis">
        ${kpi("Households", fmt(com.households))}
        ${kpi("Pastors", fmt(com.pastors))}
        ${kpi("Shalom groups", fmt(com.shalomGroups))}
      </div>
      <div class="al-popup__acts">
        <a class="al-btn" href="#/community/${countrySlug}/${ctSlug}/${com.slug}" data-link>Open community hub →</a>
      </div>`;
  }

  /* ------------------------------------------------------------- */
  /* UI chrome                                                         */
  /* ------------------------------------------------------------- */

  panelEl() {
    return this.els.panel;
  }

  buildPanel() {
    const panel = L.DomUtil.create("div", "al-panel", this.root);
    panel.innerHTML = `
      <div class="al-panel__body">
        <p class="al-panel__placeholder">Hover a country to preview data · Click to drill in</p>
      </div>`;
    this.els.panel = panel;
    this.els.panelBody = panel.querySelector(".al-panel__body");

    const self = this;
    this.panel = {
      render(html) {
        self.els.panelBody.innerHTML = html;
      },
      showHover(country, name) {
        const m = country?.metrics || {};
        this.render(`
          <div class="al-panel__eyebrow">${escapeHtml(name || "")}</div>
          <h3 class="al-panel__title">${escapeHtml(country.country.name)}</h3>
          <div class="al-panel__badges">
            <span class="al-badge al-badge--${(country.country.status || "Network").toLowerCase()}">${escapeHtml(country.country.status || "Network")}</span>
          </div>
          <div class="al-kpis">
            ${kpi("Catchments", country.catchments?.length ?? 0)}
            ${kpi("Communities", m.communities ?? 0, "#34D3FF")}
            ${kpi("Pastors", fmt(m.pastors ?? 0), "#00C48C")}
          </div>
          <p class="al-panel__cta">Click to explore this country</p>`);
      },
      showPlain(name) {
        this.render(`<div class="al-panel__eyebrow">REGION</div><h3 class="al-panel__title">${escapeHtml(name)}</h3><p class="al-panel__placeholder">Not yet in the PA network</p>`);
      },
      hideHover() {
        if (self.selected.level === "africa") this.reset();
      },
      showCountry(country) {
        const m = country.metrics || {};
        const status = country.country.status || "Network";
        const growth = m.growth ?? 0;
        const growthColor = growth >= 14 ? "#00C48C" : growth >= 8 ? "#F5A623" : "#34D3FF";
        this.render(`
          <div class="al-panel__eyebrow">COUNTRY</div>
          <h3 class="al-panel__title">${escapeHtml(country.country.name)}</h3>
          <div class="al-panel__badges">
            <span class="al-badge al-badge--${status.toLowerCase()}">${escapeHtml(status)}</span>
            <span class="al-badge al-badge--growth" style="color:${growthColor}">▲ ${growth}% growth</span>
          </div>
          <div class="al-kpis">
            ${kpi("Catchments", country.catchments?.length ?? 0, "#00C48C")}
            ${kpi("Communities", m.communities ?? 0, "#34D3FF")}
            ${kpi("Households", fmt(m.households))}
            ${kpi("Pastors", fmt(m.pastors ?? 0), "#F5A623")}
          </div>
          <div class="al-panel__acts">
            <a class="al-btn al-btn--solid" href="#/country/${country.country.slug}" data-link>Country hub →</a>
            <a class="al-btn al-btn--ghost" href="#/africa" data-link>Overview →</a>
          </div>`);
      },
      showCatchment(country, ct) {
        const m = ct.metrics || {};
        this.render(`
          <div class="al-panel__eyebrow">${escapeHtml(country.country.name)} · CATCHMENT</div>
          <h3 class="al-panel__title">${escapeHtml(ct.name)}</h3>
          <div class="al-panel__badges">
            <span class="al-badge al-badge--${(ct.status || "Network").toLowerCase()}">${escapeHtml(ct.status || "Network")}</span>
          </div>
          <div class="al-kpis">
            ${kpi("Communities", ct.communities?.length ?? 0, "#34D3FF")}
            ${kpi("Households", fmt(m.households))}
            ${kpi("Pastors", fmt(m.pastors ?? 0), "#F5A623")}
          </div>
          <div class="al-panel__acts">
            <a class="al-btn al-btn--solid" href="#/catchment/${country.country.slug}/${ct.slug}" data-link>Catchment hub →</a>
          </div>`);
      },
      showCommunity(country, ct, com) {
        this.render(`
          <div class="al-panel__eyebrow">${escapeHtml(ct.name)} · COMMUNITY</div>
          <h3 class="al-panel__title">${escapeHtml(com.name)}</h3>
          <div class="al-kpis">
            ${kpi("Households", fmt(com.households))}
            ${kpi("Pastors", fmt(com.pastors), "#F5A623")}
            ${kpi("Shalom groups", fmt(com.shalomGroups), "#00C48C")}
          </div>
          <div class="al-panel__acts">
            <a class="al-btn al-btn--solid" href="#/community/${country.country.slug}/${ct.slug}/${com.slug}" data-link>Community hub →</a>
          </div>`);
      },
      reset() {
        this.render(`<p class="al-panel__placeholder">Hover a country to preview data · Click to drill in</p>`);
      },
    };
  }

  buildBreadcrumb() {
    const el = L.DomUtil.create("div", "al-breadcrumb", this.root);
    el.innerHTML = `<span class="al-breadcrumb__item al-breadcrumb__item--africa">Africa</span>`;
    el.querySelector(".al-breadcrumb__item--africa").addEventListener("click", () => this.goTo("africa"));
    this.els.breadcrumb = el;
    const self = this;
    this.breadcrumb = {
      el,
      set(parts) {
        el.innerHTML = "";
        parts.forEach((part, i) => {
          const span = L.DomUtil.create("span", "al-breadcrumb__item", el);
          span.textContent = part;
          const level = ["africa", "country", "catchment", "community"][i];
          if (i === 0) span.addEventListener("click", () => self.goTo("africa"));
          else if (i === 1) span.addEventListener("click", () => self.goTo("country"));
          else if (i === 2) span.addEventListener("click", () => self.goTo("catchment"));
          span.classList.add("al-breadcrumb__item--link");
          if (i < parts.length - 1) {
            const sep = L.DomUtil.create("span", "al-breadcrumb__sep", el);
            sep.textContent = "/";
          }
        });
      },
      reset() {
        el.innerHTML = `<span class="al-breadcrumb__item al-breadcrumb__item--africa">Africa</span>`;
        el.querySelector(".al-breadcrumb__item--africa").addEventListener("click", () => self.goTo("africa"));
      },
    };
  }

  buildLegend() {
    const el = L.DomUtil.create("div", "al-legend", this.root);
    el.innerHTML = `
      <div class="al-legend__item"><i style="background:${PA_FILL};border-color:${PA_BORDER}"></i>PA network</div>
      <div class="al-legend__item"><i style="background:${NON_PA_FILL};border-color:${NON_PA_BORDER}"></i>Other countries</div>
      <div class="al-legend__item"><i class="al-legend__pin" style="background:${CT_COLOR}"></i>Catchment</div>
      <div class="al-legend__item"><i class="al-legend__pin" style="background:${COM_COLOR}"></i>Community</div>`;
    this.els.legend = el;
  }

  attachWheelGuard() {
    this.root?.addEventListener("wheel", (e) => {
      if (e.ctrlKey) e.stopPropagation();
    });
  }

  buildPosterText() {
    const el = L.DomUtil.create("div", "al-poster-text", this.root);
    el.innerHTML = `
      <div class="al-poster-text__inner">
        <p class="al-poster-text__eyebrow">Possibilities Africa</p>
        <h2 class="al-poster-text__title" data-title>Africa</h2>
        <p class="al-poster-text__subtitle" data-subtitle>7 countries · 17 catchments · 64 communities</p>
     </div>`;
    this.els.posterText = el;
    const titleEl = el.querySelector("[data-title]");
    const subtitleEl = el.querySelector("[data-subtitle]");
    const self = this;
    this.posterText = {
      set(title, subtitle) {
        if (titleEl.textContent !== title) {
          el.classList.remove("is-flipping");
          void el.offsetWidth;
          titleEl.textContent = title;
          subtitleEl.textContent = subtitle || "";
          el.classList.add("is-flipping");
        } else {
          subtitleEl.textContent = subtitle || "";
        }
      },
      reset() {
        this.set("Africa", "7 countries · 17 catchments · 64 communities");
      },
    };
  }

  buildGradients() {
    const el = L.DomUtil.create("div", "al-gradients", this.root);
    el.innerHTML = `<div class="al-gradients__top"></div><div class="al-gradients__bottom"></div>`;
    this.els.gradients = el;
  }

  destroy() {
    this._destroyed = true;
    this.clearCluster();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export { buildIcon, catchmentPin, communityDot, escapeHtml, fmt, statusColor };
