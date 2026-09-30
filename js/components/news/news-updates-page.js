/**
 * News & Updates — living editorial stream of PA activity.
 * Content/data/routes preserved; presentation only.
 * Sections: News · Country updates · Events · Announcements · Milestones
 */

import { formatPaTitle } from "../../utils/pa-title.js";

const JUMP = [
  { id: "nu-news", label: "News" },
  { id: "nu-countries", label: "Country updates" },
  { id: "nu-events", label: "Events" },
  { id: "nu-announce", label: "Announcements" },
  { id: "nu-milestones", label: "Milestones" },
];

function sampleTag(item = {}) {
  return item.verified === true
    ? ""
    : `<span class="pa-sample-tag" title="Sample entry — awaiting PA verification">Sample</span>`;
}

function linkAttrs(href = "#") {
  if (!href) return `href="#"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  if (href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  return `href="${href}"`;
}

function parseDateParts(item = {}) {
  const label = item.dateLabel || "";
  const iso = item.date || "";
  let year = "";
  let day = "";
  let month = "";

  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(`${iso}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      year = String(d.getFullYear());
      day = String(d.getDate());
      month = d.toLocaleString("en-GB", { month: "short" });
    }
  }

  if (!year && label) {
    const yMatch = label.match(/\b(20\d{2})\b/);
    if (yMatch) year = yMatch[1];
  }

  return { year, day, month, label };
}

function renderHero(hero = {}, counts = {}) {
  const image = hero.image || "assets/news/hero.jpg";
  const jumps = JUMP.filter((j) => counts[j.id])
    .map(
      (j) => `<a class="nu-hero__jump" href="#${j.id}"><span>${j.label}</span><em>${counts[j.id]}</em></a>`
    )
    .join("");
  return `
    <header class="nu-hero" data-nu-section="hero">
      <div class="nu-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high" data-nu-hero-img>
        <span class="nu-hero__veil"></span>
        <span class="nu-hero__grain"></span>
      </div>
      <span class="nu-hero__watermark" aria-hidden="true">Now</span>
      <div class="container nu-hero__layout">
        <div class="nu-hero__inner">
          <p class="nu-eyebrow nu-eyebrow--on-dark" data-nu-hero-line>${hero.eyebrow || "News & Updates"}</p>
          <h1 class="pa-title nu-hero__title" data-nu-hero-line>${formatPaTitle(
            {
              titleHtml: hero.titleHtml || "<span>A current stream</span> <em>of PA activity.</em>",
              title: hero.title,
            },
            "A current stream of PA activity."
          )}</h1>
          <p class="nu-hero__lead" data-nu-hero-line>${
            hero.lead ||
            "News, country notes, events, announcements, and milestones across the network."
          }</p>
          ${jumps ? `<nav class="nu-hero__jumps" aria-label="Jump to a section" data-nu-hero-line>${jumps}</nav>` : ""}
        </div>
      </div>
    </header>`;
}

function renderNav() {
  return `
    <nav class="nu-nav" data-nu-rail aria-label="Update categories">
      <div class="container nu-nav__inner">
        <p class="nu-nav__label">Explore</p>
        <div class="nu-nav__index" role="tablist" aria-label="News categories">
          ${JUMP.map(
            (j, i) =>
              `<a class="nu-nav__item${i === 0 ? " is-active" : ""}" href="#${j.id}" data-nu-chip="${j.id}" style="--i:${i}">
                <span class="nu-nav__n">${String(i + 1).padStart(2, "0")}</span>
                <span class="nu-nav__text">${j.label}</span>
              </a>`
          ).join("")}
        </div>
      </div>
    </nav>`;
}

function renderNews(items = []) {
  const rows = items.length
    ? items
        .map((item, i) => {
          const parts = parseDateParts(item);
          const flip = `${i % 2 === 1 ? " nu-entry--flip" : ""} nu-entry--t${i % 3}`;
          return `
      <a class="nu-entry${flip}" ${linkAttrs(item.href || "#/news")} data-nu-stagger-item data-nu-entry style="--i:${i}">
        <span class="nu-entry__date" aria-hidden="true">
          ${parts.year ? `<span class="nu-entry__year">${parts.year}</span>` : ""}
          <time datetime="${item.date || ""}">${parts.label || item.dateLabel || ""}</time>
        </span>
        <span class="nu-entry__spine" aria-hidden="true">
          <span class="nu-entry__mark"></span>
        </span>
        <span class="nu-entry__body">
          <span class="nu-entry__cat">News ${sampleTag(item)}</span>
          <strong class="nu-entry__title">${item.title}</strong>
          ${item.summary ? `<span class="nu-entry__sum">${item.summary}</span>` : ""}
        </span>
        <span class="nu-entry__go" aria-hidden="true">→</span>
      </a>`;
        })
        .join("")
    : `<p class="nu-empty">No news yet — check back soon.</p>`;

  return `
    <section class="nu-band nu-band--stream" id="nu-news" data-nu-section="news" aria-labelledby="nu-news-title">
      <div class="container">
        <p class="pa-sample-note" role="note">Entries tagged <span class="pa-sample-tag">Sample</span> show how updates will appear. They are placeholders awaiting confirmation from PA and will be replaced with verified news.</p>
        <header class="nu-sec-head" data-nu-reveal>
          <p class="nu-eyebrow">News</p>
          <h2 id="nu-news-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>What just</span> <em>moved.</em>",
          })}</h2>
          <p class="nu-sec-lead">A simple stream of recent PA activity — skim the spine, open what matters.</p>
        </header>
        <div class="nu-stream" data-nu-stagger>${rows}</div>
      </div>
    </section>`;
}

function renderCountryUpdates(items = []) {
  const chips = items
    .map(
      (item, i) => `
    <button type="button" class="nu-geo__chip${i === 0 ? " is-active" : ""}" data-nu-country="${item.id}" role="tab" aria-selected="${
      i === 0 ? "true" : "false"
    }" aria-controls="nu-panel-${item.id}" id="nu-tab-${item.id}" style="--i:${i}">
      <span class="nu-geo__pin" aria-hidden="true"></span>
      ${item.country}
    </button>`
    )
    .join("");

  const panels = items
    .map(
      (item, i) => `
    <article class="nu-geo__panel${i === 0 ? " is-active" : ""}" data-nu-panel="${item.id}" id="nu-panel-${item.id}" role="tabpanel" aria-labelledby="nu-tab-${item.id}" ${
      i === 0 ? "" : "hidden"
    }>
      <p class="nu-geo__place">${item.country}</p>
      <p class="nu-geo__when">${item.dateLabel || ""} ${sampleTag(item)}</p>
      <h3 class="nu-geo__title">${item.title}</h3>
      <a class="nu-geo__link" ${linkAttrs(item.href || `#/country/${item.slug}`)}>Open ${item.country} <span aria-hidden="true">→</span></a>
    </article>`
    )
    .join("");

  return `
    <section class="nu-band nu-band--geo" id="nu-countries" data-nu-section="countries" aria-labelledby="nu-countries-title">
      <div class="container">
        <header class="nu-sec-head" data-nu-reveal>
          <p class="nu-eyebrow">Country updates</p>
          <h2 id="nu-countries-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Notes from</span> <em>each place.</em>",
          })}</h2>
          <p class="nu-sec-lead">Tap a country. One update at a time — no stacked cards.</p>
        </header>
        <div class="nu-geo" data-nu-reveal>
          <div class="nu-geo__chips" role="tablist" aria-label="Countries">${chips}</div>
          <div class="nu-geo__stage">${panels}</div>
        </div>
      </div>
    </section>`;
}

function renderEvents(items = []) {
  const timeline = items.length
    ? items
        .map(
          (ev, i) => `
      <a class="nu-event" ${linkAttrs(ev.href || "#/news")} data-nu-stagger-item data-nu-event style="--i:${i}">
        <span class="nu-event__cal" aria-hidden="true">
          <span class="nu-event__month">${ev.month}</span>
          <span class="nu-event__day">${ev.day}</span>
          <span class="nu-event__year">${ev.year}</span>
        </span>
        <span class="nu-event__rail" aria-hidden="true"><span class="nu-event__dot"></span></span>
        <span class="nu-event__copy">
          <span class="nu-event__cat">Event ${sampleTag(ev)}</span>
          <strong class="nu-event__title">${ev.title}</strong>
          ${ev.place ? `<span class="nu-event__place">${ev.place}</span>` : ""}
          ${ev.summary ? `<span class="nu-event__sum">${ev.summary}</span>` : ""}
        </span>
        <span class="nu-event__go" aria-hidden="true">→</span>
      </a>`
        )
        .join("")
    : `<p class="nu-empty">No upcoming events listed yet.</p>`;

  return `
    <section class="nu-band nu-band--events" id="nu-events" data-nu-section="events" aria-labelledby="nu-events-title">
      <div class="container">
        <header class="nu-sec-head" data-nu-reveal>
          <p class="nu-eyebrow">Events</p>
          <h2 id="nu-events-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Dates on the</span> <em>horizon.</em>",
          })}</h2>
          <p class="nu-sec-lead">A sliding ribbon of gatherings and briefings — swipe or scroll sideways.</p>
        </header>
        <div class="nu-events" data-nu-stagger>${timeline}</div>
      </div>
    </section>`;
}

function renderAnnouncements(items = []) {
  const tapes = items.length
    ? items
        .map(
          (a, i) => `
      <a class="nu-announce nu-announce--${a.tone || "maroon"}" ${linkAttrs(
            a.href || "#/news"
          )} data-nu-stagger-item style="--i:${i}">
        <span class="nu-announce__label">${a.label || "Note"} ${sampleTag(a)}</span>
        <span class="nu-announce__title">${a.title}</span>
        <span class="nu-announce__go" aria-hidden="true">→</span>
      </a>`
        )
        .join("")
    : `<p class="nu-empty">No announcements right now.</p>`;

  return `
    <section class="nu-band nu-band--announce" id="nu-announce" data-nu-section="announce" aria-labelledby="nu-announce-title">
      <div class="container">
        <header class="nu-sec-head" data-nu-reveal>
          <p class="nu-eyebrow">Announcements</p>
          <h2 id="nu-announce-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Short notes,</span> <em>front and centre.</em>",
          })}</h2>
          <p class="nu-sec-lead">Banner-style notices — one line, one action.</p>
        </header>
        <div class="nu-announces" data-nu-stagger>${tapes}</div>
      </div>
    </section>`;
}

function renderMilestones(items = []) {
  const nodes = items.length
    ? items
        .map(
          (m, i) => `
      <li class="nu-mile" data-nu-stagger-item data-nu-mile style="--i:${i}">
        <span class="nu-mile__year">${m.year}</span>
        <span class="nu-mile__track" aria-hidden="true">
          <span class="nu-mile__node"></span>
        </span>
        <span class="nu-mile__body">
          <strong class="nu-mile__title">${m.title}</strong>
          ${m.summary ? `<span class="nu-mile__sum">${m.summary}</span>` : ""}
        </span>
      </li>`
        )
        .join("")
    : `<li class="nu-empty">Milestones will appear here.</li>`;

  return `
    <section class="nu-band nu-band--miles" id="nu-milestones" data-nu-section="milestones" aria-labelledby="nu-milestones-title">
      <div class="container">
        <header class="nu-sec-head nu-sec-head--on-dark" data-nu-reveal>
          <p class="nu-eyebrow nu-eyebrow--on-dark">Milestones</p>
          <h2 id="nu-milestones-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Markers on the</span> <em>journey.</em>",
          })}</h2>
          <p class="nu-sec-lead nu-sec-lead--on-dark">A pulse line through key moments — not a scorecard.</p>
        </header>
        <ol class="nu-miles" data-nu-stagger>${nodes}</ol>
      </div>
    </section>`;
}

function renderClosing(hero = {}) {
  return `
    <section class="nu-close" data-nu-section="close" aria-labelledby="nu-close-title">
      <div class="container nu-close__inner" data-nu-reveal>
        <p class="nu-eyebrow">${hero.eyebrow || "News & Updates"}</p>
        <h2 id="nu-close-title" class="pa-title">${formatPaTitle(
          {
            titleHtml: hero.titleHtml || "<span>A current stream</span> <em>of PA activity.</em>",
            title: hero.title,
          },
          "A current stream of PA activity."
        )}</h2>
        <p class="nu-close__lead">${
          hero.lead ||
          "News, country notes, events, announcements, and milestones across the network."
        }</p>
      </div>
    </section>`;
}

export function renderNewsUpdatesPage(data) {
  const nu = data.newsUpdates || {};
  const counts = {
    "nu-news": (nu.news || []).length,
    "nu-countries": (nu.countryUpdates || []).length,
    "nu-events": (nu.events || []).length,
    "nu-announce": (nu.announcements || []).length,
    "nu-milestones": (nu.milestones || []).length,
  };
  return `
    <div class="nu-page" data-news-page>
      ${renderHero(nu.hero, counts)}
      ${renderNav()}
      ${renderNews(nu.news)}
      ${renderCountryUpdates(nu.countryUpdates)}
      ${renderEvents(nu.events)}
      ${renderAnnouncements(nu.announcements)}
      ${renderMilestones(nu.milestones)}
      ${renderClosing(nu.hero)}
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
  const root = page.querySelector(".nu-geo");
  if (!root) return () => {};

  const activate = (id) => {
    root.querySelectorAll("[data-nu-country]").forEach((b) => {
      const on = b.dataset.nuCountry === id;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    root.querySelectorAll("[data-nu-panel]").forEach((p) => {
      const on = p.dataset.nuPanel === id;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  };

  const onClick = (e) => {
    const btn = e.target.closest("[data-nu-country]");
    if (!btn || !root.contains(btn)) return;
    activate(btn.dataset.nuCountry);
  };

  const onKey = (e) => {
    const btn = e.target.closest("[data-nu-country]");
    if (!btn || !root.contains(btn)) return;
    const chips = [...root.querySelectorAll("[data-nu-country]")];
    const i = chips.indexOf(btn);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = chips[(i + 1) % chips.length];
      next.focus();
      activate(next.dataset.nuCountry);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = chips[(i - 1 + chips.length) % chips.length];
      prev.focus();
      activate(prev.dataset.nuCountry);
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKey);
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKey);
  };
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
    page
      .querySelectorAll(
        "[data-nu-reveal], [data-nu-stagger-item], [data-nu-hero-line], [data-nu-entry], [data-nu-event], [data-nu-mile]"
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
    return;
  }

  const heroLines = page.querySelectorAll("[data-nu-hero-line]");
  if (heroLines.length) {
    gsap.fromTo(
      heroLines,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }

  const watermark = page.querySelector(".nu-hero__watermark");
  if (watermark) {
    gsap.fromTo(
      watermark,
      { autoAlpha: 0, x: -36 },
      { autoAlpha: 0.1, x: 0, duration: 1, ease: "power2.out", delay: 0.15 }
    );
  }

  const heroImg = page.querySelector("[data-nu-hero-img]");
  if (heroImg && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      heroImg,
      { scale: 1.1 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".nu-hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      }
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
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-nu-stagger]").forEach((group) => {
    const kids = group.querySelectorAll("[data-nu-stagger-item]");
    if (!kids.length) return;

    const isMiles = group.classList.contains("nu-miles");
    const isEvents = group.classList.contains("nu-events");

    gsap.fromTo(
      kids,
      isMiles
        ? { autoAlpha: 0, x: -20 }
        : isEvents
          ? { autoAlpha: 0, y: 24 }
          : { autoAlpha: 0, x: -16 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-nu-entry] .nu-entry__year").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: { trigger: el.closest(".nu-entry"), start: "top 88%", once: true },
        clearProps: "transform",
      }
    );
  });

  page.querySelectorAll(".nu-mile__node").forEach((node) => {
    gsap.fromTo(
      node,
      { scale: 0.35 },
      {
        scale: 1,
        duration: 0.55,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: node, start: "top 82%", once: true },
      }
    );
  });

  const mileTrack = page.querySelector(".nu-miles");
  if (mileTrack && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      mileTrack,
      { "--nu-mile-draw": 0 },
      {
        "--nu-mile-draw": 1,
        ease: "none",
        scrollTrigger: {
          trigger: mileTrack,
          start: "top 75%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      }
    );
  }

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
