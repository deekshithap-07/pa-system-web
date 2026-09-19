/**
 * Our Work hub — editorial scroll story (same content, non-card layouts).
 * Order: Hero → Model → Leadership → Shalom → Projects → Journey → Resources → CTA
 */

import { formatPaTitle } from "../../utils/pa-title.js";

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function renderHero(hero = {}) {
  const primary = hero.primaryCta || {};
  const secondary = hero.secondaryCta || {};
  return `
    <header class="ow-hero" data-ow-section="hero">
      <div class="ow-hero__media" aria-hidden="true">
        ${hero.image ? `<img src="${hero.image}" alt="" fetchpriority="high">` : ""}
        <span class="ow-hero__veil"></span>
      </div>
      <div class="container ow-hero__layout">
        <div class="ow-hero__inner" data-ow-reveal>
          <p class="ow-eyebrow ow-eyebrow--on-dark">${hero.eyebrow || "Our Work"}</p>
          <h1 class="pa-title ow-hero__title">${formatPaTitle(hero, "Holistic transformation for lasting change.")}</h1>
          ${hero.lead ? `<p class="ow-hero__lead">${hero.lead}</p>` : ""}
          <div class="ow-hero__actions">
            ${primary.href ? `<a class="ow-btn ow-btn--solid" ${linkAttrs(primary.href)}>${primary.label || "Explore"} →</a>` : ""}
            ${secondary.href ? `<a class="ow-btn ow-btn--ghost" ${linkAttrs(secondary.href)}>${secondary.label || "Learn more"}</a>` : ""}
          </div>
        </div>
        ${hero.quote ? `<p class="ow-hero__quote" data-ow-reveal>${hero.quote}</p>` : ""}
      </div>
    </header>`;
}

/** Ministry model — sticky intro + vertical numbered rail (not cards). */
function renderModel(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  const sidePoints = (section.sidePoints || []).map((p) => `<li data-ow-line>${p}</li>`).join("");
  const steps = (section.steps || [])
    .map(
      (s, i) => `
      <li class="ow-rail__item ow-rail__item--${s.tone || "maroon"}" data-ow-rail-item>
        <a class="ow-rail__link" ${linkAttrs(s.href || "#")}>
          <span class="ow-rail__index">${String(i + 1).padStart(2, "0")}</span>
          <span class="ow-rail__body">
            <strong class="ow-rail__title">${s.title}</strong>
            <span class="ow-rail__text">${s.text || ""}</span>
          </span>
          <span class="ow-rail__go" aria-hidden="true">→</span>
        </a>
      </li>`
    )
    .join("");

  return `
    <section class="ow-band ow-band--gold" id="work-model" data-ow-section="model" aria-labelledby="ow-model-title">
      <div class="container ow-model">
        <aside class="ow-model__aside" data-ow-sticky>
          <header class="ow-sec-head" data-ow-reveal>
            ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="ow-model-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
            ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
          </header>
          ${section.sideLead ? `<p class="ow-model__lead" data-ow-reveal>${section.sideLead}</p>` : ""}
          ${sidePoints ? `<ul class="ow-lines" data-ow-reveal>${sidePoints}</ul>` : ""}
        </aside>
        <ol class="ow-rail" data-ow-rail>${steps}</ol>
      </div>
    </section>`;
}

/** Triple-A — editorial letter spine, not cards. */
function renderLeadership(section = {}, tripleA = {}) {
  if (!section.title) return "";
  const dims = (tripleA.dimensions || [])
    .map(
      (d, i) => `<article class="ow-spine__col" data-ow-spine-col style="--i:${i}">
        <span class="ow-spine__letter" aria-hidden="true">${(d.label || "?").charAt(0)}</span>
        <h3 class="ow-spine__label">${d.label}</h3>
        <p class="ow-spine__text">${d.description || ""}</p>
      </article>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--green" id="work-leadership" data-ow-section="leadership" aria-labelledby="ow-leadership-title">
      <div class="container">
        <header class="ow-sec-head ow-sec-head--wide" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-leadership-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-spine" data-ow-spine>
          <span class="ow-spine__rule" aria-hidden="true" data-ow-spine-rule></span>
          ${dims}
        </div>
      </div>
    </section>`;
}

/** Shalom — full-bleed number + copy strip (no card shell). */
function renderShalom(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--rose" id="work-shalom" data-ow-section="shalom" aria-labelledby="ow-shalom-title">
      <div class="container ow-feature" data-ow-reveal>
        <div class="ow-feature__stat" data-ow-stat>
          <strong>${section.stat || "30–50"}</strong>
          <span>${section.statLabel || "leaders per group"}</span>
        </div>
        <div class="ow-feature__copy">
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-shalom-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </div>
      </div>
    </section>`;
}

/** Projects — stacked rule rows, not cards. */
function renderProjects(section = {}) {
  if (!section.title) return "";
  const items = (section.items || [])
    .map(
      (it, i) => `<li class="ow-stack__row" data-ow-stack-row style="--i:${i}">
        <span class="ow-stack__n">${String(i + 1).padStart(2, "0")}</span>
        <div class="ow-stack__body">
          <h3>${it.title}</h3>
          <p>${it.text || ""}</p>
        </div>
      </li>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--cream" id="work-projects" data-ow-section="projects" aria-labelledby="ow-projects-title">
      <div class="container ow-stack-wrap">
        <header class="ow-sec-head" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-projects-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <ol class="ow-stack" data-ow-stack>${items}</ol>
      </div>
    </section>`;
}

/** Journey — vertical timeline. */
function renderJourney(section = {}, journey = {}) {
  if (!section.title) return "";
  const stages = (journey.stages || [])
    .map(
      (s, i) => `<li class="ow-path__step" data-ow-path-step style="--i:${i}">
        <div class="ow-path__meta">
          <span class="ow-path__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="ow-path__month">Month ${s.month}</span>
        </div>
        <span class="ow-path__dot" aria-hidden="true"></span>
        <div class="ow-path__body">
          <h3>${s.label}</h3>
          <p>${s.description || ""}</p>
        </div>
      </li>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--mint" id="work-journey" data-ow-section="journey" aria-labelledby="ow-journey-title">
      <div class="container">
        <header class="ow-sec-head ow-sec-head--wide" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-journey-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-path" data-ow-path>
          <div class="ow-path__line" aria-hidden="true">
            <span class="ow-path__line-fill" data-ow-path-fill></span>
          </div>
          <ol class="ow-path__list">${stages}</ol>
        </div>
      </div>
    </section>`;
}

/** Resources — statement lines. */
function renderResources(section = {}) {
  if (!section.title) return "";
  const points = (section.points || [])
    .map((p) => `<li class="ow-say__line" data-ow-say-line>${p}</li>`)
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--stone" id="work-resources" data-ow-section="resources" aria-labelledby="ow-resources-title">
      <div class="container ow-say">
        <header class="ow-sec-head" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-resources-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        ${points ? `<ul class="ow-say__list" data-ow-say>${points}</ul>` : ""}
      </div>
    </section>`;
}

function renderCtaBand(section = {}) {
  if (!section.title) return "";
  const primary = section.primaryCta || {};
  const secondary = section.secondaryCta || {};
  return `
    <section class="ow-cta" id="work-next" data-ow-section="cta" aria-labelledby="ow-cta-title">
      <div class="container ow-cta__inner" data-ow-reveal>
        <div>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-cta-title" class="pa-title ow-cta__title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-cta__lead">${section.lead}</p>` : ""}
        </div>
        <div class="ow-cta__actions">
          ${primary.href ? `<a class="ow-btn ow-btn--solid" ${linkAttrs(primary.href)}>${primary.label} →</a>` : ""}
          ${secondary.href ? `<a class="ow-btn ow-btn--ghost" ${linkAttrs(secondary.href)}>${secondary.label}</a>` : ""}
        </div>
      </div>
    </section>`;
}

export function renderOurWorkPage(page = {}, ministryModel = {}) {
  return `
    <div class="ow-page" data-what-we-do data-work-section="overview" data-our-work-page>
      ${renderHero(page.hero)}
      ${renderModel(page.model)}
      ${renderLeadership(page.leadership, ministryModel.tripleA)}
      ${renderShalom(page.shalom)}
      ${renderProjects(page.projects)}
      ${renderJourney(page.journey, ministryModel.journey)}
      ${renderResources(page.resources)}
      ${renderCtaBand(page.ctaBand)}
    </div>`;
}

export function initOurWorkAnimations(root = document) {
  const page = root.querySelector?.("[data-our-work-page]") || document.querySelector("[data-our-work-page]");
  if (!page || typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("ow-page--reduced");
    return;
  }

  const reveal = (els, from, opts = {}) => {
    const list = gsap.utils.toArray(els).filter(Boolean);
    if (!list.length) return;
    gsap.fromTo(
      list,
      from,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: opts.duration || 0.7,
        stagger: opts.stagger || 0,
        ease: opts.ease || "power3.out",
        clearProps: opts.clearProps || "transform",
        scrollTrigger: {
          trigger: opts.trigger || list[0],
          start: opts.start || "top 86%",
          once: true,
        },
      }
    );
  };

  page.querySelectorAll("[data-ow-reveal]").forEach((el) => {
    reveal(el, { opacity: 0, y: 28 }, { trigger: el, duration: 0.75 });
  });

  /* Model rail — sequential slide-in */
  const railItems = page.querySelectorAll("[data-ow-rail-item]");
  if (railItems.length) {
    gsap.set(railItems, { opacity: 0, x: 40 });
    gsap.to(railItems, {
      opacity: 1,
      x: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: page.querySelector("[data-ow-rail]"),
        start: "top 78%",
        once: true,
      },
    });
  }

  /* Leadership spine — rule draw + columns */
  const spineRule = page.querySelector("[data-ow-spine-rule]");
  const spineCols = page.querySelectorAll("[data-ow-spine-col]");
  if (spineRule || spineCols.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: page.querySelector("[data-ow-spine]"),
        start: "top 80%",
        once: true,
      },
    });
    if (spineRule) {
      gsap.set(spineRule, { scaleX: 0, transformOrigin: "left center" });
      tl.to(spineRule, { scaleX: 1, duration: 0.7, ease: "power2.out" });
    }
    if (spineCols.length) {
      gsap.set(spineCols, { opacity: 0, y: 24 });
      tl.to(
        spineCols,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.14,
          ease: "power3.out",
          clearProps: "transform",
        },
        "-=0.25"
      );
    }
  }

  /* Shalom stat punch */
  const stat = page.querySelector("[data-ow-stat] strong");
  if (stat) {
    gsap.fromTo(
      stat,
      { opacity: 0, scale: 0.85, y: 16 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.6)",
        clearProps: "transform",
        scrollTrigger: { trigger: stat, start: "top 88%", once: true },
      }
    );
  }

  /* Project stack rows */
  const stackRows = page.querySelectorAll("[data-ow-stack-row]");
  if (stackRows.length) {
    gsap.set(stackRows, { opacity: 0, y: 20 });
    gsap.to(stackRows, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: page.querySelector("[data-ow-stack]"),
        start: "top 82%",
        once: true,
      },
    });
  }

  /* Journey path fill + steps */
  const pathFill = page.querySelector("[data-ow-path-fill]");
  const pathSteps = page.querySelectorAll("[data-ow-path-step]");
  if (pathFill || pathSteps.length) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: page.querySelector("[data-ow-path]"),
        start: "top 78%",
        once: true,
      },
    });
    if (pathFill) {
      gsap.set(pathFill, { scaleY: 0, transformOrigin: "top center" });
      tl.to(pathFill, { scaleY: 1, duration: 1.1, ease: "power2.inOut" });
    }
    if (pathSteps.length) {
      gsap.set(pathSteps, { opacity: 0, x: -18 });
      tl.to(
        pathSteps,
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
        },
        0.15
      );
    }
  }

  /* Resource statement lines */
  const sayLines = page.querySelectorAll("[data-ow-say-line]");
  if (sayLines.length) {
    gsap.set(sayLines, { opacity: 0, x: -24 });
    gsap.to(sayLines, {
      opacity: 1,
      x: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: page.querySelector("[data-ow-say]"),
        start: "top 84%",
        once: true,
      },
    });
  }

  window.setTimeout(() => {
    page
      .querySelectorAll(
        "[data-ow-reveal], [data-ow-rail-item], [data-ow-spine-col], [data-ow-stack-row], [data-ow-path-step], [data-ow-say-line]"
      )
      .forEach((el) => {
        if (window.getComputedStyle(el).opacity === "0") {
          gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, clearProps: "transform" });
        }
      });
  }, 10000);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
