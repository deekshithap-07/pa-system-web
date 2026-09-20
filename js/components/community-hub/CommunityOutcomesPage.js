/**
 * Community profile — public, high-level transformation picture.
 * Sensitive personal, household, financial, or operational detail stays internal.
 *
 * Section order (community brief):
 * 1. Name & general location
 * 2. Stage in the 2-year journey
 * 3. Shalom Groups & households (public-approved only)
 * 4. Projects being implemented
 * 5. High-level progress indicators
 * 6. Community transformation story
 * 7. Map / geographic context
 * 8. Related reports, photos or videos
 */

import { formatNumber } from "../../utils/format.js";
import { renderPageBack, renderWbPageHero, bindWbPageHero } from "../shared/wb-page-hero.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { highlightCommunityOnMap } from "../../utils/hub-geo-maps.js";
import { renderJourneyTrack } from "../shared/story-chapters.js";
import { renderDataFreshness } from "../../utils/public-api.js";
import { paPriorityTopics } from "../shared/pa-programmes.js";
import { renderDevelopmentTopics, bindDevelopmentTopics } from "../home-development-topics.js";

let prioritiesBinding = null;

function analyticsFor(community, analytics) {
  return analytics?.communityComparison?.communities?.find((c) => c.id === community.id) || null;
}

/** Public reach flags — omit unless approved for public display. */
function publicReach(community, analytics) {
  const a = analyticsFor(community, analytics);
  const flags = community.publicDisplay || {};
  const shalom =
    flags.shalomGroups === false
      ? null
      : community.shalomGroups ?? a?.shalomGroups ?? null;
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

/* 1 — Community name and general location */
function renderIdentity(payload) {
  const stage = journeyStage(payload);
  const place = locationLine(payload);
  const lead =
    payload.dash?.hero?.description ||
    `${payload.community.name} is one community in the ${payload.catchment.name} nearby group — a public picture of pastor-led transformation.`;

  return `
    <section class="cm-profile__identity" data-cm-section id="cm-identity">
      <div class="container" data-cm-rise>
        <p class="wb-out__eyebrow">Community profile</p>
        <h2>${payload.community.name}</h2>
        <p class="cm-profile__location">${place}</p>
        <p class="cm-profile__lead">${lead}</p>
        <p class="cm-profile__note">This page shares a high-level public view. Detailed personal, household, financial, and operational records remain inside PA’s internal systems.</p>
        <p class="wb-out__status"><span>${payload.catchment.name}</span> · <span>${stage}</span></p>
      </div>
    </section>`;
}

/* 2 — Stage in the 2-year journey */
function renderJourney(payload) {
  const stage = journeyStage(payload);
  return `
    <section class="cm-profile__journey" data-cm-section id="cm-journey">
      <div class="container">
        <header class="cm-profile__head" data-cm-rise>
          <p class="wb-out__eyebrow">Two-year journey</p>
          <h2>Stage in ${payload.community.name}</h2>
          <p>Communities move through awareness, engagement, training, implementation, and multiplication over about two years.</p>
          <p class="cm-profile__stage-now">Current stage: <strong>${stage}</strong></p>
        </header>
        <div data-cm-rise>${renderJourneyTrack(stage)}</div>
      </div>
    </section>`;
}

/* 3 — Shalom Groups and households (public-approved) */
function renderPublicReach(payload) {
  const reach = publicReach(payload.community, payload.analytics);
  const tiles = [];

  if (reach.shalom != null) {
    tiles.push({
      label: "Shalom Groups",
      value: formatNumber(reach.shalom),
      note: "Faith groups walking with households",
    });
  }
  if (reach.households != null) {
    tiles.push({
      label: "Households",
      value: formatNumber(reach.households),
      note: "Households reached in public reporting",
    });
  }

  if (!tiles.length) {
    return `
      <section class="cm-profile__reach" data-cm-section id="cm-reach">
        <div class="container">
          <header class="cm-profile__head" data-cm-rise>
            <p class="wb-out__eyebrow">Public reach</p>
            <h2>Shalom Groups and households</h2>
            <p>Public counts for ${payload.community.name} are not approved for display yet. Internal tracking continues separately.</p>
          </header>
        </div>
      </section>`;
  }

  return `
    <section class="cm-profile__reach" data-cm-section id="cm-reach">
      <div class="container">
        <header class="cm-profile__head" data-cm-rise>
          <p class="wb-out__eyebrow">Public reach</p>
          <h2>Shalom Groups and households</h2>
          <p>Only figures approved for public display appear here.</p>
        </header>
        <div class="cm-profile__reach-grid">
          ${tiles
            .map(
              (t) => `<article class="cm-profile__reach-card" data-cm-rise>
              <strong>${t.value}</strong>
              <span>${t.label}</span>
              <p>${t.note}</p>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
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
      status: entry.status || "Active",
      summary: entry.summary || `Community project underway in ${name}.`,
      date: entry.date || null,
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

/* What is changing — five PA programmes (community-level) */
function renderWhatIsChanging(payload) {
  const place = payload.community.name;
  return renderDevelopmentTopics({
    sectionId: "cm-priorities",
    idPrefix: "cm-",
    bandClass: "wb-priorities-band--outcomes",
    titleHtml: `<span class="wb-priorities-band__lead">WHAT IS</span> <strong>CHANGING</strong>`,
    description: `Five programmes at work in ${place} — click + to expand each priority.`,
    topics: paPriorityTopics(payload.programmes),
  });
}

/* 4 — Projects being implemented */
function renderProjects(payload) {
  const projects = collectCommunityPpps(payload);
  const place = payload.community.name;

  const body = projects.length
    ? `<ul class="cm-ppp__list">
        ${projects
          .slice(0, 8)
          .map(
            (p) => `<li class="cm-ppp__item" data-cm-rise>
            <div class="cm-ppp__top">
              <span class="cm-ppp__badge">Project</span>
              ${p.status ? `<span class="cm-ppp__status">${p.status}</span>` : ""}
              ${p.date ? `<span class="cm-ppp__date">${formatPppDate(p.date)}</span>` : ""}
            </div>
            <h3>${p.name}</h3>
            <p>${p.summary}</p>
          </li>`
          )
          .join("")}
      </ul>`
    : `<p class="cm-ppp__empty" data-cm-rise>No public project summaries are listed for ${place} yet. Field teams continue planning water, farming, health, and livelihood work locally.</p>`;

  return `
    <section class="cm-ppp" data-cm-section id="cm-projects">
      <div class="container">
        <header class="cm-ppp__head" data-cm-rise>
          <p class="wb-out__eyebrow">Projects being implemented</p>
          <h2>What is underway in ${place}</h2>
          <p>High-level community projects — titles and status only. Budgets, household lists, and operational detail stay internal.</p>
        </header>
        ${body}
      </div>
    </section>`;
}

/* 5 — High-level progress indicators */
function renderProgress(payload) {
  const a = analyticsFor(payload.community, payload.analytics);
  const reach = publicReach(payload.community, payload.analytics);
  const projects = collectCommunityPpps(payload).length;
  const stage = journeyStage(payload);

  const indicators = [
    { label: "Journey stage", value: stage },
    { label: "Public projects", value: formatNumber(projects) },
  ];

  if (reach.shalom != null) {
    indicators.push({ label: "Shalom Groups", value: formatNumber(reach.shalom) });
  }
  if (reach.households != null) {
    indicators.push({ label: "Households (public)", value: formatNumber(reach.households) });
  }
  if (a?.projects != null && !projects) {
    indicators.push({ label: "Tracked projects", value: formatNumber(a.projects) });
  }

  const hasChart = Boolean(payload.dash?.charts?.impactLine);

  return `
    <section class="cm-profile__progress" data-cm-section id="cm-progress">
      <div class="container">
        <header class="cm-profile__head" data-cm-rise>
          <p class="wb-out__eyebrow">High-level progress</p>
          <h2>Indicators for ${payload.community.name}</h2>
          <p>Simple public signals of movement — not a private operational dashboard.</p>
        </header>
        <div class="cm-profile__progress-grid">
          ${indicators
            .map(
              (i) => `<article class="cm-profile__progress-card" data-cm-rise>
              <span>${i.label}</span>
              <strong>${i.value}</strong>
            </article>`
            )
            .join("")}
        </div>
        ${
          hasChart
            ? `<div class="cm-profile__chart" data-chart="impactLine" data-cm-rise>
                <h3>${payload.dash.charts.impactLine.title || "Progress over time"}</h3>
                <div class="cm-profile__chart-wrap"><canvas aria-label="Community progress chart"></canvas></div>
              </div>`
            : ""
        }
      </div>
    </section>`;
}

/* 7 — Map / geographic context */
function renderMap(payload) {
  if (!payload.geoMap) {
    return `
      <section class="wb-out__places cm-places--compact" id="cm-places" data-cm-section>
        <div class="container">
          <header class="wb-out__places-head" data-cm-rise>
            <p class="wb-out__eyebrow">Map and context</p>
            <h2>Where ${payload.community.name} sits</h2>
            <p>${locationLine(payload)}. A detailed map will appear as geographic data expands.</p>
          </header>
        </div>
      </section>`;
  }

  return `
    <section class="wb-out__places cm-places--compact" id="cm-places" data-cm-section>
      <div class="container">
        <div class="cm-places__layout">
          <header class="wb-out__places-head" data-cm-rise>
            <p class="wb-out__eyebrow">Map and context</p>
            <h2>Where ${payload.community.name} sits</h2>
            <p>${locationLine(payload)}. Tap a neighbour to open another community in this nearby group.</p>
          </header>
          <div class="wb-out__places-maps wb-out__places-maps--single" data-cm-map>
            ${renderHubGeoMap(payload.geoMap, { variant: "full", mapId: "community-outcomes" })}
          </div>
        </div>
      </div>
    </section>`;
}

/* 8 — Related reports, photos or videos */
function renderMediaResources(payload, media = {}) {
  const reports = media.reports || [];
  const photos = media.photos || [];
  const videos = media.videos || [];

  const reportHtml = reports.length
    ? reports
        .slice(0, 3)
        .map(
          (r) => `<a href="#/field-reports" class="cm-media__card" data-link data-cm-rise>
            <span class="cm-media__tag">Report</span>
            <strong>${r.title}</strong>
            <span>${r.summary || r.period || "Field report"}</span>
          </a>`
        )
        .join("")
    : `<a href="#/field-reports" class="cm-media__card" data-link data-cm-rise>
        <span class="cm-media__tag">Report</span>
        <strong>Field Reports</strong>
        <span>Ministry updates from across the network</span>
      </a>`;

  const photoHtml = photos
    .slice(0, 3)
    .map(
      (p) => `<figure class="cm-media__photo" data-cm-rise>
        <img src="${p.src}" alt="${p.alt || payload.community.name}" loading="lazy" decoding="async">
        ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}
      </figure>`
    )
    .join("");

  const videoHtml = videos
    .slice(0, 2)
    .map(
      (v) => `<a href="${v.href || "#/resources"}" class="cm-media__card" data-link data-cm-rise>
        <span class="cm-media__tag">Video</span>
        <strong>${v.title}</strong>
        <span>${v.summary || "Watch related media"}</span>
      </a>`
    )
    .join("");

  const explore = [
    {
      tag: "Nearby group",
      title: payload.catchment.name,
      text: "Other communities in this catchment",
      href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}`,
      tone: "maroon",
    },
    {
      tag: "Country",
      title: `${payload.country.name} page`,
      text: "Stories and figures for the whole nation",
      href: `#/country/${payload.country.slug}`,
      tone: "gold",
    },
    {
      tag: "Knowledge",
      title: "Knowledge Hub",
      text: "Reports, guides, and learning resources",
      href: "#/resources",
      tone: "green",
    },
  ];

  return `
    <section class="cm-media" data-cm-section id="cm-media">
      <div class="container">
        <header class="cm-profile__head" data-cm-rise>
          <p class="wb-out__eyebrow">Reports, photos and videos</p>
          <h2>Related public resources</h2>
          <p>Open field evidence and media that sit beside this community profile.</p>
        </header>
        <div class="cm-media__grid">
          ${reportHtml}
          ${videoHtml}
        </div>
        ${photoHtml ? `<div class="cm-media__photos">${photoHtml}</div>` : ""}
        <div class="wb-out-resources wb-out-resources--tiles cm-media__explore">
          ${explore
            .map(
              (item) => `<a href="${item.href}" class="wb-out-resource wb-out-resource--tile wb-out-resource--${item.tone}" data-link data-cm-rise>
              <span class="wb-out-resource__tag">${item.tag}</span>
              <strong>${item.title}</strong>
              <span>${item.text}</span>
              <span class="wb-out-resource__cta">Open →</span>
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function collectMedia(payload, data) {
  const reports = (data?.reports?.reports || []).filter((r) =>
    (r.countryIds || []).includes(payload.country.id)
  );
  const storyPhotos = (data?.stories?.stories || [])
    .filter((s) => s.communityId === payload.community.id || s.communityId === payload.community.slug)
    .filter((s) => s.image)
    .map((s) => ({ src: s.image, alt: s.title, caption: s.title }));

  const videos = (data?.knowledgeHub?.items?.videos || data?.knowledgeHub?.videos || []).slice(0, 2);

  return { reports, photos: storyPhotos, videos };
}

export function renderCommunityOutcomes(payload, storySection = "", data = null) {
  const countrySlug = payload.country.slug || "kenya";
  const heroImage =
    {
      kenya: "assets/country-heroes/kenya-hero-farmers.jpg",
      malawi: "assets/country-heroes/malawi-hero-savings.jpg",
      ethiopia: "assets/country-heroes/ethiopia-hero-farm.jpg",
      zambia: "assets/country-heroes/zambia-hero-crops.jpg",
    }[countrySlug] || "assets/country-heroes/kenya-hero-farmers.jpg";

  const media = collectMedia(payload, data);

  return `
    <div class="wb-out cm-out cm-profile" data-community-outcomes data-country-slug="${payload.country.slug}" data-catchment-slug="${payload.catchment.slug}" data-community-slug="${payload.community.slug}">
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
        lead: locationLine(payload),
        actions: [
          { label: "Back to nearby group", href: `#/catchment/${payload.country.slug}/${payload.catchment.slug}` },
          { label: "Field reports", href: "#/field-reports", primary: false },
        ],
      })}
      ${renderIdentity(payload)}
      <div class="container">${renderDataFreshness(data, { datasetId: "communities" })}</div>
      ${renderJourney(payload)}
      ${renderPublicReach(payload)}
      ${renderProjects(payload)}
      ${renderWhatIsChanging(payload)}
      ${renderProgress(payload)}
      ${storySection}
      ${renderMap(payload)}
      ${renderMediaResources(payload, media)}
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

  prioritiesBinding?.destroy?.();
  prioritiesBinding = bindDevelopmentTopics(page);

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
}

export function destroyCommunityOutcomes() {
  prioritiesBinding?.destroy?.();
  prioritiesBinding = null;
}
