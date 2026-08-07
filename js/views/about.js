import { renderAtlasAboutPage } from "../components/about/atlas-about-page.js";
import { initAboutAtlasAnimations, destroyAboutAtlasAnimations } from "../components/about/atlas-about-animations.js";
import { renderPaWebsiteIntro } from "../components/home-sections.js";

export function renderAbout(data) {
  const paIntro = renderPaWebsiteIntro(data.home?.paWebsiteIntro);
  return renderAtlasAboutPage(data.ministryModel, paIntro);
}

export function mountAbout() {
  requestAnimationFrame(() => {
    initAboutAtlasAnimations();

    const page = document.querySelector("[data-about-atlas]");
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
