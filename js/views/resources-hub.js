import { getCountryName, downloadJson, buildInsightPack } from "../utils/hub-filters.js";
import { initResourcesAnimations } from "../components/resources-animations.js";
import { renderWbPageHero, renderPageBack, bindWbPageHero } from "../components/shared/wb-page-hero.js";
import { renderFieldReports, mountFieldReports } from "./field-reports.js";
import {
  renderKnowledgeHubPage,
  mountKnowledgeHubPage,
  destroyKnowledgeHubPage,
} from "../components/resources/knowledge-hub-page.js";

const COVER_STYLES = {
  annual: "res-cover--annual",
  kwale: "res-cover--kwale",
  report: "res-cover--report",
  case: "res-cover--case",
  pack: "res-cover--pack",
};

function renderCover(coverKey, label) {
  const cls = COVER_STYLES[coverKey] || COVER_STYLES.report;
  return `<div class="res-cover ${cls}" aria-hidden="true"><span class="res-cover__label">${label}</span></div>`;
}

const SOCIAL_ICONS = {
  facebook:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.75c0-.69.56-1.25 1.25-1.25H16.5V3h-2.08C12.02 3 11 4.24 11 5.92V8.5H9v2.75h2V21h3v-9.75h2.55l.45-2.75H14z"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21l-6.53 7.46L22 22h-6.828l-4.77-6.24L4.8 22H2.04l7.02-8.02L2 2h6.914l4.31 5.69L18.244 2Zm-2.39 18h1.66L7.24 4H5.48l10.374 16Z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.58 7.2a2.75 2.75 0 0 0-1.94-1.95C18.25 5 12 5 12 5s-6.25 0-7.64.25A2.75 2.75 0 0 0 2.42 7.2 28.9 28.9 0 0 0 2 12a28.9 28.9 0 0 0 .42 4.8 2.75 2.75 0 0 0 1.94 1.95C5.75 19 12 19 12 19s6.25 0 7.64-.25a2.75 2.75 0 0 0 1.94-1.95A28.9 28.9 0 0 0 22 12a28.9 28.9 0 0 0-.42-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.25A4.75 4.75 0 1 1 7.25 13 4.75 4.75 0 0 1 12 8.25Zm0 2A2.75 2.75 0 1 0 14.75 13 2.75 2.75 0 0 0 12 10.25ZM17.5 6.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"/></svg>',
};

function renderSocialLinks(links = []) {
  return links
    .map(
      (link) =>
        `<a href="${link.href}" class="rlib__social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.label}">${SOCIAL_ICONS[link.id] || link.label}</a>`
    )
    .join("");
}

function renderResourceLibrary(data, hub, caseStudies, insightPacks, programs, countries, socialLinks, mode = "all") {
  const lib = hub.library || {};
  const sections = lib.sections || [];
  const filters = lib.filters || {};

  const isChild = mode === "cases" || mode === "packs";

  const caseCards = caseStudies
    .map((cs) => {
      const country = countries.find((c) => c.id === cs.countryId);
      const catchment = (data.catchments?.catchments || []).find((c) => c.id === cs.catchmentId);
      const placeHref =
        country && catchment
          ? `#/catchment/${country.slug}/${catchment.slug}`
          : country
            ? `#/country/${country.slug}`
            : "#/scorecard";
      const placeLabel = catchment ? "Open community" : country ? "Open country" : "Our results";
      const storyHref = cs.storySlug ? `#/story/${cs.storySlug}` : null;
      const outcomesList = cs.outcomes?.length
        ? `<ul class="rlib-case__outcomes">${cs.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul>`
        : "";
      return `<article class="rlib-case${isChild ? " rlib-case--brief" : ""}" data-rlib-item data-filterable="case-studies" data-country-id="${cs.countryId || ""}" data-program="${cs.program || ""}" data-rlib-reveal>
        <span class="rlib-case__tag">${cs.program}</span>
        <h3 class="rlib-case__title">${cs.title}</h3>
        <p class="rlib-case__summary">${cs.summary}</p>
        ${outcomesList}
        <footer class="rlib-case__foot">
          <span class="rlib-case__meta">${getCountryName(data.countries, cs.countryId)}</span>
          <div class="rlib-case__links">
            ${storyHref ? `<a href="${storyHref}" class="rlib-case__link rlib-case__link--primary" data-link>Read story →</a>` : ""}
            <a href="${placeHref}" class="rlib-case__link" data-link>${placeLabel} →</a>
          </div>
        </footer>
      </article>`;
    })
    .join("");

  const packCards = insightPacks
    .map(
      (p) => `<article class="rlib-pack" data-rlib-item data-rlib-reveal>
        <div class="rlib-pack__icon" aria-hidden="true">📦</div>
        <div class="rlib-pack__body">
          <h3 class="rlib-pack__title">${p.title}</h3>
          <p class="rlib-pack__desc">${p.description}</p>
          <div class="rlib-pack__actions">
            <button type="button" class="rlib-pack__btn" data-download-pack="${p.id}">${p.format} · ${p.size}</button>
            <a href="#/scorecard" class="rlib-pack__link" data-link>Our results →</a>
          </div>
        </div>
      </article>`
    )
    .join("");

  return `
    <div class="atlas-library">
      <div class="rlib${isChild ? " rlib--child" : ""}" data-resource-library id="res-catalog">
        <div class="container rlib__inner">
          ${!isChild
            ? `<header class="rlib__head" data-rlib-scroll>
            <p class="rlib__eyebrow" data-rlib-reveal>Stories &amp; reports</p>
            <h2 class="rlib__title" data-rlib-reveal>${lib.title || "Resource library"}</h2>
            <p class="rlib__subtitle" data-rlib-reveal>${lib.subtitle || ""}</p>
          </header>`
            : ""}

          ${mode === "all"
            ? `<nav class="rlib__nav" aria-label="Library sections" data-rlib-scroll>
            ${sections
              .map(
                (s, i) => `<a href="#/resources/${s.id === "packs" ? "packs" : "cases"}" class="rlib__nav-link${i === 0 ? " is-active" : ""}" data-link data-rlib-reveal>${s.label}</a>`
              )
              .join("")}
          </nav>`
            : ""}

          ${mode !== "packs"
            ? `<div class="rlib__filters" data-rlib-scroll data-hub-filters>
            <label class="rlib__filter">
              <span>${filters.countryLabel || "Country"}</span>
              <select id="hub-filter-country" aria-label="Filter by country">
                <option value="all">${filters.allCountries || "All countries"}</option>
                ${countries.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </label>
            <label class="rlib__filter">
              <span>${filters.programLabel || "Programme"}</span>
              <select id="hub-filter-program" aria-label="Filter by programme">
                <option value="all">${filters.allPrograms || "All programmes"}</option>
                ${programs.map((p) => `<option value="${p}">${p}</option>`).join("")}
              </select>
            </label>
          </div>
          <section class="rlib__section" id="res-case-studies" data-rlib-section="case-studies" data-rlib-scroll>
            ${!isChild ? `<h3 class="rlib__section-title" data-rlib-reveal>Case studies</h3>` : `<p class="rlib__intro" data-rlib-reveal>Filter by country or programme, then open the story or the place where the work continues.</p>`}
            <div class="rlib-case-grid${isChild ? " rlib-case-grid--brief" : ""}" data-filterable="case-studies">${caseCards}</div>
          </section>`
            : ""}

          ${mode !== "cases"
            ? `<section class="rlib__section" id="res-packs" data-rlib-section="packs" data-rlib-scroll>
            ${!isChild ? `<h3 class="rlib__section-title" data-rlib-reveal>Insight packs</h3>` : `<p class="rlib__intro" data-rlib-reveal>Download short data packs. They sit next to the stories — they do not replace them.</p>`}
            <div class="rlib-pack-list">${packCards}</div>
          </section>`
            : ""}

          ${!isChild
            ? `<section class="rlib__connect" data-rlib-scroll>
            <div class="rlib__connect-inner" data-rlib-reveal>
              <h3>${lib.connect?.title || "Connect with us"}</h3>
              <p>${lib.connect?.description || ""}</p>
              <div class="rlib__social" aria-label="Possibilities Africa social media">${renderSocialLinks(socialLinks)}</div>
            </div>
          </section>

          <p class="rlib__note" data-rlib-reveal>${lib.footerNote || ""}</p>`
            : `<p class="rlib__child-note" data-rlib-reveal>${
                mode === "cases"
                  ? `<a href="#/resources/packs" data-link>Insight packs</a>`
                  : `<a href="#/resources/cases" data-link>Case studies</a>`
              } · <a href="#/resources" data-link>All stories &amp; reports</a></p>`}
        </div>
      </div>
    </div>`;
}

function renderAtlasStoryCard(story, accent) {
  return `
    <article class="atlas-story-card" data-atlas-reveal>
      <h3 class="atlas-story-card__title">${story.title}</h3>
      <p class="atlas-story-card__summary">${story.summary}</p>
      ${story.outcomes?.length ? `<ul class="atlas-story-card__outcomes">${story.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul>` : ""}
      <div class="atlas-story-card__foot">
        ${story.meta ? `<span class="atlas-story-card__meta">${story.meta}</span>` : ""}
        ${story.href ? `<a href="${story.href}" class="atlas-story-card__link" data-link style="--atlas-accent:${accent}">Read story ›</a>` : ""}
      </div>
    </article>`;
}

function storiesForTheme(themeId, caseStudies, reports, insightPacks, countries, data) {
  const stories = [];

  if (themeId === "leadership") {
    const cs = caseStudies.find((c) => c.program === "Transformational Leadership");
    if (cs) {
      const country = countries.find((c) => c.id === cs.countryId);
      stories.push({
        ...cs,
        meta: getCountryName(data.countries, cs.countryId),
        href: country ? `#/country/${country.slug}` : "#/resources/cases",
      });
    }
    const report = reports.find((r) => r.type === "quarterly");
    if (report) {
      stories.push({
        title: report.title,
        summary: report.summary,
        meta: report.period,
        href: "#/scorecard",
      });
    }
  }

  if (themeId === "communities") {
    caseStudies
      .filter((c) => c.program !== "Transformational Leadership")
      .slice(0, 2)
      .forEach((cs) => {
        const country = countries.find((c) => c.id === cs.countryId);
        stories.push({
          ...cs,
          meta: getCountryName(data.countries, cs.countryId),
          href: country ? `#/country/${country.slug}` : "#/resources/cases",
        });
      });
  }

  if (themeId === "prosperity") {
    const cs = caseStudies.find((c) => c.program === "Economic Productivity");
    if (cs) {
      const country = countries.find((c) => c.id === cs.countryId);
      stories.push({
        ...cs,
        meta: getCountryName(data.countries, cs.countryId),
        href: country ? `#/country/${country.slug}` : "#/resources/cases",
      });
    }
    stories.push({
      title: "Household income growth",
      summary: "Network-wide trends in economic productivity and cooperative models across Malawi and Kenya.",
      meta: "Our results · Prosperity",
      href: "#/scorecard/working",
    });
  }

  if (themeId === "water") {
    const cs = caseStudies.find((c) => c.id === "cs-kwale-water");
    if (cs) {
      stories.push({
        ...cs,
        meta: "Kenya · Kwale South",
        href: "#/catchment/kenya/kwale-south",
      });
    }
    stories.push({
      title: "Water infrastructure outcomes",
      summary: "Trench dam and borehole programmes driving strongest sector outcomes across coastal catchments.",
      meta: "Water sector · +22%",
      href: "#/scorecard/working",
    });
  }

  if (themeId === "data") {
    insightPacks.slice(0, 2).forEach((p) => {
      stories.push({
        title: p.title,
        summary: p.description,
        meta: `${p.format} · ${p.size}`,
        href: "#/resources/packs",
      });
    });
  }

  return stories.slice(0, 2);
}

function renderThemeSection(theme, caseStudies, reports, insightPacks, countries, data) {
  const stories = storiesForTheme(theme.id, caseStudies, reports, insightPacks, countries, data);
  const exploreHref =
    theme.id === "data"
      ? "#/resources/packs"
      : "#/resources/cases";

  return `
    <section
      class="atlas-theme"
      id="atlas-theme-${theme.id}"
      data-atlas-theme="${theme.id}"
      data-atlas-scroll
      style="--atlas-accent: ${theme.accent}; --atlas-bg: ${theme.bg}"
    >
      <div class="container atlas-theme__inner">
        <div class="atlas-theme__stat-col" data-atlas-reveal>
          <p class="atlas-theme__label">Stories on <strong>${theme.label}</strong></p>
          <div class="atlas-theme__stat">
            <span class="atlas-theme__stat-num" data-atlas-count="${theme.stat.headline}">${theme.stat.headline}</span>
            <p class="atlas-theme__stat-context">${theme.stat.context}</p>
          </div>
          <p class="atlas-theme__intro">${theme.intro}</p>
        </div>
        <div class="atlas-theme__stories">
          ${stories.map((s) => renderAtlasStoryCard(s, theme.accent)).join("")}
        </div>
        <a href="${exploreHref}" class="atlas-theme__explore" data-link data-atlas-reveal>
          Explore more on ${theme.label} →
        </a>
      </div>
    </section>`;
}

function itemLinkAttrs(item = {}) {
  const href = item.href || "#";
  if (item.external || href.startsWith("http")) {
    return `href="${href}" target="_blank" rel="noopener noreferrer"`;
  }
  if (href.startsWith("#/")) return `href="${href}" data-link`;
  return `href="${href}"`;
}

export function renderResources(data, section = "overview") {
  const hub = data.knowledgeHub || {};
  const caseStudies = hub.caseStudies || [];
  const insightPacks = hub.insightPacks || [];
  const programs = hub.programs || [];
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const socialLinks = hub.socialLinks || [];
  const page = section === "cases" || section === "packs" ? section : "overview";

  if (page === "cases") {
    return renderFieldReports(data);
  }

  if (page === "packs") {
    return `
    <div class="atlas-page story-resources topic-page--packs" data-resources-hub>
      ${renderPageBack({ href: "#/resources", label: "Knowledge Hub" })}
      ${renderWbPageHero({
        id: "resources-hero",
        tone: "gold",
        skin: "ink",
        crumbs: [
          { label: "Home", href: "#/" },
          { label: "Knowledge Hub", href: "#/resources" },
          { label: "Insight packs" },
        ],
        eyebrow: "Knowledge Hub",
        title: "Insight packs",
        lead: "Short packs you can download. They sit next to the stories — they do not replace them.",
      })}
      ${renderResourceLibrary(data, hub, caseStudies, insightPacks, programs, countries, socialLinks, "packs")}
    </div>`;
  }

  return renderKnowledgeHubPage(data);
}

export function mountResources(data) {
  const fieldReportsRoot = document.querySelector("[data-field-reports]");
  if (fieldReportsRoot) {
    mountFieldReports();
    return;
  }

  const root = document.querySelector("[data-resources-hub]");
  if (!root) return;

  if (root.hasAttribute("data-knowledge-hub")) {
    mountKnowledgeHubPage();
    return;
  }

  requestAnimationFrame(() => {
    bindWbPageHero(root);
    initResourcesAnimations();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });

  root.querySelectorAll("[data-anchor]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href?.startsWith("#") && href.length > 1 && !href.startsWith("#/")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  const countrySel = root.querySelector("#hub-filter-country");
  const programSel = root.querySelector("#hub-filter-program");

  const applyFilters = () => {
    const countryId = countrySel?.value || "all";
    const program = programSel?.value || "all";

    root.querySelectorAll("[data-filterable] [data-rlib-item]").forEach((card) => {
      const ids = (card.dataset.countryIds || card.dataset.countryId || "").split(",").filter(Boolean);
      const cardProgram = card.dataset.program || "";
      const countryMatch = countryId === "all" || ids.includes(countryId);
      const programMatch = program === "all" || !cardProgram || cardProgram === program;
      const show = countryMatch && programMatch;
      card.classList.toggle("is-filtered-out", !show);
      card.style.display = show ? "" : "none";
    });
  };

  countrySel?.addEventListener("change", applyFilters);
  programSel?.addEventListener("change", applyFilters);

  root.querySelectorAll("[data-download-pack]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pack = buildInsightPack(btn.dataset.downloadPack, data);
      downloadJson(`${btn.dataset.downloadPack}.json`, pack);
    });
  });

  root.querySelectorAll("[data-download-report]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const report = data.reports?.reports?.find((r) => r.id === btn.dataset.downloadReport);
      if (report) downloadJson(`${report.slug}.json`, report);
    });
  });

  initLibraryInteractions(root);
}

export function destroyResources() {
  destroyKnowledgeHubPage();
}

function initLibraryInteractions(root) {
  root.querySelectorAll(".rlib-pub").forEach((row) => {
    row.addEventListener("mouseenter", () => row.classList.add("is-hovered"));
    row.addEventListener("mouseleave", () => row.classList.remove("is-hovered"));
  });
}
