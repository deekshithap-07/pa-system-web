import { formatNumber } from "../utils/format.js";
import { renderChart, destroyCharts } from "../components/charts.js";

export function renderInsights(data) {
  const ia = data.insightsAnalytics;
  if (!ia) return `<div class="container static-page"><h1>Insights data unavailable</h1></div>`;

  const countries = ia.countryComparison?.countries || [];
  const communities = ia.communityComparison?.communities || [];
  const cbc = ia.cbcIndex;
  const readiness = ia.readinessLevels;
  const drivers = readiness?.progressDrivers || [];
  const why = ia.whyProgressing || [];

  return `
    <div class="hub-page hub-page--insights" data-insights-hub>
      <div class="hub-page__hero hub-page__hero--dark">
        <div class="container">
          <p class="eyebrow">Analysis & Insights</p>
          <h1>${ia.meta.title}</h1>
          <p class="hub-page__lead">${ia.meta.subtitle}</p>
          <p class="hub-page__updated">Period: ${ia.meta.period} · Updated ${ia.meta.lastUpdated}</p>
          <a href="#/scorecard" class="hub-hero__cta" data-link>View full scorecard &rarr;</a>
        </div>
      </div>

      <div class="container hub-page__body">
        <!-- A. Trend Analysis -->
        <section class="hub-section" id="ins-trends">
          <h2>A. Trend Analysis</h2>
          <p class="hub-section__desc">Growth trends over time from the community tracking system.</p>
          <div class="insights-chart-grid">
            <div class="insights-chart-card">
              <h3>${ia.trendAnalysis.shalomGroups.title}</h3>
              <p>${ia.trendAnalysis.shalomGroups.description}</p>
              <div class="insights-chart-wrap"><canvas id="chart-shalom"></canvas></div>
            </div>
            <div class="insights-chart-card">
              <h3>${ia.trendAnalysis.householdReach.title}</h3>
              <p>${ia.trendAnalysis.householdReach.description}</p>
              <div class="insights-chart-wrap"><canvas id="chart-households"></canvas></div>
            </div>
            <div class="insights-chart-card">
              <h3>${ia.trendAnalysis.resourceMobilization.title}</h3>
              <p>${ia.trendAnalysis.resourceMobilization.description}</p>
              <div class="insights-chart-wrap"><canvas id="chart-resources"></canvas></div>
            </div>
          </div>
        </section>

        <!-- B. Comparison Tools -->
        <section class="hub-section" id="ins-comparisons">
          <h2>B. Comparison Tools</h2>

          <div class="compare-panel">
            <h3>Country vs Country</h3>
            <div class="compare-selects">
              <label>Country A <select id="compare-country-a">${countries.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("")}</select></label>
              <label>Country B <select id="compare-country-b">${countries.map((c, i) => `<option value="${c.slug}" ${i === 1 ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>
            </div>
            <div class="compare-results" id="country-compare-results"></div>
          </div>

          <div class="compare-panel">
            <h3>Community vs Community</h3>
            <div class="compare-selects">
              <label>Community A <select id="compare-community-a">${communities.map((c) => `<option value="${c.id}">${c.name} (${c.country})</option>`).join("")}</select></label>
              <label>Community B <select id="compare-community-b">${communities.map((c, i) => `<option value="${c.id}" ${i === 1 ? "selected" : ""}>${c.name} (${c.country})</option>`).join("")}</select></label>
            </div>
            <div class="compare-results" id="community-compare-results"></div>
          </div>
        </section>

        <!-- C. Performance Scoring -->
        <section class="hub-section" id="ins-cbc">
          <h2>C. Performance Scoring</h2>

          <div class="cbc-panel">
            <h3>${cbc.title}</h3>
            <p>${cbc.description}</p>
            <div class="insights-chart-wrap insights-chart-wrap--radar"><canvas id="chart-cbc"></canvas></div>
            <div class="cbc-dimensions">${cbc.dimensions
              .map((d) => `<div class="cbc-dim"><span class="cbc-dim__score">${d.score}</span><span class="cbc-dim__label">${d.label}</span><span class="cbc-dim__trend">${d.trend}</span></div>`)
              .join("")}</div>
          </div>

          <div class="readiness-panel" id="ins-readiness">
            <h3>${readiness.title}</h3>
            <p>${readiness.description}</p>
            <div class="readiness-stages">${readiness.stages
              .map(
                (s) => `<div class="readiness-stage" style="--stage-color:${s.color}">
                  <div class="readiness-stage__bar" style="width:${s.avgScore}%"></div>
                  <div class="readiness-stage__info">
                    <strong>${s.label}</strong> <span class="readiness-stage__count">${s.count} communities</span>
                    <p>${s.description}</p>
                    <span class="readiness-stage__score">Avg score: ${s.avgScore}</span>
                  </div>
                </div>`
              )
              .join("")}</div>
            <div class="readiness-drivers">
              <h4>Why areas are progressing faster</h4>
              <ul>${drivers.map((d) => `<li><strong>${d.driver}</strong> — ${d.impact} impact (r=${d.correlation})</li>`).join("")}</ul>
            </div>
          </div>
        </section>

        <section class="hub-section" id="ins-why">
          <h2>Progress hotspots</h2>
          <div class="why-grid">${why
            .map((w) => `<div class="why-card"><span class="why-card__score">${w.score}</span><h4>${w.area}</h4><p>${w.reason}</p></div>`)
            .join("")}</div>
        </section>
      </div>
    </div>`;
}

function renderCountryComparison(countries, slugA, slugB, labels) {
  const a = countries.find((c) => c.slug === slugA);
  const b = countries.find((c) => c.slug === slugB);
  if (!a || !b) return "";

  const metrics = ["communities", "households", "projects", "growth", "shalomGroups", "leadershipScore"];
  return metrics
    .map((m) => {
      const va = m === "households" ? formatNumber(a[m]) : a[m];
      const vb = m === "households" ? formatNumber(b[m]) : b[m];
      const winner = a[m] > b[m] ? "a" : a[m] < b[m] ? "b" : "tie";
      return `<div class="compare-row">
        <span class="compare-row__label">${labels[m] || m}</span>
        <span class="compare-row__val ${winner === "a" ? "is-winner" : ""}">${a.name}: ${va}</span>
        <span class="compare-row__val ${winner === "b" ? "is-winner" : ""}">${b.name}: ${vb}</span>
      </div>`;
    })
    .join("");
}

function renderCommunityComparison(communities, idA, idB) {
  const a = communities.find((c) => c.id === idA);
  const b = communities.find((c) => c.id === idB);
  if (!a || !b) return "";

  const fields = [
    ["Journey stage", "stage"],
    ["Shalom leaders", "shalomLeaders"],
    ["Leadership score", "leadershipScore"],
    ["Projects", "projects"],
    ["Growth %", "growth"],
  ];

  return fields
    .map(([label, key]) => {
      const winner = a[key] > b[key] ? "a" : a[key] < b[key] ? "b" : "tie";
      return `<div class="compare-row">
        <span class="compare-row__label">${label}</span>
        <span class="compare-row__val ${winner === "a" ? "is-winner" : ""}">${a.name}: ${a[key]}</span>
        <span class="compare-row__val ${winner === "b" ? "is-winner" : ""}">${b.name}: ${b[key]}</span>
      </div>`;
    })
    .join("");
}

export function mountInsights(data) {
  const root = document.querySelector("[data-insights-hub]");
  if (!root) return;

  const ia = data.insightsAnalytics;
  destroyCharts();

  renderChart(document.getElementById("chart-shalom"), ia.trendAnalysis.shalomGroups);
  renderChart(document.getElementById("chart-households"), ia.trendAnalysis.householdReach);
  renderChart(document.getElementById("chart-resources"), ia.trendAnalysis.resourceMobilization);

  const cbcDims = ia.cbcIndex.dimensions;
  renderChart(document.getElementById("chart-cbc"), {
    type: "radar",
    title: "CBC Index",
    labels: cbcDims.map((d) => d.label),
    data: cbcDims.map((d) => d.score),
    color: "#009FDA",
  });

  const countries = ia.countryComparison.countries;
  const communities = ia.communityComparison.communities;
  const labels = ia.countryComparison.metricLabels;

  const countryResults = root.querySelector("#country-compare-results");
  const communityResults = root.querySelector("#community-compare-results");
  const countryA = root.querySelector("#compare-country-a");
  const countryB = root.querySelector("#compare-country-b");
  const commA = root.querySelector("#compare-community-a");
  const commB = root.querySelector("#compare-community-b");

  const updateCountry = () => {
    if (countryResults) {
      countryResults.innerHTML = renderCountryComparison(countries, countryA.value, countryB.value, labels);
    }
  };
  const updateCommunity = () => {
    if (communityResults) {
      communityResults.innerHTML = renderCommunityComparison(communities, commA.value, commB.value);
    }
  };

  countryA?.addEventListener("change", updateCountry);
  countryB?.addEventListener("change", updateCountry);
  commA?.addEventListener("change", updateCommunity);
  commB?.addEventListener("change", updateCommunity);

  updateCountry();
  updateCommunity();
}

export function destroyInsights() {
  destroyCharts();
}
