/**
 * Official PA programmes for World Bank–style priority panels.
 * Keep in sync with data/home.json → ourWork.programs (five only).
 */

export const PA_PROGRAMMES = [
  {
    id: "leadership",
    title: "Transformational Leadership",
    panelLabel: "Leadership",
    text: "Developing leaders at every level.",
    description: "Equipping leaders to guide communities with vision, character and purpose.",
    href: "#/work#work-leadership",
    tone: "maroon",
  },
  {
    id: "discipleship",
    title: "Spiritual Discipleship",
    panelLabel: "Discipleship",
    text: "Building strong faith and values.",
    description: "Rooting households and churches in faith that shapes daily life, relationships and hope.",
    href: "#/work",
    tone: "gold",
  },
  {
    id: "economic",
    title: "Economic Productivity",
    panelLabel: "Productivity",
    text: "Creating sustainable livelihoods.",
    description: "Helping families grow sustainable livelihoods through skills, savings and community enterprise.",
    href: "#/work",
    tone: "green",
  },
  {
    id: "youth",
    title: "Mentoring the Next Generation",
    panelLabel: "Next Generation",
    text: "Equipping young people for a better future.",
    description: "Walking with young people so they grow in faith, character and opportunity for the future.",
    href: "#/work",
    tone: "maroon",
  },
  {
    id: "citizenship",
    title: "Responsible Citizenship",
    panelLabel: "Citizenship",
    text: "Building peaceful, engaged communities.",
    description: "Building peaceful, engaged communities where neighbours take responsibility for shared wellbeing.",
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
