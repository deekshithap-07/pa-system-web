/**
 * Stories hub — PA-branded page.
 * Sections only: Hero → Transformation → Community → Leadership → Country → Photo/video
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getPaCountries } from "../../utils/work-locations.js";

const SKINS = ["gold", "green", "maroon"];

/** Primary category when story.categories is missing — keeps sections distinct. */
const CATEGORY_BY_ID = {
  "story-kenya-dams": "community",
  "story-owino": "leadership",
  "story-rachuonyo": "transformation",
  "story-webuye": "community",
  "story-bungoma-school": "community",
  "story-kilifi-youth": "transformation",
  "story-ethiopia-abdisa": "leadership",
  "story-ethiopia-fikre": "leadership",
  "story-ethiopia-koka": "leadership",
  "story-tanzania": "country",
  "story-rwanda": "country",
  "story-burundi": "country",
  "story-zambia-crops": "leadership",
  "story-malawi-mary": "transformation",
  "story-jeremiah": "leadership",
  "story-liwedi": "community",
  "story-lilongwe-savings": "community",
  "story-ntchisi-health": "leadership",
  "story-mzimba-cooperative": "community",
};

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function countryName(countries, countryId) {
  return countries.find((c) => c.id === countryId)?.name || "";
}

function countrySlug(countries, countryId) {
  return countries.find((c) => c.id === countryId)?.slug || "";
}

function storyCategory(story) {
  if (Array.isArray(story.categories) && story.categories.length) {
    return story.categories[0];
  }
  return CATEGORY_BY_ID[story.id] || "transformation";
}

function storyHref(story, countries) {
  const slug = countrySlug(countries, story.countryId);
  if (story.slug) return `#/story/${story.slug}`;
  return slug ? `#/stories/${slug}` : "#/stories";
}

function filterStories(stories, countryFilter) {
  if (!countryFilter) return stories;
  return stories.filter((s) => s.countryId === countryFilter.id);
}

function renderCard(story, countries) {
  const place = countryName(countries, story.countryId);
  const href = storyHref(story, countries);
  const img = story.image
    ? `<img src="${story.image}" alt="" loading="lazy">`
    : `<span class="st-card__ph" aria-hidden="true"></span>`;

  return `<a class="st-card" ${linkAttrs(href)} data-st-stagger-item>
    <span class="st-card__media">${img}</span>
    <span class="st-card__body">
      <span class="st-card__meta">${place}${story.program ? ` · ${story.program}` : ""}</span>
      <strong class="st-card__title">${story.title}</strong>
      <span class="st-card__excerpt">${story.excerpt || ""}</span>
      <span class="st-card__cta">Read story →</span>
    </span>
  </a>`;
}

function renderEmpty(label) {
  return `<p class="st-empty">No ${label.toLowerCase()} yet — check back soon.</p>`;
}

function renderSection({
  id,
  skin,
  eyebrow,
  titleHtml,
  lead,
  stories,
  countries,
  emptyLabel,
}) {
  const cards = stories.length
    ? `<div class="st-grid" data-st-stagger>${stories.map((s) => renderCard(s, countries)).join("")}</div>`
    : renderEmpty(emptyLabel || eyebrow);

  return `
    <section class="st-band st-band--skin-${skin}" id="${id}" data-st-section="${id}" aria-labelledby="${id}-title">
      <div class="container">
        <header class="st-band__head" data-st-reveal>
          <p class="st-eyebrow">${eyebrow}</p>
          <h2 id="${id}-title" class="pa-title">${formatPaTitle({ titleHtml })}</h2>
          ${lead ? `<p class="st-band__lead">${lead}</p>` : ""}
        </header>
        ${cards}
      </div>
    </section>`;
}

function renderHero(countryFilter) {
  const titleHtml = countryFilter
    ? `<span>${countryFilter.name}</span> <em>stories.</em>`
    : `<span>Stories</span> <em>that explain the data.</em>`;
  const lead = countryFilter
    ? `Human stories from ${countryFilter.name} that explain the meaning behind the data.`
    : "Human stories that explain the meaning behind the data.";
  const image = "assets/home-overview/tab-stories.jpg";

  return `
    <header class="st-hero" data-st-section="hero">
      <div class="st-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="st-hero__veil"></span>
      </div>
      <div class="container st-hero__layout">
        <div class="st-hero__inner" data-st-reveal>
          <p class="st-eyebrow st-eyebrow--on-dark">Stories</p>
          <h1 class="pa-title st-hero__title">${formatPaTitle({ titleHtml }, "Stories.")}</h1>
          <p class="st-hero__lead">${lead}</p>
          <nav class="st-hero__jump" aria-label="Story types">
            <a href="#st-transformation">Transformation</a>
            <a href="#st-community">Community</a>
            <a href="#st-leadership">Leadership</a>
            <a href="#st-country">Country</a>
            <a href="#st-media">Photo / video</a>
          </nav>
          ${
            countryFilter
              ? `<p class="st-hero__filter"><a ${linkAttrs("#/stories")}>← All stories</a></p>`
              : ""
          }
        </div>
      </div>
    </header>`;
}

function renderCountrySection(stories, countries, allStories) {
  /* Prefer stories tagged/mapped as country; else one featured story per country. */
  let countryStories = stories.filter((s) => storyCategory(s) === "country");

  if (!countryStories.length) {
    const seen = new Set();
    countryStories = [];
    for (const c of countries) {
      const pick =
        allStories.find((s) => s.countryId === c.id && storyCategory(s) === "country") ||
        allStories.find((s) => s.countryId === c.id);
      if (pick && !seen.has(pick.id)) {
        seen.add(pick.id);
        countryStories.push(pick);
      }
    }
  }

  const cards = countries
    .map((c) => {
      const featured =
        countryStories.find((s) => s.countryId === c.id) ||
        allStories.find((s) => s.countryId === c.id);
      const count = allStories.filter((s) => s.countryId === c.id).length;
      if (!featured && !count) {
        return `<article class="st-country" data-st-stagger-item>
          <p class="st-country__name">${c.name}</p>
          <p class="st-country__meta">Stories coming soon</p>
        </article>`;
      }
      return `<a class="st-country" ${linkAttrs(`#/stories/${c.slug}`)} data-st-stagger-item>
        <p class="st-country__name">${c.name}</p>
        <p class="st-country__meta">${count} ${count === 1 ? "story" : "stories"}</p>
        ${featured ? `<strong class="st-country__feature">${featured.title}</strong>` : ""}
        <span class="st-country__cta">Explore →</span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-band st-band--skin-gold" id="st-country" data-st-section="country" aria-labelledby="st-country-title">
      <div class="container">
        <header class="st-band__head" data-st-reveal>
          <p class="st-eyebrow">Country stories</p>
          <h2 id="st-country-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Stories by</span> <em>place.</em>",
          })}</h2>
          <p class="st-band__lead">Open a country to read field stories from that part of the network.</p>
        </header>
        <div class="st-country-grid" data-st-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderMediaSection(media = []) {
  const items = (media || [])
    .map(
      (m) => `<figure class="st-media" data-st-stagger-item>
        ${
          m.type === "video" && m.src
            ? `<video src="${m.src}" controls poster="${m.poster || ""}"></video>`
            : m.src
              ? `<img src="${m.src}" alt="${m.alt || ""}" loading="lazy">`
              : `<span class="st-media__blank" aria-hidden="true"></span>`
        }
        ${m.caption ? `<figcaption>${m.caption}</figcaption>` : ""}
      </figure>`
    )
    .join("");

  return `
    <section class="st-band st-band--skin-maroon" id="st-media" data-st-section="media" aria-labelledby="st-media-title">
      <div class="container">
        <header class="st-band__head" data-st-reveal>
          <p class="st-eyebrow">Photo / video</p>
          <h2 id="st-media-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>From the</span> <em>field.</em>",
          })}</h2>
          <p class="st-band__lead">Photos and video from communities across the network.</p>
        </header>
        ${
          items
            ? `<div class="st-media-grid" data-st-stagger>${items}</div>`
            : `<div class="st-media-blank" data-st-reveal>
                <p>Photo and video content will appear here soon.</p>
              </div>`
        }
      </div>
    </section>`;
}

export function renderStoriesPage(data, countrySlug = null) {
  const countries = getPaCountries(data);
  const countryFilter = countrySlug
    ? countries.find((c) => c.slug === countrySlug) || null
    : null;
  const allStories = data.stories?.stories || [];
  const stories = filterStories(allStories, countryFilter);
  const media = data.stories?.media || [];

  const byCat = (cat) => stories.filter((s) => storyCategory(s) === cat);

  const sections = [
    {
      id: "st-transformation",
      skin: SKINS[0],
      eyebrow: "Transformation stories",
      titleHtml: "<span>Lives and places</span> <em>changed.</em>",
      lead: "Longer arcs of change — what shifted for people, churches, and villages.",
      stories: byCat("transformation"),
      emptyLabel: "transformation stories",
    },
    {
      id: "st-community",
      skin: SKINS[1],
      eyebrow: "Community stories",
      titleHtml: "<span>What villages</span> <em>are doing together.</em>",
      lead: "Group work, Shalom savings, schools, water, and shared projects.",
      stories: byCat("community"),
      emptyLabel: "community stories",
    },
    {
      id: "st-leadership",
      skin: SKINS[2],
      eyebrow: "Leadership stories",
      titleHtml: "<span>Pastors and</span> <em>local leaders.</em>",
      lead: "How trained leaders carry the work into homes and congregations.",
      stories: byCat("leadership"),
      emptyLabel: "leadership stories",
    },
  ];

  return `
    <div class="st-page" data-stories-page>
      ${renderHero(countryFilter)}
      ${sections
        .map((cfg) =>
          renderSection({
            ...cfg,
            countries,
          })
        )
        .join("")}
      ${renderCountrySection(stories, countryFilter ? [countryFilter] : countries, allStories)}
      ${renderMediaSection(media)}
    </div>`;
}

export function mountStoriesPage() {
  const page = document.querySelector("[data-stories-page]");
  if (!page) return;

  initStoriesMotion(page);

  const hash = location.hash;
  const anchorMatch = hash.match(/#(st-[a-z-]+)$/);
  if (anchorMatch) {
    requestAnimationFrame(() => {
      document.getElementById(anchorMatch[1])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function initStoriesMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-st-reveal], [data-st-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroKids = page.querySelectorAll(".st-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", clearProps: "transform" }
    );
  }

  page.querySelectorAll("[data-st-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-st-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyStoriesPage() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-stories-page]")) t.kill();
    });
  }
}
