/**
 * Static JSON data layer — public website side of the architecture.
 *
 * PA INTERNAL SYSTEMS → DATA / DB → API → PUBLIC WEBSITE
 * Replace FILES fetch URLs with approved public API endpoints when connected.
 * Do not load operational/private records into this layer.
 */

import {
  beginPublicDataLoad,
  markPublicSourceOk,
  markPublicSourceFailed,
  finishPublicDataLoad,
} from "./public-api.js";

const cache = {};

const FILES = {
  countries: "data/countries.json",
  catchments: "data/catchments.json",
  communities: "data/communities.json",
  stories: "data/stories.json",
  reports: "data/reports.json",
  charts: "data/charts.json",
  mapPaths: "data/map-paths.json",
  home: "data/home.json",
  mapMetrics: "data/map-country-metrics.json",
  countryHubs: "data/country-hubs.json",
  catchmentHubs: "data/catchment-hubs.json",
  africaIntelligence: "data/africa-intelligence.json",
  geoLocations: "data/geo-locations.json",
  scorecard: "data/scorecard.json",
  knowledgeHub: "data/knowledge-hub.json",
  insightsAnalytics: "data/insights-analytics.json",
  ministryModel: "data/ministry-model.json",
  workLocations: "data/work-locations.json",
  ourWork: "data/our-work.json",
  whereWeWork: "data/where-we-work.json",
  aboutPa: "data/about-pa.json",
  newsUpdates: "data/news-updates.json",
  publicCatalog: "data/public-catalog.json",
  regionOutlines: "data/region-outlines.json",
  verifiedContent: "data/verified-content.json",
};

async function load(key) {
  if (cache[key]) return cache[key];
  try {
    const res = await fetch(FILES[key]);
    if (!res.ok) throw new Error(`Failed to load ${key} (${res.status})`);
    cache[key] = await res.json();
    markPublicSourceOk(key);
    return cache[key];
  } catch (err) {
    markPublicSourceFailed(key, err);
    throw err;
  }
}

/** Soft-load optional catalog — site still boots if missing. */
async function loadOptional(key) {
  if (cache[key]) return cache[key];
  try {
    const res = await fetch(FILES[key]);
    if (!res.ok) throw new Error(`Failed to load ${key} (${res.status})`);
    cache[key] = await res.json();
    markPublicSourceOk(key);
    return cache[key];
  } catch (err) {
    markPublicSourceFailed(key, err);
    return null;
  }
}

export async function getAllData() {
  beginPublicDataLoad();

  const keys = [
    "countries",
    "catchments",
    "communities",
    "stories",
    "reports",
    "charts",
    "mapPaths",
    "home",
    "mapMetrics",
    "countryHubs",
    "catchmentHubs",
    "africaIntelligence",
    "geoLocations",
    "scorecard",
    "knowledgeHub",
    "insightsAnalytics",
    "ministryModel",
    "workLocations",
    "ourWork",
    "whereWeWork",
    "aboutPa",
    "newsUpdates",
  ];

  const values = await Promise.all(keys.map((k) => load(k)));
  const [publicCatalog, regionOutlines, verifiedContent] = await Promise.all([
    loadOptional("publicCatalog"),
    loadOptional("regionOutlines"),
    loadOptional("verifiedContent"),
  ]);
  const loadStatus = finishPublicDataLoad();

  const data = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
  data.publicCatalog = publicCatalog;
  data.regionOutlines = regionOutlines;
  data.verifiedContent = verifiedContent;
  data.publicLoadStatus = loadStatus;
  return data;
}

export function getCountryBySlug(countries, slug) {
  return countries.countries.find((c) => c.slug === slug) || null;
}

export function getCatchmentsByCountry(catchments, countryId) {
  return catchments.catchments.filter((c) => c.countryId === countryId);
}

export function getCatchmentBySlug(catchments, countryId, slug) {
  return catchments.catchments.find((c) => c.countryId === countryId && c.slug === slug) || null;
}

export function getCommunitiesByCatchment(communities, catchmentId) {
  return communities.communities.filter((c) => c.catchmentId === catchmentId);
}

export function getCommunityBySlug(communities, catchmentId, slug) {
  return communities.communities.find((c) => c.catchmentId === catchmentId && c.slug === slug) || null;
}

export function getDashboard(charts, key) {
  return charts.dashboards[key] || charts.defaultDashboard;
}

export function getStoriesByIds(stories, ids) {
  if (!ids?.length) return [];
  return stories.stories.filter((s) => ids.includes(s.id));
}

export function getReportsByIds(reports, ids) {
  if (!ids?.length) return [];
  return reports.reports.filter((r) => ids.includes(r.id));
}

export function buildMapCountries(countries, mapPaths) {
  const paths = mapPaths.paths;
  return countries.countries
    .filter((c) => paths[c.isoCode])
    .map((c) => ({ ...c, path: paths[c.isoCode] }));
}
