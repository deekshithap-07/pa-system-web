export function renderCountryCatchments(catchments, countryName, countrySlug) {
  if (!catchments?.length) {
    return `
      <section class="ch-section" id="ch-catchments" data-reveal-section>
        <div class="ch-section__head">
          <h2>Catchments</h2>
          <p class="ch-section__desc">Catchment data for ${countryName} will expand as the network grows.</p>
        </div>
        <p class="ch-empty">No catchment areas mapped yet.</p>
      </section>`;
  }

  const cards = catchments
    .map(
      (c) => `<article class="ch-community-card ch-catchment-card" data-reveal-section data-catchment-slug="${c.slug}">
        <div class="ch-community-card__head">
          <p class="ch-catchment-card__eyebrow">Catchment area</p>
          <h3>${c.name}</h3>
          <span class="ch-community-card__status ch-community-card__status--${c.status}">${c.status}</span>
        </div>
        <p>${c.summary.communities} communit${c.summary.communities === 1 ? "y" : "ies"} · ${c.summary.pastors ?? 0} pastors</p>
        <span class="ch-community-card__link">View catchment &rarr;</span>
      </article>`
    )
    .join("");

  return `
    <section class="ch-section" id="ch-catchments">
      <div class="ch-section__head">
        <h2>Catchments</h2>
        <p class="ch-section__desc">Catchment areas in ${countryName} — each groups one or more local communities</p>
      </div>
      <div class="ch-community-grid">${cards}</div>
    </section>`;
}

/** @deprecated Use renderCountryCatchments */
export const renderCountryCommunities = renderCountryCatchments;

export function bindCountryCatchments(root, countrySlug) {
  root.querySelectorAll("[data-catchment-slug]").forEach((card) => {
    card.addEventListener("click", () => {
      const slug = card.dataset.catchmentSlug;
      if (slug && countrySlug) {
        location.hash = `#/catchment/${countrySlug}/${slug}`;
      }
    });
  });
}

/** @deprecated Use bindCountryCatchments */
export const bindCountryCommunities = bindCountryCatchments;
