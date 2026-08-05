import { renderHero, renderImpactOverview } from "../components/home-sections.js";
import { renderNetworkFlow } from "../components/pa-network-flow.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";

export function renderHome(data) {
  const home = data.home;
  const networkFlow = renderNetworkFlow(home.networkFlow || {});

  return `
    <div class="home-page">
      ${renderHero(home.hero)}
      ${networkFlow}
      ${renderImpactOverview(home.impactOverview)}
    </div>`;
}

export function mountHome() {
  requestAnimationFrame(() => {
    initLandingAnimations();
    ScrollTrigger.refresh();
  });
}

export function destroyHome() {
  destroyHomeAnimations();
}

export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
