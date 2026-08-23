import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { storiesForCountry, getPaCountries } from "../utils/work-locations.js";

function storyImage(story, hub) {
  return hub?.heroStoryImages?.[story.id] || story.image;
}

function renderStoryCard(story, hub) {
  const img = storyImage(story, hub);
  const media = img
    ? `<span class="cs-card__media"><img class="cs-card__img" src="${img}" alt="" loading="lazy"><span class="cs-card__wash"></span></span>`
    : `<span class="cs-card__media cs-card__media--empty" aria-hidden="true"></span>`;

  return `<a href="#/story/${story.slug}" class="cs-card" data-link>
    ${media}
    <span class="cs-card__copy">
      <span class="cs-card__tag">${story.program || "Field story"}</span>
      <strong>${story.title}</strong>
      <p>${story.excerpt || ""}</p>
      <span class="cs-card__cta">Read the story →</span>
    </span>
  </a>`;
}

export function renderCountryStoriesPage(slug, data) {
  const country = getPaCountries(data).find((c) => c.slug === slug);
  if (!country) return `<div class="container static-page"><h1>Country not found</h1></div>`;

  const hub = buildCountryHubPayload(slug, data);
  const stories = hub?.stories?.length ? hub.stories : storiesForCountry(data, country.id);
  const heroImg = stories[0] ? storyImage(stories[0], hub) : "";

  const grid = stories.length
    ? `<div class="cs-grid">${stories.map((s) => renderStoryCard(s, hub)).join("")}</div>`
    : `<p class="cs-empty">Stories from ${country.name} will appear here as they are published.</p>`;

  const heroStyle = heroImg ? `style="--cs-hero-image:url('${heroImg}')"` : "";

  return `
    <div class="cs-page" data-country-stories data-country-slug="${slug}" ${heroStyle}>
      <header class="cs-hero">
        <div class="cs-hero__wash" aria-hidden="true"></div>
        <div class="container cs-hero__inner">
          <nav class="cs-crumb" aria-label="Breadcrumb">
            <a href="#/africa" data-link>Where we work</a>
            <span aria-hidden="true">/</span>
            <a href="#/country/${country.slug}" data-link>${country.name}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Stories</span>
          </nav>
          <p class="cs-hero__eyebrow">${hub?.heroTagline || "PA Network · Field stories"}</p>
          <h1 class="cs-hero__title">Stories from ${country.name}</h1>
          <p class="cs-hero__lead">Every field story from this country — same layout, open any card to read.</p>
          <div class="cs-hero__meta">
            <span class="cs-hero__count">${stories.length} ${stories.length === 1 ? "story" : "stories"}</span>
            <a href="#/country/${country.slug}" class="cs-hero__link" data-link>← Back to country</a>
          </div>
        </div>
      </header>

      <main class="cs-main">
        <div class="container">
          ${grid}
        </div>
      </main>
    </div>`;
}

export function mountCountryStoriesPage() {}

export function destroyCountryStoriesPage() {}
