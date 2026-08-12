export class MapLegend {
  constructor(container, { mode = "default" } = {}) {
    this.container = container;
    this.mode = mode;
    this.render();
  }

  render() {
    if (this.mode === "choropleth") {
      this.container.innerHTML = `
        <div class="map-legend map-legend--choropleth" role="list" aria-label="Map legend">
          <span class="map-legend__nodata" role="listitem">
            <i class="legend-swatch legend-swatch--nodata" aria-hidden="true"></i> No data
          </span>
          <div class="map-legend__gradient-wrap" role="listitem">
            <div class="map-legend__gradient" aria-hidden="true"></div>
            <div class="map-legend__range">
              <span class="map-legend__min">0</span>
              <span class="map-legend__max">100</span>
            </div>
          </div>
        </div>`;
      this.minEl = this.container.querySelector(".map-legend__min");
      this.maxEl = this.container.querySelector(".map-legend__max");
      return;
    }

    this.container.innerHTML = `
      <div class="map-legend" role="list" aria-label="Map legend">
        <span role="listitem"><i class="legend-swatch legend-swatch--pa" aria-hidden="true"></i> PA network</span>
        <span role="listitem"><i class="legend-swatch legend-swatch--other" aria-hidden="true"></i> Context data</span>
        <span role="listitem"><i class="legend-swatch legend-swatch--active" aria-hidden="true"></i> Selected</span>
      </div>`;
  }

  setChoroplethRange(min, max, unit = "") {
    if (this.minEl) this.minEl.textContent = `${min}${unit === "percent" ? "%" : ""}`;
    if (this.maxEl) this.maxEl.textContent = `${max}${unit === "percent" ? "%" : ""}`;
  }

  setVisible(visible) {
    this.container.style.opacity = visible ? "1" : "0";
    this.container.style.pointerEvents = visible ? "auto" : "none";
  }
}
