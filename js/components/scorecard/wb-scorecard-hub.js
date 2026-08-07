import { formatNumber } from "../../utils/format.js";
import { renderChart, destroyCharts } from "../charts.js";
import { buildCommunityHubPath } from "../shared/site-bridge.js";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "outcomes", label: "Outcomes" },
  { id: "data", label: "Data" },
  { id: "analysis", label: "Analysis" },
  { id: "progress", label: "Progress" },
];

const WB_THEMES = [
  { name: "orange", color: "#de8a0a" },
  { name: "gold", color: "#d4a017" },
  { name: "sand", color: "#c4a574" },
  { name: "sky", color: "#7eb3c4" },
  { name: "purple", color: "#8b7aad" },
  { name: "green", color: "#5a9468" },
  { name: "teal", color: "#3d8f8f" },
  { name: "coral", color: "#d4724a" },
];

const CARD_ICONS = {
  countries: "🌍",
  communities: "🏘️",
  households: "🏠",
  projects: "📋",
  lives: "❤️",
  shalom: "🤝",
  leadership: "✦",
  growth: "📈",
  Education: "📚",
  Health: "🏥",
  Agriculture: "🌾",
  Water: "💧",
  Livelihood: "💼",
  Leadership: "✦",
  growth_insight: "📊",
  water: "💧",
  leadership_insight: "✦",
  livelihood: "💼",
};

const CARD_COPY = {
  countries: { keyword: "Countries", rest: "in the PA network reporting transformation data." },
  communities: { keyword: "Communities", rest: "engaged in pastor-led holistic transformation programmes." },
  households: { keyword: "Households", rest: "reached through ministry and community development work." },
  projects: { keyword: "Projects", rest: "active across water, agriculture, and livelihood sectors." },
  lives: { keyword: "Lives", rest: "impacted through the whole-gospel transformation model." },
  shalom: { keyword: "Shalom groups", rest: "building cohesion and discipleship depth in communities." },
  leadership: { keyword: "Leadership teams", rest: "developed through the two-year pastor journey framework." },
  growth: { keyword: "Network growth", rest: "year-over-year across active catchments and countries." },
  Education: { keyword: "Education", rest: "outcomes improving through school and literacy programmes." },
  Health: { keyword: "Health", rest: "services strengthened in underserved rural communities." },
  Agriculture: { keyword: "Agriculture", rest: "productivity rising through farmer training and cooperatives." },
  Water: { keyword: "Water", rest: "infrastructure delivering reliable access in dryland regions." },
  Livelihood: { keyword: "Livelihood", rest: "income growing through CHIP groups and skill transfer." },
};

function pct(achieved, expected) {
  if (!expected) return 0;
  return Math.min(100, Math.round((achieved / expected) * 100));
}

function getCardCopy(item) {
  const copy = CARD_COPY[item.id] || CARD_COPY[item.sector] || CARD_COPY[item.label];
  if (copy) return copy;
  const label = item.label || item.title || "Metric";
  return { keyword: label, rest: item.summary || item.description || "across the PA transformation network." };
}

function renderMetricCard(item, index) {
  const theme = WB_THEMES[index % WB_THEMES.length];
  const achieved = item.achieved ?? item.value ?? 0;
  const expected = item.expected ?? (Math.ceil(Number(achieved) * 1.2) || 1);
  const progress = item.progress ?? pct(achieved, expected);
  const achievedLabel =
    item.achievedLabel || (typeof achieved === "number" && achieved >= 1000 ? formatNumber(achieved) : achieved);
  const expectedLabel =
    item.expectedLabel || (typeof expected === "number" && expected >= 1000 ? formatNumber(expected) : expected);
  const icon = item.icon || CARD_ICONS[item.id] || CARD_ICONS[item.sector] || "◆";
  const { keyword, rest } = getCardCopy(item);
  const summary = item.summary || item.description || item.trend || "";

  return `
    <article
      class="wbs-card wbs-card--${theme.name}"
      data-wbs-card
      data-wbs-card-id="${item.id}"
      data-wbs-theme="${theme.name}"
      style="--wbs-card-accent: ${theme.color}"
      tabindex="0"
      role="button"
      aria-expanded="false"
      aria-label="${keyword}: ${rest}"
    >
      <div class="wbs-card__info">
        <div class="wbs-card__icon-ring" aria-hidden="true">
          <span class="wbs-card__icon">${icon}</span>
        </div>
        <p class="wbs-card__text">
          <strong class="wbs-card__keyword">${keyword}</strong>
          <span class="wbs-card__rest">${rest}</span>
        </p>
      </div>
      <div class="wbs-card__expanded" aria-hidden="true">
        <div class="wbs-card__metrics">
          <div class="wbs-card__bar" aria-hidden="true">
            <div class="wbs-card__bar-track"></div>
            <div class="wbs-card__bar-fill" style="height:${progress}%"></div>
          </div>
          <div class="wbs-card__figures">
            <div class="wbs-card__figure wbs-card__figure--achieved">
              <span class="wbs-card__value">${achievedLabel}</span>
              <span class="wbs-card__value-label">Achieved</span>
            </div>
            <div class="wbs-card__figure wbs-card__figure--expected">
              <span class="wbs-card__value wbs-card__value--sm">${expectedLabel}</span>
              <span class="wbs-card__value-label">Expected</span>
            </div>
          </div>
        </div>
        <div class="wbs-card__divider" aria-hidden="true"></div>
        <div class="wbs-card__detail">
          <p class="wbs-card__detail-title"><strong>${keyword}</strong> ${rest}</p>
          ${summary ? `<p class="wbs-card__detail-desc">${summary}</p>` : ""}
          ${item.link ? `<a href="${item.link}" class="wbs-card__cta" data-link>Learn more ›</a>` : ""}
        </div>
      </div>
    </article>`;
}

function buildOverviewCards(sc) {
  return (sc.kpis || []).map((k) => {
    const val = typeof k.value === "number" ? k.value : 0;
    let expected = val;
    if (k.id === "communities") expected = 70;
    else if (k.id === "households") expected = 300000;
    else if (k.id === "projects") expected = 180;
    else if (k.id === "shalom") expected = 100;
    else if (k.id === "countries") expected = 7;
    else if (k.id === "lives") expected = 400000;
    else if (k.id === "leadership") expected = 70;
    else expected = Math.max(val + 10, Math.round(val * 1.15));

    return {
      id: k.id,
      label: k.label,
      achieved: k.text || val,
      expected,
      progress: pct(val || 1, expected),
      summary: `Network trend: ${k.trend || "stable"}. Reporting period ${sc.meta?.period || "2024"}.`,
      link: k.id === "growth" ? "#/scorecard#tab-data" : "#/scorecard#tab-outcomes",
    };
  });
}

function renderOverviewPanel(sc, ia) {
  const cards = buildOverviewCards(sc);
  const ov = sc.overview || {};

  return `
    <section class="wbs-panel wbs-panel--overview is-active" data-panel="overview" id="tab-overview">
      <div class="wbs-hero-split">
        <div class="wbs-hero-split__copy">
          <h2>${ov.headline || "Measuring transformation across Africa"}</h2>
          <p>${ov.description || sc.meta.subtitle}</p>
          <p class="wbs-hero-split__date">Updated ${sc.meta.lastUpdated}</p>
        </div>
        <div class="wbs-hero-split__visual" aria-hidden="true"></div>
      </div>
      <div class="wbs-cards-wrap">
        <div class="wbs-cards-grid">
          ${cards.map((c, i) => renderMetricCard(c, i)).join("")}
        </div>
      </div>
    </section>`;
}

function renderOutcomesPanel(sc, ia) {
  const sectors = sc.performanceMetrics || [];
  const progress = sc.progressIndicators || [];

  return `
    <section class="wbs-panel" data-panel="outcomes" id="tab-outcomes">
      <header class="wbs-panel-head">
        <h2>Outcome areas</h2>
        <p>Sector performance and journey-stage progress across the PA network — holistic transformation, not single metrics.</p>
        <p class="wbs-panel-head__date">Period ${sc.meta.period} · Updated ${sc.meta.lastUpdated}</p>
      </header>
      <div class="wbs-cards-grid wbs-cards-grid--compact">
        ${sectors.map((p, i) =>
          renderMetricCard(
            {
              ...p,
              label: p.sector,
              achieved: p.score,
              expected: 100,
              progress: p.score,
              summary: `${p.trend} · Status: ${p.status}`,
            },
            i
          )
        ).join("")}
      </div>
      <div class="wbs-outcomes-progress">
        <h3>Journey stage targets</h3>
        <div class="wbs-target-grid">
          ${progress
            .map(
              (p) => `<article class="wbs-target">
              <div class="wbs-target__head"><span>${p.label}</span><strong>${p.score}%</strong></div>
              <div class="wbs-target__track"><div class="wbs-target__fill" style="width:${p.score}%"></div></div>
              <span class="wbs-target__goal">Target ${p.target}%</span>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderDataPanel(sc, ia) {
  const countries = sc.countryStats || [];
  const trends = sc.growthTrends || ia?.trendAnalysis || {};

  return `
    <section class="wbs-panel" data-panel="data" id="tab-data">
      <header class="wbs-panel-head">
        <h2>Network data</h2>
        <p>Country rankings and time-series trends from field tracking across seven PA nations.</p>
        <p class="wbs-panel-head__date">Updated ${sc.meta.lastUpdated}</p>
      </header>
      <div class="wbs-table-wrap">
        <table class="wbs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Country</th>
              <th>Communities</th>
              <th>Projects</th>
              <th>Growth</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${countries
              .map(
                (c, i) => `<tr>
                <td>${i + 1}</td>
                <th><a href="#/country/${c.slug}" data-link>${c.name}</a></th>
                <td>${c.communities}</td>
                <td>${c.projects}</td>
                <td class="${c.growth > 0 ? "is-up" : ""}">+${c.growth}%</td>
                <td><div class="wbs-table-bar"><span style="width:${c.progress}%"></span></div> ${c.progress}%</td>
                <td><span class="wbs-status wbs-status--${(c.status || "").toLowerCase()}">${c.status}</span></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="wbs-charts-grid">
        ${Object.entries(trends)
          .slice(0, 4)
          .map(
            ([key, cfg]) => `<article class="wbs-chart-card" data-wbs-chart="${key}">
            <h3>${cfg.title}</h3>
            <p>${cfg.description || ""}</p>
            <div class="wbs-chart-wrap"><canvas></canvas></div>
          </article>`
          )
          .join("")}
      </div>
    </section>`;
}

function renderAnalysisPanel(sc, ia) {
  const countries = ia?.countryComparison?.countries || [];
  const communities = ia?.communityComparison?.communities || [];
  const cbc = ia?.cbcIndex;
  const labels = ia?.countryComparison?.metricLabels || {};

  return `
    <section class="wbs-panel wbs-panel--analysis" data-panel="analysis" id="tab-analysis">
      <div class="wbs-panel-hero wbs-panel-hero--analysis">
        <header class="wbs-panel-head">
          <h2>Analysis &amp; comparisons</h2>
          <p>CBC index and side-by-side peer comparison — understand performance in context.</p>
          <p class="wbs-panel-head__date">Updated ${ia?.meta?.lastUpdated || sc.meta.lastUpdated}</p>
        </header>
      </div>

      <div class="wbs-panel-body">
      <div class="wbs-cbc-block">
        <div class="wbs-cbc-copy">
          <h3>${cbc?.title || "Community Balanced Scorecard"}</h3>
          <p>${cbc?.description || ""}</p>
          <ul class="wbs-cbc-list">
            ${(cbc?.dimensions || [])
              .map(
                (d) => `<li>
                <span>${d.label}</span>
                <strong>${d.score}</strong>
                <em>${d.trend}</em>
                <div class="wbs-cbc-bar"><span style="width:${d.score}%"></span></div>
              </li>`
              )
              .join("")}
          </ul>
        </div>
        <div class="wbs-cbc-chart">
          <div class="wbs-chart-wrap wbs-chart-wrap--radar"><canvas id="wbs-chart-cbc"></canvas></div>
        </div>
      </div>

      <div class="wbs-compare-grid">
        <article class="wbs-compare-card">
          <h3>Country vs country</h3>
          <div class="wbs-compare-pickers">
            <label>Country A <select id="wbs-country-a">${countries.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("")}</select></label>
            <span>vs</span>
            <label>Country B <select id="wbs-country-b">${countries.map((c, i) => `<option value="${c.slug}" ${i === 1 ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>
          </div>
          <div class="wbs-duel" id="wbs-country-results" data-metric-labels='${JSON.stringify(labels)}'></div>
          <div class="wbs-compare-links" id="wbs-country-links" hidden></div>
        </article>
        <article class="wbs-compare-card">
          <h3>Community vs community</h3>
          <div class="wbs-compare-pickers">
            <label>Community A <select id="wbs-community-a">${communities.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label>
            <span>vs</span>
            <label>Community B <select id="wbs-community-b">${communities.map((c, i) => `<option value="${c.id}" ${i === 1 ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>
          </div>
          <div class="wbs-duel" id="wbs-community-results"></div>
          <div class="wbs-compare-links" id="wbs-community-links" hidden></div>
        </article>
      </div>
      </div>
    </section>`;
}

function renderProgressPanel(sc, ia) {
  const readiness = ia?.readinessLevels;
  const drivers = readiness?.progressDrivers || [];
  const hotspots = ia?.whyProgressing || [];

  return `
    <section class="wbs-panel wbs-panel--progress" data-panel="progress" id="tab-progress">
      <div class="wbs-panel-hero wbs-panel-hero--progress">
        <header class="wbs-panel-head">
          <h2>Progress &amp; hotspots</h2>
          <p>${readiness?.description || "Journey readiness and areas advancing fastest across the network."}</p>
          <p class="wbs-panel-head__date">Updated ${ia?.meta?.lastUpdated || sc.meta.lastUpdated}</p>
        </header>
      </div>

      <div class="wbs-panel-body">
      <div class="wbs-journey">
        ${(readiness?.stages || [])
          .map(
            (s, i) => `<div class="wbs-journey__step" style="--c:${s.color}">
            <span class="wbs-journey__num">${i + 1}</span>
            <div class="wbs-journey__card">
              <strong>${s.label}</strong>
              <span>${s.count} communities · avg ${s.avgScore}</span>
              <p>${s.description}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>

      <div class="wbs-drivers">
        <h3>Progress drivers</h3>
        <div class="wbs-drivers__grid">
          ${drivers
            .map(
              (d) => `<article class="wbs-driver wbs-driver--${d.impact}">
              <span>${d.impact} impact</span>
              <h4>${d.driver}</h4>
              <p>r = ${d.correlation}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>

      <div class="wbs-hotspots">
        <h3>Progress hotspots</h3>
        <div class="wbs-hotspots__grid">
          ${hotspots
            .map(
              (h, i) => `<article class="wbs-hotspot wbs-hotspot--${i + 1}">
              <span class="wbs-hotspot__rank">0${i + 1}</span>
              <strong class="wbs-hotspot__score">${h.score}</strong>
              <h4>${h.area}</h4>
              <p>${h.reason}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
      </div>
    </section>`;
}

export function renderWbScorecard(data) {
  const sc = data.scorecard;
  const ia = data.insightsAnalytics;
  if (!sc) return `<div class="container static-page"><h1>Scorecard data unavailable</h1></div>`;

  return `
    <div class="wbs-page" data-wb-scorecard>
      <div class="wbs-chrome">
        <header class="wbs-topbar">
          <div class="wbs-topbar__brand">
            <span class="wbs-topbar__logo" aria-hidden="true">🌍</span>
            <span class="wbs-topbar__org">Possibilities Africa</span>
            <span class="wbs-topbar__divider" aria-hidden="true"></span>
            <span class="wbs-topbar__title">Scorecard</span>
          </div>
          <nav class="wbs-tabs" aria-label="Scorecard sections">
            ${TABS.map((t) => `<button type="button" class="wbs-tabs__btn" data-wbs-tab="${t.id}" aria-selected="false">${t.label}</button>`).join("")}
          </nav>
          <p class="wbs-topbar__date">${sc.meta.lastUpdated}</p>
        </header>
      </div>
      <main class="wbs-main">
        ${renderOverviewPanel(sc, ia)}
        ${renderOutcomesPanel(sc, ia)}
        ${renderDataPanel(sc, ia)}
        ${renderAnalysisPanel(sc, ia)}
        ${renderProgressPanel(sc, ia)}
      </main>
    </div>`;
}

function renderCountryDuel(countries, slugA, slugB, labels) {
  const a = countries.find((c) => c.slug === slugA);
  const b = countries.find((c) => c.slug === slugB);
  if (!a || !b) return "";
  const metrics = ["communities", "households", "projects", "growth", "shalomGroups", "leadershipScore"];
  return metrics
    .map((m) => {
      const rawA = a[m] ?? 0;
      const rawB = b[m] ?? 0;
      const winner = rawA > rawB ? "a" : rawA < rawB ? "b" : "tie";
      return `<div class="wbs-duel-row">
        <span>${labels[m] || m}</span>
        <strong class="${winner === "a" ? "is-win" : ""}">${m === "households" ? formatNumber(rawA) : rawA}</strong>
        <strong class="${winner === "b" ? "is-win" : ""}">${m === "households" ? formatNumber(rawB) : rawB}</strong>
      </div>`;
    })
    .join("");
}

function renderCommunityDuel(communities, idA, idB) {
  const a = communities.find((c) => c.id === idA);
  const b = communities.find((c) => c.id === idB);
  if (!a || !b) return "";
  const fields = [
    ["Stage", "stage"],
    ["Shalom leaders", "shalomLeaders"],
    ["Leadership", "leadershipScore"],
    ["Projects", "projects"],
    ["Growth %", "growth"],
  ];
  return fields
    .map(([label, key]) => {
      const rawA = Number(a[key]) || 0;
      const rawB = Number(b[key]) || 0;
      const winner = typeof a[key] === "string" ? "tie" : rawA > rawB ? "a" : rawA < rawB ? "b" : "tie";
      return `<div class="wbs-duel-row">
        <span>${label}</span>
        <strong class="${winner === "a" ? "is-win" : ""}">${a[key]}</strong>
        <strong class="${winner === "b" ? "is-win" : ""}">${b[key]}</strong>
      </div>`;
    })
    .join("");
}

let activeCharts = [];

export function mountWbScorecard(data, initialTab = "overview") {
  const root = document.querySelector("[data-wb-scorecard]");
  if (!root) return;

  destroyCharts();
  activeCharts = [];

  const sc = data.scorecard;
  const ia = data.insightsAnalytics;

  const switchTab = (tabId, pushHash = true) => {
    const id = TABS.some((t) => t.id === tabId) ? tabId : "overview";
    root.querySelectorAll("[data-wbs-tab]").forEach((btn) => {
      const active = btn.dataset.wbsTab === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    root.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === id);
    });
    if (pushHash) {
      const base = location.hash.split("#").slice(0, 2).join("#") || "#/scorecard";
      const newHash = `${base.replace(/#tab-.*$/, "")}#tab-${id}`;
      if (location.hash !== newHash) history.replaceState(null, "", newHash);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => {
      if (id === "data") mountDataCharts(root, sc, ia);
      if (id === "analysis") mountAnalysisCharts(ia);
      if (id === "overview" && !root.dataset.wbsContentRevealed) {
        scheduleScorecardContentReveal(root);
      }
      ScrollTrigger?.refresh?.();
    });
  };

  root.querySelectorAll("[data-wbs-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.wbsTab));
  });

  const tabFromHash = () => {
    const anchor = location.hash.match(/#tab-(\w+)/)?.[1];
    return anchor || initialTab;
  };

  switchTab(tabFromHash(), false);
  root._switchWbsTab = (id) => switchTab(id, false);

  window.addEventListener("hashchange", onHash);
  root._wbsHashHandler = onHash;
  function onHash() {
    if (!document.querySelector("[data-wb-scorecard]")) return;
    switchTab(tabFromHash(), false);
  }

  bindComparisons(root, ia, data);
  bindCardSelection(root);
  scheduleScorecardContentReveal(root);

  document.getElementById("site-header")?.classList.add("site-header--on-scorecard");
}

function scheduleScorecardContentReveal(root) {
  const run = () => animateScorecardContent(root);
  if (document.querySelector("[data-page-entry]")) {
    window.addEventListener("page-entry-complete", run, { once: true });
    return;
  }
  run();
}

function mountDataCharts(root, sc, ia) {
  if (root.dataset.chartsMounted === "data") return;
  const trends = { ...sc.growthTrends, ...ia?.trendAnalysis };
  root.querySelectorAll("[data-wbs-chart]").forEach((el) => {
    const key = el.dataset.wbsChart;
    const cfg = trends[key];
    if (!cfg) return;
    const canvas = el.querySelector("canvas");
    if (!canvas || canvas.dataset.mounted) return;
    renderChart(canvas, cfg);
    canvas.dataset.mounted = "1";
  });
  root.dataset.chartsMounted = "data";
}

function mountAnalysisCharts(ia) {
  const canvas = document.getElementById("wbs-chart-cbc");
  if (!canvas || canvas.dataset.mounted) return;
  const dims = ia?.cbcIndex?.dimensions || [];
  if (!dims.length) return;
  renderChart(canvas, {
    type: "radar",
    labels: dims.map((d) => d.label),
    data: dims.map((d) => d.score),
    color: "#009FDA",
  });
  canvas.dataset.mounted = "1";
}

function bindComparisons(root, ia, data) {
  const countries = ia?.countryComparison?.countries || [];
  const communities = ia?.communityComparison?.communities || [];
  const labels = ia?.countryComparison?.metricLabels || {};
  const countryA = root.querySelector("#wbs-country-a");
  const countryB = root.querySelector("#wbs-country-b");
  const commA = root.querySelector("#wbs-community-a");
  const commB = root.querySelector("#wbs-community-b");
  const countryResults = root.querySelector("#wbs-country-results");
  const communityResults = root.querySelector("#wbs-community-results");
  const countryLinks = root.querySelector("#wbs-country-links");
  const communityLinks = root.querySelector("#wbs-community-links");

  const updateCountry = () => {
    if (!countryResults) return;
    countryResults.innerHTML = renderCountryDuel(countries, countryA.value, countryB.value, labels);
    if (countryLinks) {
      countryLinks.hidden = false;
      countryLinks.innerHTML = `<a href="#/country/${countryA.value}" data-link>Open ${countryA.options[countryA.selectedIndex].text}</a>
        <a href="#/country/${countryB.value}" data-link>Open ${countryB.options[countryB.selectedIndex].text}</a>`;
    }
  };
  const updateCommunity = () => {
    if (!communityResults) return;
    communityResults.innerHTML = renderCommunityDuel(communities, commA.value, commB.value);
    if (communityLinks) {
      const pathA = buildCommunityHubPath(commA.value, data);
      const pathB = buildCommunityHubPath(commB.value, data);
      const links = [];
      if (pathA) links.push(`<a href="#/${pathA}" data-link>Community A</a>`);
      if (pathB) links.push(`<a href="#/${pathB}" data-link>Community B</a>`);
      communityLinks.hidden = !links.length;
      communityLinks.innerHTML = links.join("");
    }
  };

  countryA?.addEventListener("change", updateCountry);
  countryB?.addEventListener("change", updateCountry);
  commA?.addEventListener("change", updateCommunity);
  commB?.addEventListener("change", updateCommunity);
  updateCountry();
  updateCommunity();
}

function bindCardSelection(root) {
  const grids = root.querySelectorAll(".wbs-cards-grid");
  if (!grids.length) return;

  const setCardState = (card, active, pinned = false) => {
    card.classList.toggle("is-active", active);
    card.classList.toggle("is-selected", pinned);
    card.setAttribute("aria-expanded", active ? "true" : "false");
    card.querySelector(".wbs-card__expanded")?.setAttribute("aria-hidden", active ? "false" : "true");
    if (active && typeof gsap !== "undefined") {
      const fill = card.querySelector(".wbs-card__bar-fill");
      if (fill && !fill.dataset.animated) {
        fill.dataset.animated = "1";
        const target = fill.style.height || "50%";
        gsap.fromTo(fill, { height: "0%" }, { height: target, duration: 0.5, ease: "power2.out" });
      }
    }
    if (!active) {
      card.querySelector(".wbs-card__bar-fill")?.removeAttribute("data-animated");
    }
  };

  const deactivateOthers = (except, grid) => {
    grid.querySelectorAll("[data-wbs-card].is-active").forEach((c) => {
      if (c !== except) setCardState(c, false, false);
    });
  };

  const activateCard = (card, pin = false) => {
    const grid = card.closest(".wbs-cards-grid");
    deactivateOthers(card, grid);
    setCardState(card, true, pin);
    grid._pinnedCard = pin ? card : grid._pinnedCard || null;
  };

  grids.forEach((grid) => {
    grid._pinnedCard = null;

    grid.querySelectorAll("[data-wbs-card]").forEach((card) => {
      card.addEventListener("mouseenter", () => activateCard(card, false));
      card.addEventListener("mouseleave", () => {
        if (grid._pinnedCard === card) return;
        setCardState(card, false, false);
        if (grid._pinnedCard) setCardState(grid._pinnedCard, true, true);
      });
      card.addEventListener("focus", () => activateCard(card, false));
      card.addEventListener("blur", () => {
        if (grid._pinnedCard === card) return;
        setCardState(card, false, false);
      });
    });

    grid.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const card = e.target.closest("[data-wbs-card]");
      if (!card) return;
      const wasPinned = grid._pinnedCard === card;
      if (wasPinned) {
        grid._pinnedCard = null;
        setCardState(card, false, false);
      } else {
        activateCard(card, true);
        grid._pinnedCard = card;
      }
    });

    grid.addEventListener("keydown", (e) => {
      const card = e.target.closest("[data-wbs-card]");
      if (!card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const wasPinned = grid._pinnedCard === card;
        if (wasPinned) {
          grid._pinnedCard = null;
          setCardState(card, false, false);
        } else {
          activateCard(card, true);
          grid._pinnedCard = card;
        }
      }
      if (e.key === "Escape") {
        grid._pinnedCard = null;
        grid.querySelectorAll("[data-wbs-card].is-active").forEach((c) => setCardState(c, false, false));
      }
    });
  });
}

function animateScorecardContent(root) {
  if (root.dataset.wbsContentRevealed) return;
  root.dataset.wbsContentRevealed = "1";

  const cards = root.querySelectorAll(".wbs-card");

  if (typeof gsap === "undefined") {
    cards.forEach((c) => c.classList.add("is-visible"));
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    cards.forEach((c) => c.classList.add("is-visible"));
    return;
  }

  gsap.set(cards, { opacity: 0, y: 28, scale: 0.98 });

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.48,
    stagger: { each: 0.05, from: "start" },
    ease: "power3.out",
    onComplete: () => cards.forEach((c) => c.classList.add("is-visible")),
  });
}

export function destroyWbScorecard() {
  destroyCharts();
  const root = document.querySelector("[data-wb-scorecard]");
  if (root?._wbsHashHandler) {
    window.removeEventListener("hashchange", root._wbsHashHandler);
  }
  document.getElementById("site-header")?.classList.remove("site-header--on-scorecard");
  document.body.classList.remove("pa-entry-active");
}
