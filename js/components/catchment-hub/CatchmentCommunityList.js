import { formatNumber } from "../../utils/format.js";

export function renderCatchmentCommunityList(communities, countrySlug, catchmentSlug, catchmentName = "") {
  if (!communities?.length) {
    return `<section class="cth-communities" id="cth-communities" data-reveal-section><div class="container"><p class="ch-empty">No communities in this group yet.</p></div></section>`;
  }

  const title = catchmentName ? `Communities in ${catchmentName}` : "Communities";

  const navLinks = communities
    .map(
      (c) => `<a href="#/community/${countrySlug}/${catchmentSlug}/${c.slug}" class="cth-community-nav__link" data-link>${c.name}</a>`
    )
    .join("");

  const cards = communities
    .map(
      (c) => `<a href="#/community/${countrySlug}/${catchmentSlug}/${c.slug}" class="cth-community-card" data-link data-reveal-section>
        <div class="cth-community-card__head">
          <div>
            <p class="cth-community-card__eyebrow">Community</p>
            <h3>${c.name}</h3>
          </div>
          <span class="cth-community-card__status">${c.status || c.journeyStage || "—"}</span>
        </div>
        <div class="cth-community-card__stats">
          ${c.pastors != null ? `<span><strong>${formatNumber(c.pastors)}</strong> pastors</span>` : ""}
          ${c.households != null ? `<span><strong>${formatNumber(c.households)}</strong> households</span>` : ""}
          ${c.shalomGroups != null ? `<span><strong>${formatNumber(c.shalomGroups)}</strong> Shalom groups</span>` : ""}
        </div>
        <span class="cth-community-card__cta">Open community →</span>
      </a>`
    )
    .join("");

  return `
    <section class="cth-communities" id="cth-communities" data-reveal-section>
      <div class="container">
        <header class="cth-communities__head">
          <div>
            <p class="wb-out__eyebrow">Places in this group</p>
            <h2>${title}</h2>
            <p class="cth-communities__desc">${communities.length} communit${communities.length === 1 ? "y" : "ies"} in this nearby group — open any card for local figures, projects, and journey stage.</p>
          </div>
          <nav class="cth-community-nav" aria-label="Communities in ${catchmentName || "catchment"}">
            ${navLinks}
          </nav>
        </header>
        <div class="cth-community-grid">${cards}</div>
      </div>
    </section>`;
}

export function bindCatchmentCommunityList() {}
