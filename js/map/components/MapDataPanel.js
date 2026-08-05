/**
 * World Bank Data360–style left panel: PA network countries with live map sync.
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
    this.activeSlug = null;
    this.hoveredSlug = null;
    this.render();
  }

  getSortedCountries() {
    const bySlug = Object.fromEntries(this.countries.map((c) => [c.slug, c]));
    return PA_ORDER.map((slug) => bySlug[slug]).filter(Boolean);
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

  renderCountryItem(country) {
    const stats = this.getCountryStats(country);
    const isActive = this.activeSlug === country.slug;
    const isHovered = this.hoveredSlug === country.slug;
    const poverty =
      stats.povertyRate != null
        ? `${stats.povertyRate}% poverty (${stats.dataYear || "2023"})`
        : "Poverty data unavailable";

    return `<li>
      <button type="button"
        class="ai-panel__country ${isActive ? "is-active" : ""} ${isHovered ? "is-hovered" : ""}"
        data-country-slug="${country.slug}"
        aria-pressed="${isActive}">
        <span class="ai-panel__country-head">
          <span class="ai-panel__country-name">${country.name}</span>
          <span class="ai-panel__status ai-panel__status--${statusKey(country.status)}">${country.status || "Network"}</span>
        </span>
        <p class="ai-panel__country-poverty">${poverty}</p>
        <div class="ai-panel__kpi-grid ai-panel__kpi-grid--inline">
          <div class="ai-panel__kpi">
            <span class="ai-panel__kpi-val">${stats.catchments}</span>
            <span class="ai-panel__kpi-lbl">Catchments</span>
          </div>
          <div class="ai-panel__kpi">
            <span class="ai-panel__kpi-val">${stats.communities}</span>
            <span class="ai-panel__kpi-lbl">Communities</span>
          </div>
          <div class="ai-panel__kpi">
            <span class="ai-panel__kpi-val">${stats.pastors.toLocaleString()}</span>
            <span class="ai-panel__kpi-lbl">Pastors</span>
          </div>
          <div class="ai-panel__kpi">
            <span class="ai-panel__kpi-val">+${stats.growth}%</span>
            <span class="ai-panel__kpi-lbl">Growth</span>
          </div>
        </div>
      </button>
    </li>`;
  }

  render() {
    const list = this.getSortedCountries();

    this.container.innerHTML = `
      <div class="ai-panel">
        <div class="ai-panel__head">
          <p class="ai-panel__eyebrow">${this.config.sidebarEyebrow || "PA Network"}</p>
          <h2 class="ai-panel__title">${this.config.sidebarTitle || "Countries"}</h2>
          <p class="ai-panel__subtitle">${this.config.sidebarSubtitle || "Click or scroll to explore transformation data"}</p>
        </div>
        <div class="ai-panel__search">
          <input type="search" placeholder="Search countries" aria-label="Search countries" id="ai-panel-search">
        </div>
        <nav class="ai-panel__countries" aria-label="PA network countries">
          <ul>${list.map((c) => this.renderCountryItem(c)).join("")}</ul>
        </nav>
      </div>`;

    this.container.querySelectorAll("[data-country-slug]").forEach((btn) => {
      const slug = btn.dataset.countrySlug;
      btn.addEventListener("click", () => {
        const country = list.find((c) => c.slug === slug);
        if (country) this.onCountrySelect?.(country);
      });
      btn.addEventListener("mouseenter", () => {
        this.hoveredSlug = slug;
        this.onCountryHover?.(list.find((c) => c.slug === slug) || null);
        this.updateListState();
      });
      btn.addEventListener("mouseleave", () => {
        if (this.hoveredSlug === slug) {
          this.hoveredSlug = null;
          this.onCountryHover?.(null);
          this.updateListState();
        }
      });
    });

    this.container.querySelector("#ai-panel-search")?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      this.container.querySelectorAll("[data-country-slug]").forEach((btn) => {
        btn.closest("li").style.display = btn.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }

  updateListState() {
    this.container.querySelectorAll("[data-country-slug]").forEach((btn) => {
      const slug = btn.dataset.countrySlug;
      btn.classList.toggle("is-active", slug === this.activeSlug);
      btn.classList.toggle("is-hovered", slug === this.hoveredSlug);
      btn.setAttribute("aria-pressed", slug === this.activeSlug ? "true" : "false");
    });
  }

  setActiveCountry(slug) {
    this.activeSlug = slug || null;
    if (!slug) this.hoveredSlug = null;
    this.updateListState();
  }
}
