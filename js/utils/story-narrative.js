/** Intro → Challenge → Solution → Impact — shared story arc for field stories. */

export const STORY_NARRATIVE_STEPS = [
  { key: "intro", label: "Intro" },
  { key: "challenge", label: "Challenge" },
  { key: "solution", label: "Solution" },
  { key: "impact", label: "Impact" },
];

function joinParts(parts) {
  return parts.filter(Boolean).join(" ").trim();
}

/** Resolve narrative from explicit data or split legacy body paragraphs. */
export function getStoryNarrative(story = {}) {
  const n = story.narrative || {};
  if (n.intro && n.challenge && n.solution && n.impact) return n;

  const body = (story.body || []).filter(Boolean);
  const excerpt = story.excerpt || "";

  if (body.length >= 5) {
    return {
      intro: n.intro || body[0],
      challenge: n.challenge || body[1],
      solution: n.solution || joinParts(body.slice(2, -1)),
      impact: n.impact || body[body.length - 1],
    };
  }

  if (body.length === 4) {
    return {
      intro: n.intro || body[0],
      challenge: n.challenge || body[1],
      solution: n.solution || body[2],
      impact: n.impact || body[3],
    };
  }

  if (body.length === 3) {
    return {
      intro: n.intro || body[0],
      challenge: n.challenge || body[1],
      solution: n.solution || body[1],
      impact: n.impact || body[2],
    };
  }

  if (body.length === 2) {
    return {
      intro: n.intro || body[0],
      challenge: n.challenge || body[0],
      solution: n.solution || body[1],
      impact: n.impact || body[1],
    };
  }

  const single = body[0] || excerpt;
  return {
    intro: n.intro || single,
    challenge: n.challenge || single,
    solution: n.solution || single,
    impact: n.impact || single,
  };
}

export function renderStoryNarrative(story, { idPrefix = "story-chapter" } = {}) {
  const narrative = getStoryNarrative(story);

  return STORY_NARRATIVE_STEPS.map(({ key, label }) => {
    const text = narrative[key];
    if (!text) return "";

    return `<section
      class="story-narrative__chapter story-narrative__chapter--${key}"
      id="${idPrefix}-${key}"
      aria-labelledby="${idPrefix}-${key}-title"
      data-story-reveal
    >
      <p class="story-narrative__step">${label}</p>
      <h2 class="story-narrative__title" id="${idPrefix}-${key}-title">${label}</h2>
      <div class="story-narrative__text"><p>${text}</p></div>
    </section>`;
  }).join("");
}

export function renderStoryNarrativeNav(story, { idPrefix = "story-chapter" } = {}) {
  const narrative = getStoryNarrative(story);

  const links = STORY_NARRATIVE_STEPS.filter(({ key }) => narrative[key])
    .map(
      ({ key, label }) =>
        `<a href="#${idPrefix}-${key}" class="story-narrative__nav-link">${label}</a>`
    )
    .join("");

  if (!links) return "";

  return `<nav class="story-narrative__nav" aria-label="Story sections">${links}</nav>`;
}
