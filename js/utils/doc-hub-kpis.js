import { formatNumber } from "./format.js";

/** Country hub KPIs aligned with doc card 2 categories. */
export function getDocCountryKpis(hub) {
  const find = (id) => hub.kpis?.find((k) => k.id === id);
  const communities = find("communities")?.value ?? hub.country?.summary?.communities ?? 0;
  const shalom = find("shalom")?.value ?? 0;
  const households = find("households")?.value ?? 0;
  const ppp = find("ppp")?.value ?? 0;
  const chips = find("chips")?.value ?? 0;
  const growth = find("growth")?.value ?? 0;

  return [
    { id: "communities", label: "Communities in Country", value: communities, direction: "neutral" },
    {
      id: "shalom-households",
      label: "Shalom Groups & Households",
      value: 0,
      text: `${shalom} groups · ${formatNumber(households)} households`,
      direction: "neutral",
    },
    {
      id: "projects",
      label: "Projects (PPPs & CHIPs)",
      value: 0,
      text: `${ppp} PPP · ${chips} CHIP`,
      direction: "neutral",
    },
    {
      id: "progress",
      label: "Progress Indicators",
      value: growth,
      prefix: "+",
      suffix: "%",
      direction: "up",
      trend: "Growth",
    },
  ];
}

/** Country charts limited to projects & progress per doc. */
export function getDocCountryCharts(charts) {
  if (!charts) return {};
  const keys = ["growthOverTime", "projectImpl", "programActivity"];
  return Object.fromEntries(keys.filter((k) => charts[k]).map((k) => [k, charts[k]]));
}
