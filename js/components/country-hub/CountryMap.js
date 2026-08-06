import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";

export function renderCountryMap(hub) {
  if (!hub.geoMap) {
    return `
      <section class="ch-section" id="ch-map" data-reveal-section>
        <div class="ch-section__head">
          <h2>Map showing catchment areas</h2>
          <p class="ch-section__desc">Catchment mapping will be available as the network expands in ${hub.countryName}.</p>
        </div>
        <p class="ch-empty">No geographic map data available yet.</p>
      </section>`;
  }

  return `
    <section class="ch-section" id="ch-map" data-reveal-section>
      <div class="ch-section__head">
        <h2>Map showing catchment areas</h2>
        <p class="ch-section__desc">${hub.countryName} catchment areas — click a catchment to explore its communities</p>
      </div>
      ${renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "section" })}
    </section>`;
}

export function bindCountryMap(root, countrySlug) {
  bindHubGeoMap(root, { countrySlug });
}
