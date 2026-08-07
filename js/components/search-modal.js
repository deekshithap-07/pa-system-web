/**
 * Site search — modal overlay (no separate page).
 */

let modalEl = null;
let dataRef = null;

export function initSearchModal(data) {
  dataRef = data;
  if (document.getElementById("search-modal")) {
    modalEl = document.getElementById("search-modal");
    return;
  }

  modalEl = document.createElement("div");
  modalEl.id = "search-modal";
  modalEl.className = "search-modal";
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.innerHTML = `
    <div class="search-modal__backdrop" data-search-close></div>
    <div class="search-modal__panel" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
      <button type="button" class="search-modal__close" data-search-close aria-label="Close search">&times;</button>
      <p class="eyebrow">Discover</p>
      <h2 id="search-modal-title">Search the platform</h2>
      <input type="search" class="search-modal__input" id="search-modal-input" placeholder="Countries, communities, programmes…" autocomplete="off">
      <div class="search-modal__results" id="search-modal-results"></div>
    </div>`;
  document.body.appendChild(modalEl);

  modalEl.querySelectorAll("[data-search-close]").forEach((el) => {
    el.addEventListener("click", closeSearchModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl?.classList.contains("is-open")) closeSearchModal();
  });

  const input = modalEl.querySelector("#search-modal-input");
  input?.addEventListener("input", () => renderResults(input.value));
}

export function openSearchModal() {
  if (!modalEl) return;
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-modal-open");
  const input = modalEl.querySelector("#search-modal-input");
  input.value = "";
  renderResults("");
  requestAnimationFrame(() => input?.focus());
}

export function closeSearchModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-modal-open");
}

function renderResults(query) {
  const root = modalEl?.querySelector("#search-modal-results");
  if (!root || !dataRef) return;

  const q = query.trim().toLowerCase();
  const countries = (dataRef.countries?.countries || []).filter((c) => c.isPaNetwork);
  const stories = dataRef.stories?.stories || [];

  const countryHits = countries.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q)
  );
  const storyHits = stories.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.program?.toLowerCase().includes(q)
  );

  const countryCards = countryHits
    .slice(0, 6)
    .map(
      (c) => `<a href="#/country/${c.slug}" class="search-modal__item" data-link>
        <span class="search-modal__item-type">Country</span>
        <strong>${c.name}</strong>
        <span>${c.summary?.communities || 0} communities</span>
      </a>`
    )
    .join("");

  const storyCards = storyHits
    .slice(0, 4)
    .map(
      (s) => `<a href="#/resources#res-case-studies" class="search-modal__item" data-link>
        <span class="search-modal__item-type">Story</span>
        <strong>${s.title}</strong>
        <span>${s.program}</span>
      </a>`
    )
    .join("");

  const quick = !q
    ? `<div class="search-modal__quick">
        <a href="#/#home-africa-map" data-link>Africa map</a>
        <a href="#/insights" data-link>Insights</a>
        <a href="#/resources" data-link>Resources</a>
        <a href="#/about" data-link>About PA</a>
      </div>`
    : "";

  root.innerHTML =
    quick +
    (countryCards ? `<p class="search-modal__label">Countries</p>${countryCards}` : "") +
    (storyCards ? `<p class="search-modal__label">Stories</p>${storyCards}` : "") +
    (!countryCards && !storyCards && q ? `<p class="search-modal__empty">No matches for “${query}”</p>` : "");
}
