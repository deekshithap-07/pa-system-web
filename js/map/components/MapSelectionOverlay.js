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
    if (!selection?.type || !selection?.data) {
      this.renderEmpty();
      return;
    }
    this.render(selection);
  }

  render({ type, data }) {
    const title = data.name || data.countryName || data.title || "";
    const hubLink = this.getHubLink(type, data);
    this.container.innerHTML = `
      <a href="#" class="ai-map__overlay-chip" data-overlay-type="${type}">
        <span class="ai-map__overlay-chip__dot"></span>
        <span class="ai-map__overlay-chip__label">${title}</span>
      </a>${hubLink}`;
    this.container.classList.add("is-visible");
  }

  getHubLink(type, data) {
    if (type === "country") {
      return `<a href="#/country/${data.slug}" class="ai-map__hub-link" data-link>Explore ${data.countryName || data.name} hub →</a>`;
    }
    if (type === "catchment") {
      return `<a href="#/catchment/${data.countrySlug}/${data.slug}" class="ai-map__hub-link" data-link>${data.name} — explore communities →</a>`;
    }
    if (type === "community") {
      return `<a href="#/community/${data.countrySlug}/${data.catchmentSlug}/${data.slug}" class="ai-map__hub-link" data-link>${data.name} — view community hub →</a>`;
    }
    return "";
  }
}
