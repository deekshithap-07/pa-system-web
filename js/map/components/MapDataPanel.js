/**
 * Compact left panel: search + selected country/catchment detail with Explore tab.
 */
const PA_ORDER = ["kenya", "malawi", "ethiopia", "zambia", "tanzania", "rwanda", "burundi"];

function statusKey(status = "") {
  const s = status.toLowerCase();
  if (s === "active") return "active";
  if (s === "growing") return "growing";
  return "emerging";
}

export class MapDataPanel {
  constructor(container, { countries, drillData, config, onCountrySelect, onCountryHover }) {
    this.container = container;
    this.countries = (countries || []).filter((c) => c.isPaNetwork);
    this.drillData = drillData || {};
    this.config = config || {};
    this.onCountrySelect = onCountrySelect;
    this.onCountryHover = onCountryHover;
    this.selection = { country: null, catchment: null, zoomLevel: 0 };
    this.render();
  }

  getSortedCountries() {
    const bySlug = Object.fromEntries(this.countries.map((c) => [c.slug, c]));
    return PA_ORDER.map((slug) => bySlug[slug]).filter(Boolean);
  }

  getCountryBySlug(slug) {
    return this.countries.find((c) => c.slug === slug) || null;
  }

  getCountryStats(country) {
    const hub = this.drillData[country.slug];
    const summary = country.summary || {};
    return {
      communities: summary.communities ?? country.communities ?? 0,
      catchments: summary.catchments ?? 0,
      pastors: summary.pastors ?? country.pastors ?? 0,
      projects: country.projects ?? hub?.metrics?.projects ?? 0,
      growth: country.growth ?? hub?.metrics?.growth ?? 0,
      povertyRate: country.stats?.povertyRate,
      dataYear: country.stats?.dataYear,
    };
  }

  renderEmptyState() {
    return `
      <div class="ai-panel__empty">
        <p>Search or click a country on the map to view its network data.</p>
      </div>`;
  }

  renderCountryDetail(country) {
    const stats = this.getCountryStats(country);
    const poverty =
      stats.povertyRate != null
        ? `${stats.povertyRate}% poverty (${stats.dataYear || "2023"})`
        : "Poverty data unavailable";

    return `
      <article class="ai-panel__detail">
        <div class="ai-panel__detail-head">
          <h2 class="ai-panel__detail-title">${country.name}</h2>
          <span class="ai-panel__status ai-panel__status--${statusKey(country.status)}">${country.status || "Network"}</span>
        </div>
        <p class="ai-panel__country-poverty">${poverty}</p>
        <dl class="ai-panel__kpi-grid ai-panel__kpi-grid--detail">
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">${stats.catchments}</dt>
            <dd class="ai-panel__kpi-lbl">Catchments</dd>
          </div>
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">${stats.communities}</dt>
            <dd class="ai-panel__kpi-lbl">Communities</dd>
          </div>
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">${stats.pastors.toLocaleString()}</dt>
            <dd class="ai-panel__kpi-lbl">Pastors</dd>
          </div>
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">+${stats.growth}%</dt>
            <dd class="ai-panel__kpi-lbl">Growth</dd>
          </div>
        </dl>
        <div class="ai-panel__tabs" role="tablist" aria-label="Country actions">
          <span class="ai-panel__tab is-active" role="tab" aria-selected="true">Overview</span>
          <a href="#/country/${country.slug}" class="ai-panel__tab ai-panel__tab--explore" role="tab" data-link>Explore</a>
        </div>
      </article>`;
  }

  renderCatchmentDetail(country, catchment) {
    const communities = catchment.communities || [];
    const summary = catchment.summary || {};
    const households = summary.households ?? communities.reduce((sum, c) => sum + (c.households || 0), 0);

    return `
      <article class="ai-panel__detail">
        <p class="ai-panel__detail-breadcrumb">${country.name}</p>
        <div class="ai-panel__detail-head">
          <h2 class="ai-panel__detail-title">${catchment.name}</h2>
        </div>
        <dl class="ai-panel__kpi-grid ai-panel__kpi-grid--detail">
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">${communities.length}</dt>
            <dd class="ai-panel__kpi-lbl">Communities</dd>
          </div>
          <div class="ai-panel__kpi">
            <dt class="ai-panel__kpi-val">${households.toLocaleString()}</dt>
            <dd class="ai-panel__kpi-lbl">Households</dd>
          </div>
        </dl>
        <div class="ai-panel__tabs" role="tablist" aria-label="Catchment actions">
          <span class="ai-panel__tab is-active" role="tab" aria-selected="true">Overview</span>
          <a href="#/catchment/${country.slug}/${catchment.slug}" class="ai-panel__tab ai-panel__tab--explore" role="tab" data-link>Explore</a>
        </div>
      </article>`;
  }

  renderSelectedPanel() {
    const { country, catchment, zoomLevel } = this.selection;
    if (!country) return this.renderEmptyState();
    if (zoomLevel >= 2 && catchment) return this.renderCatchmentDetail(country, catchment);
    return this.renderCountryDetail(country);
  }

  renderSearchResults(query = "") {
    const q = query.trim().toLowerCase();
    const matches = this.getSortedCountries().filter((c) => !q || c.name.toLowerCase().includes(q));
    if (!matches.length) {
      return `<p class="ai-panel__search-empty">No countries found</p>`;
    }
    return matches
      .map(
        (c) => `<button type="button" class="ai-panel__search-item" data-country-slug="${c.slug}">
          <span>${c.name}</span>
          <span class="ai-panel__search-item-meta">${this.getCountryStats(c).communities} communities</span>
        </button>`
      )
      .join("");
  }

  render() {
    this.container.innerHTML = `
      <div class="ai-panel ai-panel--compact">
        <div class="ai-panel__search-wrap">
          <div class="ai-panel__search">
            <input type="search" placeholder="Search countries" aria-label="Search countries" id="ai-panel-search" autocomplete="off">
          </div>
          <div class="ai-panel__search-results" id="ai-panel-search-results" hidden></div>
        </div>
        <div class="ai-panel__selected" id="ai-panel-selected" aria-live="polite">
          ${this.renderSelectedPanel()}
        </div>
      </div>`;

    this.selectedEl = this.container.querySelector("#ai-panel-selected");
    this.searchInput = this.container.querySelector("#ai-panel-search");
    this.searchResultsEl = this.container.querySelector("#ai-panel-search-results");

    this.searchInput?.addEventListener("input", (e) => this.onSearchInput(e.target.value));
    this.searchInput?.addEventListener("focus", () => this.showSearchResults(this.searchInput.value));
    this.searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hideSearchResults();
    });

    document.addEventListener("click", this._onDocClick);
  }

  _onDocClick = (e) => {
    if (!this.container.contains(e.target)) this.hideSearchResults();
  };

  onSearchInput(value) {
    this.showSearchResults(value);
  }

  showSearchResults(query) {
    if (!this.searchResultsEl) return;
    this.searchResultsEl.innerHTML = this.renderSearchResults(query);
    this.searchResultsEl.hidden = false;

    this.searchResultsEl.querySelectorAll("[data-country-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const country = this.getCountryBySlug(btn.dataset.countrySlug);
        if (country) {
          this.searchInput.value = country.name;
          this.hideSearchResults();
          this.onCountrySelect?.(country);
        }
      });
      btn.addEventListener("mouseenter", () => {
        const country = this.getCountryBySlug(btn.dataset.countrySlug);
        this.onCountryHover?.(country);
      });
      btn.addEventListener("mouseleave", () => this.onCountryHover?.(null));
    });
  }

  hideSearchResults() {
    if (this.searchResultsEl) this.searchResultsEl.hidden = true;
  }

  updateSelectedPanel() {
    if (this.selectedEl) {
      this.selectedEl.innerHTML = this.renderSelectedPanel();
    }
    if (this.selection.country && this.searchInput) {
      this.searchInput.value = this.selection.country.name;
    } else if (this.searchInput && !this.selection.country) {
      this.searchInput.value = "";
    }
  }

  setSelection({ country = null, catchment = null, zoomLevel = 0 } = {}) {
    this.selection = {
      country: country || null,
      catchment: catchment || null,
      zoomLevel: zoomLevel ?? 0,
    };
    this.updateSelectedPanel();
  }

  setActiveCountry(slug) {
    if (!slug) {
      this.setSelection({ country: null, catchment: null, zoomLevel: 0 });
      return;
    }
    const country = this.getCountryBySlug(slug);
    if (country) {
      this.setSelection({
        country,
        catchment: this.selection.catchment,
        zoomLevel: this.selection.zoomLevel,
      });
    }
  }

  destroy() {
    document.removeEventListener("click", this._onDocClick);
  }
}
