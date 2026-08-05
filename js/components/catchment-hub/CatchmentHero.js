import { renderBreadcrumb } from "./Breadcrumb.js";
import { renderHubGeoMap } from "../../map/components/HubGeoMap.js";

export function renderCatchmentHero(hub) {
  const heroMap = hub.geoMap ? renderHubGeoMap(hub.geoMap, { variant: "compact", mapId: "hero" }) : "";

  return `
    <header class="ch-hero" id="cth-overview">
      <div class="ch-hero__grid">
        <div class="ch-hero__content">
          ${renderBreadcrumb([
            { label: "Africa", href: "#/" },
            { label: hub.countryName, href: `#/country/${hub.countrySlug}` },
            { label: hub.catchmentName, href: `#/catchment/${hub.countrySlug}/${hub.catchmentSlug}` },
          ])}
          <p class="eyebrow ch-hero__tag">Catchment area · ${hub.heroTagline}</p>
          <h1>${hub.catchmentName}</h1>
          <p class="ch-hero__summary">${hub.description}</p>
        </div>
        <div class="ch-hero__visual">
          ${heroMap || `<div class="ch-hero__image-placeholder"><span>Catchment map</span></div>`}
        </div>
      </div>
    </header>`;
}
