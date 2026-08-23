import { formatNumber } from "../utils/format.js";
import {
  renderWbPageHero,
  renderPageBack,
  bindWbPageHero,
} from "../components/shared/wb-page-hero.js";
const CHILD_THEMES = {
  journey: { tone: "gold", skin: "essay" },
  leadership: { tone: "dusk", skin: "article" },
  projects: { tone: "teal", skin: "report" },
};

function crumbs(extraLabel) {
  return [
    { label: "Home", href: "#/" },
    { label: "What we do", href: "#/work" },
    ...(extraLabel ? [{ label: extraLabel }] : []),
  ];
}

function childShell({ title, lead, section, body }) {
  const theme = CHILD_THEMES[section] || { tone: "navy", skin: "who" };
  return `
    <div class="wb-work-page topic-page topic-page--${section}" data-what-we-do data-work-section="${section}">
      ${renderPageBack({ href: "#/work", label: "What we do" })}
      ${renderWbPageHero({
        id: "work-hero",
        tone: theme.tone,
        skin: theme.skin,
        crumbs: crumbs(title),
        eyebrow: "What we do",
        title,
        lead,
      })}
      ${body}
    </div>`;
}

function kpiText(k) {
  if (k.text) return k.text;
  if (typeof k.value === "number") return formatNumber(k.value);
  return String(k.value ?? "");
}

function renderHubOverview(data) {
  const sc = data.scorecard || {};
  const kpis = (sc.kpis || []).slice(0, 4);
  const insights = (sc.insights || []).slice(0, 3);
  const reports = (sc.reports || []).slice(0, 3);
  const hub = data.knowledgeHub || {};
  const featured = (hub.featuredStories || []).slice(0, 3);

  const kpiStrip = kpis
    .map(
      (k) => `<div class="wb-hub-kpi">
        <strong>${kpiText(k)}</strong>
        <span>${k.label}</span>
      </div>`
    )
    .join("");

  const resultCards = insights
    .map(
      (ins, i) => `<a href="#/scorecard/working" class="wb-hub-story wb-hub-story--${i}" data-link>
        <span class="wb-hub-story__tag">${ins.trend || "Result"}</span>
        <strong>${ins.title}</strong>
        <p>${ins.summary}</p>
        <span class="wb-hub-story__meta">${ins.metric || ""}</span>
      </a>`
    )
    .join("");

  const serviceCards = [
    {
      href: "#/work/journey",
      code: "01",
      title: "The two-year journey",
      text: "Five stages from awareness to multiplication, walked with local pastors.",
    },
    {
      href: "#/work/leadership",
      code: "02",
      title: "Leadership growth",
      text: "Awareness, ability, and action — how pastors grow through the journey.",
    },
    {
      href: "#/work/projects",
      code: "03",
      title: "Community projects",
      text: "Pastor-planned and church-led work: water, farming, health, and livelihoods.",
    },
  ]
    .map(
      (s) => `<a href="${s.href}" class="wb-hub-service" data-link>
        <span class="wb-hub-service__code">${s.code}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <span class="wb-hub-service__cta">Open →</span>
      </a>`
    )
    .join("");

  const knowledgeCards = (featured.length
    ? featured.map(
        (f) => `<a href="${f.href?.startsWith("#/scorecard#") ? "#/scorecard" : f.href || "#/resources"}" class="wb-hub-pub" data-link>
          <span>Featured</span>
          <h3>${f.title}</h3>
          <p>${f.description || f.subtitle || ""}</p>
          <em>${f.cta || "Read"} →</em>
        </a>`
      )
    : reports.map(
        (r) => `<a href="${r.href || "#/resources"}" class="wb-hub-pub" data-link>
          <span>${r.type || "Report"}</span>
          <h3>${r.title}</h3>
          <p>${r.summary}</p>
          <em>Open →</em>
        </a>`
      )
  ).join("");

  return `
    <div class="wb-work-page wb-work-page--hub" data-what-we-do data-work-section="overview">
      ${renderWbPageHero({
        id: "work-hero",
        tone: "navy",
        skin: "ink",
        crumbs: [{ label: "Home", href: "#/" }, { label: "What we do" }],
        eyebrow: "What we do",
        title: "What we do",
        lead: "Pastor-led work across Africa — organised places, a clear journey, results you can follow, and stories from the field.",
        actions: [
          { label: "Browse where we work", href: "#/africa" },
          { label: "See our results", href: "#/scorecard", primary: false },
        ],
      })}

      <section class="wb-hub-band wb-hub-band--results" aria-labelledby="wb-hub-results-title">
        <div class="container">
          <div class="wb-hub-band__head wb-hub-band__head--split">
            <div>
              <p class="wb-hub-band__eyebrow">Results</p>
              <h2 id="wb-hub-results-title">${sc.meta?.title || "Our results"}</h2>
              <p class="wb-hub-band__lead">${sc.overview?.description || sc.meta?.subtitle || "Simple numbers from seven countries — communities, homes, projects, and leadership."}</p>
            </div>
            <a href="#/scorecard" class="wb-hub-band__cta" data-link>See all results →</a>
          </div>
          ${
            kpiStrip
              ? `<div class="wb-hub-kpis" aria-label="Network snapshot">${kpiStrip}</div>`
              : ""
          }
          ${
            resultCards
              ? `<div class="wb-hub-stories">${resultCards}</div>`
              : ""
          }
          <ul class="wb-hub-result-links">
            <li><a href="#/scorecard/working" data-link>What’s working</a></li>
            <li><a href="#/scorecard/together" data-link>What is changing</a></li>
          </ul>
        </div>
      </section>

      <section class="wb-hub-band wb-hub-band--services" aria-labelledby="wb-hub-services-title">
        <div class="container">
          <div class="wb-hub-band__head">
            <p class="wb-hub-band__eyebrow">The work</p>
            <h2 id="wb-hub-services-title">Open a part of the ministry</h2>
            <p class="wb-hub-band__lead">Each topic is its own page — a short explanation, then a way back here.</p>
          </div>
          <div class="wb-hub-services">${serviceCards}</div>
        </div>
      </section>

      <section class="wb-hub-band wb-hub-band--knowledge" aria-labelledby="wb-hub-knowledge-title">
        <div class="container">
          <div class="wb-hub-band__head wb-hub-band__head--split">
            <div>
              <p class="wb-hub-band__eyebrow">Stories &amp; reports</p>
              <h2 id="wb-hub-knowledge-title">From the field</h2>
              <p class="wb-hub-band__lead">Case studies, insight packs, and reports that sit beside the figures.</p>
            </div>
            <a href="#/resources" class="wb-hub-band__cta wb-hub-band__cta--dark" data-link>Open library →</a>
          </div>
          <div class="wb-hub-pubs">${knowledgeCards}</div>
          <div class="wb-hub-know-links">
            <a href="#/resources/cases" data-link>
              <strong>Case studies</strong>
              <span>What happened in a place</span>
            </a>
            <a href="#/resources/packs" data-link>
              <strong>Insight packs</strong>
              <span>Short downloads next to the stories</span>
            </a>
            <a href="#/stories" data-link>
              <strong>Stories by country</strong>
              <span>People and progress, country by country</span>
            </a>
          </div>
        </div>
      </section>
    </div>`;
}

function renderJourney(model) {
  const stages = model.journey?.stages || [];
  const rows = stages
    .map(
      (s, i) => `<article class="wb-work-row">
        <span class="wb-work-row__n">${i + 1}</span>
        <div>
          <strong>${s.label}</strong>
          <em>Month ${s.month}</em>
          <p>${s.description}</p>
        </div>
      </article>`
    )
    .join("");

  return childShell({
    section: "journey",
    title: "The two-year journey",
    lead: "Every community walks a clear path with pastors.",
    body: `
      <section class="wb-work-body">
        <div class="container">
          <div class="wb-work-rows">${rows}</div>
          <p class="wb-work-next"><a href="#/scorecard" data-link>See our results →</a></p>
        </div>
      </section>`,
  });
}

function renderLeadership(model) {
  const dims = model.tripleA?.dimensions || [];
  const cards = dims
    .map(
      (d) => `<article class="wb-work-card">
        <span>${d.label.charAt(0)}</span>
        <h3>${d.label}</h3>
        <p>${d.description}</p>
      </article>`
    )
    .join("");

  return childShell({
    section: "leadership",
    title: "Leadership growth",
    lead: "How pastors grow through the journey.",
    body: `
      <section class="wb-work-body">
        <div class="container">
          <div class="wb-work-cards">${cards}</div>
          <p class="wb-work-next"><a href="#/scorecard/together" data-link>See what is changing →</a></p>
        </div>
      </section>`,
  });
}

function renderProjects(model) {
  const pillar = (model.pillars || []).find((p) => p.id === "ppp-chips") || {
    description: "Pastor-Planned Projects and church-led initiatives owned by the community.",
  };
  const items = [
    { title: "Pastor-Planned Projects (PPPs)", text: "Local plans for water, farming, health, and more." },
    { title: "Church-led initiatives (CHIPs)", text: "Skills and income work that spreads person to person." },
    { title: "Local ownership", text: "Communities mobilise their own resources first." },
  ];

  return childShell({
    section: "projects",
    title: "Community projects",
    lead: pillar.description,
    body: `
      <section class="wb-work-body">
        <div class="container">
          <div class="wb-work-cards">
            ${items
              .map(
                (it) => `<article class="wb-work-card">
                  <h3>${it.title}</h3>
                  <p>${it.text}</p>
                </article>`
              )
              .join("")}
          </div>
          <p class="wb-work-next"><a href="#/resources/cases" data-link>Read field reports →</a></p>
        </div>
      </section>`,
  });
}

export function renderWhatWeDo(data, section = "overview") {
  const model = data.ministryModel || {};
  const page = section || "overview";

  if (page === "journey") return renderJourney(model);
  if (page === "leadership") return renderLeadership(model);
  if (page === "projects") return renderProjects(model);

  return renderHubOverview(data);
}

export function mountWhatWeDo(root) {
  const page = root?.querySelector?.("[data-what-we-do]") || document.querySelector("[data-what-we-do]");
  if (page) bindWbPageHero(page);
}

export function destroyWhatWeDo() {}
