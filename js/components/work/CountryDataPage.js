import { formatNumber } from "../../utils/format.js";
import { numberCardsFromHub } from "../../utils/work-locations.js";
import { renderChart, destroyCharts } from "../charts.js";

const THEME_NAV = [
  { id: "overview", label: "Overview" },
  { id: "programmes", label: "Programmes" },
  { id: "trends", label: "Trends" },
  { id: "activity", label: "Field activity" },
  { id: "places", label: "Places" },
];

const SECTOR_COLORS = {
  education: "#0077B6",
  health: "#16a34a",
  agriculture: "#F5A623",
  climate: "#4A5568",
  water: "#009FDA",
  livelihood: "#002B5C",
  leadership: "#002244",
  community: "#5b8a72",
};

function kpiDisplay(kpi) {
  if (kpi.text) return kpi.text;
  const num = kpi.value != null ? formatNumber(kpi.value) : "—";
  const prefix = kpi.prefix || "";
  const suffix = kpi.suffix || "";
  return `${prefix}${num}${suffix}`;
}

function networkCompareRow(label, countryVal, networkVal, format = "number") {
  const fmt = (v) => {
    if (v == null || v === "") return "—";
    if (format === "percent") return `${v}%`;
    return formatNumber(v);
  };
  return `<tr>
    <th scope="row">${label}</th>
    <td>${fmt(countryVal)}</td>
    <td>${fmt(networkVal)}</td>
  </tr>`;
}

function renderKpiStrip(kpis = []) {
  const headline = kpis.filter((k) =>
    ["communities", "pastors", "growth", "ppp", "programs", "activity"].includes(k.id)
  );
  return headline
    .map(
      (k) => `<div class="d360-kpi">
        <span class="d360-kpi__val">${kpiDisplay(k)}</span>
        <span class="d360-kpi__label">${k.label}</span>
      </div>`
    )
    .join("");
}

function renderKpiGrid(kpis = []) {
  return kpis
    .map(
      (k) => `<div class="d360-stat">
        <span class="d360-stat__val">${kpiDisplay(k)}</span>
        <span class="d360-stat__label">${k.label}</span>
        ${k.trend ? `<span class="d360-stat__trend">${k.trend}</span>` : ""}
      </div>`
    )
    .join("");
}

function renderProgrammeThemes(insights = []) {
  return insights
    .map((ins) => {
      const color = SECTOR_COLORS[ins.id] || "#009FDA";
      return `<button type="button" class="d360-flip" data-d360-flip aria-pressed="false" style="--d360-accent:${color}">
        <span class="d360-flip__inner">
          <span class="d360-flip__face d360-flip__front">
            <span class="d360-flip__hint" aria-hidden="true"><span class="d360-flip__hint-icon">↻</span> Tap to flip</span>
            <h3>${ins.title}</h3>
            <span class="d360-flip__score">${ins.score ?? "—"}</span>
            <span class="d360-flip__score-label">Sector score</span>
            ${ins.metric ? `<span class="d360-flip__metric">${ins.metric}</span>` : ""}
          </span>
          <span class="d360-flip__face d360-flip__back">
            <p>${ins.summary || ""}</p>
            ${ins.trend ? `<span class="d360-flip__trend">${ins.trend}</span>` : ""}
            <span class="d360-flip__hint d360-flip__hint--back">Tap to flip back</span>
          </span>
        </span>
      </button>`;
    })
    .join("");
}

function renderCountrySwitcher(paCountries, currentSlug) {
  const options = paCountries
    .map((c) => `<option value="${c.slug}"${c.slug === currentSlug ? " selected" : ""}>${c.name}</option>`)
    .join("");
  return `<div class="d360-country-switch">
    <label class="d360-country-switch__label" for="d360-country-select">All countries</label>
    <select id="d360-country-select" class="d360-country-switch__select" data-d360-country-select aria-label="Switch country data profile">${options}</select>
  </div>`;
}

function renderTrendCharts(cards = []) {
  return cards
    .map(
      (c) => `<article class="d360-chart-card" data-d360-chart="${c.key}">
        <div class="d360-chart-card__head">
          <h3>${c.title}</h3>
          ${c.chartKind ? `<span class="d360-chart-card__kind">${c.chartKind}</span>` : ""}
        </div>
        <p class="d360-chart-card__sub">${c.subtitle}</p>
        <div class="d360-chart-card__canvas"><canvas data-d360-chart-canvas="${c.key}"></canvas></div>
        <p class="d360-chart-card__source">${c.source?.label || "Source · Field reports"}</p>
      </article>`
    )
    .join("");
}

function renderActivityTable(activities = []) {
  if (!activities.length) {
    return `<p class="d360-empty">Field activity for this country will appear here as reports are filed.</p>`;
  }
  const rows = activities
    .map(
      (a) => `<tr>
        <td>${a.date || "—"}</td>
        <td>${a.community || "—"}</td>
        <td>${a.project || "—"}</td>
        <td><span class="d360-status">${a.status || "—"}</span></td>
      </tr>`
    )
    .join("");
  return `<div class="d360-table-wrap">
    <table class="d360-table">
      <thead><tr><th>Date</th><th>Community</th><th>Project</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderReportsList(reports = []) {
  if (!reports.length) return "";
  return `<div class="d360-reports">
    <h3>Reports from this country</h3>
    <ul>${reports.map((r) => `<li><a href="#/resources/cases" data-link>${r.title}</a> <span>${r.summary || r.period || ""}</span></li>`).join("")}</ul>
  </div>`;
}

function renderPlaces(catchments = [], communitiesByCatchment = {}, countrySlug) {
  if (!catchments.length) {
    return `<p class="d360-empty">Nearby groups will appear as communities join the network.</p>`;
  }
  return catchments
    .map((ct) => {
      const communities = communitiesByCatchment[ct.id] || [];
      const summary = ct.summary || {};
      const href = `#/catchment/${countrySlug}/${ct.slug}`;
      const commLinks = communities
        .map(
          (com) =>
            `<a href="#/community/${countrySlug}/${ct.slug}/${com.slug}" class="d360-place-chip" data-link>${com.name}</a>`
        )
        .join("");
      return `<article class="d360-place-wrap">
        <a href="${href}" class="d360-place-card" data-link>
          <span class="d360-place-card__top">
            <span>
              <h3>${ct.name}</h3>
              <p>${ct.region || "Nearby group of communities"}</p>
            </span>
            <span class="d360-place-card__open">Open group →</span>
          </span>
          <dl class="d360-place-card__stats">
            <div><dt>Communities</dt><dd>${summary.communities ?? communities.length}</dd></div>
            <div><dt>Pastors</dt><dd>${summary.pastors ?? "—"}</dd></div>
            <div><dt>Shalom groups</dt><dd>${summary.shalomGroups ?? "—"}</dd></div>
            <div><dt>Households</dt><dd>${summary.households ?? "—"}</dd></div>
          </dl>
        </a>
        ${commLinks ? `<div class="d360-place-card__foot"><span class="d360-place-card__comm-label">Communities</span><div class="d360-place-card__chips">${commLinks}</div></div>` : ""}
      </article>`;
    })
    .join("");
}

function renderCompareTable(hub, networkRows, countryRow) {
  if (!networkRows?.length && !countryRow) return "";

  const communities = hub.kpis?.find((k) => k.id === "communities")?.value ?? hub.country?.communities;
  const pastors = hub.kpis?.find((k) => k.id === "pastors")?.value ?? hub.country?.pastors;
  const growth = hub.kpis?.find((k) => k.id === "growth")?.value ?? hub.country?.growth;
  const projects = countryRow?.projects ?? hub.kpis?.find((k) => k.id === "ppp")?.value;
  const countryLeadership = networkRows.find((r) => r.slug === hub.country.slug)?.leadershipScore;

  return `<div class="d360-compare">
    <h3>Compare with PA network</h3>
    <div class="d360-table-wrap">
      <table class="d360-table d360-table--compare">
        <thead><tr><th>Indicator</th><th>${hub.countryName}</th><th>Network average</th></tr></thead>
        <tbody>
          ${networkCompareRow("Communities", communities, networkAvg(networkRows, "communities"))}
          ${networkCompareRow("Pastors", pastors, networkAvg(networkRows, "pastors"))}
          ${networkCompareRow("Active projects", projects, networkAvg(networkRows, "projects"))}
          ${networkCompareRow("YoY growth", growth, networkAvg(networkRows, "growth"), "percent")}
          ${networkCompareRow("Leadership score", countryLeadership, networkAvg(networkRows, "leadershipScore"))}
        </tbody>
      </table>
    </div>
  </div>`;
}

function networkAvg(rows, key) {
  if (!rows?.length) return null;
  const vals = rows.map((r) => r[key]).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function renderCountryDataPage(payload) {
  const { hub, catchments, communitiesByCatchment, networkCompare, countryStats, paCountries = [] } = payload;
  const slug = hub.country.slug;
  const iso = hub.country.isoCode || hub.countryName?.slice(0, 3).toUpperCase();
  const lastActivity = hub.kpis?.find((k) => k.id === "activity");
  const updated = lastActivity?.text || "Sep 2024";
  const chartCards = numberCardsFromHub(hub);

  const nav = THEME_NAV.map(
    (t, i) =>
      `<a href="#${t.id}" class="d360-nav__link${i === 0 ? " is-active" : ""}" data-d360-nav="${t.id}">${t.label}</a>`
  ).join("");

  const panels = THEME_NAV.map((t, i) => {
    let inner = "";
    if (t.id === "overview") {
      inner = `
        <div class="d360-overview-grid">${renderKpiGrid(hub.kpis || [])}</div>
        ${renderCompareTable(hub, networkCompare, countryStats)}`;
    } else if (t.id === "programmes") {
      inner = `
        <p class="d360-programmes-note">Sector scores (0–100) show programme progress from field tracking. Counts such as schools or outreaches appear on the front of each card.</p>
        <div class="d360-flip-grid">${renderProgrammeThemes(hub.insights || [])}</div>`;
    } else if (t.id === "trends") {
      inner = chartCards.length
        ? `<div class="d360-chart-grid">${renderTrendCharts(chartCards)}</div>`
        : `<p class="d360-empty">Trend charts will appear as field data is collected.</p>`;
    } else if (t.id === "activity") {
      inner = `${renderActivityTable(hub.activities || [])}${renderReportsList(hub.reports || [])}`;
    } else if (t.id === "places") {
      inner = `
        <header class="d360-places-head">
          <p class="d360-places-head__eyebrow">Drill down</p>
          <h2>Places in ${hub.countryName}</h2>
          <p>Open a nearby group or community for local figures and stories.</p>
        </header>
        <div class="d360-places-grid">${renderPlaces(catchments, communitiesByCatchment, slug)}</div>`;
    }
    return `<section class="d360-panel${i === 0 ? " is-active" : ""}" id="${t.id}" data-d360-panel="${t.id}" role="tabpanel"${i === 0 ? "" : " hidden"}>${inner}</section>`;
  }).join("");

  return `
    <div class="d360-page" data-country-data data-country-slug="${slug}">
      <header class="d360-masthead">
        <div class="container d360-masthead__inner">
          <nav class="d360-crumb" aria-label="Breadcrumb">
            <a href="#/africa" data-link>Where we work</a>
            <span aria-hidden="true">/</span>
            <a href="#/country/${slug}" data-link>${hub.countryName}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Data profile</span>
          </nav>
          <div class="d360-masthead__row">
            <div>
              <p class="d360-masthead__eyebrow">PA Network · Data profile</p>
              <h1 class="d360-masthead__title">${hub.countryName}</h1>
              <p class="d360-masthead__meta">
                <span class="d360-code">${iso}</span>
                Last updated ${updated} · Source · Field tracking system
              </p>
            </div>
            <div class="d360-masthead__actions">
              ${renderCountrySwitcher(paCountries, slug)}
            </div>
          </div>
          <div class="d360-kpi-strip">${renderKpiStrip(hub.kpis || [])}</div>
        </div>
      </header>

      <div class="d360-nav-wrap">
        <div class="container">
          <nav class="d360-nav" role="tablist" aria-label="Data sections">${nav}</nav>
        </div>
      </div>

      <main class="d360-main">
        <div class="container d360-main__inner">
          ${panels}
        </div>
      </main>
    </div>`;
}

export function mountCountryDataPage(root, hub) {
  const page = root.querySelector("[data-country-data]");
  if (!page) return;

  const cards = numberCardsFromHub(hub);
  cards.forEach((card) => {
    const canvas = page.querySelector(`[data-d360-chart-canvas="${card.key}"]`);
    if (canvas) renderChart(canvas, card.config);
  });

  const navLinks = [...page.querySelectorAll("[data-d360-nav]")];
  const panels = [...page.querySelectorAll("[data-d360-panel]")];

  const showPanel = (id) => {
    navLinks.forEach((link) => {
      const on = link.dataset.d360Nav === id;
      link.classList.toggle("is-active", on);
    });
    panels.forEach((panel) => {
      const on = panel.dataset.d360Panel === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.dataset.d360Nav;
      showPanel(id);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const countrySelect = page.querySelector("[data-d360-country-select]");
  countrySelect?.addEventListener("change", () => {
    const next = countrySelect.value;
    if (next && next !== hub.country.slug) {
      location.hash = `#/country/${next}/data`;
    }
  });

  page.querySelectorAll("[data-d360-flip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const flipped = btn.classList.toggle("is-flipped");
      btn.setAttribute("aria-pressed", flipped ? "true" : "false");
    });
  });
}

export function destroyCountryDataPage() {
  destroyCharts();
}
