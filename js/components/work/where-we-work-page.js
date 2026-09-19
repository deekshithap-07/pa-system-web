/**
 * Where We Work hub — layout from PA Website Designs (page 3).
 * Compact interactive map reuses home MapLibre mount with a separate root id.
 * Home map code paths are not modified.
 */

import { formatNumber } from "../../utils/format.js";
import { formatPaTitle } from "../../utils/pa-title.js";
import { getPaCountries, getCountryCover } from "../../utils/work-locations.js";
import { mountAfricaMapSection } from "../home-level1.js";
import { destroyAfricaMap } from "../../map/africa-map.js";

const MAP_ROOT_ID = "where-africa-map-root";

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  return `href="${href}"`;
}

function kpiFromScorecard(data) {
  const cards = data.scorecard?.kpiCards || [];
  const find = (id) => cards.find((c) => c.id === id);
  const countries = find("countries")?.value ?? getPaCountries(data).length;
  const communities = find("communities")?.value ?? 59;
  const households = find("households")?.value ?? 253000;
  return [
    { id: "countries", label: "Countries", value: formatNumber(countries) },
    { id: "communities", label: "Communities", value: formatNumber(communities) },
    { id: "households", label: "Households", value: `${formatNumber(households)}+` },
    { id: "programs", label: "Programs", value: "5" },
  ];
}

function countryStats(data, slug) {
  const country = getPaCountries(data).find((c) => c.slug === slug);
  const stats = (data.scorecard?.countryStats || []).find((s) => s.slug === slug) || {};
  const hub = data.countryHubs?.hubs?.[slug];
  const cover = getCountryCover(data, slug);
  const communities = stats.communities ?? country?.summary?.communities ?? 0;
  const households = stats.households ?? country?.summary?.households ?? 0;
  const shalom = stats.shalomGroups ?? 0;
  const projects = stats.projects ?? 5;
  const catchments = (data.catchments?.catchments || []).filter((c) => c.countrySlug === slug || c.countryId === country?.id).length;

  return {
    slug,
    name: country?.name || slug,
    image: cover.image || hub?.heroImage || "assets/country-heroes/kenya-hero-farmers.jpg",
    title: `${country?.name || "Country"} — Stronger communities. Brighter futures.`,
    text:
      hub?.overview ||
      hub?.description ||
      `In ${country?.name || "this country"}, PA walks with local churches so leadership, livelihoods, and community life grow together.`,
    communities,
    households,
    shalom,
    programs: 5,
    catchments,
    projects,
  };
}

function renderHero(page = {}) {
  const hero = page.hero || {};
  return `
    <header class="www-hero" data-www-section="hero">
      <div class="www-hero__media" aria-hidden="true">
        ${hero.image ? `<img src="${hero.image}" alt="${hero.imageAlt || ""}" fetchpriority="high">` : ""}
        <span class="www-hero__veil"></span>
      </div>
      <div class="container www-hero__layout">
        <div class="www-hero__inner">
          <p class="www-hero__eyebrow">${hero.eyebrow || "Where We Work"}</p>
          <h1 class="pa-title">${formatPaTitle(hero, "Where We Work")}</h1>
          ${hero.lead ? `<p class="www-hero__lead">${hero.lead}</p>` : ""}
        </div>
      </div>
    </header>`;
}

function renderExplorer(page = {}, data, featuredSlug) {
  const explorer = page.explorer || {};
  const countries = getPaCountries(data);
  const featured = countryStats(data, featuredSlug || countries[0]?.slug || "kenya");
  const kpis = kpiFromScorecard(data);

  const list = [
    `<button type="button" class="www-nav__item is-active" data-www-country="africa" aria-pressed="true">
      <span class="www-nav__pin" aria-hidden="true"></span>
      Africa
    </button>`,
    ...countries.map(
      (c) => `<button type="button" class="www-nav__item" data-www-country="${c.slug}" aria-pressed="false">${c.name}</button>`
    ),
  ].join("");

  const legend = (explorer.legend || [])
    .map((l) => `<li class="www-legend__item www-legend__item--${l.id}"><span></span>${l.label}</li>`)
    .join("");

  const kpiHtml = kpis
    .map(
      (k) => `<div class="www-kpi">
        <span class="www-kpi__icon www-kpi__icon--${k.id}" aria-hidden="true"></span>
        <div>
          <strong>${k.value}</strong>
          <span>${k.label}</span>
        </div>
      </div>`
    )
    .join("");

  return `
    <section class="www-explorer www-band www-band--skin-green" id="where-explorer" data-www-section="explorer" aria-labelledby="www-explorer-title">
      <div class="container">
        <div class="www-explorer__card" data-www-reveal>
          <aside class="www-nav" aria-label="Countries">
            ${list}
            <a class="www-nav__more" href="#/africa#where-other-countries" data-link>and more…</a>
          </aside>

          <div class="www-map-col">
            <header class="www-map-col__head">
              <p class="www-eyebrow">Map explorer</p>
              <h2 id="www-explorer-title" class="pa-title">${formatPaTitle(explorer, "Explore our work across Africa")}</h2>
              <p>${explorer.lead || ""}</p>
            </header>
            <div class="www-map-shell">
              <div class="www-map-host africa-map-host" id="${MAP_ROOT_ID}" aria-label="Interactive Africa map" data-www-map>
                <div class="www-map-blank" data-www-map-blank>
                  <p>Interactive map</p>
                  <span>Map loads here when available — same experience as Home, in a compact view.</span>
                </div>
              </div>
              ${legend ? `<ul class="www-legend">${legend}</ul>` : ""}
            </div>
          </div>

          <aside class="www-side">
            <div class="www-kpis">${kpiHtml}</div>
            <a class="www-side__all" href="#/africa#where-other-countries" data-link>View all countries →</a>
          </aside>
        </div>
        <article class="www-featured www-featured--row" data-www-featured data-www-reveal>
          ${renderFeatured(featured)}
        </article>
      </div>
    </section>`;
}

function renderFeatured(featured) {
  return `
    <div class="www-featured__media">
      <img src="${featured.image}" alt="" loading="eager" decoding="async">
    </div>
    <div class="www-featured__copy">
      <p class="www-featured__eyebrow">Featured Country</p>
      <h3>${featured.title}</h3>
      <p>${featured.text}</p>
      <a class="www-featured__cta" href="#/country/${featured.slug}" data-link>View ${featured.name} profile →</a>
    </div>
    <dl class="www-featured__stats">
      <div><dt>Communities</dt><dd>${formatNumber(featured.communities)}</dd></div>
      <div><dt>Households</dt><dd>${formatNumber(featured.households)}</dd></div>
      <div><dt>Shalom Groups</dt><dd>${formatNumber(featured.shalom)}</dd></div>
      <div><dt>Programs</dt><dd>${featured.programs}</dd></div>
    </dl>`;
}

function renderOtherCountries(section = {}, data, featuredSlug) {
  const countries = getPaCountries(data).filter((c) => c.slug !== featuredSlug);
  const cta = section.cta || { label: "View all countries", href: "#/africa#where-other-countries" };
  const cards = countries
    .map((c) => {
      const stats = countryStats(data, c.slug);
      return `<a class="www-country-card" href="#/country/${c.slug}" data-link>
        <span class="www-country-card__media">
          <img src="${stats.image}" alt="" loading="lazy" decoding="async">
        </span>
        <span class="www-country-card__body">
          <strong>${c.name}</strong>
          <span>${formatNumber(stats.communities)} communities · ${formatNumber(stats.households)} households</span>
        </span>
        <span class="www-country-card__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");

  return `
    <section class="www-others www-band www-band--skin-gold" id="where-other-countries" data-www-section="others" aria-labelledby="www-others-title">
      <div class="container">
        <header class="www-others__head" data-www-reveal>
          <div>
            <p class="www-eyebrow">Country presence</p>
            <h2 id="www-others-title" class="pa-title">${formatPaTitle(section, "Other Countries")}</h2>
          </div>
          <a ${linkAttrs(cta.href)}>${cta.label} →</a>
        </header>
        <div class="www-others__rail" data-www-stagger>${cards}</div>
      </div>
    </section>`;
}

function renderPartner(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  return `
    <section class="www-partner www-band www-band--skin-maroon" id="where-partner" data-www-section="partner" aria-labelledby="www-partner-title">
      <div class="www-partner__media" aria-hidden="true">
        ${section.image ? `<img src="${section.image}" alt="">` : ""}
        <span class="www-partner__veil"></span>
      </div>
      <div class="container www-partner__inner" data-www-reveal>
        <div>
          <p class="www-eyebrow www-eyebrow--on-dark">Partner</p>
          <h2 id="www-partner-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p>${section.lead}</p>` : ""}
        </div>
        ${cta.href ? `<a class="www-partner__cta" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
      </div>
    </section>`;
}

export function renderWhereWeWorkPage(data) {
  const page = data.whereWeWork || {};
  const countries = getPaCountries(data);
  const featuredSlug = countries.find((c) => c.slug === "kenya")?.slug || countries[0]?.slug || "kenya";

  return `
    <div class="www-page" data-africa-intelligence data-where-we-work data-featured-slug="${featuredSlug}">
      ${renderHero(page)}
      ${renderExplorer(page, data, featuredSlug)}
      ${renderOtherCountries(page.otherCountries, data, featuredSlug)}
      ${renderPartner(page.partner)}
    </div>`;
}

export function mountWhereWeWorkPage(data) {
  const page = document.querySelector("[data-where-we-work]");
  if (!page) return;

  const featuredEl = page.querySelector("[data-www-featured]");
  const navItems = [...page.querySelectorAll("[data-www-country]")];

  const setActive = (slug) => {
    navItems.forEach((btn) => {
      const active = btn.dataset.wwwCountry === slug;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.wwwCountry;
      setActive(slug);
      if (slug === "africa") return;
      if (featuredEl) featuredEl.innerHTML = renderFeatured(countryStats(data, slug));
      page.dataset.featuredSlug = slug;
    });
  });

  initWhereWeWorkAnimations(page);

  // Compact interactive map — separate root from home; leave blank if MapLibre unavailable
  const mapHost = document.getElementById(MAP_ROOT_ID);
  if (!mapHost) return;

  requestAnimationFrame(() => {
    try {
      if (typeof maplibregl === "undefined") return;
      const blank = mapHost.querySelector("[data-www-map-blank]");
      if (blank) blank.remove();
      mapHost.innerHTML = "";
      const instance = mountAfricaMapSection(data, { rootId: MAP_ROOT_ID });
      if (!instance) {
        mapHost.innerHTML = `<div class="www-map-blank" data-www-map-blank>
          <p>Interactive map</p>
          <span>Map loads here when available — same experience as Home, in a compact view.</span>
        </div>`;
      }
    } catch (err) {
      console.error("[mountWhereWeWorkPage] map failed:", err);
      mapHost.innerHTML = `<div class="www-map-blank" data-www-map-blank>
        <p>Interactive map</p>
        <span>Map placeholder — open Home for the full interactive map if this view cannot load.</span>
      </div>`;
    }
  });
}

export function initWhereWeWorkAnimations(root = document) {
  const page =
    root?.matches?.("[data-where-we-work]")
      ? root
      : root.querySelector?.("[data-where-we-work]") || document.querySelector("[data-where-we-work]");
  if (!page || typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-www-reveal], [data-www-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroKids = page.querySelectorAll(".www-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", clearProps: "transform" }
    );
  }

  const heroImg = page.querySelector(".www-hero__media img");
  if (heroImg && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      heroImg,
      { scale: 1.06 },
      {
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".www-hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      }
    );
  }

  page.querySelectorAll("[data-www-section]").forEach((band) => {
    if (band.dataset.wwwSection === "hero") return;
    gsap.fromTo(
      band,
      { autoAlpha: 0.4, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: band,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  page.querySelectorAll("[data-www-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      }
    );
  });

  page.querySelectorAll("[data-www-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.set(group, { autoAlpha: 1 });
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 18, scale: 0.96 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(1.3)",
        clearProps: "transform",
        scrollTrigger: {
          trigger: group,
          start: "top 88%",
          once: true,
        },
      }
    );
  });

  window.setTimeout(() => {
    page.querySelectorAll("[data-www-reveal], [data-www-stagger] > *, [data-www-section]").forEach((el) => {
      const opacity = window.getComputedStyle(el).opacity;
      if (opacity === "0" || opacity === "0.4") {
        gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: "transform" });
      }
    });
  }, 2800);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyWhereWeWorkPage() {
  // Tear down map instance mounted on this page (home remounts its own root on return)
  destroyAfricaMap();
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-where-we-work]")) t.kill();
    });
  }
}
