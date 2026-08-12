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
    this.renderEmpty();
  }

  getHubLink(type, data) {
    if (type === "country") {
      return `<a href="#/country/${data.slug}" class="ai-map__hub-link" data-link>Explore ${data.countryName || data.name} hub →</a>`;
    }
    if (type === "catchment") {
      return `<a href="#/catchment/${data.countrySlug}/${data.slug}" class="ai-map__hub-link" data-link>${data.name} — explore communities →</a>`;
    }
    return "";
  }
}
