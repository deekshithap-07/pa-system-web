/**
 * Smooth wheel zoom via SVG viewBox — keeps labels crisp (no CSS scale blur).
 */
import { wheelZoomViewBox, clampViewBoxWidth } from "../utils/geo.js";

export class MapWheelController {
  constructor(canvasEl, { getViewState, applyView, onZoomChange, minWidth, maxWidth }) {
    this.canvas = canvasEl;
    this.getViewState = getViewState;
    this.applyView = applyView;
    this.onZoomChange = onZoomChange;
    this.minWidth = minWidth ?? 40;
    this.maxWidth = maxWidth ?? 2000;
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
    if (!state?.width) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    else if (e.deltaMode === 2) delta *= 120;

    const sensitivity = 0.00085;
    const factor = Math.exp(-delta * sensitivity);

    let next = wheelZoomViewBox(state, mx, my, rect.width, rect.height, factor);
    next = clampViewBoxWidth(next, this.minWidth, this.maxWidth);

    if (Math.abs(next.width - state.width) < 0.01) return;

    this.targetView = next;
    this.startTick();
  }

  startTick() {
    if (this._rafId) return;

    const tick = () => {
      const current = this.getViewState();
      const target = this.targetView;
      if (!current?.width || !target?.width) {
        this._rafId = null;
        return;
      }

      const lerp = 0.28;
      const next = {
        x: current.x + (target.x - current.x) * lerp,
        y: current.y + (target.y - current.y) * lerp,
        width: current.width + (target.width - current.width) * lerp,
        height: current.height + (target.height - current.height) * lerp,
      };

      this.applyView(next, false);
      this.onZoomChange?.();

      const settled =
        Math.hypot(target.x - next.x, target.y - next.y) < 0.2 &&
        Math.abs(target.width - next.width) < 0.15;

      if (settled) {
        this.applyView(target, false);
        this.onZoomChange?.();
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

  setWidthBounds(minWidth, maxWidth) {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
  }

  destroy() {
    this.stopTick();
    this.canvas?.removeEventListener("wheel", this._onWheel);
  }
}
