export function renderCountrySummary(hub) {
  return `
    <section class="ch-section" id="ch-summary" data-reveal-section>
      <div class="ch-section__head">
        <h2>Overview</h2>
        <p class="ch-section__desc">Transformation journey across ${hub.countryName}</p>
      </div>
      <div class="ch-summary">
        <p>${hub.overview}</p>
      </div>
    </section>`;
}
