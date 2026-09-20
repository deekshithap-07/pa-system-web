/**
 * Country hub — mini PA country portal (not a dashboard).
 * Section order matches the country-page content brief.
 */

import { formatNumber } from "../../utils/format.js";
import { storiesForCountry } from "../../utils/work-locations.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { resolvePaProgrammes } from "../shared/pa-programmes.js";
import { renderExploreBridge, BRIDGE } from "../shared/site-bridge.js";
import { bindPartnerContact } from "../contact-modal.js";

function storyHref(story) {
  return `#/story/${story.slug}`;
}

function storyHeroImage(story, hub) {
  return hub?.heroStoryImages?.[story.id] || story.image;
}

export function featuredStories(data, hub) {
  const fromHub = hub.stories || [];
  if (fromHub.length) return fromHub;
  return storiesForCountry(data, hub.country?.id);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STAT_ORDER = ["communities", "pastors", "catchments", "growth", "ppp", "households"];

/* 1 — Country introduction and PA presence */
export function renderCountryIntro(hub) {
  const slug = hub.country?.slug || "";
  const presence = hub.isPaNetwork
    ? `Possibilities Africa is present in ${hub.countryName} through pastor-led networks, nearby community groups, and a shared two-year journey.`
    : `This page shares regional context for ${hub.countryName}. Possibilities Africa does not currently operate a full network here.`;

  return `
    <section class="cp-intro" data-cp-section="intro" aria-labelledby="cp-intro-title">
      <div class="container cp-intro__inner" data-cp-reveal>
        <p class="cp-kicker">${hub.heroTagline || "Where we work"}</p>
        <h1 id="cp-intro-title" class="cp-intro__name">${hub.countryName}</h1>
        <p class="cp-intro__lead">${hub.overview || hub.description || presence}</p>
        <p class="cp-intro__presence">${presence}</p>
        <div class="cp-intro__actions">
          <a class="cp-btn cp-btn--solid" href="#cp-where">See where PA works</a>
          <a class="cp-btn cp-btn--ghost" href="#/country/${slug}/stories" data-link>Country stories</a>
        </div>
      </div>
    </section>`;
}

/* 2 — Key statistics */
export function renderCountryStats(hub) {
  const byId = Object.fromEntries((hub.kpis || []).map((k) => [k.id, k]));
  const stats = STAT_ORDER.map((id) => byId[id]).filter(Boolean).slice(0, 5);
  if (!stats.length) return "";

  const items = stats
    .map((k) => {
      const value =
        k.text ||
        (typeof k.value === "number"
          ? k.value >= 1000
            ? formatNumber(k.value)
            : `${k.prefix || ""}${k.value}${k.suffix || ""}`
          : k.value);
      return `
        <article class="cp-stats__item" data-cp-reveal>
          <strong class="cp-stats__value">${value}</strong>
          <span class="cp-stats__label">${k.label}</span>
          ${k.trend ? `<span class="cp-stats__trend">${k.trend}</span>` : ""}
        </article>`;
    })
    .join("");

  return `
    <section class="cp-stats" data-cp-section="stats" aria-labelledby="cp-stats-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Key statistics</p>
          <h2 id="cp-stats-title" class="cp-sec-title">${hub.countryName} at a glance</h2>
          <p class="cp-sec-lead">A short national picture — then the places, programmes, and stories behind it.</p>
        </header>
        <div class="cp-stats__row">${items}</div>
      </div>
    </section>`;
}

/* 3 — Country map */
export function renderCountryMapSection(hub) {
  if (!hub.geoMap) {
    return `
      <section class="cp-map" id="cp-map" data-cp-section="map" aria-labelledby="cp-map-title">
        <div class="container">
          <header class="cp-sec-head" data-cp-reveal>
            <p class="cp-kicker">Country map</p>
            <h2 id="cp-map-title" class="cp-sec-title">Map of ${hub.countryName}</h2>
            <p class="cp-sec-lead">Catchment mapping will appear as geographic data expands.</p>
          </header>
        </div>
      </section>`;
  }

  return `
    <section class="cp-map" id="cp-map" data-cp-section="map" aria-labelledby="cp-map-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Country map</p>
          <h2 id="cp-map-title" class="cp-sec-title">Map of ${hub.countryName}</h2>
          <p class="cp-sec-lead">Nearby groups across the country — click a place to open its communities.</p>
        </header>
        <div class="cp-map__frame" data-cp-reveal>
          ${renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "country-portal" })}
        </div>
      </div>
    </section>`;
}

/* 4 — Where PA is working */
export function renderCountryWhere(hub) {
  const catchments = hub.catchments || [];
  const slug = hub.country?.slug || "";

  const cards = catchments.length
    ? catchments
        .map(
          (c) => `
        <a class="cp-where__card" href="#/catchment/${slug}/${c.slug}" data-link data-cp-reveal>
          <strong>${c.name}</strong>
          <span>${c.region || "Nearby community group"}</span>
          <span class="cp-where__go">Open group →</span>
        </a>`
        )
        .join("")
    : `<p class="cp-empty" data-cp-reveal>Nearby groups will appear as the work grows in ${hub.countryName}.</p>`;

  return `
    <section class="cp-where" id="cp-where" data-cp-section="where" aria-labelledby="cp-where-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Where PA is working</p>
          <h2 id="cp-where-title" class="cp-sec-title">Nearby groups in ${hub.countryName}</h2>
          <p class="cp-sec-lead">Each group brings 3–5 neighbouring communities together under coordinated pastor leadership.</p>
        </header>
        <div class="cp-where__grid">${cards}</div>
      </div>
    </section>`;
}

/* 5 — Programmes and activities */
export function renderCountryProgrammes(hub, data) {
  const programmes = resolvePaProgrammes(data?.home?.ourWork?.programs);
  const activities = hub.activities || [];

  const progHtml = programmes
    .map(
      (p) => `
      <article class="cp-prog__item cp-prog__item--${p.tone || "maroon"}" data-cp-reveal>
        <h3>${p.title}</h3>
        <p>${p.description || p.text}</p>
        <a href="${p.href || "#/work"}" data-link>Learn more →</a>
      </article>`
    )
    .join("");

  const actHtml = activities.length
    ? `<ul class="cp-prog__feed">${activities
        .slice(0, 6)
        .map(
          (a) => `<li data-cp-reveal>
            <time datetime="${a.date || ""}">${formatDate(a.date)}</time>
            <strong>${a.project}</strong>
            <span>${a.community}${a.status ? ` · ${a.status}` : ""}</span>
          </li>`
        )
        .join("")}</ul>`
    : `<p class="cp-empty">Field activities for this country will appear here.</p>`;

  return `
    <section class="cp-prog" data-cp-section="programmes" aria-labelledby="cp-prog-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Programmes and activities</p>
          <h2 id="cp-prog-title" class="cp-sec-title">How the work runs in ${hub.countryName}</h2>
          <p class="cp-sec-lead">The five Possibilities Africa programmes, with recent field activity from this country.</p>
        </header>
        <div class="cp-prog__grid">${progHtml}</div>
        <div class="cp-prog__activities">
          <h3 class="cp-prog__sub">Recent field activity</h3>
          ${actHtml}
        </div>
      </div>
    </section>`;
}

/* 6 — Growth / progress trends */
export function renderCountryTrends(hub) {
  const charts = hub.charts || {};
  const keys = ["growthOverTime", "communitiesAdded", "leadershipDev", "householdsReached"].filter((k) => charts[k]);
  if (!keys.length) return "";

  const cards = keys
    .slice(0, 3)
    .map(
      (key) => `
      <article class="cp-trends__card" data-chart="${key}" data-cp-reveal>
        <h3>${charts[key].title}</h3>
        <div class="cp-trends__canvas"><canvas aria-label="${charts[key].title}"></canvas></div>
      </article>`
    )
    .join("");

  return `
    <section class="cp-trends" data-cp-section="trends" aria-labelledby="cp-trends-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Growth and progress</p>
          <h2 id="cp-trends-title" class="cp-sec-title">Trends in ${hub.countryName}</h2>
          <p class="cp-sec-lead">How reach and leadership have moved over time — figures that sit beside the stories below.</p>
        </header>
        <div class="cp-trends__grid">${cards}</div>
      </div>
    </section>`;
}

/* 7 — Featured transformation stories */
export function renderCountryFeaturedStories(hub, stories = []) {
  const list = (stories.length ? stories : hub.stories || []).slice(0, 4);
  const allHref = `#/country/${hub.country?.slug || ""}/stories`;

  if (!list.length) {
    return `
      <section class="cp-stories" data-cp-section="stories" aria-labelledby="cp-stories-title">
        <div class="container">
          <header class="cp-sec-head" data-cp-reveal>
            <p class="cp-kicker">Featured stories</p>
            <h2 id="cp-stories-title" class="cp-sec-title">Transformation stories from ${hub.countryName}</h2>
            <p class="cp-sec-lead">Stories from this country will appear here as they are published.</p>
          </header>
        </div>
      </section>`;
  }

  const panels = list
    .map((s, i) => {
      const src = storyHeroImage(s, hub);
      return `
        <article class="cp-reel__panel${i === 0 ? " is-active" : ""}" data-cp-panel="${i}">
          <a class="cp-reel__hit" href="${storyHref(s)}" data-link aria-label="${s.title}">
            <span class="cp-reel__photo" aria-hidden="true">${src ? `<img src="${src}" alt="" loading="${i === 0 ? "eager" : "lazy"}" decoding="async">` : ""}</span>
            <span class="cp-reel__veil" aria-hidden="true"></span>
            <span class="cp-reel__copy">
              <span class="cp-kicker cp-kicker--light">${s.program || hub.countryName}</span>
              <strong class="cp-reel__title">${s.title}</strong>
              ${s.excerpt ? `<span class="cp-reel__excerpt">${s.excerpt}</span>` : ""}
              <span class="cp-reel__go">Read the story →</span>
            </span>
          </a>
        </article>`;
    })
    .join("");

  const peeks = list
    .map(
      (s, i) => `
      <button type="button" class="cp-reel__peek${i === 0 ? " is-active" : ""}" data-cp-peek="${i}" aria-pressed="${i === 0 ? "true" : "false"}">
        <span class="cp-reel__peek-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="cp-reel__peek-label">${s.title}</span>
      </button>`
    )
    .join("");

  return `
    <section class="cp-stories" data-cp-section="stories" aria-labelledby="cp-stories-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row" data-cp-reveal>
          <div>
            <p class="cp-kicker">Featured transformation stories</p>
            <h2 id="cp-stories-title" class="cp-sec-title">Stories from ${hub.countryName}</h2>
            <p class="cp-sec-lead">People and places where faith, families, and daily life are changing together.</p>
          </div>
          <a class="cp-text-link" href="${allHref}" data-link>All stories →</a>
        </header>
      </div>
      <div class="cp-reel" data-cp-reel>
        <div class="cp-reel__stage">${panels}</div>
        <div class="cp-reel__peeks" role="tablist" aria-label="Featured stories">${peeks}</div>
      </div>
    </section>`;
}

/* 8 — Country reports and resources */
export function renderCountryReports(hub) {
  const reports = hub.reports || [];
  const slug = hub.country?.slug || "";

  const list = reports.length
    ? `<ul class="cp-reports__list">${reports
        .map(
          (r) => `<li data-cp-reveal>
            <a href="#/field-reports" class="cp-reports__row" data-link>
              <strong>${r.title}</strong>
              <span>${r.summary || r.period || ""}</span>
            </a>
          </li>`
        )
        .join("")}</ul>`
    : `<p class="cp-empty" data-cp-reveal>Reports for this country will appear here.</p>`;

  return `
    <section class="cp-reports" data-cp-section="reports" aria-labelledby="cp-reports-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row" data-cp-reveal>
          <div>
            <p class="cp-kicker">Reports and resources</p>
            <h2 id="cp-reports-title" class="cp-sec-title">${hub.countryName} field evidence</h2>
            <p class="cp-sec-lead">Ministry updates and resources tied to this country.</p>
          </div>
          <a class="cp-text-link" href="#/field-reports" data-link>Open Field Reports →</a>
        </header>
        ${list}
        <div class="cp-reports__more" data-cp-reveal>
          <a href="#/resources" data-link>Knowledge Hub</a>
          <a href="#/country/${slug}/data" data-link>Country data page</a>
          <a href="#/scorecard" data-link>Our results</a>
        </div>
      </div>
    </section>`;
}

/* 9 — Recent updates */
export function renderCountryUpdates(hub, data) {
  const slug = hub.country?.slug || "";
  const news = (data?.newsUpdates?.countryUpdates || []).filter((u) => u.slug === slug);
  const activities = (hub.activities || []).slice(0, 4);

  const newsHtml = news.length
    ? news
        .map(
          (u) => `
        <article class="cp-updates__item" data-cp-reveal>
          <span class="cp-updates__when">${u.dateLabel || "Update"}</span>
          <h3>${u.title}</h3>
          ${u.href ? `<a href="${u.href}" data-link>Read update →</a>` : ""}
        </article>`
        )
        .join("")
    : "";

  const actHtml = activities.length
    ? activities
        .map(
          (a) => `
        <article class="cp-updates__item" data-cp-reveal>
          <span class="cp-updates__when">${formatDate(a.date)}</span>
          <h3>${a.project}</h3>
          <p>${a.community}${a.status ? ` · ${a.status}` : ""}</p>
        </article>`
        )
        .join("")
    : "";

  const body = newsHtml || actHtml
    ? `<div class="cp-updates__grid">${newsHtml || actHtml}</div>`
    : `<p class="cp-empty" data-cp-reveal>Recent updates for ${hub.countryName} will appear here.</p>`;

  return `
    <section class="cp-updates" data-cp-section="updates" aria-labelledby="cp-updates-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row" data-cp-reveal>
          <div>
            <p class="cp-kicker">Recent updates</p>
            <h2 id="cp-updates-title" class="cp-sec-title">What is happening now</h2>
            <p class="cp-sec-lead">Short notes from the field in ${hub.countryName}.</p>
          </div>
          <a class="cp-text-link" href="#/news" data-link>All news →</a>
        </header>
        ${body}
      </div>
    </section>`;
}

/* 10 — Contact / engagement */
export function renderCountryEngage(hub) {
  const slug = hub.country?.slug || "";
  const name = hub.countryName;
  const bridge = BRIDGE.country(slug, name);

  return `
    <section class="cp-engage" data-cp-section="engage" aria-labelledby="cp-engage-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Contact and engagement</p>
          <h2 id="cp-engage-title" class="cp-sec-title">Walk with the work in ${name}</h2>
          <p class="cp-sec-lead">Partner with Possibilities Africa, open a nearby group, or follow the wider network story.</p>
        </header>
        <div class="cp-engage__panel" data-cp-reveal>
          <div>
            <p>Reach the team about partnership, visits, or prayer for ${name}.</p>
            <button type="button" class="cp-btn cp-btn--solid" data-partner-contact>Get in touch</button>
          </div>
          <div class="cp-engage__links">
            <a href="#/africa" data-link>Where we work</a>
            <a href="#/work" data-link>What we do</a>
            <a href="#/scorecard" data-link>Our results</a>
          </div>
        </div>
      </div>
    </section>
    ${renderExploreBridge(bridge)}`;
}

export function bindCountryStoryHero(root) {
  const reel = root.querySelector("[data-cp-reel]");
  if (!reel) return;

  const panels = [...reel.querySelectorAll("[data-cp-panel]")];
  const peeks = [...reel.querySelectorAll("[data-cp-peek]")];
  if (!panels.length) return;

  const activate = (i) => {
    panels.forEach((p, n) => p.classList.toggle("is-active", n === i));
    peeks.forEach((p, n) => {
      const on = n === i;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  peeks.forEach((peek) => {
    const i = Number(peek.dataset.cpPeek);
    peek.addEventListener("mouseenter", () => activate(i));
    peek.addEventListener("focus", () => activate(i));
    peek.addEventListener("click", (e) => {
      e.preventDefault();
      activate(i);
    });
  });
}

export function bindCountryMap(root, countrySlug) {
  bindHubGeoMap(root, { countrySlug });
}

export function bindCountryEngage(root) {
  return bindPartnerContact(root);
}

/** Country-page-only motion language. */
export function initCountryPageAnimations(root = document) {
  const page = root.querySelector?.("[data-country-hub]") || document.querySelector("[data-country-hub]");
  if (!page || typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("cp-page--reduced");
    return;
  }

  page.querySelectorAll("[data-cp-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  const reel = page.querySelector("[data-cp-reel]");
  if (reel) {
    const stage = reel.querySelector(".cp-reel__stage");
    const peeks = reel.querySelectorAll(".cp-reel__peek");
    if (stage) {
      gsap.fromTo(
        stage,
        { clipPath: "inset(8% 12% 8% 12% round 0)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: reel, start: "top 85%", once: true },
        }
      );
    }
    if (peeks.length) {
      gsap.fromTo(
        peeks,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: reel, start: "top 80%", once: true },
        }
      );
    }
  }

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

/* Legacy exports kept so older imports do not break mid-refactor */
export function renderCountryStoryHero(hub, stories) {
  return renderCountryFeaturedStories(hub, stories);
}
export function renderByTheNumbers(hub) {
  return renderCountryStats(hub);
}
export function renderCountryOverview() {
  return "";
}
export function renderCountryLatest() {
  return "";
}
export function renderCountryProjects(hub) {
  return renderCountryWhere(hub) + renderCountryReports(hub);
}
export function bindNumbersCarousel() {}
export function bindOverviewTabs() {}
