import { formatNumber } from "../utils/format.js";
import { getDashboard, getStoriesByIds, getReportsByIds } from "../utils/data.js";
import { renderDashboardCharts } from "./charts.js";
import { animateKPIs, animateDashboardIn } from "../utils/transitions.js";

function renderKPIs(kpis, country) {
  return kpis
    .map((k) => {
      let value = k.value;
      let display = value;
      if (k.useStats && country) {
        if (k.useStats === "povertyRate") display = country.stats.povertyRate + "%";
        else if (k.useStats === "population") display = formatNumber(country.stats.population);
        else if (k.useStats === "dataYear") display = country.stats.dataYear;
      } else if (k.text) {
        display = k.text;
      } else if (typeof value === "number" && value >= 1000) {
        display = ""; // animated via data-count
      }

      const countAttr =
        typeof value === "number" && !k.text && !k.useStats ? `data-count="${value}"` : "";
      const trendClass = k.direction || "neutral";
      const trendHtml = k.trend
        ? `<div class="kpi-card__trend ${trendClass}">${k.trend}</div>`
        : "";

      return `<div class="kpi-card">
        <div class="kpi-card__value" ${countAttr}>${display}</div>
        <div class="kpi-card__label">${k.label}</div>
        ${trendHtml}
      </div>`;
    })
    .join("");
}

function renderCharts(chartConfigs, template) {
  const keys = Object.keys(chartConfigs || {});
  const sizes = { wide: "chart-card--wide", half: "chart-card--half", third: "chart-card--third" };
  const sizePattern = ["half", "half", "third", "third", "third", "wide"];

  return keys
    .map((key, i) => {
      const cfg = chartConfigs[key];
      const size = sizePattern[i % sizePattern.length];
      return `<div class="chart-card ${sizes[size]}" data-chart="${key}">
        <h3>${cfg.title}</h3>
        <div class="chart-canvas-wrap"><canvas></canvas></div>
      </div>`;
    })
    .join("");
}

function renderSectors(sectors) {
  if (!sectors || !Object.keys(sectors).length) return "";
  const items = Object.entries(sectors)
    .map(
      ([name, s]) => `<div class="sector-card">
        <div class="sector-card__score">${s.score}</div>
        <div class="sector-card__name">${name}</div>
        <div class="sector-card__metric">${s.metric}</div>
      </div>`
    )
    .join("");

  return `<section class="section-block container">
    <h2>Sector Impact</h2>
    <p class="section-desc">Education, health, agriculture, climate, water, and employment metrics.</p>
    <div class="sector-grid">${items}</div>
  </section>`;
}

function renderTimeline(timeline) {
  if (!timeline?.length) return "";
  const items = timeline
    .map(
      (t) => `<div class="timeline-item">
        <div class="timeline-item__year">${t.year}</div>
        <div class="timeline-item__title">${t.title}</div>
        <div class="timeline-item__desc">${t.description}</div>
      </div>`
    )
    .join("");

  return `<section class="section-block container">
    <h2>Timeline</h2>
    <div class="timeline">${items}</div>
  </section>`;
}

function renderInsights(insights) {
  if (!insights?.length) return "";
  return `<section class="section-block container">
    <h2>Insights</h2>
    <ul class="insight-list">${insights.map((i) => `<li>${i}</li>`).join("")}</ul>
  </section>`;
}

function renderEntityCards(title, items, onClickAttr) {
  if (!items?.length) return "";
  return `<section class="section-block container">
    <h2>${title}</h2>
    <div class="card-grid">${items
      .map(
        (item) => `<a class="entity-card" href="${item.href}" ${onClickAttr || ""}>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        </a>`
      )
      .join("")}</div>
  </section>`;
}

export function renderDashboard({ type, entity, breadcrumbs, childCards, data }) {
  const { charts: chartsData, stories, reports } = data;
  const dashKey = `${type}:${entity.id}`;
  const dash = getDashboard(chartsData, dashKey);
  const country = type === "country" ? entity : data.country;

  const countryList = data.countries?.countries || [];
  const countryById = Object.fromEntries(countryList.map((c) => [c.id, c]));

  const storyItems = getStoriesByIds(stories, dash.storyIds).map((s) => {
    const country = countryById[s.countryId];
    return {
      name: s.title,
      desc: s.excerpt,
      href: country ? `#/country/${country.slug}` : "#",
    };
  });

  const reportItems = getReportsByIds(reports, dash.reportIds).map((r) => ({
    name: r.title,
    desc: r.summary,
    href: `#/reports`,
  }));

  const gallery = (dash.gallery || [])
    .map(() => `<div class="gallery-item">Photo</div>`)
    .join("");

  const programs = (dash.programs || [])
    .map((p) => `<span class="btn btn-primary" style="font-size:0.75rem;padding:0.4rem 0.8rem">${p}</span>`)
    .join(" ");

  const funding = dash.funding
    ? `<section class="section-block container">
        <h2>Funding</h2>
        <p class="section-desc">Total: <strong>${dash.funding.total}</strong></p>
        <div class="sector-grid">${dash.funding.sources
          .map(
            (s) => `<div class="sector-card"><div class="sector-card__score">${s.pct}%</div>
              <div class="sector-card__name">${s.name}</div></div>`
          )
          .join("")}</div>
      </section>`
    : "";

  const html = `
    <div class="dashboard">
      <div class="dashboard-hero">
        <div class="container dashboard-hero__inner">
          <nav class="breadcrumb">${breadcrumbs}</nav>
          <p class="eyebrow" style="color:var(--pa-blue)">${dash.hero?.tagline || ""}</p>
          <h1>${entity.name}</h1>
          <p>${dash.hero?.description || ""}</p>
        </div>
      </div>
      <div class="container">
        <div class="kpi-grid">${renderKPIs(dash.kpis, country)}</div>
      </div>
      <div class="dashboard-body">
        ${renderInsights(dash.insights)}
        ${childCards || ""}
        <section class="section-block container">
          <h2>Analytics</h2>
          <p class="section-desc">Trends, distributions, and comparative metrics from mock data.</p>
          <div class="chart-grid">${renderCharts(dash.charts)}</div>
        </section>
        ${renderSectors(dash.sectors)}
        ${renderTimeline(dash.timeline)}
        ${programs ? `<section class="section-block container"><h2>Programs</h2><div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">${programs}</div></section>` : ""}
        ${funding}
        ${renderEntityCards("Stories", storyItems)}
        ${renderEntityCards("Reports & Downloads", reportItems)}
        ${gallery ? `<section class="section-block container"><h2>Gallery</h2><div class="gallery-grid">${gallery}</div></section>` : ""}
      </div>
    </div>`;

  return { html, dash };
}

export function mountDashboard(root, dash) {
  animateKPIs(root);
  renderDashboardCharts(root, dash.charts);
  animateDashboardIn(root);
}
