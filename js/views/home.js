import { renderHero } from "../components/home-sections.js";
import {
  renderAfricaExploreBand,
  bindAfricaCountrySelect,
  destroyAfricaCountryDrawer,
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
import { bindHomeWatchStory, closeVideoModal } from "../components/video-modal.js";
import { bindPartnerContact, closeContactModal } from "../components/contact-modal.js";

/**
 * Order from PA Website Designs mockup (+ vision as reference):
 * Hero → PA Across Africa (map) → Our Work → Impact & Data →
 * Stories → Knowledge / News → Partner
 * Interactive map mount/root unchanged.
 */

let unbindWatchStory = null;
let unbindPartnerContact = null;

export function renderHome(data) {
  const home = data.home || {};
  const paCountries = data.countries?.countries || [];

  return `
    <div class="home-page" data-level="1">
      <div class="home-hero-stack" data-home-scroll-stack>
        <div class="home-hero-stack__pin">${renderHero(home.hero)}</div>
      </div>
      ${renderAfricaExploreBand(home.africaBand, home.level1?.africaMap, paCountries)}
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
      if (typeof unbindWatchStory === "function") unbindWatchStory();
      unbindWatchStory = bindHomeWatchStory(document);
      if (typeof unbindPartnerContact === "function") unbindPartnerContact();
      unbindPartnerContact = bindPartnerContact(document);
    } catch (err) {
      console.error("[mountHome] watch/partner bind failed:", err);
    }
    try {
      bindAfricaCountrySelect(document, data);
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
