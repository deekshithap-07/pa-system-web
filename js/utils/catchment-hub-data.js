import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunitiesByCatchment,
  getDashboard,
  getStoriesByIds,
  getReportsByIds,
} from "./data.js";

export function buildCatchmentHubPayload(countrySlug, catchmentSlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return null;

  const catchment = getCatchmentBySlug(data.catchments, country.id, catchmentSlug);
  if (!catchment) return null;

  const hubEntry = data.catchmentHubs?.hubs?.[catchmentSlug] || null;
  const dashboard = getDashboard(data.charts, `catchment:${catchment.id}`);
  const communities = getCommunitiesByCatchment(data.communities, catchment.id);

  const stories = getStoriesByIds(
    data.stories,
    hubEntry?.storyIds ||
      data.stories.stories.filter((s) => s.catchmentId === catchment.id).map((s) => s.id)
  );

  const reports = getReportsByIds(
    data.reports,
    hubEntry?.reportIds || data.reports.reports.filter((r) => r.countryIds?.includes(country.id)).map((r) => r.id)
  );

  const communityCards = communities.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    status: c.status || c.journeyStage || "—",
    progress: c.leadershipScore ?? 0,
    pastors: c.pastors ?? 0,
    shalomGroups: c.shalomGroups ?? 0,
    households: c.households ?? 0,
    population: c.households > 0 ? c.households * 5 : 1200,
  }));

  if (hubEntry) {
    return {
      country,
      catchment,
      communities,
      communityCards,
      stories,
      reports,
      countrySlug,
      catchmentSlug,
      catchmentName: catchment.name,
      countryName: country.name,
      ...hubEntry,
    };
  }

  return buildDefaultCatchmentPayload(country, catchment, communities, communityCards, stories, reports, dashboard, countrySlug, catchmentSlug);
}

function buildDefaultCatchmentPayload(
  country,
  catchment,
  communities,
  communityCards,
  stories,
  reports,
  dashboard,
  countrySlug,
  catchmentSlug
) {
  return {
    country,
    catchment,
    communities,
    communityCards,
    stories,
    reports,
    countrySlug,
    catchmentSlug,
    catchmentName: catchment.name,
    countryName: country.name,
    description: dashboard.hero?.description || `${catchment.name} catchment in ${country.name}.`,
    overview: dashboard.hero?.description || `Pastor-led transformation across ${catchment.summary.communities} communities in ${catchment.name}.`,
    heroTagline: `${country.name} · Catchment Area`,
    growthStatus: catchment.status === "active" ? "Active" : "Emerging",
    kpis: [
      { id: "communities", label: "Communities", value: catchment.summary.communities, direction: "neutral" },
      { id: "households", label: "Households", value: catchment.summary.households, direction: "neutral" },
      { id: "shalom", label: "Shalom Groups", value: catchment.summary.shalomGroups || 0, direction: "neutral" },
      { id: "ppp", label: "PPP Projects", value: 0, direction: "neutral" },
      { id: "chips", label: "CHIPs", value: 0, direction: "neutral" },
      { id: "leadership", label: "Leadership Teams", value: catchment.summary.communities, direction: "neutral" },
      { id: "growth", label: "Growth Status", value: 0, text: catchment.status, direction: "neutral" },
    ],
    activities: [],
    insights: Object.entries(dashboard.sectors || {}).map(([key, s]) => ({
      id: key,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      metric: s.metric,
      score: s.score,
      trend: s.trend,
      summary: s.metric,
    })),
    charts: {
      communityGrowth: dashboard.charts?.communityGrowth || { type: "bar", title: "Community Growth", labels: [], data: [] },
      householdReach: dashboard.charts?.timelineArea || { type: "area", title: "Household Reach", labels: [], data: [] },
      projectProgress: dashboard.charts?.sectorBar || { type: "bar", title: "Project Progress", labels: [], data: [] },
      leadershipDev: dashboard.charts?.leadershipScores || { type: "line", title: "Leadership Development", labels: [], data: [] },
    },
    communityMap: {
      viewBox: "0 0 200 180",
      catchmentPath: "M25,25 L175,20 L180,160 L30,165 Z",
      communities: communities.map((c, i) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        path: `M${30 + i * 35},70 L${60 + i * 35},65 L${65 + i * 35},120 L${35 + i * 35},125 Z`,
        status: c.journeyStage || "—",
        progress: c.leadershipScore ?? 0,
      })),
    },
  };
}
