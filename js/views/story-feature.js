import { getStoryBySlug, getCountryForStory } from "../utils/work-locations.js";
import { buildCountryHubPayload } from "../utils/country-hub-data.js";

function highlights(story) {
  const fromMetrics = (story.metricsList || []).slice(0, 3).map((m) => `${m.label}: ${m.value}`);
  if (fromMetrics.length) return fromMetrics;
  return (story.body || []).slice(0, 3);
}

export function renderStoryFeature(slug, data) {
  const story = getStoryBySlug(data, slug);
  if (!story) return `<div class="container static-page"><h1>Story not found</h1></div>`;
  const country = getCountryForStory(data, story);
  const hub = country ? buildCountryHubPayload(country.slug, data) : null;
  const heroImg = hub?.heroStoryImages?.[story.id] || story.image;
  const paras = (story.body || [story.excerpt]).map((p, i) => `<p class="${i === 0 ? "wb-feature__lead" : ""}">${p}</p>`).join("");
  const photoClass = heroImg ? "" : ` wb-photo--${(story.slug || "").length % 3}`;
  const photoStyle = heroImg
    ? `style="background-image:linear-gradient(180deg,rgba(0,20,40,.25),rgba(0,20,40,.62)),url('${heroImg}');background-size:cover;background-position:center"`
    : "";

  const allStoriesTab = country
    ? `<nav class="story-tabs story-tabs--inline" aria-label="More stories">
        <a href="#/country/${country.slug}/stories" class="story-tabs__link story-tabs__link--highlight" data-link>All stories from ${country.name}</a>
      </nav>`
    : "";

  return `
    <article class="wb-feature" data-story-feature>
      <div class="wb-feature__hero${photoClass}" ${photoStyle}>
        <div class="container">
          <p class="wb-feature__crumb">
            <a href="#/" data-link>Home</a>
            <span>/</span>
            <a href="#/africa" data-link>Where we work</a>
            ${country ? `<span>/</span><a href="#/country/${country.slug}" data-link>${country.name}</a>` : ""}
            <span>/</span>
            <span>Story</span>
          </p>
          <p class="wb-feature__kicker">${story.program || "Field story"}</p>
          <h1>${story.title}</h1>
        </div>
      </div>
      <div class="container wb-feature__layout">
        <aside class="wb-feature__aside">
          <h2>Story highlights</h2>
          <ul>${highlights(story)
            .map((h) => `<li>${h}</li>`)
            .join("")}</ul>
        </aside>
        <div class="wb-feature__body">
          ${paras}
          ${allStoriesTab}
        </div>
      </div>
    </article>`;
}

export function mountStoryFeature() {}
export function destroyStoryFeature() {}
