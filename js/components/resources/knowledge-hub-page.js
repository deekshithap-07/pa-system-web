/**
 * Knowledge Hub — premium digital library (PA brand).
 * Content/data/routes/filters preserved; presentation only.
 */

import { formatPaTitle } from "../../utils/pa-title.js";
import { getCountryName } from "../../utils/hub-filters.js";

const ARCHIVE = [
  {
    id: "kh-reports",
    type: "reports",
    key: "reports",
    titleHtml: "<span>Reports</span>",
    skin: "burgundy",
  },
  {
    id: "kh-research",
    type: "research",
    key: "research",
    titleHtml: "<span>Research</span>",
    skin: "cream",
  },
  {
    id: "kh-case-studies",
    type: "case-studies",
    key: "case-studies",
    titleHtml: "<span>Case</span> <em>studies.</em>",
    skin: "green",
  },
  {
    id: "kh-guides",
    type: "guides",
    key: "guides",
    titleHtml: "<span>Guides</span>",
    skin: "ivory",
  },
  {
    id: "kh-training",
    type: "training",
    key: "training",
    titleHtml: "<span>Training</span> <em>resources.</em>",
    skin: "ochre",
  },
  {
    id: "kh-publications",
    type: "publications",
    key: "publications",
    titleHtml: "<span>Publications</span>",
    skin: "cream",
  },
];

function linkAttrs(item = {}) {
  const href = item.href || "#/resources";
  if (item.external || href.startsWith("http")) {
    return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  }
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  if (href.startsWith("#")) return `href="${href}"`;
  return `href="${href}"`;
}

function searchBlob(item) {
  return `${item.title || ""} ${item.summary || item.description || ""}`
    .toLowerCase()
    .replace(/"/g, "");
}

function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;");
}

function itemMeta(item, countriesData) {
  const bits = [];
  if (item.typeLabel) bits.push(item.typeLabel);
  if (item.dateLabel || item.year || item.period) bits.push(item.dateLabel || item.year || item.period);
  if (item.program) bits.push(item.program);
  if (item.countryId) {
    const name = getCountryName(countriesData, item.countryId);
    if (name) bits.push(name);
  }
  if (item.format) bits.push(item.format);
  return bits.filter(Boolean).join(" · ");
}

function actionLabel(item) {
  if (item.cta) return item.cta;
  if (item.external || (item.href || "").startsWith("http")) return "Open resource";
  if ((item.href || "").includes("download") || item.downloadUrl) return "Download";
  return "View";
}

function collectItems(data) {
  const hub = data.knowledgeHub || {};
  const items = hub.items || {};
  const reportsRaw = data.reports?.reports || [];
  const caseStudies = hub.caseStudies || [];

  const reports = [
    {
      id: "report-impact-2024",
      title: "Annual Impact Report 2024",
      summary: "Network indicators, country progress, and field evidence in one place.",
      year: "2024",
      dateLabel: "15 Apr 2025",
      href: "#/scorecard#id-indicators",
      typeLabel: "Reports",
    },
    {
      id: "report-monthly-field",
      title: "Monthly ministry reports",
      summary: "Ongoing field reports from Kenya, Ethiopia, Malawi, and Zambia.",
      year: "2025",
      dateLabel: "Ongoing",
      href: "#/field-reports#reports",
      typeLabel: "Reports",
    },
    ...reportsRaw.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      year: r.period || r.year,
      dateLabel: r.period || r.year,
      countryId: (r.countryIds || [])[0] || "",
      href: `#/field-reports#report-${r.id}`,
      cta: "Read summary",
      typeLabel: "Reports",
    })),
  ];

  const research = (items.research || []).map((r) => ({ ...r, typeLabel: "Research" }));

  const cases = caseStudies.map((cs) => ({
    id: cs.id,
    title: cs.title,
    summary: cs.summary,
    program: cs.program,
    countryId: cs.countryId,
    year: cs.year,
    href: cs.storySlug ? `#/story/${cs.storySlug}` : "#/field-reports",
    typeLabel: "Case studies",
  }));

  const guides = (items.guides || []).map((g) => ({ ...g, typeLabel: "Guides" }));
  const training = (items.training || []).map((t) => ({ ...t, typeLabel: "Training resources" }));
  const publications = (items.publications || []).map((p) => ({
    ...p,
    typeLabel: "Publications",
  }));
  const videos = (items.videos || []).map((v) => ({ ...v, typeLabel: "Videos" }));

  return { reports, research, cases, guides, training, publications, videos };
}

function bagByType(bag) {
  return {
    reports: bag.reports,
    research: bag.research,
    "case-studies": bag.cases,
    guides: bag.guides,
    training: bag.training,
    publications: bag.publications,
    videos: bag.videos,
  };
}

function renderHero(hero = {}) {
  const image = hero.image || "assets/knowledge-hub/hero.jpg";
  return `
    <header class="kh-hero" data-kh-section="hero">
      <div class="kh-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high" data-kh-hero-img>
        <span class="kh-hero__veil"></span>
        <span class="kh-hero__grain"></span>
      </div>
      <span class="kh-hero__watermark" aria-hidden="true">Knowledge</span>
      <div class="container kh-hero__layout">
        <div class="kh-hero__inner">
          <p class="kh-eyebrow kh-eyebrow--on-dark" data-kh-hero-line>${hero.eyebrow || "Knowledge Hub"}</p>
          <h1 class="pa-title kh-hero__title" data-kh-hero-line>${formatPaTitle(
            {
              titleHtml: hero.titleHtml || "<span>Knowledge</span> <em>Hub.</em>",
              title: hero.title || "Knowledge Hub",
            },
            "Knowledge Hub."
          )}</h1>
          <p class="kh-hero__lead" data-kh-hero-line>${
            hero.lead || "PA as a source of knowledge, learning and evidence."
          }</p>
        </div>
      </div>
    </header>`;
}

const INDEX_ICONS = {
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

function renderJumpBar(collections = [], counts = {}) {
  if (!collections.length) return "";
  const jumps = collections
    .map(
      (c) => `<a class="kh-jumps__link" href="#kh-${c.id}">
        <span class="kh-jumps__icon" aria-hidden="true">${INDEX_ICONS[c.id] || INDEX_ICONS.reports}</span>
        <span>${c.label || c.title}</span>
        ${counts[c.id] ? `<em>${counts[c.id]}</em>` : ""}
      </a>`
    )
    .join("");
  return `<nav class="kh-jumps" aria-label="Jump to a collection">
      <div class="container kh-jumps__inner">${jumps}</div>
    </nav>`;
}

function renderSearch(lib = {}, collections = [], countries = [], programs = []) {
  const typeOptions = [
    { id: "all", label: lib.filters?.allTypes || "All types" },
    ...collections.map((c) => ({ id: c.id, label: c.label })),
  ]
    .map((t) => `<option value="${t.id}">${t.label}</option>`)
    .join("");

  return `
    <section class="kh-search" id="kh-search" data-kh-section="search" aria-labelledby="kh-search-title">
      <div class="container">
        <header class="kh-sec-head" data-kh-reveal>
          <p class="kh-eyebrow">Search and filters</p>
          <h2 id="kh-search-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Find what</span> <em>you need.</em>",
          })}</h2>
          <p class="kh-sec-lead">${
            lib.subtitle || "Search by keyword, then filter by type, country, or programme."
          }</p>
        </header>
        <form class="kh-tools" data-kh-filters data-kh-reveal role="search" onsubmit="return false;">
          <label class="kh-tools__search">
            <span class="sr-only">Search</span>
            <input type="search" id="kh-search-input" placeholder="${
              lib.searchPlaceholder || "Search reports, guides, videos…"
            }" autocomplete="off">
          </label>
          <label class="kh-tools__filter">
            <span>${lib.filters?.typeLabel || "Type"}</span>
            <select id="kh-filter-type">${typeOptions}</select>
          </label>
          <label class="kh-tools__filter">
            <span>${lib.filters?.countryLabel || "Country"}</span>
            <select id="kh-filter-country">
              <option value="all">${lib.filters?.allCountries || "All countries"}</option>
              ${countries.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
          </label>
          <label class="kh-tools__filter">
            <span>${lib.filters?.programLabel || "Programme"}</span>
            <select id="kh-filter-program">
              <option value="all">${lib.filters?.allPrograms || "All programmes"}</option>
              ${programs.map((p) => `<option value="${p}">${p}</option>`).join("")}
            </select>
          </label>
          <button type="button" class="kh-tools__apply" data-kh-apply>Show results</button>
        </form>
        <p class="kh-search-hint" data-kh-reveal>Set filters, then press Show results to jump to matching items.</p>
      </div>
    </section>`;
}

function renderFeatured(featured = [], countriesData) {
  if (!featured.length) return "";

  const blocks = featured
    .map((item, i) => {
      const flip = i % 2 === 1 ? " kh-feature--flip" : "";
      const dominant = i === 0 ? " kh-feature--dominant" : "";
      const meta = item.subtitle || "";
      return `<article class="kh-feature${flip}${dominant}" data-kh-feature data-kh-reveal>
        <div class="kh-feature__mark" aria-hidden="true">
          <span class="kh-feature__doc"></span>
          <span class="kh-feature__n">${String(i + 1).padStart(2, "0")}</span>
        </div>
        <div class="kh-feature__copy">
          ${meta ? `<p class="kh-feature__meta">${meta}</p>` : ""}
          <h3 class="kh-feature__title"><a ${linkAttrs(item)}>${item.title}</a></h3>
          ${
            item.description || item.summary
              ? `<p class="kh-feature__excerpt">${item.description || item.summary}</p>`
              : ""
          }
          <a class="kh-feature__cta" ${linkAttrs(item)}>${actionLabel(item)} <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="kh-featured" id="kh-featured" data-kh-section="featured" aria-labelledby="kh-featured-title">
      <div class="container">
        <header class="kh-sec-head" data-kh-reveal>
          <p class="kh-eyebrow">Key resources</p>
          <h2 id="kh-featured-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Start with</span> <em>evidence.</em>",
          })}</h2>
        </header>
        <div class="kh-featured__stage">${blocks}</div>
      </div>
    </section>`;
}

function renderResourceRow(item, countriesData, index, type) {
  const meta = itemMeta(item, countriesData);
  return `<a class="kh-row" ${linkAttrs(item)} data-kh-item data-kh-type="${type}" data-country-id="${
    item.countryId || ""
  }" data-program="${escapeAttr(item.program || "")}" data-kh-text="${searchBlob(
    item
  )}" data-kh-stagger-item style="--i:${index}">
    <span class="kh-row__n">${String(index + 1).padStart(2, "0")}</span>
    <span class="kh-row__body">
      ${meta ? `<span class="kh-row__meta">${meta}</span>` : ""}
      <strong class="kh-row__title">${item.title}</strong>
      ${
        item.summary || item.description
          ? `<span class="kh-row__sum">${item.summary || item.description}</span>`
          : ""
      }
    </span>
    <span class="kh-row__action">${actionLabel(item)}</span>
    <span class="kh-row__go" aria-hidden="true">→</span>
  </a>`;
}

function renderArchiveSection(cfg, collection, items, countriesData) {
  const eyebrow = collection?.label || collection?.title || cfg.type;
  const lead = collection?.description || "";
  const titleHtml =
    collection?.title && !cfg.titleHtml.includes("em")
      ? `<span>${collection.title}</span>`
      : cfg.titleHtml;

  const rows = items.length
    ? `<div class="kh-archive" data-kh-stagger>${items
        .map((item, i) => renderResourceRow(item, countriesData, i, cfg.type))
        .join("")}</div>`
    : `<p class="kh-empty">No ${eyebrow.toLowerCase()} published here yet — check back soon.</p>`;

  return `
    <section class="kh-band kh-band--${cfg.skin}" id="${cfg.id}" data-kh-section="${cfg.type}" aria-labelledby="${cfg.id}-title">
      <div class="container">
        <header class="kh-sec-head" data-kh-reveal>
          <p class="kh-eyebrow">${eyebrow}</p>
          <h2 id="${cfg.id}-title" class="pa-title">${formatPaTitle({ titleHtml })}</h2>
          ${lead ? `<p class="kh-sec-lead">${lead}</p>` : ""}
        </header>
        ${rows}
      </div>
    </section>`;
}

function renderVideos(videos = [], socialLinks = [], collection = {}) {
  const yt = socialLinks.find((s) => s.id === "youtube");
  const items = videos
    .map((v, i) => {
      const wide = i % 3 === 0 ? " kh-media--wide" : "";
      const poster = v.poster || v.image || "";
      const src = v.src || v.videoUrl || "";
      const href = v.href || "";
      const body =
        src && !href
          ? `<video src="${escapeAttr(src)}" controls playsinline preload="metadata" poster="${escapeAttr(
              poster
            )}"></video>`
          : poster
            ? `<img src="${escapeAttr(poster)}" alt="" loading="lazy" data-kh-img>`
            : `<span class="kh-media__blank" aria-hidden="true"></span>`;

      const wrapOpen = href
        ? `<a class="kh-media${wide}" ${linkAttrs(v)} data-kh-item data-kh-type="videos" data-country-id="${
            v.countryId || ""
          }" data-program="${escapeAttr(v.program || "")}" data-kh-text="${searchBlob(
            v
          )}" data-kh-stagger-item style="--i:${i}">`
        : `<figure class="kh-media${wide}" data-kh-item data-kh-type="videos" data-country-id="${
            v.countryId || ""
          }" data-program="${escapeAttr(v.program || "")}" data-kh-text="${searchBlob(
            v
          )}" data-kh-stagger-item style="--i:${i}">`;
      const wrapClose = href ? `</a>` : `</figure>`;

      return `${wrapOpen}
        <span class="kh-media__frame">${body}
          ${src || href ? `<span class="kh-media__play" aria-hidden="true"></span>` : ""}
        </span>
        <span class="kh-media__copy">
          ${v.typeLabel || collection.label ? `<span class="kh-media__type">${v.typeLabel || collection.label}</span>` : ""}
          <strong class="kh-media__title">${v.title || ""}</strong>
          ${v.summary || v.description ? `<span class="kh-media__sum">${v.summary || v.description}</span>` : ""}
        </span>
      ${wrapClose}`;
    })
    .join("");

  return `
    <section class="kh-media-band" id="kh-videos" data-kh-section="videos" aria-labelledby="kh-videos-title">
      <div class="container">
        <header class="kh-sec-head kh-sec-head--on-dark" data-kh-reveal>
          <p class="kh-eyebrow kh-eyebrow--on-dark">${collection.label || "Videos"}</p>
          <h2 id="kh-videos-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>From the</span> <em>field on film.</em>",
          })}</h2>
          ${
            collection.description
              ? `<p class="kh-sec-lead kh-sec-lead--on-dark">${collection.description}</p>`
              : ""
          }
        </header>
        ${
          items
            ? `<div class="kh-media-mosaic" data-kh-stagger>${items}</div>`
            : `<div class="kh-media-blank" data-kh-reveal>
                <p>No videos published here yet — check back soon.</p>
                ${
                  yt
                    ? `<a class="kh-media-blank__link" href="${yt.href}" target="_blank" rel="noopener noreferrer">Watch on ${yt.label} ↗</a>`
                    : ""
                }
              </div>`
        }
      </div>
    </section>`;
}

function renderClosing(hero = {}, featured = []) {
  const links = featured
    .slice(0, 2)
    .map(
      (f) =>
        `<a class="kh-close__link" ${linkAttrs(f)}>${f.cta || f.title} <span aria-hidden="true">→</span></a>`
    )
    .join("");

  return `
    <section class="kh-close" data-kh-section="close" aria-labelledby="kh-close-title">
      <div class="container kh-close__inner" data-kh-reveal>
        <p class="kh-eyebrow kh-eyebrow--on-dark">Knowledge Hub</p>
        <h2 id="kh-close-title" class="pa-title">${formatPaTitle(
          {
            titleHtml: hero.titleHtml || "<span>Knowledge</span> <em>Hub.</em>",
            title: hero.title || "Knowledge Hub",
          },
          "Knowledge Hub."
        )}</h2>
        <p class="kh-close__lead">${
          hero.lead || "PA as a source of knowledge, learning and evidence."
        }</p>
        ${links ? `<div class="kh-close__actions">${links}</div>` : ""}
      </div>
    </section>`;
}

export function renderKnowledgeHubPage(data) {
  const hub = data.knowledgeHub || {};
  const hero = {
    ...(hub.hero || {}),
    titleHtml: hub.hero?.titleHtml || "<span>Knowledge</span> <em>Hub.</em>",
    lead: hub.hero?.lead || "PA as a source of knowledge, learning and evidence.",
    image: hub.hero?.image || "assets/knowledge-hub/hero.jpg",
  };
  const lib = hub.library || {};
  const collections = hub.collections || [];
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const programs = hub.programs || [];
  const bag = collectItems(data);
  const byType = bagByType(bag);
  const counts = Object.fromEntries(
    collections.map((c) => [c.id, (byType[c.id] || []).length])
  );
  const collectionMap = Object.fromEntries(collections.map((c) => [c.id, c]));
  const featured = hub.featuredStories || [];

  return `
    <div class="kh-page" data-resources-hub data-knowledge-hub>
      ${renderHero(hero)}
      ${renderJumpBar(collections, counts)}
      ${renderSearch(lib, collections, countries, programs)}
      ${renderFeatured(featured, data.countries)}
      ${ARCHIVE.map((cfg) =>
        renderArchiveSection(cfg, collectionMap[cfg.key], byType[cfg.type] || [], data.countries)
      ).join("")}
      ${renderVideos(bag.videos, hub.socialLinks || [], collectionMap.videos || {})}
      ${renderClosing(hero, featured)}
    </div>`;
}

let khCleanup = null;

export function mountKnowledgeHubPage() {
  const page = document.querySelector("[data-knowledge-hub]");
  if (!page) return;

  destroyKnowledgeHubPage();
  const cleanups = [];
  cleanups.push(bindFilters(page));
  initMotion(page);
  khCleanup = () => cleanups.forEach((fn) => fn && fn());
}

export function destroyKnowledgeHubPage() {
  if (typeof khCleanup === "function") {
    khCleanup();
    khCleanup = null;
  }
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger?.closest?.("[data-knowledge-hub]")) t.kill();
    });
  }
}

function bindFilters(page) {
  const search = page.querySelector("#kh-search-input");
  const typeSel = page.querySelector("#kh-filter-type");
  const countrySel = page.querySelector("#kh-filter-country");
  const programSel = page.querySelector("#kh-filter-program");
  const applyBtn = page.querySelector("[data-kh-apply]");

  const apply = ({ scrollToResults = false } = {}) => {
    const q = (search?.value || "").trim().toLowerCase();
    const type = typeSel?.value || "all";
    const countryId = countrySel?.value || "all";
    const program = programSel?.value || "all";

    page.querySelectorAll("[data-kh-item]").forEach((row) => {
      const text = row.dataset.khText || "";
      const cardType = row.dataset.khType || "";
      const cardCountry = row.dataset.countryId || "";
      const cardProgram = row.dataset.program || "";
      const matchQ = !q || text.includes(q);
      const matchType = type === "all" || cardType === type;
      const matchCountry = countryId === "all" || !cardCountry || cardCountry === countryId;
      const matchProgram = program === "all" || !cardProgram || cardProgram === program;
      row.style.display = matchQ && matchType && matchCountry && matchProgram ? "" : "none";
    });

    page.querySelectorAll("[data-kh-section]").forEach((section) => {
      if (section.id === "kh-search" || section.dataset.khSection === "hero") return;
      if (section.dataset.khSection === "featured") return;
      if (section.dataset.khSection === "close") return;
      const items = [...section.querySelectorAll("[data-kh-item]")];
      if (!items.length) return;
      const visible = items.some((c) => c.style.display !== "none");
      const empty = section.querySelector(".kh-empty, .kh-media-blank");
      if (empty) empty.style.display = visible ? "none" : "";
      section.classList.toggle("is-empty-filter", !visible);
    });

    if (scrollToResults) {
      const firstItem = [...page.querySelectorAll("[data-kh-item]")].find(
        (el) => el.style.display !== "none"
      );
      const section =
        firstItem?.closest?.("[data-kh-section]") ||
        page.querySelector("[data-kh-section]:not(#kh-search):not(.is-empty-filter)") ||
        page;
      const headerH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      const top = section.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  const onApplyClick = () => apply({ scrollToResults: true });
  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      apply({ scrollToResults: true });
    }
  };
  const onFilterChange = () => apply();

  applyBtn?.addEventListener("click", onApplyClick);
  search?.addEventListener("keydown", onSearchKey);
  typeSel?.addEventListener("change", onFilterChange);
  countrySel?.addEventListener("change", onFilterChange);
  programSel?.addEventListener("change", onFilterChange);

  return () => {
    applyBtn?.removeEventListener("click", onApplyClick);
    search?.removeEventListener("keydown", onSearchKey);
    typeSel?.removeEventListener("change", onFilterChange);
    countrySel?.removeEventListener("change", onFilterChange);
    programSel?.removeEventListener("change", onFilterChange);
  };
}

function initMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page
      .querySelectorAll(
        "[data-kh-reveal], [data-kh-stagger] > *, [data-kh-hero-line], [data-kh-feature]"
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
    return;
  }

  const heroLines = page.querySelectorAll("[data-kh-hero-line]");
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

  const watermark = page.querySelector(".kh-hero__watermark");
  if (watermark) {
    gsap.fromTo(
      watermark,
      { autoAlpha: 0, x: -40 },
      { autoAlpha: 0.12, x: 0, duration: 1, ease: "power2.out", delay: 0.2 }
    );
  }

  const heroImg = page.querySelector("[data-kh-hero-img]");
  if (heroImg && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      heroImg,
      { scale: 1.1 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".kh-hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      }
    );
  }

  page.querySelectorAll("[data-kh-reveal]").forEach((el) => {
    const isFeature = el.hasAttribute("data-kh-feature");
    gsap.fromTo(
      el,
      isFeature ? { autoAlpha: 0, y: 32 } : { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: isFeature ? 0.75 : 0.55,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );

    if (isFeature) {
      const mark = el.querySelector(".kh-feature__mark");
      if (mark) {
        gsap.fromTo(
          mark,
          { clipPath: "inset(10% 12% 10% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          }
        );
      }
    }
  });

  page.querySelectorAll("[data-kh-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, x: -16 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: group, start: "top 88%", once: true },
      }
    );
  });

  page.querySelectorAll("[data-kh-img]").forEach((img) => {
    if (typeof ScrollTrigger === "undefined") return;
    gsap.fromTo(
      img,
      { scale: 1.06 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".kh-media") || img,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
