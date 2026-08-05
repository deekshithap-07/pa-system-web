/**
 * Smooth wheel zoom toward cursor — charity:water-style continuous zoom.
 * Does not scroll the page.
 */
export class MapWheelController {
  constructor(canvasEl, { getViewState, applyView, onScaleChange, minScale = 0.85, maxScale = 8 }) {
    this.canvas = canvasEl;
    this.getViewState = getViewState;
    this.applyView = applyView;
    this.onScaleChange = onScaleChange;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.targetView = null;
    this._rafId = null;
    this._onWheel = this.handleWheel.bind(this);
    canvasEl.addEventListener("wheel", this._onWheel, { passive: false });
  }

  syncTarget(view) {
    if (view) this.targetView = { ...view };
    else this.targetView = null;
    this.stopTick();
  }

  handleWheel(e) {
    e.preventDefault();
    e.stopPropagation();

    const state = this.targetView || this.getViewState();
    if (!state) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    else if (e.deltaMode === 2) delta *= 120;

    const sensitivity = 0.00032;
    const factor = Math.exp(-delta * sensitivity);
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, state.scale * factor));

    if (Math.abs(newScale - state.scale) < 0.0001) return;

    const ratio = newScale / state.scale;
    const x = mx - (mx - state.x) * ratio;
    const y = my - (my - state.y) * ratio;

    this.targetView = { x, y, scale: newScale };
    this.startTick();
  }

  startTick() {
    if (this._rafId) return;

    const tick = () => {
      const current = this.getViewState();
      const target = this.targetView;
      if (!current || !target) {
        this._rafId = null;
        return;
      }

      const lerp = 0.28;
      const next = {
        x: current.x + (target.x - current.x) * lerp,
        y: current.y + (target.y - current.y) * lerp,
        scale: current.scale + (target.scale - current.scale) * lerp,
      };

      const prevScale = current.scale;
      this.applyView(next, false);
      this.onScaleChange?.(next.scale, prevScale);

      const settled =
        Math.hypot(target.x - next.x, target.y - next.y) < 0.35 &&
        Math.abs(target.scale - next.scale) < 0.0008;

      if (settled) {
        const finalPrev = next.scale;
        this.applyView(target, false);
        this.onScaleChange?.(target.scale, finalPrev);
        this._rafId = null;
        return;
      }

      this._rafId = requestAnimationFrame(tick);
    };

    this._rafId = requestAnimationFrame(tick);
  }

  stopTick() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  setScaleBounds(min, max) {
    this.minScale = min;
    this.maxScale = max;
  }

  destroy() {
    this.stopTick();
    this.canvas?.removeEventListener("wheel", this._onWheel);
  }
}
