import { formatNumber } from "../../utils/format.js";

function collectRecentUpdates(countryHubs) {
  const items = [];
  for (const hub of Object.values(countryHubs?.hubs || {})) {
    for (const activity of hub.activities || []) {
      items.push({ ...activity, countryName: hub.countryName });
    }
  }
  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
}

function formatUpdateDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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
      </header>

      <section class="ao-section container" id="ao-metrics" aria-label="Key metrics across Africa">
        <h2 class="ao-section__title">Key metrics across Africa</h2>
        <div class="ao-metric-grid">${metricCards}</div>
      </section>

      <section class="ao-section container" id="ao-growth" aria-label="Growth trends and charts">
        <h2 class="ao-section__title">Growth trends &amp; charts</h2>
        <div class="ao-chart-grid">${chartCards}</div>
      </section>

      <section class="ao-section container" id="ao-updates" aria-label="Recent updates">
        <h2 class="ao-section__title">Recent updates</h2>
        <ol class="ao-update-list">${updateItems}</ol>
      </section>

      <section class="ao-section ao-section--map" id="ao-map" aria-label="Interactive Africa map">
        <div class="ao-section__head container">
          <h2 class="ao-section__title">Interactive Africa map</h2>
          <p class="ao-section__desc">Scroll or click a cluster to explore countries and communities.</p>
        </div>
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
