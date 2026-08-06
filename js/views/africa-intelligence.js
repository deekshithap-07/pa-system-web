import {
  renderAfricaOverviewSections,
  mountAfricaOverviewCharts,
} from "../components/africa-overview/AfricaOverviewSections.js";
import {
  initAfricaIntelligenceMap,
  destroyAfricaIntelligenceMap,
} from "../map/africa-intelligence.js";

export function renderAfricaIntelligence(data) {
  return `
    <div class="africa-intelligence-page africa-intelligence-page--scroll" data-africa-intelligence>
      ${renderAfricaOverviewSections(data)}
      <div class="ao-map-host" id="africa-intelligence-root" aria-label="Africa Intelligence Map"></div>
    </div>`;
}

export function mountAfricaIntelligence(data, navigate) {
  const page = document.querySelector("[data-africa-intelligence]");
  if (!page) return;

  initAfricaIntelligenceMap({
    countries: data.countries,
    mapPaths: data.mapPaths,
    mapOverlay: data.home?.mapOverlay || {},
    mapMetrics: data.mapMetrics,
    config: { ...data.africaIntelligence, hideSidebar: true, pageLayout: true },
    catchments: data.catchments,
    communities: data.communities,
    countryHubs: data.countryHubs,
    geoLocations: data.geoLocations,
  });

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    ScrollTrigger?.refresh?.();
  });

  mountAfricaOverviewCharts(page, data);

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
  destroyAfricaIntelligenceMap();
}
