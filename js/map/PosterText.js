/**
 * Poster typography overlay for the Africa map.
 */
import { formatCoordinates } from "./africa-map-surface.js";

export class PosterText {
  constructor(root, { textColor = "#D6B352", landColor = "#0A1628" } = {}) {
    this.root = root;
    this.textColor = textColor;
    this.landColor = landColor;
    this.el = null;
  }

  mount() {
    this.el = document.createElement("div");
    this.el.className = "tk-poster-overlay";
    this.el.style.color = this.textColor;
    this.el.innerHTML = `
      <p class="tk-poster-city" data-city>AFRICA</p>
      <hr class="tk-poster-divider" />
      <p class="tk-poster-country" data-country>PA NETWORK</p>
      <p class="tk-poster-coords" data-coords></p>
      <span class="tk-poster-attribution-osm">Imagery © Esri · Map © OpenStreetMap</span>`;
    this.root.appendChild(this.el);
    this.cityEl = this.el.querySelector("[data-city]");
    this.countryEl = this.el.querySelector("[data-country]");
    this.coordsEl = this.el.querySelector("[data-coords]");
  }

  set({ title, subtitle, lat, lon, drilldown = false, community = false }) {
    if (!this.el) return;
    if (this.cityEl) this.cityEl.textContent = (title || "AFRICA").toUpperCase();
    if (this.countryEl) this.countryEl.textContent = (subtitle || "").toUpperCase();
    if (this.coordsEl && lat != null && lon != null) {
      this.coordsEl.textContent = formatCoordinates(lat, lon);
    }
    this.el.classList.add("is-visible");
    this.el.classList.toggle("is-drilldown", drilldown && !community);
    this.el.classList.toggle("is-community", community);
  }

  reset() {
    this.set({
      title: "Africa",
      subtitle: "Possibilities Africa",
      lat: 3,
      lon: 18,
      drilldown: false,
    });
  }

  destroy() {
    this.el?.remove();
    this.el = null;
  }
}
