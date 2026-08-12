/**
 * Cinematic navigation from map country selection to Country Hub.
 * Keeps the map visible during transition for continuity.
 */
export class NavigationTransition {
  constructor({ overlayId = "transition-overlay" } = {}) {
    this.overlay = document.getElementById(overlayId);
  }

  async toCountryHub({ camera, onNavigate }) {
    onNavigate?.();
    document.body.classList.add("map-navigating");

    try {
      if (camera) {
        gsap.to(camera, { filter: "brightness(1.05)", duration: 0.3, ease: "power2.out" });
      }

      if (this.overlay) {
        this.overlay.classList.add("is-active", "is-map");
        await gsap.to(this.overlay, { opacity: 0.35, duration: 0.35, ease: "power2.inOut" });
        await gsap.to(this.overlay, { opacity: 0, duration: 0.45, ease: "power2.inOut" });
        this.overlay.classList.remove("is-active", "is-map");
      }
    } finally {
      document.body.classList.remove("map-navigating");
      window.scrollTo(0, 0);
    }
  }
}
