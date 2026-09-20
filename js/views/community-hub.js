import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunityBySlug,
  getDashboard,
} from "../utils/data.js";
import { toPublicCommunity, toPublicCommunityAnalytics } from "../utils/public-api.js";
import { renderStorySection } from "../components/shared/StoryCards.js";
import { attachCommunityHubGeoMap } from "../utils/hub-geo-maps.js";
import {
  renderCommunityOutcomes,
  mountCommunityOutcomes,
  destroyCommunityOutcomes,
} from "../components/community-hub/CommunityOutcomesPage.js";
import {
  initCountryHubAnimations,
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

  // Public website only — strip sensitive operational fields at the boundary
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
    },
    data
  );

  const communityStories = (data.stories?.stories || []).filter(
    (s) => s.communityId === community.id || s.communityId === community.slug
  );
  const storySection = renderStorySection({
    stories: communityStories.length ? communityStories : (data.stories?.stories || []).slice(0, 1),
    communities: data.communities,
    sectionId: "cm-stories",
    title: communityStories.length
      ? `Transformation story · ${community.name}`
      : "A transformation story from the network",
    description:
      "A public narrative of change in this place — not private household or financial detail.",
    sectionClass: "wb-out__featured wb-out__featured--stories story-section",
  });

  const html = renderCommunityOutcomes(payload, storySection, data);

  return { html, hub: payload };
}

export function mountCommunityHub(root, hub) {
  mountCommunityOutcomes(root, hub);

  // High-level progress only — no leadership radar / sensitive score charts
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
    const page = root.querySelector("[data-community-outcomes]") || root;
    initCountryHubAnimations(page);
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

export function destroyCommunityHub(root) {
  destroyCommunityOutcomes();
  const hubEl = root.querySelector("[data-community-outcomes]");
  if (hubEl) teardownCountryHub(hubEl);
}
