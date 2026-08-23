import { formatNumber } from "../../utils/format.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCommunityOnMap } from "../../utils/hub-geo-maps.js";

export function renderCommunityPlaces({ community, country, catchment, geoMap, siblingCommunities = [] }) {
  const mapBlock = geoMap
    ? renderHubGeoMap(geoMap, { variant: "full", mapId: "community-places" })
    : `<p class="ch-empty">Map data for this catchment is being prepared.</p>`;

  const siblings = (siblingCommunities || []).filter((c) => c.slug !== community.slug);
  const siblingChips = siblings.length
    ? siblings
        .map(
          (c) => `<a href="#/community/${country.slug}/${catchment.slug}/${c.slug}" class="cm-place-chip" data-link>${c.name}</a>`
        )
        .join("")
    : "";

  const stats = [
    { label: "Catchment", value: catchment.name },
    { label: "Region", value: catchment.region || "—" },
    { label: "Pastors", value: formatNumber(community.pastors ?? 0) },
    { label: "Households", value: formatNumber(community.households ?? 0) },
  ];

  return `
    <section class="cm-places" id="cm-places" data-reveal-section>
      <div class="container cm-places__inner">
        <header class="cm-places__head">
          <p class="cm-places__eyebrow">Place in the network</p>
          <h2>${community.name} in ${catchment.name}</h2>
          <p class="cm-places__lead">See where this community sits within ${country.name} — and explore neighbouring places in the same nearby group.</p>
        </header>
        <dl class="cm-places__facts">
          ${stats
            .map(
              (s) => `<div class="cm-places__fact">
              <dt>${s.label}</dt>
              <dd>${s.value}</dd>
            </div>`
            )
            .join("")}
        </dl>
        <div class="cm-places__map-wrap">
          ${mapBlock}
        </div>
        ${
          siblingChips
            ? `<div class="cm-places__siblings">
            <p class="cm-places__siblings-label">Other communities in ${catchment.name}</p>
            <div class="cm-places__chips">${siblingChips}</div>
          </div>`
            : ""
        }
      </div>
    </section>`;
}

export function bindCommunityPlaces(root, { countrySlug, catchmentSlug, communitySlug }) {
  bindHubGeoMap(root, { countrySlug, catchmentSlug });
  highlightCommunityOnMap(root, communitySlug);
}
