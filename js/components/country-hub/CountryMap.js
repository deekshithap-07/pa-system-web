import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";

export function renderCountryMap(hub) {
  if (!hub.geoMap) {
    return `
      <section class="ch-section" id="ch-map" data-reveal-section>
        <div class="ch-section__head">
          <h2>Country Map</h2>
          <p class="ch-section__desc">Catchment mapping will be available as the network expands in ${hub.countryName}.</p>
        </div>
        <p class="ch-empty">No geographic map data available yet.</p>
      </section>`;
  }

  return `
    <section class="ch-section" id="ch-map" data-reveal-section>
      <div class="ch-section__head">
        <h2>Country Map</h2>
        <p class="ch-section__desc">Catchments and communities at their geographic locations — click a catchment to explore</p>
      </div>
      ${renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "section" })}
    </section>`;
}

export function bindCountryMap(root, countrySlug) {
  bindHubGeoMap(root, { countrySlug });
}
