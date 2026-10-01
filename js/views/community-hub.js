import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunityBySlug,
  getCommunitiesByCatchment,
  getDashboard,
} from "../utils/data.js";
import { toPublicCommunity, toPublicCommunityAnalytics } from "../utils/public-api.js";
import { attachCommunityHubGeoMap } from "../utils/hub-geo-maps.js";
import {
  renderCommunityOutcomes,
  mountCommunityOutcomes,
  destroyCommunityOutcomes,
  communityChartConfigs,
} from "../components/community-hub/CommunityOutcomesPage.js";
import {
  mountCountryHubCharts,
  teardownCountryHub,
} from "../components/country-hub/country-hub-mount.js";

export function renderCommunityHub(countrySlug, catchmentSlug, communitySlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const catchment = getCatchmentBySlug(data.catchments, country.id, catchmentSlug);
  if (!catchment) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const rawCommunity = getCommunityBySlug(data.communities, catchment.id, communitySlug);
  if (!rawCommunity) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const community = toPublicCommunity(rawCommunity);
  const publicAnalyticsRow = toPublicCommunityAnalytics(data.insightsAnalytics, community.id);
  const analytics = publicAnalyticsRow
    ? { communityComparison: { communities: [publicAnalyticsRow] } }
    : null;

  const dash = getDashboard(data.charts, `community:${community.id}`);
  const catchmentHub = data.catchmentHubs?.hubs?.[catchment.slug] || null;
  const payload = attachCommunityHubGeoMap(
    {
      community,
      country,
      catchment,
      dash,
      analytics,
      programmes: data.home?.ourWork?.programs || null,
      catchmentActivities: catchmentHub?.activities || [],
      catchmentHeroImage: catchmentHub?.heroImage || null,
      siblingCommunities: getCommunitiesByCatchment(data.communities, catchment.id).map((c) => toPublicCommunity(c)),
      communityCharts: data.charts?.dashboards?.[`community:${community.id}`]?.charts || null,
      countryInitiatives: data.countryHubs?.hubs?.[country.slug]?.initiatives || null,
    },
    data
  );

  const html = renderCommunityOutcomes(payload, "", data);
  return { html, hub: payload };
}

export function mountCommunityHub(root, hub) {
  mountCommunityOutcomes(root, hub);

  const configs = communityChartConfigs(hub);

  requestAnimationFrame(() => {
    if (Object.keys(configs).length) {
      const wrap = root.querySelector("[data-community-outcomes]");
      if (wrap) mountCountryHubCharts(wrap, configs);
    }
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

export function destroyCommunityHub(root) {
  destroyCommunityOutcomes();
  const hubEl = root.querySelector("[data-community-outcomes]");
  if (hubEl) teardownCountryHub(hubEl);
}
