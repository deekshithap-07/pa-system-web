/**
 * Slide-in community fact sheet overlay for map pin interactions.
 */
import {
  buildCommunityFactSheetContext,
  renderCommunityFactSheetHTML,
} from "../utils/community-factsheet.js";

export class CommunityFactSheet {
  constructor(host, { charts, countryHubs } = {}) {
    this.host = host;
    this.charts = charts;
    this.countryHubs = countryHubs;
    this.el = null;
    this._onClose = null;
  }

  mount() {
    if (!this.host || this.el) return;
    this.el = document.createElement("div");
    this.el.className = "map-factsheet";
    this.el.setAttribute("aria-hidden", "true");
    this.host.appendChild(this.el);

    this.el.addEventListener("click", (e) => {
      if (e.target === this.el) this.hide();
    });
  }

  show({ community, country, catchment }) {
    if (!this.el) this.mount();
    if (!this.el || !community || !country || !catchment) return;

    const ctx = buildCommunityFactSheetContext({
      community,
      country,
      catchment,
      charts: this.charts,
      countryHubs: this.countryHubs,
    });

    this.el.innerHTML = renderCommunityFactSheetHTML(ctx);
    this.el.classList.add("is-open");
    this.el.setAttribute("aria-hidden", "false");
    this.host?.classList.add("tk-factsheet-open");

    const closeBtn = this.el.querySelector(".map-factsheet__close");
    closeBtn?.addEventListener("click", () => this.hide());
  }

  hide() {
    if (!this.el) return;
    this.el.classList.remove("is-open");
    this.el.setAttribute("aria-hidden", "true");
    this.host?.classList.remove("tk-factsheet-open");
    this.el.innerHTML = "";
    this._onClose?.();
    this._onClose = null;
  }

  isOpen() {
    return this.el?.classList.contains("is-open");
  }

  destroy() {
    this.hide();
    this.el?.remove();
    this.el = null;
  }
}
