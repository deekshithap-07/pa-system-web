import {
  renderHero,
  renderHomeSiteOverview,
  renderImpactOverview,
  renderHomeKnowledgeBand,
  renderHomeSiteSpotlight,
  renderWbNewsletter,
  bindHeroNewsletter,
  bindHomeExplorer,
  destroyHomeExplorer,
} from "../components/home-sections.js";
import {
  renderAfricaMapSection,
  mountAfricaMapSection,
  ensureAfricaMapMounted,
  destroyHomeAfricaMap,
} from "../components/home-level1.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";

export function renderHome(data) {
  const home = data.home;
  const level1 = home.level1 || {};

  return `
    <div class="home-page" data-level="1">
      <div class="home-hero-stack" data-home-scroll-stack>
        <div class="home-hero-stack__pin">${renderHero(home.hero)}</div>
        ${renderHomeSiteOverview(home.siteOverview)}
      </div>
      ${renderImpactOverview(home.impactOverview)}
      ${renderAfricaMapSection(level1.africaMap)}
      ${renderHomeSiteSpotlight(home.siteSpotlight)}
      ${renderHomeKnowledgeBand(home.knowledgeBand)}
      ${renderWbNewsletter()}
    </div>`;
}

export function mountHome(data) {
  requestAnimationFrame(() => {
    try {
      bindHeroNewsletter();
    } catch (err) {
      console.error("[mountHome] newsletter bind failed:", err);
    }
    try {
      mountAfricaMapSection(data);
    } catch (err) {
      console.error("[mountHome] map mount failed:", err);
    }
    try {
      bindHomeExplorer();
    } catch (err) {
      console.error("[mountHome] site overview bind failed:", err);
    }
    try {
      initLandingAnimations();
    } catch (err) {
      console.error("[mountHome] animations failed:", err);
    }
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    requestAnimationFrame(() => ensureAfricaMapMounted(data));
  });
}

export function destroyHome() {
  destroyHomeExplorer();
  destroyHomeAnimations();
  destroyHomeAfricaMap();
}

export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
