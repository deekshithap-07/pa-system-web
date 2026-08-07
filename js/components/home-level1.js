/**
 * Level 1 — Africa Overview (Global Dashboard)
 * Homepage sections: key updates, growth trends, interactive map embed.
 */

import { initAfricaIntelligenceMap, destroyAfricaIntelligenceMap } from "../map/africa-intelligence.js";
import { initAfricaLeafletMap, destroyAfricaLeafletMap } from "../map/africa-leaflet.js";

function collectRecentUpdates(countryHubs, limit = 6) {
  const items = [];
  for (const [slug, hub] of Object.entries(countryHubs?.hubs || {})) {
    for (const activity of hub.activities || []) {
      items.push({ ...activity, countryName: hub.countryName, countrySlug: slug });
    }
  }
  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function formatUpdateDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function renderWhatIsHappeningAcrossAfrica(data, section) {
  const updates = collectRecentUpdates(data.countryHubs, section?.limit || 6);

  const items = updates.length
    ? updates
        .map(
          (u) => `<li class="l1-update" data-reveal>
            <time class="l1-update__date" datetime="${u.date}">${formatUpdateDate(u.date)}</time>
            <div class="l1-update__body">
              <strong class="l1-update__title">${u.project}</strong>
              <span class="l1-update__meta">${u.community} · ${u.countryName}</span>
            </div>
            <span class="l1-update__status l1-update__status--${(u.status || "").toLowerCase()}">${u.status}</span>
            <a href="#/country/${u.countrySlug}" class="l1-update__link" data-link aria-label="View ${u.countryName}">→</a>
          </li>`
        )
        .join("")
    : `<li class="l1-empty">No recent updates available.</li>`;

  return `
    <section class="l1-updates" id="what-happening-africa" aria-labelledby="l1-whats-happening-title">
      <div class="container">
        <header class="l1-section-head" data-reveal>
          <h2 id="l1-whats-happening-title">${section?.title || "What is happening across Africa?"}</h2>
          <p>${section?.description || "Latest programme activity from pastor-led communities — each links to its country hub."}</p>
        </header>
        <ol class="l1-update-list" data-reveal>${items}</ol>
      </div>
    </section>`;
}

/** @deprecated Use renderWhatIsHappeningAcrossAfrica */
export const renderKeyUpdates = renderWhatIsHappeningAcrossAfrica;

export function renderGrowthTrends(data, section) {
  const trends = data.insightsAnalytics?.trendAnalysis || {};
  const keys = section?.chartKeys || ["shalomGroups", "householdReach"];

  const cards = keys
    .filter((key) => trends[key])
    .map(
      (key) => `<article class="l1-trend-card" data-home-chart="${key}" data-reveal>
        <h3>${trends[key].title}</h3>
        <p>${trends[key].description || ""}</p>
        <div class="l1-trend-card__chart"><canvas></canvas></div>
      </article>`
    )
    .join("");

  if (!cards) return "";

  return `
    <section class="l1-growth" id="growth-trends" aria-labelledby="l1-growth-title">
      <div class="container">
        <header class="l1-section-head" data-reveal>
          <p class="eyebrow">${section?.eyebrow || "Growth trends"}</p>
          <h2 id="l1-growth-title">${section?.title || "How the ministry is expanding"}</h2>
          <p>${section?.description || "Network-wide trends in Shalom groups, household reach, and programme activity."}</p>
        </header>
        <div class="l1-trend-grid">${cards}</div>
      </div>
    </section>`;
}

export function renderAfricaMapSection(section, opts = {}) {
  const sectionId = opts.sectionId || "home-africa-map";
  const rootId = opts.rootId || "home-africa-map-root";
  const ctaTarget = section?.countriesCta?.target || "#/africa";

  return `
    <section class="l1-map" id="${sectionId}" aria-labelledby="${sectionId}-title">
      <div class="container l1-map__head-wrap">
        <header class="l1-section-head" data-reveal>
          <h2 id="${sectionId}-title">${section?.title || "Interactive map of Africa"}</h2>
          <p>${section?.description || "Click a country to explore data and drill into catchments and communities. Use Ctrl + scroll to zoom the map, or scroll normally to continue down the page."}</p>
        </header>
        <a href="${ctaTarget}" class="l1-map__full-link" data-link data-enable-africa-nav data-reveal>
          ${section?.countriesCta?.label || "Browse all countries →"}
        </a>
      </div>
      <div class="l1-map__stage" data-reveal>
        <div class="l1-map__host" id="${rootId}" aria-label="Interactive Africa map"></div>
        <p class="l1-map__scroll-hint" data-reveal>Scroll to continue · Ctrl + scroll on map to zoom · Click a country to explore</p>
      </div>
    </section>`;
}

/** @deprecated Use renderAfricaMapSection */
export const renderHomeAfricaMap = (section) => renderAfricaMapSection(section);

export function mountHomeGrowthCharts(root, data) {
  const trends = data.insightsAnalytics?.trendAnalysis || {};
  if (typeof Chart === "undefined") return;

  root.querySelectorAll("[data-home-chart]").forEach((el) => {
    const key = el.dataset.homeChart;
    const cfg = trends[key];
    if (!cfg) return;
    const canvas = el.querySelector("canvas");
    if (!canvas) return;

    new Chart(canvas.getContext("2d"), {
      type: cfg.type === "area" ? "line" : cfg.type,
      data: {
        labels: cfg.labels,
        datasets: [
          {
            data: cfg.data,
            borderColor: cfg.color || "#009FDA",
            backgroundColor: cfg.type === "area" ? `${cfg.color || "#009FDA"}28` : cfg.color || "#009FDA",
            fill: cfg.type === "area",
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, ticks: { font: { size: 10 } } },
        },
      },
    });
  });
}

export function mountAfricaMapSection(data, opts = {}) {
  const rootId = opts.rootId || "home-africa-map-root";
  const rootEl = document.getElementById(rootId);
  if (!rootEl) return null;

  const canUseLeaflet = typeof L !== "undefined";
  if (canUseLeaflet) {
    rootEl.classList.add("africa-leaflet-host");
    const lmap = initAfricaLeafletMap({
      countries: data.countries,
      mapPaths: data.mapPaths,
      catchments: data.catchments,
      communities: data.communities,
      countryHubs: data.countryHubs,
      geoLocations: data.geoLocations,
      config: {
        ...data.africaIntelligence,
        hideSidebar: false,
        pageLayout: true,
        embedMode: true,
        navigateOnCatchmentSelect: true,
      },
      containerId: rootId,
    });
    if (lmap) return lmap;
    rootEl.classList.remove("africa-leaflet-host");
  }

  const map = initAfricaIntelligenceMap({
    countries: data.countries,
    mapPaths: data.mapPaths,
    mapOverlay: data.home?.mapOverlay || {},
    mapMetrics: data.mapMetrics,
    config: {
      ...data.africaIntelligence,
      hideSidebar: false,
      pageLayout: true,
      embedMode: true,
      navigateOnCatchmentSelect: true,
    },
    catchments: data.catchments,
    communities: data.communities,
    countryHubs: data.countryHubs,
    geoLocations: data.geoLocations,
    containerId: rootId,
  });

  return map;
}

export const mountHomeAfricaMap = (data) => mountAfricaMapSection(data);

export function destroyHomeAfricaMap() {
  destroyAfricaLeafletMap();
  destroyAfricaIntelligenceMap();
}
