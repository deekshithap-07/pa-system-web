/**
 * Builds community fact-sheet content for map pin overlays.
 * Pulls from community records, chart dashboards, and country-hub activities.
 */

import { getDashboard } from "../../utils/data.js";
import { formatNumber } from "../../utils/format.js";

function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function kpiFromDash(dash, label) {
  return (dash?.kpis || []).find((k) => k.label === label || k.text === label);
}

function cyclePhase(community, dash) {
  const stageKpi = (dash?.kpis || []).find((k) => /journey/i.test(k.label || ""));
  if (stageKpi?.text) return stageKpi.text;
  if (community.journeyStage && community.journeyStage !== "Inactive") return community.journeyStage;
  return community.journeyStage || "Not started";
}

function leadershipScore(community, dash) {
  const kpi = kpiFromDash(dash, "Leadership Score");
  if (kpi?.value != null) return kpi.value;
  const radar = dash?.charts?.leadershipRadar?.data;
  if (radar?.length) {
    return Math.round(radar.reduce((s, v) => s + v, 0) / radar.length);
  }
  return null;
}

function leadershipIndicators(dash) {
  const radar = dash?.charts?.leadershipRadar;
  if (!radar?.labels?.length || !radar?.data?.length) return [];
  return radar.labels.map((label, i) => ({
    label,
    score: radar.data[i] ?? 0,
  }));
}

function activeProjects(community, dash, countryHub) {
  const projects = [];
  const seen = new Set();

  (dash?.ppps || []).forEach((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const sector = Object.values(dash?.sectors || {}).find((s) =>
      String(s.metric || "").toLowerCase().includes(name.toLowerCase())
    );
    projects.push({
      name,
      type: "PPP",
      progress: sector?.score ?? null,
      status: sector?.trend || "active",
    });
  });

  (dash?.chips || []).forEach((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    projects.push({
      name,
      type: "CHIP",
      progress: null,
      status: "active",
    });
  });

  const activities = countryHub?.activities || [];
  activities
    .filter((a) => a.community === community.name)
    .forEach((a) => {
      const key = a.project.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      projects.push({
        name: a.project,
        type: "Programme",
        progress: a.status === "Completed" ? 100 : a.status === "Ongoing" ? 65 : 40,
        status: a.status,
      });
    });

  return projects;
}

function performanceIndicators(community, dash) {
  const items = [
    { label: "Households", value: formatNumber(community.households ?? 0) },
    { label: "Pastors", value: formatNumber(community.pastors ?? 0) },
    { label: "Shalom groups", value: formatNumber(community.shalomGroups ?? 0) },
  ];

  if (community.participationRate != null) {
    items.push({ label: "Participation", value: `${community.participationRate}%` });
  }
  if (community.trend != null) {
    const sign = community.trend > 0 ? "+" : "";
    items.push({ label: "Trend", value: `${sign}${community.trend}%`, accent: community.trend >= 0 ? "#00C48C" : "#F5A623" });
  }
  if (community.lastActivity) {
    items.push({ label: "Last activity", value: community.lastActivity });
  }

  const impact = dash?.charts?.impactLine?.data;
  if (impact?.length) {
    items.push({ label: "Impact index", value: impact[impact.length - 1], accent: "#34D3FF" });
  }

  return items;
}

export function resolveCommunityDashboard(charts, community) {
  if (!charts?.dashboards) return charts?.defaultDashboard || {};
  return (
    charts.dashboards[`community:${community.id}`] ||
    charts.dashboards[`community:${community.slug}`] ||
    charts.defaultDashboard ||
    {}
  );
}

export function buildCommunityFactSheetContext({ community, country, catchment, charts, countryHubs }) {
  const dash = resolveCommunityDashboard(charts, community);
  const hub = countryHubs?.hubs?.[country.slug] || countryHubs?.[country.slug] || null;

  return {
    community,
    country,
    catchment,
    dash,
    cyclePhase: cyclePhase(community, dash),
    leadershipScore: leadershipScore(community, dash),
    leadershipIndicators: leadershipIndicators(dash),
    projects: activeProjects(community, dash, hub),
    performance: performanceIndicators(community, dash),
    hubLink: `#/community/${country.slug}/${catchment.slug}/${community.slug}`,
  };
}

export function renderCommunityFactSheetHTML(ctx) {
  const { community, country, catchment, dash, cyclePhase: phase, leadershipScore: ls, projects, performance } = ctx;

  const leadershipRows = ctx.leadershipIndicators
    .map(
      (ind) =>
        `<div class="map-factsheet__lead-item">
          <span class="map-factsheet__lead-label">${escapeHtml(ind.label)}</span>
          <span class="map-factsheet__lead-bar"><span style="width:${Math.min(100, ind.score)}%"></span></span>
          <span class="map-factsheet__lead-val">${ind.score}</span>
        </div>`
    )
    .join("");

  const projectRows = projects.length
    ? projects
        .map((p) => {
          const pct = p.progress != null ? `${p.progress}%` : "—";
          const barWidth = p.progress != null ? Math.min(100, p.progress) : 0;
          return `<li class="map-factsheet__project">
            <div class="map-factsheet__project-head">
              <strong>${escapeHtml(p.name)}</strong>
              <span class="map-factsheet__project-type">${escapeHtml(p.type)}</span>
            </div>
            <div class="map-factsheet__project-progress">
              <div class="map-factsheet__progress-bar"><span style="width:${barWidth}%"></span></div>
              <span>${pct}</span>
            </div>
            ${p.status ? `<span class="map-factsheet__project-status">${escapeHtml(p.status)}</span>` : ""}
          </li>`;
        })
        .join("")
    : `<li class="map-factsheet__empty">No active projects recorded yet.</li>`;

  const perfGrid = performance
    .map(
      (p) =>
        `<div class="map-factsheet__perf">
          <dt>${escapeHtml(p.label)}</dt>
          <dd${p.accent ? ` style="color:${p.accent}"` : ""}>${escapeHtml(p.value)}</dd>
        </div>`
    )
    .join("");

  const description = dash?.hero?.description || "";

  return `
    <article class="map-factsheet__card" role="dialog" aria-labelledby="map-factsheet-title">
      <header class="map-factsheet__head">
        <div>
          <p class="map-factsheet__eyebrow">${escapeHtml(catchment.name)} · ${escapeHtml(country.name)}</p>
          <h3 class="map-factsheet__title" id="map-factsheet-title">${escapeHtml(community.name)}</h3>
          ${description ? `<p class="map-factsheet__desc">${escapeHtml(description)}</p>` : ""}
        </div>
        <button type="button" class="map-factsheet__close" aria-label="Close fact sheet">×</button>
      </header>

      <section class="map-factsheet__section">
        <h4>Current cycle phase</h4>
        <p class="map-factsheet__phase">${escapeHtml(phase)}</p>
      </section>

      <section class="map-factsheet__section">
        <h4>Leadership structure</h4>
        ${ls != null ? `<p class="map-factsheet__score">Leadership score <strong>${ls}</strong>/100</p>` : ""}
        ${leadershipRows ? `<div class="map-factsheet__lead-grid">${leadershipRows}</div>` : `<p class="map-factsheet__muted">Leadership data pending for this community.</p>`}
      </section>

      <section class="map-factsheet__section">
        <h4>Active projects</h4>
        <ul class="map-factsheet__projects">${projectRows}</ul>
      </section>

      <section class="map-factsheet__section">
        <h4>Performance indicators</h4>
        <dl class="map-factsheet__perf-grid">${perfGrid}</dl>
      </section>

      <footer class="map-factsheet__foot">
        <a href="${ctx.hubLink}" class="map-factsheet__cta" data-link>Open full community hub →</a>
      </footer>
    </article>`;
}

export { escapeHtml, getDashboard };
