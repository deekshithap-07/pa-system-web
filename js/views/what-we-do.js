import {
  renderWbPageHero,
  renderPageBack,
  bindWbPageHero,
} from "../components/shared/wb-page-hero.js";
import { renderOurWorkPage, initOurWorkAnimations } from "../components/work/our-work-page.js";

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

function renderHubOverview(data) {
  return renderOurWorkPage(data.ourWork || {}, data.ministryModel || {});
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
  requestAnimationFrame(() => {
    try {
      initOurWorkAnimations(root || document);
    } catch (err) {
      console.error("[mountWhatWeDo] animations failed:", err);
    }
  });
}

export function destroyWhatWeDo() {}
