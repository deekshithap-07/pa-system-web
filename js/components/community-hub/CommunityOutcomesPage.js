import { formatNumber } from "../../utils/format.js";
import { renderPageBack, renderWbPageHero, bindWbPageHero } from "../shared/wb-page-hero.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCommunityOnMap } from "../../utils/hub-geo-maps.js";
import { renderJourneyTrack } from "../shared/story-chapters.js";

function analyticsFor(community, analytics) {
  return analytics?.communityComparison?.communities?.find((c) => c.id === community.id) || null;
}

function renderWhyMatter(payload) {
  const intro = payload.dash?.hero?.description || `${payload.community.name} is one place in the ${payload.catchment.name} nearby group — homes, pastors, faith groups, and local projects on the two-year journey.`;
  return `
    <section class="wb-out__why">
      <div class="container wb-out__why-grid">
        <div>
          <p class="wb-out__eyebrow">Why it matters</p>
          <h2>Why outcomes matter here</h2>
          <p>${intro}</p>
          <p>Transformation is measured through pastors equipped, households reached, Shalom groups formed, and projects that change daily life.</p>
        </div>
        <aside class="wb-out__quote">
          <blockquote>Each community is the closest view — where the whole gospel meets whole people and whole places.</blockquote>
          <cite>${payload.catchment.name} · ${payload.country.name}</cite>
        </aside>
      </div>
    </section>`;
}

function renderCommunityScorecard(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const tiles = [
    { label: "Pastors", value: payload.community.pastors ?? 0 },
    { label: "Households", value: payload.community.households ?? 0 },
    { label: "Shalom groups", value: payload.community.shalomGroups ?? a?.shalomGroups ?? 0 },
    { label: "Leadership score", value: a?.leadershipScore ?? payload.dash?.kpis?.find((k) => k.label === "Leadership Score")?.value ?? "—" },
  ];

  const cards = tiles
    .map((t) => {
      const achieved = typeof t.value === "number" ? t.value : 0;
      const expected = achieved > 0 ? Math.ceil(achieved * 1.12) : 0;
      const pct = expected ? Math.min(100, Math.round((achieved / expected) * 100)) : achieved > 0 ? 100 : 0;
      return `<article class="wb-out-metric">
        <p class="wb-out-metric__label"><strong>${t.label}</strong> in ${payload.community.name}</p>
        <p class="wb-out-metric__value">${typeof t.value === "number" ? formatNumber(t.value) : t.value}</p>
        <div class="wb-out-metric__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p class="wb-out-metric__meta"><span>Field tracking</span>${expected ? ` · toward ${formatNumber(expected)}` : ""}</p>
      </article>`;
    })
    .join("");

  return `
    <section class="wb-out__score">
      <div class="container">
        <div class="wb-out__score-head">
          <div>
            <p class="wb-out__eyebrow">Community scorecard</p>
            <h2>Track progress in <strong>${payload.community.name}</strong></h2>
            <p>Simple measures beside the people and projects on the ground.</p>
          </div>
          <a href="#/scorecard" class="wb-out__btn" data-link>Open Our results</a>
        </div>
        <div class="wb-out-metrics">${cards}</div>
      </div>
    </section>`;
}

function renderSiblingBriefs(payload) {
  const siblings = (payload.siblingCommunities || []).filter((c) => c.slug !== payload.community.slug);
  if (!siblings.length) return "";

  const items = siblings
    .map(
      (c) => `<a href="#/community/${payload.country.slug}/${payload.catchment.slug}/${c.slug}" class="wb-out-brief" data-link>
        <span class="wb-out-brief__tag">${c.journeyStage || c.status || "Community"}</span>
        <h3>${c.name}</h3>
        <p>${formatNumber(c.pastors ?? 0)} pastors${c.shalomGroups ? ` · ${formatNumber(c.shalomGroups)} faith groups` : ""}</p>
        <span class="wb-out-brief__cta">Open community →</span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-out__briefs">
      <div class="container">
        <div class="wb-out__briefs-head">
          <div>
            <p class="wb-out__eyebrow">Other communities</p>
            <h2>More places in ${payload.catchment.name}</h2>
            <p>Each brief is one community in this nearby group — open it for people, projects, and journey stage.</p>
          </div>
        </div>
        <div class="wb-out-briefs">${items}</div>
      </div>
    </section>`;
}

function renderFocusAreas(payload) {
  const programs = payload.dash?.programs || [];
  const timeline = payload.dash?.timeline || [];
  const ppps = payload.dash?.ppps || [];
  const chips = payload.dash?.chips || [];

  const topics = [
    ...programs.slice(0, 3).map((p) => ({ title: p, metric: "Programme area", trend: "Focus" })),
    ...timeline.slice(0, 2).map((t) => ({ title: t.title, metric: t.year, trend: "Activity", summary: t.description })),
    ...ppps.slice(0, 1).map((p) => ({ title: p, metric: "PPP project", trend: "Project" })),
    ...chips.slice(0, 1).map((c) => ({ title: c, metric: "CHIP activity", trend: "Project" })),
  ].slice(0, 5);

  if (!topics.length) return "";

  const chipsHtml = topics
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
        <h2>Focus areas in ${payload.community.name}</h2>
        <div class="wb-out-topics">${chipsHtml}</div>
      </div>
    </section>`;
}

function renderProfileSnapshot(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const stage = a?.stage || payload.community.journeyStage || payload.dash?.kpis?.find((k) => k.text)?.text || "—";
  const facts = [
    { label: "Catchment", value: payload.catchment.name },
    { label: "Region", value: payload.catchment.region || payload.community.region || "—" },
    { label: "Journey stage", value: stage },
    { label: "Active projects", value: a?.projects ?? payload.dash?.timeline?.length ?? 0 },
  ];

  return `
    <section class="wb-out__snapshot">
      <div class="container">
        <div class="wb-out__snapshot-head">
          <div>
            <p class="wb-out__eyebrow">Community profile</p>
            <h2>${payload.community.name} · ${payload.catchment.name}</h2>
            <p>${payload.dash?.hero?.description || `Life, leadership, and local projects in ${payload.community.name}.`}</p>
          </div>
        </div>
        <dl class="wb-out__snapshot-grid">
          ${facts
            .map(
              (t) => `<div class="wb-out__snapshot-tile">
              <dt>${t.label}</dt>
              <dd>${typeof t.value === "number" ? formatNumber(t.value) : t.value}</dd>
            </div>`
            )
            .join("")}
        </dl>
        ${renderJourneyTrack(stage)}
      </div>
    </section>`;
}

function renderPlaces(payload) {
  if (!payload.geoMap) return "";
  return `
    <section class="wb-out__places" id="cm-places">
      <div class="container">
        <header class="wb-out__places-head">
          <p class="wb-out__eyebrow">Place on the map</p>
          <h2>Where ${payload.community.name} sits in ${payload.catchment.name}</h2>
          <p>Click a neighbouring community on the map or in the list to explore another place in this group.</p>
        </header>
        <div class="wb-out__places-maps wb-out__places-maps--single">
          ${renderHubGeoMap(payload.geoMap, { variant: "full", mapId: "community-outcomes" })}
        </div>
      </div>
    </section>`;
}

function renderLeadership(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const items = [
    { label: "Triple-A leadership", value: a?.leadershipScore != null ? `Score ${a.leadershipScore} — Awareness, Ability, Action` : "Field tracking active" },
    { label: "Pastor leaders", value: formatNumber(payload.community.pastors ?? 0) },
    { label: "Shalom leaders", value: a?.shalomLeaders ?? "—" },
    { label: "Participation", value: payload.community.participationRate != null ? `${payload.community.participationRate}%` : "—" },
  ];

  return `
    <section class="wb-out__why wb-out__why--light">
      <div class="container">
        <p class="wb-out__eyebrow">Leadership &amp; engagement</p>
        <h2>People leading change</h2>
        <dl class="wb-out__snapshot-grid wb-out__snapshot-grid--leadership">
          ${items
            .map(
              (f) => `<div class="wb-out__snapshot-tile">
              <dt>${f.label}</dt>
              <dd>${f.value}</dd>
            </div>`
            )
            .join("")}
        </dl>
      </div>
    </section>`;
}

function renderResources(payload) {
  return `
    <section class="wb-out__resources">
      <div class="container">
        <p class="wb-out__eyebrow">Additional resources</p>
        <h2>Keep exploring</h2>
        <div class="wb-out-resources">
          <a href="#/catchment/${payload.country.slug}/${payload.catchment.slug}" class="wb-out-resource" data-link>
            <strong>${payload.catchment.name} nearby group</strong>
            <span>All communities and figures for this catchment</span>
          </a>
          <a href="#/country/${payload.country.slug}" class="wb-out-resource" data-link>
            <strong>${payload.country.name} country page</strong>
            <span>Stories and figures for the whole nation</span>
          </a>
          <a href="#/scorecard" class="wb-out-resource" data-link>
            <strong>Our results</strong>
            <span>Compare progress across the network</span>
          </a>
        </div>
      </div>
    </section>`;
}

export function renderCommunityOutcomes(payload, storySection = "") {
  const stage = payload.community.journeyStage || payload.community.status || "Active";
  const countrySlug = payload.country.slug || "kenya";
  const heroImage =
    {
      kenya: "assets/country-heroes/kenya-hero-farmers.jpg",
      malawi: "assets/country-heroes/malawi-hero-savings.jpg",
      ethiopia: "assets/country-heroes/ethiopia-hero-farm.jpg",
      zambia: "assets/country-heroes/zambia-hero-crops.jpg",
    }[countrySlug] || "assets/country-heroes/kenya-hero-farmers.jpg";

  return `
    <div class="wb-out cm-out" data-community-outcomes data-country-slug="${payload.country.slug}" data-catchment-slug="${payload.catchment.slug}" data-community-slug="${payload.community.slug}">
      ${renderPageBack({ href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}`, label: payload.catchment.name })}
      ${renderWbPageHero({
        id: "community-outcomes-hero",
        tone: "navy",
        skin: "ink",
        image: heroImage,
        crumbs: [
          { label: "Where we work", href: "#/africa" },
          { label: payload.country.name, href: `#/country/${payload.country.slug}` },
          { label: payload.catchment.name, href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}` },
          { label: payload.community.name },
        ],
        eyebrow: "One community · " + payload.catchment.name,
        title: payload.community.name,
        lead: payload.dash?.hero?.description || `Explore pastor-led work, local projects, and the two-year journey in ${payload.community.name}.`,
        actions: [
          { label: "Back to nearby group", href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}` },
          { label: "Our results", href: "#/scorecard", primary: false },
        ],
      })}
      <p class="wb-out__status container"><span>${payload.catchment.name}</span> · <span>${stage}</span></p>
      <div class="wb-out__intro-stack">
        ${renderProfileSnapshot(payload)}
        ${renderPlaces(payload)}
        ${renderWhyMatter(payload)}
      </div>
      ${renderCommunityScorecard(payload)}
      ${renderFocusAreas(payload)}
      ${renderLeadership(payload)}
      ${storySection}
      ${renderSiblingBriefs(payload)}
      ${renderResources(payload)}
    </div>`;
}

export function mountCommunityOutcomes(root, payload) {
  const page = root?.querySelector?.("[data-community-outcomes]") || document.querySelector("[data-community-outcomes]");
  if (!page) return;

  bindWbPageHero(page);
  bindHubGeoMap(page, {
    countrySlug: payload.country.slug,
    catchmentSlug: payload.catchment.slug,
  });
  highlightCommunityOnMap(page, payload.community.slug);

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  page.querySelectorAll(".wb-out__intro-stack, .wb-out__snapshot, .wb-out__places, .wb-out__why, .wb-out__score, .wb-out__topics, .wb-out__briefs, .wb-out__resources, .story-section").forEach((section) => {
    const items = section.querySelectorAll(".wb-out__snapshot-tile, .wb-out-metric, .wb-out-topic, .wb-out-brief, .wb-out-resource, .hub-geo-map, .wb-out__why-grid > *, .story-card");
    if (!items.length) return;

    gsap.from(items, {
      opacity: 0,
      y: 28,
      duration: 0.55,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: section, start: "top 86%", once: true },
    });
  });

  ScrollTrigger.refresh();
}

export function destroyCommunityOutcomes() {
  ScrollTrigger?.getAll?.().forEach((t) => {
    if (t.trigger?.closest?.("[data-community-outcomes]")) t.kill();
  });
}
