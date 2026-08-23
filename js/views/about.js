import { renderAtlasAboutPage } from "../components/about/atlas-about-page.js";
import { initAboutAtlasAnimations, destroyAboutAtlasAnimations } from "../components/about/atlas-about-animations.js";
import { renderPaWebsiteIntro } from "../components/home-sections.js";
import { bindWbPageHero } from "../components/shared/wb-page-hero.js";

export function renderAbout(data, section = "overview") {
  const paIntro = renderPaWebsiteIntro(data.home?.paWebsiteIntro);
  return renderAtlasAboutPage(data.ministryModel, paIntro, section, data.scorecard);
}

export function mountAbout() {
  requestAnimationFrame(() => {
    const page = document.querySelector("[data-about-atlas]");
    initAboutAtlasAnimations();
    if (page) bindWbPageHero(page);
    page?.querySelectorAll("[data-anchor]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href?.startsWith("#") && href.length > 1 && !href.startsWith("#/")) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });

    ScrollTrigger?.refresh?.();
  });
}

export function destroyAbout() {
  destroyAboutAtlasAnimations();
}
