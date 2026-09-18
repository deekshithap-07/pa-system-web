import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunityBySlug,
  getDashboard,
} from "../utils/data.js";
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

  const community = getCommunityBySlug(data.communities, catchment.id, communitySlug);
  if (!community) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const dash = getDashboard(data.charts, `community:${community.id}`);
  const payload = attachCommunityHubGeoMap(
    { community, country, catchment, dash, analytics: data.insightsAnalytics },
    data
  );

  const communityStories = (data.stories?.stories || []).filter(
    (s) => s.communityId === community.id || s.communityId === community.slug
  );
  const storySection = renderStorySection({
    stories: communityStories.length ? communityStories : (data.stories?.stories || []).slice(0, 1),
    communities: data.communities,
    sectionId: "cm-stories",
    title: communityStories.length ? "Stories changing lives" : "A story from the network",
    description: "Transformation is easier to understand through people — read the narrative, then explore the data sections above.",
    sectionClass: "wb-out__featured wb-out__featured--stories story-section",
  });

  const html = renderCommunityOutcomes(payload, storySection);

  return { html, hub: payload };
}

export function mountCommunityHub(root, hub) {
  mountCommunityOutcomes(root, hub);

  const progressCharts = Object.fromEntries(
    ["impactLine", "leadershipRadar"]
      .filter((k) => hub.dash.charts?.[k])
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
