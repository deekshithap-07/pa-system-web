/**
 * Shared helpers for Knowledge Hub filtering and downloads.
 */

export function getCountryName(countries, countryId) {
  if (!countryId) return "—";
  const c = countries.countries?.find((x) => x.id === countryId);
  return c?.name || countryId;
}

export function getCatchmentName(catchments, catchmentId) {
  if (!catchmentId) return "—";
  const c = catchments.catchments?.find((x) => x.id === catchmentId);
  return c?.name || catchmentId;
}

export function getCommunityName(communities, communityId) {
  if (!communityId) return "—";
  const c = communities.communities?.find((x) => x.id === communityId);
  return c?.name || communityId;
}

export function enrichStory(story, data) {
  return {
    ...story,
    country: getCountryName(data.countries, story.countryId),
    catchment: getCatchmentName(data.catchments, story.catchmentId),
    community: getCommunityName(data.communities, story.communityId),
  };
}

export function filterByCountryAndProgram(items, { countryId, program }) {
  return items.filter((item) => {
    const countryMatch = !countryId || countryId === "all" || item.countryId === countryId || item.countryIds?.includes(countryId);
    const programMatch = !program || program === "all" || item.program === program;
    return countryMatch && programMatch;
  });
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildInsightPack(packId, data) {
  const packs = {
    "pack-network-2024": {
      title: "Network Performance Pack 2024",
      generated: new Date().toISOString(),
      kpis: data.scorecard?.kpis,
      countryStats: data.scorecard?.countryStats,
      growthTrends: data.scorecard?.growthTrends,
    },
    "pack-shalom-trends": {
      title: "Shalom Groups Trend Analysis",
      generated: new Date().toISOString(),
      shalomTrend: data.insightsAnalytics?.trendAnalysis?.shalomGroups,
      householdReach: data.insightsAnalytics?.trendAnalysis?.householdReach,
    },
    "pack-cbc-readiness": {
      title: "CBC Index & Readiness Levels",
      generated: new Date().toISOString(),
      cbcIndex: data.insightsAnalytics?.cbcIndex,
      readinessLevels: data.insightsAnalytics?.readinessLevels,
    },
  };
  return packs[packId] || { title: "Insight Pack", data: packId };
}
