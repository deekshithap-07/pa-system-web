import { renderBreadcrumb } from "./Breadcrumb.js";

export function renderCatchmentHero(hub) {
  return `
    <header class="ch-hero" id="cth-overview">
      <div class="ch-hero__grid">
        <div class="ch-hero__content">
          ${renderBreadcrumb([
            { label: "Africa", href: "#/africa" },
            { label: hub.countryName, href: `#/country/${hub.countrySlug}` },
            { label: hub.catchmentName, href: `#/catchment/${hub.countrySlug}/${hub.catchmentSlug}` },
          ])}
          <p class="eyebrow ch-hero__tag">Catchment area · ${hub.heroTagline}</p>
          <h1>${hub.catchmentName}</h1>
          <p class="ch-hero__summary">${hub.description}</p>
        </div>
        <div class="ch-hero__visual ch-hero__context-map-wrap">
          <div id="context-map-root" class="ch-hero__context-map" aria-label="Africa context map"></div>
        </div>
      </div>
    </header>`;
}
