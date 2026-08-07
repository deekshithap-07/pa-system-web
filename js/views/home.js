import { renderHero, renderImpactOverview, bindHeroNewsletter } from "../components/home-sections.js";
import {
  renderKeyUpdates,
  renderGrowthTrends,
  renderHomeAfricaMap,
  mountHomeGrowthCharts,
  mountHomeAfricaMap,
  destroyHomeAfricaMap,
} from "../components/home-level1.js";
import { renderHomeStoriesSection, bindHomeStoriesSection } from "../components/home-stories-section.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";

let storiesController = null;

export function renderHome(data) {
  const home = data.home;
  const level1 = home.level1 || {};

  return `
    <div class="home-page" data-level="1">
      ${renderHero(home.hero, data)}
      ${renderImpactOverview(home.impactOverview)}
      ${renderKeyUpdates(data, level1.keyUpdates)}
      ${renderGrowthTrends(data, level1.growthTrends)}
      ${renderHomeAfricaMap(level1.africaMap)}
      ${renderHomeStoriesSection(data, home.storiesSection)}
    </div>`;
}

export function mountHome(data) {
  requestAnimationFrame(() => {
    initLandingAnimations();
    bindHeroNewsletter();
    mountHomeGrowthCharts(document, data);
    mountHomeAfricaMap(data);
    storiesController?.destroy?.();
    storiesController = bindHomeStoriesSection(document, data);
    ScrollTrigger.refresh();
  });
}

export function destroyHome() {
  destroyHomeAnimations();
  destroyHomeAfricaMap();
  storiesController?.destroy?.();
  storiesController = null;
}

export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
