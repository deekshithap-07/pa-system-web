/**
 * Stories hub — cinematic editorial storytelling (PA brand).
 * Each section uses its own layout; stories are mixed across countries.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getPaCountries } from "../../utils/work-locations.js";

const HERO_IMAGE = "assets/stories/stories-hero.jpg";

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

const CHAPTERS = {
  transformation: {
    id: "st-transformation",
    eyebrow: "Transformation stories",
    titleHtml: "<span>Lives and places</span> <em>changed.</em>",
    lead: "Longer arcs of change — what shifted for people, churches, and villages.",
  },
  community: {
    id: "st-community",
    eyebrow: "Community stories",
    titleHtml: "<span>What villages</span> <em>are doing together.</em>",
    lead: "Group work, Shalom savings, schools, water, and shared projects.",
  },
  leadership: {
    id: "st-leadership",
    eyebrow: "Leadership stories",
    titleHtml: "<span>Pastors and</span> <em>local leaders.</em>",
    lead: "How trained leaders carry the work into homes and congregations.",
  },
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

function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;");
}

/** Round-robin by country so one country never fills a section. */
function mixCountries(list) {
  const groups = new Map();
  list.forEach((s) => {
    if (!groups.has(s.countryId)) groups.set(s.countryId, []);
    groups.get(s.countryId).push(s);
  });
  const queues = [...groups.values()];
  const out = [];
  while (queues.some((q) => q.length)) {
    queues.forEach((q) => {
      if (q.length) out.push(q.shift());
    });
  }
  return out;
}

function metaLine(story, countries) {
  const place = countryName(countries, story.countryId);
  return `${place}${story.program ? ` · ${story.program}` : ""}`;
}

function sectionHead(eyebrow, titleHtml, lead, onDark = false) {
  return `<header class="st-sec-head${onDark ? " st-sec-head--on-dark" : ""}" data-st-reveal>
    <p class="st-eyebrow${onDark ? " st-eyebrow--on-dark" : ""}">${eyebrow}</p>
    <h2 class="pa-title">${formatPaTitle({ titleHtml })}</h2>
    ${lead ? `<p class="st-sec-lead${onDark ? " st-sec-lead--on-dark" : ""}">${lead}</p>` : ""}
  </header>`;
}

function renderHero(countryFilter, heroImage) {
  const titleHtml = countryFilter
    ? `<span>${countryFilter.name}</span> <em>stories.</em>`
    : `<span>Stories</span> <em>that explain the data.</em>`;
  const lead = countryFilter
    ? `Human stories from ${countryFilter.name} that explain the meaning behind the data.`
    : "Human stories that explain the meaning behind the data.";

  return `
    <header class="st-hero" data-st-section="hero">
      <div class="st-hero__media" aria-hidden="true" data-st-parallax>
        <img src="${heroImage || HERO_IMAGE}" alt="" fetchpriority="high" data-st-hero-img>
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

/** Featured — bento: one large story + two stacked. */
function renderFeatured(stories, countries) {
  if (!stories.length) return "";
  const [lead, ...rest] = stories;
  const leadHref = storyHref(lead, countries);

  const side = rest
    .map((s) => {
      const href = storyHref(s, countries);
      return `<a class="st-bento__side" ${linkAttrs(href)} data-st-reveal>
        <span class="st-bento__side-img"><img src="${s.image}" alt="" loading="lazy" data-st-img></span>
        <span class="st-bento__side-copy">
          <span class="st-bento__meta">${metaLine(s, countries)}</span>
          <strong>${s.title}</strong>
          <span class="st-bento__go">Read story →</span>
        </span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-featured" data-st-section="featured" aria-labelledby="st-featured-title">
      <div class="container">
        ${sectionHead("Featured stories", "<span>Where the numbers</span> <em>become people.</em>")}
        <div class="st-bento">
          <a class="st-bento__main" ${linkAttrs(leadHref)} data-st-reveal>
            <img src="${lead.image}" alt="" loading="eager" data-st-img>
            <span class="st-bento__veil" aria-hidden="true"></span>
            <span class="st-bento__main-copy">
              <span class="st-bento__chip">${countryName(countries, lead.countryId)}</span>
              <strong>${lead.title}</strong>
              ${lead.excerpt ? `<span class="st-bento__excerpt">${lead.excerpt}</span>` : ""}
              <span class="st-bento__go">Read story →</span>
            </span>
          </a>
          ${side ? `<div class="st-bento__stack">${side}</div>` : ""}
        </div>
      </div>
    </section>`;
}

/** Transformation — horizontal reel of tall cards. */
function renderTransformation(stories, countries) {
  const cfg = CHAPTERS.transformation;
  const cards = stories
    .map((s, i) => {
      const href = storyHref(s, countries);
      return `<a class="st-reel__card" ${linkAttrs(href)} style="--i:${i}">
        <span class="st-reel__img">${s.image ? `<img src="${s.image}" alt="" loading="lazy">` : ""}</span>
        <span class="st-reel__body">
          <span class="st-reel__meta">${metaLine(s, countries)}</span>
          <strong>${s.title}</strong>
          ${s.excerpt ? `<span class="st-reel__excerpt">${s.excerpt}</span>` : ""}
        </span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-chapter st-chapter--transformation" id="${cfg.id}" data-st-section="${cfg.id}">
      <div class="container">
        ${sectionHead(cfg.eyebrow, cfg.titleHtml, cfg.lead)}
        ${cards ? `<div class="st-reel" data-st-stagger>${cards}</div>` : `<p class="st-empty">No transformation stories yet — check back soon.</p>`}
      </div>
    </section>`;
}

/** Community — photo tiles with text over the image. */
function renderCommunity(stories, countries) {
  const cfg = CHAPTERS.community;
  const tiles = stories
    .map((s, i) => {
      const href = storyHref(s, countries);
      return `<a class="st-tile${i === 0 ? " st-tile--big" : ""}" ${linkAttrs(href)} style="--i:${i}">
        ${s.image ? `<img src="${s.image}" alt="" loading="lazy">` : ""}
        <span class="st-tile__veil" aria-hidden="true"></span>
        <span class="st-tile__copy">
          <span class="st-tile__meta">${countryName(countries, s.countryId)}</span>
          <strong>${s.title}</strong>
        </span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-chapter st-chapter--community" id="${cfg.id}" data-st-section="${cfg.id}">
      <div class="container">
        ${sectionHead(cfg.eyebrow, cfg.titleHtml, cfg.lead)}
        ${tiles ? `<div class="st-tiles" data-st-stagger>${tiles}</div>` : `<p class="st-empty">No community stories yet — check back soon.</p>`}
      </div>
    </section>`;
}

/** Leadership — two-column list with round portraits. */
function renderLeadership(stories, countries) {
  const cfg = CHAPTERS.leadership;
  const items = stories
    .map((s, i) => {
      const href = storyHref(s, countries);
      return `<a class="st-voice" ${linkAttrs(href)} style="--i:${i}">
        <span class="st-voice__img">${s.image ? `<img src="${s.image}" alt="" loading="lazy">` : ""}</span>
        <span class="st-voice__body">
          <span class="st-voice__meta">${metaLine(s, countries)}</span>
          <strong>${s.title}</strong>
          ${s.excerpt ? `<span class="st-voice__excerpt">${s.excerpt}</span>` : ""}
        </span>
        <span class="st-voice__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-chapter st-chapter--leadership" id="${cfg.id}" data-st-section="${cfg.id}">
      <div class="container st-voices__layout">
        ${sectionHead(cfg.eyebrow, cfg.titleHtml, cfg.lead)}
        ${items ? `<div class="st-voices" data-st-stagger>${items}</div>` : `<p class="st-empty">No leadership stories yet — check back soon.</p>`}
      </div>
    </section>`;
}

/** Country — image tiles per country. */
function renderCountrySection(countries, allStories) {
  const cards = countries
    .map((c, i) => {
      const list = allStories.filter((s) => s.countryId === c.id);
      const featured =
        list.find((s) => storyCategory(s) === "country" && s.image) || list.find((s) => s.image) || list[0];
      if (!featured) {
        return `<article class="st-atlas__tile st-atlas__tile--empty" style="--i:${i}">
          <span class="st-atlas__copy">
            <strong>${c.name}</strong>
            <span>Stories coming soon</span>
          </span>
        </article>`;
      }
      return `<a class="st-atlas__tile" ${linkAttrs(`#/stories/${c.slug}`)} style="--i:${i}">
        ${featured.image ? `<img src="${featured.image}" alt="" loading="lazy">` : ""}
        <span class="st-atlas__veil" aria-hidden="true"></span>
        <span class="st-atlas__count">${list.length} ${list.length === 1 ? "story" : "stories"}</span>
        <span class="st-atlas__copy">
          <strong>${c.name}</strong>
          <span>${featured.title}</span>
        </span>
      </a>`;
    })
    .join("");

  return `
    <section class="st-places" id="st-country" data-st-section="country" aria-labelledby="st-country-title">
      <div class="container">
        ${sectionHead("Country stories", "<span>Stories by</span> <em>place.</em>", "Open a country to read field stories from that part of the network.")}
        <div class="st-atlas" data-st-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderMediaSection(media = [], stories = [], countries = []) {
  const fromStories = mixCountries(stories.filter((s) => s.image))
    .slice(0, 8)
    .map((s) => ({
      type: "image",
      src: s.image,
      alt: "",
      caption: `${s.title} · ${countryName(countries, s.countryId)}`,
    }));
  const list = media.length ? media : fromStories;

  const items = list
    .map((m, i) => {
      const wide = i % 5 === 0 || i % 5 === 3 ? " st-media--wide" : "";
      return `<figure class="st-media${wide}" style="--i:${i}">
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

  if (!items) return "";

  return `
    <section class="st-media-band" id="st-media" data-st-section="media" aria-labelledby="st-media-title">
      <div class="container">
        ${sectionHead("Photo / video", "<span>From the</span> <em>field.</em>", "Photos and video from communities across the network.", true)}
        <div class="st-media-mosaic" data-st-stagger>${items}</div>
      </div>
    </section>`;
}

/** One story per category, each from a different country where possible. */
function pickFeatured(stories) {
  const picks = [];
  const usedCountries = new Set();
  for (const key of ["transformation", "community", "leadership"]) {
    const pool = stories.filter((s) => storyCategory(s) === key && s.image && !picks.includes(s));
    const hit = pool.find((s) => !usedCountries.has(s.countryId)) || pool[0];
    if (hit) {
      picks.push(hit);
      usedCountries.add(hit.countryId);
    }
  }
  for (const s of stories) {
    if (picks.length >= 3) break;
    if (!s.image || picks.includes(s) || usedCountries.has(s.countryId)) continue;
    picks.push(s);
    usedCountries.add(s.countryId);
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
  const featured = pickFeatured(stories);
  const featuredIds = new Set(featured.map((s) => s.id));
  const byCat = (cat) => mixCountries(stories.filter((s) => storyCategory(s) === cat && !featuredIds.has(s.id)));
  const heroImage = countryFilter ? stories.find((s) => s.image)?.image : HERO_IMAGE;

  return `
    <div class="st-page" data-stories-page>
      ${renderHero(countryFilter, heroImage)}
      ${renderFeatured(featured, countries)}
      ${renderTransformation(byCat("transformation"), countries)}
      ${renderCommunity(byCat("community"), countries)}
      ${renderLeadership(byCat("leadership"), countries)}
      ${renderMediaSection(media, stories, countries)}
      ${renderCountrySection(countryFilter ? [countryFilter] : countries, allStories)}
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
    page.querySelectorAll("[data-st-reveal], [data-st-stagger] > *, [data-st-hero-line]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
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
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 26 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-st-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.07,
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
          trigger: img.closest("figure, a") || img,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      }
    );
  });

  window.setTimeout(() => {
    page.querySelectorAll("[data-st-reveal], [data-st-stagger] > *").forEach((el) => {
      if (window.getComputedStyle(el).opacity === "0") gsap.set(el, { autoAlpha: 1, y: 0, clearProps: "transform" });
    });
  }, 2800);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyStoriesPage() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-stories-page]")) t.kill();
    });
  }
}
