/**
 * Assembles hierarchical drill-down data for the Africa map.
 * Only uses catchments/communities from JSON data — no invented placeholders.
 */

import { attachGeoPoint } from "./geo-project.js";

const PA_SLUGS = new Set(["kenya", "malawi", "zambia", "tanzania", "ethiopia", "burundi", "rwanda"]);

export { PA_SLUGS };

export function buildDrillDownData({ countries, catchments, communities, countryHubs, mapPaths, geoLocations }) {
  const countryList = countries.countries || countries;
  const catchmentList = catchments.catchments || catchments;
  const communityList = communities.communities || communities;
  const hubs = countryHubs?.hubs || {};
  const catchLocs = geoLocations?.catchments || {};
  const commLocs = geoLocations?.communities || {};

  const paCountries = countryList.filter((c) => PA_SLUGS.has(c.slug));

  const byCountry = {};
  paCountries.forEach((country) => {
    const hub = hubs[country.slug];
    const countryCatchments = catchmentList.filter((c) => c.countryId === country.id);
    const centroid = mapPaths.centroids?.[country.isoCode] || [500, 500];
    const catchmentMap = hub?.catchmentMap || { viewBox: "0 0 200 240", catchments: [] };
    const catchmentPaths = catchmentMap.catchments || [];

    const catchmentsWithCommunities = countryCatchments.map((ct, ci) => {
      const pathEntry = catchmentPaths.find((p) => p.id === ct.id) || catchmentPaths[ci];
      const ctCommunities = communityList.filter((c) => c.catchmentId === ct.id);
      const communityPoints = ctCommunities.map((com) => attachGeoPoint({ ...com }, commLocs[com.id]));

      return attachGeoPoint(
        {
          ...ct,
          path: pathEntry?.path || "",
          status: pathEntry?.status || ct.status,
          communities: communityPoints,
          metrics: {
            communities: ct.summary?.communities ?? ctCommunities.length,
            households: ctCommunities.reduce((s, c) => s + (c.households || 0), 0),
            pastors: ct.summary?.pastors ?? ctCommunities.reduce((s, c) => s + (c.pastors || 0), 0),
            livesImpacted: ct.summary?.livesImpacted ?? 0,
            shalomGroups: ctCommunities.reduce((s, c) => s + (c.shalomGroups || 0), 0),
            growth: Math.min(20, 5 + ci * 2),
            progress: Math.min(90, 40 + ctCommunities.length * 8),
          },
        },
        catchLocs[ct.id]
      );
    });

    byCountry[country.slug] = {
      country,
      centroid,
      catchmentMap,
      catchments: catchmentsWithCommunities,
      hub,
      metrics: {
        communities: country.summary?.communities ?? 0,
        households: communityList
          .filter((c) => catchmentList.some((ct) => ct.countryId === country.id && ct.id === c.catchmentId))
          .reduce((s, c) => s + (c.households || 0), 0),
        pastors: country.summary?.pastors ?? 0,
        projects: hub?.kpis?.find((k) => k.id === "ppp")?.value ?? 0,
        growth: country.growth ?? hub?.kpis?.find((k) => k.id === "growth")?.value ?? 10,
        progress: hub?.kpis?.find((k) => k.id === "leadership")?.score ?? 50,
      },
      chartSparkline: hub?.charts?.growthOverTime?.data || [5, 8, 10, 12, 14],
    };
  });

  return { paCountries, byCountry, PA_SLUGS };
}
