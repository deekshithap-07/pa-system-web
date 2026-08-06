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
  const resourceChart = ia.trendAnalysis?.resourceMobilization;

  return `
    <div class="ins-page" data-insights-hub>
      <header class="ins-hero">
        <div class="container ins-hero__inner">
          <div class="ins-hero__copy">
            <p class="eyebrow">Analysis &amp; Insights</p>
            <h1>${ia.meta.title}</h1>
            <p class="ins-hero__lead">${ia.meta.subtitle}</p>
            <p class="ins-hero__meta">Period: ${ia.meta.period} · Updated ${ia.meta.lastUpdated}</p>
          </div>
          <nav class="ins-hero__nav" aria-label="Insights sections">
            <a href="#ins-comparisons">Comparisons</a>
            <a href="#ins-cbc">CBC index</a>
            <a href="#ins-readiness">Readiness</a>
            <a href="#ins-hotspots">Hotspots</a>
          </nav>
          <a href="#/scorecard" class="ins-hero__cta" data-link>View scorecard snapshot &rarr;</a>
        </div>
      </header>

      <div class="container ins-body">
        <!-- Comparisons: side-by-side panels -->
        <section class="ins-section ins-section--compare" id="ins-comparisons">
          <header class="ins-section__head">
            <h2>Comparison tools</h2>
            <p>Side-by-side metrics for countries and communities</p>
          </header>
          <div class="ins-compare-split">
            <div class="ins-compare-panel">
              <h3>Country vs country</h3>
              <div class="ins-compare-selects">
                <label>Country A <select id="compare-country-a">${countries.map((c) => `<option value="${c.slug}">${c.name}</option>`).join("")}</select></label>
                <span class="ins-compare-vs">vs</span>
                <label>Country B <select id="compare-country-b">${countries.map((c, i) => `<option value="${c.slug}" ${i === 1 ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>
              </div>
              <div class="ins-compare-results" id="country-compare-results"></div>
            </div>
            <div class="ins-compare-panel">
              <h3>Community vs community</h3>
              <div class="ins-compare-selects">
                <label>Community A <select id="compare-community-a">${communities.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label>
                <span class="ins-compare-vs">vs</span>
                <label>Community B <select id="compare-community-b">${communities.map((c, i) => `<option value="${c.id}" ${i === 1 ? "selected" : ""}>${c.name}</option>`).join("")}</select></label>
              </div>
              <div class="ins-compare-results" id="community-compare-results"></div>
            </div>
          </div>
        </section>

        <!-- CBC: radar + dimension bars -->
        <section class="ins-section ins-section--cbc" id="ins-cbc">
          <header class="ins-section__head">
            <h2>${cbc.title}</h2>
            <p>${cbc.description}</p>
          </header>
          <div class="ins-cbc-split">
            <div class="ins-cbc-radar">
              <div class="insights-chart-wrap insights-chart-wrap--radar"><canvas id="chart-cbc"></canvas></div>
            </div>
            <div class="ins-cbc-bars">
              ${cbc.dimensions
                .map(
                  (d) => `<div class="ins-cbc-bar">
                    <div class="ins-cbc-bar__head"><span>${d.label}</span><strong>${d.score}</strong><em>${d.trend}</em></div>
                    <div class="ins-cbc-bar__track"><div class="ins-cbc-bar__fill" style="width:${d.score}%"></div></div>
                  </div>`
                )
                .join("")}
            </div>
          </div>
        </section>

        <!-- Readiness ladder + resource mobilization -->
        <section class="ins-section ins-section--readiness" id="ins-readiness">
          <div class="ins-readiness-grid">
            <div class="ins-readiness-ladder">
              <header class="ins-section__head">
                <h2>${readiness.title}</h2>
                <p>${readiness.description}</p>
              </header>
              <ol class="ins-ladder">
                ${readiness.stages
                  .map(
                    (s, i) => `<li class="ins-ladder__step" style="--stage-color:${s.color}">
                      <span class="ins-ladder__num">${i + 1}</span>
                      <div class="ins-ladder__content">
                        <strong>${s.label}</strong>
                        <span>${s.count} communities · avg ${s.avgScore}</span>
                        <p>${s.description}</p>
                      </div>
                      <div class="ins-ladder__bar" style="width:${s.avgScore}%"></div>
                    </li>`
                  )
                  .join("")}
              </ol>
              <div class="ins-drivers">
                <h4>Progress drivers</h4>
                <ul>${drivers.map((d) => `<li><strong>${d.driver}</strong> — ${d.impact} impact (r=${d.correlation})</li>`).join("")}</ul>
              </div>
            </div>
            ${
              resourceChart
                ? `<aside class="ins-resource-panel">
              <h3>${resourceChart.title}</h3>
              <p>${resourceChart.description}</p>
              <div class="insights-chart-wrap"><canvas id="chart-resources"></canvas></div>
            </aside>`
                : ""
            }
          </div>
        </section>

        <!-- Hotspots: ranked list -->
        <section class="ins-section ins-section--hotspots" id="ins-hotspots">
          <header class="ins-section__head">
            <h2>Progress hotspots</h2>
            <p>Areas advancing fastest and why</p>
          </header>
          <ol class="ins-hotspot-list">
            ${why
              .map(
                (w, i) => `<li class="ins-hotspot">
                  <span class="ins-hotspot__rank">${i + 1}</span>
                  <div class="ins-hotspot__body">
                    <h4>${w.area}</h4>
                    <p>${w.reason}</p>
                  </div>
                  <div class="ins-hotspot__score">
                    <strong>${w.score}</strong>
                    <div class="ins-hotspot__bar" style="width:${Math.min(100, w.score)}%"></div>
                  </div>
                </li>`
              )
              .join("")}
          </ol>
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
      return `<div class="ins-compare-row">
        <span class="ins-compare-row__label">${labels[m] || m}</span>
        <span class="ins-compare-row__val ${winner === "a" ? "is-winner" : ""}">${va}</span>
        <span class="ins-compare-row__val ${winner === "b" ? "is-winner" : ""}">${vb}</span>
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
      return `<div class="ins-compare-row">
        <span class="ins-compare-row__label">${label}</span>
        <span class="ins-compare-row__val ${winner === "a" ? "is-winner" : ""}">${a[key]}</span>
        <span class="ins-compare-row__val ${winner === "b" ? "is-winner" : ""}">${b[key]}</span>
      </div>`;
    })
    .join("");
}

export function mountInsights(data) {
  const root = document.querySelector("[data-insights-hub]");
  if (!root) return;

  const ia = data.insightsAnalytics;
  destroyCharts();

  if (ia.trendAnalysis?.resourceMobilization) {
    renderChart(document.getElementById("chart-resources"), ia.trendAnalysis.resourceMobilization);
  }

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

  root.querySelectorAll(".ins-hero__nav a").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href?.startsWith("#") && href.length > 1) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

export function destroyInsights() {
  destroyCharts();
}
