import { formatNumber } from "../utils/format.js";

function collectRecentUpdates(countryHubs, limit = 4) {
  const items = [];
  for (const [slug, hub] of Object.entries(countryHubs?.hubs || {})) {
    for (const activity of hub.activities || []) {
      items.push({ ...activity, countryName: hub.countryName, countrySlug: slug });
    }
  }
  return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_LABELS = { monthly: "Report", quarterly: "Brief", annual: "Annual" };

/** World Bank–style "What's new" — story-led feed, not raw dashboard rows */
export function renderWhatsNew(data, section) {
  const updates = collectRecentUpdates(data.countryHubs, section?.limit || 4);

  const updateItems = updates.length
    ? updates
        .map(
          (u) => `<li class="hp-news__item" data-reveal>
            <span class="hp-news__type">Field update</span>
            <time datetime="${u.date}">${formatDate(u.date)}</time>
            <h3>${u.project}</h3>
            <p>${u.community} · ${u.countryName}</p>
            ${u.countrySlug ? `<a href="#/country/${u.countrySlug}" class="hp-news__link" data-link>View country &rarr;</a>` : ""}
          </li>`
        )
        .join("")
    : `<li class="hp-news__item hp-news__item--empty"><p>No field updates right now — explore transformation stories below.</p></li>`;

  return `
    <section class="hp-news" id="whats-new" aria-labelledby="hp-news-title">
      <div class="container">
        <header class="hp-section-head" data-reveal>
          <p class="eyebrow">${section?.eyebrow || "What's happening"}</p>
          <h2 id="hp-news-title">${section?.title || "Latest from the field"}</h2>
          <p>${section?.description || "Programme updates from pastor-led communities across the network."}</p>
        </header>
        <ol class="hp-news__grid">${updateItems}</ol>
      </div>
    </section>`;
}

/** World Bank "Data for Development" — contextual stats with narrative + source */
export function renderDataSnapshots(section) {
  const snapshots = section?.snapshots || [];
  if (!snapshots.length) return "";

  const cards = snapshots
    .map(
      (s) => `<article class="hp-data-card" data-reveal>
        <span class="hp-data-card__tag">${s.focus}</span>
        <p class="hp-data-card__stat"><strong>${s.stat}</strong> ${s.statLabel}</p>
        <p class="hp-data-card__context">${s.context}</p>
        <footer class="hp-data-card__source">Source: ${s.source}</footer>
      </article>`
    )
    .join("");

  return `
    <section class="hp-data" id="data-for-transformation" aria-labelledby="hp-data-title">
      <div class="container">
        <header class="hp-section-head hp-section-head--light" data-reveal>
          <p class="eyebrow">${section.eyebrow}</p>
          <h2 id="hp-data-title">${section.title}</h2>
          <p>${section.description}</p>
        </header>
        <div class="hp-data__grid">${cards}</div>
        <p class="hp-data__cta" data-reveal>
          <a href="${section.cta?.target || '#/scorecard'}" class="btn btn-secondary" data-link>${section.cta?.label || "Explore scorecard"}</a>
        </p>
      </div>
    </section>`;
}

/** Featured transformation stories — narrative cards with embedded metrics */
export function renderFeaturedStories(data, section) {
  const stories = (data.stories?.stories || []).slice(0, section?.limit || 3);
  if (!stories.length) return "";

  const cards = stories
    .map(
      (s) => `<article class="hp-story-card" data-reveal>
        <div class="hp-story-card__visual" aria-hidden="true">
          <span class="hp-story-card__program">${s.program}</span>
        </div>
        <div class="hp-story-card__body">
          <h3>${s.title}</h3>
          <p>${s.excerpt}</p>
          ${
            s.metricsList?.length
              ? `<ul class="hp-story-card__metrics">${s.metricsList
                  .slice(0, 3)
                  .map((m) => `<li><strong>${m.value}</strong><span>${m.label}</span></li>`)
                  .join("")}</ul>`
              : ""
          }
          <a href="#/resources#res-case-studies" class="hp-story-card__link" data-link>Read full story &rarr;</a>
        </div>
      </article>`
    )
    .join("");

  return `
    <section class="hp-stories" id="transformation-stories" aria-labelledby="hp-stories-title">
      <div class="container">
        <header class="hp-section-head" data-reveal>
          <p class="eyebrow">${section?.eyebrow || "Transformation stories"}</p>
          <h2 id="hp-stories-title">${section?.title || "People and communities behind the numbers"}</h2>
          <p>${section?.description || "Every metric represents pastors, households, and communities on a two-year journey of holistic change."}</p>
        </header>
        <div class="hp-stories__grid">${cards}</div>
      </div>
    </section>`;
}

/** World Bank "Research & Publications" — horizontal report rows */
export function renderPublicationsTeaser(data, section) {
  const reports = (data.reports?.reports || []).slice(0, 3);
  if (!reports.length) return "";

  const rows = reports
    .map(
      (r, i) => `<a href="#/resources#res-catalog" class="wb-pub-row" data-link data-reveal>
        <div class="wb-pub-row__cover wb-pub-row__cover--${i === 0 ? "annual" : "report"}" aria-hidden="true"></div>
        <div class="wb-pub-row__body">
          <span class="wb-pub-row__type">${TYPE_LABELS[r.type] || r.type}</span>
          <h3>${r.title}</h3>
          <p>${r.summary}</p>
        </div>
        <span class="wb-pub-row__arrow" aria-hidden="true">&rarr;</span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-publications" id="research-publications" aria-labelledby="hp-pubs-title">
      <div class="container">
        <header class="wb-publications__head" data-reveal>
          <div>
            <p class="eyebrow">${section?.eyebrow || "Research & publications"}</p>
            <h2 id="hp-pubs-title">${section?.title || "Reports that explain the data"}</h2>
            <p>${section?.description || "Monthly field reports and annual summaries give narrative context to the metrics on this platform."}</p>
          </div>
          <a href="#/resources" class="wb-publications__all" data-link>All resources &rarr;</a>
        </header>
        <div class="wb-publications__list">${rows}</div>
      </div>
    </section>`;
}

/** World Bank regional explore — country story cards with light metrics */
export function renderExploreRegions(data, section) {
  const countries = (data.countries?.countries || []).filter((c) => c.isPaNetwork).slice(0, 6);
  if (!countries.length) return "";

  const cards = countries
    .map(
      (c) => `<a href="#/country/${c.slug}" class="hp-region-card" data-link data-reveal>
        <span class="hp-region-card__status hp-region-card__status--${(c.status || "active").toLowerCase()}">${c.status || "Active"}</span>
        <h3>${c.name}</h3>
        <p>${c.summary?.communities || c.communities || 0} communities · ${c.summary?.pastors || c.pastors || 0} pastors · ${c.projects || 0} projects</p>
        <span class="hp-region-card__growth">+${c.growth || 0}% network growth</span>
      </a>`
    )
    .join("");

  return `
    <section class="hp-regions" id="explore-regions" aria-labelledby="hp-regions-title">
      <div class="container">
        <header class="hp-section-head" data-reveal>
          <p class="eyebrow">${section?.eyebrow || "Explore by country"}</p>
          <h2 id="hp-regions-title">${section?.title || "See transformation where it happens"}</h2>
          <p>${section?.description || "Drill from country to catchment to community — each level tells a clearer story with relevant data."}</p>
        </header>
        <div class="hp-regions__grid">${cards}</div>
        <p class="hp-regions__map-cta" data-reveal>
          <a href="#/africa" class="btn btn-primary" data-link>${section?.mapCta?.label || "Open the Africa map"}</a>
        </p>
      </div>
    </section>`;
}

/** Purpose strip — narrative + impact numbers (World Bank "Power of Purpose") */
export function renderPurposeStrip(section) {
  if (!section) return "";
  const metrics = section.metrics || [];

  return `
    <section class="hp-purpose" id="our-purpose" aria-labelledby="hp-purpose-title">
      <div class="container hp-purpose__inner">
        <div class="hp-purpose__copy" data-reveal>
          <p class="eyebrow">${section.eyebrow}</p>
          <h2 id="hp-purpose-title">${section.title}</h2>
          <p>${section.description}</p>
          <a href="${section.cta?.target || '#/about'}" class="hp-purpose__link" data-link>${section.cta?.label || "How PA works"} &rarr;</a>
        </div>
        <div class="hp-purpose__metrics">
          ${metrics
            .map(
              (m) => `<div class="hp-purpose__metric" data-reveal>
                <strong>${m.value}</strong>
                <span>${m.label}</span>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

/** Platform bridge — connects stories to scorecard/insights without feeling like a dashboard login */
export function renderIntelligenceBridge(section) {
  if (!section) return "";

  const cards = (section.cards || [])
    .map(
      (c) => `<a href="${c.target}" class="hp-bridge-card" data-link data-reveal>
        <span class="hp-bridge-card__label">${c.label}</span>
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <span class="hp-bridge-card__arrow" aria-hidden="true">&rarr;</span>
      </a>`
    )
    .join("");

  return `
    <section class="hp-bridge" id="transformation-intelligence" aria-labelledby="hp-bridge-title">
      <div class="container">
        <header class="hp-section-head hp-section-head--light hp-section-head--center" data-reveal>
          <p class="eyebrow">${section.eyebrow}</p>
          <h2 id="hp-bridge-title">${section.title}</h2>
          <p>${section.description}</p>
        </header>
        <div class="hp-bridge__grid">${cards}</div>
      </div>
    </section>`;
}
