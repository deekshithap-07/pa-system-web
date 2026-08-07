const METRIC_LABELS = {
  households: "Households",
  projects: "Projects",
  leadershipScore: "Leadership score",
  stage: "Journey stage",
  communities: "Communities",
  pastors: "Pastors",
  growth: "Growth",
  shalomGroups: "Shalom groups",
  livesImpacted: "Lives impacted",
};

function formatMetricValue(key, val) {
  if (val == null || val === "") return "—";
  if (key === "growth") return `+${val}%`;
  if (key === "leadershipScore") return `${val}/100`;
  return String(val);
}

function getStoryMetrics(story) {
  if (Array.isArray(story.metricsList) && story.metricsList.length) {
    return story.metricsList;
  }
  if (!story.metrics || !Object.keys(story.metrics).length) return [];
  return Object.entries(story.metrics).map(([key, val]) => ({
    label: METRIC_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim(),
    value: formatMetricValue(key, val),
  }));
}

function renderStoryMetricsPanel(story, variant = "card") {
  const items = getStoryMetrics(story);
  if (!items.length) return "";

  const cls = variant === "inline" ? "ch-story-card__metrics ch-story-card__metrics--inline" : "ch-story-card__metrics";
  return `<div class="${cls}" aria-label="Story impact data">
    ${items
      .map(
        (m) => `<div class="ch-story-card__metric">
          <span class="ch-story-card__metric-val">${m.value}</span>
          <span class="ch-story-card__metric-lbl">${m.label}</span>
        </div>`
      )
      .join("")}
  </div>`;
}

function renderStoryCard(story, communityName) {
  const body = (story.body || [])
    .map((p) => `<p>${p}</p>`)
    .join("");
  const program = story.program ? `<span class="ch-story-card__program">${story.program}</span>` : "";
  const metricsPanel = renderStoryMetricsPanel(story);

  return `<article class="ch-story-card" id="${story.slug}" data-reveal-section>
    <div class="ch-story-card__layout">
      <div class="ch-story-card__media">
        <div class="ch-story-card__image" aria-hidden="true"><span>Field photo</span></div>
      </div>
      <div class="ch-story-card__main">
        <span class="ch-story-card__community">${communityName}</span>
        ${program}
        <h3>${story.title}</h3>
        <p class="ch-story-card__excerpt">${story.excerpt}</p>
        <details class="ch-story-card__expand">
          <summary>Read full story</summary>
          <div class="ch-story-card__full">${body}</div>
        </details>
      </div>
      ${
        metricsPanel
          ? `<aside class="ch-story-card__data">
          <p class="ch-story-card__data-title">Impact data</p>
          ${metricsPanel}
        </aside>`
          : ""
      }
    </div>
  </article>`;
}

export function renderStorySection({ stories, communities, sectionId, title, description }) {
  const communityMap = {};
  (communities?.communities || communities || []).forEach((c) => {
    communityMap[c.id] = c.name;
  });

  if (!stories?.length) {
    return `
      <section class="ch-section" id="${sectionId}" data-reveal-section>
        <div class="ch-section__head">
          <h2>${title}</h2>
          ${description ? `<p class="ch-section__desc">${description}</p>` : ""}
        </div>
        <p class="ch-empty">No current stories with tracked impact data yet.</p>
      </section>`;
  }

  const cards = stories
    .map((s) => {
      const community = communityMap[s.communityId] || s.community || s.catchment || "Network-wide";
      return renderStoryCard(s, community);
    })
    .join("");

  return `
    <section class="ch-section" id="${sectionId}">
      <div class="ch-section__head">
        <h2>${title}</h2>
        ${description ? `<p class="ch-section__desc">${description}</p>` : ""}
      </div>
      <div class="ch-story-grid">${cards}</div>
    </section>`;
}
