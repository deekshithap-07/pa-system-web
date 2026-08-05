export function renderSearch(data) {
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const countryById = Object.fromEntries((data.countries?.countries || []).map((c) => [c.id, c]));
  const stories = (data.stories?.stories || []).slice(0, 4);

  return `
    <div class="static-page">
      <div class="container">
        <button class="back-btn" data-back>&larr; Back to home</button>
        <p class="eyebrow">Discover</p>
        <h1>Search</h1>
        <p class="lead">Find countries, communities, and resources across the platform.</p>

        <div class="search-box">
          <input type="search" class="search-box__input" placeholder="Search countries, communities…" aria-label="Search" id="platform-search" disabled>
          <p class="search-box__hint">Full search will connect to backend data. Preview suggestions below.</p>
        </div>

        <h2 style="font-size:1rem;margin:2rem 0 0.75rem;color:var(--pa-navy)">PA Network Countries</h2>
        <div class="card-grid">${countries
          .map(
            (c) => `<a class="entity-card" href="#/country/${c.slug}" data-link>
              <h3>${c.name}</h3>
              <p>${c.summary?.communities || 0} communities</p>
            </a>`
          )
          .join("")}</div>

        <h2 style="font-size:1rem;margin:2rem 0 0.75rem;color:var(--pa-navy)">Featured Stories</h2>
        <div class="card-grid">${stories
          .map((s) => {
            const country = countryById[s.countryId];
            const href = country ? `#/country/${country.slug}` : "#/africa";
            return `<a class="entity-card" href="${href}" data-link>
              <h3>${s.title}</h3>
              <p>${s.excerpt}</p>
            </a>`;
          })
          .join("")}</div>
      </div>
    </div>`;
}
