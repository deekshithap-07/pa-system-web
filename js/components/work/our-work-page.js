/**
 * Our Work hub — ministry model (design mockup + vision order as reference).
 * Order: Hero → Our Model → Community → Leadership → Shalom → PPP/CHIPs → Journey → Resources → CTA
 */

import { formatPaTitle } from "../../utils/pa-title.js";

const MODEL_ICONS = {
  community: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 34c-6-4-10-9-10-14a10 10 0 1120 0c0 5-4 10-10 14z" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="20" r="3" fill="currentColor"/></svg>`,
  leadership: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="16" r="6" stroke="currentColor" stroke-width="2"/><path d="M10 38c2.5-7 8-11 14-11s11.5 4 14 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  shalom: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="18" cy="20" r="5" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="20" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="30" r="5" stroke="currentColor" stroke-width="2"/></svg>`,
  projects: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M14 28c4-2 8-2 12 0s8 2 12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 22v8M30 22v8M16 22h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  journey: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="12" stroke="currentColor" stroke-width="2"/><path d="M24 16v9l6 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M34 14l4 2-2 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  resources: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 12v24M16 20h16M18 36h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="12" r="3" fill="currentColor"/></svg>`,
};

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
        <div class="ow-hero__inner" data-reveal data-anim="fade-up">
          <p class="ow-eyebrow ow-eyebrow--on-dark">${hero.eyebrow || "Our Work"}</p>
          <h1 class="pa-title ow-title">${formatPaTitle(hero, "Holistic transformation for lasting change.")}</h1>
          ${hero.lead ? `<p class="ow-hero__lead">${hero.lead}</p>` : ""}
          <div class="ow-hero__actions">
            ${primary.href ? `<a class="ow-btn ow-btn--solid" ${linkAttrs(primary.href)}>${primary.label || "Explore"} →</a>` : ""}
            ${secondary.href ? `<a class="ow-btn ow-btn--ghost" ${linkAttrs(secondary.href)}>${secondary.label || "Learn more"}</a>` : ""}
          </div>
        </div>
        ${hero.quote ? `<p class="ow-hero__quote" data-reveal data-anim="slide-left">${hero.quote}</p>` : ""}
      </div>
    </header>`;
}

/** Our Model overview — title left, story copy right, staged pillars with arrows. */
function renderModel(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  const sidePoints = (section.sidePoints || []).map((p) => `<li>${p}</li>`).join("");
  const steps = (section.steps || [])
    .map(
      (s, i, arr) => `
      <li class="ow-model__step">
        <a class="ow-model__card ow-model__card--${s.tone || "maroon"}" ${linkAttrs(s.href || "#")}>
          <span class="ow-model__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="ow-model__icon" aria-hidden="true">${MODEL_ICONS[s.id] || MODEL_ICONS.community}</span>
          <strong>${s.title}</strong>
          <span>${s.text || ""}</span>
        </a>
        ${
          i < arr.length - 1
            ? `<span class="ow-model__connector" aria-hidden="true">
                <span class="ow-model__connector-line"></span>
                <span class="ow-model__connector-tip"></span>
              </span>`
            : ""
        }
      </li>`
    )
    .join("");

  return `
    <section class="ow-band ow-band--model ow-band--skin-gold" id="work-model" data-ow-section="model" aria-labelledby="ow-model-title">
      <div class="container">
        <div class="ow-model__intro">
          <header class="ow-band__head ow-model__head" data-reveal data-anim="fade-up">
            ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
            <h2 id="ow-model-title" class="pa-title">${formatPaTitle(section)}</h2>
            ${
              cta.href
                ? `<a class="ow-text-link ow-model__cta" ${linkAttrs(cta.href)}>${cta.label} →</a>
                   <span class="ow-model__drop" aria-hidden="true">
                     <span class="ow-model__drop-line"></span>
                     <span class="ow-model__drop-tip"></span>
                   </span>`
                : ""
            }
          </header>
          <aside class="ow-model__aside" data-reveal data-anim="slide-right">
            ${section.sideLead ? `<p class="ow-model__aside-lead">${section.sideLead}</p>` : ""}
            ${sidePoints ? `<ul class="ow-list">${sidePoints}</ul>` : ""}
          </aside>
        </div>
        <ol class="ow-model__flow">${steps}</ol>
      </div>
    </section>`;
}

function renderLeadership(section = {}, tripleA = {}) {
  if (!section.title) return "";
  const dims = (tripleA.dimensions || [])
    .map(
      (d) => `<article class="ow-card">
        <span class="ow-card__mark">${(d.label || "?").charAt(0)}</span>
        <h3>${d.label}</h3>
        <p>${d.description || ""}</p>
      </article>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--skin-green" id="work-leadership" data-ow-section="leadership" aria-labelledby="ow-leadership-title">
      <div class="container">
        <header class="ow-band__head" data-reveal data-anim="fade-up">
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-leadership-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-band__lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-cards ow-cards--3" data-reveal data-stagger="slide-up">${dims}</div>
      </div>
    </section>`;
}

function renderShalom(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--skin-maroon" id="work-shalom" data-ow-section="shalom" aria-labelledby="ow-shalom-title">
      <div class="container ow-shalom" data-reveal data-anim="pop">
        <div class="ow-shalom__stat">
          <strong>${section.stat || "30–50"}</strong>
          <span>${section.statLabel || "leaders per group"}</span>
        </div>
        <div class="ow-shalom__copy">
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-shalom-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-band__lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </div>
      </div>
    </section>`;
}

function renderProjects(section = {}) {
  if (!section.title) return "";
  const items = (section.items || [])
    .map(
      (it) => `<article class="ow-card">
        <h3>${it.title}</h3>
        <p>${it.text || ""}</p>
      </article>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--skin-gold" id="work-projects" data-ow-section="projects" aria-labelledby="ow-projects-title">
      <div class="container">
        <header class="ow-band__head" data-reveal data-anim="slide-right">
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-projects-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-band__lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-cards ow-cards--3" data-reveal data-stagger="pop">${items}</div>
      </div>
    </section>`;
}

function renderJourney(section = {}, journey = {}) {
  if (!section.title) return "";
  const stages = (journey.stages || [])
    .map(
      (s, i) => `<article class="ow-stage">
        <span class="ow-stage__n">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3>${s.label}</h3>
          <em>Month ${s.month}</em>
          <p>${s.description || ""}</p>
        </div>
      </article>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--skin-green" id="work-journey" data-ow-section="journey" aria-labelledby="ow-journey-title">
      <div class="container">
        <header class="ow-band__head" data-reveal data-anim="fade-up">
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-journey-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-band__lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-stages" data-reveal data-stagger="slide-left">${stages}</div>
      </div>
    </section>`;
}

function renderResources(section = {}) {
  if (!section.title) return "";
  const points = (section.points || []).map((p) => `<li>${p}</li>`).join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--skin-maroon" id="work-resources" data-ow-section="resources" aria-labelledby="ow-resources-title">
      <div class="container ow-resources" data-reveal data-anim="slide-left">
        <div>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-resources-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-band__lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </div>
        ${points ? `<ul class="ow-list ow-list--boxed">${points}</ul>` : ""}
      </div>
    </section>`;
}

function renderCtaBand(section = {}) {
  if (!section.title) return "";
  const primary = section.primaryCta || {};
  const secondary = section.secondaryCta || {};
  return `
    <section class="ow-cta" id="work-next" data-ow-section="cta" aria-labelledby="ow-cta-title">
      <div class="container ow-cta__inner" data-reveal data-anim="pop">
        <div>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-cta-title" class="pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p>${section.lead}</p>` : ""}
        </div>
        <div class="ow-cta__actions">
          ${primary.href ? `<a class="ow-btn ow-btn--solid" ${linkAttrs(primary.href)}>${primary.label} →</a>` : ""}
          ${secondary.href ? `<a class="ow-btn ow-btn--ghost" ${linkAttrs(secondary.href)}>${secondary.label}</a>` : ""}
        </div>
      </div>
    </section>`;
}

/**
 * Full Our Work hub page.
 * Order: Hero → Our Model → Leadership → Shalom → PPP/CHIPs → Journey → Resources → CTA
 */
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
    page.querySelectorAll("[data-reveal], [data-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const fromMap = {
    "slide-left": { opacity: 0, x: -36 },
    "slide-right": { opacity: 0, x: 36 },
    "slide-up": { opacity: 0, y: 28 },
    pop: { opacity: 0, y: 18, scale: 0.94 },
    "fade-up": { opacity: 0, y: 24 },
  };

  const play = (targets, type, opts = {}) => {
    const els = gsap.utils.toArray(targets).filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(
      els,
      fromMap[type] || fromMap["fade-up"],
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: opts.duration || 0.65,
        stagger: opts.stagger || 0,
        ease: type === "pop" ? "back.out(1.4)" : "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: opts.trigger || els[0],
          start: "top 88%",
          once: true,
        },
      }
    );
  };

  // Whole-section lift so bands feel distinct as you scroll
  page.querySelectorAll(".ow-band[data-ow-section]").forEach((band, i) => {
    gsap.fromTo(
      band,
      { opacity: 0.35, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: Math.min(i * 0.02, 0.08),
        scrollTrigger: {
          trigger: band,
          start: "top 92%",
          once: true,
        },
      }
    );
  });

  page.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.hasAttribute("data-stagger") && el.children.length) return;
    if (el.classList.contains("ow-model__flow")) return;
    play(el, el.dataset.anim || "fade-up", { trigger: el.closest(".ow-band") || el });
  });

  page.querySelectorAll("[data-stagger]").forEach((group) => {
    if (group.classList.contains("ow-model__flow")) return;
    gsap.set(group, { opacity: 1 });
    play([...group.children], group.dataset.stagger || "fade-up", {
      trigger: group.closest(".ow-band") || group,
      stagger: 0.1,
      duration: 0.55,
    });
  });

  // Ministry model flow: starts when the card row enters view (not the band top)
  const flow = page.querySelector(".ow-model__flow");
  const drop = page.querySelector(".ow-model__drop");
  if (flow) {
    const cards = [...flow.querySelectorAll(".ow-model__card")];
    const connectors = [...flow.querySelectorAll(".ow-model__connector")];
    const dropLine = drop?.querySelector(".ow-model__drop-line");
    const dropTip = drop?.querySelector(".ow-model__drop-tip");

    gsap.set(cards, { opacity: 0, y: 28, scale: 0.94 });
    gsap.set(connectors, { opacity: 0, scale: 0.5 });
    if (dropLine) gsap.set(dropLine, { scaleY: 0, transformOrigin: "top center" });
    if (dropTip) gsap.set(dropTip, { opacity: 0 });
    gsap.set(flow, { opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: flow,
        start: "top 82%",
        once: true,
      },
    });

    if (dropLine) {
      tl.to(dropLine, { scaleY: 1, duration: 0.55, ease: "power2.out" });
    }
    if (dropTip) {
      tl.to(dropTip, { opacity: 1, duration: 0.25, ease: "power1.out" }, "-=0.15");
    }

    tl.to({}, { duration: 0.2 }); // brief pause so the first card is clearly on-screen

    cards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
        clearProps: "transform",
      });
      if (connectors[i]) {
        tl.to(
          connectors[i],
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.12"
        );
      }
      // hold between steps so the sequence reads clearly while scrolling
      if (i < cards.length - 1) tl.to({}, { duration: 0.18 });
    });
  }

  window.setTimeout(() => {
    page
      .querySelectorAll(
        "[data-reveal], [data-stagger] > *, .ow-band[data-ow-section], .ow-model__card, .ow-model__connector, .ow-model__drop-line, .ow-model__drop-tip"
      )
      .forEach((el) => {
        const opacity = window.getComputedStyle(el).opacity;
        if (opacity === "0" || opacity === "0.35") {
          gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, clearProps: "transform" });
        }
      });
  }, 10000);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
