import { renderNarrativeRibbon } from "../shared/site-bridge.js";

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

  return `
    <div class="ao-overview">
      <header class="ao-overview__head container" data-reveal-section>
        <p class="eyebrow">Africa Overview</p>
        <h1>${overview.pageTitle || "Africa network overview"}</h1>
        <p class="ao-overview__lead">${overview.lead || "Network-wide metrics, growth trends, and country hubs across the PA network. Field updates and the interactive map are on the homepage."}</p>
      </header>

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
        <p class="ao-section__desc">Select a country hub for stories, metrics, catchments, and communities. Field updates are on the <a href="#/#what-happening-africa" data-link>homepage</a>; the interactive map is in the <a href="#/#home-africa-map" data-link>map section</a>.</p>
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
