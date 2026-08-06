import { renderBreadcrumb } from "./Breadcrumb.js";

export function renderCountryHero(hub) {
  return `
    <header class="ch-hero" id="ch-overview">
      <div class="ch-hero__grid">
        <div class="ch-hero__content">
          ${renderBreadcrumb(hub.countryName)}
          <p class="eyebrow ch-hero__tag">${hub.heroTagline}</p>
          <p class="ch-hero__question">What is happening in this country?</p>
          <h1>${hub.countryName}</h1>
        </div>
        <div class="ch-hero__visual ch-hero__context-map-wrap">
          <div id="context-map-root" class="ch-hero__context-map" aria-label="Africa context map"></div>
        </div>
      </div>
    </header>`;
}
