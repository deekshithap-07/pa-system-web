/**
 * Community Hub — deepest public PA layer.
 * Answers: “What is happening in this specific community?”
 * Unique local UI (not Country / Catchment / What We Do patterns).
 * Sensitive personal, household, financial, operational detail stays internal.
 */

import { formatNumber } from "../../utils/format.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCommunityOnMap } from "../../utils/hub-geo-maps.js";
import { JOURNEY_STAGES } from "../shared/story-chapters.js";
import { resolvePublicFreshness } from "../../utils/public-api.js";

function analyticsFor(community, analytics) {
  return analytics?.communityComparison?.communities?.find((c) => c.id === community.id) || null;
}

function publicReach(community, analytics) {
  const a = analyticsFor(community, analytics);
  const flags = community.publicDisplay || {};
  const shalom =
    flags.shalomGroups === false ? null : community.shalomGroups ?? a?.shalomGroups ?? null;
  const households =
    flags.households === false ? null : community.households ?? a?.households ?? null;

  return {
    shalom: typeof shalom === "number" ? shalom : null,
    households: typeof households === "number" ? households : null,
  };
}

function journeyStage(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  return (
    a?.stage ||
    payload.community.journeyStage ||
    payload.community.status ||
    payload.dash?.kpis?.find((k) => k.text)?.text ||
    "Awareness"
  );
}

function locationLine(payload) {
  const region = payload.catchment.region || payload.community.region;
  const parts = [payload.catchment.name, region, payload.country.name].filter(Boolean);
  return parts.join(" · ");
}

function heroImage(payload) {
  return (
    payload.community?.heroImage ||
    payload.catchmentHeroImage ||
    {
      kenya: "assets/community-heroes/kenya.jpg",
      malawi: "assets/community-heroes/malawi.jpg",
      ethiopia: "assets/community-heroes/ethiopia.jpg",
      zambia: "assets/community-heroes/zambia.jpg",
    }[payload.country.slug] || "assets/community-heroes/kenya.jpg"
  );
}

function collectCommunityPpps(payload) {
  const items = [];
  const seen = new Set();
  const name = payload.community?.name || "";

  const push = (entry) => {
    const title = String(entry.name || "").trim();
    if (!title) return;
    const key = title.toLowerCase();
    if ([...seen].some((k) => k.includes(key) || key.includes(k))) return;
    seen.add(key);
    items.push({
      name: title,
      type: entry.type || projectType(title),
      status: entry.status || "Active",
      summary: entry.summary || `Community project underway in ${name}.`,
      date: entry.date || null,
      image: entry.image || null,
    });
  };

  (payload.dash?.ppps || []).forEach((p) => {
    if (typeof p === "string") {
      const timeline = (payload.dash?.timeline || []).find(
        (t) =>
          /ppp/i.test(t.title || "") ||
          (t.title || "").toLowerCase().includes(p.toLowerCase()) ||
          (t.description || "").toLowerCase().includes(p.toLowerCase())
      );
      push({
        name: p,
        status: timeline ? "Completed" : "Active",
        summary: timeline?.description || `Local project focused on ${p.toLowerCase()}.`,
        date: timeline?.year || null,
      });
      return;
    }
    push({
      name: p.title || p.name,
      status: p.status || "Active",
      summary: p.summary || p.description || "",
      date: p.date || p.year || null,
      image: p.image || null,
    });
  });

  const skip = /training|mentoring|cohort|awareness|shalom/i;
  (payload.catchmentActivities || [])
    .filter((a) => a.community === name && a.project && !skip.test(a.project))
    .forEach((a) => {
      push({
        name: a.project,
        status: a.status || "Active",
        summary: `Community-led project in ${name}.`,
        date: a.date || null,
      });
    });

  (payload.dash?.timeline || []).forEach((t) => {
    if (!t.title) return;
    push({
      name: t.title,
      status: t.status || "Active",
      summary: t.description || "",
      date: t.year || t.date || null,
    });
  });

  return items;
}

function formatPppDate(value) {
  if (!value) return "";
  if (/^\d{4}$/.test(String(value))) return String(value);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function stageIndex(stageLabel) {
  const needle = String(stageLabel || "").toLowerCase();
  const i = JOURNEY_STAGES.findIndex(
    (s) => needle.includes(s.label.toLowerCase()) || needle.includes(s.id)
  );
  return i;
}

function isInactive(payload) {
  return /inactive/i.test(`${payload.community.status || ""} ${journeyStage(payload)}`);
}

function projectType(title = "") {
  return /\bchips?\b|church[- ]led/i.test(title) ? "CHIP" : "PPP";
}

function collectMedia(payload, data) {
  const photos = (data?.stories?.stories || [])
    .filter((s) => s.communityId === payload.community.id || s.communityId === payload.community.slug)
    .filter((s) => s.image)
    .map((s) => ({ src: s.image, alt: s.title || payload.community.name, caption: s.title || "" }));

  const videos = (data?.knowledgeHub?.items?.videos || data?.knowledgeHub?.videos || [])
    .filter((v) => v.communityId === payload.community.id || v.communitySlug === payload.community.slug)
    .slice(0, 3);

  const reports = (data?.reports?.reports || []).filter(
    (r) =>
      (r.communityIds || []).includes(payload.community.id) ||
      (r.communitySlugs || []).includes(payload.community.slug)
  );

  return { photos, videos, reports };
}

/** Community-tagged stories first, then published stories from the same area (verified-content.json). */
function communityStories(payload, data) {
  const all = data?.stories?.stories || [];
  const out = [];
  const seen = new Set();
  const add = (story, area, sourceUrl) => {
    if (!story || seen.has(story.id)) return;
    seen.add(story.id);
    out.push({ story, area, sourceUrl: sourceUrl || story.sourceUrl || "" });
  };

  all
    .filter((s) => s.communityId === payload.community.id || s.communityId === payload.community.slug)
    .forEach((s) => add(s, null));

  (data?.verifiedContent?.areaStories || [])
    .filter((e) => (e.catchmentIds || []).includes(payload.catchment.id))
    .forEach((e) => add(all.find((s) => s.id === e.storyId), e.area, e.sourceUrl));

  return out;
}

function verifiedOutcomes(payload, data) {
  const map = data?.verifiedContent?.communityOutcomes || {};
  return (map[payload.community.id] || map[payload.community.slug] || []).filter(
    (o) => o && o.title && o.sourceUrl
  );
}

/* -------------------------------------------------------------------------- */
/* 1 — Community entry                                                        */
/* -------------------------------------------------------------------------- */

function renderHero(payload, data) {
  const freshness = resolvePublicFreshness(data, "communities");
  const img = heroImage(payload);
  const lead =
    payload.dash?.hero?.description ||
    `${payload.community.name} is one community in the ${payload.catchment.name} nearby group — a public picture of pastor-led transformation.`;

  return `
    <header class="cm-entry" data-cm-section="hero" data-cm-entry>
      <div class="cm-entry__media" aria-hidden="true" data-cm-entry-media>
        <img src="${img}" alt="" fetchpriority="high">
        <span class="cm-entry__veil"></span>
      </div>
      <nav class="cm-entry__zoom container" aria-label="Geographic hierarchy" data-cm-entry-zoom>
        <a href="#/africa" data-link>Africa</a>
        <span aria-hidden="true">→</span>
        <a href="#/country/${payload.country.slug}" data-link>${payload.country.name}</a>
        <span aria-hidden="true">→</span>
        <a href="#/catchment/${payload.country.slug}/${payload.catchment.slug}" data-link>${payload.catchment.name}</a>
        <span aria-hidden="true">→</span>
        <span class="is-here">${payload.community.name}</span>
      </nav>
      <div class="container cm-entry__grid">
        <div class="cm-entry__left" data-cm-entry-copy>
          <p class="cm-kicker cm-kicker--light">Community</p>
          <h1 class="cm-entry__name" data-cm-entry-name><span>${payload.community.name}</span></h1>
        </div>
        <div class="cm-entry__right" data-cm-entry-meta>
          <p class="cm-entry__place"><span>Catchment</span><strong>${payload.catchment.name}</strong></p>
          <p class="cm-entry__place"><span>Country</span><strong>${payload.country.name}</strong></p>
          <p class="cm-entry__place"><span>Location</span><strong>${locationLine(payload)}</strong></p>
          <p class="cm-entry__lead">${lead}</p>
          <p class="cm-entry__privacy">This page shares a high-level public view. Detailed personal, household, financial, and operational records remain inside PA’s internal systems.</p>
          ${
            freshness.reportingPeriod || freshness.lastUpdatedLabel
              ? `<div class="cm-entry__fresh">
                  ${freshness.reportingPeriod ? `<span><em>Reporting</em> ${freshness.reportingPeriod}</span>` : ""}
                  <span><em>Updated</em> ${freshness.lastUpdatedLabel}</span>
                </div>`
              : ""
          }
        </div>
      </div>
    </header>`;
}

/* -------------------------------------------------------------------------- */
/* 2 — Location                                                               */
/* -------------------------------------------------------------------------- */

function renderLocation(payload) {
  const map = payload.geoMap
    ? `<div class="cm-loc__map" data-cm-map data-cm-rise>
        ${renderHubGeoMap(payload.geoMap, { variant: "full", mapId: "community-local" })}
      </div>`
    : `<p class="cm-empty" data-cm-rise>A detailed map will appear as geographic data expands.</p>`;

  return `
    <section class="cm-loc" data-cm-section="location" id="cm-places" aria-labelledby="cm-loc-title">
      <div class="container cm-loc__layout">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Location</p>
          <h2 id="cm-loc-title" class="cm-sec-title">Where ${payload.community.name} sits</h2>
          <p class="cm-sec-lead">${locationLine(payload)}. This map focuses on this community within its nearby group.</p>
        </header>
        ${map}
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 3 — Journey track                                                          */
/* -------------------------------------------------------------------------- */

function renderJourney(payload) {
  const stage = journeyStage(payload);
  const current = stageIndex(stage);
  const next = JOURNEY_STAGES[Math.min(current + 1, JOURNEY_STAGES.length - 1)];
  const onJourney = current >= 0;

  const steps = [
    `<li class="cm-journey__mark" aria-hidden="true"><span>Start</span></li>`,
    ...JOURNEY_STAGES.map((s, i) => {
      const state =
        i < current ? "is-past" : i === current ? "is-current" : "is-next";
      return `<li class="cm-journey__step ${state}" data-cm-journey-step style="--i:${i}">
        <span class="cm-journey__dot" aria-hidden="true"></span>
        <span class="cm-journey__n">${i === current ? "Current" : `Phase ${String(i + 1).padStart(2, "0")}`}</span>
        <strong>${s.label}</strong>
        <em>Month ${s.month}</em>
      </li>`;
    }),
    !onJourney
      ? `<li class="cm-journey__mark"><span>Status</span><strong>${stage}</strong></li>`
      : current < JOURNEY_STAGES.length - 1
        ? `<li class="cm-journey__mark cm-journey__mark--next"><span>Next</span><strong>${next.label}</strong></li>`
        : `<li class="cm-journey__mark"><span>Journey</span><strong>Continuing</strong></li>`,
  ].join("");
  const nowNote = onJourney
    ? `Current stage: <strong>${stage}</strong> · Phase ${current + 1} of ${JOURNEY_STAGES.length}`
    : `Current status: <strong>${stage}</strong> — not currently moving through a journey stage in public reporting.`;

  return `
    <section class="cm-journey" data-cm-section="journey" id="cm-journey" aria-labelledby="cm-journey-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Two-year journey</p>
          <h2 id="cm-journey-title" class="cm-sec-title">Where ${payload.community.name} is now</h2>
          <p class="cm-sec-lead">Communities move through awareness, engagement, training, implementation, and multiplication over about two years.</p>
          <p class="cm-journey__now">${nowNote}</p>
        </header>
        <ol class="cm-journey__track" data-cm-journey data-cm-rise>${steps}</ol>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 4 — Glance (compact typography — once)                                     */
/* -------------------------------------------------------------------------- */

function renderGlance(payload) {
  const reach = publicReach(payload.community, payload.analytics);
  const projects = collectCommunityPpps(payload).length;
  const a = analyticsFor(payload.community, payload.analytics);

  const figure = (label, n) =>
    n != null
      ? { label, value: formatNumber(n), count: n }
      : { label, value: "—", count: null, note: "Not yet reported" };

  const tiles = [figure("Shalom Groups", reach.shalom), figure("Households", reach.households)];
  const projectCount = projects || (typeof a?.projects === "number" ? a.projects : null);
  if (projectCount != null && projectCount > 0) {
    tiles.push({ label: "PPPs & CHIPs", value: formatNumber(projectCount), count: projectCount });
  }

  return `
    <section class="cm-glance" data-cm-section="glance" id="cm-reach" aria-labelledby="cm-glance-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Community at a glance</p>
          <h2 id="cm-glance-title" class="cm-sec-title">Public figures for ${payload.community.name}</h2>
          <p class="cm-sec-lead">Only figures approved for public display appear here.</p>
        </header>
        <div class="cm-glance__field" data-cm-rise>
          ${tiles
            .map(
              (t) => `<div class="cm-glance__item">
                <strong${t.count != null ? ` data-cm-count="${t.count}"` : ""}>${t.value}</strong>
                <span>${t.label}</span>
                ${t.note ? `<em class="cm-glance__note">${t.note}</em>` : ""}
              </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 5 — What is happening (projects)                                           */
/* -------------------------------------------------------------------------- */

function renderProjects(payload) {
  const projects = collectCommunityPpps(payload);
  const place = payload.community.name;

  if (!projects.length) {
    return `
      <section class="cm-work" data-cm-section="work" id="cm-projects" aria-labelledby="cm-work-title">
        <div class="container">
          <header class="cm-sec-head cm-sec-head--light" data-cm-rise>
            <p class="cm-kicker cm-kicker--light">What is happening here</p>
            <h2 id="cm-work-title" class="cm-sec-title cm-sec-title--light">PPPs &amp; CHIPs in ${place}</h2>
            <p class="cm-sec-lead cm-sec-lead--light">No Pastor-Planned Projects (PPPs) or Church-led initiatives (CHIPs) are publicly listed for ${place} yet.</p>
          </header>
        </div>
      </section>`;
  }

  const items = projects
    .slice(0, 8)
    .map(
      (p, i) => `
      <li>
        <button type="button" class="cm-work__row${i === 0 ? " is-open" : ""}" data-cm-proj="${i}" aria-expanded="${i === 0 ? "true" : "false"}">
          <span class="cm-work__n">${String(i + 1).padStart(2, "0")}</span>
          <strong class="cm-work__name"><span class="cm-work__type">${p.type}</span> ${p.name}</strong>
          <span class="cm-work__status">${p.status}${p.date ? ` · ${formatPppDate(p.date)}` : ""}</span>
        </button>
        <div class="cm-work__detail" data-cm-proj-detail="${i}" ${i === 0 ? "" : "hidden"}>
          <p>${p.summary}</p>
          ${p.image ? `<img src="${p.image}" alt="" loading="lazy" decoding="async">` : ""}
        </div>
      </li>`
    )
    .join("");

  return `
    <section class="cm-work" data-cm-section="work" id="cm-projects" aria-labelledby="cm-work-title">
      <div class="container">
        <header class="cm-sec-head cm-sec-head--light" data-cm-rise>
          <p class="cm-kicker cm-kicker--light">What is happening here</p>
          <h2 id="cm-work-title" class="cm-sec-title cm-sec-title--light">PPPs &amp; CHIPs in ${place}</h2>
          <p class="cm-sec-lead cm-sec-lead--light">Pastor-Planned Projects (PPPs) and Church-led initiatives (CHIPs) — titles and status only. Budgets, household lists, and operational detail stay internal.</p>
        </header>
        <ol class="cm-work__index" data-cm-work>${items}</ol>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 6 — Activity field (no personal profiles)                                  */
/* -------------------------------------------------------------------------- */

function renderActivity(payload) {
  const stage = journeyStage(payload);
  const projects = collectCommunityPpps(payload).length;
  const a = analyticsFor(payload.community, payload.analytics);
  const projectCount = projects || (typeof a?.projects === "number" ? a.projects : 0);
  const pastors = typeof payload.community.pastors === "number" ? payload.community.pastors : null;
  const current = stageIndex(stage);
  const inactive = isInactive(payload);
  const lastActivity = payload.community.lastActivity ? formatPppDate(payload.community.lastActivity) : "";

  const bars = [];

  if (pastors != null) {
    bars.push({
      label: "Pastor leaders",
      note: `${formatNumber(pastors)} in public reporting`,
      fill: Math.min(100, Math.round((pastors / 50) * 100)),
    });
  }

  bars.push(
    {
      label: "Journey activity",
      note: current >= 0 ? `${stage} · phase ${current + 1} of ${JOURNEY_STAGES.length}` : stage,
      fill: current >= 0 ? Math.round(((current + 1) / JOURNEY_STAGES.length) * 100) : 0,
    },
    {
      label: "PPP & CHIP activity",
      note: projectCount ? `${formatNumber(projectCount)} public projects` : "None publicly listed",
      fill: Math.min(100, projectCount * 18),
    }
  );

  const statusLine = `<p class="cm-activity__status">
      <span class="cm-activity__pill${inactive ? " is-inactive" : ""}">${inactive ? "Inactive" : "Active"}</span>
      ${lastActivity ? `<span>Last recorded activity: <strong>${lastActivity}</strong></span>` : ""}
    </p>`;

  return `
    <section class="cm-activity" data-cm-section="activity" id="cm-activity" aria-labelledby="cm-activity-title">
      <div class="container">
        <div class="cm-activity__stage">
          <header class="cm-activity__intro" data-cm-rise>
            <p class="cm-kicker">Leadership &amp; activity</p>
            <h2 id="cm-activity-title" class="cm-sec-title">How active is ${payload.community.name}?</h2>
            <p class="cm-sec-lead">High-level public signals of community life — not personal or operational detail.</p>
            ${statusLine}
          </header>
          <div class="cm-activity__field" data-cm-rise>
            ${bars
              .map(
                (b) => `<div class="cm-activity__row">
                  <div class="cm-activity__meta">
                    <strong>${b.label}</strong>
                    <span>${b.note}</span>
                  </div>
                  <div class="cm-activity__bar" aria-hidden="true"><span style="--fill:${b.fill}%" data-cm-bar></span></div>
                </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 7 — Progress (change over time — not repeating glance)                     */
/* -------------------------------------------------------------------------- */

function renderProgress(payload, data) {
  const stage = journeyStage(payload);
  const current = stageIndex(stage);
  const freshness = resolvePublicFreshness(data, "communities");
  const hasChart = Boolean(payload.dash?.charts?.impactLine);
  const c = payload.community;

  const indicators = [
    {
      label: "Journey completion",
      value: current >= 0 ? `${Math.round(((current + 1) / JOURNEY_STAGES.length) * 100)}%` : "0%",
      note: current >= 0 ? `Phase ${current + 1} of ${JOURNEY_STAGES.length}` : stage,
    },
    {
      label: "Participation rate",
      value: typeof c.participationRate === "number" ? `${c.participationRate}%` : "—",
      note: typeof c.participationRate === "number" ? "From PA's tracking dashboard" : "Not yet reported",
    },
    {
      label: "Activity trend",
      value: typeof c.trend === "number" ? `${c.trend > 0 ? "+" : ""}${c.trend}%` : "—",
      note: typeof c.trend === "number" ? (c.trend > 0 ? "Growing" : c.trend < 0 ? "Declining" : "Stable") : "Not yet reported",
      tone: typeof c.trend === "number" ? (c.trend > 0 ? "up" : c.trend < 0 ? "down" : "") : "",
    },
  ];

  const indicatorHtml = `<ul class="cm-progress__kpis" data-cm-rise>
      ${indicators
        .map(
          (k) => `<li class="cm-progress__kpi${k.tone ? ` is-${k.tone}` : ""}">
            <span>${k.label}</span>
            <strong>${k.value}</strong>
            <em>${k.note}</em>
          </li>`
        )
        .join("")}
    </ul>`;

  const path = JOURNEY_STAGES.map((s, i) => {
    const state = i < current ? "is-past" : i === current ? "is-current" : "";
    return `<li class="cm-progress__node ${state}" style="--i:${i}">
      <span class="cm-progress__pip" aria-hidden="true"></span>
      <strong>${s.label}</strong>
    </li>`;
  }).join("");

  return `
    <section class="cm-progress" data-cm-section="progress" id="cm-progress" aria-labelledby="cm-progress-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Community progress</p>
          <h2 id="cm-progress-title" class="cm-sec-title">How ${payload.community.name} is progressing</h2>
          <p class="cm-sec-lead">Simple public signals of movement — not a private operational dashboard.</p>
        </header>
        <div class="cm-progress__meta" data-cm-rise>
          ${freshness.reportingPeriod ? `<span><em>Reporting</em> ${freshness.reportingPeriod}</span>` : ""}
          <span><em>Updated</em> ${freshness.lastUpdatedLabel}</span>
        </div>
        ${indicatorHtml}
        <div class="cm-progress__path" data-cm-rise>
          <p class="cm-progress__axis"><span>Earlier</span><span>Current</span></p>
          <ol class="cm-progress__nodes" data-cm-progress-path>${path}</ol>
          <span class="cm-progress__line" aria-hidden="true"><span data-cm-progress-fill></span></span>
        </div>
        ${
          hasChart
            ? `<div class="cm-progress__chart" data-chart="impactLine" data-cm-rise>
                <h3>${payload.dash.charts.impactLine.title || "Progress over time"}</h3>
                <div class="cm-progress__canvas"><canvas aria-label="Community progress chart"></canvas></div>
              </div>`
            : ""
        }
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 8 — Documentary story                                                      */
/* -------------------------------------------------------------------------- */

function renderOutcomes(payload, outcomes) {
  if (!outcomes.length) return "";

  const items = outcomes
    .map(
      (o, i) => `<li class="cm-outcome" data-cm-rise style="--i:${i}">
        <span class="cm-outcome__n">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <strong>${o.title}</strong>
          ${o.detail ? `<p>${o.detail}</p>` : ""}
          <span class="cm-outcome__meta">
            ${o.date ? `<em>${formatPppDate(o.date)}</em>` : ""}
            <a href="${o.sourceUrl}" target="_blank" rel="noopener">Source →</a>
          </span>
        </div>
      </li>`
    )
    .join("");

  return `
    <section class="cm-outcomes" data-cm-section="outcomes" id="cm-outcomes" aria-labelledby="cm-outcomes-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Community outcomes</p>
          <h2 id="cm-outcomes-title" class="cm-sec-title">What has changed in ${payload.community.name}</h2>
          <p class="cm-sec-lead">Outcomes confirmed in Possibilities Africa’s published reporting.</p>
        </header>
        <ol class="cm-outcomes__list">${items}</ol>
      </div>
    </section>`;
}

function storyKicker(entry, payload) {
  return entry.area ? `Story from ${entry.area}` : `Story from ${payload.community.name}`;
}

function renderStory(payload, entries) {
  if (!entries.length) return "";

  const [lead, ...more] = entries;
  const story = lead.story;
  const href = story.slug ? `#/story/${story.slug}` : "#/stories";
  const img = story.image;
  const areaNote = lead.area
    ? `<p class="cm-story__note">Published by Possibilities Africa from ${lead.area}, the wider area around ${payload.community.name}.</p>`
    : "";

  const moreList = more.length
    ? `<ul class="cm-story__more" data-cm-rise>
        ${more
          .map(
            (e) => `<li><a href="${e.story.slug ? `#/story/${e.story.slug}` : "#/stories"}" data-link>
              <span>${storyKicker(e, payload)}</span>
              <strong>${e.story.title}</strong>
            </a></li>`
          )
          .join("")}
      </ul>`
    : "";

  return `
    <section class="cm-story" data-cm-section="story" id="cm-stories" aria-labelledby="cm-story-title">
      <div class="cm-story__bleed" data-cm-story>
        <figure class="cm-story__media" data-cm-story-media>
          <img src="${img}" alt="" loading="lazy" decoding="async">
          <span class="cm-story__veil"></span>
        </figure>
        <div class="container cm-story__caption" data-cm-rise>
          <p class="cm-kicker cm-kicker--light">${storyKicker(lead, payload)}</p>
          <h2 id="cm-story-title" class="cm-story__title">${story.title}</h2>
          ${story.excerpt ? `<p class="cm-story__excerpt">${story.excerpt}</p>` : ""}
          ${areaNote}
          <div class="cm-story__actions">
            <a class="cm-story__cta" href="${href}" data-link>Read story →</a>
          </div>
        </div>
      </div>
      ${moreList ? `<div class="container">${moreList}</div>` : ""}
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 9 — Media strip (community-only)                                           */
/* -------------------------------------------------------------------------- */

function renderMedia(payload, media) {
  const photos = media.photos || [];
  const videos = media.videos || [];
  if (!photos.length && !videos.length) return "";

  const items = [
    ...photos.map(
      (p) => `<figure class="cm-media__item" data-cm-rise>
        <img src="${p.src}" alt="${p.alt || ""}" loading="lazy" decoding="async">
        ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}
      </figure>`
    ),
    ...videos.map(
      (v) => `<a class="cm-media__item cm-media__item--video" href="${v.href || "#/resources"}" data-link data-cm-rise>
        <span class="cm-media__tag">Video</span>
        <strong>${v.title}</strong>
        <span>${v.summary || "Watch"}</span>
      </a>`
    ),
  ].join("");

  return `
    <section class="cm-media" data-cm-section="media" id="cm-media" aria-labelledby="cm-media-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Community media</p>
          <h2 id="cm-media-title" class="cm-sec-title">Visual archive</h2>
          <p class="cm-sec-lead">Approved photos and media connected to ${payload.community.name}.</p>
        </header>
        <div class="cm-media__strip">${items}</div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 10 — Community resources (only if community-specific)                      */
/* -------------------------------------------------------------------------- */

function renderResources(payload, media) {
  const reports = media.reports || [];
  if (!reports.length) return "";

  const pubs = reports
    .slice(0, 4)
    .map(
      (r, i) => `<a class="cm-know__item" href="#/field-reports" data-link data-cm-rise style="--i:${i}">
        <span class="cm-know__type">${r.type || "Report"}</span>
        <strong>${r.title}</strong>
        <span>${r.summary || r.period || ""}</span>
        <em>View →</em>
      </a>`
    )
    .join("");

  return `
    <section class="cm-know" data-cm-section="resources" id="cm-resources" aria-labelledby="cm-know-title">
      <div class="container">
        <header class="cm-sec-head" data-cm-rise>
          <p class="cm-kicker">Community record</p>
          <h2 id="cm-know-title" class="cm-sec-title">Resources for ${payload.community.name}</h2>
        </header>
        <div class="cm-know__list">${pubs}</div>
      </div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* 11 — What is next                                                          */
/* -------------------------------------------------------------------------- */

function renderNext(payload) {
  const stage = journeyStage(payload);
  const current = stageIndex(stage);
  const nextStage =
    current < JOURNEY_STAGES.length - 1 ? JOURNEY_STAGES[current + 1] : null;

  const siblings = (payload.siblingCommunities || [])
    .filter((c) => c.slug !== payload.community.slug)
    .slice(0, 6);

  const siblingLinks = siblings.length
    ? siblings
        .map(
          (c) => `<a href="#/community/${payload.country.slug}/${payload.catchment.slug}/${c.slug}" data-link>${c.name}</a>`
        )
        .join("")
    : "";

  return `
    <section class="cm-next" data-cm-section="next" id="cm-next" aria-labelledby="cm-next-title">
      <div class="container cm-next__inner" data-cm-rise>
        <div>
          <p class="cm-kicker">The journey continues</p>
          <h2 id="cm-next-title" class="cm-sec-title">What comes next for ${payload.community.name}</h2>
          ${
            nextStage
              ? `<p class="cm-next__stage">Next stage on the public journey: <strong>${nextStage.label}</strong> <em>(Month ${nextStage.month})</em></p>`
              : `<p class="cm-next__stage">This community is in the later stages of the public two-year journey.</p>`
          }
          <nav class="cm-next__dirs" aria-label="Continue exploring">
            <a href="#/catchment/${payload.country.slug}/${payload.catchment.slug}" data-link><span>01</span> Back to catchment <em>→</em></a>
            <a href="#/country/${payload.country.slug}" data-link><span>02</span> Explore country <em>→</em></a>
            <a href="#/africa" data-link><span>03</span> Return to Africa <em>→</em></a>
          </nav>
        </div>
        ${
          siblingLinks
            ? `<div class="cm-next__siblings">
                <p class="cm-kicker">Explore another community</p>
                <div class="cm-next__sib-list">${siblingLinks}</div>
              </div>`
            : ""
        }
      </div>
      <div class="cm-next__fade" aria-hidden="true"></div>
    </section>`;
}

/* -------------------------------------------------------------------------- */
/* Page assemble                                                              */
/* -------------------------------------------------------------------------- */

export function renderCommunityOutcomes(payload, _legacyStorySection = "", data = null) {
  const media = collectMedia(payload, data);
  const stories = communityStories(payload, data);
  const outcomes = verifiedOutcomes(payload, data);

  return `
    <div class="cm-page" data-community-outcomes data-country-slug="${payload.country.slug}" data-catchment-slug="${payload.catchment.slug}" data-community-slug="${payload.community.slug}">
      ${renderHero(payload, data)}
      ${renderLocation(payload)}
      ${renderJourney(payload)}
      ${renderGlance(payload)}
      ${renderProjects(payload)}
      ${renderOutcomes(payload, outcomes)}
      ${renderActivity(payload)}
      ${renderProgress(payload, data)}
      ${renderStory(payload, stories)}
      ${renderMedia(payload, media)}
      ${renderResources(payload, media)}
      ${renderNext(payload)}
    </div>`;
}

export function mountCommunityOutcomes(root, payload) {
  const page =
    root?.querySelector?.("[data-community-outcomes]") ||
    document.querySelector("[data-community-outcomes]");
  if (!page) return;

  bindHubGeoMap(page, {
    countrySlug: payload.country.slug,
    catchmentSlug: payload.catchment.slug,
  });
  highlightCommunityOnMap(page, payload.community.slug);
  bindProjectIndex(page);
  initCommunityMotion(page);
}

function bindProjectIndex(page) {
  const list = page.querySelector("[data-cm-work]");
  if (!list) return;
  const rows = [...list.querySelectorAll("[data-cm-proj]")];
  rows.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.cmProj);
      const already = btn.classList.contains("is-open");
      rows.forEach((r, n) => {
        const open = n === i && !already;
        r.classList.toggle("is-open", open);
        r.setAttribute("aria-expanded", open ? "true" : "false");
        const detail = list.querySelector(`[data-cm-proj-detail="${n}"]`);
        if (!detail) return;
        if (open) detail.removeAttribute("hidden");
        else detail.setAttribute("hidden", "");
      });
    });
  });
}

function initCommunityMotion(page) {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("cm-page--reduced");
    return;
  }

  const entry = page.querySelector("[data-cm-entry]");
  if (entry) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const zoom = entry.querySelector("[data-cm-entry-zoom]");
    const name = entry.querySelector("[data-cm-entry-name]");
    const media = entry.querySelector("[data-cm-entry-media]");
    const copy = entry.querySelector("[data-cm-entry-copy]");
    const meta = entry.querySelector("[data-cm-entry-meta]");
    if (zoom) tl.fromTo(zoom, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.45 });
    if (media) tl.fromTo(media, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9 }, "-=0.2");
    if (name) {
      gsap.set(name, { clipPath: "inset(0 0 100% 0)" });
      tl.to(name, { clipPath: "inset(0 0 0% 0)", duration: 0.85 }, "-=0.55");
    }
    if (copy) tl.fromTo(copy, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.55 }, "-=0.35");
    if (meta) tl.fromTo(meta, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.35");
  }

  const riseFrom = (section, el) => {
    if (el.classList.contains("cm-sec-head")) return { opacity: 0, y: 20 };
    switch (section) {
      case "location":
        return { opacity: 0, scale: 0.95 };
      case "story":
        return { opacity: 0, x: 40 };
      case "media":
        return { opacity: 0, y: 30, scale: 0.9 };
      case "resources":
        return { opacity: 0, y: 36 };
      case "next":
        return { opacity: 0, x: -24 };
      default:
        return { opacity: 0, y: 22 };
    }
  };

  page.querySelectorAll("[data-cm-rise]").forEach((el) => {
    const section = el.closest("[data-cm-section]")?.dataset.cmSection;
    if (section === "glance" && el.classList.contains("cm-glance__field")) return;
    if (section === "work" && el.matches("[data-cm-work]")) return;
    gsap.fromTo(el, riseFrom(section, el), {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.65,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  const glanceField = page.querySelector(".cm-glance__field");
  if (glanceField) {
    gsap.fromTo(
      glanceField.children,
      { opacity: 0, rotationX: -70, y: 20, transformOrigin: "50% 100%" },
      {
        opacity: 1,
        rotationX: 0,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "back.out(1.5)",
        clearProps: "transform",
        scrollTrigger: { trigger: glanceField, start: "top 85%", once: true },
      }
    );
  }

  const workRows = page.querySelectorAll("[data-cm-work] > li");
  if (workRows.length) {
    gsap.fromTo(
      workRows,
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: page.querySelector("[data-cm-work]"), start: "top 85%", once: true },
      }
    );
  }

  const nodes = page.querySelectorAll("[data-cm-progress-path] .cm-progress__node");
  if (nodes.length) {
    gsap.fromTo(
      nodes,
      { scale: 0.6, opacity: 0 },
      {
        scale: 1,
        opacity: (i, el) => (el.classList.contains("is-past") || el.classList.contains("is-current") ? 1 : 0.5),
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(2)",
        clearProps: "transform",
        scrollTrigger: { trigger: page.querySelector("[data-cm-progress-path]"), start: "top 82%", once: true },
      }
    );
  }

  page.querySelectorAll("[data-cm-count]").forEach((el) => {
    const target = parseFloat(el.dataset.cmCount);
    if (Number.isNaN(target)) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: () => {
        el.textContent = target >= 1000 ? Math.round(obj.val).toLocaleString() : Math.round(obj.val);
      },
    });
  });

  const journey = page.querySelector("[data-cm-journey]");
  if (journey && typeof ScrollTrigger !== "undefined") {
    const steps = journey.querySelectorAll("[data-cm-journey-step]");
    gsap.fromTo(
      steps,
      { opacity: 0.35, x: -12 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: journey, start: "top 78%", once: true },
      }
    );
  }

  const fill = page.querySelector("[data-cm-progress-fill]");
  if (fill && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      fill,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: page.querySelector("[data-cm-progress-path]"),
          start: "top 75%",
          end: "bottom 55%",
          scrub: 0.35,
        },
      }
    );
  }

  page.querySelectorAll("[data-cm-bar]").forEach((bar) => {
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.85,
        ease: "power2.out",
        transformOrigin: "left center",
        scrollTrigger: { trigger: bar, start: "top 88%", once: true },
      }
    );
  });

  const storyMedia = page.querySelector("[data-cm-story-media]");
  if (storyMedia) {
    gsap.fromTo(
      storyMedia,
      { clipPath: "inset(0% 100% 0% 0% round 1.4rem)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 1.4rem)",
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector("[data-cm-story]"), start: "top 80%", once: true },
      }
    );
  }

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

export function destroyCommunityOutcomes() {}
