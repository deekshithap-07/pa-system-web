import { getCountryName, downloadJson, buildInsightPack } from "../utils/hub-filters.js";
import { initResourcesAnimations } from "../components/resources-animations.js";

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
        `<a href="${link.href}" class="res-social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.label}">${SOCIAL_ICONS[link.id] || link.label}</a>`
    )
    .join("");
}

export function renderResources(data) {
  const hub = data.knowledgeHub || {};
  const reports = data.reports?.reports || [];
  const caseStudies = hub.caseStudies || [];
  const insightPacks = hub.insightPacks || [];
  const programs = hub.programs || [];
  const countries = data.countries?.countries?.filter((c) => c.isPaNetwork) || [];
  const categories = hub.categories || [];
  const focusAreas = hub.focusAreas || [];
  const socialLinks = hub.socialLinks || [];

  const totalCommunities = countries.reduce((s, c) => s + (c.summary?.communities || c.communities || 0), 0);
  const totalPastors = countries.reduce((s, c) => s + (c.summary?.pastors || c.pastors || 0), 0);

  return `
    <div class="resources-page" data-resources-hub>
      <section class="res-hero">
        <div class="container">
          <p class="res-hero__eyebrow" data-res-reveal>Knowledge &amp; Resource Hub</p>
          <h1 class="res-hero__title" data-res-reveal>Resources</h1>
          <p class="res-hero__lead" data-res-reveal>
            Reports, case studies, and programme materials — the narrative layer behind the metrics. Start here if you want to understand transformation before exploring data.
          </p>
        </div>
      </section>

      <section class="res-focus-banner" data-res-scroll>
        <div class="container res-focus-banner__inner">
          <p class="res-focus-banner__label">Explore resource focus areas</p>
          <ul class="res-focus-banner__links">
            ${focusAreas
              .map((a) => `<li><a href="${a.href}" class="res-focus-link" data-anchor>${a.label}</a></li>`)
              .join("")}
          </ul>
        </div>
      </section>

      <section class="res-stats" data-res-scroll>
        <div class="container">
          <p class="res-stats__eyebrow">By the numbers</p>
          <h2 class="res-stats__title">Transformation intelligence at a glance</h2>
          <div class="res-stats__grid">
            <div class="res-stat"><strong>${reports.length}</strong><span>Published reports</span></div>
            <div class="res-stat"><strong>${caseStudies.length}</strong><span>Case studies</span></div>
            <div class="res-stat"><strong>${totalCommunities}</strong><span>Communities tracked</span></div>
            <div class="res-stat"><strong>${totalPastors.toLocaleString()}</strong><span>Pastors in network</span></div>
          </div>
        </div>
      </section>

      <section class="res-context" data-res-scroll>
        <div class="container res-context__grid">
          <div class="res-context__block">
            <h3>Context</h3>
            <p>Possibilities Africa coordinates pastor-led holistic transformation across seven nations. From leadership development to economic productivity, communities mobilise local resources while the platform tracks progress toward measurable outcomes.</p>
          </div>
          <div class="res-context__block">
            <h3>Our approach</h3>
            <p>We monitor and share knowledge that helps countries identify impactful solutions — cutting-edge data, field reports, and structured insight packs guide policy and programme decisions across the network.</p>
          </div>
        </div>
      </section>

      <div class="container res-body">
        <div class="res-toolbar" data-res-scroll>
          <div class="res-toolbar__filters hub-filters" data-hub-filters>
            <label>Country
              <select id="hub-filter-country" aria-label="Filter by country">
                <option value="all">All countries</option>
                ${countries.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </label>
            <label>Programme
              <select id="hub-filter-program" aria-label="Filter by programme">
                <option value="all">All programmes</option>
                ${programs.map((p) => `<option value="${p}">${p}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>

        <section class="res-categories" id="res-categories" data-res-scroll>
          <h2 class="res-section-head__title res-section-head__title--sm">Resource categories</h2>
          <div class="res-cat-strip">
            ${categories
              .map(
                (c) => `<a href="#res-${c.id === "case-studies" ? "case-studies" : c.id === "insights" ? "packs" : c.id === "programmes" ? "categories" : "catalog"}" class="res-cat-pill" data-anchor>
                  <span class="res-cat-pill__icon">${c.icon}</span>
                  <span class="res-cat-pill__text"><strong>${c.title}</strong><small>${c.description}</small></span>
                </a>`
              )
              .join("")}
          </div>
        </section>

        <section class="res-catalog" id="res-catalog" data-res-scroll>
          <header class="res-section-head res-section-head--stack">
            <h2 class="res-section-head__title res-section-head__title--sm">All reports</h2>
            <p class="res-section-head__desc">Monthly, quarterly, and annual ministry reports from across the PA network.</p>
          </header>
          <div class="res-catalog-list" data-filterable="reports">
            ${reports
              .map(
                (r, i) => `<article class="res-catalog-item" data-country-ids="${(r.countryIds || []).join(",")}" data-program="${r.program || ""}">
                  <a href="#" class="res-catalog-item__cover" aria-hidden="true">${renderCover(i === 0 ? "annual" : "report", r.type)}</a>
                  <div class="res-catalog-item__body">
                    <span class="res-catalog-item__type">${r.type}</span>
                    <h3>${r.title}</h3>
                    <p>${r.summary}</p>
                    <div class="res-catalog-item__actions">
                      <button type="button" class="res-link-cta" data-download-report="${r.id}">Download summary</button>
                      <span class="res-catalog-item__period">${r.period || ""}</span>
                    </div>
                  </div>
                </article>`
              )
              .join("")}
          </div>
        </section>

        <section class="res-case-studies" id="res-case-studies" data-res-scroll>
          <header class="res-section-head res-section-head--stack">
            <h2 class="res-section-head__title res-section-head__title--sm">Case studies</h2>
            <p class="res-section-head__desc">Documented transformation outcomes with measurable community impact.</p>
          </header>
          <div class="res-case-grid" data-filterable="case-studies">
            ${caseStudies
              .map((cs) => {
                const country = countries.find((c) => c.id === cs.countryId);
                const catchment = (data.catchments?.catchments || []).find((c) => c.id === cs.catchmentId);
                const countryHref = country ? `#/country/${country.slug}` : null;
                const catchmentHref =
                  country && catchment ? `#/catchment/${country.slug}/${catchment.slug}` : null;
                return `<article class="res-case-card" data-country-id="${cs.countryId || ""}" data-program="${cs.program || ""}">
                  <div class="res-case-card__visual">${renderCover("case", "CASE STUDY")}</div>
                  <div class="res-case-card__body">
                    <span class="res-case-card__program">${cs.program}</span>
                    <h3>${cs.title}</h3>
                    <p>${cs.summary}</p>
                    <ul class="res-case-card__outcomes">${(cs.outcomes || []).map((o) => `<li>${o}</li>`).join("")}</ul>
                    <span class="res-case-card__meta">${getCountryName(data.countries, cs.countryId)}</span>
                    <div class="res-case-card__actions">
                      ${countryHref ? `<a href="${countryHref}" data-link>View country hub</a>` : ""}
                      ${catchmentHref ? `<a href="${catchmentHref}" data-link>View catchment</a>` : ""}
                      <a href="#/insights" data-link>See related data</a>
                    </div>
                  </div>
                </article>`;
              })
              .join("")}
          </div>
        </section>

        <section class="res-packs" id="res-packs" data-res-scroll>
          <header class="res-section-head res-section-head--stack">
            <h2 class="res-section-head__title res-section-head__title--sm">Structured insight packs</h2>
            <p class="res-section-head__desc">Downloadable analysis packs with trends, comparisons, and performance data.</p>
          </header>
          <div class="res-pack-grid">
            ${insightPacks
              .map(
                (p) => `<article class="res-pack-card">
                  <div class="res-pack-card__icon">${renderCover("pack", "DATA")}</div>
                  <div class="res-pack-card__body">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="res-pack-card__topics">${(p.topics || []).map((t) => `<span class="res-tag">${t}</span>`).join("")}</div>
                    <button type="button" class="res-btn-pill res-btn-pill--sm" data-download-pack="${p.id}">Download ${p.format} (${p.size})</button>
                    <a href="#/insights" class="res-pack-card__data-link" data-link>Explore live data &rarr;</a>
                  </div>
                </article>`
              )
              .join("")}
          </div>
        </section>

        <section class="res-connect" data-res-scroll>
          <div class="res-connect__inner">
            <h2>Connect with us</h2>
            <p>Follow Possibilities Africa for field stories, ministry updates, and transformation news.</p>
            <div class="res-connect__social" aria-label="Possibilities Africa social media">
              ${renderSocialLinks(socialLinks)}
            </div>
          </div>
        </section>

        <p class="res-note">Full PDF reports will connect to the community tracking system. Current downloads export structured JSON for demonstration.</p>
      </div>
    </div>`;
}

export function mountResources(data) {
  const root = document.querySelector("[data-resources-hub]");
  if (!root) return;

  requestAnimationFrame(() => {
    initResourcesAnimations();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });

  root.querySelectorAll("[data-anchor]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href?.startsWith("#") && href.length > 1) {
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

    root.querySelectorAll("[data-filterable] .res-catalog-item, [data-filterable] .res-case-card").forEach((card) => {
      const ids = (card.dataset.countryIds || card.dataset.countryId || "").split(",").filter(Boolean);
      const cardProgram = card.dataset.program || "";
      const countryMatch = countryId === "all" || ids.includes(countryId);
      const programMatch = program === "all" || !cardProgram || cardProgram === program;
      card.style.display = countryMatch && programMatch ? "" : "none";
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
}
