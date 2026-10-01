/**
 * Official PA programmes for World Bank–style priority panels.
 * Keep in sync with data/home.json → ourWork.programs (five only).
 */

export const PA_PROGRAMMES = [
  {
    id: "leadership",
    title: "Transformational Leadership Development",
    panelLabel: "Leadership",
    text: "Developing leaders at every level.",
    description: "This is the PA anchor program from which other programs are implemented. The program focuses on recruiting & selecting, organizing and equipping pastor leaders, who together as a cohesive group, provide visionary, servant leadership necessary for sustainable holistic transformation.",
    href: "#/work#work-leadership",
    tone: "maroon",
  },
  {
    id: "discipleship",
    title: "Spiritual Discipleship",
    panelLabel: "Discipleship",
    text: "Building strong faith and values.",
    description: "PA believes that guiding people in the Judeo-Christian faith and practice gives them a foundation necessary for true and eternal transformation. This means teaching the whole gospel to transform the whole person and impact the whole community.",
    href: "#/work",
    tone: "gold",
  },
  {
    id: "economic",
    title: "Economic Productivity",
    panelLabel: "Productivity",
    text: "Creating sustainable livelihoods.",
    description: "PA empowers the people in the community through the pastor leaders' groups to see the resources around them, learn how to develop them through diligence and hard work, and use them sustainably for the wellbeing of their communities.",
    href: "#/work",
    tone: "green",
  },
  {
    id: "youth",
    title: "Mentoring the Next Generation",
    panelLabel: "Next Generation",
    text: "Equipping young people for a better future.",
    description: "A core program that invests in children and teenagers to grow up with the values, beliefs and life skills necessary to live holistic lives.",
    href: "#/work",
    tone: "maroon",
  },
  {
    id: "citizenship",
    title: "Responsible Citizenship",
    panelLabel: "Citizenship",
    text: "Building peaceful, engaged communities.",
    description: "This program recognizes our responsibility to live our values in the community where God has placed us as responsible citizens contributing to solving community problems and creating an orderly society.",
    href: "#/work",
    tone: "gold",
  },
];

export function resolvePaProgrammes(list) {
  if (Array.isArray(list) && list.length >= 5) {
    return list.slice(0, 5).map((p, i) => {
      const fallback = PA_PROGRAMMES[i] || PA_PROGRAMMES[0];
      return {
        ...fallback,
        ...p,
        id: p.id || fallback.id,
        panelLabel: p.panelLabel || fallback.panelLabel,
        description: p.description || p.text || fallback.description,
        href: p.href || fallback.href,
      };
    });
  }
  return PA_PROGRAMMES;
}

const PROGRAMME_MATCHERS = [
  { id: "leadership", test: /leader/i },
  { id: "discipleship", test: /disciple|spiritual|faith/i },
  { id: "economic", test: /econom|productiv|livelihood|agri|farm|saving/i },
  { id: "youth", test: /youth|mentor|next gen|child|teen/i },
  { id: "citizenship", test: /citizen|water|health|educat|infrastructure/i },
];

/**
 * Folds any programme breakdown into the five official programmes (Home → Results Areas).
 * Water, health, education and infrastructure count as Responsible Citizenship, per PA's
 * own description of that programme.
 */
export function toFivePaProgrammes(labels = [], data = []) {
  const totals = Object.fromEntries(PA_PROGRAMMES.map((p) => [p.id, 0]));
  labels.forEach((label, i) => {
    const match = PROGRAMME_MATCHERS.find((m) => m.test.test(String(label)));
    if (match) totals[match.id] += Number(data[i]) || 0;
  });
  return {
    labels: PA_PROGRAMMES.map((p) => p.title),
    data: PA_PROGRAMMES.map((p) => totals[p.id]),
  };
}

/** Topics shape expected by renderDevelopmentTopics / priority accordion */
export function paPriorityTopics(list) {
  return resolvePaProgrammes(list).map((p) => ({
    id: p.id,
    theme: p.id,
    panelLabel: p.panelLabel || p.title,
    title: p.title,
    summary: p.description || p.text,
    link: { label: "Learn More", target: p.href || "#/work" },
  }));
}
