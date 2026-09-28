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
    description: "We recruit, select, organize and equip pastor leaders to provide visionary, servant leadership for sustainable community-wide transformation.",
    href: "#/work#work-leadership",
    tone: "maroon",
  },
  {
    id: "discipleship",
    title: "Spiritual Discipleship",
    panelLabel: "Discipleship",
    text: "Building strong faith and values.",
    description: "Guiding people in Christian faith and practice to build a solid foundation for true, eternal, and holistic community transformation.",
    href: "#/work",
    tone: "gold",
  },
  {
    id: "economic",
    title: "Economic Productivity",
    panelLabel: "Productivity",
    text: "Creating sustainable livelihoods.",
    description: "Empowering rural communities to discover, develop and sustainably utilize local resources.",
    href: "#/work",
    tone: "green",
  },
  {
    id: "youth",
    title: "Mentoring the Next Generation",
    panelLabel: "Next Generation",
    text: "Equipping young people for a better future.",
    description: "Supporting children and youth with godly values, character and practical life skills.",
    href: "#/work",
    tone: "maroon",
  },
  {
    id: "citizenship",
    title: "Responsible Citizenship",
    panelLabel: "Citizenship",
    text: "Building peaceful, engaged communities.",
    description: "Churches building community programmes addressing education, water, health and infrastructure.",
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
