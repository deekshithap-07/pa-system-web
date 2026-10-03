/**
 * Knowledge Hub — laid out like the World Bank "Research & Publications" page:
 * In Focus → Key resources → search band → browse by collection → what we've learned
 * → more from the hub (+ two shortcuts) → need assistance. PA brand colours and PA content only.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getCountryName } from "../../utils/hub-filters.js";
import { learnedFromStories } from "../shared/pa-learning.js";

const TYPE_TONE = {
  reports: "maroon",
  research: "green",
  "case-studies": "gold",
  guides: "green",
  training: "maroon",
  publications: "gold",
  videos: "maroon",
};

const ICONS = {
  reports:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 17v-3M12 17v-5M15 17v-2"/></svg>',
  research:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/><path d="M8.5 11h5M11 8.5v5"/></svg>',
  "case-studies":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="m9 14 2 2 4-4"/></svg>',
  guides:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  training:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5"/><path d="M21 9v5"/></svg>',
  publications:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a2 2 0 0 1 2 2v13a1 1 0 0 0 1 1H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z"/><path d="M18 9h2v10a1 1 0 0 1-1 1"/><path d="M8 8h6M8 12h6M8 16h4"/></svg>',
  videos:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
};

const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
};

function linkAttrs(item = {}) {
  const href = item.href || "#/resources";
  if (item.external || href.startsWith("http")) return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  return `href="${href}"`;
}

function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;");
}

function searchBlob(item) {
  return `${item.title || ""} ${item.summary || item.description || ""} ${item.program || ""}`
    .toLowerCase()
    .replace(/"/g, "");
}

function itemMeta(item, countriesData) {
  const bits = [];
  if (item.dateLabel || item.year || item.period) bits.push(item.dateLabel || item.year || item.period);
  if (item.countryId) {
    const name = getCountryName(countriesData, item.countryId);
    if (name) bits.push(name);
  }
  if (item.program) bits.push(item.program);
  return bits.filter(Boolean).join(" · ");
}

function actionLabel(item) {
  if (item.cta) return item.cta;
  if (item.external || (item.href || "").endsWith(".pdf")) return "Download";
  return "View";
}

function collectItems(data) {
  const hub = data.knowledgeHub || {};
  const items = hub.items || {};
  const reportsRaw = data.reports?.reports || [];

  const reports = [
    {
      id: "report-impact-2024",
      title: "Annual Impact Report 2024",
      summary: "Network indicators, country progress, and field evidence in one place.",
      dateLabel: "15 Apr 2025",
      href: "#/scorecard#id-indicators",
    },
    {
      id: "report-monthly-field",
      title: "Monthly ministry reports",
      summary: "Ongoing field reports from Kenya, Ethiopia, Malawi, and Zambia.",
      dateLabel: "Ongoing",
      href: "#/field-reports#reports",
    },
    ...reportsRaw.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      dateLabel: r.period || r.year,
      countryId: (r.countryIds || [])[0] || "",
      href: `#/field-reports#report-${r.id}`,
      cta: "Read summary",
    })),
  ];

  const cases = (hub.caseStudies || []).map((cs) => ({
    id: cs.id,
    title: cs.title,
    summary: cs.summary,
    program: cs.program,
    countryId: cs.countryId,
    href: cs.storySlug ? `#/story/${cs.storySlug}` : "#/field-reports",
    cta: "Read the story",
  }));

  const tag = (list, type) => list.map((x) => ({ ...x, type }));
  return {
    reports: tag(reports, "reports"),
    research: tag(items.research || [], "research"),
    "case-studies": tag(cases, "case-studies"),
    guides: tag(items.guides || [], "guides"),
    training: tag(items.training || [], "training"),
    publications: tag(items.publications || [], "publications"),
    videos: tag(items.videos || [], "videos"),
  };
}

/** Generated "cover" — PA colours stand in for publication artwork. */
export function cover(item, label, size = "") {
  const tone = TYPE_TONE[item.type] || "maroon";
  return `<span class="kh-cover kh-cover--${tone}${size ? ` kh-cover--${size}` : ""}" aria-hidden="true">
      <span class="kh-cover__type">${label}</span>
      <span class="kh-cover__icon">${ICONS[item.type] || ICONS.reports}</span>
      <span class="kh-cover__title">${item.title}</span>
      <span class="kh-cover__brand">Possibilities Africa</span>
    </span>`;
}

function renderFocus(item, label, hero = {}) {
  if (!item) return "";
  return `
    <header class="kh-focus" data-kh-section="hero">
      <div class="container">
        <nav class="kh-crumbs" aria-label="Breadcrumb">
          <a href="#/" data-link>Home</a><span aria-hidden="true">/</span><span aria-current="page">${hero.title || "Knowledge Hub"}</span>
        </nav>
        <h1 class="sr-only">${hero.title || "Knowledge Hub"}</h1>
        <div class="kh-focus__grid">
          <div class="kh-focus__copy" data-kh-reveal>
            <p class="kh-focus__eyebrow">In focus</p>
            <h2 class="kh-focus__title">${item.title}</h2>
            ${item.summary ? `<p class="kh-focus__lead">${item.summary}</p>` : ""}
            <a class="kh-btn kh-btn--gold" ${linkAttrs(item)}>${item.external ? "Download the newsletter" : actionLabel(item)} <span aria-hidden="true">→</span></a>
          </div>
          <a class="kh-focus__book" ${linkAttrs(item)} data-kh-reveal tabindex="-1" aria-hidden="true">
            ${cover(item, label, "xl")}
          </a>
        </div>
      </div>
      <span class="kh-focus__swoosh" aria-hidden="true"></span>
    </header>`;
}

function renderKey(list = [], hero = {}, labels = {}) {
  if (!list.length) return "";
  const [lead, ...rest] = list;
  const tile = (item, i) => `<a class="kh-key__tile" ${linkAttrs(item)} data-kh-reveal style="--i:${i}">
      ${cover(item, labels[item.type] || "")}
      <strong>${item.title}</strong>
    </a>`;
  return `
    <section class="kh-key" id="kh-key" aria-labelledby="kh-key-title">
      <div class="container">
        <header class="kh-head" data-kh-reveal>
          <h2 id="kh-key-title" class="kh-head__title">Key resources</h2>
          <p class="kh-head__lead">${hero.lead || "PA as a source of knowledge, learning and evidence."}</p>
        </header>
        <div class="kh-key__grid">
          <a class="kh-key__lead" ${linkAttrs(lead)} data-kh-reveal>
            ${cover(lead, labels[lead.type] || "", "lg")}
            <span class="kh-key__lead-copy">
              <span class="kh-key__type">${labels[lead.type] || ""}</span>
              <strong>${lead.title}</strong>
              ${lead.summary || lead.description ? `<span>${lead.summary || lead.description}</span>` : ""}
              <em>${actionLabel(lead)} →</em>
            </span>
          </a>
          <div class="kh-key__rest">${rest.map(tile).join("")}</div>
        </div>
      </div>
    </section>`;
}

function renderFind(lib = {}, collections = [], countries = [], programs = []) {
  const f = lib.filters || {};
  return `
    <section class="kh-find" id="kh-search" data-kh-section="search" aria-labelledby="kh-find-title">
      <div class="container kh-find__inner" data-kh-reveal>
        <h2 id="kh-find-title" class="kh-find__title">Looking for a specific resource?</h2>
        <p class="kh-find__lead">${lib.subtitle || "Search by keyword, then filter by type, country, or programme."}</p>
        <form class="kh-find__form" data-kh-filters role="search" onsubmit="return false;">
          <label class="kh-find__search">
            <span class="sr-only">Search</span>
            <input type="search" id="kh-search-input" placeholder="${lib.searchPlaceholder || "Search reports, guides, videos…"}" autocomplete="off">
            <button type="button" class="kh-find__go" data-kh-apply>Go</button>
          </label>
          <div class="kh-find__filters">
            <label><span>${f.typeLabel || "Type"}</span>
              <select id="kh-filter-type">
                <option value="all">${f.allTypes || "All types"}</option>
                ${collections.map((c) => `<option value="${c.id}">${c.label}</option>`).join("")}
              </select>
            </label>
            <label><span>${f.countryLabel || "Country"}</span>
              <select id="kh-filter-country">
                <option value="all">${f.allCountries || "All countries"}</option>
                ${countries.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </label>
            <label><span>${f.programLabel || "Programme"}</span>
              <select id="kh-filter-program">
                <option value="all">${f.allPrograms || "All programmes"}</option>
                ${programs.map((p) => `<option value="${escapeAttr(p)}">${p}</option>`).join("")}
              </select>
            </label>
          </div>
        </form>
      </div>
    </section>`;
}

function renderCollections(collections = [], counts = {}) {
  if (!collections.length) return "";
  const cards = collections
    .map(
      (c, i) => `<button type="button" class="kh-coll__card" data-kh-collection="${c.id}" data-kh-reveal style="--i:${i}">
        <span class="kh-coll__icon" aria-hidden="true">${ICONS[c.id] || ICONS.reports}</span>
        <strong>${c.label}</strong>
        ${c.description ? `<span class="kh-coll__desc">${c.description}</span>` : ""}
        <span class="kh-coll__count">${counts[c.id] || 0} ${counts[c.id] === 1 ? "item" : "items"} <span aria-hidden="true">→</span></span>
      </button>`
    )
    .join("");
  return `
    <section class="kh-coll" id="kh-collections" aria-labelledby="kh-coll-title">
      <div class="container">
        <header class="kh-head kh-head--on-dark" data-kh-reveal>
          <h2 id="kh-coll-title" class="kh-head__title">Browse by collection</h2>
          <p class="kh-head__lead">Reports, research, case studies, guides, training, publications and videos from across the network.</p>
        </header>
        <div class="kh-coll__grid">${cards}</div>
      </div>
    </section>`;
}

function renderLearned(items = []) {
  if (!items.length) return "";
  const cards = items
    .map(
      (l, i) => `<a class="kh-learned__card kh-learned__card--${l.programme.tone}" href="#/story/${l.story.slug}" data-link data-kh-reveal style="--i:${i}">
        <span class="kh-learned__prog">${l.programme.title}</span>
        <blockquote>${l.text}</blockquote>
        <span class="kh-learned__meta">${l.story.title}${l.country ? ` · ${l.country.name}` : ""}</span>
        <span class="kh-learned__go">Read the story <span aria-hidden="true">→</span></span>
      </a>`
    )
    .join("");
  return `
    <section class="kh-learned" id="kh-learned" aria-labelledby="kh-learned-title">
      <div class="container">
        <header class="kh-head" data-kh-reveal>
          <h2 id="kh-learned-title" class="kh-head__title">What we've learned</h2>
          <p class="kh-head__lead">What changed in communities, in the words of PA's field stories — one from each program.</p>
        </header>
        <div class="kh-learned__grid">${cards}</div>
      </div>
    </section>`;
}

function renderLibrary(all = [], labels = {}, countriesData) {
  const cards = all
    .map(
      (item, i) => `<a class="kh-card" ${linkAttrs(item)} data-kh-item data-kh-type="${item.type}" data-country-id="${
        item.countryId || ""
      }" data-program="${escapeAttr(item.program || "")}" data-kh-text="${searchBlob(item)}" style="--i:${i % 8}">
        ${cover(item, labels[item.type] || "", "sm")}
        <span class="kh-card__body">
          <span class="kh-card__type">${labels[item.type] || ""}</span>
          <strong class="kh-card__title">${item.title}</strong>
          ${item.summary || item.description ? `<span class="kh-card__sum">${item.summary || item.description}</span>` : ""}
          <span class="kh-card__meta">${itemMeta(item, countriesData)}</span>
          <span class="kh-card__action">${actionLabel(item)} <span aria-hidden="true">→</span></span>
        </span>
      </a>`
    )
    .join("");

  return `
    <section class="kh-lib" id="kh-library" data-kh-section="library" aria-labelledby="kh-lib-title">
      <div class="container">
        <header class="kh-head kh-head--row" data-kh-reveal>
          <div>
            <h2 id="kh-lib-title" class="kh-head__title">More from the Knowledge Hub</h2>
            <p class="kh-head__lead">Everything in the hub. Use the search above to narrow it down.</p>
          </div>
          <button type="button" class="kh-link" data-kh-reset hidden>Show everything <span aria-hidden="true">→</span></button>
        </header>
        <p class="kh-lib__status" data-kh-status aria-live="polite"></p>
        <div class="kh-lib__grid">${cards}</div>
        <p class="kh-empty" data-kh-empty hidden>Nothing matches those filters yet — try another type, country or programme.</p>

        <div class="kh-mini">
          <a class="kh-mini__card" href="#/resources/packs" data-link data-kh-reveal>
            <span class="kh-mini__icon" aria-hidden="true">${ICONS.research}</span>
            <span><strong>Download insight packs</strong><small>Short data packs. They sit next to the stories — they do not replace them.</small></span>
            <span class="kh-mini__go" aria-hidden="true">→</span>
          </a>
          <a class="kh-mini__card" href="#/field-reports" data-link data-kh-reveal>
            <span class="kh-mini__icon" aria-hidden="true">${ICONS.reports}</span>
            <span><strong>Go to field reports</strong><small>Monthly ministry reports and annual summaries from across the network.</small></span>
            <span class="kh-mini__go" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>`;
}

function renderAssist(contact = {}, social = []) {
  const links = social
    .map(
      (s) => `<a class="kh-assist__social" href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">${
        SOCIAL_ICONS[s.id] || s.label
      }</a>`
    )
    .join("");
  return `
    <section class="kh-assist" aria-labelledby="kh-assist-title">
      <div class="container kh-assist__grid">
        <div data-kh-reveal>
          <h2 id="kh-assist-title" class="kh-head__title">Need assistance?</h2>
          <p class="kh-head__lead">For more information about PA's reports and resources.</p>
          <dl class="kh-assist__list">
            ${contact.email ? `<div><dt>Email</dt><dd><a href="mailto:${contact.email}">${contact.email}</a></dd></div>` : ""}
            ${contact.phone ? `<div><dt>Phone</dt><dd><a href="tel:${contact.phone.replace(/\s/g, "")}">${contact.phone}</a></dd></div>` : ""}
            ${contact.address ? `<div><dt>Office</dt><dd>${contact.address}</dd></div>` : ""}
          </dl>
          ${links ? `<div class="kh-assist__socials">${links}</div>` : ""}
        </div>
        <form class="kh-assist__form" data-kh-subscribe data-kh-reveal onsubmit="return false;">
          <p class="kh-assist__form-title">Subscribe to the PA newsletter <span class="pa-sample-tag">Sample</span></p>
          <label><span class="sr-only">Email address</span><input type="email" placeholder="Your email address" required></label>
          <button type="submit" class="kh-btn kh-btn--maroon">Subscribe</button>
          <p class="kh-assist__note" data-kh-subscribe-note hidden>Thanks — sign-up will work once the newsletter service is connected.</p>
        </form>
      </div>
    </section>`;
}

export function renderKnowledgeHubPage(data) {
  const hub = data.knowledgeHub || {};
  const hero = { title: "Knowledge Hub", ...(hub.hero || {}) };
  const lib = hub.library || {};
  const collections = hub.collections || [];
  const labels = Object.fromEntries(collections.map((c) => [c.id, c.label]));
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const byType = collectItems(data);
  const all = collections.flatMap((c) => byType[c.id] || []);
  const counts = Object.fromEntries(collections.map((c) => [c.id, (byType[c.id] || []).length]));

  const focus = byType.publications[0] || byType.reports[0];
  const featured = (hub.featuredStories || []).map((f) => ({ ...f, summary: f.description, type: f.theme === "data" ? "reports" : "case-studies" }));
  const key = [byType.reports[0], ...featured, byType.research[0], byType.training[0], byType.guides[0]].filter(
    (x) => x && x !== focus
  ).slice(0, 5);

  return `
    <div class="kh-page" data-resources-hub data-knowledge-hub>
      ${renderFocus(focus, labels[focus?.type] || "", hero)}
      ${renderKey(key, hero, labels)}
      ${renderFind(lib, collections, countries, hub.programs || [])}
      ${renderCollections(collections, counts)}
      ${renderLearned(learnedFromStories(data))}
      ${renderLibrary(all, labels, data.countries)}
      ${renderAssist(data.aboutPa?.contact || {}, hub.socialLinks || [])}
    </div>`;
}

let khCleanup = null;

export function mountKnowledgeHubPage() {
  const page = document.querySelector("[data-knowledge-hub]");
  if (!page) return;
  destroyKnowledgeHubPage();
  const cleanups = [bindFilters(page), bindReveal(page), bindSubscribe(page)];
  khCleanup = () => cleanups.forEach((fn) => fn && fn());
}

export function destroyKnowledgeHubPage() {
  if (typeof khCleanup === "function") khCleanup();
  khCleanup = null;
}

function bindReveal(page) {
  const els = [...page.querySelectorAll("[data-kh-reveal]")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.classList.add("is-in"));
    return null;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function bindSubscribe(page) {
  const form = page.querySelector("[data-kh-subscribe]");
  if (!form) return null;
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.querySelector("input")?.checkValidity()) return;
    form.querySelector("[data-kh-subscribe-note]")?.removeAttribute("hidden");
  };
  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}

function bindFilters(page) {
  const search = page.querySelector("#kh-search-input");
  const typeSel = page.querySelector("#kh-filter-type");
  const countrySel = page.querySelector("#kh-filter-country");
  const programSel = page.querySelector("#kh-filter-program");
  const applyBtn = page.querySelector("[data-kh-apply]");
  const resetBtn = page.querySelector("[data-kh-reset]");
  const status = page.querySelector("[data-kh-status]");
  const empty = page.querySelector("[data-kh-empty]");
  const library = page.querySelector("#kh-library");
  const cards = [...page.querySelectorAll("[data-kh-item]")];

  const scrollToLibrary = () => {
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
    const top = library.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const apply = ({ scroll = false } = {}) => {
    const q = (search?.value || "").trim().toLowerCase();
    const type = typeSel?.value || "all";
    const countryId = countrySel?.value || "all";
    const program = programSel?.value || "all";
    let shown = 0;
    cards.forEach((card) => {
      const ok =
        (!q || (card.dataset.khText || "").includes(q)) &&
        (type === "all" || card.dataset.khType === type) &&
        (countryId === "all" || !card.dataset.countryId || card.dataset.countryId === countryId) &&
        (program === "all" || !card.dataset.program || card.dataset.program === program);
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    const filtered = q || type !== "all" || countryId !== "all" || program !== "all";
    if (status) status.textContent = filtered ? `${shown} of ${cards.length} resources match.` : "";
    if (empty) empty.hidden = shown > 0;
    if (resetBtn) resetBtn.hidden = !filtered;
    if (scroll && library) scrollToLibrary();
  };

  const onApply = () => apply({ scroll: true });
  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      apply({ scroll: true });
    }
  };
  const onChange = () => apply();
  const onReset = () => {
    if (search) search.value = "";
    [typeSel, countrySel, programSel].forEach((s) => s && (s.value = "all"));
    apply();
  };
  const onCollection = (e) => {
    const btn = e.target.closest("[data-kh-collection]");
    if (!btn || !typeSel) return;
    typeSel.value = btn.dataset.khCollection;
    apply({ scroll: true });
  };

  applyBtn?.addEventListener("click", onApply);
  search?.addEventListener("keydown", onKey);
  [typeSel, countrySel, programSel].forEach((s) => s?.addEventListener("change", onChange));
  resetBtn?.addEventListener("click", onReset);
  page.addEventListener("click", onCollection);

  const anchor = location.hash.match(/#kh-([a-z-]+)$/)?.[1];
  if (anchor && typeSel && [...typeSel.options].some((o) => o.value === anchor)) {
    typeSel.value = anchor;
    requestAnimationFrame(() => apply({ scroll: true }));
  }

  return () => {
    applyBtn?.removeEventListener("click", onApply);
    search?.removeEventListener("keydown", onKey);
    [typeSel, countrySel, programSel].forEach((s) => s?.removeEventListener("change", onChange));
    resetBtn?.removeEventListener("click", onReset);
    page.removeEventListener("click", onCollection);
  };
}
