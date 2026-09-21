/**
 * Stories hub — cinematic editorial storytelling (PA brand).
 * Content/data/routes preserved; presentation only.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getPaCountries } from "../../utils/work-locations.js";

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

const CHAPTERS = [
  {
    id: "st-transformation",
    key: "transformation",
    eyebrow: "Transformation stories",
    titleHtml: "<span>Lives and places</span> <em>changed.</em>",
    lead: "Longer arcs of change — what shifted for people, churches, and villages.",
    label: "Transformation",
  },
  {
    id: "st-community",
    key: "community",
    eyebrow: "Community stories",
    titleHtml: "<span>What villages</span> <em>are doing together.</em>",
    lead: "Group work, Shalom savings, schools, water, and shared projects.",
    label: "Community",
  },
  {
    id: "st-leadership",
    key: "leadership",
    eyebrow: "Leadership stories",
    titleHtml: "<span>Pastors and</span> <em>local leaders.</em>",
    lead: "How trained leaders carry the work into homes and congregations.",
    label: "Leadership",
  },
];

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

function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;");
}

function renderHero(countryFilter, heroImage) {
  const titleHtml = countryFilter
    ? `<span>${countryFilter.name}</span> <em>stories.</em>`
    : `<span>Stories</span> <em>that explain the data.</em>`;
  const lead = countryFilter
    ? `Human stories from ${countryFilter.name} that explain the meaning behind the data.`
    : "Human stories that explain the meaning behind the data.";
  const image = heroImage || "assets/country-heroes/kenya-hero-farmers.jpg";

  return `
    <header class="st-hero" data-st-section="hero">
      <div class="st-hero__media" aria-hidden="true" data-st-parallax>
        <img src="${image}" alt="" fetchpriority="high" data-st-hero-img>
        <span class="st-hero__veil"></span>
      </div>
      <div class="container st-hero__layout">
        <div class="st-hero__inner">
          <p class="st-eyebrow st-eyebrow--on-dark" data-st-hero-line>Stories</p>
          <h1 class="pa-title st-hero__title" data-st-hero-line>${formatPaTitle({ titleHtml }, "Stories.")}</h1>
          <p class="st-hero__lead" data-st-hero-line>${lead}</p>
          ${
            countryFilter
              ? `<p class="st-hero__filter" data-st-hero-line><a ${linkAttrs("#/stories")}>← All stories</a></p>`
              : ""
          }
        </div>
      </div>
    </header>`;
}

function renderExplore(chapters, byCat) {
  const items = chapters
    .map((ch, i) => {
      const list = byCat(ch.key);
      const preview = list.find((s) => s.image)?.image || "";
      return `<a class="st-explore__item" href="#${ch.id}" data-st-explore="${ch.key}" style="--i:${i}">
        <span class="st-explore__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="st-explore__copy">
          <span class="st-explore__label">${ch.label}</span>
          <span class="st-explore__count">${list.length} ${list.length === 1 ? "story" : "stories"}</span>
        </span>
        <span class="st-explore__go" aria-hidden="true">→</span>
        ${preview ? `<span class="st-explore__shot" aria-hidden="true"><img src="${preview}" alt="" loading="lazy"></span>` : ""}
      </a>`;
    })
    .join("");

  return `
    <section class="st-explore" data-st-section="explore" aria-labelledby="st-explore-title">
      <div class="container">
        <header class="st-sec-head" data-st-reveal>
          <p class="st-eyebrow">Story exploration</p>
          <h2 id="st-explore-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Choose how you</span> <em>enter the story.</em>",
          })}</h2>
          <p class="st-sec-lead">Transformation, community, leadership, country, and field media — each path uses the same human stories that explain the meaning behind the data.</p>
        </header>
        <nav class="st-explore__index" aria-label="Story types" data-st-stagger>${items}
          <a class="st-explore__item st-explore__item--place" href="#st-country" data-st-explore="country" style="--i:${chapters.length}">
            <span class="st-explore__n">${String(chapters.length + 1).padStart(2, "0")}</span>
            <span class="st-explore__copy">
              <span class="st-explore__label">Country</span>
              <span class="st-explore__count">Stories by place</span>
            </span>
            <span class="st-explore__go" aria-hidden="true">→</span>
          </a>
          <a class="st-explore__item st-explore__item--media" href="#st-media" data-st-explore="media" style="--i:${chapters.length + 1}">
            <span class="st-explore__n">${String(chapters.length + 2).padStart(2, "0")}</span>
            <span class="st-explore__copy">
              <span class="st-explore__label">Photo / video</span>
              <span class="st-explore__count">From the field</span>
            </span>
            <span class="st-explore__go" aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </section>`;
}

function renderFeatured(stories, countries) {
  if (!stories.length) return "";

  const features = stories
    .map((story, i) => {
      const place = countryName(countries, story.countryId);
      const href = storyHref(story, countries);
      const flip = i % 2 === 1 ? " st-feature--flip" : "";
      const img = story.image
        ? `<img src="${story.image}" alt="" loading="${i === 0 ? "eager" : "lazy"}" data-st-img>`
        : `<span class="st-feature__ph" aria-hidden="true"></span>`;

      return `<article class="st-feature${flip}" data-st-feature data-st-reveal>
        <a class="st-feature__media" ${linkAttrs(href)} tabindex="-1" aria-hidden="true">
          <span class="st-feature__frame">${img}</span>
        </a>
        <div class="st-feature__copy">
          <p class="st-feature__meta">${place}${story.program ? ` · ${story.program}` : ""}</p>
          <h3 class="st-feature__title"><a ${linkAttrs(href)}>${story.title}</a></h3>
          <p class="st-feature__excerpt">${story.excerpt || ""}</p>
          <a class="st-feature__cta" ${linkAttrs(href)}>Read story <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="st-featured" data-st-section="featured" aria-labelledby="st-featured-title">
      <div class="container">
        <header class="st-sec-head" data-st-reveal>
          <p class="st-eyebrow">Featured stories</p>
          <h2 id="st-featured-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Where the numbers</span> <em>become people.</em>",
          })}</h2>
        </header>
        <div class="st-featured__stage">${features}</div>
      </div>
    </section>`;
}

function renderStoryRow(story, countries, index) {
  const place = countryName(countries, story.countryId);
  const href = storyHref(story, countries);
  const thumb = story.image
    ? `<img src="${story.image}" alt="" loading="lazy">`
    : `<span class="st-row__ph" aria-hidden="true"></span>`;

  return `<a class="st-row" ${linkAttrs(href)} data-st-stagger-item style="--i:${index}">
    <span class="st-row__n">${String(index + 1).padStart(2, "0")}</span>
    <span class="st-row__shot">${thumb}</span>
    <span class="st-row__body">
      <span class="st-row__meta">${place}${story.program ? ` · ${story.program}` : ""}</span>
      <strong class="st-row__title">${story.title}</strong>
      <span class="st-row__excerpt">${story.excerpt || ""}</span>
    </span>
    <span class="st-row__go" aria-hidden="true">→</span>
  </a>`;
}

function renderChapter(cfg, stories, countries) {
  const rows = stories.length
    ? `<div class="st-archive" data-st-stagger>${stories.map((s, i) => renderStoryRow(s, countries, i)).join("")}</div>`
    : `<p class="st-empty">No ${cfg.eyebrow.toLowerCase()} yet — check back soon.</p>`;

  return `
    <section class="st-chapter st-chapter--${cfg.key}" id="${cfg.id}" data-st-section="${cfg.id}" aria-labelledby="${cfg.id}-title">
      <div class="container">
        <header class="st-sec-head" data-st-reveal>
          <p class="st-eyebrow">${cfg.eyebrow}</p>
          <h2 id="${cfg.id}-title" class="pa-title">${formatPaTitle({ titleHtml: cfg.titleHtml })}</h2>
          ${cfg.lead ? `<p class="st-sec-lead">${cfg.lead}</p>` : ""}
        </header>
        ${rows}
      </div>
    </section>`;
}

function renderCountrySection(stories, countries, allStories) {
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
    .map((c, i) => {
      const featured =
        countryStories.find((s) => s.countryId === c.id) ||
        allStories.find((s) => s.countryId === c.id);
      const count = allStories.filter((s) => s.countryId === c.id).length;
      if (!featured && !count) {
        return `<article class="st-place" data-st-stagger-item style="--i:${i}">
          <span class="st-place__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="st-place__body">
            <p class="st-place__name">${c.name}</p>
            <p class="st-place__meta">Stories coming soon</p>
          </span>
        </article>`;
      }
      const shot = featured?.image
        ? `<span class="st-place__shot" aria-hidden="true"><img src="${featured.image}" alt="" loading="lazy"></span>`
        : "";
      return `<a class="st-place" ${linkAttrs(`#/stories/${c.slug}`)} data-st-stagger-item style="--i:${i}">
        <span class="st-place__n">${String(i + 1).padStart(2, "0")}</span>
        ${shot}
        <span class="st-place__body">
          <p class="st-place__name">${c.name}</p>
          <p class="st-place__meta">${count} ${count === 1 ? "story" : "stories"}</p>
          ${featured ? `<strong class="st-place__feature">${featured.title}</strong>` : ""}
        </span>
        <span class="st-place__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-places" id="st-country" data-st-section="country" aria-labelledby="st-country-title">
      <div class="container">
        <header class="st-sec-head" data-st-reveal>
          <p class="st-eyebrow">Country stories</p>
          <h2 id="st-country-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Stories by</span> <em>place.</em>",
          })}</h2>
          <p class="st-sec-lead">Open a country to read field stories from that part of the network.</p>
        </header>
        <div class="st-places__index" data-st-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderMediaSection(media = []) {
  const items = (media || [])
    .map((m, i) => {
      const wide = i % 5 === 0 || i % 5 === 3 ? " st-media--wide" : "";
      return `<figure class="st-media${wide}" data-st-stagger-item style="--i:${i}">
        ${
          m.type === "video" && m.src
            ? `<video src="${escapeAttr(m.src)}" controls playsinline preload="metadata" poster="${escapeAttr(m.poster || "")}"></video>`
            : m.src
              ? `<img src="${escapeAttr(m.src)}" alt="${escapeAttr(m.alt || "")}" loading="lazy" data-st-img>`
              : `<span class="st-media__blank" aria-hidden="true"></span>`
        }
        ${m.caption ? `<figcaption>${m.caption}</figcaption>` : ""}
      </figure>`;
    })
    .join("");

  return `
    <section class="st-media-band" id="st-media" data-st-section="media" aria-labelledby="st-media-title">
      <div class="container">
        <header class="st-sec-head st-sec-head--on-dark" data-st-reveal>
          <p class="st-eyebrow st-eyebrow--on-dark">Photo / video</p>
          <h2 id="st-media-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>From the</span> <em>field.</em>",
          })}</h2>
          <p class="st-sec-lead st-sec-lead--on-dark">Photos and video from communities across the network.</p>
        </header>
        ${
          items
            ? `<div class="st-media-mosaic" data-st-stagger>${items}</div>`
            : `<div class="st-media-blank" data-st-reveal>
                <p>Photo and video content will appear here soon.</p>
              </div>`
        }
      </div>
    </section>`;
}

function pickFeatured(stories) {
  const picks = [];
  const seen = new Set();
  for (const key of ["transformation", "community", "leadership"]) {
    const hit = stories.find((s) => storyCategory(s) === key && s.image && !seen.has(s.id));
    if (hit) {
      seen.add(hit.id);
      picks.push(hit);
    }
  }
  if (picks.length < 2) {
    for (const s of stories) {
      if (seen.has(s.id) || !s.image) continue;
      picks.push(s);
      seen.add(s.id);
      if (picks.length >= 3) break;
    }
  }
  return picks.slice(0, 3);
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
  const featured = pickFeatured(stories);
  const heroImage = featured[0]?.image || stories.find((s) => s.image)?.image;

  return `
    <div class="st-page" data-stories-page>
      ${renderHero(countryFilter, heroImage)}
      ${renderExplore(CHAPTERS, byCat)}
      ${renderFeatured(featured, countries)}
      ${CHAPTERS.map((cfg) => renderChapter(cfg, byCat(cfg.key), countries)).join("")}
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
    page.querySelectorAll("[data-st-reveal], [data-st-stagger] > *, [data-st-hero-line], [data-st-feature]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.clipPath = "none";
    });
    return;
  }

  const heroLines = page.querySelectorAll("[data-st-hero-line]");
  if (heroLines.length) {
    gsap.fromTo(
      heroLines,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", clearProps: "transform" }
    );
  }

  const heroImg = page.querySelector("[data-st-hero-img]");
  if (heroImg && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      heroImg,
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: ".st-hero", start: "top top", end: "bottom top", scrub: 0.6 },
      }
    );
  }

  page.querySelectorAll("[data-st-reveal]").forEach((el) => {
    const isFeature = el.hasAttribute("data-st-feature");
    gsap.fromTo(
      el,
      isFeature
        ? { autoAlpha: 0, y: 36 }
        : { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: isFeature ? 0.75 : 0.55,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );

    if (isFeature) {
      const frame = el.querySelector(".st-feature__frame");
      if (frame) {
        gsap.fromTo(
          frame,
          { clipPath: "inset(12% 8% 12% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          }
        );
      }
    }
  });

  page.querySelectorAll("[data-st-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, x: -14 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-st-img]").forEach((img) => {
    if (typeof ScrollTrigger === "undefined") return;
    gsap.fromTo(
      img,
      { scale: 1.06 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest("figure, .st-feature__media, .st-row__shot") || img,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
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
