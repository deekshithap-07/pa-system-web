/**
 * Knowledge Hub — PA as a source of knowledge, learning and evidence.
 * Order: Reports · Research · Case studies · Guides · Training ·
 * Publications · Videos · Search and filters
 * UI: stream / rail (same language as News & Updates).
 */

import { formatPaTitle } from "../../utils/pa-title.js";

const JUMP = [
  { id: "kh-reports", label: "Reports" },
  { id: "kh-research", label: "Research" },
  { id: "kh-case-studies", label: "Case studies" },
  { id: "kh-guides", label: "Guides" },
  { id: "kh-training", label: "Training resources" },
  { id: "kh-publications", label: "Publications" },
  { id: "kh-videos", label: "Videos" },
  { id: "kh-search", label: "Search and filters" },
];

const SKINS = ["maroon", "green", "gold"];

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

function renderHero(hero = {}) {
  const image = hero.image || "assets/field-reports/cover.jpg";
  return `
    <header class="nu-hero" data-kh-section="hero">
      <div class="nu-hero__media" aria-hidden="true">
        <img src="${image}" alt="" fetchpriority="high">
        <span class="nu-hero__veil"></span>
        <span class="nu-hero__grain"></span>
      </div>
      <div class="container nu-hero__layout">
        <div class="nu-hero__inner" data-kh-reveal>
          <p class="nu-eyebrow nu-eyebrow--on-dark">${hero.eyebrow || "Knowledge Hub"}</p>
          <h1 class="pa-title nu-hero__title">${formatPaTitle(
            {
              titleHtml: hero.titleHtml || "<span>Knowledge</span> <em>Hub.</em>",
              title: hero.title || "Knowledge Hub",
            },
            "Knowledge Hub."
          )}</h1>
          <p class="nu-hero__lead">${
            hero.lead || "PA as a source of knowledge, learning and evidence."
          }</p>
        </div>
      </div>
    </header>`;
}

function renderRail() {
  return `
    <div class="nu-rail" data-kh-rail aria-label="Jump to section">
      <div class="container nu-rail__inner">
        ${JUMP.map(
          (j, i) =>
            `<a class="nu-rail__chip${i === 0 ? " is-active" : ""}" href="#${j.id}" data-kh-chip="${j.id}">${j.label}</a>`
        ).join("")}
      </div>
    </div>`;
}

function renderStreamRows(items, type) {
  if (!items.length) {
    return `<p class="nu-empty">No ${type.replace("-", " ")} published here yet — check back soon.</p>`;
  }

  return items
    .map((item, i) => {
      const meta = [item.dateLabel || item.year || item.period, item.program, item.format]
        .filter(Boolean)
        .join(" · ");
      return `
      <a class="nu-stream__row" ${linkAttrs(item)} data-kh-item data-kh-type="${type}" data-country-id="${item.countryId || ""}" data-program="${item.program || ""}" data-kh-text="${searchBlob(item)}" data-kh-stagger-item style="--i:${i}">
        <time class="nu-stream__date">${meta || "—"}</time>
        <span class="nu-stream__pulse" aria-hidden="true"></span>
        <span class="nu-stream__body">
          <strong>${item.title}</strong>
          ${item.summary || item.description ? `<span class="nu-stream__sum">${item.summary || item.description}</span>` : ""}
        </span>
        <span class="nu-stream__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");
}

function renderBand({ id, skin, eyebrow, titleHtml, lead, items, type }) {
  return `
    <section class="nu-band nu-band--skin-${skin}" id="${id}" data-kh-section="${type}" aria-labelledby="${id}-title">
      <div class="container">
        <header class="nu-band__head" data-kh-reveal>
          <p class="nu-eyebrow">${eyebrow}</p>
          <h2 id="${id}-title" class="pa-title">${formatPaTitle({ titleHtml })}</h2>
          ${lead ? `<p class="nu-band__lead">${lead}</p>` : ""}
        </header>
        <div class="nu-stream" data-kh-stagger>${renderStreamRows(items, type)}</div>
      </div>
    </section>`;
}

function renderSearch(lib = {}, collections = [], countries = [], programs = []) {
  const typeOptions = [
    { id: "all", label: lib.filters?.allTypes || "All types" },
    ...collections.map((c) => ({ id: c.id, label: c.label })),
  ]
    .map((t) => `<option value="${t.id}">${t.label}</option>`)
    .join("");

  return `
    <section class="nu-band nu-band--skin-gold kh-search-band" id="kh-search" data-kh-section="search" aria-labelledby="kh-search-title">
      <div class="container">
        <header class="nu-band__head" data-kh-reveal>
          <p class="nu-eyebrow">Search and filters</p>
          <h2 id="kh-search-title" class="pa-title">${formatPaTitle({
            titleHtml: "<span>Find what</span> <em>you need.</em>",
          })}</h2>
          <p class="nu-band__lead">${lib.subtitle || "Search by keyword, then filter by type or country."}</p>
        </header>
        <div class="kh-tools__bar" data-kh-filters data-kh-reveal>
          <label class="kh-tools__search">
            <span class="sr-only">Search</span>
            <input type="search" id="kh-search-input" placeholder="${lib.searchPlaceholder || "Search reports, guides, videos…"}" autocomplete="off">
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
        </div>
        <p class="kh-search-hint" data-kh-reveal>Set filters, then press Show results to jump to matching items.</p>
      </div>
    </section>`;
}

function collectItems(data) {
  const hub = data.knowledgeHub || {};
  const items = hub.items || {};
  const reportsRaw = data.reports?.reports || [];
  const caseStudies = hub.caseStudies || [];

  /* Reports: field reports + impact report content from News */
  const reports = [
    {
      id: "report-impact-2024",
      title: "Annual Impact Report 2024",
      summary: "Network indicators, country progress, and field evidence in one place.",
      year: "2024",
      dateLabel: "15 Apr 2025",
      href: "#/scorecard",
    },
    {
      id: "report-monthly-field",
      title: "Monthly ministry reports",
      summary: "Ongoing field reports from Kenya, Ethiopia, Malawi, and Zambia.",
      year: "2025",
      dateLabel: "Ongoing",
      href: "#/resources/cases",
    },
    ...reportsRaw.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      year: r.period || r.year,
      dateLabel: r.period || r.year,
      countryId: (r.countryIds || [])[0] || "",
      href: "#/resources/cases",
    })),
  ];

  const research = items.research || [];

  const cases = caseStudies.map((cs) => ({
    id: cs.id,
    title: cs.title,
    summary: cs.summary,
    program: cs.program,
    countryId: cs.countryId,
    year: cs.year,
    href: cs.storySlug ? `#/story/${cs.storySlug}` : "#/resources/cases",
  }));

  const guides = items.guides || [];
  const training = items.training || [];
  const publications = [...(items.publications || [])];
  const videos = items.videos || [];

  return { reports, research, cases, guides, training, publications, videos };
}

export function renderKnowledgeHubPage(data) {
  const hub = data.knowledgeHub || {};
  const hero = {
    ...(hub.hero || {}),
    titleHtml: hub.hero?.titleHtml || "<span>Knowledge</span> <em>Hub.</em>",
    lead: hub.hero?.lead || "PA as a source of knowledge, learning and evidence.",
    image: hub.hero?.image || "assets/field-reports/cover.jpg",
  };
  const lib = hub.library || {};
  const collections = hub.collections || [];
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const programs = hub.programs || [];
  const bag = collectItems(data);

  const sections = [
    {
      id: "kh-reports",
      skin: SKINS[0],
      eyebrow: "Reports",
      titleHtml: "<span>Field evidence,</span> <em>written down.</em>",
      lead: "Monthly, quarterly, and annual reports from across the network.",
      items: bag.reports,
      type: "reports",
    },
    {
      id: "kh-research",
      skin: SKINS[1],
      eyebrow: "Research",
      titleHtml: "<span>Evidence beside</span> <em>decisions.</em>",
      lead: "Briefs and analysis that sit next to programme work.",
      items: bag.research,
      type: "research",
    },
    {
      id: "kh-case-studies",
      skin: SKINS[2],
      eyebrow: "Case studies",
      titleHtml: "<span>Outcomes you</span> <em>can follow.</em>",
      lead: "Documented transformation with measurable community impact.",
      items: bag.cases,
      type: "case-studies",
    },
    {
      id: "kh-guides",
      skin: SKINS[0],
      eyebrow: "Guides",
      titleHtml: "<span>Practical how-to</span> <em>for the field.</em>",
      lead: "Short guides for pastors, facilitators, and partners.",
      items: bag.guides,
      type: "guides",
    },
    {
      id: "kh-training",
      skin: SKINS[1],
      eyebrow: "Training resources",
      titleHtml: "<span>Materials for the</span> <em>two-year journey.</em>",
      lead: "Curriculum outlines and stage tools used with pastor cohorts.",
      items: bag.training,
      type: "training",
    },
    {
      id: "kh-publications",
      skin: SKINS[2],
      eyebrow: "Publications",
      titleHtml: "<span>Newsletters and</span> <em>published notes.</em>",
      lead: "Ministry updates shared beyond the field teams.",
      items: bag.publications,
      type: "publications",
    },
    {
      id: "kh-videos",
      skin: SKINS[0],
      eyebrow: "Videos",
      titleHtml: "<span>From the</span> <em>field on film.</em>",
      lead: "Field films and teaching clips from communities.",
      items: bag.videos,
      type: "videos",
    },
  ];

  return `
    <div class="nu-page kh-page" data-resources-hub data-knowledge-hub>
      ${renderHero(hero)}
      ${renderRail()}
      ${sections.map((s) => renderBand(s)).join("")}
      ${renderSearch(lib, collections, countries, programs)}
    </div>`;
}

let khCleanup = null;

export function mountKnowledgeHubPage() {
  const page = document.querySelector("[data-knowledge-hub]");
  if (!page) return;

  destroyKnowledgeHubPage();
  const cleanups = [];
  cleanups.push(initRailSpy(page));
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
      if (section.id === "kh-search") return;
      const items = [...section.querySelectorAll("[data-kh-item]")];
      if (!items.length) return;
      const visible = items.some((c) => c.style.display !== "none");
      const empty = section.querySelector(".nu-empty");
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
        page.querySelector("[data-kh-rail]") ||
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

function initRailSpy(page) {
  const chips = [...page.querySelectorAll("[data-kh-chip]")];
  const sections = JUMP.map((j) => document.getElementById(j.id)).filter(Boolean);
  if (!chips.length || !sections.length) return () => {};

  const setActive = (id) => {
    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.khChip === id));
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

function initMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.querySelectorAll("[data-kh-reveal], [data-kh-stagger-item]").forEach((el) => {
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

  page.querySelectorAll("[data-kh-reveal]").forEach((el) => {
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

  page.querySelectorAll("[data-kh-stagger]").forEach((group) => {
    const kids = group.querySelectorAll("[data-kh-stagger-item]");
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, x: -14 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
        clearProps: "transform",
      }
    );
  });

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
