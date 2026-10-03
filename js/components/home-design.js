/**
 * Home sections aligned to PA Website Designs mockup.
 * Brand palette: maroon / gold / green. Institutional website, not a dashboard.
 */

import { formatPaTitle } from "../utils/pa-title.js";
import { formatNumber } from "../utils/format.js";
import {
  getCountryBySlug,
  getCatchmentsByCountry,
  getCommunitiesByCatchment,
} from "../utils/data.js";
import { PA_FLOW } from "./shared/pa-model.js";
import { PA_PROGRAMMES } from "./shared/pa-programmes.js";
import { bindPppExplorer } from "./shared/pa-ppp-explorer.js";
import { cover as khCover } from "./resources/knowledge-hub-page.js";

const PROGRAM_ICONS = {
  leadership: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="16" r="6" stroke="currentColor" stroke-width="2"/><path d="M10 38c2.5-7 8-11 14-11s11.5 4 14 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="18" r="4" stroke="currentColor" stroke-width="2"/></svg>`,
  discipleship: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 8v28M16 16h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2"/></svg>`,
  economic: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 38V18M24 18c4-6 10-8 14-8-2 6-4 12-8 16M24 18c-4-6-10-8-14-8 2 6 4 12 8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 38h24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  youth: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="18" r="4" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="18" r="4" stroke="currentColor" stroke-width="2"/><path d="M24 22v8M16 38c1.5-6 5-9 8-9s6.5 3 8 9M8 36c1-4 3.5-6 5.5-6M40 36c-1-4-3.5-6-5.5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  citizenship: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2"/><path d="M10 24h28M24 10c4 4 6 9 6 14s-2 10-6 14c-4-4-6-9-6-14s2-10 6-14z" stroke="currentColor" stroke-width="2"/></svg>`,
};

function linkAttrs(href = "#") {
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

export { formatPaTitle } from "../utils/pa-title.js";

const ENTRY_ICONS = {
  country: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  program: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  impact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M6 16v-4M11 16V8M16 16v-6M21 4l-5 5-3-3-4 4"/></svg>`,
  story: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-4-3H6a2 2 0 0 1-2-2z"/><path d="M8 8h8M8 12h5"/></svg>`,
  knowledge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>`,
};

/** Explore PA your way — five ways in, each with a hover dropdown of quick links. */
export function renderPaWays(section = {}) {
  const entries = section.entries || [];
  if (!entries.length) return "";
  const wayHref = (e) => (e.scroll ? `href="${e.href}" data-pa-scroll="${e.href.replace(/^#/, "")}"` : linkAttrs(e.href));
  const ways = entries
    .map(
      (e, i) => `<li class="pa-ways__item" style="--i:${i}" data-pa-ways-item>
        <div class="pa-ways__bar">
          <a class="pa-ways__tab" ${wayHref(e)}>
            <span class="pa-ways__tab-icon" aria-hidden="true">${ENTRY_ICONS[e.id] || ENTRY_ICONS.program}</span>
            <span class="pa-ways__tab-label">${e.label}</span>
          </a>
          <button type="button" class="pa-ways__toggle" aria-expanded="false" aria-controls="pa-ways-drop-${e.id}"
            aria-label="Show ${e.label.toLowerCase()} links" data-pa-ways-toggle>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <div class="pa-ways__drop" id="pa-ways-drop-${e.id}">
          <p class="pa-ways__drop-text">${e.text}</p>
          ${
            (e.links || []).length
              ? `<ul class="pa-ways__links">${e.links
                  .map((l, j) => `<li style="--j:${j}"><a class="pa-ways__link" ${linkAttrs(l.href)}>${l.label}<span aria-hidden="true">→</span></a></li>`)
                  .join("")}</ul>`
              : ""
          }
          <a class="pa-ways__go" ${wayHref(e)}>${e.go || e.label} <span aria-hidden="true">→</span></a>
        </div>
      </li>`
    )
    .join("");

  return `
    <section class="pa-ways" aria-labelledby="pa-ways-title" data-home-section="ways" data-pa-ways>
      <div class="container">
        <h2 class="pa-ways__title pa-title" id="pa-ways-title" data-reveal data-anim="fade-up">${section.entryTitle || "Explore PA your way"}</h2>
        <nav aria-labelledby="pa-ways-title" data-reveal data-anim="fade-up">
          <ul class="pa-ways__menu">${ways}</ul>
        </nav>
      </div>
    </section>`;
}

/** Who is PA, why it exists, what it works toward — PA's own words. */
export function renderPaIntro(section = {}, about = {}) {
  const hero = about.hero || {};
  const vm = about.visionMission || {};
  const philosophy = about.whoWeAre || {};
  if (!hero.title && !vm.mission) return "";
  const cta = section.aboutCta || { label: "Read our story", href: "#/about" };

  const pillar = (label, text, n) =>
    text
      ? `<div class="pa-intro__pillar" style="--i:${n}" data-pa-pillar>
          <button type="button" class="pa-intro__pillar-head" aria-expanded="false" aria-controls="pa-pillar-${n}">
            <span class="pa-intro__pillar-n">${String(n + 1).padStart(2, "0")}</span>
            <h3>${label}</h3>
            <span class="pa-intro__pillar-plus" aria-hidden="true"></span>
          </button>
          <div class="pa-intro__pillar-body" id="pa-pillar-${n}">
            <p>${text}</p>
          </div>
        </div>`
      : "";

  return `
    <section class="pa-intro" id="who-is-pa" aria-labelledby="pa-intro-title" data-home-section="intro">
      <div class="container">
        <div class="pa-intro__top">
          <header class="pa-intro__head" data-reveal data-anim="fade-up">
            ${section.eyebrow ? `<p class="pa-intro__eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="pa-intro-title" class="pa-title">${formatPaTitle(hero, "We Are Africa.")}</h2>
            ${hero.lead ? `<p class="pa-intro__lead">${hero.lead}</p>` : ""}
            <a class="pa-intro__about" ${linkAttrs(cta.href)}>${cta.label} <span aria-hidden="true">→</span></a>
          </header>
          <div class="pa-intro__pillars" data-reveal data-stagger="fade-up">
            ${pillar(section.whyLabel || "Why PA exists", vm.mission?.text, 0)}
            ${pillar(section.whatLabel || "The transformation we work toward", vm.vision?.text, 1)}
            ${pillar(section.howLabel || "How we approach it", philosophy.points?.[2] || philosophy.lead, 2)}
          </div>
        </div>
      </div>
    </section>`;
}

/** Pillars stay collapsed to their titles; hover (fine pointers) or click opens one at a time. */
export function bindPaIntro(root = document) {
  const pillars = [...root.querySelectorAll("[data-pa-pillar]")];
  if (!pillars.length || pillars[0].dataset.bound) return;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setOpen = (pillar, on) => {
    pillar.classList.toggle("is-open", on);
    pillar.querySelector(".pa-intro__pillar-head")?.setAttribute("aria-expanded", String(on));
  };

  pillars.forEach((pillar) => {
    pillar.dataset.bound = "true";
    pillar.querySelector(".pa-intro__pillar-head")?.addEventListener("click", () => {
      const next = !pillar.classList.contains("is-open");
      pillars.forEach((p) => setOpen(p, p === pillar && next));
    });
    if (canHover) {
      pillar.addEventListener("mouseenter", () => pillars.forEach((p) => setOpen(p, p === pillar)));
    }
  });

  if (canHover) {
    pillars[0].parentElement?.addEventListener("mouseleave", () => pillars.forEach((p) => setOpen(p, false)));
  }

  bindPaWays(root);
}

/**
 * Explore PA your way — each tab opens its dropdown on hover (fine pointers) or via the
 * chevron (touch / keyboard); clicking the tab itself goes to its page or section.
 */
function bindPaWays(root = document) {
  const box = root.querySelector("[data-pa-ways]");
  if (!box || box.dataset.bound) return;
  box.dataset.bound = "true";
  const items = [...box.querySelectorAll("[data-pa-ways-item]")];
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setOpen = (item, on) => {
    item.classList.toggle("is-open", on);
    item.querySelector("[data-pa-ways-toggle]")?.setAttribute("aria-expanded", String(on));
  };
  const closeAll = (except) => items.forEach((it) => it !== except && setOpen(it, false));

  items.forEach((item) => {
    item.querySelector("[data-pa-ways-toggle]")?.addEventListener("click", () => {
      const next = !item.classList.contains("is-open");
      closeAll(item);
      setOpen(item, next);
    });
    if (canHover) {
      item.addEventListener("mouseenter", () => {
        closeAll(item);
        setOpen(item, true);
      });
      item.addEventListener("mouseleave", () => setOpen(item, false));
    }
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) setOpen(item, false);
    });
    item.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !item.classList.contains("is-open")) return;
      setOpen(item, false);
      item.querySelector(".pa-ways__tab")?.focus();
    });
  });

  box.querySelectorAll("[data-pa-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.getElementById(link.dataset.paScroll);
      if (!target) return;
      e.preventDefault();
      closeAll();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });
}

/** Explore Africa — heading, one tab per PA country (opens the country panel), then the interactive map. */
export function renderAfricaMapBand(band = {}, countries = []) {
  const explore = band.exploreCta || { label: "Explore Africa", href: "#/africa" };
  const exploreHref = explore.href || explore.target || "#/africa";
  const tabs = countries
    .filter((c) => c.isPaNetwork)
    .map(
      (c) => `<button type="button" class="pa-africa__tab" role="tab" aria-selected="false" data-pa-country-pick="${c.slug}">${c.name}</button>`
    )
    .join("");
  return `
    <section class="pa-africa" id="pa-across-africa" aria-labelledby="pa-africa-title" data-home-section="africa">
      <div class="pa-africa__geo" aria-hidden="true">
        <span class="pa-africa__geo-arc">
          <svg class="pa-africa__geo-ring" viewBox="0 0 100 100" focusable="false">
            <circle cx="50" cy="50" r="49.2" pathLength="1"></circle>
          </svg>
          <span class="pa-africa__geo-dot pa-africa__geo-dot--a"></span>
          <span class="pa-africa__geo-dot pa-africa__geo-dot--b"></span>
          <span class="pa-africa__geo-dot pa-africa__geo-dot--c"></span>
          <span class="pa-africa__geo-dot pa-africa__geo-dot--d"></span>
          <span class="pa-africa__geo-dot pa-africa__geo-dot--e"></span>
        </span>
      </div>
      <div class="container pa-africa__top">
        <div class="pa-africa__intro">
          <p class="pa-africa__eyebrow" data-pa-africa-rise>${band.eyebrow || "Explore Africa"}</p>
          <h2 class="pa-africa__title pa-title" id="pa-africa-title" data-pa-africa-rise>${formatPaTitle(band, "A growing movement of transformation")}</h2>
          ${band.lead ? `<p class="pa-africa__lead" data-pa-africa-rise>${band.lead}</p>` : ""}
          <a class="pa-africa__link" data-pa-africa-rise ${linkAttrs(exploreHref)}>${explore.label || "Explore Africa"} →</a>
        </div>
      </div>
      ${
        tabs
          ? `<div class="container pa-africa__region">
              <p class="pa-africa__region-label" id="pa-africa-region-label" data-reveal data-anim="fade-up">${band.regionLabel || "Explore by region"}</p>
              <div class="pa-africa__tabs pa-africa__tabs--pills" role="tablist" aria-labelledby="pa-africa-region-label" data-reveal data-stagger="fade-up">${tabs}</div>
            </div>`
          : ""
      }
      <div class="pa-africa__bridge" aria-hidden="true">
        <span class="pa-africa__bridge-line"></span>
        <span class="pa-africa__bridge-dot"></span>
        <span class="pa-africa__bridge-dot"></span>
        <span class="pa-africa__bridge-dot"></span>
        <span class="pa-africa__bridge-label">Geographic exploration</span>
      </div>
      <div class="pa-africa__map-stage" data-reveal data-anim="fade-up">
        <div class="pa-africa__map-host l1-map__host africa-map-host" id="home-africa-map-root" aria-label="Interactive Africa map"></div>
        <p class="pa-africa__hint">Scroll to continue · Scroll on map to zoom · Click a country to explore</p>
      </div>
    </section>`;
}

function countryDrawerPayload(data, slug) {
  const country = getCountryBySlug(data.countries, slug);
  if (!country || !country.isPaNetwork) return null;

  const catchments = getCatchmentsByCountry(data.catchments, country.id);
  const communities = catchments.flatMap((ct) =>
    getCommunitiesByCatchment(data.communities, ct.id).map((com) => ({
      ...com,
      catchmentSlug: ct.slug,
      catchmentName: ct.name,
    }))
  );

  const summary = country.summary || {};
  const communityCount = summary.communities ?? country.communities ?? communities.length;
  const catchmentCount = summary.catchments ?? catchments.length;
  const shalom = summary.shalomGroups ?? country.shalomGroups ?? 0;
  const households = summary.households ?? country.households ?? 0;

  const hub = data.countryHubs?.hubs?.[slug] || {};

  return {
    country,
    catchments,
    communities,
    communityCount,
    catchmentCount,
    shalom,
    households,
    tagline: hub.description || country.description || "",
    intro: hub.overview || country.overview || "",
  };
}

function renderCountryDrawerHtml(payload) {
  const { country, catchments, communities, communityCount, catchmentCount, shalom, households, tagline, intro } = payload;
  const countryHref = `#/country/${country.slug}`;

  if (payload.compact) {
    return `
    <div class="pa-drawer__head">
      <div>
        <p class="pa-drawer__eyebrow">Country</p>
        <h2 id="pa-country-drawer-title">${country.name}</h2>
      </div>
      <button type="button" class="pa-drawer__close" data-pa-drawer-close aria-label="Close">×</button>
    </div>
    <div class="pa-drawer__intro">
      ${tagline ? `<p class="pa-drawer__tagline">${tagline}</p>` : ""}
      ${intro ? `<p class="pa-drawer__story">${intro}</p>` : ""}
    </div>
    <a class="pa-drawer__country" href="${countryHref}" data-link>Explore ${country.name} <span aria-hidden="true">→</span></a>`;
  }

  const catchmentRows = catchments.length
    ? catchments
        .map((ct) => {
          const href = `#/catchment/${country.slug}/${ct.slug}`;
          const inCatchment = communities.filter((com) => com.catchmentSlug === ct.slug);
          const names = inCatchment.length
            ? inCatchment.map((com) => com.name).join(" · ")
            : "Communities coming soon";
          return `<a class="pa-drawer__row" href="${href}" data-link>
            <span class="pa-drawer__row-copy">
              <strong>${ct.name}</strong>
              <span class="pa-drawer__comms">${names}</span>
            </span>
            <span class="pa-drawer__arrow" aria-hidden="true">→</span>
          </a>`;
        })
        .join("")
    : `<p class="pa-drawer__empty">No catchments listed yet for ${country.name}.</p>`;

  return `
    <div class="pa-drawer__head">
      <div>
        <p class="pa-drawer__eyebrow">Country</p>
        <h2 id="pa-country-drawer-title">${country.name}</h2>
      </div>
      <button type="button" class="pa-drawer__close" data-pa-drawer-close aria-label="Close">×</button>
    </div>

    ${
      tagline || intro
        ? `<div class="pa-drawer__intro">
            ${tagline ? `<p class="pa-drawer__tagline">${tagline}</p>` : ""}
            ${intro ? `<p class="pa-drawer__story">${intro}</p>` : ""}
          </div>`
        : ""
    }

    <div class="pa-drawer__metrics">
      <a class="pa-drawer__metric" href="#pa-drawer-catchments" data-pa-drawer-jump="catchments">
        <span class="pa-drawer__metric-label">Catchments</span>
        <span class="pa-drawer__metric-value">${formatNumber(catchmentCount)}</span>
        <span class="pa-drawer__arrow" aria-hidden="true">→</span>
      </a>
      <div class="pa-drawer__metric pa-drawer__metric--static">
        <span class="pa-drawer__metric-label">Communities</span>
        <span class="pa-drawer__metric-value">${formatNumber(communityCount)}</span>
      </div>
      <div class="pa-drawer__metric pa-drawer__metric--static">
        <span class="pa-drawer__metric-label">Shalom groups</span>
        <span class="pa-drawer__metric-value">${formatNumber(shalom)}</span>
      </div>
      <div class="pa-drawer__metric pa-drawer__metric--static">
        <span class="pa-drawer__metric-label">Households</span>
        <span class="pa-drawer__metric-value">${formatNumber(households)}</span>
      </div>
    </div>

    <section class="pa-drawer__block" id="pa-drawer-catchments">
      <header class="pa-drawer__block-head">
        <h3>Catchments</h3>
        <span>${formatNumber(catchments.length)}</span>
      </header>
      <div class="pa-drawer__list">${catchmentRows}</div>
    </section>

    <a class="pa-drawer__country" href="${countryHref}" data-link>Explore ${country.name} <span aria-hidden="true">→</span></a>`;
}

function ensureCountryDrawer() {
  let root = document.getElementById("pa-country-drawer-root");
  if (root) return root;

  root = document.createElement("div");
  root.id = "pa-country-drawer-root";
  root.className = "pa-drawer-root";
  root.innerHTML = `
    <div class="pa-drawer__backdrop" data-pa-drawer-close tabindex="-1" aria-hidden="true"></div>
    <aside class="pa-drawer" id="pa-country-drawer" role="dialog" aria-modal="true" aria-labelledby="pa-country-drawer-title" hidden>
      <div class="pa-drawer__scroll" data-pa-drawer-body></div>
    </aside>`;
  document.body.appendChild(root);
  return root;
}

function openCountryDrawer(payload) {
  const root = ensureCountryDrawer();
  const panel = root.querySelector(".pa-drawer");
  const body = root.querySelector("[data-pa-drawer-body]");
  if (!panel || !body) return;

  body.innerHTML = renderCountryDrawerHtml(payload);
  panel.classList.toggle("pa-drawer--compact", Boolean(payload.compact));
  panel.hidden = false;
  root.classList.add("is-open");
  document.body.classList.add("pa-drawer-open");

  requestAnimationFrame(() => {
    panel.classList.add("is-visible");
    root.querySelector("[data-pa-drawer-close]")?.focus?.();
  });
}

export function closeCountryDrawer() {
  const root = document.getElementById("pa-country-drawer-root");
  if (!root) return;
  const panel = root.querySelector(".pa-drawer");
  panel?.classList.remove("is-visible");
  root.classList.remove("is-open");
  document.body.classList.remove("pa-drawer-open");
  window.setTimeout(() => {
    if (!root.classList.contains("is-open") && panel) panel.hidden = true;
  }, 280);
}

let drawerBound = false;

function bindCountryDrawerChrome(data) {
  if (drawerBound) return;
  drawerBound = true;
  const root = ensureCountryDrawer();

  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-pa-drawer-close]")) {
      e.preventDefault();
      closeCountryDrawer();
      return;
    }
    const jump = e.target.closest("[data-pa-drawer-jump]");
    if (jump) {
      e.preventDefault();
      const id = jump.getAttribute("data-pa-drawer-jump");
      const target = root.querySelector(`#pa-drawer-${id}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) {
      closeCountryDrawer();
    }
  });
}

export function bindAfricaCountrySelect(root = document, data = null) {
  if (data) bindCountryDrawerChrome(data);

  const openSlug = (slug) => {
    if (!slug) {
      closeCountryDrawer();
      return;
    }
    if (!data) {
      location.hash = `#/country/${slug}`;
      return;
    }
    const payload = countryDrawerPayload(data, slug);
    if (!payload) {
      location.hash = `#/country/${slug}`;
      return;
    }
    openCountryDrawer(payload);
  };

  const select = root.querySelector("[data-pa-country-select]");
  if (select && !select.dataset.bound) {
    select.dataset.bound = "true";
    select.addEventListener("change", () => openSlug(select.value));
  }

  const picks = root.querySelectorAll("[data-pa-country-pick]");
  if (picks.length) {
    const nav = root.querySelector(".pa-africa__tabs, .pa-africa__nav") || picks[0].parentElement;
    if (!nav.dataset.countryPicksBound) {
      nav.dataset.countryPicksBound = "true";
      picks.forEach((btn) => {
        btn.addEventListener("click", () => {
          picks.forEach((b) => {
            b.classList.toggle("is-active", b === btn);
            b.setAttribute("aria-selected", b === btn ? "true" : "false");
          });
          openSlug(btn.getAttribute("data-pa-country-pick"));
        });
      });
    }
  }
}

/** Opens the country side panel; falls back to the country page when no drawer data exists. */
export function openCountryPreview(data, slug, { compact = false } = {}) {
  if (!slug) return;
  bindCountryDrawerChrome(data);
  const payload = countryDrawerPayload(data, slug);
  if (!payload) {
    location.hash = `#/country/${slug}`;
    return;
  }
  openCountryDrawer({ ...payload, compact });
}

export function destroyAfricaCountryDrawer() {
  closeCountryDrawer();
  const root = document.getElementById("pa-country-drawer-root");
  root?.remove();
  drawerBound = false;
  document.body.classList.remove("pa-drawer-open");
}

/** Results areas — numbered list on the left, the chosen program's photo panel on the right. */
export function renderOurWorkPrograms(section = {}) {
  const programs = section.programs || [];
  if (!programs.length && !section.title) return "";

  const titleHtml = formatPaTitle(section, "Five programmes. One whole community.");
  const cta = section.cta || null;

  const items = programs
    .map((p, i) => {
      const on = i === 0;
      return `<li role="presentation">
        <button type="button" class="pa-rl__item${on ? " is-active" : ""}" role="tab" id="pa-rl-tab-${p.id}"
          aria-selected="${on}" aria-controls="pa-rl-panel-${p.id}" tabindex="${on ? 0 : -1}" data-pa-rl-tab>
          <span class="pa-rl__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="pa-rl__name">${p.title}</span>
          <span class="pa-rl__arrow" aria-hidden="true">→</span>
        </button>
      </li>`;
    })
    .join("");

  const panels = programs
    .map((p, i) => {
      const on = i === 0;
      const href = p.href || `#/program/${p.id}`;
      return `<article class="pa-rl__panel${on ? " is-active" : ""}" role="tabpanel" id="pa-rl-panel-${p.id}"
        aria-labelledby="pa-rl-tab-${p.id}"${on ? "" : ' aria-hidden="true"'} data-pa-rl-panel>
        ${p.image ? `<img class="pa-rl__img" src="${p.image}" alt="${p.imageAlt || ""}" loading="${i ? "lazy" : "eager"}" decoding="async">` : ""}
        <span class="pa-rl__veil" aria-hidden="true"></span>
        <div class="pa-rl__body">
          <span class="pa-rl__icon" aria-hidden="true">${PROGRAM_ICONS[p.id] || ""}</span>
          <h3 class="pa-rl__title">${p.title}</h3>
          <p class="pa-rl__text">${p.description || p.text || ""}</p>
          <a class="pa-rl__more" ${linkAttrs(href)}${on ? "" : ' tabindex="-1"'}>Explore the programme <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="pa-ra pa-rl" id="our-work" aria-labelledby="our-work-title" data-home-section="work" data-pa-ra>
      <div class="container pa-ra__head" data-reveal data-anim="fade-up">
        <div>
          ${section.eyebrow ? `<p class="pa-ra__eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="our-work-title" class="pa-title">${titleHtml}</h2>
        </div>
        <div class="pa-ra__head-side">
          ${section.lead ? `<p class="pa-ra__lead">${section.lead}</p>` : ""}
          ${cta?.href ? `<a class="pa-ra__cta" ${linkAttrs(cta.href)}>${cta.label} <span aria-hidden="true">→</span></a>` : ""}
        </div>
      </div>
      <div class="container pa-rl__wrap" data-reveal data-anim="fade-up">
        <ul class="pa-rl__list" role="tablist" aria-labelledby="our-work-title">${items}</ul>
        <div class="pa-rl__stage">${panels}</div>
      </div>
    </section>`;
}

const FLOW_BADGES = {
  community: "First active unit",
  shalom: "Main implementation unit",
};

/** Overview of how the five programs reach people — the only place these definitions are shown. */
export function renderHowPaWorks(section = {}) {
  if (!section.title) return "";
  const titleHtml = formatPaTitle(section, "How PA works");
  const cta = section.cta || { label: "See it in a country", href: "#/africa" };

  const path = PA_FLOW.map(
    (s, i) => `<li class="pa-how__node${FLOW_BADGES[s.id] ? " is-key" : ""}" style="--i:${i}">
        <span class="pa-how__dot" aria-hidden="true"></span>
        <strong>${s.label}</strong>
        ${FLOW_BADGES[s.id] ? `<em>${FLOW_BADGES[s.id]}</em>` : ""}
        <span>${s.text}</span>
      </li>`
  ).join("");

  return `
    <section class="pa-how" id="how-pa-works" aria-labelledby="how-pa-works-title" data-home-section="how">
      <div class="container">
        <header class="pa-how__head" data-reveal data-anim="fade-up">
          <div>
            ${section.eyebrow ? `<p class="pa-how__eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="how-pa-works-title" class="pa-title">${titleHtml}</h2>
          </div>
          <div class="pa-how__head-side">
            ${section.lead ? `<p class="pa-how__lead">${section.lead}</p>` : ""}
            <a class="pa-how__cta" ${linkAttrs(cta.href)}>${cta.label} <span aria-hidden="true">→</span></a>
          </div>
        </header>

        <ol class="pa-how__path" data-pa-how-path aria-label="How the work is organised">${path}</ol>
      </div>
    </section>`;
}

export function bindHowPaWorks(root = document) {
  bindPppExplorer(root);
  bindHowPathDraw(root);
}

/** Impact figures run up from zero the first time the strip comes into view ("1.3M+" keeps its unit and decimals). */
export function bindImpactCounters(root = document) {
  const values = [...root.querySelectorAll("[data-pa-run]")];
  if (!values.length || values[0].dataset.bound) return;
  values.forEach((el) => (el.dataset.bound = "true"));
  const stats = values[0].closest(".pa-impact__stats");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    stats?.classList.add("is-charted");
    return;
  }
  stats?.classList.add("is-chart-armed");

  const parse = (raw) => {
    const m = String(raw).match(/^(\D*)([\d.,]+)(.*)$/);
    if (!m) return null;
    const num = Number(m[2].replace(/,/g, ""));
    if (!Number.isFinite(num)) return null;
    return { prefix: m[1], num, suffix: m[3], decimals: (m[2].split(".")[1] || "").length };
  };

  const run = (el) => {
    const p = parse(el.dataset.paRun);
    if (!p) return;
    const duration = 1800;
    const start = performance.now();
    el.classList.add("is-running");
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${p.prefix}${(p.num * eased).toFixed(p.decimals)}${p.suffix}`;
      if (t < 1) requestAnimationFrame(tick);
      else {
        el.textContent = el.dataset.paRun;
        el.classList.remove("is-running");
      }
    };
    requestAnimationFrame(tick);
  };

  values.forEach((el) => {
    const p = parse(el.dataset.paRun);
    if (p) el.textContent = `${p.prefix}${(0).toFixed(p.decimals)}${p.suffix}`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      stats?.classList.add("is-charted");
      values.forEach((el, i) => window.setTimeout(() => run(el), i * 150));
    },
    { rootMargin: "0px 0px -15% 0px" }
  );
  io.observe(stats || values[0]);
}

/**
 * One continuous line drawn through the real dot positions — Country → Catchment → Community,
 * round the curve, Pastors Fellowship → Shalom Groups → Households. Each step appears as the
 * line reaches it. Rebuilt on resize; phones get a straight vertical run.
 */
const HOW_DRAW_SECONDS = 3.6;

function bindHowPathDraw(root = document) {
  const path = root.querySelector("[data-pa-how-path]");
  if (!path || path.dataset.bound) return;
  path.dataset.bound = "true";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "pa-how__svg");
  svg.setAttribute("aria-hidden", "true");
  const track = document.createElementNS(NS, "path");
  track.setAttribute("class", "pa-how__track");
  const line = document.createElementNS(NS, "path");
  line.setAttribute("class", "pa-how__line");
  svg.append(track, line);
  path.append(svg);
  path.classList.add("has-svg");

  const nodes = [...path.querySelectorAll(".pa-how__node")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window);
  let drawn = reduce;

  const build = () => {
    const box = path.getBoundingClientRect();
    if (!box.width) return;
    const pts = nodes.map((n) => {
      const r = n.querySelector(".pa-how__dot").getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
    const stops = [0];
    let d;
    let len;

    const vertical = pts.length < 6 || Math.abs(pts[0].y - pts[2].y) > 4;
    if (vertical) {
      d = `M${pts[0].x},${pts[0].y} L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
      pts.slice(1).forEach((p) => stops.push(dist(pts[0], p)));
      len = dist(pts[0], pts[pts.length - 1]);
    } else {
      const [p1, p2, p3, p4, p5, p6] = pts;
      const r = Math.max((p4.y - p3.y) / 2, 1);
      const xr = Math.max(box.width - 2 - r, p3.x);
      const top = xr - p3.x;
      const arc = Math.PI * r;
      d = `M${p1.x},${p1.y} L${xr},${p3.y} A${r},${r} 0 0 1 ${xr},${p4.y} L${p6.x},${p6.y}`;
      const a = dist(p1, p3) + top;
      stops.push(dist(p1, p2), dist(p1, p3), a + arc + (xr - p4.x), a + arc + (xr - p5.x), a + arc + (xr - p6.x));
      len = a + arc + (xr - p6.x);
    }

    track.setAttribute("d", d);
    line.setAttribute("d", d);
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    line.style.strokeDasharray = `${len}`;
    if (drawn) {
      line.style.transition = "none";
      line.style.strokeDashoffset = "0";
    } else {
      line.style.strokeDashoffset = `${len}`;
    }
    nodes.forEach((n, i) => n.style.setProperty("--d", `${((stops[i] || 0) / len) * HOW_DRAW_SECONDS}s`));
  };

  build();
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => build()).observe(path);
  if (reduce) return;

  path.classList.add("is-armed");
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      build();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          line.style.transition = `stroke-dashoffset ${HOW_DRAW_SECONDS}s linear`;
          line.style.strokeDashoffset = "0";
          path.classList.add("is-drawn");
          drawn = true;
        })
      );
      window.setTimeout(() => path.classList.add("is-done"), HOW_DRAW_SECONDS * 1000 + 900);
    },
    { rootMargin: "0px 0px -20% 0px" }
  );
  io.observe(path);
}

export function bindOurWorkPrograms(root = document) {
  const wrap = root.querySelector?.("[data-pa-ra]") || document.querySelector("[data-pa-ra]");
  if (!wrap || wrap.dataset.bound) return;
  wrap.dataset.bound = "true";
  const tabs = [...wrap.querySelectorAll("[data-pa-rl-tab]")];
  const panels = [...wrap.querySelectorAll("[data-pa-rl-panel]")];
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const select = (tab, focus = false) => {
    const id = tab.getAttribute("aria-controls");
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.id === id;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-hidden", String(!on));
      p.querySelector(".pa-rl__more")?.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    if (canHover) tab.addEventListener("mouseenter", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
}

/** Faint background trend for a stat — bars, line or area from its series (illustrative). */
function impactChart(card = {}) {
  const s = card.series || [];
  if (s.length < 2) return "";
  const W = 100;
  const H = 40;
  const max = Math.max(...s);
  const y = (v) => H - (v / max) * (H - 4);
  let body;
  if (card.chart === "bars") {
    const slot = W / s.length;
    const bw = slot * 0.62;
    body = s
      .map((v, i) => `<rect class="pa-impact__bar" style="--k:${i}" x="${(i * slot + (slot - bw) / 2).toFixed(2)}" y="${y(v).toFixed(2)}" width="${bw.toFixed(2)}" height="${(H - y(v)).toFixed(2)}" rx="1"/>`)
      .join("");
  } else {
    const step = W / (s.length - 1);
    const pts = s.map((v, i) => `${(i * step).toFixed(2)},${y(v).toFixed(2)}`);
    const line = `<polyline class="pa-impact__line" points="${pts.join(" ")}" pathLength="1"/>`;
    body = card.chart === "area" ? `<polygon class="pa-impact__area" points="0,${H} ${pts.join(" ")} ${W},${H}"/>${line}` : line;
  }
  return `<svg class="pa-impact__chart pa-impact__chart--${card.chart || "line"}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** PA's published headline figures — big number, short label, nothing else. */
export function renderImpactDataBand(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || { label: "Explore Impact Data", href: "#/scorecard" };
  const cards = (section.cards || [])
    .filter((c) => !c.sample)
    .map(
      (c) => `<li class="pa-impact__stat">
        ${impactChart(c)}
        <span class="pa-impact__value" data-pa-run="${c.value}">${c.value}</span>
        <span class="pa-impact__label">${c.label}</span>
      </li>`
    )
    .join("");

  return `
    <section class="pa-impact" id="impact-data" aria-labelledby="impact-data-title" data-home-section="impact">
      <div class="container">
        <header class="pa-impact__head" data-reveal data-anim="fade-up">
          <div>
            ${section.eyebrow ? `<p class="pa-impact__eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="impact-data-title" class="pa-title">${formatPaTitle(section)}</h2>
          </div>
          <div class="pa-impact__side">
            ${section.lead ? `<p class="pa-impact__lead">${section.lead}</p>` : ""}
            <a class="pa-impact__cta" ${linkAttrs(cta.href)}>${cta.label} <span aria-hidden="true">→</span></a>
          </div>
        </header>
        <ul class="pa-impact__stats" data-reveal data-stagger="fade-up">${cards}</ul>
        ${section.source ? `<p class="pa-impact__source">${section.source}</p>` : ""}
      </div>
    </section>`;
}

export function renderStoriesBand(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || { label: "View all stories", href: "#/stories" };
  const cards = section.cards || [];
  if (!cards.length) return "";

  const cols = cards
    .map(
      (c, i) => `<li class="pa-tl__col${i === 0 ? " is-active" : ""}" style="--i:${i}" data-pa-tl-col="${i}">
        <p class="pa-tl__meta">${[c.country, c.program].filter(Boolean).join(" · ")}</p>
        <h3 class="pa-tl__name">${c.title}</h3>
        <a class="pa-tl__more" ${linkAttrs(c.href || "#/stories")}>Read story</a>
      </li>`
    )
    .join("");

  const photos = cards
    .map(
      (c, i) =>
        c.image
          ? `<img class="pa-tl__img${i === 0 ? " is-active" : ""}" src="${c.image}" alt="${c.imageAlt || ""}" loading="lazy" decoding="async" data-pa-tl-img="${i}">`
          : ""
    )
    .join("");

  const line1 = section.eyebrow || "";
  const line2 = (section.title || "").replace(/\.$/, "");

  return `
    <section class="pa-stories pa-tl" id="stories-of-transformation" aria-labelledby="stories-band-title" data-home-section="stories" data-pa-stories>
      <div class="container pa-tl__inner">
        <div class="pa-tl__copy" data-reveal data-anim="fade-up">
          <h2 id="stories-band-title" class="pa-tl__heading">
            ${line1 ? `<span class="pa-tl__heading-light">${line1}</span>` : ""}
            <span class="pa-tl__heading-bold">${line2}</span>
          </h2>
          ${section.lead ? `<p class="pa-tl__lead">${section.lead}</p>` : ""}
          <ul class="pa-tl__cols">${cols}</ul>
          <a class="pa-tl__all" ${linkAttrs(cta.href)}>${cta.label} <span aria-hidden="true">→</span></a>
        </div>
        <div class="pa-tl__visual" aria-hidden="true" data-reveal data-anim="fade-up">
          <svg class="pa-tl__brush" viewBox="0 0 200 200" focusable="false">
            <path d="M100 6c52 0 94 42 94 94s-42 94-94 94S6 152 6 100 48 6 100 6z" />
            <path d="M104 14c46 2 82 40 80 86-2 48-42 84-88 82-44-2-80-40-78-86 2-46 40-84 86-82z" />
          </svg>
          <div class="pa-tl__circle">${photos}</div>
        </div>
      </div>
    </section>`;
}

export function bindStoriesBand(root = document) {
  const section = root.querySelector?.("[data-pa-stories]") || document.querySelector("[data-pa-stories]");
  if (!section || section.dataset.bound) return;
  section.dataset.bound = "true";

  const cols = [...section.querySelectorAll("[data-pa-tl-col]")];
  const imgs = [...section.querySelectorAll("[data-pa-tl-img]")];
  if (!cols.length) return;

  const show = (i) => {
    cols.forEach((c) => c.classList.toggle("is-active", c.dataset.paTlCol === String(i)));
    imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.paTlImg === String(i)));
  };

  cols.forEach((col) => {
    const i = col.dataset.paTlCol;
    col.addEventListener("mouseenter", () => show(i));
    col.addEventListener("focusin", () => show(i));
  });
}

export function renderKnowledgeNewsSplit(section = {}, learned = null) {
  const knowledge = section.knowledge || {};
  const news = section.news || {};
  if (!knowledge.title && !news.title) return "";

  const kCta = knowledge.cta || { label: "Visit knowledge centre", href: "#/resources" };
  const nCta = news.cta || { label: "View all news", href: "#/news" };
  const dateBlock = (raw) => {
    const d = raw ? new Date(raw) : null;
    if (!d || Number.isNaN(d.getTime())) return "";
    const month = d.toLocaleString("en", { month: "short" });
    return `<span class="pa-news__cal" aria-hidden="true">
        <span class="pa-news__cal-day">${d.getDate()}</span>
        <span class="pa-news__cal-month">${month} ${d.getFullYear()}</span>
      </span>`;
  };
  const items = (news.items || [])
    .filter((item) => !item.sample)
    .map(
      (item, i) => `<a class="pa-news__item" ${linkAttrs(item.href || "#/news")} style="--i:${i}" data-pa-news-item>
        ${dateBlock(item.date)}
        <span class="pa-news__meta">
          <span class="pa-news__tag">${item.tag || "News"}</span>
          <time class="pa-news__date">${item.date || ""}</time>
        </span>
        <strong class="pa-news__headline">${item.title}</strong>
        <span class="pa-news__arrow" aria-hidden="true">→</span>
      </a>`
    )
    .join("");

  const knowHtml = knowledge.title
    ? `<section class="pa-know" id="knowledge-centre" aria-labelledby="knowledge-centre-title" data-home-section="knowledge">
        <span class="pa-know__bg-word" aria-hidden="true">Knowledge</span>
        <div class="container pa-know__layout">
          <div class="pa-know__copy">
            ${knowledge.eyebrow ? `<p class="pa-know__eyebrow">${knowledge.eyebrow}</p>` : ""}
            <h2 id="knowledge-centre-title" class="pa-title">${formatPaTitle(knowledge, "Knowledge Centre")}</h2>
            ${knowledge.lead ? `<p class="pa-know__lead">${knowledge.lead}</p>` : ""}
            ${
              learned
                ? `<a class="pa-know__learned" href="#/resources#kh-learned" data-link>
                    <span class="pa-know__learned-label">What we've learned · ${learned.programme.title}</span>
                    <q>${learned.text}</q>
                    <span class="pa-know__learned-meta">${learned.story.title}${learned.country ? ` · ${learned.country.name}` : ""}</span>
                  </a>`
                : ""
            }
            <a class="pa-know__cta" ${linkAttrs(kCta.href)}>${kCta.label} →</a>
          </div>
          <figure class="pa-know__pub" data-pa-know-book>
            <a class="pa-know__cover pa-know__cover--kh" href="#/field-reports" data-link aria-label="Open ${knowledge.imageAlt || "Field Reports"}">
              ${khCover({ type: "reports", title: knowledge.imageAlt || "Field Reports" }, "Report", "xl")}
            </a>
          </figure>
        </div>
      </section>`
    : "";

  const newsHtml = news.title && items
    ? `<section class="pa-news" id="news-updates" aria-labelledby="news-updates-title" data-home-section="news">
        <div class="container pa-news__layout">
          <header class="pa-news__head" data-reveal data-anim="fade-up">
            ${news.eyebrow ? `<p class="pa-news__eyebrow">${news.eyebrow}</p>` : ""}
            <h2 id="news-updates-title" class="pa-title">${formatPaTitle(news, "Latest from PA")}</h2>
            ${news.lead ? `<p class="pa-news__lead">${news.lead}</p>` : ""}
            <a class="pa-news__cta" ${linkAttrs(nCta.href)}>${nCta.label} →</a>
          </header>
          <div class="pa-news__stream" data-reveal>
            <span class="pa-news__rail" aria-hidden="true"></span>
            <div class="pa-news__list" data-stagger="fade-up">${items}</div>
          </div>
        </div>
      </section>`
    : "";

  if (!knowHtml || !newsHtml) return `${knowHtml}${newsHtml}`;
  return `<div class="pa-kn" data-pa-kn>
      <div class="container pa-kn__grid">${knowHtml}${newsHtml}</div>
    </div>`;
}

export function renderPartnerBanner(section = {}) {
  if (!section.title) return "";
  const contact = section.contact || {};
  const primary = section.primaryCta || { label: "Partner With Us" };
  const secondary = section.secondaryCta || { label: "What we do", href: "#/work" };
  const email = contact.email || "karibu@possibilitiesafrica.org";
  const phone = contact.phone || "+254 721 238 198";
  const address = (contact.address || "P.O. Box: 55604 - 00200\nNairobi, Kenya").replace(/\n/g, "\\n");

  return `
    <section class="pa-partner" id="partner-support" aria-labelledby="partner-banner-title" data-home-section="partner">
      <div class="container pa-partner__inner pa-partner__inner--cta" data-reveal data-anim="fade-up">
        <div class="pa-partner__copy">
          ${section.eyebrow ? `<p class="pa-partner__eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="partner-banner-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p>${section.lead}</p>` : ""}
        </div>
        <div class="pa-partner__actions">
          <button
            type="button"
            class="pa-partner__btn pa-partner__btn--solid"
            data-partner-contact
            data-email="${email}"
            data-phone="${phone}"
            data-address="${address.replace(/"/g, "&quot;")}"
            aria-haspopup="dialog"
          >${primary.label || "Partner With Us"} →</button>
          ${
            secondary.href
              ? `<a class="pa-partner__btn pa-partner__btn--ghost" ${linkAttrs(secondary.href)}>${secondary.label}</a>`
              : ""
          }
        </div>
      </div>
    </section>`;
}
