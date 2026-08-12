import { formatNumber } from "../../utils/format.js";

export class CountryTooltip {
  constructor(rootId = "map-tooltip") {
    this.el = document.getElementById(rootId);
  }

  render(country) {
    const progress = country.progress ?? 0;
    return `
      <div class="map-tooltip__name">${country.countryName || country.name}</div>
      ${country.isPaNetwork ? '<span class="map-tooltip__badge">PA Network</span>' : ""}
      <dl>
        <div class="map-tooltip__row"><dt>Communities</dt><dd>${country.communities ?? 0}</dd></div>
        <div class="map-tooltip__row"><dt>Households</dt><dd>${formatNumber(country.households ?? 0)}</dd></div>
        <div class="map-tooltip__row"><dt>Projects</dt><dd>${country.projects ?? 0}</dd></div>
      </dl>
      <div class="map-tooltip__progress">
        <div class="map-tooltip__progress-label">
          <span>Progress</span><span>${progress}%</span>
        </div>
        <div class="map-tooltip__progress-bar"><span style="width:${progress}%"></span></div>
      </div>
      <p class="map-tooltip__hint">Click or scroll to zoom in</p>`;
  }

  show(country, x, y) {
    if (!this.el) return;
    this.el.innerHTML = this.render(country);
    this.position(x, y);
    this.el.classList.add("is-visible");
  }

  position(x, y) {
    if (!this.el) return;
    const pad = 16;
    const rect = this.el.getBoundingClientRect();
    let left = x + 14;
    let top = y + 14;
    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - 14;
    if (top + rect.height > window.innerHeight - pad) top = y - rect.height - 14;
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  hide() {
    this.el?.classList.remove("is-visible");
  }
}
