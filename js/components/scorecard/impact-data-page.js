/**
 * Impact & Data — public evidence layer.
 * Key indicators · Growth trends · Progress indicators · Country comparisons ·
 * Programme comparisons · Data freshness
 */

import { formatNumber } from "../../utils/format.js";
import { formatPaTitle } from "../../utils/pa-title.js";
import { renderChart, destroyCharts } from "../charts.js";

const COMPARE_AREAS = [
  { key: "communities", label: "Communities" },
  { key: "projects", label: "Projects" },
  { key: "pastors", label: "Pastors" },
  { key: "growth", label: "Growth", suffix: "%" },
  { key: "progress", label: "Journey progress", suffix: "%" },
  { key: "leadershipScore", label: "Leadership", suffix: "/100" },
];

const SECTOR_KEYS = ["Education", "Health", "Agriculture", "Water", "Livelihood", "Leadership"];

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

function areaValue(country, key) {
  if (!country) return 0;
  const v = country[key];
  return typeof v === "number" ? v : 0;
}

function areaDisplay(country, area) {
  if (!country) return "—";
  const v = country[area.key];
  if (v == null || v === "") return "—";
  if (area.suffix === "%") return `${v}%`;
  if (area.suffix === "/100") return `${v}`;
  return fmtVal(v);
}

function barWidth(value, max) {
  if (!max || !value) return 0;
  return Math.max(4, Math.round((value / max) * 100));
}

function renderHero(sc = {}) {
  const meta = sc.meta || {};
  const ov = sc.overview || {};
  const image = sc.heroImage || "assets/home-overview/tab-results.jpg";
  return `
    <header class="id-hero" data-id-section="hero">
      <div class="id-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="id-hero__veil"></span>
      </div>
      <div class="container id-hero__layout">
        <div class="id-hero__inner" data-id-reveal>
          <p class="id-eyebrow id-eyebrow--on-dark">Impact &amp; Data</p>
          <h1 class="pa-title id-hero__title">${formatPaTitle(
            {
              titleHtml: "<span>How the work</span> <em>is going.</em>",
              title: ov.headline || "How the work is going.",
            },
            "How the work is going."
          )}</h1>
          <p class="id-hero__lead">${
            ov.description ||
            "The public data and evidence layer — indicators, trends, and side-by-side country progress."
          }</p>
          <p class="id-hero__meta">Reporting ${meta.reportingPeriod || meta.period || "2024"} · Updated ${
            meta.lastUpdatedLabel || meta.lastUpdated || ""
          }</p>
          <div class="id-hero__actions">
            <a class="id-btn id-btn--solid" href="#id-indicators">Key indicators →</a>
            <a class="id-btn id-btn--ghost" href="#id-compare">Compare countries</a>
          </div>
        </div>
      </div>
    </header>`;
}

function renderIndicators(sc = {}) {
  const kpis = sc.kpis || [];
  if (!kpis.length) return "";
  const cards = kpis
    .map(
      (k) => `<article class="id-kpi id-kpi--${k.direction || "neutral"}" data-id-stagger-item>
        <span class="id-kpi__value">${k.text || fmtVal(k.value)}</span>
        <span class="id-kpi__label">${k.label}</span>
        ${k.trend ? `<span class="id-kpi__trend">${k.trend}</span>` : ""}
      </article>`
    )
    .join("");

  return `
    <section class="id-band id-band--skin-gold" id="id-indicators" data-id-section="indicators" aria-labelledby="id-indicators-title">
      <div class="container">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Key indicators</p>
          <h2 id="id-indicators-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Reach across</span> <em>Africa.</em>",
          })}</h2>
          <p class="id-band__lead">Core network figures — countries, communities, homes, projects, and leadership.</p>
        </header>
        <div class="id-kpi-grid" data-id-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderGrowth(sc = {}) {
  const trends = sc.growthTrends || {};
  const keys = Object.keys(trends);
  if (!keys.length) return "";
  const charts = keys
    .slice(0, 4)
    .map((key) => {
      const t = trends[key];
      return `<article class="id-chart-card" data-id-stagger-item>
        <h3>${t.title || key}</h3>
        <div class="id-chart-card__canvas">
          <canvas data-id-chart="${key}" aria-label="${t.title || key}"></canvas>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="id-band id-band--skin-maroon" id="id-growth" data-id-section="growth" aria-labelledby="id-growth-title">
      <div class="container">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Growth trends</p>
          <h2 id="id-growth-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Evidence of</span> <em>real change.</em>",
          })}</h2>
          <p class="id-band__lead">Communities, households, Shalom groups, and project delivery — year by year.</p>
        </header>
        <div class="id-chart-grid" data-id-stagger>${charts}</div>
      </div>
    </section>`;
}

function renderProgress(sc = {}, ia = {}) {
  const stages = sc.progressIndicators || [];
  const readiness = ia?.readinessLevels?.stages || [];
  if (!stages.length && !readiness.length) return "";

  const meters = stages
    .map(
      (s) => `<article class="id-meter" data-id-stagger-item>
        <div class="id-meter__head">
          <strong>${s.label}</strong>
          <span>${s.score}% <small>/ ${s.target}% target</small></span>
        </div>
        <div class="id-meter__track" aria-hidden="true">
          <span class="id-meter__fill" style="width:${s.score}%"></span>
          <span class="id-meter__mark" style="left:${s.target}%"></span>
        </div>
      </article>`
    )
    .join("");

  const stageCards = readiness
    .slice(0, 5)
    .map(
      (s, i) => `<article class="id-stage" data-id-stagger-item>
        <span class="id-stage__n">${String(i + 1).padStart(2, "0")}</span>
        <strong>${s.label || s.name || `Stage ${i + 1}`}</strong>
        ${s.count != null ? `<span class="id-stage__count">${s.count} communities</span>` : ""}
        ${s.description ? `<p>${s.description}</p>` : ""}
      </article>`
    )
    .join("");

  return `
    <section class="id-band id-band--skin-green" id="id-progress" data-id-section="progress" aria-labelledby="id-progress-title">
      <div class="container">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Progress indicators</p>
          <h2 id="id-progress-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Journey stages</span> <em>across the network.</em>",
          })}</h2>
          <p class="id-band__lead">How far communities have moved through awareness, training, implementation, and multiplication — against targets.</p>
        </header>
        ${meters ? `<div class="id-meter-grid" data-id-stagger>${meters}</div>` : ""}
        ${stageCards ? `<div class="id-stage-grid" data-id-stagger>${stageCards}</div>` : ""}
      </div>
    </section>`;
}

function countryOptions(countries, selected, exclude) {
  return countries
    .map((c) => {
      const disabled = exclude && c.slug === exclude ? " disabled" : "";
      const sel = c.slug === selected ? " selected" : "";
      return `<option value="${c.slug}"${sel}${disabled}>${c.name}</option>`;
    })
    .join("");
}

function renderCountryMetricRows(country, mode = "reach", tone = "a") {
  if (!country) return "";

  if (mode === "sectors") {
    return SECTOR_KEYS.map((label) => {
      const v = country?.sectors?.[label] ?? 0;
      return `<div class="id-ccard__row">
        <span class="id-ccard__area">${label}</span>
        <span class="id-ccard__val">${v || "—"}%</span>
        <span class="id-ccard__track" aria-hidden="true">
          <i class="id-ccard__fill id-ccard__fill--${tone}" style="width:${barWidth(v, 100)}%"></i>
        </span>
      </div>`;
    }).join("");
  }

  const max = Math.max(...COMPARE_AREAS.map((area) => areaValue(country, area.key)), 1);
  return COMPARE_AREAS.map((area) => {
    const v = areaValue(country, area.key);
    return `<div class="id-ccard__row">
      <span class="id-ccard__area">${area.label}</span>
      <span class="id-ccard__val">${areaDisplay(country, area)}</span>
      <span class="id-ccard__track" aria-hidden="true">
        <i class="id-ccard__fill id-ccard__fill--${tone}" style="width:${barWidth(v, max)}%"></i>
      </span>
    </div>`;
  }).join("");
}

function renderCountryCompare(sc = {}) {
  const countries = sc.countryStats || [];
  if (countries.length < 2) return "";

  const a0 = countries[0];
  const b0 = countries[1];

  return `
    <section class="id-band id-band--skin-gold" id="id-compare" data-id-section="compare" aria-labelledby="id-compare-title">
      <div class="container">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Country comparisons</p>
          <h2 id="id-compare-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Compare</span> <em>two countries.</em>",
          })}</h2>
          <p class="id-band__lead">Switch countries to see progress in the same areas.</p>
        </header>

        <div class="id-compare" data-id-compare data-id-reveal>
          <div class="id-compare__modes" role="group" aria-label="Comparison focus">
            <button type="button" class="id-compare__mode is-active" data-compare-mode="reach">Reach</button>
            <button type="button" class="id-compare__mode" data-compare-mode="sectors">Programmes</button>
          </div>

          <div class="id-compare__pair">
            <article class="id-ccard id-ccard--a">
              <label class="id-ccard__pick">
                <span class="sr-only">First country</span>
                <select data-compare-a aria-label="First country">${countryOptions(countries, a0.slug, b0.slug)}</select>
              </label>
              <div class="id-ccard__rows" data-compare-rows-a>
                ${renderCountryMetricRows(a0, "reach", "a")}
              </div>
            </article>

            <article class="id-ccard id-ccard--b">
              <label class="id-ccard__pick">
                <span class="sr-only">Second country</span>
                <select data-compare-b aria-label="Second country">${countryOptions(countries, b0.slug, a0.slug)}</select>
              </label>
              <div class="id-ccard__rows" data-compare-rows-b>
                ${renderCountryMetricRows(b0, "reach", "b")}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>`;
}

function renderProgrammes(sc = {}) {
  const sectors = sc.performanceMetrics || [];
  if (!sectors.length) return "";
  const max = Math.max(...sectors.map((p) => p.score || 0), 1);
  const cards = sectors
    .map(
      (p) => `<article class="id-programme" data-id-stagger-item>
        <div class="id-programme__top">
          <strong>${p.sector}</strong>
          <span>${p.score}%</span>
        </div>
        <div class="id-programme__bar" aria-hidden="true">
          <span style="width:${barWidth(p.score, max)}%"></span>
        </div>
        <p class="id-programme__meta">${p.trend || ""} · ${p.status || ""}</p>
      </article>`
    )
    .join("");

  return `
    <section class="id-band id-band--skin-maroon" id="id-programmes" data-id-section="programmes" aria-labelledby="id-programmes-title">
      <div class="container">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Programme comparisons</p>
          <h2 id="id-programmes-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>How programme areas</span> <em>are advancing.</em>",
          })}</h2>
          <p class="id-band__lead">Network-wide outcomes across education, health, agriculture, water, livelihood, and leadership — each on its own path.</p>
        </header>
        <div class="id-programme-grid" data-id-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderFreshness(sc = {}) {
  const meta = sc.meta || {};
  const highlights = sc.overview?.highlights || [];
  const items = [
    { label: "Reporting period", value: meta.reportingPeriod || meta.period || "—" },
    { label: "Last updated", value: meta.lastUpdatedLabel || meta.lastUpdated || "—" },
    { label: "Data sources", value: meta.sources || highlights.find((h) => /source/i.test(h.label))?.value || "—" },
  ];

  return `
    <section class="id-band id-band--skin-green" id="id-freshness" data-id-section="freshness" aria-labelledby="id-freshness-title">
      <div class="container id-fresh-layout">
        <header class="id-band__head" data-id-reveal>
          <p class="id-eyebrow">Data freshness</p>
          <h2 id="id-freshness-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>When these figures</span> <em>were reported.</em>",
          })}</h2>
          <p class="id-band__lead">${
            meta.freshnessNote ||
            "Reporting dates and sources for the evidence on this page."
          }</p>
        </header>
        <div class="id-fresh-grid" data-id-stagger>
          ${items
            .map(
              (it) => `<article class="id-fresh" data-id-stagger-item>
                <span>${it.label}</span>
                <strong>${it.value}</strong>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderCta() {
  return `
    <section class="id-cta" id="id-next" data-id-section="cta" aria-labelledby="id-cta-title">
      <div class="container id-cta__inner" data-id-reveal>
        <div>
          <p class="id-eyebrow id-eyebrow--on-dark">Next step</p>
          <h2 id="id-cta-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>See the work</span> <em>where it happens.</em>",
          })}</h2>
          <p>Open a country, follow a community journey, or read stories from the field.</p>
        </div>
        <div class="id-cta__actions">
          <a class="id-btn id-btn--solid" ${linkAttrs("#/africa")}>Where we work →</a>
          <a class="id-btn id-btn--ghost" ${linkAttrs("#/stories")}>Stories</a>
        </div>
      </div>
    </section>`;
}

const SECTION_BY_ROUTE = {
  overview: "id-indicators",
  working: "id-programmes",
  together: "id-growth",
  journey: "id-progress",
  countries: "id-compare",
};

export function renderImpactDataPage(data, section = "overview") {
  const sc = data.scorecard;
  const ia = data.insightsAnalytics || {};
  if (!sc) {
    return `<div class="container static-page"><h1>Impact &amp; Data is unavailable</h1></div>`;
  }

  return `
    <div class="id-page" data-impact-data data-wb-scorecard data-scroll-target="${SECTION_BY_ROUTE[section] || ""}">
      ${renderHero(sc)}
      ${renderIndicators(sc)}
      ${renderGrowth(sc)}
      ${renderProgress(sc, ia)}
      ${renderCountryCompare(sc)}
      ${renderProgrammes(sc)}
      ${renderFreshness(sc)}
      ${renderCta()}
    </div>`;
}

function bindCountryCompare(page, sc) {
  const root = page.querySelector("[data-id-compare]");
  if (!root) return;
  const countries = sc.countryStats || [];
  const bySlug = Object.fromEntries(countries.map((c) => [c.slug, c]));
  const selA = root.querySelector("[data-compare-a]");
  const selB = root.querySelector("[data-compare-b]");
  const rowsA = root.querySelector("[data-compare-rows-a]");
  const rowsB = root.querySelector("[data-compare-rows-b]");
  const modes = [...root.querySelectorAll("[data-compare-mode]")];
  let mode = "reach";

  const syncDisabled = () => {
    const a = selA.value;
    const b = selB.value;
    [...selA.options].forEach((o) => {
      o.disabled = o.value === b;
    });
    [...selB.options].forEach((o) => {
      o.disabled = o.value === a;
    });
  };

  const refresh = () => {
    let a = bySlug[selA.value];
    let b = bySlug[selB.value];
    if (!a || !b) return;
    if (a.slug === b.slug) {
      const other = countries.find((c) => c.slug !== a.slug);
      if (other) {
        selB.value = other.slug;
        b = other;
      }
    }
    syncDisabled();
    if (rowsA) rowsA.innerHTML = renderCountryMetricRows(a, mode, "a");
    if (rowsB) rowsB.innerHTML = renderCountryMetricRows(b, mode, "b");
  };

  selA?.addEventListener("change", refresh);
  selB?.addEventListener("change", refresh);
  modes.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.compareMode || "reach";
      modes.forEach((m) => m.classList.toggle("is-active", m === btn));
      refresh();
    });
  });

  syncDisabled();
}

export function mountImpactDataPage(data, section = "overview") {
  const page = document.querySelector("[data-impact-data]");
  if (!page) return;

  const sc = data.scorecard;
  const trends = sc?.growthTrends || {};
  Object.keys(trends).forEach((key) => {
    const canvas = page.querySelector(`[data-id-chart="${key}"]`);
    const cfg = trends[key];
    if (!canvas || !cfg) return;
    renderChart(canvas, {
      ...cfg,
      color: cfg.color || "#e8a91a",
    });
  });

  if (sc) bindCountryCompare(page, sc);

  initImpactAnimations(page);

  const targetId = page.dataset.scrollTarget || SECTION_BY_ROUTE[section];
  if (targetId && section !== "overview") {
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function initImpactAnimations(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-id-reveal], [data-id-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroKids = page.querySelectorAll(".id-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out", clearProps: "transform" }
    );
  }

  page.querySelectorAll("[data-id-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-id-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.set(group, { autoAlpha: 1 });
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 16, scale: 0.97 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyImpactDataPage() {
  destroyCharts();
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-impact-data]")) t.kill();
    });
  }
}

export const renderWbScorecard = renderImpactDataPage;
export const mountWbScorecard = mountImpactDataPage;
export const destroyWbScorecard = destroyImpactDataPage;
