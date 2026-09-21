/**
 * What We Do — ministry model as a scroll journey.
 * Hero markup is preserved exactly. Content/routes unchanged.
 */

import { formatPaTitle } from "../../utils/pa-title.js";

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

function renderProgrammeIndex(model = {}) {
  const steps = model.steps || [];
  if (!steps.length) return "";
  const items = [
    ...steps.map((s, i) => ({
      n: String(i + 1).padStart(2, "0"),
      title: s.title,
      href: s.href || `#work-${s.id}`,
    })),
    { n: String(steps.length + 1).padStart(2, "0"), title: "Local ownership", href: "#work-resources" },
  ]
    .map(
      (item) => `<a class="ow-index__item" ${linkAttrs(item.href)}>
        <span class="ow-index__n">${item.n}</span>
        <span class="ow-index__title">${item.title}</span>
        <span class="ow-index__go" aria-hidden="true">→</span>
      </a>`
    )
    .join("");

  return `
    <nav class="ow-index" aria-label="Programme sections" data-ow-reveal>
      <div class="container ow-index__inner">${items}</div>
    </nav>`;
}

/** Section 1 — How PA works (ivory). */
function renderHowPaWorks(section = {}, hierarchy = {}) {
  if (!section.title) return "";
  const cta = section.cta || {};
  const levels = (hierarchy.levels || [])
    .map(
      (l, i) => `<li class="ow-flow__node" style="--i:${i}" data-ow-flow-node>
        <span class="ow-flow__label">${l.label}</span>
        <span class="ow-flow__desc">${l.description || ""}</span>
      </li>`
    )
    .join("");
  const sidePoints = (section.sidePoints || []).map((p) => `<li data-ow-line>${p}</li>`).join("");

  return `
    <section class="ow-band ow-band--ivory" id="work-model" data-ow-section="model" aria-labelledby="ow-model-title">
      <span class="ow-band__bg-word" aria-hidden="true">How PA works</span>
      <div class="container ow-intro">
        <header class="ow-intro__head" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow">${section.eyebrow}</p>` : ""}
          <h2 id="ow-model-title" class="ow-sec-title pa-title">${formatPaTitle(section)}</h2>
          ${section.sideLead ? `<p class="ow-sec-lead">${section.sideLead}</p>` : ""}
          ${sidePoints ? `<ul class="ow-lines">${sidePoints}</ul>` : ""}
          ${cta.href ? `<a class="ow-text-link" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        ${
          levels
            ? `<ol class="ow-flow" data-ow-flow aria-label="How the work is organised">${levels}</ol>`
            : ""
        }
      </div>
    </section>`;
}

/** Section 2 — Community transformation (deep burgundy). */
function renderCommunity(step = {}, page = {}) {
  const title = step.title || "Community transformation";
  const text = step.text || "";
  const lead = page.model?.sideLead || "";
  const image = page.hero?.image || "assets/country-heroes/malawi-hero-savings.jpg";

  return `
    <section class="ow-band ow-band--burgundy" id="work-community" data-ow-section="community" aria-labelledby="ow-community-title">
      <div class="container ow-cinema">
        <div class="ow-cinema__copy" data-ow-reveal>
          <p class="ow-eyebrow ow-eyebrow--on-dark">${title}</p>
          <h2 id="ow-community-title" class="ow-sec-title ow-sec-title--light pa-title">${title}.</h2>
          ${text ? `<p class="ow-cinema__lead">${text}</p>` : ""}
          ${lead ? `<p class="ow-cinema__support">${lead}</p>` : ""}
          ${step.href ? `<a class="ow-text-link ow-text-link--light" ${linkAttrs(step.href)}>${title} →</a>` : ""}
        </div>
        <figure class="ow-cinema__media" data-ow-clip>
          <img src="${image}" alt="" loading="lazy" decoding="async">
        </figure>
      </div>
    </section>`;
}

/** Section 3 — Leadership (warm ochre). */
function renderLeadership(section = {}, tripleA = {}) {
  if (!section.title) return "";
  const dims = (tripleA.dimensions || [])
    .map(
      (d, i) => `<li class="ow-lead-flow__item" data-ow-spine-col style="--i:${i}">
        <span class="ow-lead-flow__letter" aria-hidden="true">${(d.label || "?").charAt(0)}</span>
        <div>
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
            ? `<ol class="ow-lead-flow" data-ow-spine aria-label="${tripleA.title || "Triple-A leadership"}">
                <span class="ow-lead-flow__rule" aria-hidden="true" data-ow-spine-rule></span>
                ${dims}
              </ol>`
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
            <span class="ow-organic__orb-core" data-ow-stat>
              <strong>${section.stat || "30–50"}</strong>
              <em>${section.statLabel || "leaders per group"}</em>
            </span>
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

/** Section 5 — PPP & CHIPs (deep burgundy). */
function renderProjects(section = {}) {
  if (!section.title) return "";
  const items = section.items || [];
  const ppp = items[0];
  const chips = items[1];
  const ownership = items[2];
  const cta = section.cta || {};

  return `
    <section class="ow-band ow-band--dark" id="work-projects" data-ow-section="projects" aria-labelledby="ow-projects-title">
      <div class="container">
        <header class="ow-sec-head ow-sec-head--wide" data-ow-reveal>
          ${section.eyebrow ? `<p class="ow-eyebrow ow-eyebrow--on-dark">${section.eyebrow}</p>` : ""}
          <h2 id="ow-projects-title" class="ow-sec-title ow-sec-title--light pa-title">${formatPaTitle(section)}</h2>
          ${section.lead ? `<p class="ow-sec-lead ow-sec-lead--light">${section.lead}</p>` : ""}
          ${cta.href ? `<a class="ow-text-link ow-text-link--light" ${linkAttrs(cta.href)}>${cta.label} →</a>` : ""}
        </header>
        <div class="ow-duo" data-ow-duo>
          ${
            ppp
              ? `<article class="ow-duo__block" data-ow-stack-row>
                  <span class="ow-duo__tag">PPP</span>
                  <h3>${ppp.title}</h3>
                  <p>${ppp.text || ""}</p>
                </article>`
              : ""
          }
          <div class="ow-duo__join" aria-hidden="true" data-ow-duo-line>
            <span class="ow-duo__dot"></span>
          </div>
          ${
            chips
              ? `<article class="ow-duo__block" data-ow-stack-row>
                  <span class="ow-duo__tag">CHIPs</span>
                  <h3>${chips.title}</h3>
                  <p>${chips.text || ""}</p>
                </article>`
              : ""
          }
        </div>
        ${
          ownership
            ? `<p class="ow-duo__note" data-ow-reveal><strong>${ownership.title}.</strong> ${ownership.text || ""}</p>`
            : ""
        }
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
  const communityStep = (page.model?.steps || []).find((s) => s.id === "community") || page.model?.steps?.[0] || {};

  return `
    <div class="ow-page" data-what-we-do data-work-section="overview" data-our-work-page>
      ${renderHero(page.hero)}
      ${renderProgrammeIndex(page.model)}
      ${renderHowPaWorks(page.model, ministryModel.hierarchy)}
      ${renderCommunity(communityStep, page)}
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
