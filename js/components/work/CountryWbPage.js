import { formatNumber } from "../../utils/format.js";
import { numberCardsFromHub, storiesForCountry } from "../../utils/work-locations.js";

function storyHref(story) {
  return `#/story/${story.slug}`;
}

function storiesAllHref(slug) {
  return `#/country/${slug}/stories`;
}

function storyHeroImage(story, hub) {
  return hub?.heroStoryImages?.[story.id] || story.image;
}

function storyMedia(story, className, hub) {
  const src = storyHeroImage(story, hub);
  const img = src
    ? `<img class="${className}-img" src="${src}" alt="" loading="eager" decoding="async">`
    : "";
  return `<span class="${className}-media" aria-hidden="true">${img}<span class="${className}-wash"></span></span>`;
}

export function renderCountryStoryHero(hub, stories = []) {
  const list = (stories.length ? stories : hub.stories || []).slice(0, 3);
  if (!list.length) {
    return `
      <section class="wb-feat" aria-label="${hub.countryName}">
        <div class="container">
          <p class="wb-feat__kicker">${hub.heroTagline || "Where we work"}</p>
          <h1 class="wb-feat__country">${hub.countryName}</h1>
          <p class="wb-feat__intro">${hub.description || hub.overview || ""}</p>
        </div>
      </section>`;
  }

  const [main, ...side] = list;
  const sideCards = side
    .map(
      (s) => `<a href="${storyHref(s)}" class="wb-feat__card" data-link>
        ${storyMedia(s, "wb-feat__card", hub)}
        <span class="wb-feat__card-copy">
          <span class="wb-feat__kicker">${s.program || hub.countryName}</span>
          <strong>${s.title}</strong>
          <span class="wb-feat__link">Read the story</span>
        </span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-feat" aria-label="Stories from ${hub.countryName}">
      <div class="container">
        <div class="wb-feat__grid${side.length ? "" : " is-solo"}">
          <a href="${storyHref(main)}" class="wb-feat__main" data-link>
            ${storyMedia(main, "wb-feat__main", hub)}
            <span class="wb-feat__main-copy">
              <span class="wb-feat__kicker">${main.program || hub.countryName}</span>
              <h1>${main.title}</h1>
              <p>${main.excerpt || ""}</p>
              <span class="wb-feat__link">Read the story</span>
            </span>
          </a>
          ${side.length ? `<div class="wb-feat__side">${sideCards}</div>` : ""}
        </div>
      </div>
    </section>`;
}

export function renderByTheNumbers(hub) {
  const cards = numberCardsFromHub(hub);
  if (!cards.length) return "";

  const items = cards
    .map(
      (c) => `<article class="wb-num-card" data-num-card data-chart-key="${c.key}">
        <a href="${c.titleHref || "#/africa"}" class="wb-num-card__title" data-link>${c.title}</a>
        <p class="wb-num-card__sub">${c.chartKind ? `<span class="wb-num-card__kind">${c.chartKind}</span>` : ""}${c.subtitle}</p>
        <div class="wb-num-card__chart">
          <canvas data-wb-num="${c.key}"></canvas>
          ${c.center ? `<span class="wb-num-card__center">${c.center}</span>` : ""}
        </div>
        <a href="${c.source?.href || "#/resources/cases"}" class="wb-num-card__source" data-link>${c.source?.label || "Source · Field reports"}</a>
      </article>`
    )
    .join("");

  return `
    <section class="wb-numbers" data-wb-numbers>
      <div class="container">
        <header class="wb-numbers__head">
          <h2>By the numbers: ${hub.countryName}</h2>
          <a href="#/country/${hub.country.slug}/data" class="wb-numbers__more" data-link>Explore more data</a>
        </header>
        <div class="wb-numbers__row">
          <div class="wb-numbers__track" data-num-track>${items}</div>
          <div class="wb-numbers__arrows">
            <button type="button" class="wb-arrow" data-num-prev aria-label="Previous">‹</button>
            <button type="button" class="wb-arrow" data-num-next aria-label="Next">›</button>
          </div>
        </div>
      </div>
    </section>`;
}

function kpiVal(hub, id) {
  return hub.kpis?.find((k) => k.id === id)?.value;
}

function insight(hub, id) {
  return (hub.insights || []).find((i) => i.id === id);
}

function overviewTabs(hub) {
  const name = hub.countryName;
  const communities = kpiVal(hub, "communities") ?? hub.country?.communities ?? 0;
  const pastors = kpiVal(hub, "pastors") ?? hub.country?.pastors ?? 0;
  const catchments = hub.catchments || [];
  const growth = kpiVal(hub, "growth");
  const live = insight(hub, "livelihood");
  const agri = insight(hub, "agriculture");
  const water = insight(hub, "water");
  const edu = insight(hub, "education");
  const health = insight(hub, "health");
  const lead = insight(hub, "leadership");
  const comm = insight(hub, "community");
  const placeNames = catchments.map((c) => c.name).filter(Boolean);
  const placeLine = placeNames.length
    ? placeNames.length > 1
      ? `${placeNames.slice(0, -1).join(", ")}, and ${placeNames.at(-1)}`
      : placeNames[0]
    : "neighbouring communities";

  const aboutTeaser = hub.overview || hub.description || `Pastor-led work is underway in ${name}.`;
  const aboutMore = [
    hub.description && hub.description !== aboutTeaser ? hub.description : "",
    `The work is grouped simply: the country, then a small cluster of nearby communities, then one community. ${formatNumber(communities)} communities and ${formatNumber(pastors)} pastors are on this journey${growth != null ? `, with ${growth}% growth year on year` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    { id: "about", label: "About", teaser: aboutTeaser, more: aboutMore },
    {
      id: "livelihood",
      label: "Livelihood",
      teaser:
        live?.summary ||
        agri?.summary ||
        `Households in ${name} grow income through farming groups, skills, and local enterprise — usually after pastors and faith groups are in place.`,
      more: [agri?.summary, water?.summary, live?.metric ? `Field tracking notes ${live.metric}.` : ""]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "development",
      label: "Development",
      teaser:
        comm?.summary ||
        `Daily life in ${name} is changing through water, farming, health, and schools — led by local churches, not by a list of projects dropped in from outside.`,
      more: [water?.summary, edu?.summary, health?.summary, insight(hub, "climate")?.summary]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "partnership",
      label: "Partnership",
      teaser:
        lead?.summary ||
        `Possibilities Africa walks with local pastors in ${name} for two years so faith, families, and daily life grow together.`,
      more: `Pastors coordinate the work in ${placeLine}. Nearby groups of 3–5 communities share training and support, then each community keeps its own story and figures.`,
    },
    {
      id: "results",
      label: "Results",
      teaser: `${name} currently reports ${formatNumber(communities)} communities and ${formatNumber(pastors)} pastors${growth != null ? `, with ${growth}% growth` : ""}. These figures sit beside the stories on this page — they do not replace visiting a community.`,
      more: `${kpiVal(hub, "ppp") != null ? `${kpiVal(hub, "ppp")} partnership projects and ` : ""}${kpiVal(hub, "chips") != null ? `${kpiVal(hub, "chips")} household income groups are tracked. ` : ""}Open a nearby group below to see the people behind the totals.`,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      teaser: `A short view of ${name}: ${formatNumber(communities)} communities, ${catchments.length || kpiVal(hub, "catchments") || 0} nearby groups, ${formatNumber(pastors)} pastors.`,
      more: `For charts across all seven countries, open Our results under What we do. For one place, open a nearby group or a community on this country page.`,
    },
  ];
}

function renderTabPanel(tab, isActive) {
  const more = (tab.more || "").trim();
  const extraHtml =
    tab.id === "dashboard"
      ? `<p>${more.replace(
          "open Our results",
          `<a href="#/scorecard" data-link>open Our results</a>`
        )}</p>`
      : `<p>${more}</p>`;
  return `
    <div
      class="wb-ov-panel${isActive ? " is-active" : ""}"
      id="tab-${tab.id}"
      role="tabpanel"
      data-ov-panel="${tab.id}"
      ${isActive ? "" : "hidden"}
    >
      <p class="wb-ov-teaser">${tab.teaser}</p>
      ${more ? `<div class="wb-ov-extra" data-ov-extra hidden>${extraHtml}</div>` : ""}
      ${
        more
          ? `<button type="button" class="wb-ov-more" data-ov-more aria-expanded="false">
              <span data-ov-more-label>Read more</span>
              <span class="wb-ov-more__chevron" aria-hidden="true">▾</span>
            </button>`
          : ""
      }
    </div>`;
}

export function renderCountryOverview(hub) {
  const tabs = overviewTabs(hub);
  return `
    <section class="wb-overview" id="overview">
      <div class="container">
        <h2>Overview: ${hub.countryName}</h2>
        <div class="wb-ov-tabs" role="tablist" aria-label="Overview of ${hub.countryName}">
          ${tabs
            .map(
              (t, i) => `<button
                type="button"
                class="wb-ov-tab${i === 0 ? " is-active" : ""}"
                role="tab"
                id="ov-tab-${t.id}"
                aria-selected="${i === 0 ? "true" : "false"}"
                aria-controls="tab-${t.id}"
                data-ov-tab="${t.id}"
              >${t.label}</button>`
            )
            .join("")}
        </div>
        <div class="wb-ov-panels">
          ${tabs.map((t, i) => renderTabPanel(t, i === 0)).join("")}
        </div>
      </div>
    </section>`;
}

export function renderCountryLatest(hub, stories) {
  const all = stories || hub.stories || [];
  if (all.length <= 3) return "";
  const list = all.slice(3, 6);
  if (!list.length) return "";
  const allHref = `#/country/${hub.country.slug}/stories`;
  const cards = list
    .map(
      (s) => `<a href="${storyHref(s)}" class="wb-latest-card" data-link>
        ${
          s.image
            ? `<span class="wb-latest-card__media"><img class="wb-latest-card__thumb" src="${s.image}" alt="" loading="lazy"><span class="wb-latest-card__wash"></span></span>`
            : `<span class="wb-latest-card__thumb wb-photo--0" aria-hidden="true"></span>`
        }
        <span class="wb-latest-card__type">${s.program || "Story"}</span>
        <strong>${s.title}</strong>
        <span>Read the story</span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-latest">
      <div class="container">
        <header class="wb-latest__head">
          <h2>The latest from ${hub.countryName}</h2>
          <a href="${allHref}" class="wb-latest__all" data-link>See all stories</a>
        </header>
        <p class="wb-latest__intro">Stories from pastors and communities in this country.</p>
        <div class="wb-latest__grid">${cards}</div>
      </div>
    </section>`;
}

export function renderCountryProjects(hub) {
  const reports = hub.reports || [];
  const catchments = hub.catchments || [];
  return `
    <section class="wb-projects">
      <div class="container">
        <h2>Projects &amp; results</h2>
        <p class="wb-projects__lead">Nearby groups of communities, and reports from this country.</p>
        <div class="wb-projects__grid">
          <div>
            <h3>Nearby groups</h3>
            ${
              catchments.length
                ? catchments
                    .map(
                      (c) => `<a href="#/catchment/${hub.country.slug}/${c.slug}" class="wb-projects__row" data-link>
                        <strong>${c.name}</strong>
                        <span>${c.region || "Open communities"}</span>
                      </a>`
                    )
                    .join("")
                : `<p>Groups will appear as the work grows.</p>`
            }
          </div>
          <div>
            <h3>Reports</h3>
            ${
              reports.length
                ? reports
                    .map(
                      (r) => `<a href="#/resources/cases" class="wb-projects__row" data-link>
                        <strong>${r.title}</strong>
                        <span>${r.summary || r.period || ""}</span>
                      </a>`
                    )
                    .join("")
                : `<p>Reports for this country will appear here.</p>`
            }
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCountryStoryHero() {}

export function bindNumbersCarousel(root) {
  const track = root.querySelector("[data-num-track]");
  if (!track) return;
  const prev = root.querySelector("[data-num-prev]");
  const next = root.querySelector("[data-num-next]");
  const step = () => Math.min(track.clientWidth * 0.7, 340);
  prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
}

export function bindOverviewTabs(root) {
  const tabs = [...root.querySelectorAll("[data-ov-tab]")];
  const panels = [...root.querySelectorAll("[data-ov-panel]")];
  if (!tabs.length) return;

  const show = (id) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.ovTab === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((panel) => {
      const on = panel.dataset.ovPanel === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => show(tab.dataset.ovTab));
  });

  root.querySelectorAll("[data-ov-more]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest("[data-ov-panel]");
      const extra = panel?.querySelector("[data-ov-extra]");
      const label = btn.querySelector("[data-ov-more-label]");
      if (!extra) return;
      const open = extra.hidden;
      extra.hidden = !open;
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Read less" : "Read more";
    });
  });

  const hash = location.hash.split("#").filter(Boolean).pop();
  if (hash?.startsWith("tab-")) {
    const id = hash.slice(4);
    if (tabs.some((t) => t.dataset.ovTab === id)) show(id);
  }
}

export function featuredStories(data, hub) {
  const fromHub = hub.stories || [];
  if (fromHub.length) return fromHub;
  return storiesForCountry(data, hub.country?.id);
}
