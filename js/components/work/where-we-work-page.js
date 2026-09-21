/**
 * Where We Work hub — geographic storytelling after the existing hero + map.
 * Hero markup and interactive map mount (MAP_ROOT_ID) are preserved.
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

function parseCount(raw) {
  const s = String(raw ?? "").replace(/,/g, "");
  const m = s.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!m) return { display: String(raw ?? ""), num: NaN, prefix: "", suffix: "" };
  return {
    display: String(raw),
    num: Number(m[2]),
    prefix: m[1] || "",
    suffix: m[3] || "",
  };
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
  const catchments = (data.catchments?.catchments || []).filter(
    (c) => c.countrySlug === slug || c.countryId === country?.id
  ).length;

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

function countryStories(data) {
  const countries = getPaCountries(data);
  const stories = data.stories?.stories || [];
  return countries
    .map((c) => {
      const story = stories.find((s) => s.countryId === c.id);
      const stats = countryStats(data, c.slug);
      if (story) {
        return {
          slug: c.slug,
          country: c.name,
          title: story.title,
          text: story.summary || story.excerpt || stats.text,
          image: story.image || story.heroImage || stats.image,
          href: `#/story/${story.slug}`,
        };
      }
      return {
        slug: c.slug,
        country: c.name,
        title: stats.title,
        text: stats.text,
        image: stats.image,
        href: `#/country/${c.slug}`,
      };
    })
    .slice(0, 7);
}

/** EXISTING HERO — do not redesign. */
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

/** EXISTING interactive map stage — host id and mount path unchanged. */
function renderMapStage(page = {}, data) {
  const explorer = page.explorer || {};
  const legend = (explorer.legend || [])
    .map((l) => `<li class="www-legend__item www-legend__item--${l.id}"><span></span>${l.label}</li>`)
    .join("");

  const countries = getPaCountries(data);
  const rows = countries
    .map(
      (c, i) => `<a class="www-dest" href="#/country/${c.slug}" data-link data-www-country="${c.slug}" style="--i:${i}">
        <span class="www-dest__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="www-dest__name">${c.name}</span>
        <span class="www-dest__go" aria-hidden="true">→</span>
      </a>`
    )
    .join("");

  return `
    <section class="www-map-stage" id="where-explorer" data-www-section="map" aria-labelledby="www-explorer-title">
      <div class="container www-map-stage__layout">
        <header class="www-map-stage__head" data-www-reveal>
          <p class="www-eyebrow">Map explorer</p>
          <h2 id="www-explorer-title" class="pa-title">${formatPaTitle(explorer, "Explore our work across Africa")}</h2>
          ${explorer.lead ? `<p class="www-map-stage__lead">${explorer.lead}</p>` : ""}
          <p class="www-map-stage__hint">Choose a country beside the map to open its story.</p>
        </header>
        <div class="www-map-stage__body">
          <div class="www-map-shell">
            <div class="www-map-host africa-map-host" id="${MAP_ROOT_ID}" aria-label="Interactive Africa map" data-www-map>
              <div class="www-map-blank" data-www-map-blank>
                <p>Interactive map</p>
                <span>Map loads here when available — same experience as Home, in a compact view.</span>
              </div>
            </div>
            ${legend ? `<ul class="www-legend">${legend}</ul>` : ""}
          </div>
          <nav class="www-dest-list www-dest-list--beside" id="where-other-countries" aria-label="Country exploration" data-www-stagger>
            <p class="www-dest-list__label">Country exploration</p>
            ${rows}
          </nav>
        </div>
      </div>
      <div class="www-bridge" aria-hidden="true">
        <span class="www-bridge__line"></span>
        <span class="www-bridge__dot"></span>
        <span class="www-bridge__dot"></span>
        <span class="www-bridge__dot"></span>
      </div>
    </section>`;
}

function renderScale(data) {
  const kpis = kpiFromScorecard(data);
  const items = kpis
    .map((k, i) => {
      const parsed = parseCount(k.value);
      const countAttrs = Number.isFinite(parsed.num)
        ? ` data-www-count="${parsed.num}" data-www-count-prefix="${parsed.prefix}" data-www-count-suffix="${parsed.suffix}"`
        : "";
      return `<div class="www-scale__item www-scale__item--${k.id}" style="--i:${i}" data-www-reveal>
        <strong class="www-scale__value"${countAttrs}>${k.value}</strong>
        <span class="www-scale__label">${k.label}</span>
      </div>`;
    })
    .join("");

  return `
    <section class="www-scale" data-www-section="scale" aria-labelledby="www-scale-title">
      <div class="container">
        <header class="www-scale__head" data-www-reveal>
          <p class="www-eyebrow www-eyebrow--on-dark">Country presence</p>
          <h2 id="www-scale-title" class="pa-title"><span>The scale of</span> <em>the network.</em></h2>
        </header>
        <div class="www-scale__grid">${items}</div>
      </div>
    </section>`;
}

function renderPresence(data, featuredSlug) {
  const featured = countryStats(data, featuredSlug);
  const countries = getPaCountries(data);
  const tabs = countries
    .map(
      (c, i) => `<button type="button" class="www-presence__tab${c.slug === featuredSlug ? " is-active" : ""}"
        data-www-presence-tab="${c.slug}" aria-pressed="${c.slug === featuredSlug ? "true" : "false"}" style="--i:${i}">
        ${c.name}
      </button>`
    )
    .join("");

  return `
    <section class="www-presence" data-www-section="presence" aria-labelledby="www-presence-title">
      <div class="container">
        <header class="www-presence__head" data-www-reveal>
          <p class="www-eyebrow">Country discovery</p>
          <h2 id="www-presence-title" class="pa-title"><span>What PA does</span> <em>there.</em></h2>
          <p class="www-presence__lead">Select a country to see its public picture — then open the full country page.</p>
        </header>
        <div class="www-presence__tabs" role="tablist" aria-label="Select country" data-www-stagger>${tabs}</div>
        <article class="www-presence__panel" data-www-featured data-www-reveal>
          ${renderFeatured(featured)}
        </article>
      </div>
    </section>`;
}

function renderFeatured(featured) {
  return `
    <div class="www-presence__media">
      <img src="${featured.image}" alt="" loading="eager" decoding="async" data-www-presence-img>
    </div>
    <div class="www-presence__copy">
      <p class="www-presence__meta">Featured country</p>
      <h3 data-www-presence-title>${featured.title}</h3>
      <p data-www-presence-text>${featured.text}</p>
      <div class="www-presence__stats" aria-label="Public figures">
        <div><span>Communities</span><strong>${formatNumber(featured.communities)}</strong></div>
        <div><span>Households</span><strong>${formatNumber(featured.households)}</strong></div>
        <div><span>Shalom groups</span><strong>${formatNumber(featured.shalom)}</strong></div>
        <div><span>Programs</span><strong>${featured.programs}</strong></div>
      </div>
      <a class="www-presence__cta" href="#/country/${featured.slug}" data-link data-www-presence-cta>Explore ${featured.name} →</a>
    </div>`;
}

function renderCommunityLink(data, featuredSlug) {
  const featured = countryStats(data, featuredSlug);
  return `
    <section class="www-linkpath" data-www-section="community" aria-labelledby="www-linkpath-title">
      <div class="container">
        <header class="www-linkpath__head" data-www-reveal>
          <p class="www-eyebrow">Community connection</p>
          <h2 id="www-linkpath-title" class="pa-title"><span>Country–catchment–</span><em>community.</em></h2>
        </header>
        <ol class="www-linkpath__steps" data-www-stagger>
          <li class="www-linkpath__step" data-www-reveal>
            <span class="www-linkpath__label">Country</span>
            <strong class="www-linkpath__value" data-www-path-country>${featured.name}</strong>
          </li>
          <li class="www-linkpath__step" data-www-reveal>
            <span class="www-linkpath__label">Catchment</span>
            <strong class="www-linkpath__value" data-www-path-catchment>${featured.catchments ? `${formatNumber(featured.catchments)} groups` : "Nearby group"}</strong>
          </li>
          <li class="www-linkpath__step" data-www-reveal>
            <span class="www-linkpath__label">Community</span>
            <strong class="www-linkpath__value" data-www-path-community>${featured.communities ? `${formatNumber(featured.communities)} places` : "Local place"}</strong>
          </li>
        </ol>
      </div>
    </section>`;
}

function renderCountryStories(data) {
  const items = countryStories(data);
  if (!items.length) return "";
  const first = items[0];
  const nav = items
    .map(
      (s, i) => `<button type="button" class="www-tales__nav-item${i === 0 ? " is-active" : ""}"
        data-www-tale="${i}"
        data-tale-title="${String(s.title || "").replace(/"/g, "&quot;")}"
        data-tale-text="${String(s.text || "").replace(/"/g, "&quot;")}"
        data-tale-image="${String(s.image || "").replace(/"/g, "&quot;")}"
        data-tale-href="${String(s.href || "").replace(/"/g, "&quot;")}"
        data-tale-country="${String(s.country || "").replace(/"/g, "&quot;")}"
        aria-pressed="${i === 0 ? "true" : "false"}">
        <span class="www-tales__nav-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="www-tales__nav-name">${s.country}</span>
      </button>`
    )
    .join("");

  return `
    <section class="www-tales" data-www-section="stories" aria-labelledby="www-tales-title">
      <div class="container">
        <header class="www-tales__head" data-www-reveal>
          <p class="www-eyebrow www-eyebrow--on-dark">Country stories</p>
          <h2 id="www-tales-title" class="pa-title"><span>What is happening</span> <em>there.</em></h2>
        </header>
        <div class="www-tales__cinema" data-www-reveal>
          <article class="www-tales__feature">
            <div class="www-tales__media">
              <img src="${first.image}" alt="" data-www-tale-img decoding="async">
              <span class="www-tales__veil" aria-hidden="true"></span>
            </div>
            <div class="www-tales__copy">
              <p class="www-tales__meta" data-www-tale-meta>${first.country}</p>
              <h3 data-www-tale-title>${first.title}</h3>
              <p data-www-tale-text>${first.text}</p>
              <a class="www-tales__cta" data-www-tale-cta ${linkAttrs(first.href)}>Read more →</a>
            </div>
          </article>
          <nav class="www-tales__index" aria-label="Stories by country">${nav}</nav>
        </div>
      </div>
    </section>`;
}

function renderPartner(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  return `
    <section class="www-partner" id="where-partner" data-www-section="partner" aria-labelledby="www-partner-title">
      <div class="container www-partner__inner" data-www-reveal>
        <div class="www-partner__copy">
          <p class="www-eyebrow">Continue exploring</p>
          <h2 id="www-partner-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p>${section.lead}</p>` : ""}
        </div>
        <div class="www-partner__actions">
          ${cta.href ? `<a class="www-partner__cta" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
          <a class="www-partner__ghost" href="#/africa#where-other-countries" data-link>Browse countries →</a>
        </div>
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
      ${renderMapStage(page, data)}
      ${renderScale(data)}
      ${renderPresence(data, featuredSlug)}
      ${renderCommunityLink(data, featuredSlug)}
      ${renderCountryStories(data)}
      ${renderPartner(page.partner)}
    </div>`;
}

export function mountWhereWeWorkPage(data) {
  const page = document.querySelector("[data-where-we-work]");
  if (!page) return;

  const featuredEl = page.querySelector("[data-www-featured]");
  const destLinks = [...page.querySelectorAll(".www-dest[data-www-country]")];
  const presenceTabs = [...page.querySelectorAll("[data-www-presence-tab]")];

  const updatePath = (slug) => {
    const stats = countryStats(data, slug);
    const countryEl = page.querySelector("[data-www-path-country]");
    const catchEl = page.querySelector("[data-www-path-catchment]");
    const commEl = page.querySelector("[data-www-path-community]");
    if (countryEl) countryEl.textContent = stats.name;
    if (catchEl) catchEl.textContent = stats.catchments ? `${formatNumber(stats.catchments)} groups` : "Nearby group";
    if (commEl) commEl.textContent = stats.communities ? `${formatNumber(stats.communities)} places` : "Local place";
  };

  const setPresence = (slug) => {
    presenceTabs.forEach((btn) => {
      const on = btn.dataset.wwwPresenceTab === slug;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    destLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.wwwCountry === slug));
    if (featuredEl) featuredEl.innerHTML = renderFeatured(countryStats(data, slug));
    updatePath(slug);
    page.dataset.featuredSlug = slug;
  };

  presenceTabs.forEach((btn) => {
    btn.addEventListener("click", () => setPresence(btn.dataset.wwwPresenceTab));
    btn.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) setPresence(btn.dataset.wwwPresenceTab);
    });
  });

  destLinks.forEach((a) => {
    a.addEventListener("mouseenter", () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      destLinks.forEach((el) => el.classList.toggle("is-active", el === a));
      updatePath(a.dataset.wwwCountry);
    });
    a.addEventListener("focus", () => {
      destLinks.forEach((el) => el.classList.toggle("is-active", el === a));
      updatePath(a.dataset.wwwCountry);
    });
  });

  bindTales(page);
  initWhereWeWorkAnimations(page);

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

function bindTales(page) {
  const navs = [...page.querySelectorAll("[data-www-tale]")];
  if (!navs.length) return;

  const img = page.querySelector("[data-www-tale-img]");
  const meta = page.querySelector("[data-www-tale-meta]");
  const title = page.querySelector("[data-www-tale-title]");
  const text = page.querySelector("[data-www-tale-text]");
  const cta = page.querySelector("[data-www-tale-cta]");
  let active = 0;
  let busy = false;

  const apply = (i) => {
    const btn = navs[i];
    if (!btn || busy || i === active) return;
    busy = true;
    active = i;
    navs.forEach((el, n) => {
      el.classList.toggle("is-active", n === i);
      el.setAttribute("aria-pressed", n === i ? "true" : "false");
    });

    const swap = () => {
      if (img && btn.dataset.taleImage) img.src = btn.dataset.taleImage;
      if (meta) meta.textContent = btn.dataset.taleCountry || "";
      if (title) title.textContent = btn.dataset.taleTitle || "";
      if (text) text.textContent = btn.dataset.taleText || "";
      if (cta) {
        const href = btn.dataset.taleHref || "#/stories";
        cta.setAttribute("href", href);
        if (href.startsWith("#/")) cta.setAttribute("data-link", "");
      }
    };

    const feature = page.querySelector(".www-tales__feature");
    if (typeof gsap !== "undefined" && feature && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(feature, {
        autoAlpha: 0.4,
        y: 8,
        duration: 0.25,
        ease: "power1.in",
        onComplete: () => {
          swap();
          gsap.to(feature, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform",
            onComplete: () => {
              busy = false;
            },
          });
        },
      });
    } else {
      swap();
      busy = false;
    }
  };

  navs.forEach((btn) => {
    const i = Number(btn.dataset.wwwTale);
    btn.addEventListener("click", () => apply(i));
    btn.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) apply(i);
    });
    btn.addEventListener("focus", () => apply(i));
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
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-www-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.set(group, { autoAlpha: 1 });
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-www-count]").forEach((el) => {
    const target = Number(el.dataset.wwwCount);
    if (!Number.isFinite(target)) return;
    const prefix = el.dataset.wwwCountPrefix || "";
    const suffix = el.dataset.wwwCountSuffix || "";
    const obj = { val: 0 };
    el.textContent = `${prefix}0${suffix}`;
    if (typeof ScrollTrigger === "undefined") return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.75,
          ease: "power2.out",
          onUpdate: () => {
            const n = Math.round(obj.val);
            el.textContent = `${prefix}${target >= 1000 ? formatNumber(n) : n}${suffix}`;
          },
        });
      },
    });
  });

  window.setTimeout(() => {
    page.querySelectorAll("[data-www-reveal], [data-www-stagger] > *").forEach((el) => {
      if (window.getComputedStyle(el).opacity === "0") {
        gsap.set(el, { autoAlpha: 1, y: 0, clearProps: "transform" });
      }
    });
  }, 2800);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyWhereWeWorkPage() {
  destroyAfricaMap();
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-where-we-work]")) t.kill();
    });
  }
}
