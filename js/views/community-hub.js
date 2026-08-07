import {
  getCountryBySlug,
  getCatchmentBySlug,
  getCommunityBySlug,
  getDashboard,
} from "../utils/data.js";
import { renderCommunityHero, renderCommunityProfile, renderCommunityProjects, renderCommunityLeadership } from "../components/community-hub/CommunitySections.js";
import { renderCommunityProgress } from "../components/community-hub/CommunityProgress.js";
import {
  renderCommunitySidebar,
  bindCommunitySidebar,
  destroyCommunitySidebar,
} from "../components/community-hub/CommunitySidebar.js";
import { renderStorySection } from "../components/shared/StoryCards.js";
import {
  initCountryHubAnimations,
  mountCountryHubCharts,
  teardownCountryHub,
} from "../components/country-hub/country-hub-mount.js";
import {
  renderNarrativeRibbon,
  renderCuriosityStrip,
} from "../components/shared/site-bridge.js";

export function renderCommunityHub(countrySlug, catchmentSlug, communitySlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const catchment = getCatchmentBySlug(data.catchments, country.id, catchmentSlug);
  if (!catchment) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const community = getCommunityBySlug(data.communities, catchment.id, communitySlug);
  if (!community) return { html: `<div class="container static-page"><h1>Community not found</h1></div>` };

  const dash = getDashboard(data.charts, `community:${community.id}`);
  const payload = { community, country, catchment, dash, analytics: data.insightsAnalytics };

  const communityStories = (data.stories?.stories || []).filter(
    (s) => s.communityId === community.id || s.communityId === community.slug
  );
  const storySection = renderStorySection({
    stories: communityStories.length ? communityStories : (data.stories?.stories || []).slice(0, 1),
    communities: data.communities,
    sectionId: "cm-stories",
    title: communityStories.length ? "This community's story" : "A story from the network",
    description: "Transformation is easier to understand through people — read the narrative, then explore the data sections below.",
  });

  const html = `
    <div class="ch-hub cm-hub" data-community-hub data-country-slug="${countrySlug}" data-catchment-slug="${catchmentSlug}">
      ${renderCommunitySidebar(countrySlug, catchmentSlug)}
      <main class="ch-main">
        ${renderCommunityHero(payload)}
        ${storySection}
        ${renderNarrativeRibbon({
          variant: "story",
          eyebrow: "From story to data",
          text: dash.hero?.description || "The profile and charts below show how this community is tracked in the transformation system.",
          cta: { label: "View community profile", target: "#cm-profile" },
        })}
        ${renderCommunityProfile(payload)}
        ${renderCommunityProjects(payload)}
        ${renderCuriosityStrip({
          text: "How does this community compare to others?",
          links: [
            { label: "Insights comparisons", target: "#/scorecard#tab-analysis" },
            { label: "Scorecard highlights", target: "#/scorecard#sc-communities" },
          ],
        })}
        ${renderCommunityLeadership(payload)}
        ${renderCommunityProgress(payload)}
      </main>
    </div>`;

  return { html, hub: payload };
}

export function mountCommunityHub(root, hub) {
  const hubEl = root.querySelector("[data-community-hub]");
  if (!hubEl) return;

  bindCommunitySidebar(hubEl);

  const progressCharts = Object.fromEntries(
    ["impactLine", "leadershipRadar"]
      .filter((k) => hub.dash.charts?.[k])
      .map((k) => [k, hub.dash.charts[k]])
  );

  requestAnimationFrame(() => {
    initCountryHubAnimations(hubEl);
    if (Object.keys(progressCharts).length) mountCountryHubCharts(hubEl, progressCharts);
    ScrollTrigger.refresh();
  });
}

export function destroyCommunityHub(root) {
  const hubEl = root.querySelector("[data-community-hub]");
  if (!hubEl) return;
  destroyCommunitySidebar(hubEl);
  teardownCountryHub(hubEl);
}
