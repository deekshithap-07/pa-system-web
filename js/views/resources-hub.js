import { getCountryName, downloadJson, buildInsightPack } from "../utils/hub-filters.js";
import { initResourcesAnimations } from "../components/resources-animations.js";
import { renderWbPageHero, renderPageBack, bindWbPageHero } from "../components/shared/wb-page-hero.js";
import {
  renderKnowledgeHubPage,
  mountKnowledgeHubPage,
  destroyKnowledgeHubPage,
} from "../components/resources/knowledge-hub-page.js";

function renderResourceLibrary(insightPacks) {
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
      <div class="rlib rlib--child" data-resource-library id="res-catalog">
        <div class="container rlib__inner">
          <section class="rlib__section" id="res-packs" data-rlib-section="packs" data-rlib-scroll>
            <p class="rlib__intro" data-rlib-reveal>Download short data packs. They sit next to the stories — they do not replace them.</p>
            <div class="rlib-pack-list">${packCards}</div>
          </section>
          <p class="rlib__child-note" data-rlib-reveal>
            Looking for ministry updates? <a href="#/field-reports" data-link>Open Field Reports</a>
            · <a href="#/resources" data-link>Knowledge Hub</a>
          </p>
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
        href: country ? `#/country/${country.slug}` : "#/field-reports",
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
          href: country ? `#/country/${country.slug}` : "#/field-reports",
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
        href: country ? `#/country/${country.slug}` : "#/field-reports",
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
      : "#/field-reports";

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
  const insightPacks = hub.insightPacks || [];
  const page = section === "packs" ? section : "overview";

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
      ${renderResourceLibrary(insightPacks)}
    </div>`;
  }

  return renderKnowledgeHubPage(data);
}

export function mountResources(data) {
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
