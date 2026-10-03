/**
 * Country Hub — short portal answering: “What is happening in this country?”
 * Eight non-repeating sections. Each data type has one primary home.
 */

import {
  storiesForCountry,
  getCountryCover,
  getPaCountries,
} from "../../utils/work-locations.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { resolvePublicFreshness } from "../../utils/public-api.js";
import { bindPartnerContact } from "../contact-modal.js";
import { PA_PROGRAMMES, toFivePaProgrammes } from "../shared/pa-programmes.js";
import { programmeIdFor, isChip, HOW_PA_WORKS_HREF, PA_PPPS, pppFor } from "../shared/pa-model.js";
import { renderMetricContext } from "../shared/metric-context.js";

function storyHref(story) {
  return `#/story/${story.slug}`;
}

/** Story cards always use the original field photo — never generated artwork. */
function storyHeroImage(story) {
  return story.image || "";
}

export function featuredStories(data, hub) {
  const fromHub = hub.stories || [];
  if (fromHub.length) return fromHub;
  return storiesForCountry(data, hub.country?.id);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function countryCode(hub) {
  return (hub.country?.isoCode || hub.country?.slug || "PA").toString().slice(0, 3).toUpperCase();
}

function heroImage(hub, data) {
  const cover = getCountryCover(data, hub.country?.slug);
  return cover?.image ? cover : { image: "", label: "" };
}

function presenceLine(hub) {
  return hub.isPaNetwork
    ? `Possibilities Africa is present in ${hub.countryName} through pastor-led networks, nearby community groups, and a shared two-year journey.`
    : `This page shares regional context for ${hub.countryName}. Possibilities Africa does not currently operate a full network here.`;
}

/**
 * Country evidence for each of the five programs — only what this country has published:
 * its Pastor-Led Initiatives, field activities and stories. Definitions live on Home.
 */
export function countryProgrammeEvidence(hub, data) {
  const initiatives = hub.initiatives?.items || [];
  const activities = hub.activities || [];
  const stories = featuredStories(data, hub);
  const share = hub.charts?.programActivity
    ? toFivePaProgrammes(hub.charts.programActivity.labels, hub.charts.programActivity.data)
    : null;
  const shareTotal = share ? share.data.reduce((a, b) => a + b, 0) : 0;

  return PA_PROGRAMMES.map((p, i) => {
    const own = {
      initiatives: initiatives.filter((t) => programmeIdFor(t) === p.id),
      activities: activities
        .filter((a) => programmeIdFor(a.project) === p.id)
        .map((a) => ({ ...a, type: isChip(a.project) ? "CHIP" : "PPP" })),
      stories: stories.filter((s) => programmeIdFor(s.program) === p.id),
    };
    const evidenceText = [
      ...own.initiatives,
      ...own.activities.map((a) => a.project),
      ...own.stories.map((s) => s.title),
    ];
    const ppps = (PA_PPPS[p.id] || []).map((x) => ({
      ...x,
      examples: evidenceText.filter((t) => pppFor(t, p.id)?.id === x.id).length,
    }));
    return {
      ...p,
      ...own,
      ppps,
      active: own.initiatives.length + own.activities.length + own.stories.length > 0,
      sharePct: shareTotal ? Math.round((share.data[i] / shareTotal) * 100) : null,
    };
  });
}

/** Country PPP and CHIP picture: counts with growth, plus this country's own project examples. */
function countryProjects(hub) {
  const kpi = (id) => (hub.kpis || []).find((k) => k.id === id) || null;
  const activities = (hub.activities || []).filter((a) => a.project);
  const chipInitiatives = (hub.initiatives?.items || []).filter((t) => isChip(t));
  return {
    ppp: kpi("ppp"),
    chips: kpi("chips"),
    chipExamples: [
      ...activities.filter((a) => isChip(a.project)).map((a) => ({ title: a.project, where: a.community, status: a.status, date: a.date })),
      ...chipInitiatives.map((t) => ({ title: t, where: null, status: "Initiative" })),
    ],
    pppExamples: activities
      .filter((a) => !isChip(a.project))
      .map((a) => ({ title: a.project, where: a.community, status: a.status, date: a.date, programme: programmeIdFor(a.project) })),
  };
}

/* 01 — Country introduction (identity only — no counts) */
export function renderCountryIntro(hub, data) {
  const slug = hub.country?.slug || "";
  const cover = heroImage(hub, data);
  const presence = presenceLine(hub);
  const freshness = resolvePublicFreshness(data, "country-hubs");
  const intro = hub.overview || hub.description || presence;

  return `
    <header class="cp-entry" data-cp-section="hero" data-cp-entry>
      <div class="cp-entry__media" aria-hidden="true" data-cp-entry-media>
        ${cover.image ? `<img src="${cover.image}" alt="" fetchpriority="high">` : ""}
        <span class="cp-entry__veil"></span>
      </div>
      <div class="container cp-entry__grid">
        <div class="cp-entry__rail" data-cp-entry-rail>
          <span class="cp-entry__code">${countryCode(hub)}</span>
          <p class="cp-entry__eyebrow">${hub.heroTagline || "PA Network"}</p>
        </div>
        <div class="cp-entry__name-wrap" style="--cp-name-len:${Math.max(4, String(hub.countryName || "").length)}">
          <h1 id="cp-intro-title" class="cp-entry__name" data-cp-entry-name><span>${hub.countryName}</span></h1>
        </div>
        <div class="cp-entry__copy" data-cp-entry-copy>
          <p class="cp-entry__lead">${intro}</p>
          <p class="cp-entry__presence">${presence}</p>
          <div class="cp-entry__fresh">
            ${freshness.reportingPeriod ? `<span><em>Reporting</em> ${freshness.reportingPeriod}</span>` : ""}
            <span><em>Updated</em> ${freshness.lastUpdatedLabel}</span>
          </div>
          <div class="cp-entry__actions">
            ${
              hub.catchments?.length
                ? `<a class="cp-btn cp-btn--solid" href="#/country/${slug}/catchments" data-link>Catchments &amp; communities →</a>`
                : `<a class="cp-btn cp-btn--solid" href="#/country/${slug}/data" data-link>${hub.countryName} in numbers →</a>`
            }
            <a class="cp-btn cp-btn--ghost" href="#/country/${slug}/stories" data-link>Country stories</a>
          </div>
        </div>
      </div>
    </header>`;
}

/* 01a — Country film (click-to-play YouTube embed) */
export function renderCountryVideo(hub) {
  const v = hub.video;
  if (!v?.videoId) return "";
  const watchUrl = v.youtubeUrl || `https://www.youtube.com/watch?v=${v.videoId}`;
  return `
    <section class="cp-film" data-cp-section="film" aria-labelledby="cp-film-title">
      <div class="container cp-film__grid">
        <div class="cp-film__player" data-cp-film data-video-id="${v.videoId}" data-video-start="${v.start || 0}" data-video-title="${v.title || ""}" data-cp-reveal>
          <button type="button" class="cp-film__poster" data-cp-film-play aria-label="Play video: ${v.title || `PA in ${hub.countryName}`}">
            <img src="https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg" alt="" loading="lazy" decoding="async">
            <span class="cp-film__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg>
            </span>
          </button>
        </div>
        <div class="cp-film__copy" data-cp-reveal>
          <p class="cp-kicker">Watch · PA in ${hub.countryName}</p>
          <h2 id="cp-film-title" class="cp-sec-title">${v.title || `Possibilities Africa in ${hub.countryName}`}</h2>
          <p class="cp-sec-lead">A film by Possibilities Africa.</p>
          <a class="cp-text-link" href="${watchUrl}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
        </div>
      </div>
    </section>`;
}

export function bindCountryVideo(root) {
  const player = root.querySelector("[data-cp-film]");
  const btn = player?.querySelector("[data-cp-film-play]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const params = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" });
    const start = Number(player.dataset.videoStart) || 0;
    if (start > 0) params.set("start", String(start));
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube.com/embed/${player.dataset.videoId}?${params}`;
    frame.title = player.dataset.videoTitle || "Possibilities Africa video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    player.replaceChildren(frame);
  });
}

/* 01b — At a glance (headline figures, counted in place) */
const GLANCE_IDS = ["communities", "catchments", "pastors", "shalom", "ppp", "households", "programs"];

const GLANCE_SAMPLE_IDS = ["ppp", "programs"];

export function renderCountryGlance(hub, data = null) {
  const kpis = (hub.kpis || [])
    .filter((k) => GLANCE_IDS.includes(k.id) && typeof k.value === "number" && k.value > 0)
    .sort((a, b) => GLANCE_IDS.indexOf(a.id) - GLANCE_IDS.indexOf(b.id))
    .slice(0, 6);
  if (!kpis.length) return "";

  const items = kpis
    .map((k, i) => {
      const display = `${k.prefix || ""}${k.value.toLocaleString("en-US")}${k.suffix || ""}`;
      return `<li class="cp-glance__item cp-glance__item--${i % 3}">
        <span class="cp-glance__value">
          <span class="cp-glance__ghost" aria-hidden="true">${display}</span>
          <span class="cp-glance__num" data-cp-count="${k.value}" data-cp-prefix="${k.prefix || ""}" data-cp-suffix="${k.suffix || ""}">${display}</span>
        </span>
        <span class="cp-glance__label">${k.label}${GLANCE_SAMPLE_IDS.includes(k.id) ? ` ${SAMPLE_TAG}` : ""}</span>
        ${k.trend && k.direction === "up" ? `<span class="cp-glance__trend">${k.trend}</span>` : ""}
      </li>`;
    })
    .join("");

  return `
    <section class="cp-glance" data-cp-section="glance" aria-label="${hub.countryName} at a glance">
      <div class="container">
        <ul class="cp-glance__card" data-cp-glance>${items}</ul>
        ${renderMetricContext({
          meaning: "Places and people taking part in PA's work in this country.",
          where: hub.countryName,
          updated: data ? resolvePublicFreshness(data, "country-hubs").lastUpdatedLabel : "",
          source: "PA tracking system — figures tagged Sample are placeholders",
          sample: false,
          className: "cp-glance__ctx",
        })}
      </div>
    </section>`;
}

function regionLabel(hub, catchment) {
  const area = hub.geoMap?.catchmentAreas?.find((a) => a.id === catchment.id);
  if (area?.regionName) {
    const kind = area.regionKind ? ` ${area.regionKind.charAt(0).toUpperCase()}${area.regionKind.slice(1)}` : "";
    return `${area.regionName}${kind}`;
  }
  return catchment.region && catchment.region !== hub.countryName ? catchment.region : hub.countryName;
}

/* 02 — Map + location index (geography only — no aggregate counts) */
export function renderCountryMapPresence(hub) {
  const catchments = hub.catchments || [];
  const slug = hub.country?.slug || "";

  const index = catchments.length
    ? catchments
        .map(
          (c, i) => `
        <li>
          <a class="cp-geo__item" href="#/catchment/${slug}/${c.slug}" data-link
             data-cp-loc="${c.id}" data-cp-loc-slug="${c.slug}" data-cp-reveal style="--i:${i}">
            <span class="cp-geo__n">${String(i + 1).padStart(2, "0")}</span>
            <strong class="cp-geo__name">${c.name}</strong>
            <span class="cp-geo__region">${regionLabel(hub, c)}</span>
          </a>
        </li>`
        )
        .join("")
    : `<li><p class="cp-empty" data-cp-reveal>Locations will appear as the work grows in ${hub.countryName}.</p></li>`;

  const mapBlock = hub.geoMap
    ? `<div class="cp-geo__map" data-cp-reveal data-cp-map-root>
        ${renderHubGeoMap(hub.geoMap, { variant: "full", mapId: "country-portal", regions: true })}
      </div>`
    : `<p class="cp-empty" data-cp-reveal>Catchment mapping will appear as geographic data expands.</p>`;

  return `
    <section class="cp-geo" id="cp-map" data-cp-section="map" aria-labelledby="cp-map-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Where PA works</p>
          <h2 id="cp-map-title" class="cp-sec-title">Where PA is working in ${hub.countryName}</h2>
          <p class="cp-sec-lead">Open a catchment to explore its communities.</p>
          ${catchments.length ? `<a class="cp-geo__all" href="#/country/${slug}/catchments" data-link>See all ${catchments.length} catchments →</a>` : ""}
        </header>
        <div class="cp-geo__stage">
          ${mapBlock}
          <ol class="cp-geo__index" data-cp-loc-index aria-label="Locations in ${hub.countryName}">${index}</ol>
        </div>
      </div>
    </section>`;
}

/* 03 — What PA is doing (programmes + field activity — no intro/map/stats) */
function renderProgrammePanel(p, i, name) {
  const sampleShare =
    p.sharePct != null
      ? `<p class="cp-do__share"><span class="cp-do__share-bar" aria-hidden="true"><span style="--w:${p.sharePct}%"></span></span>
          <span><strong>${p.sharePct}%</strong> of reported program activity in ${name}</span> ${SAMPLE_TAG}</p>`
      : "";

  const initiatives = p.initiatives.length
    ? `<div class="cp-do__block">
        <h4>What PA ${name} is doing</h4>
        <ul class="cp-do__list">${p.initiatives.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>`
    : "";

  const field = p.activities.length
    ? `<div class="cp-do__block">
        <h4>In the field</h4>
        <ul class="cp-do__field">${p.activities
          .map(
            (a) => `<li>
              <span class="cp-do__tag cp-do__tag--${a.type.toLowerCase()}">${a.type}</span>
              <strong>${a.project}</strong>
              <span>${[pppFor(a.project, p.id)?.name, a.community, a.status, a.date ? formatDate(a.date) : ""].filter(Boolean).join(" · ")}</span>
            </li>`
          )
          .join("")}</ul>
      </div>`
    : "";

  const [story, ...moreStories] = p.stories;
  const example = story
    ? `<a class="cp-do__story" href="${storyHref(story)}" data-link>
        ${storyHeroImage(story) ? `<img src="${storyHeroImage(story)}" alt="" loading="lazy" decoding="async">` : ""}
        <span class="cp-do__story-copy">
          <span class="cp-do__story-kicker">Example from ${name}</span>
          <strong>${story.title}</strong>
          <span class="cp-do__story-go">Read the story →${moreStories.length ? ` <em>+${moreStories.length} more</em>` : ""}</span>
        </span>
      </a>`
    : "";

  const pppStrip = p.ppps?.length
    ? `<div class="cp-do__block cp-do__ppps">
        <h4>PPPs in ${name}</h4>
        <ul class="cp-do__ppp-list">${p.ppps
          .map(
            (x) => `<li class="${x.examples ? "is-on" : ""}">
              <span>${x.name}</span>
              <em>${x.examples ? `${x.examples} ${x.examples === 1 ? "example" : "examples"}` : "None published"}</em>
            </li>`
          )
          .join("")}</ul>
      </div>`
    : "";

  const body = p.active
    ? `${pppStrip}${initiatives}${field}${example}`
    : `${pppStrip}<p class="cp-empty">No published examples of this program in ${name} yet.</p>`;

  return `
      <article class="cp-do__panel${i === 0 ? " is-active" : ""}" data-cp-chapter-panel="${i}" ${i === 0 ? "" : "hidden"}>
        <span class="cp-do__big" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <p class="cp-do__status${p.active ? " is-active" : ""}">${p.active ? `Active in ${name}` : "No published activity yet"}</p>
        <h3>${p.title}</h3>
        ${sampleShare}
        <div class="cp-do__evidence">${body}</div>
      </article>`;
}

function renderCountryProjectsBlock(hub) {
  const proj = countryProjects(hub);
  const stat = (k, label) =>
    k && typeof k.value === "number"
      ? `<div class="cp-pc__stat">
          <span class="cp-pc__value">${k.value.toLocaleString("en-US")}</span>
          <span class="cp-pc__label">${label}</span>
          ${k.trend && k.direction === "up" ? `<span class="cp-pc__trend">▲ ${k.trend}</span>` : k.trend ? `<span class="cp-pc__trend is-flat">${k.trend}</span>` : ""}
        </div>`
      : "";
  const stats = `${stat(proj.ppp, "PPPs active")}${stat(proj.chips, "CHIPs")}`;
  const list = (items, empty) =>
    items.length
      ? `<ul class="cp-pc__list">${items
          .map(
            (x) => `<li><strong>${x.title}</strong>${x.where || x.status ? `<span>${[x.where, x.status, x.date ? formatDate(x.date) : ""].filter(Boolean).join(" · ")}</span>` : ""}</li>`
          )
          .join("")}</ul>`
      : `<p class="cp-pc__empty">${empty}</p>`;

  if (!stats && !proj.chipExamples.length && !proj.pppExamples.length) return "";

  return `
    <div class="cp-pc" data-cp-reveal>
      <header class="cp-pc__head">
        <h3>PPPs &amp; CHIPs in ${hub.countryName}</h3>
        <a class="cp-text-link" href="${HOW_PA_WORKS_HREF}" data-link>What are PPPs and CHIPs? →</a>
      </header>
      <div class="cp-pc__grid">
        ${stats ? `<div class="cp-pc__stats">${stats}<p class="cp-pc__note">${SAMPLE_TAG} Counts and growth from PA's tracking dashboard, awaiting verification.</p></div>` : ""}
        <div class="cp-pc__col">
          <h4>PPP activity in ${hub.countryName}</h4>
          ${list(proj.pppExamples, `No PPP field activity published for ${hub.countryName} yet.`)}
        </div>
        <div class="cp-pc__col">
          <h4>CHIPs in ${hub.countryName}</h4>
          ${list(proj.chipExamples, `No CHIPs published for ${hub.countryName} yet.`)}
        </div>
      </div>
    </div>`;
}

export function renderCountryProgrammes(hub, data) {
  const programmes = countryProgrammeEvidence(hub, data);
  const name = hub.countryName;
  const activeCount = programmes.filter((p) => p.active).length;
  const coveragePct = Math.round((activeCount / programmes.length) * 100);

  const nav = programmes
    .map(
      (p, i) => `
      <button type="button" class="cp-do__tab${i === 0 ? " is-active" : ""}${p.active ? "" : " is-quiet"}"
        data-cp-chapter="${i}" aria-selected="${i === 0 ? "true" : "false"}">
        <span>${String(i + 1).padStart(2, "0")}</span>
        <strong>${p.title}</strong>
        <i class="cp-do__dot${p.active ? " is-on" : ""}" aria-label="${p.active ? "Active" : "No published activity"}"></i>
      </button>`
    )
    .join("");

  const coverage = `
    <div class="cp-do__coverage" data-cp-reveal>
      <div class="cp-do__coverage-meter" role="img" aria-label="${activeCount} of 5 programs with published activity">
        ${programmes.map((p) => `<span class="${p.active ? "is-on" : ""}" title="${p.title}"></span>`).join("")}
      </div>
      <p><strong>${activeCount} / 5 programs</strong> · ${coveragePct}% program coverage in ${name}, based on published initiatives, field activity and stories.</p>
    </div>`;

  return `
    <section class="cp-do" data-cp-section="programmes" aria-labelledby="cp-do-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">What PA is doing</p>
          <h2 id="cp-do-title" class="cp-sec-title">How ${name} runs the five programs</h2>
          <p class="cp-sec-lead">Examples from ${name} only. <a class="cp-text-link" href="${HOW_PA_WORKS_HREF}" data-link>How the programs work →</a></p>
        </header>
        ${coverage}
        <div class="cp-do__stage" data-cp-chapters>
          <div class="cp-do__rail" role="tablist" aria-label="Programmes">${nav}</div>
          <div class="cp-do__detail">${programmes.map((p, i) => renderProgrammePanel(p, i, name)).join("")}</div>
        </div>
        ${renderCountryProjectsBlock(hub)}
      </div>
    </section>`;
}

/* 04 — Growth & progress (ONLY home for performance indicators) */
const BRAND = { maroon: "#5c2428", gold: "#e8a91a", green: "#3f9a4a", ochre: "#c48914" };
const SAMPLE_TAG = `<span class="pa-sample-tag" title="Sample figures — awaiting PA verification">Sample</span>`;

const TREND_CHARTS = [
  { key: "communitiesAdded", caption: "Total communities on the network each year.", size: "wide", color: BRAND.maroon },
  { key: "growthOverTime", caption: "Growth of the country network by year.", color: BRAND.gold },
  { key: "householdsReached", caption: "Households reached through community programs.", color: BRAND.green, type: "area" },
  { key: "leadershipDev", caption: "Leadership development by quarter.", color: BRAND.ochre },
  { key: "projectImpl", title: "PPP & CHIP focus areas", caption: "Projects by sector.", indexAxis: "y" },
  { key: "programActivity", title: "Activity across the five programs", caption: "Share of activity by PA program.", type: "doughnut", showLegend: true, showPercent: true, unit: "%" },
];

const HEADLINE_SERIES = [
  { key: "communitiesAdded", label: "Communities", color: BRAND.maroon },
  { key: "householdsReached", label: "Households reached", color: BRAND.green },
  { key: "leadershipDev", label: "Leadership score", color: BRAND.ochre },
  { key: "growthOverTime", label: "Network growth", color: BRAND.gold },
];

const hasSignal = (cfg) => Array.isArray(cfg?.data) && cfg.data.some((v) => Number(v) > 0);

/** Chart configs for the Growth & progress section, keyed by data-chart id. */
export function buildCountryTrendCharts(hub) {
  const charts = hub.charts || {};
  const configs = {};
  const panels = [];

  TREND_CHARTS.forEach((t) => {
    const cfg = charts[t.key];
    if (!hasSignal(cfg)) return;
    configs[t.key] = {
      ...cfg,
      ...(t.key === "programActivity" ? toFivePaProgrammes(cfg.labels, cfg.data) : {}),
      ...(t.key === "programActivity" ? { legendPosition: "bottom" } : {}),
      title: t.title || cfg.title,
      seriesLabel: t.title || cfg.title,
      color: t.color || BRAND.gold,
      type: t.type || cfg.type,
      ...(t.indexAxis ? { indexAxis: t.indexAxis } : {}),
      ...(t.showLegend ? { showLegend: true, showPercent: true, unit: t.unit } : {}),
    };
    panels.push({ key: t.key, title: t.title || cfg.title, caption: t.caption, size: t.size || "", sample: true });
  });

  const catchments = (hub.catchments || []).filter((c) => typeof c.summary?.pastors === "number");
  if (catchments.length > 1) {
    configs.catchmentCompare = {
      type: "bar",
      indexAxis: "y",
      title: "Pastor leaders by catchment",
      seriesLabel: "Pastor leaders",
      labels: catchments.map((c) => c.name),
      data: catchments.map((c) => c.summary.pastors),
      colors: catchments.map((_, i) => [BRAND.maroon, BRAND.gold, BRAND.green][i % 3]),
    };
    panels.push({
      key: "catchmentCompare",
      title: "Pastor leaders by catchment",
      caption: `How pastor leadership is spread across ${hub.countryName}.`,
      size: "",
      sample: false,
    });
  }

  const headline = HEADLINE_SERIES.filter((h) => hasSignal(charts[h.key]))
    .slice(0, 3)
    .map((h) => {
      const series = charts[h.key].data.map(Number);
      const first = series.find((v) => v > 0) ?? series[0];
      const last = series[series.length - 1];
      const pct = first > 0 ? Math.round(((last - first) / first) * 100) : null;
      const labels = charts[h.key].labels || [];
      configs[`spark-${h.key}`] = {
        type: "line",
        sparkline: true,
        labels,
        data: series,
        color: h.color,
        seriesLabel: h.label,
      };
      return {
        key: h.key,
        label: h.label,
        value: last.toLocaleString("en-US"),
        delta: pct == null ? "" : `${pct >= 0 ? "+" : ""}${pct}%`,
        since: labels[0] || "",
        up: pct == null ? null : pct >= 0,
      };
    });

  return { configs, panels, headline };
}

export function renderCountryTrends(hub, data) {
  const trend = hub.trendCharts || buildCountryTrendCharts(hub);
  if (!trend.panels.length && !trend.headline.length) return "";

  const freshness = resolvePublicFreshness(data, "country-hubs");

  const headline = trend.headline
    .map(
      (h) => `<li class="cp-trend-metric" data-chart="spark-${h.key}">
        <span class="cp-trend-metric__label">${h.label} ${SAMPLE_TAG}</span>
        <strong class="cp-trend-metric__value">${h.value}</strong>
        ${h.delta ? `<span class="cp-trend-metric__delta${h.up ? " is-up" : " is-down"}">${h.up ? "▲" : "▼"} ${h.delta} <em>since ${h.since}</em></span>` : ""}
        <div class="cp-trend-metric__spark"><canvas aria-label="${h.label} trend"></canvas></div>
      </li>`
    )
    .join("");

  const panels = trend.panels
    .map(
      (p) => `<article class="cp-progress__chart${p.size ? ` cp-progress__chart--${p.size}` : ""}" data-chart="${p.key}" data-cp-reveal>
        <header class="cp-progress__chart-head">
          <h3>${p.title} ${p.sample ? SAMPLE_TAG : ""}</h3>
          ${p.caption ? `<p>${p.caption}</p>` : ""}
        </header>
        <div class="cp-progress__canvas"><canvas aria-label="${p.title}"></canvas></div>
      </article>`
    )
    .join("");

  return `
    <section class="cp-progress" data-cp-section="trends" aria-labelledby="cp-trends-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Growth and progress</p>
          <h2 id="cp-trends-title" class="cp-sec-title">What is changing in ${hub.countryName}</h2>
          <p class="cp-sec-lead">Approved public trends over time — not a full dashboard.</p>
        </header>
        <div class="cp-progress__meta" data-cp-reveal>
          ${freshness.reportingPeriod ? `<span><em>Reporting</em> ${freshness.reportingPeriod}</span>` : ""}
          <span><em>Updated</em> ${freshness.lastUpdatedLabel}</span>
        </div>
        ${headline ? `<ul class="cp-trend-metrics" data-cp-reveal aria-label="Headline trends">${headline}</ul>` : ""}
        <div class="cp-progress__grid">${panels}</div>
        <p class="pa-sample-note" role="note">Charts tagged <strong>Sample</strong> use placeholder series awaiting PA verification. The catchment chart uses PA's tracking data.</p>
      </div>
    </section>`;
}

/* 05 — Transformation story (human meaning only) */
export function renderCountryFeaturedStories(hub, stories = []) {
  const list = stories.length ? stories : hub.stories || [];
  const allHref = `#/country/${hub.country?.slug || ""}/stories`;

  if (!list.length) {
    return `
      <section class="cp-story" data-cp-section="stories" aria-labelledby="cp-stories-title">
        <div class="container">
          <header class="cp-sec-head" data-cp-reveal>
            <p class="cp-kicker">Transformation story</p>
            <h2 id="cp-stories-title" class="cp-sec-title">Stories from ${hub.countryName}</h2>
            <p class="cp-sec-lead">Stories from this country will appear here as they are published.</p>
            <a class="cp-text-link" href="${allHref}" data-link>All stories →</a>
          </header>
        </div>
      </section>`;
  }

  const [featured, ...more] = list;
  const src = storyHeroImage(featured);
  const allLabel = `All ${list.length} ${list.length === 1 ? "story" : "stories"} from ${hub.countryName} →`;
  const moreHtml = more.length
    ? `<div class="container cp-story__more-wrap">
        <p class="cp-kicker">More stories from ${hub.countryName}</p>
        <ul class="cp-story__more" data-cp-reveal>
          ${more
            .map(
              (s) => `<li>
                <a class="cp-story__card" href="${storyHref(s)}" data-link>
                  <span class="cp-story__card-img">${storyHeroImage(s) ? `<img src="${storyHeroImage(s)}" alt="" loading="lazy" decoding="async">` : ""}</span>
                  <span class="cp-story__card-copy">
                    ${s.program ? `<span class="cp-story__card-tag">${s.program}</span>` : ""}
                    <strong>${s.title}</strong>
                    <span class="cp-story__card-go">Read the story →</span>
                  </span>
                </a>
              </li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

  return `
    <section class="cp-story" data-cp-section="stories" aria-labelledby="cp-stories-title">
      <div class="cp-story__bleed" data-cp-story>
        <figure class="cp-story__media" data-cp-story-media>
          ${src ? `<img src="${src}" alt="" loading="lazy" decoding="async">` : ""}
          <span class="cp-story__veil"></span>
        </figure>
        <div class="container cp-story__caption" data-cp-reveal>
          <p class="cp-kicker cp-kicker--light">A story from ${hub.countryName}</p>
          <h2 id="cp-stories-title" class="cp-story__title">${featured.title}</h2>
          ${featured.excerpt ? `<p class="cp-story__excerpt">${featured.excerpt}</p>` : ""}
          <a class="cp-story__cta" href="${storyHref(featured)}" data-link>Read the story →</a>
          <a class="cp-text-link cp-text-link--light" href="${allHref}" data-link style="margin-top:1rem">${allLabel}</a>
        </div>
      </div>
      ${moreHtml}
    </section>`;
}

/* 06 — Country knowledge (publications only) */
export function renderCountryReports(hub) {
  const reports = hub.reports || [];
  const slug = hub.country?.slug || "";

  const pubs = reports.length
    ? reports
        .map((r, i) => {
          const year = (r.period || r.date || r.year || "").toString().slice(0, 4) || "Report";
          return `
          <a class="cp-pubs__item" href="#/field-reports" data-link data-cp-reveal style="--i:${i}">
            <span class="cp-pubs__type">${r.type || "Field report"}</span>
            <span class="cp-pubs__year">${year}</span>
            <strong class="cp-pubs__title">${r.title}</strong>
            <span class="cp-pubs__go">View →</span>
          </a>`;
        })
        .join("")
    : `<p class="cp-empty" data-cp-reveal>Reports for this country will appear here.</p>`;

  return `
    <section class="cp-pubs" data-cp-section="reports" aria-labelledby="cp-reports-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row" data-cp-reveal>
          <div>
            <p class="cp-kicker">Country knowledge</p>
            <h2 id="cp-reports-title" class="cp-sec-title">Evidence from ${hub.countryName}</h2>
          </div>
          <a class="cp-text-link" href="#/field-reports" data-link>Open Field Reports →</a>
        </header>
        <div class="cp-pubs__shelf">${pubs}</div>
        <div class="cp-pubs__links" data-cp-reveal>
          <a href="#/resources" data-link>Knowledge Hub</a>
          <a href="#/country/${slug}/data" data-link>Country data</a>
        </div>
      </div>
    </section>`;
}

/* 07 — Latest updates (field log only) */
export function renderCountryUpdates(hub, data) {
  const slug = hub.country?.slug || "";
  const news = (data?.newsUpdates?.countryUpdates || []).filter((u) => u.slug === slug);
  const activities = (hub.activities || []).slice(0, 5);

  const notes = [];
  news.forEach((u) => {
    notes.push({
      date: u.dateLabel || "Update",
      type: "Country update",
      title: u.title,
      href: u.href || "#/news",
    });
  });
  if (!news.length) {
    activities.forEach((a) => {
      notes.push({
        date: formatDate(a.date),
        type: a.status || "Field note",
        title: a.project,
        href: null,
        detail: a.community,
      });
    });
  }

  if (!notes.length) {
    return `
      <section class="cp-log-sec" data-cp-section="updates" aria-labelledby="cp-updates-title">
        <div class="container">
          <header class="cp-sec-head cp-sec-head--light" data-cp-reveal>
            <p class="cp-kicker cp-kicker--light">Latest updates</p>
            <h2 id="cp-updates-title" class="cp-sec-title cp-sec-title--light">What is happening now</h2>
            <p class="cp-sec-lead cp-sec-lead--light">Recent updates for ${hub.countryName} will appear here.</p>
          </header>
        </div>
      </section>`;
  }

  return `
    <section class="cp-log-sec" data-cp-section="updates" aria-labelledby="cp-updates-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row cp-sec-head--light" data-cp-reveal>
          <div>
            <p class="cp-kicker cp-kicker--light">Latest updates</p>
            <h2 id="cp-updates-title" class="cp-sec-title cp-sec-title--light">Field notes</h2>
          </div>
          <a class="cp-text-link cp-text-link--light" href="#/news" data-link>All news →</a>
        </header>
        <div class="cp-log" data-cp-log>
          <span class="cp-log__line" aria-hidden="true"><span data-cp-log-fill></span></span>
          ${notes
            .map(
              (n, i) => `
            <article class="cp-log__item${i === 0 ? " is-latest" : ""}" data-cp-reveal style="--i:${i}">
              <time>${n.date}</time>
              <span class="cp-log__type">${n.type}</span>
              <h3>${n.title}</h3>
              ${n.detail ? `<p>${n.detail}</p>` : ""}
              ${n.href ? `<a href="${n.href}" data-link>Read more →</a>` : ""}
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

/* 08 — Explore another country */
export function renderCountryNetwork(hub, data) {
  const slug = hub.country?.slug || "";
  const name = hub.countryName;
  const countries = getPaCountries(data);
  const idx = countries.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? countries[idx - 1] : null;
  const next = idx >= 0 && idx < countries.length - 1 ? countries[idx + 1] : null;

  const others = countries
    .filter((c) => c.slug !== slug)
    .map(
      (c) => `<a class="cp-network__link" href="#/country/${c.slug}" data-link data-cp-country-link="${c.slug}">
        ${c.name}
      </a>`
    )
    .join("");

  return `
    <nav class="cp-network" data-cp-section="network" aria-label="Explore the PA network">
      <div class="container">
        <p class="cp-kicker">Explore the PA network</p>
        <div class="cp-network__swap" data-cp-reveal>
          ${
            prev
              ? `<a class="cp-network__prev" href="#/country/${prev.slug}" data-link data-cp-country-link="${prev.slug}">
                  <span>Previous</span><strong>${prev.name}</strong>
                </a>`
              : `<span></span>`
          }
          <p class="cp-network__current"><span>Now in</span><strong>${name}</strong></p>
          ${
            next
              ? `<a class="cp-network__next" href="#/country/${next.slug}" data-link data-cp-country-link="${next.slug}">
                  <span>Next</span><strong>${next.name}</strong>
                </a>`
              : `<span></span>`
          }
        </div>
        <div class="cp-network__list">${others}</div>
        <p class="cp-network__contact" data-cp-reveal>
          <button type="button" class="cp-btn cp-btn--ghost-dark" data-partner-contact>Contact PA</button>
        </p>
      </div>
      <div class="cp-network__fade" aria-hidden="true"></div>
    </nav>`;
}

/* -------------------------------------------------------------------------- */
/* Bindings                                                                   */
/* -------------------------------------------------------------------------- */

export function bindCountryProgrammes(root) {
  const stage = root.querySelector("[data-cp-chapters]");
  if (!stage) return;
  const tabs = [...stage.querySelectorAll("[data-cp-chapter]")];
  const panels = [...stage.querySelectorAll("[data-cp-chapter-panel]")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const i = Number(tab.dataset.cpChapter);
      tabs.forEach((t, n) => {
        const on = n === i;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach((p, n) => {
        const on = n === i;
        p.classList.remove("is-enter");
        p.classList.toggle("is-active", on);
        if (on) {
          p.removeAttribute("hidden");
          void p.offsetWidth;
          p.classList.add("is-enter");
        } else p.setAttribute("hidden", "");
      });
    });
  });
}

export function bindCountryMap(root, countrySlug) {
  let picked = null;
  const idForSlug = (slug) => root.querySelector(`[data-cp-loc-slug="${slug}"]`)?.dataset.cpLoc || null;

  bindHubGeoMap(root, {
    countrySlug,
    onCatchmentNavigate: (slug) => {
      const id = idForSlug(slug);
      if (id && picked === id) {
        location.hash = `#/catchment/${countrySlug}/${slug}`;
        return;
      }
      picked = id;
      highlight(id);
      markPicked(id);
    },
  });

  const index = root.querySelector("[data-cp-loc-index]");
  const mapRoot = root.querySelector("[data-cp-map-root] [data-hub-geo-map]");
  if (!index || !mapRoot) return;

  const markPicked = (id) => {
    index.querySelectorAll("[data-cp-loc]").forEach((item) => {
      const on = id != null && item.dataset.cpLoc === id;
      item.classList.toggle("is-picked", on);
      if (on) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  const svg = mapRoot.querySelector(".hub-geo-map__svg");
  svg?.querySelectorAll(".hub-geo-map__zone--region, .hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
    el.addEventListener("mouseleave", () => requestAnimationFrame(() => highlight(picked)));
  });

  const highlight = (id) => {
    if (!svg) return;
    svg.querySelectorAll(".hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
      el.classList.toggle("is-selected", id != null && el.dataset.entityId === id);
    });
    svg.querySelectorAll(".hub-geo-map__zone--region").forEach((el) => {
      el.classList.toggle("is-highlighted", id != null && el.dataset.catchmentId === id);
    });
    svg.classList.toggle("has-focus", id != null);
  };

  index.querySelectorAll("[data-cp-loc]").forEach((item) => {
    const id = item.dataset.cpLoc;
    item.addEventListener("mouseenter", () => {
      item.classList.add("is-hot");
      highlight(id);
    });
    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-hot");
      highlight(picked);
    });
    item.addEventListener("focus", () => highlight(id));
    item.addEventListener("blur", () => highlight(picked));
  });
}

export function bindCountryEngage(root) {
  return bindPartnerContact(root);
}

export function bindCountryStoryHero() {}
export function bindCountrySnapshot() {}

export function initCountryPageAnimations(root = document) {
  const page = root.querySelector?.("[data-country-hub]") || document.querySelector("[data-country-hub]");
  if (!page || typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("cp-page--reduced");
    return;
  }

  const entry = page.querySelector("[data-cp-entry]");
  if (entry) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const rail = entry.querySelector("[data-cp-entry-rail]");
    const name = entry.querySelector("[data-cp-entry-name]");
    const media = entry.querySelector("[data-cp-entry-media]");
    const copy = entry.querySelector("[data-cp-entry-copy]");

    if (rail) tl.fromTo(rail, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.55 });
    if (name) {
      gsap.set(name, { clipPath: "inset(0 0 100% 0)" });
      tl.to(name, { clipPath: "inset(0 0 0% 0)", duration: 0.85 }, "-=0.2");
    }
    if (media) tl.fromTo(media, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.95 }, "-=0.75");
    if (copy) tl.fromTo(copy, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  }

  /* Each section enters differently */
  const revealFrom = (section, el) => {
    const i = Number(el.style.getPropertyValue("--i")) || 0;
    const isHead = el.classList.contains("cp-sec-head");
    if (isHead) return { opacity: 0, y: 20 };
    switch (section) {
      case "map":
        return { opacity: 0, x: 28 };
      case "trends":
        return el.matches(".cp-progress__miles") ? { opacity: 0, scale: 0.94 } : { opacity: 0, y: 34 };
      case "reports":
        return { opacity: 0, y: 40, rotation: i % 2 ? 3 : -3 };
      case "updates":
        return { opacity: 0, x: i % 2 ? 16 : -16 };
      default:
        return { opacity: 0, y: 20 };
    }
  };

  page.querySelectorAll("[data-cp-reveal]").forEach((el) => {
    const section = el.closest("[data-cp-section]")?.dataset.cpSection;
    gsap.fromTo(el, revealFrom(section, el), {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotation: 0,
      duration: section === "reports" ? 0.75 : 0.6,
      ease: section === "reports" ? "back.out(1.4)" : "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  const glance = page.querySelector("[data-cp-glance]");
  if (glance) {
    const nums = [...glance.querySelectorAll("[data-cp-count]")];
    nums.forEach((el) => {
      el.textContent = `${el.dataset.cpPrefix || ""}0${el.dataset.cpSuffix || ""}`;
    });
    gsap.fromTo(
      glance.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.35, clearProps: "transform" }
    );
    nums.forEach((el) => {
      const target = Number(el.dataset.cpCount) || 0;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.8,
        delay: 0.45,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${el.dataset.cpPrefix || ""}${Math.round(obj.v).toLocaleString("en-US")}${el.dataset.cpSuffix || ""}`;
        },
      });
    });
  }

  const logFill = page.querySelector("[data-cp-log-fill]");
  if (logFill && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      logFill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: page.querySelector("[data-cp-log]"),
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.4,
        },
      }
    );
  }

  const storyMedia = page.querySelector("[data-cp-story-media]");
  if (storyMedia) {
    gsap.fromTo(
      storyMedia,
      { clipPath: "inset(10% 12% 10% 12%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: page.querySelector("[data-cp-story]"), start: "top 80%", once: true },
      }
    );
  }

  window.setTimeout(() => {
    page.querySelectorAll("[data-cp-reveal]").forEach((el) => {
      if (window.getComputedStyle(el).opacity === "0") gsap.set(el, { opacity: 1, y: 0, x: 0, clearProps: "transform" });
    });
  }, 10000);

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

/* Legacy stubs — removed duplicate sections */
export function renderCountryPresence() {
  return "";
}
export function renderCountryStats() {
  return "";
}
export function renderCountryFreshness() {
  return "";
}
export function renderCountryMapSection(hub) {
  return renderCountryMapPresence(hub);
}
export function renderCountryWhere() {
  return "";
}
export function renderCountryCommunities() {
  return "";
}
export function renderCountryEngage(hub, data) {
  return renderCountryNetwork(hub, data);
}
export function renderCountryStoryHero(hub, stories) {
  return renderCountryFeaturedStories(hub, stories);
}
export function renderByTheNumbers() {
  return "";
}
export function renderCountryOverview() {
  return "";
}
export function renderCountryLatest() {
  return "";
}
export function renderCountryProjects(hub) {
  return renderCountryReports(hub);
}
export function bindNumbersCarousel() {}
export function bindOverviewTabs() {}
