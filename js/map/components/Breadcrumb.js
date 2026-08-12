export class Breadcrumb {
  constructor(container) {
    this.container = container;
    this.items = [{ label: "Africa", slug: null, level: "africa" }];
    this.render();
  }

  setItems(items) {
    this.items = items;
    this.render();
  }

  setCountry(country) {
    if (!country) {
      this.setItems([{ label: "Africa", slug: null, level: "africa" }]);
      return;
    }
    this.setItems([
      { label: "Africa", slug: null, level: "africa" },
      { label: country.countryName || country.name, slug: country.slug, level: "country" },
    ]);
  }

  render() {
    this.container.innerHTML = `
      <nav class="map-breadcrumb" aria-label="Map location">
        ${this.items
          .map((item, i) => {
            const isLast = i === this.items.length - 1;
            if (isLast) return `<span class="map-breadcrumb__current" aria-current="page">${item.label}</span>`;
            return `<button type="button" class="map-breadcrumb__link" data-crumb-level="${item.level || "africa"}" data-crumb-slug="${item.slug || ""}">${item.label}</button><span class="map-breadcrumb__sep" aria-hidden="true">/</span>`;
          })
          .join("")}
      </nav>`;

    this.container.querySelectorAll("[data-crumb-level]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const level = btn.dataset.crumbLevel;
        const slug = btn.dataset.crumbSlug;
        this.onCrumbClick?.(level, slug);
      });
    });
  }

  onAfricaReset(handler) {
    this.onCrumbClick = (level, slug) => {
      if (level === "africa") handler();
      else this.onLevelClick?.(level, slug);
    };
  }

  onNavigate(handler) {
    this.onLevelClick = handler;
  }
}
