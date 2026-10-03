/**
 * Stories — laid out like the World Bank Academy home page:
 * full-screen hero → intro + four ways in → three featured stories → story carousel
 * → "find your story" selector → stories by program (tabs). PA brand colours and PA stories only.
 */

import { getPaCountries } from "../../utils/work-locations.js";
import { PA_PROGRAMMES } from "../shared/pa-programmes.js";
import { programmeIdFor } from "../shared/pa-model.js";

const HERO_IMAGE = "assets/stories/stories-hero.jpg";

/** Primary category when story.categories is missing. */
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
  "story-tanzania": "leadership",
  "story-rwanda": "leadership",
  "story-burundi": "leadership",
  "story-zambia-crops": "leadership",
  "story-malawi-mary": "transformation",
  "story-jeremiah": "leadership",
  "story-liwedi": "community",
  "story-lilongwe-savings": "community",
  "story-ntchisi-health": "leadership",
  "story-mzimba-cooperative": "community",
};

const CATEGORIES = {
  transformation: { label: "Transformation stories", text: "Longer arcs of change — what shifted for people, churches, and villages." },
  community: { label: "Community stories", text: "Group work, Shalom savings, schools, water, and shared projects." },
  leadership: { label: "Leadership stories", text: "How trained leaders carry the work into homes and congregations." },
};

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function countryOf(countries, id) {
  return countries.find((c) => c.id === id) || null;
}

function storyCategory(story) {
  if (Array.isArray(story.categories) && story.categories.length && CATEGORIES[story.categories[0]]) {
    return story.categories[0];
  }
  return CATEGORY_BY_ID[story.id] || "transformation";
}

function storyHref(story, countries) {
  if (story.slug) return `#/story/${story.slug}`;
  const slug = countryOf(countries, story.countryId)?.slug;
  return slug ? `#/stories/${slug}` : "#/stories";
}

/** Round-robin by country so one country never fills a row. */
function mixCountries(list) {
  const groups = new Map();
  list.forEach((s) => {
    if (!groups.has(s.countryId)) groups.set(s.countryId, []);
    groups.get(s.countryId).push(s);
  });
  const queues = [...groups.values()];
  const out = [];
  while (queues.some((q) => q.length)) queues.forEach((q) => q.length && out.push(q.shift()));
  return out;
}

/** One story per category, each from a different country where possible. */
function pickFeatured(stories) {
  const picks = [];
  const used = new Set();
  for (const key of Object.keys(CATEGORIES)) {
    const pool = stories.filter((s) => storyCategory(s) === key && s.image && !picks.includes(s));
    const hit = pool.find((s) => !used.has(s.countryId)) || pool[0];
    if (hit) {
      picks.push(hit);
      used.add(hit.countryId);
    }
  }
  for (const s of stories) {
    if (picks.length >= 3) break;
    if (s.image && !picks.includes(s)) picks.push(s);
  }
  return picks.slice(0, 3);
}

function img(src, eager = false) {
  return src ? `<img src="${src}" alt="" loading="${eager ? "eager" : "lazy"}" decoding="async">` : `<span class="st-img-blank" aria-hidden="true"></span>`;
}

function renderHero(countryFilter, image) {
  const title = countryFilter ? `${countryFilter.name} stories` : "Stories that explain the data";
  const lead = countryFilter
    ? `Human stories from ${countryFilter.name} that explain the meaning behind the data.`
    : "Human stories that explain the meaning behind the data.";
  return `
    <header class="st-hero" data-st-hero>
      <div class="st-hero__media" aria-hidden="true">
        <img src="${image || HERO_IMAGE}" alt="" fetchpriority="high">
        <span class="st-hero__veil"></span>
      </div>
      <div class="container st-hero__inner">
        ${countryFilter ? `<a class="st-hero__back" ${linkAttrs("#/stories")}>← All stories</a>` : ""}
        <h1 class="st-hero__title">${title}</h1>
        <p class="st-hero__lead">${lead}</p>
      </div>
      <a class="st-hero__scroll" href="#st-intro"><span>Scroll to explore</span><i aria-hidden="true"></i></a>
      <button type="button" class="st-hero__pause" data-st-pause aria-pressed="false" aria-label="Pause background motion">
        <span class="st-hero__pause-icon" aria-hidden="true"></span>
      </button>
    </header>`;
}

function renderIntro(stories, countries, featuredLead) {
  const cards = Object.entries(CATEGORIES).map(([key, c]) => {
    const pic = stories.find((s) => storyCategory(s) === key && s.image)?.image;
    return { key, title: c.label, text: c.text, image: pic };
  });
  cards.push({
    key: "country",
    title: "Country stories",
    text: "Open a country to read field stories from that part of the network.",
    image: mixCountries(stories.filter((s) => s.image)).slice(-1)[0]?.image,
  });

  const items = cards
    .map(
      (c, i) => `<a class="st-way" href="${c.key === "country" ? "#st-find" : "#st-all"}" data-st-way="${c.key}" data-st-reveal style="--i:${i}">
        <span class="st-way__img">${img(c.image)}</span>
        <strong class="st-way__title">${c.title}</strong>
        <span class="st-way__text">${c.text}</span>
      </a>`
    )
    .join("");

  return `
    <section class="st-intro" id="st-intro" aria-labelledby="st-intro-title">
      <div class="container">
        <div class="st-intro__head" data-st-reveal>
          <h2 id="st-intro-title" class="st-h2">Where the numbers become people.</h2>
          ${featuredLead ? `<a class="st-btn st-btn--maroon" ${linkAttrs(storyHref(featuredLead, countries))}>Read the featured story</a>` : ""}
        </div>
        <div class="st-ways">${items}</div>
      </div>
    </section>`;
}

function renderTrio(featured, countries, countryFilter) {
  if (!featured.length) return "";
  const cards = featured
    .map((s, i) => {
      const cat = CATEGORIES[storyCategory(s)];
      return `<article class="st-trio__card" data-st-reveal style="--i:${i}">
        <a class="st-trio__img" ${linkAttrs(storyHref(s, countries))} tabindex="-1" aria-hidden="true">${img(s.image)}</a>
        <div class="st-trio__body">
          <p class="st-tag">${cat.label}</p>
          <h3><a ${linkAttrs(storyHref(s, countries))}>${s.title}</a></h3>
          ${s.excerpt ? `<p class="st-trio__text">${s.excerpt}</p>` : ""}
          <a class="st-more" ${linkAttrs(storyHref(s, countries))}>Read story</a>
        </div>
      </article>`;
    })
    .join("");
  return `
    <section class="st-trio" id="st-featured" aria-labelledby="st-trio-title">
      <div class="container">
        <header class="st-center-head" data-st-reveal>
          <h2 id="st-trio-title" class="st-h2">Featured stories</h2>
          <p>${
            countryFilter
              ? `Transformation, community and leadership stories from ${countryFilter.name}.`
              : "One transformation, one community and one leadership story — each from a different country."
          }</p>
        </header>
        <div class="st-trio__grid">${cards}</div>
      </div>
    </section>`;
}

function renderCarousel(stories, countries) {
  if (!stories.length) return "";
  const cards = stories
    .map((s) => {
      const country = countryOf(countries, s.countryId);
      return `<li class="st-slide" data-st-slide data-st-cat="${storyCategory(s)}">
        <a class="st-slide__card" ${linkAttrs(storyHref(s, countries))}>
          <span class="st-slide__img">${img(s.image)}</span>
          <span class="st-slide__body">
            <span class="st-tag">${country?.name || ""}${s.program ? ` · ${s.program}` : ""}</span>
            <strong>${s.title}</strong>
            ${s.excerpt ? `<span class="st-slide__text">${s.excerpt}</span>` : ""}
          </span>
        </a>
      </li>`;
    })
    .join("");
  return `
    <section class="st-carousel" id="st-all" aria-labelledby="st-all-title" data-st-carousel>
      <div class="container">
        <header class="st-carousel__head" data-st-reveal>
          <div>
            <h2 id="st-all-title" class="st-h2">Stories from across the network</h2>
            <p class="st-carousel__sub" data-st-carousel-label>Every story, mixed across countries.</p>
          </div>
          <div class="st-carousel__nav">
            <button type="button" class="st-carousel__clear" data-st-clear hidden>Show all stories</button>
            <button type="button" class="st-arrow" data-st-prev aria-label="Previous stories">‹</button>
            <button type="button" class="st-arrow" data-st-next aria-label="Next stories">›</button>
          </div>
        </header>
        <ul class="st-carousel__track" data-st-track>${cards}</ul>
        <div class="st-carousel__bar" aria-hidden="true"><span data-st-bar></span></div>
      </div>
    </section>`;
}

function renderFinder(stories, countries, countryFilter) {
  const progIds = new Set(stories.map((s) => programmeIdFor(s.program)).filter(Boolean));
  const programs = PA_PROGRAMMES.filter((p) => progIds.has(p.id));
  const withStories = countries.filter((c) => stories.some((s) => s.countryId === c.id) || c.id === countryFilter?.id);
  const opts = stories
    .map(
      (s) =>
        `<option value="${storyHref(s, countries)}" data-country="${s.countryId}" data-program="${programmeIdFor(s.program) || ""}">${s.title}</option>`
    )
    .join("");
  return `
    <section class="st-find" id="st-find" aria-labelledby="st-find-title">
      <div class="container">
        <h2 id="st-find-title" class="st-h2 st-h2--light" data-st-reveal>Find your story</h2>
        <form class="st-find__form" data-st-finder data-st-reveal onsubmit="return false;">
          <label><span class="sr-only">Select country</span>
            <select data-st-f-country>
              <option value="">Select country</option>
              ${withStories.map((c) => `<option value="${c.id}"${c.id === countryFilter?.id ? " selected" : ""}>${c.name}</option>`).join("")}
            </select>
          </label>
          <label><span class="sr-only">Select program</span>
            <select data-st-f-program>
              <option value="">Select program</option>
              ${programs.map((p) => `<option value="${p.id}">${p.title}</option>`).join("")}
            </select>
          </label>
          <label><span class="sr-only">Select story</span>
            <select data-st-f-story>
              <option value="">Select story</option>
              ${opts}
            </select>
          </label>
          <button type="submit" class="st-btn st-btn--gold" data-st-f-go>Go</button>
        </form>
        ${
          countryFilter
            ? ""
            : `<p class="st-find__countries" data-st-reveal>Or open a country:
                ${withStories.map((c) => `<a ${linkAttrs(`#/stories/${c.slug}`)}>${c.name}</a>`).join("")}</p>`
        }
      </div>
    </section>`;
}

function renderByProgram(stories, countries) {
  const groups = PA_PROGRAMMES.map((p) => ({
    p,
    list: mixCountries(stories.filter((s) => programmeIdFor(s.program) === p.id)).slice(0, 4),
  })).filter((g) => g.list.length);
  if (!groups.length) return "";

  const tabs = groups
    .map(
      (g, i) => `<button type="button" role="tab" class="st-tab${i === 0 ? " is-active" : ""}" id="st-tab-${g.p.id}" aria-controls="st-panel-${g.p.id}" aria-selected="${i === 0}" data-st-tab="${g.p.id}">${g.p.panelLabel}</button>`
    )
    .join("");

  const panels = groups
    .map(
      (g, i) => `<div class="st-panel" role="tabpanel" id="st-panel-${g.p.id}" aria-labelledby="st-tab-${g.p.id}" data-st-panel="${g.p.id}"${i === 0 ? "" : " hidden"}>
        <div class="st-panel__intro">
          <h3>${g.p.title}</h3>
          <p>${g.p.description}</p>
          <a class="st-more" href="#/program/${g.p.id}" data-link>About this program</a>
        </div>
        <ul class="st-panel__grid">
          ${g.list
            .map(
              (s) => `<li><a class="st-pcard" ${linkAttrs(storyHref(s, countries))}>
                <span class="st-pcard__img">${img(s.image)}</span>
                <span class="st-tag">${countryOf(countries, s.countryId)?.name || ""}</span>
                <strong>${s.title}</strong>
                ${s.excerpt ? `<span class="st-pcard__text">${s.excerpt}</span>` : ""}
              </a></li>`
            )
            .join("")}
        </ul>
      </div>`
    )
    .join("");

  return `
    <section class="st-programs" id="st-programs" aria-labelledby="st-programs-title">
      <div class="container">
        <header class="st-center-head" data-st-reveal>
          <h2 id="st-programs-title" class="st-h2">Stories by program</h2>
          <p>Read how each of PA's five programs looks in a real place.</p>
        </header>
        <div class="st-tabs" role="tablist" aria-label="PA programs" data-st-reveal>${tabs}</div>
        ${panels}
      </div>
    </section>`;
}

export function renderStoriesPage(data, countrySlug = null) {
  const countries = getPaCountries(data);
  const countryFilter = countrySlug ? countries.find((c) => c.slug === countrySlug) || null : null;
  const all = data.stories?.stories || [];
  const stories = countryFilter ? all.filter((s) => s.countryId === countryFilter.id) : all;
  const featured = pickFeatured(stories);
  const heroImage = countryFilter ? stories.find((s) => s.image)?.image : HERO_IMAGE;

  return `
    <div class="st-page" data-stories-page>
      ${renderHero(countryFilter, heroImage)}
      ${renderIntro(stories, countries, featured[0])}
      ${renderTrio(featured, countries, countryFilter)}
      ${renderCarousel(mixCountries(stories), countries)}
      ${renderFinder(countryFilter ? stories : all, countries, countryFilter)}
      ${renderByProgram(stories, countries)}
    </div>`;
}

let cleanups = [];

export function mountStoriesPage() {
  const page = document.querySelector("[data-stories-page]");
  if (!page) return;
  destroyStoriesPage();
  cleanups = [bindReveal(page), bindHero(page), bindCarousel(page), bindFinder(page), bindTabs(page)];

  const anchor = location.hash.match(/#(st-[a-z-]+)$/)?.[1];
  if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

export function destroyStoriesPage() {
  cleanups.forEach((fn) => typeof fn === "function" && fn());
  cleanups = [];
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function bindReveal(page) {
  const els = [...page.querySelectorAll("[data-st-reveal]")];
  if (reduced() || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.classList.add("is-in"));
    return null;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function bindHero(page) {
  const hero = page.querySelector("[data-st-hero]");
  const btn = page.querySelector("[data-st-pause]");
  if (!hero || !btn) return null;
  requestAnimationFrame(() => hero.classList.add("is-ready"));
  if (reduced()) {
    hero.classList.add("is-paused");
    btn.hidden = true;
  }
  const onClick = () => {
    const paused = hero.classList.toggle("is-paused");
    btn.setAttribute("aria-pressed", String(paused));
    btn.setAttribute("aria-label", paused ? "Play background motion" : "Pause background motion");
  };
  btn.addEventListener("click", onClick);
  return () => btn.removeEventListener("click", onClick);
}

function bindCarousel(page) {
  const root = page.querySelector("[data-st-carousel]");
  if (!root) return null;
  const track = root.querySelector("[data-st-track]");
  const bar = root.querySelector("[data-st-bar]");
  const prev = root.querySelector("[data-st-prev]");
  const next = root.querySelector("[data-st-next]");
  const clear = root.querySelector("[data-st-clear]");
  const label = root.querySelector("[data-st-carousel-label]");
  const defaultLabel = label?.textContent || "";
  const slides = [...root.querySelectorAll("[data-st-slide]")];

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 1;
    if (bar) bar.style.transform = `scaleX(${Math.max(0.08, p)})`;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  const step = (dir) => {
    const first = slides.find((s) => !s.hidden);
    const w = first ? first.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * w * (window.innerWidth > 760 ? 2 : 1), behavior: reduced() ? "auto" : "smooth" });
  };
  const filter = (cat) => {
    slides.forEach((s) => (s.hidden = Boolean(cat) && s.dataset.stCat !== cat));
    if (clear) clear.hidden = !cat;
    if (label) label.textContent = cat ? `Showing ${CATEGORIES[cat]?.label.toLowerCase()}.` : defaultLabel;
    track.scrollLeft = 0;
    update();
  };

  const onPrev = () => step(-1);
  const onNext = () => step(1);
  const onClear = () => filter("");
  const onWay = (e) => {
    const way = e.target.closest("[data-st-way]");
    if (!way) return;
    e.preventDefault();
    const cat = way.dataset.stWay;
    const target = cat === "country" ? page.querySelector("#st-find") : root;
    if (cat !== "country") filter(cat);
    target?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  clear?.addEventListener("click", onClear);
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  page.addEventListener("click", onWay);
  update();

  return () => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    clear?.removeEventListener("click", onClear);
    track.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    page.removeEventListener("click", onWay);
  };
}

function bindFinder(page) {
  const form = page.querySelector("[data-st-finder]");
  if (!form) return null;
  const country = form.querySelector("[data-st-f-country]");
  const program = form.querySelector("[data-st-f-program]");
  const story = form.querySelector("[data-st-f-story]");
  const options = [...story.querySelectorAll("option[value]:not([value=''])")];

  const narrow = () => {
    options.forEach((o) => {
      const ok = (!country.value || o.dataset.country === country.value) && (!program.value || o.dataset.program === program.value);
      o.hidden = !ok;
      o.disabled = !ok;
    });
    if (story.selectedOptions[0]?.disabled) story.value = "";
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (story.value) {
      location.hash = story.value.replace(/^#/, "");
      return;
    }
    const first = options.find((o) => !o.disabled);
    if (first) location.hash = first.value.replace(/^#/, "");
  };

  country.addEventListener("change", narrow);
  program.addEventListener("change", narrow);
  form.addEventListener("submit", onSubmit);
  narrow();
  return () => {
    country.removeEventListener("change", narrow);
    program.removeEventListener("change", narrow);
    form.removeEventListener("submit", onSubmit);
  };
}

function bindTabs(page) {
  const tabs = [...page.querySelectorAll("[data-st-tab]")];
  const panels = [...page.querySelectorAll("[data-st-panel]")];
  if (!tabs.length) return null;
  const show = (id, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.stTab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => (p.hidden = p.dataset.stPanel !== id));
  };
  const handlers = tabs.map((t, i) => {
    const onClick = () => show(t.dataset.stTab);
    const onKey = (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      show(tabs[(i + d + tabs.length) % tabs.length].dataset.stTab, true);
    };
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", onClick);
    t.addEventListener("keydown", onKey);
    return () => {
      t.removeEventListener("click", onClick);
      t.removeEventListener("keydown", onKey);
    };
  });
  return () => handlers.forEach((fn) => fn());
}
