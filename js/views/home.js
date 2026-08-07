import { renderHero, renderImpactOverview, bindHeroNewsletter } from "../components/home-sections.js";
import {
  renderWhatIsHappeningAcrossAfrica,
  renderAfricaMapSection,
  mountAfricaMapSection,
  destroyHomeAfricaMap,
} from "../components/home-level1.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";

export function renderHome(data) {
  const home = data.home;
  const level1 = home.level1 || {};

  return `
    <div class="home-page" data-level="1">
      ${renderHero(home.hero)}
      ${renderImpactOverview(home.impactOverview)}
      ${renderWhatIsHappeningAcrossAfrica(data, level1.whatsHappening)}
      ${renderAfricaMapSection(level1.africaMap)}
    </div>`;
}

export function mountHome(data) {
  requestAnimationFrame(() => {
    initLandingAnimations();
    bindHeroNewsletter();
    mountAfricaMapSection(data);
    ScrollTrigger.refresh();
  });
}

export function destroyHome() {
  destroyHomeAnimations();
  destroyHomeAfricaMap();
}
export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
