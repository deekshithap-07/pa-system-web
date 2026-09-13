import { getStoryBySlug, getCountryForStory } from "../utils/work-locations.js";
import { buildCountryHubPayload } from "../utils/country-hub-data.js";

function shorten(text, max = 150) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${sp > 80 ? cut.slice(0, sp) : cut}…`;
}

function highlights(story) {
  const fromMetrics = (story.metricsList || [])
    .slice(0, 3)
    .map((m) => ({ label: m.label, text: String(m.value) }));
  if (fromMetrics.length) return fromMetrics;

  const n = story.narrative || {};
  const fromNarrative = [
    n.challenge && { label: "Challenge", text: shorten(n.challenge) },
    n.solution && { label: "Change", text: shorten(n.solution) },
    n.impact && { label: "Impact", text: shorten(n.impact) },
  ].filter(Boolean);
  if (fromNarrative.length) return fromNarrative;

  return (story.body || [])
    .slice(0, 3)
    .map((h, i) => ({ label: `Highlight ${i + 1}`, text: shorten(h) }));
}

export function renderStoryFeature(slug, data) {
  const story = getStoryBySlug(data, slug);
  if (!story) return `<div class="container static-page"><h1>Story not found</h1></div>`;
  const country = getCountryForStory(data, story);
  const hub = country ? buildCountryHubPayload(country.slug, data) : null;
  const heroImg = hub?.heroStoryImages?.[story.id] || story.image;
  const paras = (story.body || [story.excerpt])
    .map((p, i) => `<p class="${i === 0 ? "wb-feature__lead" : ""}">${p}</p>`)
    .join("");
  const photoClass = heroImg ? "" : ` wb-photo--${(story.slug || "").length % 3}`;
  const photoStyle = heroImg
    ? `style="background-image:linear-gradient(180deg,rgba(61,24,28,.35),rgba(42,16,20,.78)),url('${heroImg}');background-size:cover;background-position:center"`
    : "";

  const highlightItems = highlights(story)
    .map(
      (h, i) => `<li class="sf-highlight">
        <span class="sf-highlight__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        ${h.label ? `<span class="sf-highlight__label">${h.label}</span>` : ""}
        <p class="sf-highlight__text">${h.text}</p>
      </li>`
    )
    .join("");

  const allStoriesTab = country
    ? `<nav class="story-tabs story-tabs--inline" aria-label="More stories">
        <a href="#/stories/${country.slug}" class="story-tabs__link story-tabs__link--highlight" data-link>All stories from ${country.name}</a>
        <a href="#/stories" class="story-tabs__link" data-link>Stories hub</a>
      </nav>`
    : `<nav class="story-tabs story-tabs--inline" aria-label="More stories">
        <a href="#/stories" class="story-tabs__link story-tabs__link--highlight" data-link>All stories</a>
      </nav>`;

  return `
    <article class="wb-feature sf-page" data-story-feature>
      <div class="wb-feature__hero${photoClass}" ${photoStyle}>
        <div class="container">
          <p class="wb-feature__crumb">
            <a href="#/" data-link>Home</a>
            <span>/</span>
            <a href="#/stories" data-link>Stories</a>
            ${country ? `<span>/</span><a href="#/stories/${country.slug}" data-link>${country.name}</a>` : ""}
            <span>/</span>
            <span>Story</span>
          </p>
          <p class="wb-feature__kicker">${story.program || "Field story"}</p>
          <h1>${story.title}</h1>
        </div>
      </div>
      <div class="container wb-feature__layout">
        <aside class="wb-feature__aside sf-highlights" aria-labelledby="sf-highlights-title">
          <h2 id="sf-highlights-title">Story highlights</h2>
          <ul class="sf-highlights__list">${highlightItems}</ul>
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
