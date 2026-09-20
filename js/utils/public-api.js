/**
 * Public data services facade.
 *
 * Architecture (Vision Framework §10):
 *   PA INTERNAL SYSTEMS → DATA / DB → API / DATA SERVICES → PUBLIC WEBSITE
 *
 * This module is the website’s “API boundary”. Today it reads static JSON.
 * Later, swap loaders to HTTP APIs without changing page components.
 * Only approved public fields should pass through helpers here.
 */

const SENSITIVE_COMMUNITY_FIELDS = [
  "participationRate",
  "income",
  "financials",
  "budget",
  "householdList",
  "personalContacts",
  "internalNotes",
  "operationalIds",
  "trend",
  "lastActivity",
];

/** Runtime load log — surfaces stale/failed public data instead of failing silently. */
const loadLog = {
  startedAt: null,
  finishedAt: null,
  ok: [],
  failed: [],
};

export function beginPublicDataLoad() {
  loadLog.startedAt = new Date().toISOString();
  loadLog.finishedAt = null;
  loadLog.ok = [];
  loadLog.failed = [];
}

export function markPublicSourceOk(id) {
  loadLog.ok.push({ id, at: new Date().toISOString() });
}

export function markPublicSourceFailed(id, error) {
  loadLog.failed.push({
    id,
    at: new Date().toISOString(),
    message: error?.message || String(error || "Unknown error"),
  });
  console.warn(`[public-api] Failed to load “${id}”`, error);
}

export function finishPublicDataLoad() {
  loadLog.finishedAt = new Date().toISOString();
  return getPublicLoadStatus();
}

export function getPublicLoadStatus() {
  return {
    startedAt: loadLog.startedAt,
    finishedAt: loadLog.finishedAt,
    okCount: loadLog.ok.length,
    failedCount: loadLog.failed.length,
    failed: [...loadLog.failed],
    hasFailures: loadLog.failed.length > 0,
  };
}

/**
 * Strip sensitive operational fields from a community record for public pages.
 * Shalom / households remain only when publicDisplay allows (or defaults on).
 */
export function toPublicCommunity(community = {}) {
  if (!community) return null;
  const flags = community.publicDisplay || {};
  const clean = { ...community };

  SENSITIVE_COMMUNITY_FIELDS.forEach((key) => {
    delete clean[key];
  });

  if (flags.shalomGroups === false) delete clean.shalomGroups;
  if (flags.households === false) delete clean.households;

  // Never expose raw leadership / operational analytics on the public object
  delete clean.leadershipScore;
  delete clean.shalomLeaders;

  return clean;
}

/**
 * Narrow community comparison analytics to public-safe fields only.
 */
export function toPublicCommunityAnalytics(analytics, communityId) {
  const row = analytics?.communityComparison?.communities?.find((c) => c.id === communityId);
  if (!row) return null;
  return {
    id: row.id,
    stage: row.stage || null,
    projects: typeof row.projects === "number" ? row.projects : null,
    shalomGroups: typeof row.shalomGroups === "number" ? row.shalomGroups : null,
    households: typeof row.households === "number" ? row.households : null,
  };
}

/** Prefer scorecard meta, then public catalog dataset entry. */
export function resolvePublicFreshness(data, datasetId = "scorecard") {
  const sc = data?.scorecard?.meta || {};
  const catalog = data?.publicCatalog;
  const entry = (catalog?.datasets || []).find((d) => d.id === datasetId) || catalog?.datasets?.[0];

  const lastUpdated = sc.lastUpdated || entry?.lastPublished || null;
  const lastUpdatedLabel =
    sc.lastUpdatedLabel || entry?.lastPublishedLabel || formatIsoDate(lastUpdated) || "—";
  const reportingPeriod = sc.reportingPeriod || sc.period || null;
  const updateFrequency = entry?.updateFrequency || sc.updateFrequency || null;
  const load = getPublicLoadStatus();

  return {
    datasetId: entry?.id || datasetId,
    lastUpdated,
    lastUpdatedLabel,
    reportingPeriod,
    updateFrequency,
    sources: sc.sources || null,
    freshnessNote: sc.freshnessNote || null,
    loadFailed: load.hasFailures,
    loadFailedCount: load.failedCount,
  };
}

export function formatIsoDate(iso) {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const d = new Date(`${iso}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
  }
  return String(iso);
}

/**
 * Small freshness strip for public indicator pages.
 * Logs update time; warns if public sources failed to load.
 */
export function renderDataFreshness(data, { datasetId = "scorecard", className = "pa-freshness" } = {}) {
  const meta = resolvePublicFreshness(data, datasetId);
  const failNote = meta.loadFailed
    ? `<span class="pa-freshness__warn">Some public data sources failed to load (${meta.loadFailedCount}). Figures may be incomplete.</span>`
    : "";

  return `
    <aside class="${className}" data-public-freshness aria-label="Data freshness">
      <p class="pa-freshness__line">
        <span class="pa-freshness__label">Public data</span>
        ${meta.reportingPeriod ? `<span>Reporting ${meta.reportingPeriod}</span>` : ""}
        <span>Updated ${meta.lastUpdatedLabel}</span>
        ${meta.updateFrequency ? `<span>${meta.updateFrequency} refresh</span>` : ""}
      </p>
      ${failNote}
      ${meta.freshnessNote ? `<p class="pa-freshness__note">${meta.freshnessNote}</p>` : ""}
    </aside>`;
}

export function isEditorialSource(key, catalog) {
  return (catalog?.editorialSources || []).includes(key);
}

export function isOperationalSource(key, catalog) {
  return (catalog?.operationalSources || []).includes(key);
}
