/**
 * Impact & Data — visual evidence explorer.
 * Overview → Key indicators → Growth → Progress → Country compare →
 * Programme compare → Data freshness
 *
 * Interaction language inspired by public scorecards; PA brand + data only.
 */

import { formatNumber } from "../../utils/format.js";
import { formatPaTitle } from "../../utils/pa-title.js";
import { renderChart, destroyCharts } from "../charts.js";

const COUNTRY_METRICS = [
  { key: "communities", label: "Communities" },
  { key: "households", label: "Households", scale: 1000, unit: "k" },
  { key: "pastors", label: "Pastors" },
  { key: "shalomGroups", label: "Shalom groups" },
  { key: "projects", label: "Projects" },
  { key: "progress", label: "Journey progress", suffix: "%" },
  { key: "growth", label: "Growth", suffix: "%" },
];

const PA_PROGRAMS = [
  { id: "leadership", label: "Transformational Leadership", short: "Leadership" },
  { id: "discipleship", label: "Spiritual Discipleship", short: "Discipleship" },
  { id: "economic", label: "Economic Productivity", short: "Economic" },
  { id: "youth", label: "Mentoring the Next Generation", short: "Next generation" },
  { id: "citizenship", label: "Responsible Citizenship", short: "Citizenship" },
];

const COUNTRY_COLORS = ["#5c2428", "#e8a91a", "#3f9a4a", "#8b3d42", "#c48914", "#4a403c", "#2f7a38"];

const HIDDEN_KPI_IDS = new Set(["projects", "leadership", "growth"]);

const SECTION_BY_ROUTE = {
  overview: "id-indicators",
  working: "id-programmes",
  together: "id-growth",
  journey: "id-progress",
  countries: "id-compare",
};

let impactMedia = null;

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  return `href="${href}"`;
}

function fmtVal(v) {
  if (typeof v === "string") return v;
  if (typeof v !== "number") return "—";
  return v >= 1000 ? formatNumber(v) : String(v);
}

function parseNumeric(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function metricValue(country, key) {
  if (!country) return 0;
  const v = country[key];
  return typeof v === "number" ? v : 0;
}

function metricDisplay(country, metric) {
  if (!country) return "—";
  const v = country[metric.key];
  if (v == null || v === "") return "—";
  if (metric.suffix === "%") return `${v}%`;
  return fmtVal(v);
}

/* -------------------------------------------------------------------------- */
/* Hero — data-led intro                                                      */
/* -------------------------------------------------------------------------- */

function renderHero(sc = {}) {
  const meta = sc.meta || {};
  const ov = sc.overview || {};
  const image = sc.heroImage || "assets/home-overview/tab-results.jpg";

  return `
    <header class="id-hero" data-id-section="hero" aria-labelledby="id-hero-title">
      <div class="id-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="id-hero__veil"></span>
      </div>
      <div class="container id-hero__layout">
        <div class="id-hero__inner" data-id-reveal>
          <p class="id-eyebrow id-eyebrow--on-dark">${meta.title || "Impact & Data"}</p>
          <h1 id="id-hero-title" class="pa-title id-hero__title">${formatPaTitle(
            {
              titleHtml: "<span>How the work</span> <em>is going.</em>",
              title: ov.headline || "How the work is going.",
            },
            "How the work is going."
          )}</h1>
          <p class="id-hero__lead">${
            ov.description ||
            "These figures show reach and progress in seven countries — communities, homes, projects, and leadership."
          }</p>
          <p class="id-hero__meta">
            Reporting ${meta.reportingPeriod || meta.period || "2024"}
            ${meta.lastUpdatedLabel ? ` · Updated ${meta.lastUpdatedLabel}` : ""}
          </p>
          <div class="id-hero__actions">
            <a class="id-btn id-btn--solid" href="#id-indicators">Key indicators →</a>
            <a class="id-btn id-btn--ghost" href="#id-compare">Country progress</a>
          </div>
        </div>
      </div>
    </header>`;
}

/* -------------------------------------------------------------------------- */
/* Section 01 — Key indicators                                                */
/* -------------------------------------------------------------------------- */

function renderIndicators(sc = {}) {
  const kpis = (sc.kpis || []).filter((k) => !HIDDEN_KPI_IDS.has(k.id));
  if (!kpis.length) return "";

  const ranked = [...kpis].sort((a, b) => {
    const av = typeof a.value === "number" ? a.value : 0;
    const bv = typeof b.value === "number" ? b.value : 0;
    return bv - av;
  });
  const primary = ranked[0];
  const secondary = ranked.slice(1);

  const primaryNum = parseNumeric(primary.value);
  const secondaryHtml = secondary
    .map((k, i) => {
      const n = parseNumeric(k.value);
      return `<article class="id-metric" data-id-metric style="--i:${i}">
        <span class="id-metric__value" data-count-to="${n != null ? n : ""}" data-count-display="${fmtVal(k.value)}">${fmtVal(k.value)}</span>
        <span class="id-metric__label">${k.label}</span>
        ${k.trend ? `<span class="id-metric__trend">${k.trend}</span>` : ""}
      </article>`;
    })
    .join("");

  return `
    <section class="id-indicators" id="id-indicators" data-id-section="indicators" aria-labelledby="id-indicators-title">
      <div class="container">
        <header class="id-sec-head" data-id-reveal>
          <p class="id-eyebrow">Key indicators</p>
          <h2 id="id-indicators-title" class="id-sec-title">How much impact is visible now</h2>
          <p class="id-sec-lead">Network totals you can scan in seconds — then drill into trends and country progress below.</p>
        </header>

        <div class="id-metric-field" data-id-metric-field>
          <article class="id-metric id-metric--hero" data-id-metric>
            <span class="id-metric__value" data-count-to="${primaryNum != null ? primaryNum : ""}" data-count-display="${fmtVal(primary.value)}">${fmtVal(primary.value)}</span>
            <span class="id-metric__label">${primary.label}</span>
            ${primary.trend ? `<span class="id-metric__trend">${primary.trend}</span>` : ""}
          </article>
          <div class="id-metric-field__divider" data-id-metric-divider aria-hidden="true"></div>
          <div class="id-metric-field__grid">${secondaryHtml}</div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Section 02 — Growth trends                                                 */
/* -------------------------------------------------------------------------- */

function renderGrowth(sc = {}) {
  const trends = sc.growthTrends || {};
  const keys = Object.keys(trends);
  if (!keys.length) return "";

  const tabs = keys
    .map((key, i) => {
      const t = trends[key];
      return `<button type="button" class="id-trend-tab${i === 0 ? " is-active" : ""}" data-trend-key="${key}" aria-pressed="${i === 0 ? "true" : "false"}">${t.title || key}</button>`;
    })
    .join("");

  const first = trends[keys[0]];

  return `
    <section class="id-growth" id="id-growth" data-id-section="growth" aria-labelledby="id-growth-title">
      <div class="container id-growth__wrap">
        <aside class="id-growth__aside" data-id-growth-aside>
          <p class="id-eyebrow">Growth trends</p>
          <h2 id="id-growth-title" class="id-sec-title">How the numbers are changing</h2>
          <p class="id-sec-lead">Motion over time — communities, households, Shalom groups, and project delivery.</p>
          <div class="id-trend-tabs" role="tablist" aria-label="Growth indicators">${tabs}</div>
        </aside>
        <div class="id-growth__stage" data-id-reveal>
          <div class="id-growth__chart-head">
            <h3 data-trend-title>${first?.title || "Growth"}</h3>
            <p data-trend-meta>Period ${sc.meta?.period || "2021–2024"}</p>
          </div>
          <div class="id-growth__canvas">
            <canvas data-trend-chart aria-label="Growth trend chart"></canvas>
          </div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Section 03 — Progress                                                      */
/* -------------------------------------------------------------------------- */

function renderProgress(sc = {}) {
  const stages = sc.progressIndicators || [];
  if (!stages.length) return "";

  const rows = stages
    .map((s, i) => {
      const score = typeof s.score === "number" ? s.score : 0;
      const target = typeof s.target === "number" ? s.target : 100;
      const pctOfTarget = Math.min(100, Math.round((score / target) * 100));
      return `<article class="id-progress-row" data-id-progress-row style="--i:${i}">
        <div class="id-progress-row__meta">
          <strong class="id-progress-row__label">${s.label}</strong>
          <span class="id-progress-row__values">
            <span class="id-progress-row__current" data-count-to="${score}" data-count-display="${score}%">${score}%</span>
            <span class="id-progress-row__sep">of</span>
            <span class="id-progress-row__target">target ${target}%</span>
          </span>
        </div>
        <div class="id-progress-row__track" role="img" aria-label="${s.label}: ${score}% of ${target}% target">
          <span class="id-progress-row__fill" data-progress-fill style="--target-w:${pctOfTarget}%; width:0%"></span>
          <span class="id-progress-row__marker" style="left:${Math.min(100, target)}%" aria-hidden="true"></span>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="id-progress" id="id-progress" data-id-section="progress" aria-labelledby="id-progress-title">
      <div class="container">
        <header class="id-sec-head" data-id-reveal>
          <p class="id-eyebrow">Progress indicators</p>
          <h2 id="id-progress-title" class="id-sec-title">How far we have come</h2>
          <p class="id-sec-lead">Journey stages across the network — current progress measured against targets.</p>
        </header>
        <div class="id-progress-list" data-id-progress-list>${rows}</div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Section 04 — Country progress (single country tabs)                          */
/* -------------------------------------------------------------------------- */

function chartConfigForCountry(country) {
  if (!country) return null;

  const labels = COUNTRY_METRICS.map((a) => {
    if (a.unit === "k") return "Households (k)";
    if (a.suffix === "%") return a.label;
    return a.label;
  });
  const data = COUNTRY_METRICS.map((a) => {
    const raw = metricValue(country, a.key);
    if (a.scale) return Math.round((raw / a.scale) * 10) / 10;
    return raw;
  });

  return {
    type: "bar",
    indexAxis: "y",
    title: `${country.name} · reach`,
    labels,
    data,
    color: "#5c2428",
    seriesLabel: "Value",
  };
}

function renderCountryProgress(sc = {}) {
  const countries = sc.countryStats || [];
  if (!countries.length) return "";

  const active = countries[0];
  const tabs = countries
    .map(
      (c, i) =>
        `<button type="button" class="id-country-tab${i === 0 ? " is-active" : ""}" data-country-tab="${c.slug}" aria-pressed="${i === 0 ? "true" : "false"}">${c.name}</button>`
    )
    .join("");

  return `
    <section class="id-countries" id="id-compare" data-id-section="compare" aria-labelledby="id-compare-title">
      <div class="container">
        <header class="id-sec-head" data-id-reveal>
          <p class="id-eyebrow">Country progress</p>
          <h2 id="id-compare-title" class="id-sec-title">Where progress is happening</h2>
          <p class="id-sec-lead">Select a country to explore reach, journey progress, and programme scores.</p>
        </header>

        <div class="id-country-tabs" role="tablist" aria-label="Network countries" data-id-reveal>${tabs}</div>

        <div class="id-country-stage" data-id-country-stage>
          <article class="id-country-panel" data-id-reveal>
            <p class="id-country-panel__status" data-country-status>${active.status || ""}</p>
            <h3 class="id-country-panel__name" data-country-name>${active.name}</h3>
            <dl class="id-country-panel__metrics">
              ${COUNTRY_METRICS.map(
                (m) => `<div>
                  <dt>${m.label}</dt>
                  <dd data-country-metric="${m.key}">${metricDisplay(active, m)}</dd>
                </div>`
              ).join("")}
            </dl>
            <a class="id-text-link" data-country-link ${linkAttrs(`#/country/${active.slug}`)}>Open ${active.name} →</a>
          </article>

          <div class="id-country-chart" data-id-reveal>
            <div class="id-country-chart__head">
              <h3 data-country-chart-title>${active.name} · reach</h3>
              <p>Horizontal bars for each reach indicator</p>
            </div>
            <div class="id-country-chart__canvas">
              <canvas data-country-chart aria-label="Country reach chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Section 05 — Programme comparisons                                         */
/* -------------------------------------------------------------------------- */

function renderProgrammes(sc = {}) {
  const sectors = sc.performanceMetrics || [];
  const countries = sc.countryStats || [];
  if (!sectors.length || !countries.length) return "";

  const tabs = PA_PROGRAMS.map(
    (p, i) =>
      `<button type="button" class="id-prog-tab${i === 0 ? " is-active" : ""}" data-prog-tab="${p.id}" aria-pressed="${i === 0 ? "true" : "false"}">${p.short}</button>`
  ).join("");

  const first = sectors.find((s) => s.id === PA_PROGRAMS[0].id) || sectors[0] || {};

  return `
    <section class="id-programmes" id="id-programmes" data-id-section="programmes" aria-labelledby="id-programmes-title">
      <div class="container id-programmes__wrap">
        <aside class="id-programmes__aside">
          <header class="id-sec-head" data-id-reveal>
            <p class="id-eyebrow">Programme comparisons</p>
            <h2 id="id-programmes-title" class="id-sec-title">How programmes perform</h2>
            <p class="id-sec-lead">All seven network countries compared across transformation programmes.</p>
          </header>
          <div class="id-prog-tabs" role="tablist" aria-label="Programmes" data-id-reveal>${tabs}</div>
        </aside>
        <div class="id-prog-chart-stage" data-id-reveal>
          <div class="id-prog-chart__head">
            <div class="id-prog-chart__title-row">
              <h3 data-prog-chart-title>${PA_PROGRAMS[0].label}</h3>
              <p class="id-prog-chart__avg" data-prog-chart-avg aria-label="Network average">
                <span class="id-prog-chart__avg-label">Network avg</span>
                <strong data-prog-avg-score>${first.score ?? "—"}%</strong>
                ${first.trend ? `<span class="id-prog-chart__avg-trend" data-prog-avg-trend>${first.trend}</span>` : `<span class="id-prog-chart__avg-trend" data-prog-avg-trend hidden></span>`}
              </p>
            </div>
            <p data-prog-chart-meta>Progress % by country</p>
          </div>
          <div class="id-prog-chart__canvas">
            <canvas data-prog-chart aria-label="Programme comparison across countries"></canvas>
          </div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Section 06 — Data freshness                                                */
/* -------------------------------------------------------------------------- */

function renderFreshness(sc = {}) {
  const meta = sc.meta || {};
  const items = [
    { label: "Data period", value: meta.reportingPeriod || meta.period || "—" },
    { label: "Sources", value: meta.sources || "—" },
    {
      label: "Network coverage",
      value: (sc.overview?.highlights || []).find((h) => /countries/i.test(h.label))?.value || "7 countries",
    },
  ];

  return `
    <section class="id-freshness" id="id-freshness" data-id-section="freshness" aria-labelledby="id-freshness-title">
      <div class="container id-freshness__grid">
        <div class="id-freshness__copy" data-id-reveal>
          <p class="id-eyebrow">Data freshness</p>
          <h2 id="id-freshness-title" class="id-sec-title">How current this evidence is</h2>
          <p class="id-sec-lead">
            ${
              meta.freshnessNote ||
              "Reporting dates and sources for the evidence on this page — so partners know when numbers were verified."
            }
          </p>
        </div>
        <div class="id-freshness__panel" data-id-reveal>
          <p class="id-freshness__label">Last updated</p>
          <p class="id-freshness__date">${meta.lastUpdatedLabel || meta.lastUpdated || "—"}</p>
          <dl class="id-freshness__meta">
            ${items
              .map(
                (it) => `<div>
                  <dt>${it.label}</dt>
                  <dd>${it.value}</dd>
                </div>`
              )
              .join("")}
          </dl>
        </div>
      </div>
    </section>`;
}

function renderCta() {
  return `
    <section class="id-next" id="id-next" data-id-section="cta" aria-labelledby="id-cta-title">
      <div class="container id-next__inner" data-id-reveal>
        <header class="id-next__intro">
          <p class="id-eyebrow">Keep exploring</p>
          <h2 id="id-cta-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>From the numbers</span> <em>to the field.</em>",
          })}</h2>
          <p class="id-next__lead">Impact figures point to places and people. Step into a country, a story, or the map.</p>
        </header>
        <div class="id-next__paths" role="list">
          <a class="id-next__path" ${linkAttrs("#/africa")} role="listitem">
            <span class="id-next__path-kicker">Map</span>
            <span class="id-next__path-title">Where we work</span>
            <span class="id-next__path-note">Countries, catchments, and communities across the network.</span>
            <span class="id-next__path-go" aria-hidden="true">→</span>
          </a>
          <a class="id-next__path" ${linkAttrs("#/stories")} role="listitem">
            <span class="id-next__path-kicker">Stories</span>
            <span class="id-next__path-title">Voices from the field</span>
            <span class="id-next__path-note">Households, leaders, and journeys behind the indicators.</span>
            <span class="id-next__path-go" aria-hidden="true">→</span>
          </a>
          <a class="id-next__path" ${linkAttrs("#/")} role="listitem">
            <span class="id-next__path-kicker">Home</span>
            <span class="id-next__path-title">Back to the overview</span>
            <span class="id-next__path-note">Return to PA across Africa and programme pathways.</span>
            <span class="id-next__path-go" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Page export                                                                */
/* -------------------------------------------------------------------------- */

export function renderImpactDataPage(data, section = "overview") {
  const sc = data.scorecard;
  if (!sc) {
    return `<div class="container static-page"><h1>Impact &amp; Data is unavailable</h1></div>`;
  }

  return `
    <div class="id-page" data-impact-data data-scroll-target="${SECTION_BY_ROUTE[section] || ""}">
      ${renderHero(sc)}
      ${renderIndicators(sc)}
      ${renderGrowth(sc)}
      ${renderProgress(sc)}
      ${renderCountryProgress(sc)}
      ${renderProgrammes(sc)}
      ${renderFreshness(sc)}
      ${renderCta()}
    </div>`;
}

/* -------------------------------------------------------------------------- */
/* Interactions                                                               */
/* -------------------------------------------------------------------------- */

function paintTrendChart(page, sc, key) {
  const trends = sc.growthTrends || {};
  const cfg = trends[key];
  const canvas = page.querySelector("[data-trend-chart]");
  if (!canvas || !cfg) return;

  if (typeof Chart !== "undefined") Chart.getChart(canvas)?.destroy();

  const titleEl = page.querySelector("[data-trend-title]");
  const metaEl = page.querySelector("[data-trend-meta]");
  if (titleEl) titleEl.textContent = cfg.title || key;
  if (metaEl) {
    const labels = cfg.labels || [];
    metaEl.textContent = labels.length
      ? `${labels[0]} – ${labels[labels.length - 1]}`
      : `Period ${sc.meta?.period || ""}`;
  }

  renderChart(canvas, {
    ...cfg,
    color: cfg.color || "#5c2428",
    seriesLabel: cfg.title || "Value",
    animate: true,
  });
}

function bindGrowth(page, sc) {
  const tabs = [...page.querySelectorAll("[data-trend-key]")];
  if (!tabs.length) return;

  const activate = (key) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.trendKey === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-pressed", on ? "true" : "false");
    });
    paintTrendChart(page, sc, key);
  };

  tabs.forEach((tab) => {
    const key = tab.dataset.trendKey;
    tab.addEventListener("mouseenter", () => activate(key));
    tab.addEventListener("focus", () => activate(key));
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      activate(key);
    });
  });

  activate(tabs[0].dataset.trendKey);
}

function paintCountry(page, sc, slug) {
  const countries = sc.countryStats || [];
  const bySlug = Object.fromEntries(countries.map((c) => [c.slug, c]));
  const country = bySlug[slug] || countries[0];
  if (!country) return;

  page.querySelectorAll("[data-country-tab]").forEach((tab) => {
    const on = tab.dataset.countryTab === country.slug;
    tab.classList.toggle("is-active", on);
    tab.setAttribute("aria-pressed", on ? "true" : "false");
  });

  const status = page.querySelector("[data-country-status]");
  const name = page.querySelector("[data-country-name]");
  const link = page.querySelector("[data-country-link]");
  const chartTitle = page.querySelector("[data-country-chart-title]");

  if (status) status.textContent = country.status || "";
  if (name) name.textContent = country.name;
  if (chartTitle) chartTitle.textContent = `${country.name} · reach`;
  if (link) {
    link.setAttribute("href", `#/country/${country.slug}`);
    link.setAttribute("data-link", "");
    link.textContent = `Open ${country.name} →`;
  }

  COUNTRY_METRICS.forEach((m) => {
    const el = page.querySelector(`[data-country-metric="${m.key}"]`);
    if (el) el.textContent = metricDisplay(country, m);
  });

  const canvas = page.querySelector("[data-country-chart]");
  if (!canvas) return;
  const cfg = chartConfigForCountry(country);
  if (!cfg) return;
  if (typeof Chart !== "undefined") Chart.getChart(canvas)?.destroy();
  renderChart(canvas, cfg);
}

function bindCountryProgress(page, sc) {
  const tabs = [...page.querySelectorAll("[data-country-tab]")];
  if (!tabs.length) return;

  const activate = (slug) => paintCountry(page, sc, slug);
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.countryTab));
  });
  activate(tabs[0].dataset.countryTab);
}

function paintProgrammeChart(page, sc, programId) {
  const countries = sc.countryStats || [];
  const program = PA_PROGRAMS.find((p) => p.id === programId) || PA_PROGRAMS[0];
  const canvas = page.querySelector("[data-prog-chart]");
  if (!canvas || typeof Chart === "undefined") return;

  if (canvas._paProgChart) {
    try {
      canvas._paProgChart.destroy();
    } catch (_) {
      /* ignore */
    }
  }

  const titleEl = page.querySelector("[data-prog-chart-title]");
  const metaEl = page.querySelector("[data-prog-chart-meta]");
  const scoreEl = page.querySelector("[data-prog-avg-score]");
  const trendEl = page.querySelector("[data-prog-avg-trend]");
  const metric = (sc.performanceMetrics || []).find((m) => m.id === program.id);
  if (titleEl) titleEl.textContent = program.label;
  if (metaEl) metaEl.textContent = "Progress % by country";
  if (scoreEl) scoreEl.textContent = metric?.score != null ? `${metric.score}%` : "—";
  if (trendEl) {
    if (metric?.trend) {
      trendEl.textContent = metric.trend;
      trendEl.hidden = false;
    } else {
      trendEl.textContent = "";
      trendEl.hidden = true;
    }
  }

  const labels = countries.map((c) => c.name);
  const data = countries.map((c) => c.programs?.[program.id] ?? 0);
  const colors = countries.map((_, i) => COUNTRY_COLORS[i % COUNTRY_COLORS.length]);

  canvas._paProgChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `${program.short} progress`,
          data,
          backgroundColor: colors,
          borderRadius: 4,
          maxBarThickness: 36,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#5c2428",
          bodyColor: "#4a403c",
          borderColor: "rgba(92,36,40,0.12)",
          borderWidth: 1,
          callbacks: {
            label(ctx) {
              return ` ${ctx.parsed.y}% progress`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#5c2428", font: { weight: "600", size: 11 }, maxRotation: 45, minRotation: 0 },
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(92,36,40,0.06)" },
          ticks: { color: "#7a6e68", callback: (v) => `${v}%` },
        },
      },
      animation: {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
      },
    },
  });
}

function bindProgrammes(page, sc) {
  const tabs = [...page.querySelectorAll("[data-prog-tab]")];
  if (!tabs.length) return;

  const activate = (id) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.progTab === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-pressed", on ? "true" : "false");
    });
    paintProgrammeChart(page, sc, id);
  };

  tabs.forEach((tab) => {
    const id = tab.dataset.progTab;
    tab.addEventListener("mouseenter", () => activate(id));
    tab.addEventListener("focus", () => activate(id));
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      activate(id);
    });
  });
  activate(tabs[0].dataset.progTab);
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

function animateCount(el) {
  const target = parseNumeric(el.dataset.countTo);
  if (target == null) {
    el.textContent = el.dataset.countDisplay || el.textContent;
    return;
  }
  const display = el.dataset.countDisplay || fmtVal(target);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof gsap === "undefined") {
    el.textContent = display;
    return;
  }

  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = fmtVal(Math.round(obj.v));
    },
    onComplete: () => {
      el.textContent = display;
    },
  });
}

function initCountUps(page) {
  const nodes = page.querySelectorAll("[data-count-to]");
  if (!nodes.length) return;

  if (typeof ScrollTrigger === "undefined") {
    nodes.forEach(animateCount);
    return;
  }

  const seen = new WeakSet();
  nodes.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        if (seen.has(el)) return;
        seen.add(el);
        animateCount(el);
      },
    });
  });
}

function initProgressFills(page) {
  page.querySelectorAll("[data-progress-fill]").forEach((fill) => {
    const w = fill.style.getPropertyValue("--target-w") || fill.style.getPropertyValue("--bar-w") || "0%";
    if (typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") {
      fill.style.width = w;
      return;
    }
    gsap.to(fill, {
      width: w,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: fill.closest("article") || fill, start: "top 88%", once: true },
    });
  });
}

function initImpactAnimations(page) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    page.classList.add("id-page--reduced");
    page.querySelectorAll("[data-progress-fill]").forEach((fill) => {
      fill.style.width =
        fill.style.getPropertyValue("--target-w") || fill.style.getPropertyValue("--bar-w") || "0%";
    });
    page.querySelectorAll("[data-count-to]").forEach((el) => {
      el.textContent = el.dataset.countDisplay || el.textContent;
    });
    return;
  }

  if (typeof gsap === "undefined") {
    page.querySelectorAll("[data-progress-fill]").forEach((fill) => {
      fill.style.width = fill.style.getPropertyValue("--target-w") || "0%";
    });
    return;
  }
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  const heroKids = page.querySelectorAll(".id-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", clearProps: "transform" }
    );
  }

  page.querySelectorAll("[data-id-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-id-metric]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        delay: i * 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: el.closest(".id-metric-field") || el, start: "top 85%", once: true },
      }
    );
  });

  const divider = page.querySelector("[data-id-metric-divider]");
  if (divider) {
    gsap.fromTo(
      divider,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.7,
        ease: "power3.out",
        transformOrigin: "left center",
        scrollTrigger: { trigger: divider, start: "top 90%", once: true },
      }
    );
  }

  initCountUps(page);
  initProgressFills(page);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function mountImpactDataPage(data, section = "overview") {
  const page = document.querySelector("[data-impact-data]");
  if (!page) return;

  const sc = data.scorecard;
  if (sc) {
    bindGrowth(page, sc);
    bindCountryProgress(page, sc);
    bindProgrammes(page, sc);
  }

  initImpactAnimations(page);

  const targetId = page.dataset.scrollTarget || SECTION_BY_ROUTE[section];
  if (targetId && section !== "overview") {
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

export function destroyImpactDataPage() {
  document.querySelectorAll("[data-prog-chart]").forEach((canvas) => {
    if (canvas._paProgChart) {
      try {
        canvas._paProgChart.destroy();
      } catch (_) {
        /* ignore */
      }
      canvas._paProgChart = null;
    }
  });
  destroyCharts();
  if (impactMedia) {
    impactMedia.revert();
    impactMedia = null;
  }
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-impact-data]")) t.kill();
    });
  }
}

export const renderWbScorecard = renderImpactDataPage;
export const mountWbScorecard = mountImpactDataPage;
export const destroyWbScorecard = destroyImpactDataPage;
