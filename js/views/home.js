import { renderHero } from "../components/home-sections.js";
import {
  renderAfricaMapBand,
  bindAfricaCountrySelect,
  destroyAfricaCountryDrawer,
  renderOurWorkPrograms,
  bindOurWorkPrograms,
  renderHowPaWorks,
  bindHowPaWorks,
  renderPaIntro,
  renderPaWays,
  bindPaIntro,
  renderImpactDataBand,
  bindImpactCounters,
  renderStoriesBand,
  bindStoriesBand,
  renderKnowledgeNewsSplit,
  renderPartnerBanner,
} from "../components/home-design.js";
import {
  mountAfricaMapSection,
  ensureAfricaMapMounted,
  destroyHomeAfricaMap,
} from "../components/home-level1.js";
import { initLandingAnimations, destroyHomeAnimations } from "../components/home-animations.js";
import { learnedFromStories } from "../components/shared/pa-learning.js";
import { bindHomeWatchStory, closeVideoModal } from "../components/video-modal.js";
import { bindPartnerContact, closeContactModal } from "../components/contact-modal.js";

/**
 * The front door to PA — vision, scale, current activity and impact:
 * Hero → PA at a glance → How PA works (path + five programs) → Latest impact and updates →
 * Explore Africa (country tabs + interactive map) → Transformation stories → Featured knowledge → Partner
 */

let unbindWatchStory = null;
let unbindPartnerContact = null;

export function renderHome(data) {
  const home = data.home || {};

  return `
    <div class="home-page" data-level="1">
      <div class="home-hero-stack" data-home-scroll-stack>
        <div class="home-hero-stack__pin">${renderHero(home.hero)}</div>
      </div>
      ${renderPaIntro(home.intro, data.aboutPa)}
      ${renderHowPaWorks(home.howItWorks)}
      ${renderPaWays(home.intro)}
      ${renderOurWorkPrograms(home.ourWork)}
      ${renderImpactDataBand(home.impactData)}
      ${renderAfricaMapBand(home.africaBand, data.countries?.countries || [])}
      ${renderStoriesBand(home.storiesBand)}
      ${renderKnowledgeNewsSplit(home.knowledgeNews, learnedFromStories(data, { max: 170 })[0] || null)}
      ${renderPartnerBanner(home.partnerSupport)}
    </div>`;
}

export function mountHome(data) {
  requestAnimationFrame(() => {
    try {
      if (typeof unbindWatchStory === "function") unbindWatchStory();
      unbindWatchStory = bindHomeWatchStory(document);
      if (typeof unbindPartnerContact === "function") unbindPartnerContact();
      unbindPartnerContact = bindPartnerContact(document);
    } catch (err) {
      console.error("[mountHome] watch/partner bind failed:", err);
    }
    try {
      bindPaIntro(document);
      bindImpactCounters(document);
      bindAfricaCountrySelect(document, data);
      bindOurWorkPrograms(document);
      bindHowPaWorks(document);
      bindStoriesBand(document);
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
  destroyAfricaCountryDrawer();
  if (typeof unbindWatchStory === "function") {
    unbindWatchStory();
    unbindWatchStory = null;
  }
  if (typeof unbindPartnerContact === "function") {
    unbindPartnerContact();
    unbindPartnerContact = null;
  }
  closeVideoModal();
  closeContactModal();
}

export const renderLanding = renderHome;
export const teardownLanding = destroyHome;
