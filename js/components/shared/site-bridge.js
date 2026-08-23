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
    title: "What to open next",
    description: "You have seen the country list. Open a country to keep reading, or see our results for simple numbers.",
    cards: [
      { type: "Country", title: "Kenya", description: "Communities, reports, and nearby groups — a full example of how we work.", target: "#/country/kenya", tone: "story" },
      { type: "Results", title: "Our results", description: "How many communities, what is improving, and how countries compare.", target: "#/scorecard", tone: "data" },
      { type: "Results", title: "What is changing", description: "Where the work began, what the field shows now, and what may come next.", target: "#/scorecard/together", tone: "analysis" },
    ],
  }),
  country: (slug, name) => ({
    title: `What to explore next in ${name}`,
    description: "Numbers make more sense next to stories. Pick a path below.",
    cards: [
      { type: "Next zoom", title: "Nearby communities", description: "Open a group of 3–5 neighbouring communities, then one community.", target: `#ch-map`, tone: "story" },
      { type: "Results", title: "What is changing", description: "See how this country fits the wider story in Our results.", target: "#/scorecard/together", tone: "data" },
      { type: "Read more", title: "Stories & reports", description: "Field reports that explain the numbers on this page.", target: "#/resources/cases", tone: "story" },
    ],
  }),
  catchment: (countrySlug, countryName) => ({
    title: "Keep reading, or step back",
    description: "This page is a small group of nearby communities. Open one, or return to the country.",
    cards: [
      { type: "Communities", title: "Meet the communities", description: "Each place has a short profile, projects, and progress.", target: "#cth-communities", tone: "story" },
      { type: "Country", title: `Back to ${countryName}`, description: "Country numbers, reports, and the map.", target: `#/country/${countrySlug}`, tone: "default" },
      { type: "Results", title: "Our results", description: "See this work next to the rest of Africa.", target: "#/scorecard", tone: "analysis" },
    ],
  }),
  community: (countrySlug, catchmentSlug, name) => ({
    title: `See ${name} in the wider picture`,
    description: "This is one community. Nearby places, the country, and Our results give the rest of the story.",
    cards: [
      { type: "Nearby", title: "The neighbouring group", description: "See nearby communities and recent activity.", target: `#/catchment/${countrySlug}/${catchmentSlug}`, tone: "story" },
      { type: "Results", title: "Our results", description: "How this community sits on the two-year journey.", target: "#/scorecard#sc-communities", tone: "data" },
      { type: "Stories", title: "Stories & reports", description: "Read what change looks like in places like this.", target: "#/resources/cases", tone: "story" },
    ],
  }),
  scorecard: () => ({
    title: "Turn numbers into a place",
    description: "Our results summarise the work. Stories and country pages show what the numbers mean on the ground.",
    cards: [
      { type: "Map", title: "Map of Africa", description: "Open a country from the map on Home.", target: "#/#home-africa-map", tone: "default" },
      { type: "Results", title: "What is changing", description: "Where the work began, what the field shows now, and what may come next.", target: "#/scorecard/together", tone: "analysis" },
      { type: "Stories", title: "Stories & reports", description: "The people and projects behind the figures.", target: "#/resources", tone: "story" },
    ],
  }),
  insights: () => ({
    title: "See the stories behind the numbers",
    description: "Comparisons are a start. Country pages and reports explain what is changing.",
    cards: [
      { type: "Country", title: "Open a country", description: "See nearby communities, stories, and updates.", target: "#/country/kenya", tone: "story" },
      { type: "Results", title: "Our results", description: "Reach, country lists, and the two-year journey.", target: "#/scorecard", tone: "data" },
      { type: "Read", title: "Case studies", description: "Stories from the field.", target: "#/resources/cases", tone: "story" },
    ],
  }),
  resources: () => ({
    title: "From reading to visiting a place",
    description: "Reports explain what happened. The map and Our results show what is happening now.",
    cards: [
      { type: "Story", title: "Kenya field stories", description: "People and progress from one country.", target: "#/stories/kenya", tone: "story" },
      { type: "Results", title: "What’s working", description: "Water, farming, health, and jobs in plain words.", target: "#/scorecard/working", tone: "data" },
      { type: "Guide", title: "Where we work", description: "Browse countries and open a place on the map.", target: "#/africa", tone: "story" },
    ],
  }),
  about: () => ({
    title: "See the work in a place",
    description: "You have read how we work. Now visit a country or see our results.",
    cards: [
      { type: "Map", title: "Map of Africa", description: "Start on Home and open a country.", target: "#/#home-africa-map", tone: "default" },
      { type: "Example", title: "Kenya", description: "Numbers, a map, reports, and stories in one place.", target: "#/country/kenya", tone: "story" },
      { type: "Results", title: "What’s working", description: "Simple numbers on water, farming, and daily life.", target: "#/scorecard/working", tone: "data" },
    ],
  }),
};
