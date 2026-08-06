export function renderCatchmentCommunityList(communities, countrySlug, catchmentSlug, catchmentName = "") {
  if (!communities?.length) {
    return `<section class="ch-section" id="cth-communities" data-reveal-section><p class="ch-empty">No communities in this catchment yet.</p></section>`;
  }

  const title = catchmentName ? `Communities in ${catchmentName}` : "Communities";

  const cards = communities
    .map(
      (c) => `<article class="cth-community-card" data-reveal-section>
        <div class="cth-community-card__head">
          <p class="cth-community-card__eyebrow">Community</p>
          <h3>${c.name}</h3>
          <span class="cth-community-card__status">${c.status}</span>
        </div>
        <div class="cth-community-card__stats">
          ${c.pastors != null ? `<span><strong>${c.pastors}</strong> pastors</span>` : ""}
          ${c.households != null ? `<span><strong>${c.households}</strong> households</span>` : ""}
          ${c.shalomGroups != null ? `<span><strong>${c.shalomGroups}</strong> Shalom groups</span>` : ""}
        </div>
        <a href="#/community/${countrySlug}/${catchmentSlug}/${c.slug}" class="cth-community-card__link" data-link>View community dashboard &rarr;</a>
      </article>`
    )
    .join("");

  return `
    <section class="ch-section" id="cth-communities">
      <div class="ch-section__head">
        <h2>${title}</h2>
        <p class="ch-section__desc">${communities.length} communit${communities.length === 1 ? "y" : "ies"} in this catchment area</p>
      </div>
      <div class="cth-community-grid">${cards}</div>
    </section>`;
}

export function bindCatchmentCommunityList(root) {
  /* Links use data-link navigation to community hub */
}
