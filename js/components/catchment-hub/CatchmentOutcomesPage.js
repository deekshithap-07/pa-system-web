import { formatNumber } from "../../utils/format.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCatchmentOnMap } from "../../utils/hub-geo-maps.js";
import { renderCatchmentScrollShell, wrapScrollStack } from "./catchment-academy-hero.js";

function kpiValue(k) {
  if (k?.text) return k.text;
  if (typeof k?.value === "number") return formatNumber(k.value);
  return String(k?.value ?? "—");
}

function scoreExpected(value) {
  const n = Number(value) || 0;
  if (n <= 0) return 0;
  return Math.ceil(n * 1.15) || n;
}

function regionSnapshotHtml(hub) {
  const summary = hub.catchment?.summary || {};
  const tiles = [
    { label: "Communities", value: summary.communities ?? hub.communities?.length ?? 0 },
    { label: "Pastors", value: summary.pastors ?? 0 },
    { label: "Shalom groups", value: summary.shalomGroups ?? 0 },
    { label: "Households", value: summary.households ?? 0 },
  ];

  return `<div class="wb-out__snapshot-head">
          <div>
            <p class="wb-out__eyebrow">Region profile</p>
            <h2>${hub.catchmentName}${hub.catchment?.region ? ` · ${hub.catchment.region}` : ""}</h2>
            <p>${hub.overview || hub.description || `Pastor-led work across ${tiles[0].value} communities in this nearby group.`}</p>
          </div>
        </div>
        <dl class="wb-out__snapshot-grid">
          ${tiles
            .map(
              (t) => `<div class="wb-out__snapshot-tile">
              <dt>${t.label}</dt>
              <dd>${formatNumber(t.value)}</dd>
            </div>`
            )
            .join("")}
        </dl>`;
}

function placesSectionHtml(hub) {
  const countryMap = hub.countryGeoMap
    ? renderHubGeoMap(hub.countryGeoMap, { variant: "full", mapId: "catchment-country" })
    : "";
  const catchmentMap = hub.geoMap
    ? renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "catchment-local" })
    : "";

  if (!countryMap && !catchmentMap) return "";

  return `<header class="wb-out__places-head">
          <p class="wb-out__eyebrow">Places &amp; map</p>
          <h2>Where ${hub.catchmentName} sits in ${hub.countryName}</h2>
          <p>Click a nearby group on the country map — or open a community on the catchment map.</p>
        </header>
        <div class="wb-out__places-maps">
          ${
            countryMap
              ? `<div class="wb-out__places-map">
              <h3>${hub.countryName} · nearby groups</h3>
              ${countryMap}
            </div>`
              : ""
          }
          ${
            catchmentMap
              ? `<div class="wb-out__places-map">
              <h3>Communities in ${hub.catchmentName}</h3>
              ${catchmentMap}
            </div>`
              : ""
          }
        </div>`;
}

function whyMatterHtml(hub) {
  return `<div class="wb-out__why-grid">
        <div>
          <p class="wb-out__eyebrow">Why it matters</p>
          <h2>Why outcomes matter here</h2>
          <p>${hub.overview || hub.description || `This nearby group brings pastors from neighbouring communities together so training and projects are shared — then each community keeps its own story.`}</p>
          <p>Figures and field notes help the group see what is working, what needs support, and where to walk next on the two-year journey.</p>
        </div>
        <aside class="wb-out__quote">
          <blockquote>A catchment is how Possibilities Africa groups 3–5 communities under coordinated pastor leadership — country strategy becomes community action here.</blockquote>
          <cite>Nearby group · ${hub.countryName}</cite>
        </aside>
      </div>`;
}

function renderIntroStack(hub) {
  return wrapScrollStack("cth-region", [
    { id: "cth-region-profile", html: regionSnapshotHtml(hub) },
    { id: "cth-places", html: placesSectionHtml(hub) },
    { id: "cth-why", html: whyMatterHtml(hub) },
  ]);
}

function renderScorecard(hub) {
  const kpis = (hub.kpis || []).filter((k) => k.id !== "growth").slice(0, 4);
  if (!kpis.length) return "";

  const cards = kpis
    .map((k) => {
      const achieved = typeof k.value === "number" ? k.value : 0;
      const expected = scoreExpected(achieved);
      const pct = expected ? Math.min(100, Math.round((achieved / expected) * 100)) : achieved > 0 ? 100 : 0;
      return `<article class="wb-out-metric">
        <p class="wb-out-metric__label"><strong>${k.label}</strong> in this nearby group</p>
        <p class="wb-out-metric__value">${kpiValue(k)}</p>
        <div class="wb-out-metric__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p class="wb-out-metric__meta"><span>Reached</span>${expected ? ` · <span>Toward ${formatNumber(expected)}</span>` : ""}</p>
      </article>`;
    })
    .join("");

  return `
    <section class="wb-out__score">
      <div class="container">
        <div class="wb-out__score-head">
          <div>
            <p class="wb-out__eyebrow">Network scorecard</p>
            <h2>Track progress in <strong>${hub.catchmentName}</strong></h2>
            <p>Simple measures for this group of communities — beside the people and projects on the ground.</p>
          </div>
          <a href="#/scorecard" class="wb-out__btn" data-link>Open Our results</a>
        </div>
        <div class="wb-out-metrics">${cards}</div>
      </div>
    </section>`;
}

function renderCommunityBriefs(hub) {
  const cards = hub.communityCards || [];
  if (!cards.length) return "";

  const items = cards
    .map(
      (c) => `<a href="#/community/${hub.countrySlug}/${hub.catchmentSlug}/${c.slug}" class="wb-out-brief" data-link>
        <span class="wb-out-brief__tag">${c.status || "Community"}</span>
        <h3>${c.name}</h3>
        <p>${formatNumber(c.pastors)} pastors${c.shalomGroups ? ` · ${formatNumber(c.shalomGroups)} faith groups` : ""}${c.progress ? ` · journey ${c.progress}%` : ""}</p>
        <span class="wb-out-brief__cta">Open community →</span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-out__briefs">
      <div class="container">
        <div class="wb-out__briefs-head">
          <div>
            <p class="wb-out__eyebrow">Community briefs</p>
            <h2>Results at community level</h2>
            <p>Each brief is one place in this group — open it for people, projects, and the journey stage.</p>
          </div>
        </div>
        <div class="wb-out-briefs">${items}</div>
      </div>
    </section>`;
}

function renderInsightTopics(hub) {
  const insights = (hub.insights || []).slice(0, 5);
  if (!insights.length) return "";

  const chips = insights
    .map(
      (ins) => `<article class="wb-out-topic">
        <span>${ins.trend || "Focus"}</span>
        <strong>${ins.title}</strong>
        <p>${ins.summary || ins.metric || ""}</p>
        <em>${ins.metric || ""}</em>
      </article>`
    )
    .join("");

  return `
    <section class="wb-out__topics">
      <div class="container">
        <p class="wb-out__eyebrow">What is changing</p>
        <h2>Focus areas in this group</h2>
        <div class="wb-out-topics">${chips}</div>
      </div>
    </section>`;
}

function renderFeaturedStories(hub) {
  const stories = hub.stories || [];
  const activities = hub.activities || [];

  if (stories.length) {
    const cards = stories
      .slice(0, 3)
      .map((s) => {
        const href = s.slug ? `#/story/${s.slug}` : `#/field-reports`;
        return `<a href="${href}" class="wb-out-feat" data-link>
          <span class="wb-out-feat__media" style="${s.image ? `background-image:url('${s.image}')` : ""}" aria-hidden="true"></span>
          <span class="wb-out-feat__body">
            <span class="wb-out-feat__region">${hub.countryName}</span>
            <strong>${s.title}</strong>
            <span class="wb-out-feat__cta">Read story →</span>
          </span>
        </a>`;
      })
      .join("");

    return `
      <section class="wb-out__featured">
        <div class="container">
          <p class="wb-out__eyebrow">Featured from the field</p>
          <h2>Stories changing lives</h2>
          <div class="wb-out-featured">${cards}</div>
        </div>
      </section>`;
  }

  if (!activities.length) return "";

  const rows = activities
    .slice(0, 4)
    .map(
      (a) => `<li>
        <strong>${a.project || a.title || "Field update"}</strong>
        <span>${a.community || ""} · ${a.status || ""} · ${a.date || ""}</span>
      </li>`
    )
    .join("");

  return `
    <section class="wb-out__featured wb-out__featured--list">
      <div class="container">
        <p class="wb-out__eyebrow">Recent activity</p>
        <h2>What is underway</h2>
        <ul class="wb-out-activity">${rows}</ul>
      </div>
    </section>`;
}

function renderResources(hub) {
  const reports = hub.reports || [];
  return `
    <section class="wb-out__resources">
      <div class="container">
        <p class="wb-out__eyebrow">Additional resources</p>
        <h2>Keep exploring</h2>
        <div class="wb-out-resources">
          <a href="#/country/${hub.countrySlug}" class="wb-out-resource" data-link>
            <strong>${hub.countryName} country page</strong>
            <span>Stories and figures for the whole nation</span>
          </a>
          <a href="#/scorecard" class="wb-out-resource" data-link>
            <strong>Our results</strong>
            <span>Network-wide figures and what is improving</span>
          </a>
          <a href="#/field-reports" class="wb-out-resource" data-link>
            <strong>Field reports</strong>
            <span>Case studies and insight packs from the field</span>
          </a>
        </div>
      </div>
    </section>`;
}

export function renderCatchmentOutcomes(hub) {
  const scrollSections = renderIntroStack(hub);

  return `
    <div class="wb-out cth-academy" data-catchment-outcomes data-country-slug="${hub.countrySlug}" data-catchment-slug="${hub.catchmentSlug}">
      ${renderCatchmentScrollShell(hub, scrollSections)}
      <div class="cth-academy__tail">
        ${renderScorecard(hub)}
        ${renderInsightTopics(hub)}
        ${renderFeaturedStories(hub)}
        ${renderResources(hub)}
      </div>
    </div>`;
}

export function mountCatchmentOutcomes(root, hub) {
  const page = root?.querySelector?.("[data-catchment-outcomes]") || document.querySelector("[data-catchment-outcomes]");
  if (!page) return;

  const countrySlug = hub?.countrySlug || page.dataset.countrySlug;
  const catchmentSlug = hub?.catchmentSlug || page.dataset.catchmentSlug;
  const catchmentId = hub?.catchment?.id;

  bindHubGeoMap(page, { countrySlug, catchmentSlug });
  highlightCatchmentOnMap(page, catchmentId);
}

export function destroyCatchmentOutcomes() {}
