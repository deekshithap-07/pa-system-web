/**
 * Static JSON data layer.
 * Replace fetch() URLs with API endpoints when backend is connected.
 */

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
};

async function load(key) {
  if (cache[key]) return cache[key];
  const res = await fetch(FILES[key]);
  if (!res.ok) throw new Error(`Failed to load ${key}`);
  cache[key] = await res.json();
  return cache[key];
}

export async function getAllData() {
  const [countries, catchments, communities, stories, reports, charts, mapPaths, home, mapMetrics, countryHubs, catchmentHubs, africaIntelligence, geoLocations, scorecard, knowledgeHub, insightsAnalytics, ministryModel] =
    await Promise.all([
      load("countries"),
      load("catchments"),
      load("communities"),
      load("stories"),
      load("reports"),
      load("charts"),
      load("mapPaths"),
      load("home"),
      load("mapMetrics"),
      load("countryHubs"),
      load("catchmentHubs"),
      load("africaIntelligence"),
      load("geoLocations"),
      load("scorecard"),
      load("knowledgeHub"),
      load("insightsAnalytics"),
      load("ministryModel"),
    ]);
  return { countries, catchments, communities, stories, reports, charts, mapPaths, home, mapMetrics, countryHubs, catchmentHubs, africaIntelligence, geoLocations, scorecard, knowledgeHub, insightsAnalytics, ministryModel };
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
