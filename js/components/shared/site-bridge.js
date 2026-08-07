/**
 * Cross-page bridges — story ↔ data links with consistent UI (World Bank–style).
 */

export function buildCommunityHubPath(communityId, data) {
  const community = data.communities?.communities?.find((c) => c.id === communityId);
  if (!community) return null;
  const catchment = data.catchments?.catchments?.find((c) => c.id === community.catchmentId);
  if (!catchment) return null;
  const country = data.countries?.countries?.find((c) => c.id === catchment.countryId);
  if (!country) return null;
  return `community/${country.slug}/${catchment.slug}/${community.slug}`;
}

export function buildCountryHubPath(countryId, data) {
  const country = data.countries?.countries?.find((c) => c.id === countryId);
  return country ? `country/${country.slug}` : null;
}

/** Short narrative ribbon between story and data sections */
export function renderNarrativeRibbon({ variant = "story", eyebrow, title, text, cta }) {
  if (!title && !text) return "";
  const ctaHtml = cta
    ? `<a href="${cta.target}" class="site-ribbon__cta" data-link>${cta.label} &rarr;</a>`
    : "";

  return `
    <aside class="site-ribbon site-ribbon--${variant}" data-reveal-section>
      <div class="site-ribbon__inner container">
        ${eyebrow ? `<p class="site-ribbon__eyebrow">${eyebrow}</p>` : ""}
        ${title ? `<h2 class="site-ribbon__title">${title}</h2>` : ""}
        ${text ? `<p class="site-ribbon__text">${text}</p>` : ""}
        ${ctaHtml}
      </div>
    </aside>`;
}

/** Inline curiosity link from story context to related data */
export function renderCuriosityStrip({ text, links = [] }) {
  if (!links.length) return "";
  const linkHtml = links
    .map((l) => `<a href="${l.target}" class="site-curiosity__link" data-link>${l.label}</a>`)
    .join('<span class="site-curiosity__sep" aria-hidden="true">·</span>');

  return `
    <div class="site-curiosity" data-reveal-section>
      <div class="container site-curiosity__inner">
        ${text ? `<p>${text}</p>` : ""}
        <div class="site-curiosity__links">${linkHtml}</div>
      </div>
    </div>`;
}

/** End-of-page “Continue exploring” — contextual, non-repeating per page */
export function renderExploreBridge({ eyebrow = "Continue exploring", title, description, cards = [] }) {
  if (!cards.length) return "";

  const cardHtml = cards
    .map(
      (c) => `<a href="${c.target}" class="site-bridge-card site-bridge-card--${c.tone || "default"}" data-link data-reveal-section>
        <span class="site-bridge-card__type">${c.type}</span>
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <span class="site-bridge-card__arrow" aria-hidden="true">&rarr;</span>
      </a>`
    )
    .join("");

  return `
    <section class="site-bridge" aria-labelledby="site-bridge-title">
      <div class="container">
        <header class="site-bridge__head" data-reveal-section>
          <p class="eyebrow">${eyebrow}</p>
          <h2 id="site-bridge-title">${title}</h2>
          ${description ? `<p>${description}</p>` : ""}
        </header>
        <div class="site-bridge__grid">${cardHtml}</div>
      </div>
    </section>`;
}

/** Preset bridge cards — each page picks a unique subset */
export const BRIDGE = {
  africa: () => ({
    title: "From continent overview to country detail",
    description: "You've seen the big picture. Follow a country hub for stories and local metrics, or open the scorecard for network-wide rankings.",
    cards: [
      { type: "Story layer", title: "Kenya country hub", description: "23 communities, field reports, and catchment maps — see transformation in context.", target: "#/country/kenya", tone: "story" },
      { type: "Data layer", title: "Transformation scorecard", description: "Country rankings, journey progress, and sector outcomes across the network.", target: "#/scorecard", tone: "data" },
      { type: "Analysis", title: "Insights & comparisons", description: "CBC index, readiness levels, and side-by-side country comparisons.", target: "#/insights", tone: "analysis" },
    ],
  }),
  country: (slug, name) => ({
    title: `What to explore next in ${name}`,
    description: "Country data makes more sense alongside stories and deeper analysis. Pick a path below.",
    cards: [
      { type: "Drill down", title: "Catchment areas", description: "Open the map above or browse catchments for community-level stories and metrics.", target: `#ch-map`, tone: "story" },
      { type: "Network view", title: "Compare countries", description: "See how this country ranks against peers in the scorecard and insights hub.", target: "#/insights#ins-comparisons", tone: "data" },
      { type: "Read more", title: "Reports & case studies", description: "Field reports and documented outcomes that explain the numbers you see here.", target: "#/resources#res-case-studies", tone: "story" },
    ],
  }),
  catchment: (countrySlug, countryName) => ({
    title: "Connect stories to the data behind them",
    description: "Catchment pages blend field narratives with tracked metrics. Go deeper or step back to the country view.",
    cards: [
      { type: "Communities", title: "Browse communities", description: "Each community has a profile, projects timeline, and progress charts.", target: "#cth-communities", tone: "story" },
      { type: "Country", title: `Back to ${countryName}`, description: "National KPIs, country reports, and the full catchment map.", target: `#/country/${countrySlug}`, tone: "default" },
      { type: "Analysis", title: "Sector insights", description: "Compare catchment performance with network-wide CBC and readiness data.", target: "#/insights", tone: "analysis" },
    ],
  }),
  community: (countrySlug, catchmentSlug, name) => ({
    title: `Understand ${name} in the wider network`,
    description: "Community dashboards are most useful alongside stories, comparisons, and country context.",
    cards: [
      { type: "Catchment", title: "Catchment overview", description: "See neighbouring communities, activity feed, and catchment-level trends.", target: `#/catchment/${countrySlug}/${catchmentSlug}`, tone: "story" },
      { type: "Scorecard", title: "Network scorecard", description: "Where does this community sit on journey progress and sector outcomes?", target: "#/scorecard#sc-communities", tone: "data" },
      { type: "Stories", title: "Transformation stories", description: "Read documented outcomes from communities like this one.", target: "#/resources#res-case-studies", tone: "story" },
    ],
  }),
  scorecard: () => ({
    title: "Turn numbers into understanding",
    description: "The scorecard summarizes the network. Stories and country hubs show what the numbers mean on the ground.",
    cards: [
      { type: "Explore", title: "Africa map", description: "Navigate from continent to community and see metrics at each level.", target: "#/#home-africa-map", tone: "default" },
      { type: "Analysis", title: "Deep insights", description: "Country vs country, CBC index, readiness ladder, and progress hotspots.", target: "#/insights", tone: "analysis" },
      { type: "Stories", title: "Reports & case studies", description: "Narrative context for the KPIs and rankings you see above.", target: "#/resources", tone: "story" },
    ],
  }),
  insights: () => ({
    title: "See the stories behind the analysis",
    description: "Comparisons and indices are starting points. Country hubs and resources explain what's driving the trends.",
    cards: [
      { type: "Geo explore", title: "Country hubs", description: "Open a country to see catchments, communities, and field updates.", target: "#/country/kenya", tone: "story" },
      { type: "Summary", title: "Scorecard snapshot", description: "Network KPIs, country rankings, and journey progress at a glance.", target: "#/scorecard", tone: "data" },
      { type: "Read", title: "Case studies", description: "Documented transformation outcomes linked to programme areas.", target: "#/resources#res-case-studies", tone: "story" },
    ],
  }),
  resources: () => ({
    title: "From reading to exploring live data",
    description: "Reports explain what happened. Maps and dashboards show what's happening now.",
    cards: [
      { type: "Live data", title: "Africa intelligence map", description: "Explore countries and communities with real-time field metrics.", target: "#/#home-africa-map", tone: "data" },
      { type: "Rankings", title: "Transformation scorecard", description: "See how countries and communities perform across the network.", target: "#/scorecard", tone: "data" },
      { type: "Model", title: "How PA works", description: "Understand the ministry model before interpreting the data.", target: "#/about", tone: "story" },
    ],
  }),
  about: () => ({
    title: "See the model in action",
    description: "You've learned how PA works. Now explore where transformation is happening.",
    cards: [
      { type: "Explore", title: "Africa map", description: "Start at the continent and drill down to communities.", target: "#/#home-africa-map", tone: "default" },
      { type: "Example", title: "Kenya country hub", description: "A full example: metrics, map, reports, and stories in one place.", target: "#/country/kenya", tone: "story" },
      { type: "Data", title: "Network scorecard", description: "Measurable impact across seven nations.", target: "#/scorecard", tone: "data" },
    ],
  }),
};
