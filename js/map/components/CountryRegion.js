/** World Bank–style blue choropleth ramp */
const CHOROPLETH_COLORS = [
  "#f7fbff",
  "#deebf7",
  "#c6dbef",
  "#9ecae1",
  "#6baed6",
  "#4292c6",
  "#2171b5",
  "#08519c",
  "#08306b",
];

const NO_DATA_FILL = "#d4dce6";
const CONTEXT_FILL = "#dce3eb";
const CONTEXT_STROKE = "#8fa3b8";

export class CountryRegion {
  constructor(country, parentEl) {
    this.country = country;
    this.pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.pathEl.setAttribute("d", country.path);
    this.pathEl.setAttribute("data-slug", country.slug);
    this.pathEl.setAttribute("data-iso", country.isoCode);
    this.pathEl.setAttribute("stroke", country.isPaNetwork ? "#ffffff" : CONTEXT_STROKE);
    this.pathEl.setAttribute("stroke-width", country.isPaNetwork ? "0.7" : "0.9");
    this.pathEl.setAttribute("stroke-linejoin", "round");
    this.pathEl.setAttribute("stroke-linecap", "round");
    this.pathEl.setAttribute("role", "button");
    this.pathEl.setAttribute("tabindex", "-1");
    this.pathEl.setAttribute("aria-label", country.countryName || country.name);
    this.pathEl.classList.add("country-path");
    if (country.isPaNetwork) this.pathEl.classList.add("is-pa");
    else this.pathEl.style.fill = CONTEXT_FILL;
    parentEl.appendChild(this.pathEl);
  }

  setInteractive(enabled) {
    this.pathEl.classList.toggle("is-interactive", enabled);
    this.pathEl.setAttribute("tabindex", enabled ? "0" : "-1");
  }

  setHovered(on) {
    this.pathEl.classList.toggle("is-hovered", on);
  }

  setSelected(on) {
    this.pathEl.classList.toggle("is-selected", on);
  }

  setDimmed(on) {
    this.pathEl.classList.toggle("is-dimmed", on);
  }

  setHidden(on) {
    this.pathEl.classList.toggle("is-hidden", on);
    if (on) {
      this.pathEl.setAttribute("aria-hidden", "true");
      this.pathEl.setAttribute("tabindex", "-1");
    } else {
      this.pathEl.removeAttribute("aria-hidden");
    }
  }

  setChoropleth(intensity) {
    this.pathEl.classList.toggle("has-choropleth", intensity > 0);
    if (intensity <= 0) {
      this.pathEl.style.fill = this.pathEl.classList.contains("is-pa") ? CHOROPLETH_COLORS[1] : CONTEXT_FILL;
      return;
    }
    const idx = Math.min(CHOROPLETH_COLORS.length - 1, Math.max(1, Math.round(intensity * (CHOROPLETH_COLORS.length - 1))));
    this.pathEl.style.fill = CHOROPLETH_COLORS[idx];
  }

  getBBox() {
    return this.pathEl.getBBox();
  }

  on(event, handler) {
    this.pathEl.addEventListener(event, handler);
  }
}

export function createCountryRegions(countries, parentEl) {
  return countries.map((c) => new CountryRegion(c, parentEl));
}
