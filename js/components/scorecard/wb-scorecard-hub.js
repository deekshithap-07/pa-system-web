import { formatNumber } from "../../utils/format.js";
import { renderChart, destroyCharts } from "../charts.js";

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
  countries: { keyword: "Countries", rest: "where Possibilities Africa is at work." },
  communities: { keyword: "Communities", rest: "on a two-year journey of change." },
  households: { keyword: "Homes", rest: "reached through church and community work." },
  projects: { keyword: "Projects", rest: "in water, farming, and jobs." },
  lives: { keyword: "Lives", rest: "touched by this work." },
  shalom: { keyword: "Faith groups", rest: "(Shalom) that meet and serve in communities." },
  leadership: { keyword: "Leadership teams", rest: "trained through the two-year pastor journey." },
  growth: { keyword: "Growth", rest: "year on year across countries." },
  Education: { keyword: "Education", rest: "schools and literacy programmes." },
  Health: { keyword: "Health", rest: "care in rural communities." },
  Agriculture: { keyword: "Farming", rest: "training and cooperatives." },
  Water: { keyword: "Water", rest: "wells, dams, and reliable access." },
  Livelihood: { keyword: "Jobs", rest: "income groups and skills training." },
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

    const achievedLabel =
      k.text || (typeof val === "number" && val >= 1000 ? formatNumber(val) : val);
    const expectedLabel =
      typeof expected === "number" && expected >= 1000 ? formatNumber(expected) : expected;

    return {
      id: k.id,
      label: k.label,
      achieved: achievedLabel,
      expected: expectedLabel,
      progress: pct(val || 1, expected),
      summary: `Trend: ${k.trend || "stable"}. Period ${sc.meta?.period || "2024"}.`,
      link: "#/africa",
    };
  });
}

function renderPaHero(sc = {}) {
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
          <h1 class="pa-title id-hero__title"><span>How the work</span> <em>is going.</em></h1>
          <p class="id-hero__lead">${
            ov.description ||
            "The public data and evidence layer — indicators, trends, and side-by-side country progress."
          }</p>
          <p class="id-hero__meta">Reporting ${meta.reportingPeriod || meta.period || "2024"} · Updated ${
            meta.lastUpdatedLabel || meta.lastUpdated || ""
          }</p>
          <div class="id-hero__actions">
            <button type="button" class="id-btn id-btn--solid" data-wbs-jump="overview">Key indicators →</button>
            <button type="button" class="id-btn id-btn--ghost" data-wbs-jump="data">Country figures</button>
          </div>
        </div>
      </div>
    </header>`;
}

function renderChrome(sc = {}, activeTab = "overview") {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "outcomes", label: "What’s working" },
    { id: "analysis", label: "What is changing" },
    { id: "progress", label: "Journey" },
    { id: "data", label: "Data" },
  ];
  return `
    <div class="wbs-chrome">
      <div class="wbs-topbar">
        <div class="wbs-topbar__brand">
          <span class="wbs-topbar__org">Possibilities Africa</span>
          <span class="wbs-topbar__divider" aria-hidden="true"></span>
          <span class="wbs-topbar__title">Scorecard</span>
        </div>
        <nav class="wbs-tabs" role="tablist" aria-label="Impact sections">
          ${tabs
            .map(
              (t) => `<button
                type="button"
                class="wbs-tabs__btn${t.id === activeTab ? " is-active" : ""}"
                role="tab"
                id="wbs-tab-${t.id}"
                aria-selected="${t.id === activeTab ? "true" : "false"}"
                aria-controls="tab-${t.id}"
                data-wbs-tab="${t.id}"
              >${t.label}</button>`
            )
            .join("")}
        </nav>
        <p class="wbs-topbar__date">Updated ${sc.meta?.lastUpdatedLabel || sc.meta?.lastUpdated || ""}</p>
      </div>
    </div>`;
}

function renderOverviewPanel(sc) {
  const cards = buildOverviewCards(sc);
  const ov = sc.overview || {};

  return `
    <section class="wbs-panel wbs-panel--overview is-active" data-panel="overview" id="tab-overview" role="tabpanel" aria-labelledby="wbs-tab-overview">
      <div class="wbs-hero-split">
        <div class="wbs-hero-split__copy">
          <h2>Measuring impact</h2>
          <p>${ov.description || "Countries, communities, and homes — achieved against expected reach."}</p>
          <p class="wbs-hero-split__date">Reporting ${sc.meta?.reportingPeriod || sc.meta?.period || "2024"} · Updated ${sc.meta?.lastUpdatedLabel || sc.meta?.lastUpdated || ""}</p>
        </div>
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
    <section class="wbs-panel" data-panel="outcomes" id="tab-outcomes" role="tabpanel" aria-labelledby="wbs-tab-outcomes" hidden>
      <header class="wbs-panel-head">
        <h2>What’s working</h2>
        <p>Water, farming, health, schools, jobs, and leadership — and how far communities have come on the two-year journey.</p>
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

function renderArcFigure(label, then, now) {
  return `<div class="wbs-arc__stat">
    <span class="wbs-arc__stat-label">${label}</span>
    <span class="wbs-arc__stat-row"><em>${then}</em><span aria-hidden="true">→</span><strong>${now}</strong></span>
  </div>`;
}

function renderAnalysisPanel(sc, ia) {
  const arc = ia?.storyArc || {};
  const ed = ia?.editorial || {};
  const pq = ed.pullQuote || {};
  const findings = (ed.keyFindings || []).slice(0, 3);
  const hotspots = (ia?.whyProgressing || []).slice(0, 3);
  const drivers = (ia?.readinessLevels?.progressDrivers || []).slice(0, 3);
  const dims = (ia?.cbcIndex?.dimensions || []).slice(0, 4);
  const stages = ia?.readinessLevels?.stages || [];
  const multiply = stages.find((s) => s.id === "multiplication");

  const past = arc.past || {};
  const present = arc.present || {};
  const next = arc.next || {};

  return `
    <section class="wbs-narrative wbs-panel" data-panel="analysis" id="tab-analysis" role="tabpanel" aria-labelledby="wbs-tab-analysis" hidden>
      <div class="container wbs-narrative__lede-wrap">
        <p class="wbs-narrative__lede">${ed.intro || "Figures alone do not tell the story. This page walks through where the work began, what the field shows today, and what may come next."}</p>
      </div>

      <div class="wbs-arc">
        <article class="wbs-arc__chapter wbs-arc__chapter--past" id="ins-past">
          <div class="container wbs-arc__inner">
            <header class="wbs-arc__head">
              <span class="wbs-arc__label">${past.label || "Where we started"}</span>
              <h2>${past.title || "A smaller network, steady roots"}</h2>
            </header>
            <p class="wbs-arc__text">${past.text || ""}</p>
            <div class="wbs-arc__figures">
              ${renderArcFigure("Communities on the journey", "32", "59")}
              ${renderArcFigure("Homes reached", "120K", "253K+")}
              ${renderArcFigure("Shalom groups", "28", "86")}
            </div>
            <div class="wbs-arc__evidence">
              <article class="wbs-arc__chart-card" data-wbs-chart="communityGrowth">
                <h3>Communities over time</h3>
                <p class="wbs-arc__chart-note">The line shows how many communities were active each year — not a target, just the count.</p>
                <div class="wbs-chart-wrap"><canvas></canvas></div>
              </article>
            </div>
          </div>
        </article>

        <article class="wbs-arc__chapter wbs-arc__chapter--present" id="ins-present">
          <div class="container wbs-arc__inner">
            <header class="wbs-arc__head">
              <span class="wbs-arc__label">${present.label || "What we see now"}</span>
              <h2>${present.title || "Faith and leadership carry the rest"}</h2>
            </header>
            <p class="wbs-arc__text">${present.text || ""}</p>
            ${pq.text ? `<blockquote class="wbs-arc__quote"><p>${pq.text}</p>${pq.attribution ? `<cite>${pq.attribution}</cite>` : ""}</blockquote>` : ""}
            <div class="wbs-arc__split">
              <div class="wbs-arc__meaning">
                <h3 class="wbs-arc__subhead">What stands out in the field</h3>
                <ul class="wbs-arc__findings">
                  ${findings
                    .map(
                      (f) => `<li>
                      <strong>${f.stat} ${f.unit}</strong>
                      <span class="wbs-arc__change">${f.change}</span>
                      <p>${f.text}</p>
                    </li>`
                    )
                    .join("")}
                </ul>
              </div>
              <div class="wbs-arc__viz">
                <h3 class="wbs-arc__subhead">Six areas of community life</h3>
                <p class="wbs-arc__chart-note">Each spoke is a score from field reports — higher means more progress in that area.</p>
                <div class="wbs-chart-wrap wbs-chart-wrap--radar"><canvas id="wbs-chart-cbc"></canvas></div>
                <ul class="wbs-arc__dims">
                  ${dims
                    .map((d) => `<li><span>${d.label}</span><strong>${d.score}</strong><em>${d.trend}</em></li>`)
                    .join("")}
                </ul>
              </div>
            </div>
          </div>
        </article>

        <article class="wbs-arc__chapter wbs-arc__chapter--next" id="ins-next">
          <div class="container wbs-arc__inner">
            <header class="wbs-arc__head">
              <span class="wbs-arc__label">${next.label || "What may come next"}</span>
              <h2>${next.title || "More places ready to share the work"}</h2>
            </header>
            <p class="wbs-arc__text">${next.text || ""}</p>
            ${multiply ? `<p class="wbs-arc__highlight"><strong>${multiply.count}</strong> communities are at the multiplication stage — avg score ${multiply.avgScore}. ${multiply.description}</p>` : ""}
            <div class="wbs-arc__split wbs-arc__split--next">
              <div>
                <h3 class="wbs-arc__subhead">Places to watch</h3>
                <ul class="wbs-arc__watch">
                  ${hotspots
                    .map(
                      (h) => `<li>
                      <strong>${h.area}</strong>
                      <span class="wbs-arc__watch-score">${h.score}</span>
                      <p>${h.reason}</p>
                    </li>`
                    )
                    .join("")}
                </ul>
              </div>
              <div>
                <h3 class="wbs-arc__subhead">What usually comes first</h3>
                <ul class="wbs-arc__drivers">
                  ${drivers
                    .map(
                      (d) => `<li class="wbs-arc__driver wbs-arc__driver--${d.impact}">
                      <span>${d.driver}</span>
                      <em>${d.impact} · r=${d.correlation}</em>
                    </li>`
                    )
                    .join("")}
                </ul>
                <p class="wbs-arc__footnote">These patterns come from comparing communities on the journey — useful for planning, not for ranking people.</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>`;
}

function renderDataPanel(sc, ia) {
  const countries = sc.countryStats || [];
  const trends = sc.growthTrends || ia?.trendAnalysis || {};

  return `
    <section class="wbs-data-sheet wbs-panel" data-panel="data" id="tab-data" role="tabpanel" aria-labelledby="wbs-tab-data" hidden>
      <div class="container">
        <p class="wbs-data-sheet__note">Country figures and trend lines — same style of achieved / expected reading as the World Bank Scorecard overview.</p>

        <header class="wbs-data-sheet__head">
          <h2>Country figures</h2>
          <p>Open a country to read its full story.</p>
        </header>
        <div class="wbs-country-tiles">
          ${countries
            .map(
              (c) => `<a href="#/country/${c.slug}" class="wbs-country-tile" data-link>
              <strong>${c.name}</strong>
              <span>${c.communities} communities · ${c.projects} projects · ${c.growth}% growth</span>
              <span class="wbs-country-tile__cta">Open country →</span>
            </a>`
            )
            .join("")}
        </div>

        <header class="wbs-data-sheet__head wbs-data-sheet__head--charts">
          <h2>Trend lines</h2>
          <p>Counts and reach by year or quarter — raw totals from field reports.</p>
        </header>
        <div class="wbs-charts-grid wbs-charts-grid--data">
          ${Object.entries(trends)
            .slice(0, 4)
            .map(
              ([key, cfg]) => `<article class="wbs-chart-card wbs-chart-card--data" data-wbs-chart="${key}">
            <h3>${cfg.title}</h3>
            <p>${cfg.description || ""}</p>
            <div class="wbs-chart-wrap"><canvas></canvas></div>
          </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderProgressPanel(sc, ia) {
  const readiness = ia?.readinessLevels;
  const drivers = readiness?.progressDrivers || [];
  const hotspots = ia?.whyProgressing || [];

  return `
    <section class="wbs-panel wbs-panel--progress" data-panel="progress" id="tab-progress" role="tabpanel" aria-labelledby="wbs-tab-progress" hidden>
      <div class="wbs-panel-hero wbs-panel-hero--progress">
        <header class="wbs-panel-head">
          <h2>The two-year journey</h2>
          <p>From first steps to sharing the work with others — how many communities sit in each stage.</p>
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
        <h3>What helps communities grow</h3>
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
        <h3>Places where the work is growing</h3>
        <div class="wbs-hotspots__grid">
          ${hotspots
            .map(
              (h) => `<article class="wbs-hotspot">
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

const TAB_BY_SECTION = {
  overview: "overview",
  working: "outcomes",
  together: "analysis",
  journey: "progress",
  countries: "data",
};

export function renderWbScorecard(data, section = "overview") {
  const sc = data.scorecard;
  const ia = data.insightsAnalytics;
  if (!sc) return `<div class="container static-page"><h1>Impact &amp; Data is unavailable</h1></div>`;

  const activeTab = TAB_BY_SECTION[section] || "overview";

  return `
    <div class="wbs-page wbs-page--pa-hero" data-wb-scorecard data-impact-data data-results-page="hub" data-wbs-initial="${activeTab}">
      ${renderPaHero(sc)}
      ${renderChrome(sc, activeTab)}
      <main class="wbs-main">
        ${renderOverviewPanel(sc)}
        ${renderOutcomesPanel(sc, ia)}
        ${renderAnalysisPanel(sc, ia)}
        ${renderProgressPanel(sc, ia)}
        ${renderDataPanel(sc, ia)}
      </main>
      <section class="id-next" id="id-next" aria-labelledby="id-cta-title">
        <div class="container id-next__inner">
          <header class="id-next__intro">
            <p class="id-eyebrow">Keep exploring</p>
            <h2 id="id-cta-title" class="pa-title"><span>From the numbers</span> <em>to the field.</em></h2>
            <p class="id-next__lead">Impact figures point to places and people. Step into a country, a story, or the map.</p>
          </header>
          <div class="id-next__paths" role="list">
            <a class="id-next__path" href="#/africa" data-link role="listitem">
              <span class="id-next__path-kicker">Map</span>
              <span class="id-next__path-title">Where we work</span>
              <span class="id-next__path-note">Countries, catchments, and communities across the network.</span>
              <span class="id-next__path-go" aria-hidden="true">→</span>
            </a>
            <a class="id-next__path" href="#/stories" data-link role="listitem">
              <span class="id-next__path-kicker">Stories</span>
              <span class="id-next__path-title">Voices from the field</span>
              <span class="id-next__path-note">Households, leaders, and journeys behind the indicators.</span>
              <span class="id-next__path-go" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>`;
}

let activeCharts = [];

export function mountWbScorecard(data, section = "overview") {
  const root = document.querySelector("[data-wb-scorecard]");
  if (!root) return;

  destroyCharts();
  activeCharts = [];

  const sc = data.scorecard;
  const ia = data.insightsAnalytics;
  root._wbsData = { sc, ia };
  const initial = root.dataset.wbsInitial || TAB_BY_SECTION[section] || "overview";

  bindTabs(root, initial);
  bindCardSelection(root);
  bindHeroJumps(root);
  scheduleScorecardContentReveal(root);

  requestAnimationFrame(() => {
    if (initial === "analysis") mountAnalysisCharts(root, sc, ia);
    if (initial === "data") mountDataCharts(root, sc, ia);
    ScrollTrigger?.refresh?.();
  });

  document.getElementById("site-header")?.classList.add("site-header--on-scorecard");
}

function bindHeroJumps(root) {
  root.querySelectorAll("[data-wbs-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-wbs-jump");
      const tab = root.querySelector(`[data-wbs-tab="${id}"]`);
      tab?.click();
      root.querySelector(".wbs-chrome")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindTabs(root, initial = "overview") {
  const tabs = [...root.querySelectorAll("[data-wbs-tab]")];
  const panels = [...root.querySelectorAll("[data-panel]")];
  if (!tabs.length || !panels.length) return;

  const show = (id, { animate = true } = {}) => {
    const { sc, ia } = root._wbsData || {};
    tabs.forEach((t) => {
      const on = t.dataset.wbsTab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });

    panels.forEach((p) => {
      const on = p.dataset.panel === id;
      p.classList.toggle("is-active", on);
      if (on) {
        p.removeAttribute("hidden");
        if (animate && typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.fromTo(p, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" });
        }
      } else {
        p.setAttribute("hidden", "");
      }
    });

    root.dataset.wbsActive = id;

    if (id === "analysis" && sc) mountAnalysisCharts(root, sc, ia);
    if (id === "data" && sc) mountDataCharts(root, sc, ia);
    if (id === "overview" || id === "outcomes") {
      requestAnimationFrame(() => animateScorecardContent(root, true));
    }
  };

  tabs.forEach((t) => {
    t.addEventListener("click", () => show(t.dataset.wbsTab));
  });

  show(initial, { animate: false });
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

function mountAnalysisCharts(root, sc, ia) {
  if (root.dataset.chartsMounted === "analysis") return;
  const trends = { ...sc?.growthTrends, ...ia?.trendAnalysis };
  root.querySelectorAll("[data-wbs-chart]").forEach((el) => {
    const key = el.dataset.wbsChart;
    const cfg = trends[key];
    if (!cfg) return;
    const canvas = el.querySelector("canvas");
    if (!canvas || canvas.dataset.mounted) return;
    renderChart(canvas, cfg);
    canvas.dataset.mounted = "1";
  });
  const radar = root.querySelector("#wbs-chart-cbc");
  if (radar && !radar.dataset.mounted) {
    const dims = ia?.cbcIndex?.dimensions || [];
    if (dims.length) {
      renderChart(radar, {
        type: "radar",
        labels: dims.map((d) => d.label),
        data: dims.map((d) => d.score),
        color: "#e8a91a",
      });
      radar.dataset.mounted = "1";
    }
  }
  root.dataset.chartsMounted = "analysis";
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

function animateScorecardContent(root, force = false) {
  if (!force && root.dataset.wbsContentRevealed) return;
  root.dataset.wbsContentRevealed = "1";

  const activePanel = root.querySelector(".wbs-panel.is-active") || root;
  const cards = activePanel.querySelectorAll(".wbs-card");
  if (!cards.length) return;

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
