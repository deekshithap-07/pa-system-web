import { formatNumber } from "../utils/format.js";

/* ---- Section 1: Hero Placeholder ---- */
export function renderHero(hero) {
  return `
    <section class="home-hero" id="home-hero">
      <div class="home-hero__bg" aria-hidden="true">
        <span class="home-hero__bg-label">Hero background image — placeholder</span>
      </div>
      <div class="container home-hero__content">
        <h1 class="home-hero__title">${hero.title}</h1>
        <p class="home-hero__desc">${hero.description}</p>
        <div class="home-hero__actions">
          <a href="${hero.primaryCta.target}" class="btn btn-primary" data-link>${hero.primaryCta.label}</a>
          <a href="${hero.secondaryCta.target}" class="btn btn-secondary" data-link>${hero.secondaryCta.label}</a>
        </div>
      </div>
    </section>`;
}

/* ---- Section 2: Impact Overview ---- */
export function renderImpactOverview(impact) {
  const kpis = (impact.kpis || [])
    .map(
      (k) => `<article class="impact-kpi" data-kpi data-value="${k.value}" data-prefix="${k.prefix || ""}" data-suffix="${k.suffix || ""}">
        <span class="impact-kpi__value">—</span>
        <span class="impact-kpi__label">${k.label}</span>
      </article>`
    )
    .join("");

  return `
    <section class="impact-overview" id="impact-overview">
      <div class="container">
        <header class="impact-overview__head" data-reveal>
          <h2>${impact.title}</h2>
          <p>${impact.description}</p>
        </header>
        <div class="impact-kpi-grid" data-reveal>${kpis}</div>
        <div class="impact-overview__cta" data-reveal>
          <a href="${impact.scorecardCta.target}" class="btn btn-primary" data-link>${impact.scorecardCta.label}</a>
          ${impact.modelLink ? `<a href="${impact.modelLink.target}" class="impact-overview__model-link" data-link>${impact.modelLink.label} &rarr;</a>` : ""}
        </div>
      </div>
    </section>`;
}
