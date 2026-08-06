const PROGRESS_CHART_KEYS = ["impactLine", "leadershipRadar"];

export function renderCommunityProgress({ dash }) {
  const charts = dash.charts || {};
  const cards = PROGRESS_CHART_KEYS.filter((k) => charts[k])
    .map(
      (key) => `<article class="ch-chart-card ch-chart-card--half" data-chart="${key}" data-reveal-section>
        <h3>${charts[key].title}</h3>
        <div class="ch-chart-wrap"><canvas></canvas></div>
      </article>`
    )
    .join("");

  if (!cards) {
    return `
      <section class="ch-section" id="cm-progress" data-reveal-section>
        <div class="ch-section__head"><h2>Progress indicators</h2></div>
        <p class="ch-empty">Progress data not available.</p>
      </section>`;
  }

  return `
    <section class="ch-section" id="cm-progress">
      <div class="ch-section__head">
        <h2>Progress indicators</h2>
      </div>
      <div class="ch-chart-grid">${cards}</div>
    </section>`;
}
