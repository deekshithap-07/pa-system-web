import { renderPageBack } from "../shared/wb-page-hero.js";

const COUNTRY_HERO_IMAGES = {
  kenya: "assets/country-heroes/kenya-hero-farmers.jpg",
  malawi: "assets/country-heroes/malawi-hero-savings.jpg",
  ethiopia: "assets/country-heroes/ethiopia-hero-farm.jpg",
  zambia: "assets/country-heroes/zambia-hero-crops.jpg",
};

export function catchmentHeroImage(hub) {
  return hub.heroImage || COUNTRY_HERO_IMAGES[hub.countrySlug] || COUNTRY_HERO_IMAGES.kenya;
}

export function renderCatchmentScrollShell(hub, sectionsHtml) {
  const status = hub.growthStatus || hub.catchment?.status || "Active";
  return `
    <div class="cth-scroll-story" data-catchment-scroll-story>
      <div class="cth-scroll-story__bg-sticky" aria-hidden="true">
        <div class="cth-scroll-story__bg" style="background-image:url('${catchmentHeroImage(hub)}')"></div>
        <div class="cth-scroll-story__overlay"></div>
      </div>
      <div class="cth-scroll-story__sections">
        ${renderCatchmentHeroSection(hub, status)}
        ${sectionsHtml}
      </div>
    </div>`;
}

function renderCatchmentHeroSection(hub, status) {
  const communityCount = hub.communityCards?.length || hub.communities?.length || 0;
  return `
    <section class="cth-scroll-section cth-scroll-section--hero" data-scroll-section="hero">
      ${renderPageBack({ href: `#/country/${hub.countrySlug}`, label: hub.countryName })}
      <div class="container cth-scroll-section__inner">
        <nav class="cth-scroll-section__crumbs" aria-label="Breadcrumb">
          <a href="#/africa" data-link>Where we work</a>
          <span aria-hidden="true">/</span>
          <a href="#/country/${hub.countrySlug}" data-link>${hub.countryName}</a>
          <span aria-hidden="true">/</span>
          <span>${hub.catchmentName}</span>
        </nav>
        <div class="cth-scroll-section__copy" data-scroll-reveal>
          <p class="cth-scroll-section__eyebrow">${hub.heroTagline || `${hub.countryName} · Nearby group`}</p>
          <h1 class="cth-scroll-section__title">${hub.catchmentName}</h1>
          <p class="cth-scroll-section__lead">${hub.description || hub.overview || `Pastor-led work across ${communityCount} communities in ${hub.countryName}.`}</p>
          <p class="cth-scroll-section__status"><span>${status}</span></p>
        </div>
        <div class="cth-scroll-section__actions" data-scroll-reveal>
          <a href="#cth-region" class="cth-scroll-section__btn" data-hero-scroll>Explore this group</a>
          <a href="#/scorecard" class="cth-scroll-section__btn cth-scroll-section__btn--ghost" data-link>Our results</a>
        </div>
        <p class="cth-scroll-section__hint" aria-hidden="true">Scroll to explore</p>
      </div>
    </section>`;
}

export function wrapScrollPanel(id, content) {
  return `
    <section class="cth-scroll-section" id="${id}" data-scroll-section>
      <div class="container">
        <div class="cth-scroll-panel" data-scroll-reveal>${content}</div>
      </div>
    </section>`;
}

/** One continuous white panel for region / map / why — no gaps between blocks. */
export function wrapScrollStack(anchorId, blocks) {
  const parts = (blocks || [])
    .filter((b) => b?.html)
    .map(
      (b) => `<div class="cth-scroll-stack__block"${b.id ? ` id="${b.id}"` : ""}>
          ${b.html}
        </div>`
    )
    .join("");

  if (!parts) return "";

  return `
    <section class="cth-scroll-section cth-scroll-section--stack" id="${anchorId}" data-scroll-section>
      <div class="container">
        <div class="cth-scroll-panel cth-scroll-panel--stack" data-scroll-reveal>
          ${parts}
        </div>
      </div>
    </section>`;
}

export function bindCatchmentScrollStory(root) {
  root?.querySelector?.("[data-hero-scroll]")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("cth-region")?.scrollIntoView({ behavior: "smooth" });
  });
}
