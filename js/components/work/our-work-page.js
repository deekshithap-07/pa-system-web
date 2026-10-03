/**
 * What We Do — ministry model as a scroll journey.
 * Hero markup is preserved exactly. Content/routes unchanged.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { PA_FLOW, ACTIVITY_TYPES, PPP_EXAMPLES, CHIP_EXAMPLES, PA_PPPS } from "../shared/pa-model.js";
import { PA_PROGRAMMES } from "../shared/pa-programmes.js";

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

/** EXISTING HERO — do not redesign. */
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

/** Section header: eyebrow on top, title left, statement right — the statement starts level with the title. */
function splitHead({ id, section = {}, dark = false }) {
  const cta = section.cta || {};
  return `
        <header class="ow-split${dark ? " ow-split--dark" : ""}" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow${dark ? " ow-eyebrow--on-dark" : ""} ow-split__eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="${id}" class="ow-sec-title${dark ? " ow-sec-title--light" : ""} pa-title ow-split__title">${formatPaTitle(section)}</h2>
          <div class="ow-split__side">
            ${section.lead ? `<p class="ow-sec-lead${dark ? " ow-sec-lead--light" : ""}">${section.lead}</p>` : ""}
            ${cta.href ? `<a class="ow-text-link${dark ? " ow-text-link--light" : ""}" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
          </div>
        </header>`;
}

/** How we transform — the two-year journey only: the path, then the five stages across 24 months. */
function renderTransform(section = {}, journey = {}) {
  const path = (section.steps || [])
    .map(
      (s, i) => `<li class="ow-tj__step" style="--i:${i}">
          <span class="ow-tj__dot" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          <span class="ow-tj__label">${s}</span>
        </li>`
    )
    .join("");

  const stages = journey.stages || [];
  const span = (m = "") => {
    const [a, b] = String(m).split(/[–-]/).map((n) => parseInt(n, 10));
    return a && b ? b - a + 1 : 3;
  };
  const timeline = stages
    .map(
      (s, i) => `<li class="ow-tj__stage" style="--span:${span(s.month)};--i:${i}">
          <span class="ow-tj__bar" aria-hidden="true"></span>
          <strong>${s.label}</strong>
          ${s.month ? `<span class="ow-tj__months">Months ${s.month}</span>` : ""}
        </li>`
    )
    .join("");

  return `
    <section class="ow-tf ow-tj" id="work-transform" data-ow-section="transform" aria-labelledby="ow-tf-title" data-ow-tf>
      <div class="container">
        ${splitHead({ id: "ow-tf-title", section })}
        ${path ? `<ol class="ow-tj__path" data-ow-reveal aria-label="How PA transforms a community">${path}</ol>` : ""}
        ${
          timeline
            ? `<div class="ow-tj__time" data-ow-reveal>
          <div class="ow-tj__time-head">
            <p class="ow-tj__time-title">${journey.title || "The 2-Year Transformation Journey"}</p>
            <div class="ow-tj__years" aria-hidden="true"><span>Year 1</span><span>Year 2</span></div>
          </div>
          <ol class="ow-tj__stages">${timeline}</ol>
        </div>`
            : ""
        }
      </div>
    </section>`;
}

let transformCleanup = null;

function bindTransformFlow(page) {
  destroyTransformFlow();
  const root = page.querySelector("[data-ow-tf]");
  if (!root) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) root.classList.add("is-in", "is-ambient");
      else root.classList.remove("is-ambient");
    },
    { threshold: 0.2 }
  );
  io.observe(root);
  transformCleanup = () => io.disconnect();
}

export function destroyTransformFlow() {
  transformCleanup?.();
  transformCleanup = null;
}
const chips = (items) => `<ul class="ow-mm__chips">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;

/** The ministry model — Country → Catchment → Community → Pastors Fellowship → Shalom Groups → Households. */
function renderHowPaWorks(section = {}) {
  if (!section.title) return "";
  const brief = [
    { label: "Programs", count: PA_PROGRAMMES.length, text: PA_PROGRAMMES.map((p) => p.title).join(" · ") },
    { label: "PPPs", count: 3, note: "per program", text: "Focus areas under each program." },
    { label: "Activities", count: ACTIVITY_TYPES.length, note: "types", text: ACTIVITY_TYPES.map((a) => a.label).join(" · ") },
    { label: "CHIPs", text: "Community High Impact Projects — a PPP of Economic Productivity." },
  ]
    .map(
      (b) => `<li class="ow-mm__brief-item">
          ${b.count ? `<span class="ow-mm__count">${b.count}${b.note ? ` <em>${b.note}</em>` : ""}</span>` : ""}
          <h3 class="ow-mm__label">${b.label}</h3>
          <p>${b.text}</p>
        </li>`
    )
    .join("");
  const flow = PA_FLOW.map(
    (f, i) => `<li class="ow-mm__level ow-mm__level--flow" style="--i:${i}">
        <div class="ow-mm__top"><span class="ow-mm__n">${String(i + 1).padStart(2, "0")}</span></div>
        <h3 class="ow-mm__label">${f.label}</h3>
        <p>${f.text}</p>
      </li>`
  ).join("");

  return `
    <section class="ow-band ow-band--model ow-mm" id="work-model" data-ow-section="model" aria-labelledby="ow-model-title">
      <div class="container">
        ${splitHead({ id: "ow-model-title", section, dark: true })}
        <p class="ow-mm__examples-title">How the work is organised</p>
        <ol class="ow-mm__chain ow-mm__chain--flow" aria-label="Country to households">${flow}</ol>
        <p class="ow-mm__examples-title ow-mm__part">Programs, PPPs, activities and CHIPs</p>
        <ol class="ow-mm__brief" data-ow-reveal aria-label="Programs → PPPs → Activities → CHIPs">${brief}</ol>
      </div>
    </section>`;
}

/** Leadership (warm gold). */
function renderLeadership(section = {}, tripleA = {}) {
  if (!section.title) return "";
  const dims = (tripleA.dimensions || [])
    .map(
      (d, i) => `<li class="ow-lead-flow__item ow-lead-flow__item--${i % 3}" data-ow-spine-col style="--i:${i}">
        <span class="ow-lead-flow__letter" aria-hidden="true">${(d.label || "?").charAt(0)}</span>
        <div>
          <span class="ow-lead-flow__n">${String(i + 1).padStart(2, "0")}</span>
          <h3>${d.label}</h3>
          <p>${d.description || ""}</p>
        </div>
      </li>`
    )
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--ochre" id="work-leadership" data-ow-section="leadership" aria-labelledby="ow-leadership-title">
      <span class="ow-band__bg-word ow-band__bg-word--dark" aria-hidden="true" data-ow-parallax>Leadership</span>
      <div class="container ow-portrait">
        <header class="ow-portrait__copy" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-leadership-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <figure class="ow-portrait__media" data-ow-clip>
          <img src="assets/country-heroes/ethiopia-hero-leaders.jpg" alt="" loading="lazy" decoding="async">
        </figure>
        ${
          dims
            ? `<div class="ow-lead-wrap">
                ${tripleA.title ? `<p class="ow-lead-wrap__title">${tripleA.title}</p>` : ""}
                <ol class="ow-lead-flow" data-ow-spine aria-label="${tripleA.title || "Triple-A leadership"}">${dims}</ol>
              </div>`
            : ""
        }
      </div>
    </section>`;
}

/** Section 4 — Shalom Groups (muted green). */
function renderShalom(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--green" id="work-shalom" data-ow-section="shalom" aria-labelledby="ow-shalom-title">
      <div class="container ow-organic">
        <div class="ow-organic__visual">
          <div class="ow-organic__orb" aria-hidden="true" data-ow-orb>
            <span class="ow-organic__orb-ring"></span>
            ${
              section.stat
                ? `<span class="ow-organic__orb-core" data-ow-stat>
                    <strong>${section.stat}</strong>
                    ${section.statLabel ? `<em>${section.statLabel}</em>` : ""}
                  </span>`
                : ""
            }
          </div>
          <figure class="ow-organic__photo" data-ow-clip>
            <img src="assets/stories/story-lilongwe-savings.jpg" alt="" loading="lazy" decoding="async">
          </figure>
        </div>
        <div class="ow-organic__copy" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-shalom-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </div>
      </div>
    </section>`;
}

/** PPPs & CHIPs — the full explanation: tracking chain, all fifteen PPPs, CHIPs (deep maroon). */
function renderProjects(section = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  const [pppText, chipText, ownText] = section.items || [];

  const chain = [
    { label: "Program", count: PA_PROGRAMMES.length, body: chips(PA_PROGRAMMES.map((p) => p.title)) },
    { label: "PPP", count: "3", note: "per program", body: pppText ? `<p>${pppText.text}</p>` : "" },
    { label: "Activity type", count: ACTIVITY_TYPES.length, body: chips(ACTIVITY_TYPES.map((a) => a.label)) },
    { label: "Activity", body: chips(PPP_EXAMPLES.map((e) => e.activity)) },
  ]
    .map(
      (l, i) => `<li class="ow-mm__level" style="--i:${i}" data-ow-flow-node>
        <div class="ow-mm__top">
          <span class="ow-mm__n">${String(i + 1).padStart(2, "0")}</span>
          ${l.count ? `<span class="ow-mm__count">${l.count}${l.note ? ` <em>${l.note}</em>` : ""}</span>` : ""}
        </div>
        <h3 class="ow-mm__label">${l.label}</h3>
        ${l.body}
      </li>`
    )
    .join("");

  const rows = PPP_EXAMPLES.map(
    (e) => `<tr><td>${e.programme}</td><td>${e.ppp}</td><td>${e.type}</td><td>${e.activity}</td></tr>`
  ).join("");

  const programs = PA_PROGRAMMES.map(
    (p, i) => `<li class="ow-ppp__prog">
        <a class="ow-ppp__prog-head" href="#/program/${p.id}" data-link>
          <span class="ow-ppp__prog-n">${String(i + 1).padStart(2, "0")}</span>
          <strong>${p.title}</strong>
        </a>
        <ol class="ow-ppp__list">
          ${(PA_PPPS[p.id] || [])
            .map(
              (x) => `<li${x.id === "chips" ? ' class="is-chip"' : ""}>${x.name}${x.detail ? `<small>${x.detail}</small>` : ""}</li>`
            )
            .join("")}
        </ol>
      </li>`
  ).join("");

  return `
    <section class="ow-band ow-pppx ow-ppp" id="work-projects" data-ow-section="projects" aria-labelledby="ow-projects-title">
      <div class="container">
        ${splitHead({ id: "ow-projects-title", section, dark: true })}

        <p class="ow-mm__examples-title">How every activity is tracked</p>
        <ol class="ow-mm__chain" data-ow-flow aria-label="Program → PPP → Activity type → Activity">${chain}</ol>
        <div class="ow-mm__examples" data-ow-reveal>
          <p class="ow-mm__examples-title">Examples</p>
          <table class="ow-mm__table">
            <thead><tr><th scope="col">Program</th><th scope="col">PPP</th><th scope="col">Activity type</th><th scope="col">Activity</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <p class="ow-mm__examples-title ow-mm__part">The five programs and their PPPs</p>
        <ol class="ow-ppp__progs" data-ow-reveal>${programs}</ol>

        <div class="ow-ppp__chips" data-ow-reveal>
          <div class="ow-ppp__chips-copy">
            <p class="ow-mm__examples-title">${chipText?.title || "CHIPs — Community High Impact Projects"}</p>
            ${chipText ? `<p>${chipText.text}</p>` : ""}
            ${ownText ? `<p class="ow-ppp__own"><strong>${ownText.title}.</strong> ${ownText.text}</p>` : ""}
          </div>
          <ul class="ow-ppp__chip-list">${CHIP_EXAMPLES.map((c) => `<li>${c}</li>`).join("")}</ul>
        </div>
      </div>
    </section>`;
}

/** Section 6 — 2-year journey (ivory). */
function renderJourney(section = {}, journey = {}) {
  if (!section.title) return "";
  const stages = journey.stages || [];
  let yearMarker = "";
  const stepsHtml = stages
    .map((s, i) => {
      const monthStart = parseInt(String(s.month || "").split(/[–-]/)[0], 10) || i + 1;
      const year = monthStart <= 12 ? 1 : 2;
      let marker = "";
      if (yearMarker !== year) {
        yearMarker = year;
        marker = `<li class="ow-path__year" aria-hidden="true"><span>Year ${year}</span></li>`;
      }
      return `${marker}<li class="ow-path__step" data-ow-path-step style="--i:${i}">
        <div class="ow-path__meta">
          <span class="ow-path__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="ow-path__month">Month ${s.month}</span>
        </div>
        <span class="ow-path__dot" aria-hidden="true"></span>
        <div class="ow-path__body">
          <h3>${s.label}</h3>
          <p>${s.description || ""}</p>
        </div>
      </li>`;
    })
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--ivory" id="work-journey" data-ow-section="journey" aria-labelledby="ow-journey-title">
      <span class="ow-band__bg-word" aria-hidden="true">Journey</span>
      <div class="container">
        <header class="ow-sec-head ow-sec-head--wide" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-journey-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead">${section.lead}</p>` : ""}
          ${journey.duration ? `<p class="ow-path__duration">${journey.duration}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-path" data-ow-path>
          <div class="ow-path__line" aria-hidden="true">
            <span class="ow-path__line-fill" data-ow-path-fill></span>
          </div>
          <ol class="ow-path__list">${stepsHtml}</ol>
        </div>
      </div>
    </section>`;
}

/** Section 7 — Local ownership (burgundy). */
function renderResources(section = {}) {
  if (!section.title) return "";
  const points = (section.points || [])
    .map((p) => `<li class="ow-own__line" data-ow-say-line>${p}</li>`)
    .join("");
  const cta = section.cta || {};
  return `
    <section class="ow-band ow-band--burgundy" id="work-resources" data-ow-section="resources" aria-labelledby="ow-resources-title">
      <div class="container ow-own">
        <div class="ow-own__statement" data-ow-reveal>
          <p class="ow-eyebrow ow-eyebrow--on-dark">${section.eyebrow || "Resource mobilisation"}</p>
          <p class="ow-own__mega" aria-hidden="true" data-ow-own-mega><span data-ow-own-word>Local</span><span data-ow-own-word>Ownership</span></p>
          <h2 id="ow-resources-title" class="ow-sec-title ow-sec-title--light pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead ow-sec-lead--light">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link ow-text-link--light" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </div>
        <div class="ow-own__side">
          <figure class="ow-own__media" data-ow-clip>
            <img src="assets/stories/story-mzimba-cooperative.png" alt="" loading="lazy" decoding="async">
          </figure>
          ${points ? `<ul class="ow-own__list" data-ow-say>${points}</ul>` : ""}
        </div>
      </div>
    </section>`;
}

/** Section 8 — Closing CTA (cream). */
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
          ${secondary.href ? `<a class="ow-btn ow-btn--ghost-dark" ${linkAttrs(secondary.href)}>${secondary.label}</a>` : ""}
        </div>
      </div>
    </section>`;
}

export function renderOurWorkPage(page = {}, ministryModel = {}) {
  return `
    <div class="ow-page" data-what-we-do data-work-section="overview" data-our-work-page>
      ${renderHero(page.hero)}
      ${renderTransform(page.transform, ministryModel.journey)}
      ${renderHowPaWorks(page.model)}
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
  if (!page) return;
  bindTransformFlow(page);
  if (typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("ow-page--reduced");
    return;
  }

  page.querySelectorAll("[data-ow-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-ow-clip]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)", opacity: 0.7 },
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      }
    );
  });

  const flowNodes = page.querySelectorAll("[data-ow-flow-node]");
  if (flowNodes.length) {
    gsap.fromTo(
      flowNodes,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "transform",
        onStart: () => page.querySelector("[data-ow-flow]")?.classList.add("is-in"),
        scrollTrigger: { trigger: page.querySelector("[data-ow-flow]"), start: "top 80%", once: true },
      }
    );
  }

  const spineRule = page.querySelector("[data-ow-spine-rule]");
  const spineCols = page.querySelectorAll("[data-ow-spine-col]");
  if (spineRule || spineCols.length) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: page.querySelector("[data-ow-spine]"), start: "top 80%", once: true },
    });
    if (spineRule) {
      gsap.set(spineRule, { scaleX: 0, transformOrigin: "left center" });
      tl.to(spineRule, { scaleX: 1, duration: 0.7, ease: "power2.out" });
    }
    if (spineCols.length) {
      gsap.set(spineCols, { opacity: 0, y: 24 });
      tl.to(spineCols, { opacity: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "power3.out", clearProps: "transform" }, "-=0.25");
    }
  }

  const orb = page.querySelector("[data-ow-orb]");
  if (orb) {
    gsap.fromTo(
      orb,
      { scale: 0.88, opacity: 0.5 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: { trigger: orb, start: "top 85%", once: true },
      }
    );
  }

  const duoLine = page.querySelector("[data-ow-duo-line]");
  const stackRows = page.querySelectorAll("[data-ow-stack-row]");
  if (duoLine || stackRows.length) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: page.querySelector("[data-ow-duo]"), start: "top 78%", once: true },
    });
    if (duoLine) {
      gsap.set(duoLine, { scaleY: 0, transformOrigin: "top center" });
      tl.to(duoLine, { scaleY: 1, duration: 0.7, ease: "power2.out" });
    }
    if (stackRows.length) {
      gsap.set(stackRows, { opacity: 0, y: 20 });
      tl.to(stackRows, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", clearProps: "transform" }, 0.15);
    }
  }

  const pathFill = page.querySelector("[data-ow-path-fill]");
  const pathSteps = [...page.querySelectorAll("[data-ow-path-step]")];
  if (pathFill || pathSteps.length) {
    if (pathFill && typeof ScrollTrigger !== "undefined") {
      gsap.fromTo(
        pathFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: page.querySelector("[data-ow-path]"),
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.45,
          },
        }
      );
    }
    pathSteps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 70%",
        end: "bottom 45%",
        onEnter: () => {
          pathSteps.forEach((s, n) => {
            s.classList.toggle("is-active", n === i);
            s.classList.toggle("is-past", n < i);
          });
        },
        onEnterBack: () => {
          pathSteps.forEach((s, n) => {
            s.classList.toggle("is-active", n === i);
            s.classList.toggle("is-past", n < i);
          });
        },
      });
      gsap.fromTo(
        step,
        { opacity: 0.35, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: step, start: "top 82%", once: true },
        }
      );
    });
  }

  const sayLines = page.querySelectorAll("[data-ow-say-line]");
  if (sayLines.length) {
    gsap.fromTo(
      sayLines,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: page.querySelector("[data-ow-say]"), start: "top 84%", once: true },
      }
    );
  }

  const ownWords = page.querySelectorAll("[data-ow-own-word]");
  if (ownWords.length) {
    gsap.fromTo(
      ownWords,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector("[data-ow-own-mega]"), start: "top 80%", once: true },
      }
    );
  }

  const parallaxWord = page.querySelector("[data-ow-parallax]");
  if (parallaxWord && typeof ScrollTrigger !== "undefined") {
    gsap.to(parallaxWord, {
      y: 48,
      ease: "none",
      scrollTrigger: {
        trigger: parallaxWord.closest("[data-ow-section]"),
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  }

  window.setTimeout(() => {
    page
      .querySelectorAll(
        "[data-ow-reveal], [data-ow-spine-col], [data-ow-stack-row], [data-ow-path-step], [data-ow-say-line], [data-ow-flow-node]"
      )
      .forEach((el) => {
        if (window.getComputedStyle(el).opacity === "0") {
          gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, clearProps: "transform" });
        }
      });
  }, 10000);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
