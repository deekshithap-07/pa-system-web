export function renderCatchmentInsights(insights) {
  if (!insights?.length) {
    return `<section class="ch-section" id="cth-insights" data-reveal-section><p class="ch-empty">No insights available.</p></section>`;
  }

  const cards = insights
    .map(
      (ins) => `<article class="ch-insight-card" data-reveal-section>
        <div class="ch-insight-card__head">
          <h3>${ins.title}</h3>
          <span class="ch-insight-card__score">${ins.score}</span>
        </div>
        <p class="ch-insight-card__metric">${ins.metric}</p>
        <p class="ch-insight-card__summary">${ins.summary}</p>
        <span class="ch-insight-card__trend">${ins.trend}</span>
      </article>`
    )
    .join("");

  return `
    <section class="ch-section" id="cth-insights">
      <div class="ch-section__head">
        <h2>Catchment Insights</h2>
        <p class="ch-section__desc">Sector performance across education, health, agriculture, water, livelihood, and leadership</p>
      </div>
      <div class="ch-insight-grid">${cards}</div>
    </section>`;
}
