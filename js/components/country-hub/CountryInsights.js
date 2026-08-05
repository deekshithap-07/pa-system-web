export function renderCountryInsights(insights) {
  if (!insights?.length) {
    return "";
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
    <section class="ch-section" id="ch-insights">
      <div class="ch-section__head">
        <h2>Country Insights</h2>
        <p class="ch-section__desc">Sector performance and programme impact</p>
      </div>
      <div class="ch-insight-grid">${cards}</div>
    </section>`;
}
