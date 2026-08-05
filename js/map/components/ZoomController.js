import { computeAfricaZoom, computeZoomToBBox } from "../utils/geo.js";

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class ZoomController {
  constructor({ camera, svg, container, heroSlot }) {
    this.camera = camera;
    this.svg = svg;
    this.container = container;
    this.heroSlot = heroSlot;
    this.scrollProgress = 0;
    this.manualOffset = { scale: 0, x: 0, y: 0 };
    this.state = { x: 0, y: 0, scale: 1 };
    this.locked = false;
    gsap.set(camera, { transformOrigin: "50% 50%" });
  }

  getHeroLayout() {
    const containerRect = this.container.getBoundingClientRect();
    const slot = this.heroSlot?.getBoundingClientRect();

    if (!slot || !containerRect.width) {
      return { x: 0, y: 0, scale: 0.55 };
    }

    const slotCenterX = slot.left + slot.width / 2 - containerRect.left;
    const slotCenterY = slot.top + slot.height / 2 - containerRect.top;
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    const scale = Math.min(slot.width / containerRect.width, slot.height / containerRect.height) * 1.35;

    return {
      x: slotCenterX - containerCenterX + (containerCenterX - slotCenterX) * (1 - scale),
      y: slotCenterY - containerCenterY + (containerCenterY - slotCenterY) * (1 - scale),
      scale: Math.max(0.45, scale),
    };
  }

  setScrollProgress(progress) {
    if (this.locked) return;
    this.scrollProgress = progress;
    this.apply();
  }

  apply() {
    const hero = this.getHeroLayout();
    const africa = computeAfricaZoom(this.svg, this.container, 1);
    const t = easeInOutCubic(Math.min(1, this.scrollProgress / 0.72));

    const x = hero.x + (africa.x - hero.x) * t + this.manualOffset.x;
    const y = hero.y + (africa.y - hero.y) * t + this.manualOffset.y;
    const scale = hero.scale + (africa.scale - hero.scale) * t + this.manualOffset.scale;

    this.state = { x, y, scale };
    gsap.set(this.camera, { x, y, scale });
  }

  zoomBy(delta) {
    if (this.locked) return;
    this.manualOffset.scale = Math.max(-2, Math.min(4, this.manualOffset.scale + delta));
    this.apply();
  }

  reset() {
    if (this.locked) return;
    this.manualOffset = { scale: 0, x: 0, y: 0 };
    this.apply();
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  zoomToCountry(pathEl, duration = 1.2) {
    this.lock();
    const bbox = pathEl.getBBox();
    const target = computeZoomToBBox(bbox, this.svg, this.container, 0.1);

    return gsap.to(this.camera, {
      x: target.x,
      y: target.y,
      scale: target.scale,
      duration,
      ease: "power3.inOut",
      onUpdate: () => {
        this.state = {
          x: gsap.getProperty(this.camera, "x"),
          y: gsap.getProperty(this.camera, "y"),
          scale: gsap.getProperty(this.camera, "scale"),
        };
      },
    });
  }

  getInteractiveThreshold() {
    return 0.48;
  }

  getInteractionProgress() {
    const threshold = this.getInteractiveThreshold();
    if (this.scrollProgress < threshold) return 0;
    return Math.min(1, (this.scrollProgress - threshold) / (1 - threshold));
  }

  isInteractive() {
    return this.getInteractionProgress() > 0.35;
  }

  isFullyInteractive() {
    return this.scrollProgress >= 0.62;
  }
}
