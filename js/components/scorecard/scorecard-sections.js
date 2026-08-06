import { formatNumber } from "../../utils/format.js";

const NAV = [
  { id: "sc-overview", label: "Overview" },
  { id: "sc-indices", label: "Network snapshot" },
  { id: "sc-growth", label: "Trends" },
  { id: "sc-countries", label: "Countries" },
  { id: "sc-communities", label: "Communities" },
  { id: "sc-progress", label: "Journey progress" },
  { id: "sc-analysis", label: "Sector outcomes" },
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
        <a href="#/insights" class="sc-sidebar__insights-link" data-link>Deep analysis &rarr;</a>
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
  const entries = Object.entries(charts || {});
  const [primary, ...secondary] = entries;
  const primaryCard = primary
    ? `<article class="sc-chart-feature" data-chart="${primary[0]}">
        <div class="sc-chart-feature__head"><h3>${primary[1].title}</h3><span class="sc-chart-feature__badge">Primary trend</span></div>
        <div class="sc-chart-wrap sc-chart-wrap--feature"><canvas></canvas></div>
      </article>`
    : "";

  const secondaryCards = secondary
    .map(
      ([key, c]) => `<article class="sc-chart-mini" data-chart="${key}">
        <h3>${c.title}</h3>
        <div class="sc-chart-wrap sc-chart-wrap--mini"><canvas></canvas></div>
      </article>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--growth" id="sc-growth" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head sc-section__head--row">
          <div>
            <h2>Growth trends</h2>
            <p class="sc-section__desc">Time-series performance across communities, households, and programmes</p>
          </div>
        </div>
        <div class="sc-growth-layout">
          ${primaryCard}
          <div class="sc-growth-side">${secondaryCards}</div>
        </div>
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
    .map((c, i) => {
      const changeClass = c.growth > 0 ? "is-up" : "is-down";
      const barW = Math.min(100, c.progress || 0);
      return `<tr>
        <td class="sc-td-rank">${i + 1}</td>
        <th scope="row"><a href="#/country/${c.slug}" data-link>${c.name}</a></th>
        <td class="sc-td-num">${c.communities}</td>
        <td class="sc-td-num">${formatNumber(c.households)}</td>
        <td class="sc-td-num">${c.projects}</td>
        <td class="sc-td-change ${changeClass}">${formatChange(c.growth)}</td>
        <td class="sc-td-bar"><span class="sc-inline-bar" style="width:${barW}%"></span><em>${c.progress}%</em></td>
        <td><span class="sc-status sc-status--${c.status.toLowerCase()}">${c.status}</span></td>
      </tr>`;
    })
    .join("");

  return `
    <section class="sc-section sc-section--countries" id="sc-countries" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Country performance</h2>
          <p class="sc-section__desc">Ranked network countries by communities, projects, and growth</p>
        </div>
        <div class="sc-market-table sc-market-table--ranked">
          <table class="sc-table">
            <thead>
              <tr>
                <th scope="col" class="sc-th-rank">#</th>
                <th scope="col">Country</th>
                <th scope="col" class="sc-th-num">Communities</th>
                <th scope="col" class="sc-th-num">Households</th>
                <th scope="col" class="sc-th-num">Projects</th>
                <th scope="col" class="sc-th-num">Change</th>
                <th scope="col">Progress</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function renderScorecardCommunityStats(communities) {
  const items = (communities || [])
    .map(
      (c) => `<li class="sc-community-row">
        <div class="sc-community-row__main">
          <strong>${c.name}</strong>
          <span>${c.country} · ${c.catchment}</span>
        </div>
        <div class="sc-community-row__stage">${c.stage}</div>
        <div class="sc-community-row__meter" aria-hidden="true"><span style="width:${c.progress}%"></span></div>
        <div class="sc-community-row__pct">${c.progress}%</div>
      </li>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--communities" id="sc-communities" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Community highlights</h2>
          <p class="sc-section__desc">Selected communities with tracked journey stage and progress</p>
        </div>
        <ol class="sc-community-list">${items}</ol>
      </div>
    </section>`;
}

export function renderScorecardProgress(indicators) {
  const meters = (indicators || [])
    .map(
      (p) => `<div class="sc-journey-meter">
        <div class="sc-journey-meter__label"><span>${p.label}</span><strong>${p.score}%</strong></div>
        <div class="sc-journey-meter__track"><div class="sc-journey-meter__fill" style="width:${p.score}%"></div><div class="sc-journey-meter__target" style="left:${p.target}%"></div></div>
        <span class="sc-journey-meter__target-label">Target ${p.target}%</span>
      </div>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--journey" id="sc-progress" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Journey progress</h2>
          <p class="sc-section__desc">Completion rates across the two-year transformation framework</p>
        </div>
        <div class="sc-journey-strip">${meters}</div>
      </div>
    </section>`;
}

export function renderScorecardAnalysis(insights, comparisons, performance) {
  const sectorRows = (performance || [])
    .map(
      (m) => `<tr>
        <th scope="row">${m.sector}</th>
        <td class="sc-td-num"><strong>${m.score}</strong></td>
        <td class="sc-td-bar"><span class="sc-inline-bar sc-inline-bar--sector" style="width:${m.score}%"></span></td>
        <td class="sc-td-change is-up">${m.trend}</td>
        <td><span class="sc-status sc-status--${m.status.replace(" ", "-")}">${m.status}</span></td>
      </tr>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--sectors" id="sc-analysis" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head sc-section__head--split">
          <div>
            <h2>Sector outcomes</h2>
            <p class="sc-section__desc">Programme-area performance across the network</p>
          </div>
          <a href="#/insights" class="sc-insights-cta" data-link>Country &amp; community comparisons, CBC index &rarr;</a>
        </div>
        <div class="sc-sector-table">
          <table class="sc-table">
            <thead>
              <tr><th scope="col">Sector</th><th scope="col" class="sc-th-num">Score</th><th scope="col">Distribution</th><th scope="col" class="sc-th-num">Change</th><th scope="col">Status</th></tr>
            </thead>
            <tbody>${sectorRows}</tbody>
          </table>
        </div>
      </div>
    </section>`;
}

export function renderScorecardReports(reports) {
  const items = (reports || [])
    .map(
      (r) => `<li class="sc-report-row">
        <div class="sc-report-row__year">${r.year}</div>
        <div class="sc-report-row__body">
          <span class="sc-report-row__type">${r.type}</span>
          <h3>${r.title}</h3>
          <p>${r.summary}</p>
        </div>
        <a href="${r.href}" class="sc-report-row__link" data-link>Read &rarr;</a>
      </li>`
    )
    .join("");

  return `
    <section class="sc-section sc-section--reports" id="sc-reports" data-reveal-section>
      <div class="sc-section__inner">
        <div class="sc-section__head">
          <h2>Reports &amp; briefs</h2>
          <p class="sc-section__desc">Downloadable ministry reports and quarterly performance summaries</p>
        </div>
        <ul class="sc-report-timeline">${items}</ul>
      </div>
    </section>`;
}
