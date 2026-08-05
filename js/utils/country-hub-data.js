import {
  getCountryBySlug,
  getCatchmentsByCountry,
  getStoriesByIds,
  getReportsByIds,
} from "../utils/data.js";

/**
 * Assembles full Country Hub payload from mock JSON sources.
 * Single swap point for future API integration.
 */
export function buildCountryHubPayload(slug, data) {
  const country = getCountryBySlug(data.countries, slug);
  if (!country) return null;

  const hubEntry = data.countryHubs?.hubs?.[slug] || null;
  const metrics = data.mapMetrics?.metrics?.[country.isoCode] || {};
  const catchments = getCatchmentsByCountry(data.catchments, country.id);

  const stories = getStoriesByIds(
    data.stories,
    hubEntry?.storyIds || data.stories.stories.filter((s) => s.countryId === country.id).map((s) => s.id)
  );

  const reports = getReportsByIds(
    data.reports,
    hubEntry?.reportIds || data.reports.reports.filter((r) => r.countryIds?.includes(country.id)).map((r) => r.id)
  );

  if (hubEntry) {
    return {
      country,
      catchments,
      stories,
      reports,
      ...hubEntry,
      population: country.stats?.population ?? 0,
      isPaNetwork: country.isPaNetwork,
    };
  }

  return buildDefaultHubPayload(country, catchments, stories, reports, metrics);
}

function buildDefaultHubPayload(country, catchments, stories, reports, metrics) {
  const communities = country.summary?.communities ?? 0;
  return {
    country,
    catchments,
    stories,
    reports,
    countryName: country.name,
    description: country.isPaNetwork
      ? `Possibilities Africa network country — transformation data for ${country.name}.`
      : `Context data for ${country.name}. PA does not currently operate in this region.`,
    overview: country.isPaNetwork
      ? `Pastor-led holistic transformation is underway in ${country.name}. Detailed hub data will be expanded as the network grows.`
      : `Regional context data for ${country.name}. Poverty rate: ${country.stats?.povertyRate}%. Population: ${(country.stats?.population / 1e6).toFixed(1)}M.`,
    heroTagline: country.isPaNetwork ? "PA Network" : "Context Country",
    population: country.stats?.population ?? 0,
    isPaNetwork: country.isPaNetwork,
    kpis: [
      { id: "communities", label: "Communities", value: communities, direction: "neutral" },
      { id: "catchments", label: "Catchment Areas", value: catchments.length, direction: "neutral" },
      { id: "households", label: "Households", value: metrics.households ?? 0, direction: "neutral" },
      { id: "population", label: "Population Reached", value: country.summary?.livesImpacted ?? 0, direction: "neutral" },
      { id: "growth", label: "Growth", value: metrics.growth ?? 0, suffix: "%", prefix: "+", direction: "neutral" },
      { id: "programs", label: "Programs", value: country.isPaNetwork ? 5 : 0, direction: "neutral" },
    ],
    activities: [],
    insights: country.isPaNetwork
      ? [
          { id: "leadership", title: "Leadership", metric: "In development", score: metrics.progress ?? 0, trend: "—", summary: "Leadership development data coming soon." },
          { id: "community", title: "Community Development", metric: `${communities} communities`, score: 0, trend: "—", summary: "Community transformation programmes." },
        ]
      : [
          { id: "context", title: "Regional Context", metric: `${country.stats?.povertyRate}% poverty`, score: 0, trend: "—", summary: "PA ministry data not yet available for this region." },
        ],
    charts: {
      growthOverTime: { type: "line", title: "Growth Over Time", labels: ["2022", "2023", "2024"], data: [0, 0, metrics.growth ?? 0], color: "#009FDA" },
      householdsReached: { type: "area", title: "Households Reached", labels: ["2022", "2023", "2024"], data: [0, 0, metrics.households ?? 0], color: "#009FDA" },
    },
    catchmentMap: {
      viewBox: "0 0 160 200",
      countryPath: "M40,40 L130,35 L145,120 L120,180 L45,175 L30,90 Z",
      catchments: catchments.map((c, i) => ({
        id: c.id,
        name: c.name,
        path: `M${40 + i * 20},80 L${70 + i * 20},75 L${75 + i * 20},120 L${45 + i * 20},125 Z`,
        status: c.status,
      })),
    },
  };
}
