/**
 * World Bank–style page hero — shared spotlight, related strip, and unique page bands.
 * Do not wrap the interactive Africa MapLibre host with this component.
 */

export function renderCrumbs(crumbs = []) {
  if (!crumbs.length) return "";
  return `<nav class="wph__crumbs" aria-label="Breadcrumb">${crumbs
    .map((c, i) => {
      const sep = i ? `<span class="wph__sep" aria-hidden="true">/</span>` : "";
      if (c.href) {
        const href = c.href.startsWith("#") ? c.href : `#/${String(c.href).replace(/^#\/?/, "")}`;
        const attr = href.startsWith("#/") ? " data-link" : "";
        return `${sep}<a href="${href}"${attr}>${c.label}</a>`;
      }
      return `${sep}<span aria-current="page">${c.label}</span>`;
    })
    .join("")}</nav>`;
}

function linkAttrs(href = "#") {
  if (href.startsWith("#/")) return " data-link";
  if (href.startsWith("http")) return ' target="_blank" rel="noopener noreferrer"';
  if (href.startsWith("#") && href.length > 1) return " data-anchor";
  return "";
}

function renderActions(actions = []) {
  if (!actions.length) return "";
  return `<div class="wph__actions">${actions
    .map((a, i) => {
      const href = a.href || "#";
      const primary = a.primary !== false && i === 0;
      const cls = primary ? "wph__btn wph__btn--solid" : "wph__btn wph__btn--ghost";
      return `<a href="${href}" class="${cls}"${linkAttrs(href)}>${a.label}</a>`;
    })
    .join("")}</div>`;
}

function renderRelated(related = []) {
  if (!related.length) return "";
  const cards = related
    .slice(0, 3)
    .map((r, i) => {
      if (r.html) return r.html;
      return `
      <a href="${r.href}" class="wph-related__card"${linkAttrs(r.href || "#")} style="--i:${i}">
        <span class="wph-related__thumb wph-related__thumb--${i}" aria-hidden="true"></span>
        <span class="wph-related__body">
          <span class="wph-related__tag">${r.tag || "Explore"}</span>
          <strong>${r.title}</strong>
          ${r.text ? `<span class="wph-related__text">${r.text}</span>` : ""}
        </span>
      </a>`;
    })
    .join("");
  return `
    <div class="wph-related">
      <div class="container wph-related__inner">
        <p class="wph-related__label">${related[0]?.sectionLabel || "Explore next"}</p>
        <div class="wph-related__grid">${cards}</div>
      </div>
    </div>`;
}

function renderStats(stats = []) {
  if (!stats.length) return "";
  return `
    <div class="wph-related wph-related--stats">
      <div class="container wph-related__inner">
        <p class="wph-related__label">At a glance</p>
        <div class="wph-stats">${stats
          .slice(0, 3)
          .map(
            (s) => `<div class="wph-stats__item">
              <strong>${s.value}</strong>
              <span>${s.label}</span>
            </div>`
          )
          .join("")}</div>
      </div>
    </div>`;
}

function renderChapterNext(next) {
  if (!next?.title || !next?.href) return "";
  return `
    <div class="wph-chapter">
      <div class="container wph-chapter__inner">
        <span>${next.kicker || "Continue the story"}</span>
        <a href="${next.href}"${linkAttrs(next.href)}>${next.title}</a>
      </div>
    </div>`;
}

/** Explicit back to the parent page (not an in-page jump). */
export function renderPageBack({ href, label } = {}) {
  if (!href || !label) return "";
  return `
    <div class="page-back">
      <div class="container">
        <a href="${href}" class="page-back__link" data-link>← ${label}</a>
      </div>
    </div>`;
}

/** World Bank topic tiles — each card opens a different page. */
export function renderTopicHub({ eyebrow = "Explore", title = "", lead = "", items = [] } = {}) {
  if (!items.length) return "";
  return `
    <section class="topic-hub" data-topic-hub>
      <div class="container">
        ${eyebrow ? `<p class="topic-hub__eyebrow">${eyebrow}</p>` : ""}
        ${title ? `<h2 class="topic-hub__title">${title}</h2>` : ""}
        ${lead ? `<p class="topic-hub__lead">${lead}</p>` : ""}
        <div class="topic-hub__grid">
          ${items
            .map(
              (item, i) => `
            <a href="${item.href}" class="topic-hub__card topic-hub__card--${i}" data-link style="--i:${i}">
              <span class="topic-hub__visual" aria-hidden="true"></span>
              <span class="topic-hub__body">
                ${item.kind ? `<span class="topic-hub__kind">${item.kind}</span>` : `<span class="topic-hub__n">${String(i + 1).padStart(2, "0")}</span>`}
                <h3>${item.title}</h3>
                <p>${item.text}</p>
                <span class="topic-hub__cta">${item.cta || "Open this page"} →</span>
              </span>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

const SWOOSH = `<svg class="wph__swoosh" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true"><path d="M0 64V28c180 24 360-24 540-18 180 6 360 48 540 42 120-4 240-22 360-10v22H0z"/></svg>`;

/**
 * skin: spotlight (Home only) | masthead | report | field | article | essay | catalog | who | ink
 */
export function renderWbPageHero({
  id = "page-hero",
  tone = "navy",
  variant = "spotlight",
  skin = "spotlight",
  flush = false,
  eyebrow = "",
  question = "",
  title = "",
  lead = "",
  crumbs = [],
  actions = [],
  related = [],
  stats = [],
  chapterNext = null,
  visualHtml = "",
  asideHtml = "",
  extraClass = "",
} = {}) {
  const split = Boolean((variant === "split" || asideHtml) && (visualHtml || asideHtml));
  const isHome = skin === "spotlight";
  const layoutClass = split ? "split" : isHome ? "spotlight" : "spot";
  const visualClass = visualHtml
    ? "wph__visual ch-hero__visual ch-hero__context-map-wrap"
    : "wph__visual wph__aside";

  let footer = "";
  if (isHome && stats.length) footer = renderStats(stats);
  else if (isHome) footer = renderRelated(related);
  else if (chapterNext) footer = renderChapterNext(chapterNext);

  return `
    <header class="wph wph--${tone} wph--${layoutClass} wph--skin-${skin}${flush ? " wph--flush" : " wph--offset"} ${extraClass}" id="${id}" data-wb-hero data-skin="${skin}">
      <div class="wph__stage">
        <div class="wph__media" aria-hidden="true"></div>
        <div class="wph__veil" aria-hidden="true"></div>
        <div class="container wph__inner">
          <div class="wph__copy">
            ${renderCrumbs(crumbs)}
            ${eyebrow ? `<p class="wph__eyebrow">${eyebrow}</p>` : ""}
            ${question ? `<p class="wph__question">${question}</p>` : ""}
            <h1 class="wph__title">${title}</h1>
            ${lead ? `<p class="wph__lead">${lead}</p>` : ""}
            ${renderActions(actions)}
          </div>
          ${split ? `<div class="${visualClass}">${visualHtml || asideHtml}</div>` : ""}
        </div>
        ${isHome ? SWOOSH : ""}
      </div>
      ${footer}
    </header>`;
}

/** World Bank homepage / Where-we-work featured priorities (3 photo-priority cards). */
export function renderWbSpotlightTrio({ eyebrow = "Featured", title = "", items = [] } = {}) {
  if (!items.length) return "";
  return `
    <section class="wb-trio" data-wb-trio>
      <div class="container">
        ${eyebrow ? `<p class="wb-trio__eyebrow">${eyebrow}</p>` : ""}
        ${title ? `<h2 class="wb-trio__title">${title}</h2>` : ""}
        <div class="wb-trio__grid">
          ${items
            .slice(0, 3)
            .map(
              (item, i) => `
            <a href="${item.href}" class="wb-trio__card wb-trio__card--${i}"${linkAttrs(item.href || "#")}>
              <span class="wb-trio__media" aria-hidden="true"></span>
              <span class="wb-trio__kicker">${item.kicker || "Spotlight"}</span>
              <strong>${item.title}</strong>
              ${item.text ? `<span class="wb-trio__text">${item.text}</span>` : ""}
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

/** World Bank Who-we-are navy organisation band. */
export function renderWbOrgBand({ eyebrow = "", title = "", items = [] } = {}) {
  if (!items.length) return "";
  return `
    <section class="wb-orgband">
      <div class="container">
        ${eyebrow ? `<p class="wb-orgband__eyebrow">${eyebrow}</p>` : ""}
        ${title ? `<h2 class="wb-orgband__title">${title}</h2>` : ""}
        <div class="wb-orgband__grid">
          ${items
            .map(
              (item) => `<article class="wb-orgband__card">
                <p class="wb-orgband__code">${item.code || item.kicker || ""}</p>
                <h3>${item.title}</h3>
                <p>${item.text}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

export function bindWbPageHero(root = document) {
  const hero = root?.querySelector?.("[data-wb-hero]") || document.querySelector("[data-wb-hero]");
  if (!hero || typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const media = hero.querySelector(".wph__media");
  const copyKids = hero.querySelectorAll(".wph__copy > *");
  const visual = hero.querySelector(".wph__visual");
  const related = hero.querySelectorAll(".wph-related__card, .wph-stats__item, .wph-chapter");
  const skin = hero.dataset.skin || "spotlight";

  gsap.from(copyKids, { opacity: 0, y: 28, duration: 0.7, stagger: 0.07, ease: "power3.out" });
  if (visual) gsap.from(visual, { opacity: 0, x: 24, duration: 0.8, delay: 0.15, ease: "power3.out" });
  if (media && skin === "spotlight") gsap.fromTo(media, { scale: 1.12 }, { scale: 1, duration: 8, ease: "none" });
  if (related.length) {
    gsap.from(related, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.35,
      ease: "power2.out",
    });
  }

  const trio = root?.querySelector?.("[data-wb-trio]") || document.querySelector("[data-wb-trio]");
  if (trio && typeof ScrollTrigger !== "undefined") {
    gsap.from(trio.querySelectorAll(".wb-trio__card"), {
      opacity: 0,
      y: 28,
      duration: 0.55,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: trio, start: "top 86%", once: true },
    });
  }

  const topics = root?.querySelector?.("[data-topic-hub]") || document.querySelector("[data-topic-hub]");
  if (topics && typeof ScrollTrigger !== "undefined") {
    gsap.from(topics.querySelectorAll(".topic-hub__card"), {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: topics, start: "top 88%", once: true },
    });
  }
}
