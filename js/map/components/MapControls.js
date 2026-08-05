export class MapControls {
  constructor(container, { onZoomIn, onZoomOut, onReset }) {
    this.container = container;
    this.onZoomIn = onZoomIn;
    this.onZoomOut = onZoomOut;
    this.onReset = onReset;
    this.render();
    this.bind();
  }

  render() {
    this.container.innerHTML = `
      <div class="map-controls" role="group" aria-label="Map zoom controls">
        <button type="button" class="map-controls__btn" data-zoom="in" aria-label="Zoom in">+</button>
        <button type="button" class="map-controls__btn" data-zoom="out" aria-label="Zoom out">−</button>
        <button type="button" class="map-controls__btn map-controls__btn--reset" data-zoom="reset" aria-label="Reset view">⟲</button>
      </div>`;
  }

  bind() {
    this.container.querySelector('[data-zoom="in"]')?.addEventListener("click", () => this.onZoomIn?.());
    this.container.querySelector('[data-zoom="out"]')?.addEventListener("click", () => this.onZoomOut?.());
    this.container.querySelector('[data-zoom="reset"]')?.addEventListener("click", () => this.onReset?.());
  }

  setVisible(visible) {
    this.container.style.opacity = visible ? "1" : "0";
    this.container.style.pointerEvents = visible ? "auto" : "none";
  }
}
