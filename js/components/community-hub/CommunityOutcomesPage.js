import { formatNumber } from "../../utils/format.js";
import { renderPageBack, renderWbPageHero, bindWbPageHero } from "../shared/wb-page-hero.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCommunityOnMap } from "../../utils/hub-geo-maps.js";
import { renderJourneyTrack } from "../shared/story-chapters.js";

/** Official PA programmes — same five as home / Our Work (no invented topics). */
const PA_PROGRAMMES = [
  {
    id: "leadership",
    title: "Transformational Leadership",
    text: "Developing leaders at every level.",
    description: "Equipping leaders to guide communities with vision, character and purpose.",
    href: "#/work#work-leadership",
  },
  {
    id: "discipleship",
    title: "Spiritual Discipleship",
    text: "Building strong faith and values.",
    description: "Rooting households and churches in faith that shapes daily life, relationships and hope.",
    href: "#/work",
  },
  {
    id: "economic",
    title: "Economic Productivity",
    text: "Creating sustainable livelihoods.",
    description: "Helping families grow sustainable livelihoods through skills, savings and community enterprise.",
    href: "#/work",
  },
  {
    id: "youth",
    title: "Mentoring the Next Generation",
    text: "Equipping young people for a better future.",
    description: "Walking with young people so they grow in faith, character and opportunity for the future.",
    href: "#/work",
  },
  {
    id: "citizenship",
    title: "Responsible Citizenship",
    text: "Building peaceful, engaged communities.",
    description: "Building peaceful, engaged communities where neighbours take responsibility for shared wellbeing.",
    href: "#/work",
  },
];

function analyticsFor(community, analytics) {
  return analytics?.communityComparison?.communities?.find((c) => c.id === community.id) || null;
}

function programmesFor(payload) {
  const fromHome = payload.programmes;
  if (Array.isArray(fromHome) && fromHome.length >= 5) return fromHome.slice(0, 5);
  return PA_PROGRAMMES;
}

function renderWhyMatter(payload) {
  const intro =
    payload.dash?.hero?.description ||
    `${payload.community.name} is one place in the ${payload.catchment.name} nearby group — homes, pastors, faith groups, and local projects on the two-year journey.`;
  return `
    <section class="wb-out__why" data-cm-section>
      <div class="container wb-out__why-grid">
        <div data-cm-rise>
          <p class="wb-out__eyebrow">Why it matters</p>
          <h2>Why outcomes matter here</h2>
          <p>${intro}</p>
          <p>Transformation is measured through pastors equipped, households reached, Shalom groups formed, and projects that change daily life.</p>
        </div>
        <aside class="wb-out__quote" data-cm-rise>
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
    {
      label: "Leadership score",
      value:
        a?.leadershipScore ??
        payload.dash?.kpis?.find((k) => k.label === "Leadership Score")?.value ??
        "—",
    },
  ];

  const cards = tiles
    .map((t) => {
      const achieved = typeof t.value === "number" ? t.value : 0;
      const expected = achieved > 0 ? Math.ceil(achieved * 1.12) : 0;
      const pct = expected ? Math.min(100, Math.round((achieved / expected) * 100)) : achieved > 0 ? 100 : 0;
      return `<article class="wb-out-metric" data-cm-rise>
        <p class="wb-out-metric__label"><strong>${t.label}</strong> in ${payload.community.name}</p>
        <p class="wb-out-metric__value">${typeof t.value === "number" ? formatNumber(t.value) : t.value}</p>
        <div class="wb-out-metric__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <p class="wb-out-metric__meta"><span>Field tracking</span>${expected ? ` · toward ${formatNumber(expected)}` : ""}</p>
      </article>`;
    })
    .join("");

  return `
    <section class="wb-out__score" data-cm-section>
      <div class="container">
        <div class="wb-out__score-head" data-cm-rise>
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
      (c) => `<a href="#/community/${payload.country.slug}/${payload.catchment.slug}/${c.slug}" class="wb-out-brief" data-link data-cm-rise>
        <span class="wb-out-brief__tag">${c.journeyStage || c.status || "Community"}</span>
        <h3>${c.name}</h3>
        <p>${formatNumber(c.pastors ?? 0)} pastors${c.shalomGroups ? ` · ${formatNumber(c.shalomGroups)} faith groups` : ""}</p>
        <span class="wb-out-brief__cta">Open community →</span>
      </a>`
    )
    .join("");

  return `
    <section class="wb-out__briefs" data-cm-section>
      <div class="container">
        <div class="wb-out__briefs-head" data-cm-rise>
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
  const programmes = programmesFor(payload);
  const rows = programmes
    .map((p, i) => {
      const n = String(i + 1).padStart(2, "0");
      const blurb = p.description || p.text || "";
      const href = p.href || "#/work";
      return `<li class="cm-prog" data-cm-prog data-tone="${p.tone || "maroon"}">
        <span class="cm-prog__index" aria-hidden="true">${n}</span>
        <div class="cm-prog__body">
          <h3>${p.title}</h3>
          <p>${blurb}</p>
        </div>
        <a href="${href}" class="cm-prog__link" data-link>Explore</a>
      </li>`;
    })
    .join("");

  return `
    <section class="cm-progs" data-cm-section>
      <div class="container">
        <header class="cm-progs__head" data-cm-rise>
          <p class="wb-out__eyebrow">What is changing</p>
          <h2>Five programmes in ${payload.community.name}</h2>
          <p>PA’s programmes work together here — the same five across every community.</p>
        </header>
        <ol class="cm-progs__rail">${rows}</ol>
      </div>
    </section>`;
}

function renderProfileSnapshot(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const stage =
    a?.stage || payload.community.journeyStage || payload.dash?.kpis?.find((k) => k.text)?.text || "—";
  const facts = [
    { label: "Catchment", value: payload.catchment.name },
    { label: "Region", value: payload.catchment.region || payload.community.region || "—" },
    { label: "Journey stage", value: stage },
    { label: "Active projects", value: a?.projects ?? payload.dash?.timeline?.length ?? 0 },
  ];

  return `
    <section class="wb-out__snapshot" data-cm-section>
      <div class="container">
        <div class="wb-out__snapshot-head" data-cm-rise>
          <div>
            <p class="wb-out__eyebrow">Community profile</p>
            <h2>${payload.community.name} · ${payload.catchment.name}</h2>
            <p>${payload.dash?.hero?.description || `Life, leadership, and local projects in ${payload.community.name}.`}</p>
          </div>
        </div>
        <dl class="wb-out__snapshot-grid">
          ${facts
            .map(
              (t) => `<div class="wb-out__snapshot-tile" data-cm-rise>
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
    <section class="wb-out__places cm-places--compact" id="cm-places" data-cm-section>
      <div class="container">
        <div class="cm-places__layout">
          <header class="wb-out__places-head" data-cm-rise>
            <p class="wb-out__eyebrow">Place on the map</p>
            <h2>Where ${payload.community.name} sits</h2>
            <p>Tap a neighbour on the map or list to open another community in ${payload.catchment.name}.</p>
          </header>
          <div class="wb-out__places-maps wb-out__places-maps--single" data-cm-map>
            ${renderHubGeoMap(payload.geoMap, { variant: "full", mapId: "community-outcomes" })}
          </div>
        </div>
      </div>
    </section>`;
}

function renderLeadership(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const items = [
    {
      label: "Triple-A leadership",
      value:
        a?.leadershipScore != null
          ? `Score ${a.leadershipScore} — Awareness, Ability, Action`
          : "Field tracking active",
    },
    { label: "Pastor leaders", value: formatNumber(payload.community.pastors ?? 0) },
    { label: "Shalom leaders", value: a?.shalomLeaders ?? "—" },
    {
      label: "Participation",
      value: payload.community.participationRate != null ? `${payload.community.participationRate}%` : "—",
    },
  ];

  return `
    <section class="wb-out__why wb-out__why--light" data-cm-section>
      <div class="container">
        <div data-cm-rise>
          <p class="wb-out__eyebrow">Leadership &amp; engagement</p>
          <h2>People leading change</h2>
        </div>
        <dl class="wb-out__snapshot-grid wb-out__snapshot-grid--leadership">
          ${items
            .map(
              (f) => `<div class="wb-out__snapshot-tile" data-cm-rise>
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
    <section class="wb-out__resources" data-cm-section>
      <div class="container">
        <div data-cm-rise>
          <p class="wb-out__eyebrow">Additional resources</p>
          <h2>Keep exploring</h2>
        </div>
        <div class="wb-out-resources">
          <a href="#/catchment/${payload.country.slug}/${payload.catchment.slug}" class="wb-out-resource" data-link data-cm-rise>
            <strong>${payload.catchment.name} nearby group</strong>
            <span>All communities and figures for this catchment</span>
          </a>
          <a href="#/country/${payload.country.slug}" class="wb-out-resource" data-link data-cm-rise>
            <strong>${payload.country.name} country page</strong>
            <span>Stories and figures for the whole nation</span>
          </a>
          <a href="#/scorecard" class="wb-out-resource" data-link data-cm-rise>
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
        lead:
          payload.dash?.hero?.description ||
          `Explore pastor-led work, local projects, and the two-year journey in ${payload.community.name}.`,
        actions: [
          { label: "Back to nearby group", href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}` },
          { label: "Our results", href: "#/scorecard", primary: false },
        ],
      })}
      <p class="wb-out__status container" data-cm-rise><span>${payload.catchment.name}</span> · <span>${stage}</span></p>
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

  /* Community motion: horizontal wipe + rail stagger — not catchment sticky panels */
  page.querySelectorAll("[data-cm-section]").forEach((section) => {
    gsap.fromTo(
      section,
      { clipPath: "inset(0 0 18% 0)", opacity: 0.55 },
      {
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 88%", once: true },
      }
    );

    const rises = section.querySelectorAll("[data-cm-rise]");
    if (rises.length) {
      gsap.from(rises, {
        opacity: 0,
        y: 36,
        filter: "blur(4px)",
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 84%", once: true },
      });
    }
  });

  const mapHost = page.querySelector("[data-cm-map]");
  if (mapHost) {
    gsap.from(mapHost, {
      scale: 0.88,
      opacity: 0,
      transformOrigin: "center center",
      duration: 0.75,
      ease: "back.out(1.4)",
      scrollTrigger: { trigger: mapHost, start: "top 90%", once: true },
    });
    const anchors = mapHost.querySelectorAll(".hub-geo-map__community-anchor");
    if (anchors.length) {
      gsap.fromTo(
        anchors,
        { attr: { r: 0 } },
        {
          attr: { r: 4.5 },
          duration: 0.45,
          stagger: 0.05,
          ease: "back.out(2)",
          scrollTrigger: { trigger: mapHost, start: "top 88%", once: true },
        }
      );
    }
  }

  const progs = page.querySelectorAll("[data-cm-prog]");
  if (progs.length) {
    gsap.from(progs, {
      x: -48,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: page.querySelector(".cm-progs"), start: "top 82%", once: true },
    });
    gsap.from(page.querySelectorAll(".cm-prog__index"), {
      scale: 0.6,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: page.querySelector(".cm-progs"), start: "top 82%", once: true },
    });
  }

  ScrollTrigger.refresh();
}

export function destroyCommunityOutcomes() {
  ScrollTrigger?.getAll?.().forEach((t) => {
    if (t.trigger?.closest?.("[data-community-outcomes]")) t.kill();
  });
}
