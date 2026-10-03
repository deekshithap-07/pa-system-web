/**
 * One page per program: #/program/:id. The list of all five lives on What We Do (ALL_PROGRAMS_HREF).
 * Program pages follow the World Bank "Jobs" page layout: campaign hero → statement with sticky story cards
 * → three PPP pillars (pop-ups) → countries (expanding panels) → activities → resources carousel → other programs.
 * Content comes from PA's own pages and documents; field activity logs are Sample until the tracking system is connected.
 */

import { PA_PROGRAMMES } from "../components/shared/pa-programmes.js";
import { PA_PPPS, pppFor, programmeIdFor, programmeById, HOW_PA_WORKS_HREF } from "../components/shared/pa-model.js";

const SAMPLE_TAG = '<span class="pa-sample-tag">Sample</span>';
export const ALL_PROGRAMS_HREF = "#/work#work-projects";
let cleanups = [];

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const programImage = (id) => `assets/results-areas/${id}.jpg`;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countryByAnyId(data, id) {
  const list = data.countries?.countries || [];
  return list.find((c) => c.id === id || c.slug === id) || null;
}

/** Real evidence for one program, gathered across countries, stories and the Knowledge Hub. */
export function programEvidence(data, id) {
  const hubs = data.countryHubs?.hubs || {};
  const countries = [];
  const field = [];

  Object.entries(hubs).forEach(([slug, hub]) => {
    const initiatives = (hub.initiatives?.items || []).filter((t) => programmeIdFor(t) === id);
    const activities = (hub.activities || []).filter((a) => programmeIdFor(a.project) === id);
    activities.forEach((a) => field.push({ ...a, countrySlug: slug, countryName: hub.countryName || slug, ppp: pppFor(a.project, id) }));
    if (initiatives.length || activities.length) {
      countries.push({
        slug,
        name: hub.countryName || countryByAnyId(data, slug)?.name || slug,
        initiatives,
        sourceUrl: hub.initiatives?.sourceUrl || "",
        activityCount: activities.length,
      });
    }
  });

  const stories = (data.stories?.stories || []).filter((s) => programmeIdFor(s.program) === id);
  stories.forEach((s) => {
    const c = countryByAnyId(data, s.countryId);
    if (c && !countries.some((x) => x.slug === c.slug)) {
      countries.push({ slug: c.slug, name: c.name, initiatives: [], sourceUrl: "", activityCount: 0 });
    }
  });
  countries.forEach((c) => {
    const own = stories.filter((s) => countryByAnyId(data, s.countryId)?.slug === c.slug);
    c.storyCount = own.length;
    c.image = own.find((s) => s.image)?.image || "";
  });

  const kh = data.knowledgeHub || {};
  const khItems = [
    ...Object.entries(kh.items || {}).flatMap(([type, list]) => list.map((x) => ({ ...x, type }))),
    ...(kh.caseStudies || []).map((cs) => ({ ...cs, type: "case-studies", href: cs.storySlug ? `#/story/${cs.storySlug}` : "#/field-reports" })),
  ];
  const resources = khItems.filter((r) => r.program && programmeIdFor(r.program) === id);

  const ppps = (PA_PPPS[id] || []).map((p) => {
    const examples = [
      ...countries.flatMap((c) => c.initiatives.map((t) => ({ text: t, where: c.name }))),
      ...field.map((a) => ({ text: a.project, where: a.countryName })),
      ...stories.map((s) => ({ text: s.title, where: countryByAnyId(data, s.countryId)?.name || "", href: `#/story/${s.slug}` })),
    ].filter((x) => p.test.test(String(x.text)));
    return { ...p, examples };
  });

  field.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { countries, field, stories, resources, ppps };
}

/* ---------- Program page (World Bank Jobs layout) ---------- */

function renderSubnav(p, idx, ev) {
  const links = [
    ["#pj-ppps", "PPPs"],
    ev.countries.length && ["#pj-where", "Where"],
    ev.field.length && ["#pj-activities", "Activities"],
    (ev.resources.length || ev.stories.length) && ["#pj-resources", "Resources"],
  ].filter(Boolean);
  return `
    <nav class="pj-subnav" aria-label="${esc(p.title)}">
      <div class="pg-wrap pj-subnav__inner">
        <a class="pj-subnav__home" href="${ALL_PROGRAMS_HREF}" data-link><span>Program 0${idx + 1}</span>${esc(p.title)}</a>
        <div class="pj-subnav__more">
          <span class="pj-subnav__label">More</span>
          ${links.map(([href, label]) => `<a href="${href}" data-pj-jump>${label}</a>`).join("")}
          <a href="${ALL_PROGRAMS_HREF}" data-link>All programs</a>
        </div>
      </div>
    </nav>`;
}

function renderHero(p, ev) {
  const words = ev.ppps.map((x) => x.name);
  return `
    <header class="pj-hero pj-hero--${p.tone}">
      <img class="pj-hero__bg" src="${programImage(p.id)}" alt="" decoding="async" fetchpriority="high">
      <span class="pj-hero__veil" aria-hidden="true"></span>
      <div class="pg-wrap pj-hero__inner">
        <nav class="pj-crumb" aria-label="Breadcrumb">
          <a href="#/" data-link>Home</a><span>/</span><a href="${ALL_PROGRAMS_HREF}" data-link>What we do</a>
        </nav>
        <h1 class="pj-hero__title">${esc(p.title)}</h1>
        ${
          words.length
            ? `<p class="pj-hero__rotor" aria-label="${esc(words.join(", "))}">
                <span class="pj-hero__rotor-lead" aria-hidden="true">through</span>
                <span class="pj-hero__words" data-pj-rotor aria-hidden="true">
                  ${words.map((w, i) => `<em class="${i === 0 ? "is-on" : ""}">${esc(w)}</em>`).join("")}
                </span>
              </p>`
            : ""
        }
      </div>
    </header>`;
}

function renderStatement(data, p, ev) {
  const cards = ev.stories.filter((s) => s.image).slice(0, 3);
  const stats = [
    { value: ev.ppps.length, label: "PPPs" },
    { value: ev.countries.length, label: ev.countries.length === 1 ? "Country" : "Countries" },
    { value: ev.stories.length, label: ev.stories.length === 1 ? "Story" : "Stories" },
    { value: ev.resources.length, label: ev.resources.length === 1 ? "Resource" : "Resources" },
  ];
  return `
    <section class="pj-statement">
      <div class="pg-wrap">
        <h2 class="pj-statement__big" data-pg-reveal>${esc(p.text)}</h2>
        <div class="pj-statement__grid">
          <div class="pj-statement__copy" data-pg-reveal>
            <h3>${esc(p.description)}</h3>
            <ul class="pj-stats" aria-label="On this site">
              ${stats.map((s) => `<li><strong>${s.value}</strong><span>${s.label}</span></li>`).join("")}
            </ul>
            <a class="pj-link" href="${HOW_PA_WORKS_HREF}" data-link>How PA works</a>
          </div>
          ${
            cards.length
              ? `<div class="pj-stack">
                  ${cards
                    .map((s, i) => {
                      const c = countryByAnyId(data, s.countryId);
                      return `<article class="pj-stack__card" style="--i:${i}">
                        <img src="${esc(s.image)}" alt="" loading="lazy" decoding="async">
                        <span class="pj-stack__veil" aria-hidden="true"></span>
                        <div class="pj-stack__body">
                          ${c ? `<p class="pj-tag">${esc(c.name)}</p>` : ""}
                          <h3>${esc(s.title)}</h3>
                          ${s.excerpt ? `<p>${esc(s.excerpt)}</p>` : ""}
                          <a class="pj-link pj-link--light" href="#/story/${esc(s.slug)}" data-link>Read the story</a>
                        </div>
                      </article>`;
                    })
                    .join("")}
                </div>`
              : ""
          }
        </div>
      </div>
    </section>`;
}

function renderPillars(p, ev) {
  const cards = ev.ppps
    .map(
      (x, i) => `<button type="button" class="pj-pillar" data-pj-open="pj-ppp-${x.id}" data-pg-reveal style="--i:${i}">
        <span class="pj-pillar__n">0${i + 1}</span>
        <strong>${esc(x.name)}</strong>
        <span class="pj-pillar__sub">${x.detail ? esc(x.detail) : `${x.examples.length} field example${x.examples.length === 1 ? "" : "s"} on this site`}</span>
        <span class="pj-pillar__plus" aria-hidden="true"></span>
      </button>`
    )
    .join("");
  const dialogs = ev.ppps
    .map(
      (x, i) => `<dialog class="pj-dialog" id="pj-ppp-${x.id}" aria-labelledby="pj-ppp-${x.id}-title">
        <button type="button" class="pj-dialog__close" data-pj-close aria-label="Close">×</button>
        <p class="pj-tag">PPP 0${i + 1} · ${esc(p.title)}</p>
        <h2 id="pj-ppp-${x.id}-title">${esc(x.name)}</h2>
        ${x.detail ? `<p class="pj-dialog__lead">${esc(x.detail)}</p>` : ""}
        ${
          x.examples.length
            ? `<p class="pj-dialog__label">Field examples on this site</p>
              <ul class="pj-dialog__list">${x.examples
                .slice(0, 8)
                .map(
                  (e) =>
                    `<li>${e.href ? `<a href="${esc(e.href)}" data-link>${esc(e.text)}</a>` : esc(e.text)}${e.where ? `<small>${esc(e.where)}</small>` : ""}</li>`
                )
                .join("")}</ul>`
            : `<p class="pj-dialog__lead">No field examples on this site yet.</p>`
        }
      </dialog>`
    )
    .join("");
  return `
    <section class="pj-pillars" id="pj-ppps">
      <div class="pg-wrap">
        <header class="pj-center" data-pg-reveal>
          <h2 class="pj-h2">Three PPPs.</h2>
          <p class="pj-h2 pj-h2--sub">That's how this program reaches people.</p>
          <p class="pj-lead">Every activity under ${esc(p.title)} is reported under one of these Program Priority Projects.</p>
        </header>
        <div class="pj-pillars__grid">${cards}</div>
      </div>
      ${dialogs}
    </section>`;
}

function renderWhere(ev, p) {
  if (!ev.countries.length) return "";
  const panels = ev.countries
    .map(
      (c, i) => `<article class="pj-x__panel${i === 0 ? " is-active" : ""}" data-pj-x-panel tabindex="0" style="--i:${i}">
        ${c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy" decoding="async">` : `<img src="${programImage(p.id)}" alt="" loading="lazy" decoding="async">`}
        <span class="pj-x__veil" aria-hidden="true"></span>
        <span class="pj-x__name">${esc(c.name)}</span>
        <div class="pj-x__body">
          <h3>${esc(c.name)}</h3>
          ${
            c.initiatives.length
              ? `<ul>${c.initiatives.slice(0, 4).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
              : `<p>Documented through ${c.storyCount} stor${c.storyCount === 1 ? "y" : "ies"} from the field.</p>`
          }
          <a class="pj-link pj-link--light" href="#/country/${c.slug}" data-link>Open the country</a>
          ${c.sourceUrl ? `<a class="pj-x__src" href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">Source: possibilitiesafrica.org</a>` : ""}
        </div>
      </article>`
    )
    .join("");
  return `
    <section class="pj-where" id="pj-where">
      <div class="pg-wrap">
        <header class="pj-head" data-pg-reveal>
          <h2 class="pj-h2">Where it is active</h2>
          <p class="pj-lead">Countries where this program shows up in PA's field reports and stories.</p>
        </header>
        <div class="pj-x" data-pj-x data-pg-reveal>${panels}</div>
      </div>
    </section>`;
}

function renderActivities(ev) {
  if (!ev.field.length) return "";
  return `
    <section class="pj-acts" id="pj-activities">
      <div class="pg-wrap">
        <header class="pj-head" data-pg-reveal>
          <h2 class="pj-h2 pj-h2--light">Recent activities ${SAMPLE_TAG}</h2>
          <p class="pj-lead pj-lead--light">Activity logs will come from the PA tracking system once it is connected.</p>
        </header>
        <ul class="pj-acts__grid">
          ${ev.field
            .slice(0, 6)
            .map(
              (a, i) => `<li class="pj-act" data-pg-reveal style="--i:${i}">
                <p class="pj-tag">${esc(a.countryName)}${a.date ? ` · ${esc(a.date)}` : ""}</p>
                <h3>${esc(a.project)}</h3>
                <p>${esc(a.community || "")}</p>
                ${a.ppp ? `<span class="pj-act__ppp">${esc(a.ppp.name)}</span>` : ""}
              </li>`
            )
            .join("")}
        </ul>
      </div>
    </section>`;
}

const TYPE_LABEL = {
  research: "Research",
  guides: "Guide",
  training: "Training",
  publications: "Publication",
  "case-studies": "Case study",
  videos: "Video",
};

function renderResources(data, ev, p) {
  const items = [
    ...ev.resources.map((r) => ({ tag: TYPE_LABEL[r.type] || "Resource", title: r.title, href: r.href || "#/resources", external: r.external, image: "" })),
    ...ev.stories.slice(3).map((s) => ({
      tag: `Story · ${countryByAnyId(data, s.countryId)?.name || ""}`,
      title: s.title,
      href: `#/story/${s.slug}`,
      image: s.image,
    })),
  ];
  if (!items.length) return "";
  return `
    <section class="pj-res" id="pj-resources" data-pj-carousel>
      <div class="pg-wrap">
        <header class="pj-head pj-head--row" data-pg-reveal>
          <div>
            <h2 class="pj-h2">Resources and stories</h2>
            <p class="pj-lead">Guides, case studies and field stories for ${esc(p.title)}.</p>
          </div>
          <div class="pj-arrows">
            <button type="button" class="pj-arrow" data-pj-prev aria-label="Previous">‹</button>
            <button type="button" class="pj-arrow" data-pj-next aria-label="Next">›</button>
          </div>
        </header>
        <ul class="pj-res__track" data-pj-track>
          ${items
            .map(
              (r) => `<li><a class="pj-res__card${r.image ? "" : " pj-res__card--plain"}" href="${esc(r.href)}" ${
                r.external ? 'target="_blank" rel="noopener"' : "data-link"
              }>
                ${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy" decoding="async">` : ""}
                <span class="pj-res__veil" aria-hidden="true"></span>
                <span class="pj-res__body"><span class="pj-tag">${esc(r.tag)}</span><strong>${esc(r.title)}</strong></span>
                <span class="pj-res__go" aria-hidden="true">↗</span>
              </a></li>`
            )
            .join("")}
        </ul>
      </div>
    </section>`;
}

function renderMore(p) {
  return `
    <section class="pj-more">
      <div class="pg-wrap">
        <p class="pj-more__title">More from PA's five programs</p>
        <div class="pj-more__row">
          ${PA_PROGRAMMES.filter((x) => x.id !== p.id)
            .map((x) => `<a class="pj-more__btn" href="#/program/${x.id}" data-link>${esc(x.title)}</a>`)
            .join("")}
          <a class="pj-more__btn pj-more__btn--all" href="${ALL_PROGRAMS_HREF}" data-link>All five programs</a>
        </div>
      </div>
    </section>`;
}

function renderDetail(data, id) {
  const p = programmeById(id);
  if (!p) return "";
  const ev = programEvidence(data, id);
  const idx = PA_PROGRAMMES.findIndex((x) => x.id === id);

  return `
    <div class="pg-page pj-page pj-page--${p.tone}" data-programs-page>
      ${renderHero(p, ev)}
      ${renderSubnav(p, idx, ev)}
      ${renderStatement(data, p, ev)}
      ${renderPillars(p, ev)}
      ${renderWhere(ev, p)}
      ${renderActivities(ev)}
      ${renderResources(data, ev, p)}
      ${renderMore(p)}
    </div>`;
}

export function renderPrograms(data, id = null) {
  return id ? renderDetail(data, id) : "";
}

export function mountPrograms(root = document) {
  destroyPrograms();
  const page = root.querySelector?.("[data-programs-page]") || document.querySelector("[data-programs-page]");
  if (!page) return;
  cleanups = [bindReveal(page), bindRotor(page), bindDialogs(page), bindExpand(page), bindCarousel(page), bindJumps(page)];
}

export function destroyPrograms() {
  cleanups.forEach((fn) => typeof fn === "function" && fn());
  cleanups = [];
}

function bindReveal(page) {
  const items = [...page.querySelectorAll("[data-pg-reveal]")];
  if (!("IntersectionObserver" in window) || reduced()) {
    items.forEach((el) => el.classList.add("is-in"));
    return null;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function bindRotor(page) {
  const words = [...page.querySelectorAll("[data-pj-rotor] em")];
  if (words.length < 2 || reduced()) return null;
  let i = 0;
  const t = window.setInterval(() => {
    words[i].classList.remove("is-on");
    words[i].classList.add("is-off");
    const prev = words[i];
    window.setTimeout(() => prev.classList.remove("is-off"), 700);
    i = (i + 1) % words.length;
    words[i].classList.add("is-on");
  }, 2600);
  return () => window.clearInterval(t);
}

function bindDialogs(page) {
  const onClick = (e) => {
    const open = e.target.closest("[data-pj-open]");
    if (open) {
      const d = page.querySelector(`#${open.dataset.pjOpen}`);
      if (d?.showModal) d.showModal();
      return;
    }
    if (e.target.closest("[data-pj-close]")) e.target.closest("dialog")?.close();
    else if (e.target.tagName === "DIALOG") e.target.close();
    if (e.target.closest("dialog a[data-link]")) e.target.closest("dialog")?.close();
  };
  page.addEventListener("click", onClick);
  return () => {
    page.removeEventListener("click", onClick);
    page.querySelectorAll("dialog[open]").forEach((d) => d.close());
  };
}

function bindExpand(page) {
  const wrap = page.querySelector("[data-pj-x]");
  if (!wrap) return null;
  const panels = [...wrap.querySelectorAll("[data-pj-x-panel]")];
  const hover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const open = (panel) => panels.forEach((x) => x.classList.toggle("is-active", x === panel));
  const handlers = panels.map((panel) => {
    const on = () => open(panel);
    const key = (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), on());
    panel.addEventListener("click", on);
    panel.addEventListener("focus", on);
    panel.addEventListener("keydown", key);
    if (hover) panel.addEventListener("mouseenter", on);
    return () => {
      panel.removeEventListener("click", on);
      panel.removeEventListener("focus", on);
      panel.removeEventListener("keydown", key);
      panel.removeEventListener("mouseenter", on);
    };
  });
  return () => handlers.forEach((fn) => fn());
}

function bindCarousel(page) {
  const root = page.querySelector("[data-pj-carousel]");
  if (!root) return null;
  const track = root.querySelector("[data-pj-track]");
  const prev = root.querySelector("[data-pj-prev]");
  const next = root.querySelector("[data-pj-next]");
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  const step = (d) => track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: reduced() ? "auto" : "smooth" });
  const onPrev = () => step(-1);
  const onNext = () => step(1);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  track.addEventListener("scroll", update, { passive: true });
  update();
  return () => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    track.removeEventListener("scroll", update);
  };
}

function bindJumps(page) {
  const onClick = (e) => {
    const a = e.target.closest("[data-pj-jump]");
    if (!a) return;
    e.preventDefault();
    const target = page.querySelector(a.getAttribute("href"));
    if (!target) return;
    const offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64) + 56;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduced() ? "auto" : "smooth" });
  };
  page.addEventListener("click", onClick);
  return () => page.removeEventListener("click", onClick);
}
