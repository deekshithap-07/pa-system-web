import { bindWbPageHero } from "../components/shared/wb-page-hero.js";
import { renderOurWorkPage, initOurWorkAnimations } from "../components/work/our-work-page.js";

/** Legacy child routes redirect to hub anchors on #/work */
export const WORK_SECTION_REDIRECTS = {
  journey: "#/work#work-journey",
  leadership: "#/work#work-leadership",
  projects: "#/work#work-projects",
  places: "#/work",
};

export function renderWhatWeDo(data) {
  return renderOurWorkPage(data.ourWork || {}, data.ministryModel || {});
}

export function mountWhatWeDo(root) {
  const page = root?.querySelector?.("[data-what-we-do]") || document.querySelector("[data-what-we-do]");
  if (page) bindWbPageHero(page);
  requestAnimationFrame(() => {
    try {
      initOurWorkAnimations(root || document);
    } catch (err) {
      console.error("[mountWhatWeDo] animations failed:", err);
    }
  });
}

export function destroyWhatWeDo() {}
