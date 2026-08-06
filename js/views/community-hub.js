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
  const payload = { community, country, catchment, dash, analytics: data.insightsAnalytics };

  const html = `
    <div class="ch-hub cm-hub" data-community-hub data-country-slug="${countrySlug}" data-catchment-slug="${catchmentSlug}">
      ${renderCommunitySidebar(countrySlug, catchmentSlug)}
      <main class="ch-main">
        ${renderCommunityHero(payload)}
        ${renderCommunityProfile(payload)}
        ${renderCommunityProjects(payload)}
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
