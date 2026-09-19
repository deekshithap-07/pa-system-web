/**
 * About PA — editorial scroll story (Who we are → Contact).
 * Inspired interaction language; PA brand, content, and assets only.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { buildMapCountries } from "../../utils/data.js";
import { formatNumber } from "../../utils/format.js";
import { getPaCountries } from "../../utils/work-locations.js";

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

let aboutMotionMedia = null;

function fmtStat(value) {
  if (typeof value === "string") return value;
  if (typeof value !== "number") return "—";
  return value >= 1000 ? formatNumber(value) : String(value);
}

function renderNetworkMap(data, { pinLabels = true, className = "ab-map" } = {}) {
  const mapPaths = data.mapPaths || {};
  const viewBox = mapPaths.viewBox || "0 0 1000 1000";
  const centroids = mapPaths.centroids || {};
  const countries = buildMapCountries(data.countries, mapPaths);
  const paSlugs = new Set(getPaCountries(data).map((c) => c.slug));

  const paths = countries
    .map((c) => {
      const isPa = paSlugs.has(c.slug);
      return `<path class="${className}__land${isPa ? ` ${className}__land--pa` : ""}" d="${c.path}" data-map-country="${c.slug}"></path>`;
    })
    .join("");

  const pins = getPaCountries(data)
    .map((c) => {
      const pt = centroids[c.isoCode];
      if (!pt) return "";
      return `<a class="${className}__pin" href="#/country/${c.slug}" data-link data-ab-map-pin transform="translate(${pt[0]}, ${pt[1]})" aria-label="${c.name}">
        <circle class="${className}__pin-dot" r="5"></circle>
        ${pinLabels ? `<text class="${className}__pin-label" y="-11">${c.name}</text>` : ""}
      </a>`;
    })
    .join("");

  return `
    <div class="${className}" data-ab-network-map>
      <svg class="${className}__svg" viewBox="${viewBox}" role="img" aria-label="Map of Africa showing PA network countries">
        <rect class="${className}__ocean" width="1000" height="1000"></rect>
        <g class="${className}__countries">${paths}</g>
        <g class="${className}__pins">${pins}</g>
      </svg>
    </div>`;
}

function vision2030Stats(data, historySection = {}) {
  const sc = data.scorecard || {};
  const kpis = sc.kpis || [];
  const byId = Object.fromEntries(kpis.map((k) => [k.id, k]));
  const milestone = (historySection.milestones || []).find((m) =>
    /vision 2030/i.test(m.title || "")
  );

  return [
    {
      value: "20",
      label: "Countries",
      note: milestone?.text || "Strategic expansion across Africa.",
    },
    {
      value: fmtStat(byId.communities?.value),
      label: "Communities",
      note: "Pastor-led communities in the current network.",
    },
    {
      value: fmtStat(byId.households?.value),
      label: "Households",
      note: "Households reached through holistic ministry.",
    },
    {
      value: fmtStat(byId.lives?.value),
      label: "Lives impacted",
      note: "People touched through PA programmes.",
    },
  ].filter((s) => s.value && s.value !== "—");
}

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function highlightPhrases(text = "") {
  const phrases = [
    "Possibilities Africa",
    "local churches",
    "pastors",
    "rural communities",
    "seven countries",
    "whole gospel",
    "whole person",
    "whole community",
  ];
  let out = text;
  phrases.forEach((phrase) => {
    const re = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    out = out.replace(re, `<span class="ab-highlight">$1</span>`);
  });
  return out;
}

function renderHero(hero = {}) {
  const image = hero.image || "assets/home-overview/tab-about.jpg";
  return `
    <header class="ab-hero" data-ab-section="hero" aria-labelledby="ab-hero-title">
      <div class="ab-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="ab-hero__veil"></span>
      </div>
      <div class="container ab-hero__layout">
        <div class="ab-hero__inner" data-ab-reveal>
          <p class="ab-eyebrow ab-eyebrow--on-dark">${hero.eyebrow || "About PA"}</p>
          <h1 id="ab-hero-title" class="pa-title ab-hero__title">${formatPaTitle(hero, "Who we are.")}</h1>
          ${
            hero.lead
              ? `<p class="ab-hero__lead">${hero.lead}</p>`
              : ""
          }
        </div>
      </div>
    </header>`;
}

function renderWhoWeAre(section = {}) {
  const points = (section.points || [])
    .map((p) => `<li class="ab-statement__line" data-ab-statement-line>${highlightPhrases(p)}</li>`)
    .join("");
  const image = section.image || "";

  return `
    <section class="ab-statement" id="ab-who" data-ab-section="who" aria-labelledby="ab-who-title">
      <div class="container ab-statement__grid">
        <aside class="ab-statement__aside">
          <p class="ab-eyebrow">${section.eyebrow || "Who we are"}</p>
          <h2 id="ab-who-title" class="ab-statement__heading pa-title">${formatPaTitle(
            section,
            "Who we are."
          )}</h2>
        </aside>
        <div class="ab-statement__main">
          ${points ? `<ul class="ab-statement__lines">${points}</ul>` : ""}
          ${
            image
              ? `<figure class="ab-statement__figure" data-ab-clip-reveal>
                  <img src="${image}" alt="" loading="lazy">
                </figure>`
              : ""
          }
        </div>
      </div>
    </section>`;
}

function renderVisionMission(section = {}, data = {}, historySection = {}) {
  const vision = section.vision || {};
  const mission = section.mission || {};
  const milestone = (historySection.milestones || []).find((m) =>
    /vision 2030/i.test(m.title || "")
  );
  const stats = vision2030Stats(data, historySection);

  const statRows = stats
    .map(
      (s) => `<div class="ab-vm2030__stat" data-ab-reveal>
        <strong class="ab-vm2030__stat-value">${s.value}</strong>
        <span class="ab-vm2030__stat-label">${s.label}</span>
        <p class="ab-vm2030__stat-note">${s.note}</p>
      </div>`
    )
    .join("");

  return `
    <section class="ab-vm" id="ab-vision" data-ab-section="vision" aria-labelledby="ab-vision-title">
      <div class="container">
        <header class="ab-vm__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Vision and mission"}</p>
          <h2 id="ab-vision-title" class="ab-vm__title pa-title">${formatPaTitle(
            section,
            "Vision and mission."
          )}</h2>
        </header>

        <div class="ab-vm__layout">
          <article class="ab-vm2030" data-ab-reveal>
            <h3 class="ab-vm2030__title">${milestone?.title || "Vision 2030"}</h3>
            <div class="ab-vm2030__body">
              ${renderNetworkMap(data, { pinLabels: false, className: "ab-vm2030-map" })}
              <div class="ab-vm2030__stats">${statRows}</div>
            </div>
          </article>

          <div class="ab-vm__cards">
            <article class="ab-vm-card ab-vm-card--vision" data-ab-reveal>
              <span class="ab-vm-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="1.5"/></svg>
              </span>
              <p class="ab-vm-card__label">${vision.label || "Our Vision"}</p>
              <p class="ab-vm-card__text">${vision.text || ""}</p>
            </article>
            <article class="ab-vm-card ab-vm-card--mission" data-ab-reveal>
              <span class="ab-vm-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
              </span>
              <p class="ab-vm-card__label">${mission.label || "Our Mission"}</p>
              <p class="ab-vm-card__text">${mission.text || ""}</p>
            </article>
          </div>
        </div>
      </div>
    </section>`;
}

function renderApproach(section = {}) {
  const items = section.items || [];
  const chapters = items
    .map(
      (item, i) => `<article class="ab-chapter" data-ab-chapter="${i}">
        <span class="ab-chapter__n">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="ab-chapter__title">${item.title}</h3>
        <p class="ab-chapter__text">${item.text}</p>
      </article>`
    )
    .join("");
  const cta = section.cta || {};

  return `
    <section class="ab-chapters" id="ab-approach" data-ab-section="approach" aria-labelledby="ab-approach-title">
      <div class="container ab-chapters__wrap">
        <aside class="ab-chapters__aside" data-ab-sticky-aside>
          <p class="ab-eyebrow">${section.eyebrow || "Our approach"}</p>
          <h2 id="ab-approach-title" class="ab-chapters__title pa-title">${formatPaTitle(
            section,
            "Our approach."
          )}</h2>
          ${section.lead ? `<p class="ab-chapters__lead">${section.lead}</p>` : ""}
          <div class="ab-chapters__progress" aria-hidden="true">
            <span class="ab-chapters__progress-track"></span>
            <span class="ab-chapters__progress-fill" data-ab-progress-fill></span>
          </div>
          ${
            cta.href
              ? `<a class="ab-text-link ab-chapters__cta" ${linkAttrs(cta.href)}>${cta.label || "Learn more"} →</a>`
              : ""
          }
        </aside>
        <div class="ab-chapters__track" data-ab-chapter-track>
          ${chapters}
        </div>
      </div>
    </section>`;
}

function renderLeadership(section = {}) {
  const people = section.people || [];
  const featured = people[0];
  const rest = people.slice(1);

  const personCard = (p, featured = false) => `<article class="ab-leader${featured ? " ab-leader--featured" : ""}" data-ab-leader>
      <div class="ab-leader__media">
        ${
          p.image
            ? `<img src="${p.image}" alt="" loading="lazy">`
            : `<span class="ab-leader__ph" aria-hidden="true"></span>`
        }
      </div>
      <div class="ab-leader__copy">
        <strong class="ab-leader__name">${p.name || ""}</strong>
        <span class="ab-leader__role">${p.role || ""}</span>
        ${p.bio ? `<p class="ab-leader__bio">${p.bio}</p>` : ""}
      </div>
    </article>`;

  const stage = people.length
    ? `<div class="ab-leaders__stage">
        ${featured ? personCard(featured, true) : ""}
        ${
          rest.length
            ? `<div class="ab-leaders__list">${rest.map((p) => personCard(p)).join("")}</div>`
            : ""
        }
      </div>`
    : `<div class="ab-leaders__placeholder" data-ab-reveal>
        <p class="ab-leaders__placeholder-lead">${section.lead || "Leadership profiles will appear here soon."}</p>
      </div>`;

  return `
    <section class="ab-leaders" id="ab-leadership" data-ab-section="leadership" aria-labelledby="ab-leadership-title">
      <div class="container ab-leaders__grid">
        <header class="ab-leaders__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Leadership"}</p>
          <h2 id="ab-leadership-title" class="ab-leaders__title pa-title">${formatPaTitle(
            section,
            "Leadership."
          )}</h2>
          ${people.length && section.lead ? `<p class="ab-leaders__lead">${section.lead}</p>` : ""}
        </header>
        ${stage}
      </div>
    </section>`;
}

function renderHistory(section = {}) {
  const steps = (section.milestones || [])
    .map(
      (m) => `<li class="ab-milestone" data-ab-milestone>
        <div class="ab-milestone__year-col">
          <span class="ab-milestone__phase">Phase ${m.phase || ""}</span>
          <span class="ab-milestone__year">${m.year || ""}</span>
        </div>
        <span class="ab-milestone__dot" aria-hidden="true"></span>
        <div class="ab-milestone__body">
          <strong class="ab-milestone__title">${m.title || ""}</strong>
          ${m.text ? `<p class="ab-milestone__text">${m.text}</p>` : ""}
        </div>
      </li>`
    )
    .join("");

  return `
    <section class="ab-journey" id="ab-history" data-ab-section="history" aria-labelledby="ab-history-title">
      <div class="container">
        <header class="ab-journey__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "History"}</p>
          <h2 id="ab-history-title" class="ab-journey__title pa-title">${formatPaTitle(section, "History.")}</h2>
          ${section.lead ? `<p class="ab-journey__lead">${section.lead}</p>` : ""}
        </header>
        ${section.roots ? `<p class="ab-journey__roots" data-ab-reveal>${section.roots}</p>` : ""}
        ${
          steps
            ? `<div class="ab-journey__track" data-ab-timeline>
                <div class="ab-journey__line" aria-hidden="true">
                  <span class="ab-journey__line-fill" data-ab-timeline-fill></span>
                </div>
                <ol class="ab-journey__list">${steps}</ol>
              </div>`
            : ""
        }
      </div>
    </section>`;
}

function renderCountries(data, section = {}) {
  const countries = getPaCountries(data);
  const list = countries
    .map(
      (c) => `<a class="ab-regions__list-item" href="#/country/${c.slug}" data-link data-ab-region-node>
        <span class="ab-regions__list-name">${c.name}</span>
        ${c.status ? `<span class="ab-regions__list-status">${c.status}</span>` : ""}
      </a>`
    )
    .join("");

  const lead =
    section.lead ||
    "We work as one ministry with churches, partners, and communities across seven countries.";

  return `
    <section class="ab-regions" id="ab-countries" data-ab-section="countries" aria-labelledby="ab-countries-title">
      <div class="container">
        <header class="ab-regions__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Countries"}</p>
          <h2 id="ab-countries-title" class="ab-regions__title pa-title">${formatPaTitle(
            section,
            "Seven countries on the network."
          )}</h2>
          <p class="ab-regions__lead">${lead}</p>
        </header>
        <div class="ab-regions__layout" data-ab-regions-canvas>
          ${renderNetworkMap(data, { pinLabels: true, className: "ab-regions-map" })}
          <aside class="ab-regions__aside" data-ab-reveal>
            <p class="ab-regions__count"><strong>${countries.length}</strong> network countries</p>
            <div class="ab-regions__list">${list}</div>
            <a class="ab-text-link ab-regions__all" href="#/africa" data-link>View all countries →</a>
          </aside>
        </div>
      </div>
    </section>`;
}

function renderPartners(section = {}) {
  const items = section.items || [];
  const logos = items
    .map(
      (p) => `<article class="ab-ally" data-ab-ally>
        ${
          p.logo
            ? `<img src="${p.logo}" alt="${p.name || "Partner"}" loading="lazy">`
            : `<strong class="ab-ally__name">${p.name || ""}</strong>`
        }
        ${p.note ? `<p class="ab-ally__note">${p.note}</p>` : ""}
      </article>`
    )
    .join("");

  return `
    <section class="ab-allies" id="ab-partners" data-ab-section="partners" aria-labelledby="ab-partners-title">
      <div class="container">
        <header class="ab-allies__head" data-ab-reveal>
          <p class="ab-eyebrow">${section.eyebrow || "Partners"}</p>
          <h2 id="ab-partners-title" class="ab-allies__title pa-title">${formatPaTitle(section, "Partners.")}</h2>
          ${section.lead ? `<p class="ab-allies__lead">${section.lead}</p>` : ""}
        </header>
        ${
          logos
            ? `<div class="ab-allies__grid" data-ab-allies-grid>${logos}</div>`
            : `<div class="ab-allies__placeholder" data-ab-reveal><p>${section.lead || "Partner names and logos will appear here soon."}</p></div>`
        }
      </div>
    </section>`;
}

function renderContact(section = {}) {
  const details = [
    section.email
      ? `<p class="ab-closer__item"><span class="ab-closer__item-label">Email</span><a href="mailto:${section.email}">${section.email}</a></p>`
      : "",
    section.phone
      ? `<p class="ab-closer__item"><span class="ab-closer__item-label">Phone</span><a href="tel:${section.phone.replace(/\s/g, "")}">${section.phone}</a></p>`
      : "",
    section.address
      ? `<p class="ab-closer__item"><span class="ab-closer__item-label">Address</span><span>${section.address}</span></p>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <section class="ab-closer" id="ab-contact" data-ab-section="contact" aria-labelledby="ab-contact-title">
      <div class="container ab-closer__inner">
        <div class="ab-closer__copy" data-ab-closer-copy>
          <p class="ab-eyebrow ab-eyebrow--on-dark">${section.eyebrow || "Contact"}</p>
          <h2 id="ab-contact-title" class="ab-closer__title pa-title">${formatPaTitle(section, "Get in touch.")}</h2>
          ${section.lead ? `<p class="ab-closer__lead">${section.lead}</p>` : ""}
        </div>
        <div class="ab-closer__panel" data-ab-closer-panel>
          ${details || `<p class="ab-closer__note">Contact details will be listed here soon.</p>`}
          <a class="ab-btn ab-btn--solid" href="mailto:${section.email || "karibu@possibilitiesafrica.org"}">Let's connect →</a>
        </div>
      </div>
    </section>`;
}

export function renderWhoWeArePage(data, section = "overview") {
  const page = data.aboutPa;
  if (!page) {
    return `<div class="container static-page"><h1>Who we are is unavailable</h1></div>`;
  }

  const scrollTarget = SECTION_BY_ROUTE[section] || "";

  return `
    <div class="ab-page" data-who-we-are data-scroll-target="${scrollTarget}">
      ${renderHero(page.hero)}
      ${renderWhoWeAre(page.whoWeAre)}
      ${renderVisionMission(page.visionMission, data, page.history)}
      ${renderApproach(page.approach)}
      ${renderLeadership(page.leadership)}
      ${renderHistory(page.history)}
      ${renderCountries(data, page.countries)}
      ${renderPartners(page.partners)}
      ${renderContact(page.contact)}
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
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    page.classList.add("ab-page--reduced");
    return;
  }

  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  initHeroReveal(page);
  initRevealBlocks(page);
  initStatementProgress(page);
  initApproachChapters(page);
  initTimeline(page);
  initRegionNodes(page);
  initAllies(page);
  initCloser(page);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

function initHeroReveal(page) {
  const kids = page.querySelectorAll(".ab-hero__inner > *");
  if (!kids.length) return;

  gsap.fromTo(
    kids,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", clearProps: "transform" }
  );
}

function initRevealBlocks(page) {
  page.querySelectorAll("[data-ab-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-ab-clip-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(100% 0 0 0)", autoAlpha: 0.6 },
      {
        clipPath: "inset(0% 0 0 0)",
        autoAlpha: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      }
    );
  });
}

function initStatementProgress(page) {
  const lines = page.querySelectorAll("[data-ab-statement-line]");

  lines.forEach((line, i) => {
    gsap.fromTo(
      line,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: line, start: "top 90%", once: true },
      }
    );
  });
}

function initApproachChapters(page) {
  const section = page.querySelector(".ab-chapters");
  if (!section || typeof ScrollTrigger === "undefined") return;

  const chapters = [...section.querySelectorAll("[data-ab-chapter]")];
  const fill = section.querySelector("[data-ab-progress-fill]");
  const aside = section.querySelector("[data-ab-sticky-aside]");
  const track = section.querySelector("[data-ab-chapter-track]");
  if (!chapters.length) return;

  const setActive = (index) => {
    chapters.forEach((ch, i) => {
      ch.classList.toggle("is-active", i === index);
      ch.classList.toggle("is-past", i < index);
    });
    if (fill) {
      const pct = chapters.length <= 1 ? 100 : (index / (chapters.length - 1)) * 100;
      fill.style.height = `${pct}%`;
    }
  };

  chapters.forEach((chapter, i) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: "top 55%",
      end: "bottom 45%",
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });

  setActive(0);

  aboutMotionMedia = gsap.matchMedia();
  aboutMotionMedia.add("(min-width: 901px)", () => {
    if (!aside || !track) return;
    return ScrollTrigger.create({
      trigger: section,
      start: "top top+=80",
      end: () => `+=${track.offsetHeight - aside.offsetHeight}`,
      pin: aside,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  });
}

function initTimeline(page) {
  const track = page.querySelector("[data-ab-timeline]");
  if (!track || typeof ScrollTrigger === "undefined") return;

  const fill = track.querySelector("[data-ab-timeline-fill]");
  const milestones = [...track.querySelectorAll("[data-ab-milestone]")];

  if (fill) {
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: track,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.4,
        },
      }
    );
  }

  milestones.forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 78%",
      once: true,
      onEnter: () => item.classList.add("is-active"),
    });

    gsap.fromTo(
      item,
      { autoAlpha: 0, x: 16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 82%", once: true },
      }
    );
  });
}

function initRegionNodes(page) {
  const pins = page.querySelectorAll("[data-ab-map-pin]");
  const listItems = page.querySelectorAll("[data-ab-region-node]");
  const trigger = page.querySelector("[data-ab-regions-canvas]") || pins[0] || listItems[0];
  if (!trigger) return;

  if (pins.length) {
    gsap.fromTo(
      pins,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger, start: "top 80%", once: true },
      }
    );
  }

  if (listItems.length) {
    gsap.fromTo(
      listItems,
      { autoAlpha: 0, x: 12 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger, start: "top 82%", once: true },
      }
    );
  }
}

function initAllies(page) {
  const grid = page.querySelector("[data-ab-allies-grid]");
  if (!grid) return;

  const items = [...grid.children];
  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: "power2.out",
      scrollTrigger: { trigger: grid, start: "top 85%", once: true },
    }
  );
}

function initCloser(page) {
  const section = page.querySelector(".ab-closer");
  if (!section) return;

  const copy = section.querySelector("[data-ab-closer-copy]");
  const panel = section.querySelector("[data-ab-closer-panel]");

  if (copy) {
    gsap.fromTo(
      copy,
      { autoAlpha: 0, y: 48 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      }
    );
  }

  if (panel) {
    gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      }
    );
  }
}

export function destroyWhoWeArePage() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-who-we-are]")) t.kill();
    });
  }
  if (aboutMotionMedia) {
    aboutMotionMedia.revert();
    aboutMotionMedia = null;
  }
}
