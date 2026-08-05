/**
 * Bottom-centre hub link on the map canvas (non-blocking).
 */
export class MapSelectionOverlay {
  constructor(container) {
    this.container = container;
    this.selection = null;
    this.renderEmpty();
  }

  renderEmpty() {
    this.container.innerHTML = "";
    this.container.classList.remove("is-visible");
  }

  setSelection(selection) {
    this.selection = selection;
    if (!selection) {
      this.renderEmpty();
      return;
    }
    const link = this.getHubLink(selection.type, selection.data);
    this.container.innerHTML = link || "";
    this.container.classList.toggle("is-visible", !!link);
  }

  getHubLink(type, data) {
    if (type === "country") {
      return `<a href="#/country/${data.slug}" class="ai-map__hub-link" data-link>Explore ${data.countryName || data.name} Hub →</a>`;
    }
    if (type === "catchment") {
      return `<a href="#/catchment/${data.countrySlug}/${data.slug}" class="ai-map__hub-link" data-link>Explore ${data.name} Catchment Hub →</a>`;
    }
    if (type === "community") {
      const country = data.countrySlug || "";
      const catchment = data.catchmentSlug || "";
      return `<a href="#/community/${country}/${catchment}/${data.slug}" class="ai-map__hub-link" data-link>View ${data.name} Dashboard →</a>`;
    }
    return "";
  }
}
