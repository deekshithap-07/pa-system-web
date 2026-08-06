const CHART_LAYOUT = [
  { key: "growthOverTime", size: "half" },
  { key: "communitiesAdded", size: "half" },
  { key: "householdsReached", size: "half" },
  { key: "leadershipDev", size: "half" },
  { key: "projectImpl", size: "half" },
  { key: "programActivity", size: "half" },
];

export function renderCountryCharts(charts) {
  if (!charts || !Object.keys(charts).length) {
    return `<section class="ch-section" id="ch-charts"><p style="color:var(--pa-muted)">Chart data not available.</p></section>`;
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
    <section class="ch-section" id="ch-charts">
      <div class="ch-section__head">
        <h2>Projects and progress</h2>
      </div>
      <div class="ch-chart-grid">${cards}</div>
    </section>`;
}
