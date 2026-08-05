import { formatNumber } from "../../utils/format.js";
import { renderBreadcrumb } from "./Breadcrumb.js";
import { renderHubGeoMap } from "../../map/components/HubGeoMap.js";

export function renderCountryHero(hub) {
  const quickStats = [
    { label: "Communities", value: hub.kpis?.find((k) => k.id === "communities")?.value ?? hub.country.summary?.communities ?? 0 },
    { label: "Catchments", value: hub.catchments?.length ?? 0 },
    { label: "Households", value: hub.kpis?.find((k) => k.id === "households")?.value ?? 0, format: true },
    { label: "Growth", value: `+${hub.kpis?.find((k) => k.id === "growth")?.value ?? 0}%` },
  ];

  const heroMap = hub.geoMap ? renderHubGeoMap(hub.geoMap, { variant: "compact", mapId: "hero" }) : "";

  return `
    <header class="ch-hero" id="ch-overview">
      <div class="ch-hero__grid">
        <div class="ch-hero__content">
          ${renderBreadcrumb(hub.countryName)}
          <p class="eyebrow ch-hero__tag">${hub.heroTagline}</p>
          <h1>${hub.countryName}</h1>
          <p class="ch-hero__summary">${hub.description}</p>
          <div class="ch-hero__quick-stats">
            ${quickStats
              .map(
                (s) => `<div class="ch-hero__quick-stat">
                  <span class="ch-hero__quick-value">${s.format ? formatNumber(s.value) : s.value}</span>
                  <span class="ch-hero__quick-label">${s.label}</span>
                </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="ch-hero__visual">
          ${heroMap || `<div class="ch-hero__image-placeholder"><span>Country map</span></div>`}
        </div>
      </div>
    </header>`;
}
