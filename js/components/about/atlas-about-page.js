import { renderAtlasRing } from "./AtlasRing.js";

function renderStoryCard(story, accent) {
  const linkAttrs = story.href?.startsWith("#/") ? `href="${story.href}" data-link` : `href="${story.href || "#"}"`;
  return `
    <article class="about-story-card" data-atlas-reveal>
      <span class="about-story-card__tag" style="color:${accent}">${story.tag}</span>
      <h3 class="about-story-card__title">${story.title}</h3>
      <p class="about-story-card__summary">${story.summary}</p>
      ${story.href ? `<a ${linkAttrs} class="about-story-card__link" style="--about-accent:${accent}">Read more ›</a>` : ""}
    </article>`;
}

function renderThemeSection(theme) {
  const ring = theme.ring || {};

  return `
    <section
      class="about-atlas-theme atlas-theme"
      id="about-theme-${theme.id}"
      data-about-theme="${theme.id}"
      data-atlas-scroll
      style="--atlas-accent:${theme.accent}; --atlas-bg:${theme.bg}"
    >
      <div class="container about-atlas-theme__inner">
        <div class="about-atlas-theme__content" data-atlas-reveal>
          <p class="about-atlas-theme__label">Stories on <strong>${theme.label}</strong></p>
          <div class="about-atlas-theme__stories">
            ${(theme.stories || []).map((s) => renderStoryCard(s, theme.accent)).join("")}
          </div>
        </div>
        <div class="about-atlas-theme__viz" data-atlas-reveal>
          ${renderAtlasRing({
            id: `about-ring-${theme.id}`,
            headline: ring.headline || "",
            context: ring.context || "",
            fill: ring.fill ?? 0.5,
            accent: theme.accent,
            countValue: ring.headline,
          })}
        </div>
      </div>
    </section>`;
}

function renderHierarchy(h) {
  const levelLinks = ["#/africa", "#/country/kenya", "#/catchment/kenya/kajiado", "#/community/kenya/kajiado/koitiko", "#"];
  return `
    <section class="about-atlas-block" id="about-hierarchy" data-atlas-scroll>
      <div class="container">
        <h2 class="about-atlas-block__title" data-atlas-reveal>${h.title}</h2>
        <p class="about-atlas-block__desc" data-atlas-reveal>${h.description}</p>
        <div class="about-hierarchy-flow">
          ${h.levels
            .map(
              (l, i) => `<div class="about-hierarchy-step" data-atlas-reveal>
                ${i > 0 ? '<span class="about-hierarchy-step__arrow" aria-hidden="true">→</span>' : ""}
                <a href="${levelLinks[i] || "#/africa"}" class="about-hierarchy-step__card" data-link>
                  <strong>${l.label}</strong>
                  <p>${l.description}</p>
                  <span class="about-hierarchy-step__cta">Explore example →</span>
                </a>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderJourney(journey) {
  return `
    <section class="about-atlas-block about-atlas-block--alt" id="about-journey" data-atlas-scroll>
      <div class="container">
        <h2 class="about-atlas-block__title" data-atlas-reveal>${journey.title}</h2>
        <p class="about-atlas-block__desc" data-atlas-reveal>Every community progresses through a structured ${journey.duration} journey — tracked in the community transformation system.</p>
        <div class="about-journey-track">
          ${journey.stages
            .map(
              (s, i) => `<div class="about-journey-step" style="--step-i:${i}" data-atlas-reveal>
                <span class="about-journey-step__num">${i + 1}</span>
                <div class="about-journey-step__body">
                  <span class="about-journey-step__month">Month ${s.month}</span>
                  <strong>${s.label}</strong>
                  <p>${s.description}</p>
                </div>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderTripleA(tripleA) {
  return `
    <section class="about-atlas-block about-atlas-block--alt" id="about-triple-a" data-atlas-scroll>
      <div class="container">
        <h2 class="about-atlas-block__title" data-atlas-reveal>${tripleA.title}</h2>
        <p class="about-atlas-block__desc" data-atlas-reveal>${tripleA.description}</p>
        <div class="about-triple-grid">
          ${tripleA.dimensions
            .map(
              (d, i) => `<article class="about-triple-card" style="--triple-i:${i}" data-atlas-reveal>
                <span class="about-triple-card__letter">${d.label.charAt(0)}</span>
                <h3>${d.label}</h3>
                <p>${d.description}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

export function renderAtlasAboutPage(model, footerHtml = "") {
  if (!model) return `<div class="static-page container"><h1>About</h1><p>Content unavailable.</p></div>`;

  const atlas = model.atlas || {};
  const hero = atlas.hero || {};
  const intro = atlas.intro || {};
  const themes = atlas.themes || [];
  const featured = atlas.featured || [];

  return `
    <div class="about-atlas-page atlas-page" data-about-atlas>
      <header class="atlas-hero about-atlas-hero">
        <div class="atlas-hero__mesh" aria-hidden="true"></div>
        <div class="container atlas-hero__inner">
          <p class="atlas-hero__eyebrow" data-atlas-hero>${hero.eyebrow || "Possibilities Africa"}</p>
          <h1 class="atlas-hero__title" data-atlas-hero>
            <span class="atlas-hero__title-line"><strong>${hero.title || "About Us"}</strong></span>
          </h1>
          <p class="atlas-hero__lead" data-atlas-hero>${hero.lead || model.tagline}</p>
          ${
            (hero.badges || []).length
              ? `<div class="atlas-hero__badges" data-atlas-hero>
            <span>Explore</span>
            ${hero.badges.map((b) => `<a href="${b.href}" class="atlas-hero__badge" data-link>${b.label}</a>`).join("")}
          </div>`
              : ""
          }
        </div>
        <div class="atlas-hero__scroll" aria-hidden="true" data-atlas-hero>
          <span>Scroll to explore</span>
          <span class="atlas-hero__scroll-icon">↓</span>
        </div>
      </header>

      <nav class="atlas-nav about-atlas-nav" aria-label="Ministry themes">
        <div class="container atlas-nav__inner">
          ${themes.map((t) => `<a href="#about-theme-${t.id}" class="atlas-nav__link" data-anchor data-about-theme-nav="${t.id}" style="--atlas-accent:${t.accent}">${t.label}</a>`).join("")}
          <a href="#about-hierarchy" class="atlas-nav__link" data-anchor data-about-theme-nav="hierarchy">Structure</a>
          <a href="#about-journey" class="atlas-nav__link" data-anchor data-about-theme-nav="journey">Journey</a>
        </div>
      </nav>

      <section class="atlas-intro" data-atlas-scroll>
        <div class="container atlas-intro__inner">
          <h2 class="atlas-intro__title" data-atlas-reveal>The ministry model behind the <strong>data</strong></h2>
          <p class="atlas-intro__text" data-atlas-reveal>${intro.text || ""}</p>
        </div>
      </section>

      <section class="atlas-featured" data-atlas-scroll>
        <div class="container">
          <div class="atlas-featured__grid">
            ${featured
              .map(
                (f, i) => `<article class="atlas-featured-card atlas-featured-card--${i + 1}" data-atlas-reveal>
              <p class="atlas-featured-card__subtitle">${f.subtitle}</p>
              <h3 class="atlas-featured-card__title">${f.title}</h3>
              <p class="atlas-featured-card__desc">${f.description}</p>
              <a href="${f.href}" class="atlas-featured-card__cta" data-link>${f.cta} →</a>
            </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      ${themes.map(renderThemeSection).join("")}

      ${renderHierarchy(model.hierarchy)}
      ${renderJourney(model.journey)}
      ${renderTripleA(model.tripleA)}

      ${footerHtml}
    </div>`;
}
