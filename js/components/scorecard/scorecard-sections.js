import { formatNumber } from "../../utils/format.js";

const NAV = [
  { id: "sc-overview", label: "Overview" },
  { id: "sc-indices", label: "Network snapshot" },
  { id: "sc-growth", label: "Trends" },
  { id: "sc-countries", label: "Countries" },
  { id: "sc-communities", label: "Communities" },
  { id: "sc-progress", label: "Journey progress" },
  { id: "sc-analysis", label: "Analysis" },
  { id: "sc-reports", label: "Reports" },
];

export function renderScorecardSidebar() {
  return `
    <aside class="sc-sidebar" aria-label="Scorecard navigation">
      <nav class="sc-sidebar__nav">
        <p class="sc-sidebar__title">Scorecard</p>
        <ul>${NAV.map((i) => `<li><a href="#${i.id}" class="sc-sidebar__link" data-sc-nav="${i.id}">${i.label}</a></li>`).join("")}</ul>
      </nav>
      <div class="sc-sidebar__footer">
        <a href="#/" class="sc-sidebar__back" data-link>&larr; Back to home</a>
      </div>
    </aside>`;
}

export function bindScorecardSidebar(root) {
  const links = root.querySelectorAll("[data-sc-nav]");
  const sections = NAV.map((i) => document.getElementById(i.id)).filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(link.dataset.scNav)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (!sections.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.toggle("is-active", l.dataset.scNav === entry.target.id));
        }
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
  root._scObserver = observer;
}

export function destroyScorecardSidebar(root) {
  root._scObserver?.disconnect();
}

export function renderScorecardHeader(meta, overview) {
  const highlights = (overview?.highlights || [])
    .map((h) => `<span class="sc-hero__tag">${h.label}: <strong>${h.value}</strong></span>`)
    .join("");

  return `
    <header class="sc-hero" id="sc-overview">
      <div class="sc-hero__inner">
        <p class="sc-hero__eyebrow">Transformation Scorecard · ${meta.period}</p>
        <h1>${overview?.headline || meta.title}</h1>
        <p class="sc-hero__recap">${overview?.description || meta.subtitle}</p>
        <div class="sc-hero__meta">
          ${highlights}
          <span class="sc-hero__updated">Last updated ${meta.lastUpdated}</span>
        </div>
      </div>
    </header>`;
}

export function renderScorecardOverview() {
  return "";
}

export function renderScorecardKPIs(kpis) {
  const items = (kpis || [])
    .map((k) => {
      const value = k.text || (typeof k.value === "number" && k.value >= 1000 ? formatNumber(k.value) : k.value);
      const trendClass = k.direction === "up" ? "is-up" : k.direction === "down" ? "is-down" : "";
      const trend = k.trend ? `<span class="sc-index__change ${trendClass}">${k.trend}</span>` : "";
      return `<article class="sc-index" data-kpi data-value="${typeof k.value === "number" ? k.value : 0}" data-text="${k.text || ""}">
        <span class="sc-index__label">${k.label}</span>
        <span class="sc-index__value">${value}</span>
        ${trend}
      </article>`;
    })
    .join("");

  return `
    <section class="sc-indices" id="sc-indices" data-reveal-section>
      <div class="sc-section__inner">
        <p class="sc-indices__title">Network snapshot</p>
        <div class="sc-indices__grid">${items}</div>
        <p class="sc-indices__note">Figures aggregate ministry impact across seven network countries · reporting period Jan – Sep 2024</p>
      </div>
    </section>`;
}

export function renderScorecardGrowthCharts(charts) {
  const cards = Object.entries(charts || {})
    .map(
      ([key, c]) => `<article class="sc-chart-card" data-chart="${key}">
        <h3>${c.title}</h3>
        <div class="sc-chart-wrap"><canvas></canvas></div>
      </article>`
    )
    .join("");

  return `
    <section class="sc-section" id="sc-growth" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Growth trends</h2>
          <p class="sc-section__desc">Time-series performance across communities, households, and programmes</p>
        </div>
        <div class="sc-chart-grid">${cards}</div>
      </div>
    </section>`;
}

function formatChange(value, suffix = "%") {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
}

export function renderScorecardCountryStats(countries) {
  const rows = (countries || [])
    .map((c) => {
      const changeClass = c.growth > 0 ? "is-up" : "is-down";
      return `<tr>
        <th scope="row"><a href="#/country/${c.slug}" data-link>${c.name}</a></th>
        <td class="sc-td-num">${c.communities}</td>
        <td class="sc-td-num">${formatNumber(c.households)}</td>
        <td class="sc-td-num">${c.projects}</td>
        <td class="sc-td-change ${changeClass}">${formatChange(c.growth)}</td>
        <td class="sc-td-num"><span class="sc-progress-pill">${c.progress}%</span></td>
        <td><span class="sc-status sc-status--${c.status.toLowerCase()}">${c.status}</span></td>
      </tr>`;
    })
    .join("");

  return `
    <section class="sc-section" id="sc-countries" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Country performance</h2>
          <p class="sc-section__desc">Network countries ranked by communities, projects, and growth</p>
        </div>
        <div class="sc-market-table">
          <table class="sc-table">
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col" class="sc-th-num">Communities</th>
                <th scope="col" class="sc-th-num">Households</th>
                <th scope="col" class="sc-th-num">Projects</th>
                <th scope="col" class="sc-th-num">Change</th>
                <th scope="col" class="sc-th-num">Progress</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="sc-market-table__note">Network data · minimum reporting lag 30 days</p>
        </div>
      </div>
    </section>`;
}

export function renderScorecardCommunityStats(communities) {
  const rows = (communities || [])
    .map(
      (c) => `<tr>
        <th scope="row">${c.name}</th>
        <td>${c.country}</td>
        <td>${c.catchment}</td>
        <td class="sc-td-num">${c.households}</td>
        <td>${c.stage}</td>
        <td class="sc-td-num"><span class="sc-progress-pill">${c.progress}%</span></td>
      </tr>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--alt" id="sc-communities" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Community highlights</h2>
          <p class="sc-section__desc">Selected communities with tracked journey stage and progress</p>
        </div>
        <div class="sc-market-table">
          <table class="sc-table">
            <thead>
              <tr>
                <th scope="col">Community</th>
                <th scope="col">Country</th>
                <th scope="col">Catchment</th>
                <th scope="col" class="sc-th-num">Households</th>
                <th scope="col">Stage</th>
                <th scope="col" class="sc-th-num">Progress</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function renderScorecardProgress(indicators) {
  const bars = (indicators || [])
    .map(
      (p) => `<article class="sc-progress-card">
        <div class="sc-progress-card__head"><span>${p.label}</span><strong>${p.score}%</strong></div>
        <div class="sc-progress-bar"><div class="sc-progress-bar__fill" style="width:${p.score}%"></div></div>
        <span class="sc-progress-card__target">Target ${p.target}%</span>
      </article>`
    )
    .join("");

  return `
    <section class="sc-section" id="sc-progress" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Journey progress</h2>
          <p class="sc-section__desc">Completion rates across the two-year transformation framework</p>
        </div>
        <div class="sc-progress-grid">${bars}</div>
      </div>
    </section>`;
}

export function renderScorecardAnalysis(insights, comparisons, performance) {
  const insightCards = (insights || [])
    .slice(0, 3)
    .map(
      (ins) => `<article class="sc-brief-card">
        <p class="sc-brief-card__eyebrow">${ins.metric}</p>
        <h3>${ins.title}</h3>
        <p class="sc-brief-card__summary">${ins.summary}</p>
        <div class="sc-brief-card__footer">
          <span class="sc-brief-card__score">${ins.score}</span>
          <span class="sc-brief-card__trend">${ins.trend}</span>
        </div>
      </article>`
    )
    .join("");

  const sectorRows = (performance || [])
    .map(
      (m) => `<tr>
        <th scope="row">${m.sector}</th>
        <td class="sc-td-num"><strong>${m.score}</strong></td>
        <td class="sc-td-change is-up">${m.trend}</td>
        <td><span class="sc-status sc-status--${m.status.replace(" ", "-")}">${m.status}</span></td>
      </tr>`
    )
    .join("");

  const compareCards = (comparisons || [])
    .map(
      (c) => `<article class="sc-compare-card">
        <h3>${c.title}</h3>
        <p class="sc-compare-card__metric">${c.metric}</p>
        <div class="sc-compare-card__values">
          <div><span>${c.a.label}</span><strong>${c.a.value}</strong></div>
          <div><span>${c.b.label}</span><strong>${c.b.value}</strong></div>
        </div>
      </article>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--alt" id="sc-analysis" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Network analysis</h2>
          <p class="sc-section__desc">Insights, sector performance, and country comparisons</p>
        </div>
        <div class="sc-brief-grid">${insightCards}</div>
        <div class="sc-analysis-split">
          <div class="sc-market-table">
            <h3 class="sc-subhead">Sector outcomes</h3>
            <table class="sc-table sc-table--compact">
              <thead>
                <tr><th scope="col">Sector</th><th scope="col" class="sc-th-num">Score</th><th scope="col" class="sc-th-num">Change</th><th scope="col">Status</th></tr>
              </thead>
              <tbody>${sectorRows}</tbody>
            </table>
          </div>
          <div class="sc-compare-grid">${compareCards}</div>
        </div>
      </div>
    </section>`;
}

export function renderScorecardComparisons() {
  return "";
}

export function renderScorecardPerformance() {
  return "";
}

export function renderScorecardInsights() {
  return "";
}

export function renderScorecardReports(reports) {
  const cards = (reports || [])
    .map(
      (r) => `<article class="sc-report-card">
        <div class="sc-report-card__meta"><span>${r.year}</span><span>${r.type}</span></div>
        <h3>${r.title}</h3>
        <p>${r.summary}</p>
        <a href="${r.href}" class="sc-report-card__link" data-link>Read report &rarr;</a>
      </article>`
    )
    .join("");

  return `
    <section class="sc-section" id="sc-reports" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Reports &amp; briefs</h2>
          <p class="sc-section__desc">Downloadable ministry reports and quarterly performance summaries</p>
        </div>
        <div class="sc-report-grid">${cards}</div>
      </div>
    </section>`;
}

export function renderScorecardApiPlaceholders() {
  return "";
}
