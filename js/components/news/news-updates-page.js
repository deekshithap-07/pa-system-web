/**
 * News & Updates — stream of PA activity.
 * Sections: News · Country updates · Events · Announcements · Milestones
 * Layout: timeline / ribbon / pulse — not card grids.
 */

import { formatPaTitle } from "../../utils/pa-title.js";

const JUMP = [
  { id: "nu-news", label: "News" },
  { id: "nu-countries", label: "Country updates" },
  { id: "nu-events", label: "Events" },
  { id: "nu-announce", label: "Announcements" },
  { id: "nu-milestones", label: "Milestones" },
];

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function renderHero(hero = {}) {
  const image = hero.image || "assets/field-reports/hero.jpg";
  return `
    <header class="nu-hero" data-nu-section="hero">
      <div class="nu-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="nu-hero__veil"></span>
        <span class="nu-hero__grain"></span>
      </div>
      <div class="container nu-hero__layout">
        <div class="nu-hero__inner" data-nu-reveal>
          <p class="nu-eyebrow nu-eyebrow--on-dark">${hero.eyebrow || "News & Updates"}</p>
          <h1 class="pa-title nu-hero__title">${formatPaTitle(
            {
              titleHtml: hero.titleHtml || "<span>A current stream</span> <em>of PA activity.</em>",
              title: hero.title,
            },
            "A current stream of PA activity."
          )}</h1>
          <p class="nu-hero__lead">${
            hero.lead ||
            "News, country notes, events, announcements, and milestones across the network."
          }</p>
          <nav class="nu-hero__jump" aria-label="Update types">
            ${JUMP.map((j) => `<a href="#${j.id}">${j.label}</a>`).join("")}
          </nav>
        </div>
      </div>
    </header>`;
}

function renderRail() {
  return `
    <div class="nu-rail" data-nu-rail aria-label="Jump to section">
      <div class="container nu-rail__inner">
        ${JUMP.map(
          (j, i) =>
            `<a class="nu-rail__chip${i === 0 ? " is-active" : ""}" href="#${j.id}" data-nu-chip="${j.id}">${j.label}</a>`
        ).join("")}
      </div>
    </div>`;
}

function renderNews(items = []) {
  const rows = items.length
    ? items
        .map(
          (item, i) => `
      <a class="nu-stream__row" ${linkAttrs(item.href || "#/news")} data-nu-stagger-item style="--i:${i}">
        <time class="nu-stream__date" datetime="${item.date || ""}">${item.dateLabel || ""}</time>
        <span class="nu-stream__pulse" aria-hidden="true"></span>
        <span class="nu-stream__body">
          <strong>${item.title}</strong>
          ${item.summary ? `<span class="nu-stream__sum">${item.summary}</span>` : ""}
        </span>
        <span class="nu-stream__go" aria-hidden="true">→</span>
      </a>`
        )
        .join("")
    : `<p class="nu-empty">No news yet — check back soon.</p>`;

  return `
    <section class="nu-band nu-band--skin-maroon" id="nu-news" data-nu-section="news" aria-labelledby="nu-news-title">
      <div class="container">
        <header class="nu-band__head" data-nu-reveal>
          <p class="nu-eyebrow">News</p>
          <h2 id="nu-news-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>What just</span> <em>moved.</em>",
          })}</h2>
          <p class="nu-band__lead">A simple stream of recent PA activity — skim the spine, open what matters.</p>
        </header>
        <div class="nu-stream" data-nu-stagger>${rows}</div>
      </div>
    </section>`;
}

function renderCountryUpdates(items = []) {
  const chips = items
    .map(
      (item, i) => `
    <button type="button" class="nu-country__chip${i === 0 ? " is-active" : ""}" data-nu-country="${item.id}" style="--i:${i}">
      <span class="nu-country__dot" aria-hidden="true"></span>
      ${item.country}
    </button>`
    )
    .join("");

  const panels = items
    .map(
      (item, i) => `
    <div class="nu-country__panel${i === 0 ? " is-active" : ""}" data-nu-panel="${item.id}" ${i === 0 ? "" : "hidden"}>
      <p class="nu-country__when">${item.dateLabel || ""}</p>
      <p class="nu-country__title">${item.title}</p>
      <a class="nu-country__link" ${linkAttrs(item.href || `#/country/${item.slug}`)}>Open ${item.country} →</a>
    </div>`
    )
    .join("");

  return `
    <section class="nu-band nu-band--skin-green" id="nu-countries" data-nu-section="countries" aria-labelledby="nu-countries-title">
      <div class="container">
        <header class="nu-band__head" data-nu-reveal>
          <p class="nu-eyebrow">Country updates</p>
          <h2 id="nu-countries-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Notes from</span> <em>each place.</em>",
          })}</h2>
          <p class="nu-band__lead">Tap a country. One update at a time — no stacked cards.</p>
        </header>
        <div class="nu-country" data-nu-reveal>
          <div class="nu-country__chips" role="tablist" aria-label="Countries">${chips}</div>
          <div class="nu-country__stage" data-nu-stagger>${panels}</div>
        </div>
      </div>
    </section>`;
}

function renderEvents(items = []) {
  const ribbon = items.length
    ? items
        .map(
          (ev, i) => `
      <a class="nu-event" ${linkAttrs(ev.href || "#/news")} data-nu-stagger-item style="--i:${i}">
        <span class="nu-event__cal" aria-hidden="true">
          <span class="nu-event__month">${ev.month}</span>
          <span class="nu-event__day">${ev.day}</span>
          <span class="nu-event__year">${ev.year}</span>
        </span>
        <span class="nu-event__copy">
          <strong>${ev.title}</strong>
          <span class="nu-event__place">${ev.place || ""}</span>
          ${ev.summary ? `<span class="nu-event__sum">${ev.summary}</span>` : ""}
        </span>
      </a>`
        )
        .join("")
    : `<p class="nu-empty">No upcoming events listed yet.</p>`;

  return `
    <section class="nu-band nu-band--skin-gold" id="nu-events" data-nu-section="events" aria-labelledby="nu-events-title">
      <div class="container">
        <header class="nu-band__head" data-nu-reveal>
          <p class="nu-eyebrow">Events</p>
          <h2 id="nu-events-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Dates on the</span> <em>horizon.</em>",
          })}</h2>
          <p class="nu-band__lead">A sliding ribbon of gatherings and briefings — swipe or scroll sideways.</p>
        </header>
        <div class="nu-events-ribbon" data-nu-stagger tabindex="0">${ribbon}</div>
      </div>
    </section>`;
}

function renderAnnouncements(items = []) {
  const tapes = items.length
    ? items
        .map(
          (a, i) => `
      <a class="nu-tape nu-tape--${a.tone || "maroon"}" ${linkAttrs(a.href || "#/news")} data-nu-stagger-item style="--i:${i}">
        <span class="nu-tape__label">${a.label || "Note"}</span>
        <span class="nu-tape__title">${a.title}</span>
        <span class="nu-tape__go" aria-hidden="true">→</span>
      </a>`
        )
        .join("")
    : `<p class="nu-empty">No announcements right now.</p>`;

  return `
    <section class="nu-band nu-band--skin-maroon" id="nu-announce" data-nu-section="announce" aria-labelledby="nu-announce-title">
      <div class="container">
        <header class="nu-band__head" data-nu-reveal>
          <p class="nu-eyebrow">Announcements</p>
          <h2 id="nu-announce-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Short notes,</span> <em>front and centre.</em>",
          })}</h2>
          <p class="nu-band__lead">Banner-style notices — one line, one action.</p>
        </header>
        <div class="nu-tapes" data-nu-stagger>${tapes}</div>
      </div>
    </section>`;
}

function renderMilestones(items = []) {
  const nodes = items.length
    ? items
        .map(
          (m, i) => `
      <li class="nu-mile" data-nu-stagger-item style="--i:${i}">
        <span class="nu-mile__year">${m.year}</span>
        <span class="nu-mile__node" aria-hidden="true"></span>
        <span class="nu-mile__body">
          <strong>${m.title}</strong>
          ${m.summary ? `<span>${m.summary}</span>` : ""}
        </span>
      </li>`
        )
        .join("")
    : `<li class="nu-empty">Milestones will appear here.</li>`;

  return `
    <section class="nu-band nu-band--skin-green" id="nu-milestones" data-nu-section="milestones" aria-labelledby="nu-milestones-title">
      <div class="container">
        <header class="nu-band__head" data-nu-reveal>
          <p class="nu-eyebrow">Milestones</p>
          <h2 id="nu-milestones-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Markers on the</span> <em>journey.</em>",
          })}</h2>
          <p class="nu-band__lead">A pulse line through key moments — not a scorecard.</p>
        </header>
        <ol class="nu-miles" data-nu-stagger>${nodes}</ol>
      </div>
    </section>`;
}

export function renderNewsUpdatesPage(data) {
  const nu = data.newsUpdates || {};
  return `
    <div class="nu-page" data-news-page>
      ${renderHero(nu.hero)}
      ${renderRail()}
      ${renderNews(nu.news)}
      ${renderCountryUpdates(nu.countryUpdates)}
      ${renderEvents(nu.events)}
      ${renderAnnouncements(nu.announcements)}
      ${renderMilestones(nu.milestones)}
    </div>`;
}

let nuCleanup = null;

export function mountNewsUpdatesPage() {
  const page = document.querySelector("[data-news-page]");
  if (!page) return;

  destroyNewsUpdatesPage();
  const cleanups = [];

  cleanups.push(initCountrySwitcher(page));
  cleanups.push(initRailSpy(page));
  initNewsMotion(page);

  const hash = location.hash;
  const anchorMatch = hash.match(/#(nu-[a-z-]+)$/);
  if (anchorMatch) {
    requestAnimationFrame(() => {
      document.getElementById(anchorMatch[1])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  nuCleanup = () => cleanups.forEach((fn) => fn && fn());
}

export function destroyNewsUpdatesPage() {
  if (typeof nuCleanup === "function") {
    nuCleanup();
    nuCleanup = null;
  }
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-news-page]")) t.kill();
    });
  }
}

function initCountrySwitcher(page) {
  const root = page.querySelector(".nu-country");
  if (!root) return () => {};

  const onClick = (e) => {
    const btn = e.target.closest("[data-nu-country]");
    if (!btn || !root.contains(btn)) return;
    const id = btn.dataset.nuCountry;
    root.querySelectorAll("[data-nu-country]").forEach((b) => b.classList.toggle("is-active", b === btn));
    root.querySelectorAll("[data-nu-panel]").forEach((p) => {
      const on = p.dataset.nuPanel === id;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  };

  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

function initRailSpy(page) {
  const chips = [...page.querySelectorAll("[data-nu-chip]")];
  const sections = JUMP.map((j) => document.getElementById(j.id)).filter(Boolean);
  if (!chips.length || !sections.length) return () => {};

  const setActive = (id) => {
    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.nuChip === id));
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
  );

  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

function initNewsMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-nu-reveal], [data-nu-stagger-item]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const heroKids = page.querySelectorAll(".nu-hero__inner > *");
  if (heroKids.length) {
    gsap.fromTo(
      heroKids,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out", clearProps: "transform" }
    );
  }

  page.querySelectorAll("[data-nu-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        clearProps: "transform",
      }
    );
  });

  page.querySelectorAll("[data-nu-stagger]").forEach((group) => {
    const kids = group.querySelectorAll("[data-nu-stagger-item]");
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, x: -16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
        clearProps: "transform",
      }
    );
  });

  page.querySelectorAll(".nu-mile__node").forEach((node) => {
    gsap.fromTo(
      node,
      { scale: 0.4, backgroundColor: "rgba(63,154,74,0.2)" },
      {
        scale: 1,
        backgroundColor: "var(--pa-green)",
        duration: 0.5,
        ease: "back.out(2)",
        scrollTrigger: { trigger: node, start: "top 80%", once: true },
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
