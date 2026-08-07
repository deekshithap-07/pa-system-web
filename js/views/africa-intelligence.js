import {
  renderAfricaOverviewSections,
  mountAfricaOverviewCharts,
} from "../components/africa-overview/AfricaOverviewSections.js";

export function renderAfricaIntelligence(data) {
  return `
    <div class="africa-intelligence-page africa-intelligence-page--scroll" data-africa-intelligence>
      <div class="container ao-back-wrap" data-reveal-section>
        <a href="#/#home-africa-map" class="ao-back-btn" data-link>← Back to interactive map</a>
      </div>
      ${renderAfricaOverviewSections(data)}
    </div>`;
}

export function mountAfricaIntelligence(data) {
  const page = document.querySelector("[data-africa-intelligence]");
  if (!page) return;

  mountAfricaOverviewCharts(page, data);

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    ScrollTrigger?.refresh?.();
  });

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    page.querySelectorAll("[data-reveal-section]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => gsap.from(el, { opacity: 0, y: 20, duration: 0.55, ease: "power2.out" }),
      });
    });
    ScrollTrigger.refresh();
  }
}

export function destroyAfricaIntelligence() {
  /* Map lives on homepage only — nothing to tear down here. */
}
