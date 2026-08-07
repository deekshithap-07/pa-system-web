import { formatNumber } from "../../utils/format.js";
import { renderNarrativeRibbon } from "../shared/site-bridge.js";

function collectRecentUpdates(countryHubs) {
  const items = [];
  for (const [slug, hub] of Object.entries(countryHubs?.hubs || {})) {
    for (const activity of hub.activities || []) {
      items.push({ ...activity, countryName: hub.countryName, countrySlug: slug });
    }
  }
  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
}

function formatUpdateDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderCountryBrowseGrid(countries) {
  const list = countries?.countries?.filter((c) => c.isPaNetwork) || [];
  if (!list.length) return `<p class="ao-empty">No countries available.</p>`;

  return list
    .map(
      (c) => `<a href="#/country/${c.slug}" class="ao-country-card" data-link data-reveal-section>
        <span class="ao-country-card__name">${c.name}</span>
        <span class="ao-country-card__meta">${c.summary?.communities || c.communities || 0} communities · ${c.summary?.pastors || c.pastors || 0} pastors</span>
        <span class="ao-country-card__cta">View country hub &rarr;</span>
      </a>`
    )
    .join("");
}

export function renderAfricaOverviewSections(data) {
  const overview = data.africaIntelligence?.overview || {};
  const kpis = overview.kpis || [];
  const trends = data.insightsAnalytics?.trendAnalysis || {};
  const updates = collectRecentUpdates(data.countryHubs);

  const metricCards = kpis
    .map(
      (k) => `<article class="ao-metric" data-reveal-section>
        <span class="ao-metric__value">${k.prefix || ""}${k.value}${k.suffix || ""}</span>
        <span class="ao-metric__label">${k.label}</span>
      </article>`
    )
    .join("");

  const trendKeys = ["shalomGroups", "householdReach"];
  const chartCards = trendKeys
    .filter((key) => trends[key])
    .map(
      (key) => `<article class="ao-chart-card" data-chart="${key}" data-reveal-section>
        <h3>${trends[key].title}</h3>
        <p class="ao-chart-card__desc">${trends[key].description || ""}</p>
        <div class="ao-chart-wrap"><canvas></canvas></div>
      </article>`
    )
    .join("");

  const updateItems = updates.length
    ? updates
        .map(
          (u) => `<li class="ao-update" data-reveal-section>
            <time datetime="${u.date}">${formatUpdateDate(u.date)}</time>
            <div>
              <strong>${u.project}</strong>
              <span>${u.community} · ${u.countryName}</span>
              ${u.countrySlug ? `<a href="#/country/${u.countrySlug}" class="ao-update__link" data-link>View ${u.countryName} &rarr;</a>` : ""}
            </div>
            <span class="ao-update__status ao-update__status--${(u.status || "").toLowerCase()}">${u.status}</span>
          </li>`
        )
        .join("")
    : `<li class="ao-empty">No recent updates available.</li>`;

  return `
    <div class="ao-overview">
      <header class="ao-overview__head container" data-reveal-section>
        <p class="eyebrow">Africa Overview</p>
        <h1>${overview.headline || "What is happening across Africa?"}</h1>
        <p class="ao-overview__lead">${overview.lead || "Start with recent field activity and stories, then explore continental metrics and country hubs across the PA network."}</p>
      </header>

      ${renderNarrativeRibbon({
        variant: "story",
        eyebrow: "Getting started",
        text: "This page moves from what's happening on the ground to network-wide data. Field updates come first; metrics and country hubs help you explore further.",
        cta: { label: "Explore the interactive map", target: "#/#home-africa-map" },
      })}

      <section class="ao-section container" id="ao-updates" aria-label="Recent updates">
        <h2 class="ao-section__title">Recent updates</h2>
        <p class="ao-section__desc">Latest programme activity from pastor-led communities — each links to its country hub.</p>
        <ol class="ao-update-list">${updateItems}</ol>
      </section>

      ${renderNarrativeRibbon({
        variant: "data",
        eyebrow: "Data layer",
        text: "The metrics below summarise transformation across the PA network. Open the scorecard for rankings or insights for comparisons.",
        cta: { label: "View scorecard", target: "#/scorecard" },
      })}

      <section class="ao-section container" id="ao-metrics" aria-label="Key metrics across Africa">
        <h2 class="ao-section__title">Key metrics across Africa</h2>
        <div class="ao-metric-grid">${metricCards}</div>
      </section>

      <section class="ao-section container" id="ao-growth" aria-label="Growth trends and charts">
        <h2 class="ao-section__title">Growth trends &amp; charts</h2>
        <div class="ao-chart-grid">${chartCards}</div>
      </section>

      <section class="ao-section container" id="ao-countries" aria-label="Browse countries">
        <h2 class="ao-section__title">Browse countries</h2>
        <p class="ao-section__desc">Select a country hub for stories, metrics, catchments, and communities. The interactive map is on the <a href="#/#home-africa-map" data-link>homepage</a>.</p>
        <div class="ao-country-grid">${renderCountryBrowseGrid(data.countries)}</div>
      </section>
    </div>`;
}

export function mountAfricaOverviewCharts(root, data) {
  const trends = data.insightsAnalytics?.trendAnalysis || {};
  if (typeof Chart === "undefined") return;

  root.querySelectorAll("[data-chart]").forEach((el) => {
    const key = el.dataset.chart;
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
            backgroundColor: cfg.type === "area" ? `${cfg.color || "#009FDA"}33` : cfg.color || "#009FDA",
            fill: cfg.type === "area",
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: cfg.type === "bar" ? { y: { beginAtZero: true } } : {},
      },
    });
  });
}
