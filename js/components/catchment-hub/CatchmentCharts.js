const CHART_LAYOUT = [
  { key: "communityGrowth", size: "half" },
  { key: "householdReach", size: "half" },
  { key: "projectProgress", size: "half" },
  { key: "leadershipDev", size: "half" },
];

export function renderCatchmentCharts(charts) {
  if (!charts || !Object.keys(charts).length) {
    return `<section class="ch-section" id="cth-charts"><p class="ch-empty">Chart data not available.</p></section>`;
  }

  const cards = CHART_LAYOUT.filter((c) => charts[c.key])
    .map(
      (c) => `<article class="ch-chart-card ch-chart-card--${c.size}" data-chart="${c.key}" data-reveal-section>
        <h3>${charts[c.key].title}</h3>
        <div class="ch-chart-wrap"><canvas></canvas></div>
      </article>`
    )
    .join("");

  return `
    <section class="ch-section" id="cth-charts">
      <div class="ch-section__head">
        <h2>Growth &amp; Progress</h2>
        <p class="ch-section__desc">Transformation trends across this catchment</p>
      </div>
      <div class="ch-chart-grid">${cards}</div>
    </section>`;
}
