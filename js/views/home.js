import { renderHero } from "../components/home-sections.js";
import {
  renderAfricaExploreBand,
  bindAfricaCountrySelect,
  renderOurWorkPrograms,
  bindOurWorkPrograms,
  renderImpactDataBand,
  renderStoriesBand,
  renderKnowledgeNewsSplit,
  renderPartnerBanner,
} from "../components/home-design.js";
import {
  mountAfricaMapSection,
  ensureAfricaMapMounted,
  destroyHomeAfricaMap,
} from "../components/home-level1.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";

/**
 * Order from PA Website Designs mockup (+ vision as reference):
 * Hero → PA Across Africa (map) → Our Work → Impact & Data →
 * Stories → Knowledge / News → Partner
 * Interactive map mount/root unchanged.
 */
export function renderHome(data) {
  const home = data.home || {};

  return `
    <div class="home-page" data-level="1">
      <div class="home-hero-stack" data-home-scroll-stack>
        <div class="home-hero-stack__pin">${renderHero(home.hero)}</div>
      </div>
      ${renderAfricaExploreBand(home.africaBand, home.level1?.africaMap)}
      ${renderOurWorkPrograms(home.ourWork)}
      ${renderImpactDataBand(home.impactData)}
      ${renderStoriesBand(home.storiesBand)}
      ${renderKnowledgeNewsSplit(home.knowledgeNews)}
      ${renderPartnerBanner(home.partnerSupport)}
    </div>`;
}

export function mountHome(data) {
  requestAnimationFrame(() => {
    try {
      bindAfricaCountrySelect();
      bindOurWorkPrograms(document, data.home?.ourWork || {});
    } catch (err) {
      console.error("[mountHome] country select bind failed:", err);
    }
    try {
      mountAfricaMapSection(data);
    } catch (err) {
      console.error("[mountHome] map mount failed:", err);
    }
    try {
      // Wait one frame so section layout/heights exist before ScrollTrigger measures
      requestAnimationFrame(() => {
        try {
          initLandingAnimations();
        } catch (err) {
          console.error("[mountHome] animations failed:", err);
        }
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        ensureAfricaMapMounted(data);
      });
    } catch (err) {
      console.error("[mountHome] animation schedule failed:", err);
    }
  });
}

export function destroyHome() {
  destroyHomeAnimations();
  destroyHomeAfricaMap();
}

export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
