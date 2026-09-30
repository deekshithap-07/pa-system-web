import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunityBySlug,
  getDashboard,
} from "../utils/data.js";
import { toPublicCommunity, toPublicCommunityAnalytics } from "../utils/public-api.js";
import { attachCommunityHubGeoMap } from "../utils/hub-geo-maps.js";
import {
  renderCommunityOutcomes,
  mountCommunityOutcomes,
  destroyCommunityOutcomes,
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
    },
    data
  );

  const html = renderCommunityOutcomes(payload, "", data);
  return { html, hub: payload };
}

export function mountCommunityHub(root, hub) {
  mountCommunityOutcomes(root, hub);

  const progressCharts = Object.fromEntries(
    ["impactLine"]
      .filter((k) => hub.dash?.charts?.[k])
      .map((k) => [k, hub.dash.charts[k]])
  );

  requestAnimationFrame(() => {
    if (Object.keys(progressCharts).length) {
      const wrap = root.querySelector("[data-community-outcomes]");
      if (wrap) mountCountryHubCharts(wrap, progressCharts);
    }
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

export function destroyCommunityHub(root) {
  destroyCommunityOutcomes();
  const hubEl = root.querySelector("[data-community-outcomes]");
  if (hubEl) teardownCountryHub(hubEl);
}
