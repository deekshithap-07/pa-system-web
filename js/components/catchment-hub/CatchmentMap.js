import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";

export function renderCatchmentMap(hub) {
  if (!hub.geoMap) {
    return `
      <section class="ch-section" id="cth-map" data-reveal-section>
        <div class="ch-section__head">
          <h2>Catchment Map</h2>
          <p class="ch-section__desc">Community mapping will expand as data is collected.</p>
        </div>
        <p class="ch-empty">No geographic map data available yet.</p>
      </section>`;
  }

  return `
    <section class="ch-section" id="cth-map" data-reveal-section>
      <div class="ch-section__head">
        <h2>Catchment Map</h2>
        <p class="ch-section__desc">Communities in ${hub.catchmentName} — click a community to view its dashboard</p>
      </div>
      ${renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "section" })}
    </section>`;
}

export function bindCatchmentMap(root, countrySlug, catchmentSlug) {
  bindHubGeoMap(root, { countrySlug, catchmentSlug });
}
