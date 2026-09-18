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

/** PA Across Africa band chrome around the existing interactive map root. */
export function renderAfricaExploreBand(band = {}, mapSection = {}, countries = []) {
  const stats = (band.stats || [])
    .map(
      (s) => `<div class="pa-africa__stat">
        <span class="pa-africa__stat-value">${s.value}</span>
        <span class="pa-africa__stat-label">${s.label}</span>
      </div>`
    )
    .join("");

  const explore = band.exploreCta || mapSection.countriesCta || { label: "Explore Africa", href: "#/africa" };
  const exploreHref = explore.href || explore.target || "#/africa";
  const panelCta = band.panelCta || { label: "View interactive map", href: "#home-africa-map-root" };

  const paCountries = (countries || []).filter((c) => c.isPaNetwork);
  const options = paCountries.length
    ? paCountries
        .map((c) => `<option value="${c.slug}">${c.name}</option>`)
        .join("")
    : `<option value="kenya">Kenya</option>
            <option value="ethiopia">Ethiopia</option>
            <option value="malawi">Malawi</option>
            <option value="zambia">Zambia</option>
            <option value="tanzania">Tanzania</option>
            <option value="rwanda">Rwanda</option>
            <option value="burundi">Burundi</option>`;

  return `
    <section class="pa-africa" id="pa-across-africa" aria-labelledby="pa-africa-title" data-home-section="africa">
      <div class="container pa-africa__top" data-reveal data-anim="slide-left">
        <div class="pa-africa__intro">
          <p class="pa-africa__eyebrow">${band.eyebrow || mapSection.eyebrow || "PA Across Africa"}</p>
          <h2 class="pa-africa__title pa-title" id="pa-africa-title">${formatPaTitle(band, mapSection.title || "A growing movement of transformation")}</h2>
          <p class="pa-africa__lead">${band.lead || mapSection.description || ""}</p>
          ${stats ? `<div class="pa-africa__stats" data-stagger="stats">${stats}</div>` : ""}
          <a class="pa-africa__link" ${linkAttrs(exploreHref)}>${explore.label || "Explore Africa"} →</a>
        </div>
        <aside class="pa-africa__panel" data-anim="pop">
          <h3>${band.panelTitle || "Explore our work across Africa"}</h3>
          <p>${band.panelText || "Click on a country to see live data, programmes, stories and more."}</p>
          <label class="pa-africa__select-label" for="pa-africa-country">Select a country</label>
          <select id="pa-africa-country" class="pa-africa__select" data-pa-country-select>
            <option value="">Choose a country</option>
            ${options}
          </select>
          <a class="pa-africa__panel-link" ${linkAttrs(panelCta.href || "#home-africa-map-root")}>${panelCta.label || "View interactive map"} →</a>
        </aside>
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

  return {
    country,
    catchments,
    communities,
    communityCount,
    catchmentCount,
    shalom,
    households,
  };
}

function renderCountryDrawerHtml(payload) {
  const { country, catchments, communities, communityCount, catchmentCount, shalom, households } = payload;
  const countryHref = `#/country/${country.slug}`;

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

    <a class="pa-drawer__country" href="${countryHref}" data-link>Open ${country.name} country page →</a>`;
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
  const select = root.querySelector("[data-pa-country-select]");
  if (!select || select.dataset.bound) return;
  select.dataset.bound = "true";

  if (data) bindCountryDrawerChrome(data);

  select.addEventListener("change", () => {
    const slug = select.value;
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
  });
}

export function destroyAfricaCountryDrawer() {
  closeCountryDrawer();
  const root = document.getElementById("pa-country-drawer-root");
  root?.remove();
  drawerBound = false;
  document.body.classList.remove("pa-drawer-open");
}

export function renderOurWorkPrograms(section = {}) {
  const programs = section.programs || [];
  if (!programs.length && !section.title) return "";

  const first = programs[0] || {};
  const list = programs
    .map((p, i) => {
      const n = String(i + 1).padStart(2, "0");
      const active = i === 0 ? " is-active" : "";
      return `<button type="button" class="pa-work__tab${active}" data-pa-work-tab="${p.id}" aria-pressed="${i === 0 ? "true" : "false"}">
        <span class="pa-work__tab-n">${n}</span>
        <span class="pa-work__tab-label">${p.title}</span>
        <span class="pa-work__tab-go" aria-hidden="true">→</span>
      </button>`;
    })
    .join("");

  const titleHtml = formatPaTitle(section, "Five programmes. One whole community.");

  const cta = section.cta || { label: "Explore the programme", href: "#/work" };
  const firstHref = first.href || cta.href || "#/work";
  const firstIcon = PROGRAM_ICONS[first.id] || PROGRAM_ICONS.leadership;
  const firstN = "01";

  return `
    <section class="pa-work" id="our-work" aria-labelledby="our-work-title" data-home-section="work" data-pa-work>
      <div class="container">
        <header class="pa-work__intro" data-reveal data-anim="fade-up">
          <div class="pa-work__intro-copy">
            ${section.eyebrow ? `<p class="pa-work__eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="our-work-title" class="pa-work__title pa-title">${titleHtml}</h2>
          </div>
          ${section.lead ? `<p class="pa-work__lead">${section.lead}</p>` : ""}
        </header>

        <div class="pa-work__stage" data-reveal data-anim="fade-up">
          <div class="pa-work__list" role="list" data-pa-work-list>
            ${list}
          </div>
          <aside class="pa-work__panel pa-work__panel--${first.tone || "maroon"}" data-pa-work-panel aria-live="polite">
            <span class="pa-work__panel-n" data-pa-work-n aria-hidden="true">${firstN}</span>
            <div class="pa-work__panel-icon" data-pa-work-icon aria-hidden="true">${firstIcon}</div>
            <h3 data-pa-work-title>${first.title || ""}</h3>
            <p data-pa-work-desc>${first.description || first.text || ""}</p>
            <a class="pa-work__panel-cta" data-pa-work-cta ${linkAttrs(firstHref)}>${cta.label || "Explore the programme"} →</a>
          </aside>
        </div>
      </div>
    </section>`;
}

export function bindOurWorkPrograms(root = document, section = {}) {
  const wrap = root.querySelector?.("[data-pa-work]") || document.querySelector("[data-pa-work]");
  if (!wrap || wrap.dataset.bound) return;
  wrap.dataset.bound = "true";

  const programs = section.programs || [];
  const byId = Object.fromEntries(programs.map((p) => [p.id, p]));
  const tabs = [...wrap.querySelectorAll("[data-pa-work-tab]")];
  const panel = wrap.querySelector("[data-pa-work-panel]");
  if (!tabs.length || !panel) return;

  const ctaLabel = section.cta?.label || "Explore the programme";
  let activeId = tabs.find((t) => t.classList.contains("is-active"))?.dataset.paWorkTab || programs[0]?.id;
  let hoverTimer = null;

  const apply = (id, { animate = true, pin = false } = {}) => {
    const p = byId[id];
    if (!p) return;
    if (pin) activeId = id;
    const index = programs.findIndex((x) => x.id === id);
    const n = String(Math.max(index, 0) + 1).padStart(2, "0");
    const icon = PROGRAM_ICONS[p.id] || PROGRAM_ICONS.leadership;
    const href = p.href || section.cta?.href || "#/work";

    tabs.forEach((tab) => {
      const on = tab.dataset.paWorkTab === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-pressed", on ? "true" : "false");
    });

    const setContent = () => {
      panel.className = `pa-work__panel pa-work__panel--${p.tone || "maroon"}`;
      const nEl = panel.querySelector("[data-pa-work-n]");
      const iconEl = panel.querySelector("[data-pa-work-icon]");
      const titleEl = panel.querySelector("[data-pa-work-title]");
      const descEl = panel.querySelector("[data-pa-work-desc]");
      const ctaEl = panel.querySelector("[data-pa-work-cta]");
      if (nEl) nEl.textContent = n;
      if (iconEl) iconEl.innerHTML = icon;
      if (titleEl) titleEl.textContent = p.title || "";
      if (descEl) descEl.textContent = p.description || p.text || "";
      if (ctaEl) {
        ctaEl.textContent = `${ctaLabel} →`;
        ctaEl.setAttribute("href", href);
        if (href.startsWith("#/")) ctaEl.setAttribute("data-link", "");
      }
    };

    if (animate && typeof gsap !== "undefined") {
      gsap.to(panel, {
        autoAlpha: 0.35,
        y: 8,
        duration: 0.15,
        ease: "power1.in",
        onComplete: () => {
          setContent();
          gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform" });
        },
      });
    } else {
      setContent();
    }
  };

  tabs.forEach((tab) => {
    const id = tab.dataset.paWorkTab;
    tab.addEventListener("mouseenter", () => {
      window.clearTimeout(hoverTimer);
      apply(id);
    });
    tab.addEventListener("focus", () => apply(id, { pin: true }));
    tab.addEventListener("click", () => apply(id, { pin: true }));
  });

  wrap.querySelector("[data-pa-work-list]")?.addEventListener("mouseleave", () => {
    hoverTimer = window.setTimeout(() => apply(activeId, { animate: true }), 120);
  });
}

/** Mini SVG charts for impact cards — brand gold/green/maroon, not a dashboard. */
function renderImpactChart(card = {}) {
  const series = Array.isArray(card.series) && card.series.length ? card.series : [28, 36, 42, 55, 68, 80];
  const max = Math.max(...series, 1);
  const type = card.chart || "bars";
  const tone = card.tone || "gold";
  const w = 160;
  const h = 48;
  const pad = 2;

  if (type === "area") {
    const step = (w - pad * 2) / Math.max(series.length - 1, 1);
    const pts = series
      .map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");
    const lastX = pad + (series.length - 1) * step;
    return `<svg class="pa-impact__chart pa-impact__chart--${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pa-impact-fill-${card.id || "a"}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points="${pad},${h - pad} ${pts} ${lastX},${h - pad}" fill="url(#pa-impact-fill-${card.id || "a"})"/>
      <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  if (type === "line") {
    const step = (w - pad * 2) / Math.max(series.length - 1, 1);
    const pts = series
      .map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");
    const dots = series
      .map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `<circle cx="${x}" cy="${y}" r="2.4" fill="currentColor"/>`;
      })
      .join("");
    return `<svg class="pa-impact__chart pa-impact__chart--${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  // default: bars (rising columns)
  const gap = 3;
  const barW = (w - pad * 2 - gap * (series.length - 1)) / series.length;
  const bars = series
    .map((v, i) => {
      const bh = Math.max(4, (v / max) * (h - pad * 2));
      const x = pad + i * (barW + gap);
      const y = h - pad - bh;
      const opacity = 0.45 + (i / Math.max(series.length - 1, 1)) * 0.55;
      return `<rect class="pa-impact__bar" x="${x}" y="${y}" width="${barW}" height="${bh}" rx="1.5" fill="currentColor" opacity="${opacity.toFixed(2)}"/>`;
    })
    .join("");
  return `<svg class="pa-impact__chart pa-impact__chart--${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

export function renderImpactDataBand(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || { label: "Explore Impact Data", href: "#/scorecard" };
  const cards = (section.cards || [])
    .map((c) => {
      const delta = c.href
        ? `<a class="pa-impact__delta" ${linkAttrs(c.href)}>${c.delta || "Explore"} →</a>`
        : `<span class="pa-impact__delta">${c.delta || ""}</span>`;
      return `<article class="pa-impact__card pa-impact__card--${c.tone || "gold"}">
        <p class="pa-impact__label">${c.label}</p>
        <p class="pa-impact__value">${c.value}</p>
        ${delta}
        <div class="pa-impact__viz" aria-hidden="true">${renderImpactChart(c)}</div>
      </article>`;
    })
    .join("");

  return `
    <section class="pa-impact" id="impact-data" aria-labelledby="impact-data-title" data-home-section="impact">
      <div class="pa-impact__bg" aria-hidden="true">
        ${section.image ? `<img src="${section.image}" alt="">` : ""}
        <span class="pa-impact__veil"></span>
      </div>
      <div class="container pa-impact__inner">
        <header class="pa-impact__head" data-reveal data-anim="slide-right">
          ${section.eyebrow ? `<p class="pa-impact__eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="impact-data-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="pa-impact__lead">${section.lead}</p>` : ""}
          ${section.updatedAt ? `<p class="pa-impact__fresh">Figures last updated: <strong>${section.updatedAt}</strong></p>` : ""}
          <a class="pa-impact__cta" ${linkAttrs(cta.href)}>${cta.label} →</a>
        </header>
        <div class="pa-impact__grid" data-reveal data-stagger="slide-up">${cards}</div>
      </div>
    </section>`;
}

export function renderStoriesBand(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || { label: "View all stories", href: "#/stories" };
  const cards = (section.cards || [])
    .map(
      (c, i) => `<a class="pa-stories__strip${i === 0 ? " is-lead" : ""}" ${linkAttrs(c.href || "#/stories")}>
        <span class="pa-stories__shot" aria-hidden="true">${c.image ? `<img src="${c.image}" alt="" loading="lazy" decoding="async">` : ""}</span>
        <span class="pa-stories__veil" aria-hidden="true"></span>
        <span class="pa-stories__copy">
          <span class="pa-stories__meta">${c.country || ""} · ${c.program || ""}</span>
          <strong class="pa-stories__title">${c.title}</strong>
          <span class="pa-stories__go">Read story →</span>
        </span>
      </a>`
    )
    .join("");

  return `
    <section class="pa-stories" id="stories-of-transformation" aria-labelledby="stories-band-title" data-home-section="stories">
      <div class="container">
        <header class="pa-stories__head" data-reveal data-anim="fade-up">
          <div>
            ${section.eyebrow ? `<p class="pa-stories__eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="stories-band-title" class="pa-title">${formatPaTitle(section)}</h2>
            ${section.lead ? `<p class="pa-stories__lead">${section.lead}</p>` : ""}
          </div>
          <a class="pa-stories__all" ${linkAttrs(cta.href)}>${cta.label} →</a>
        </header>
        <div class="pa-stories__mosaic" data-reveal data-stagger="slide-left">${cards}</div>
      </div>
    </section>`;
}

export function renderKnowledgeNewsSplit(section = {}) {
  const knowledge = section.knowledge || {};
  const news = section.news || {};
  if (!knowledge.title && !news.title) return "";

  const kCta = knowledge.cta || { label: "Visit knowledge centre", href: "#/resources" };
  const nCta = news.cta || { label: "View all news", href: "#/news" };
  const items = (news.items || [])
    .map(
      (item, i) => `<a class="pa-split__news-item" ${linkAttrs(item.href || "#/news")} style="--i:${i}">
        <span class="pa-split__news-tag">${item.tag || "News"}</span>
        <span class="pa-split__news-date">${item.date || ""}</span>
        <strong>${item.title}</strong>
      </a>`
    )
    .join("");

  return `
    <section class="pa-split" id="knowledge-news" aria-label="Knowledge and news" data-home-section="knowledge">
      <div class="container pa-split__grid">
        <article class="pa-split__knowledge" data-reveal data-anim="fade-up">
          <div class="pa-split__copy">
            ${knowledge.eyebrow ? `<p class="pa-split__eyebrow">${knowledge.eyebrow}</p>` : ""}
            <h2 class="pa-title">${formatPaTitle(knowledge, "Knowledge Centre")}</h2>
            ${knowledge.lead ? `<p>${knowledge.lead}</p>` : ""}
            <a class="pa-split__cta" ${linkAttrs(kCta.href)}>${kCta.label} →</a>
          </div>
          <figure class="pa-split__report" data-reveal data-anim="pop">
            ${
              knowledge.image
                ? `<a href="#/field-reports" data-link aria-label="Open field reports"><img src="${knowledge.image}" alt="${knowledge.imageAlt || "Field Reports"}" loading="lazy" decoding="async"></a>`
                : ""
            }
          </figure>
        </article>
        <article class="pa-split__news" data-reveal data-anim="slide-up">
          <div class="pa-split__copy">
            ${news.eyebrow ? `<p class="pa-split__eyebrow">${news.eyebrow}</p>` : ""}
            <h2 class="pa-title">${formatPaTitle(news, "Latest from PA")}</h2>
            ${news.lead ? `<p>${news.lead}</p>` : ""}
            <a class="pa-split__cta" ${linkAttrs(nCta.href)}>${nCta.label} →</a>
          </div>
          <div class="pa-split__news-list" data-stagger="slide-up">${items}</div>
        </article>
      </div>
    </section>`;
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
      <div class="container pa-partner__inner pa-partner__inner--cta" data-reveal data-anim="pop">
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
