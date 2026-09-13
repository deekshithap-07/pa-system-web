/**
 * Who we are / About PA — institutional foundation page.
 * Sections: Who we are → Vision & mission → Approach → Leadership → History → Countries → Partners → Contact
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getPaCountries } from "../../utils/work-locations.js";

const SKINS = ["gold", "green", "maroon"];

const SECTION_BY_ROUTE = {
  overview: "ab-who",
  who: "ab-who",
  vision: "ab-vision",
  mission: "ab-vision",
  approach: "ab-approach",
  leadership: "ab-leadership",
  history: "ab-history",
  countries: "ab-countries",
  partners: "ab-partners",
  contact: "ab-contact",
};

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function renderHero(hero = {}) {
  const image = hero.image || "assets/home-overview/tab-about.jpg";
  return `
    <header class="ab-hero" data-ab-section="hero">
      <div class="ab-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="ab-hero__veil"></span>
      </div>
      <div class="container ab-hero__layout">
        <div class="ab-hero__inner" data-ab-reveal>
          <p class="ab-eyebrow ab-eyebrow--on-dark">${hero.eyebrow || "About PA"}</p>
          <h1 class="pa-title ab-hero__title">${formatPaTitle(hero, "Who we are.")}</h1>
          <p class="ab-hero__lead">${
            hero.lead ||
            "The institutional foundation of Possibilities Africa — vision, approach, leadership, and how to reach us."
          }</p>
          <nav class="ab-hero__jump" aria-label="About sections">
            <a href="#ab-who">Who we are</a>
            <a href="#ab-vision">Vision &amp; mission</a>
            <a href="#ab-approach">Our approach</a>
            <a href="#ab-leadership">Leadership</a>
            <a href="#ab-history">History</a>
            <a href="#ab-countries">Countries</a>
            <a href="#ab-partners">Partners</a>
            <a href="#ab-contact">Contact</a>
          </nav>
        </div>
      </div>
    </header>`;
}

function renderWhoWeAre(section = {}, skin = "gold") {
  const points = (section.points || [])
    .map((p) => `<li data-ab-stagger-item>${p}</li>`)
    .join("");

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-who" data-ab-section="who" aria-labelledby="ab-who-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Who we are"}</p>
          <h2 id="ab-who-title" class="pa-title">${formatPaTitle(section, "Who we are.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${points ? `<ul class="ab-points" data-ab-stagger>${points}</ul>` : ""}
      </div>
    </section>`;
}

function renderVisionMission(section = {}, skin = "green") {
  const vision = section.vision || {};
  const mission = section.mission || {};

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-vision" data-ab-section="vision" aria-labelledby="ab-vision-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Vision and mission"}</p>
          <h2 id="ab-vision-title" class="pa-title">${formatPaTitle(
            section,
            "Vision and mission."
          )}</h2>
        </header>
        <div class="ab-vm-grid" data-ab-stagger>
          <article class="ab-vm" data-ab-stagger-item>
            <p class="ab-vm__label">${vision.label || "Vision"}</p>
            <p class="ab-vm__text">${vision.text || ""}</p>
          </article>
          <article class="ab-vm" data-ab-stagger-item>
            <p class="ab-vm__label">${mission.label || "Mission"}</p>
            <p class="ab-vm__text">${mission.text || ""}</p>
          </article>
        </div>
      </div>
    </section>`;
}

function renderApproach(section = {}, skin = "maroon") {
  const items = (section.items || [])
    .map(
      (item, i) => `<article class="ab-approach" data-ab-stagger-item>
        <span class="ab-approach__n">${String(i + 1).padStart(2, "0")}</span>
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </article>`
    )
    .join("");

  const cta = section.cta || {};

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-approach" data-ab-section="approach" aria-labelledby="ab-approach-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Our approach"}</p>
          <h2 id="ab-approach-title" class="pa-title">${formatPaTitle(section, "Our approach.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${items ? `<div class="ab-approach-grid" data-ab-stagger>${items}</div>` : ""}
        ${
          cta.href
            ? `<a class="ab-text-link" ${linkAttrs(cta.href)}>${cta.label || "Learn more"} →</a>`
            : ""
        }
      </div>
    </section>`;
}

function renderLeadership(section = {}, skin = "gold") {
  const people = section.people || [];
  const cards = people
    .map(
      (p) => `<article class="ab-person" data-ab-stagger-item>
        <div class="ab-person__media">
          ${p.image ? `<img src="${p.image}" alt="" loading="lazy">` : `<span class="ab-person__ph" aria-hidden="true"></span>`}
        </div>
        <strong>${p.name || ""}</strong>
        <span>${p.role || ""}</span>
        ${p.bio ? `<p>${p.bio}</p>` : ""}
      </article>`
    )
    .join("");

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-leadership" data-ab-section="leadership" aria-labelledby="ab-leadership-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Leadership"}</p>
          <h2 id="ab-leadership-title" class="pa-title">${formatPaTitle(section, "Leadership.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${
          cards
            ? `<div class="ab-people-grid" data-ab-stagger>${cards}</div>`
            : `<div class="ab-blank" data-ab-reveal><p>Leadership profiles will appear here soon.</p></div>`
        }
      </div>
    </section>`;
}

function renderHistory(section = {}, skin = "green") {
  const steps = (section.milestones || [])
    .map(
      (m) => `<li data-ab-stagger-item>
        <span>${m.year}</span>
        <em>${m.text}</em>
      </li>`
    )
    .join("");

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-history" data-ab-section="history" aria-labelledby="ab-history-title">
      <div class="container ab-history-layout">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "History"}</p>
          <h2 id="ab-history-title" class="pa-title">${formatPaTitle(section, "History.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${steps ? `<ol class="ab-timeline" data-ab-stagger>${steps}</ol>` : ""}
      </div>
    </section>`;
}

function renderCountries(section = {}, countries = [], skin = "maroon") {
  const cards = countries
    .map(
      (c) => `<a class="ab-country" ${linkAttrs(`#/country/${c.slug}`)} data-ab-stagger-item>
        <strong>${c.name}</strong>
        <span>Open country →</span>
      </a>`
    )
    .join("");

  const cta = section.cta || {};

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-countries" data-ab-section="countries" aria-labelledby="ab-countries-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Countries"}</p>
          <h2 id="ab-countries-title" class="pa-title">${formatPaTitle(section, "Countries.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${cards ? `<div class="ab-country-grid" data-ab-stagger>${cards}</div>` : ""}
        ${
          cta.href
            ? `<a class="ab-text-link" ${linkAttrs(cta.href)}>${cta.label || "Where we work"} →</a>`
            : ""
        }
      </div>
    </section>`;
}

function renderPartners(section = {}, skin = "gold") {
  const items = section.items || [];
  const cards = items
    .map(
      (p) => `<article class="ab-partner" data-ab-stagger-item>
        ${p.logo ? `<img src="${p.logo}" alt="${p.name || ""}" loading="lazy">` : `<strong>${p.name || ""}</strong>`}
        ${p.note ? `<p>${p.note}</p>` : ""}
      </article>`
    )
    .join("");

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-partners" data-ab-section="partners" aria-labelledby="ab-partners-title">
      <div class="container">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Partners"}</p>
          <h2 id="ab-partners-title" class="pa-title">${formatPaTitle(section, "Partners.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        ${
          cards
            ? `<div class="ab-partner-grid" data-ab-stagger>${cards}</div>`
            : `<div class="ab-blank" data-ab-reveal><p>Partner names and logos will appear here soon.</p></div>`
        }
      </div>
    </section>`;
}

function renderContact(section = {}, skin = "green") {
  const cta = section.cta || {};
  const details = [
    section.email ? `<p><strong>Email</strong> <a href="mailto:${section.email}">${section.email}</a></p>` : "",
    section.phone ? `<p><strong>Phone</strong> <a href="tel:${section.phone.replace(/\s/g, "")}">${section.phone}</a></p>` : "",
    section.address ? `<p><strong>Address</strong> ${section.address}</p>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <section class="ab-band ab-band--skin-${skin}" id="ab-contact" data-ab-section="contact" aria-labelledby="ab-contact-title">
      <div class="container ab-contact-layout">
        <header class="ab-band__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Contact"}</p>
          <h2 id="ab-contact-title" class="pa-title">${formatPaTitle(section, "Contact.")}</h2>
          ${section.lead ? `<p class="ab-band__lead">${section.lead}</p>` : ""}
        </header>
        <div class="ab-contact-panel" data-ab-reveal>
          ${
            details ||
            `<p class="ab-contact-panel__note">Contact details will be listed here. Until then, use the main ministry website.</p>`
          }
          ${
            cta.href
              ? `<a class="ab-btn ab-btn--solid" ${linkAttrs(cta.href)}>${cta.label || "Get in touch"} →</a>`
              : ""
          }
        </div>
      </div>
    </section>`;
}

export function renderWhoWeArePage(data, section = "overview") {
  const page = data.aboutPa;
  if (!page) {
    return `<div class="container static-page"><h1>Who we are is unavailable</h1></div>`;
  }

  const countries = getPaCountries(data);
  const scrollTarget = SECTION_BY_ROUTE[section] || "";

  return `
    <div class="ab-page" data-who-we-are data-scroll-target="${scrollTarget}">
      ${renderHero(page.hero)}
      ${renderWhoWeAre(page.whoWeAre, SKINS[0])}
      ${renderVisionMission(page.visionMission, SKINS[1])}
      ${renderApproach(page.approach, SKINS[2])}
      ${renderLeadership(page.leadership, SKINS[0])}
      ${renderHistory(page.history, SKINS[1])}
      ${renderCountries(page.countries, countries, SKINS[2])}
      ${renderPartners(page.partners, SKINS[0])}
      ${renderContact(page.contact, SKINS[1])}
    </div>`;
}

export function mountWhoWeArePage(section = "overview") {
  const page = document.querySelector("[data-who-we-are]");
  if (!page) return;

  initAboutMotion(page);

  const targetId = page.dataset.scrollTarget || SECTION_BY_ROUTE[section];
  if (targetId && section !== "overview") {
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function initAboutMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-ab-reveal], [data-ab-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroKids = page.querySelectorAll(".ab-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", clearProps: "transform" }
    );
  }

  page.querySelectorAll("[data-ab-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-ab-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyWhoWeArePage() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-who-we-are]")) t.kill();
    });
  }
}
