export function getPaCountries(data) {
  return (data.countries?.countries || []).filter((c) => c.isPaNetwork);
}

export function getRegions(data) {
  return data.workLocations?.regions || [];
}

export function getRegionById(data, id) {
  return getRegions(data).find((r) => r.id === id) || null;
}

export function getRegionForCountry(data, slug) {
  return getRegions(data).find((r) => r.countrySlugs?.includes(slug)) || null;
}

export function getStoryBySlug(data, slug) {
  return (data.stories?.stories || []).find((s) => s.slug === slug) || null;
}

export function getCountryForStory(data, story) {
  return (data.countries?.countries || []).find((c) => c.id === story?.countryId) || null;
}

export function storiesForCountry(data, countryId) {
  return (data.stories?.stories || []).filter((s) => s.countryId === countryId);
}

/** Country browse imagery — distinct from field-story photos. */
export function getCountryCover(data, slug) {
  const cover = data.workLocations?.countryCovers?.[slug];
  if (cover?.image) return cover;
  return { image: "", label: "" };
}

export function paStoriesPageUrl(slug) {
  return `https://www.possibilitiesafrica.org/${slug}-stories.html`;
}

function chartColor(chart, fallback = "#e8a91a") {
  return chart?.color || fallback;
}

function chartKindLabel(type) {
  const map = { line: "Line", bar: "Bar", area: "Line", pie: "Pie", doughnut: "Pie" };
  return map[type] || "Chart";
}

export function countryDataPageUrl(slug) {
  return `#/country/${slug}/data`;
}

export function numberCardsFromHub(hub) {
  const charts = hub.charts || {};
  const kpis = hub.kpis || [];
  const find = (id) => kpis.find((k) => k.id === id);
  const countryName = hub.countryName || hub.country?.name || "Country";
  const dataHref = hub.country?.slug ? countryDataPageUrl(hub.country.slug) : "#/africa";
  const source = { label: "Source · Field reports", href: dataHref };

  const cards = [];

  if (charts.growthOverTime) {
    const c = charts.growthOverTime;
    const last = c.data?.at(-1);
    cards.push({
      key: "growth",
      title: c.title || "Network growth",
      titleHref: dataHref,
      chartKind: chartKindLabel(c.type),
      subtitle: `${last != null ? `+${last}%` : "Year on year"}, ${c.labels?.at(-1) || ""}`,
      type: c.type || "line",
      source,
      config: {
        ...c,
        type: c.type || "line",
        color: chartColor(c, "#e8a91a"),
        seriesLabel: countryName,
        unit: "%",
      },
    });
  }

  if (charts.programActivity) {
    const c = charts.programActivity;
    const total = (c.data || []).reduce((a, b) => a + b, 0) || 1;
    const top = Math.max(...(c.data || [0]));
    const topIdx = (c.data || []).indexOf(top);
    const topLabel = c.labels?.[topIdx] || "Largest";
    const pct = Math.round((top / total) * 100);
    cards.push({
      key: "program",
      title: c.title || "Programme activity",
      titleHref: "#/scorecard",
      chartKind: chartKindLabel(c.type || "pie"),
      subtitle: `Percentage, ${topLabel} ${pct}%`,
      type: c.type || "pie",
      source,
      config: {
        ...c,
        type: c.type || "pie",
        color: chartColor(c, "#e8a91a"),
        seriesLabel: countryName,
        unit: "%",
      },
    });
  }

  if (charts.communitiesAdded) {
    const c = charts.communitiesAdded;
    const last = c.data?.at(-1);
    cards.push({
      key: "communities",
      title: c.title || "Communities on the journey",
      titleHref: dataHref,
      chartKind: chartKindLabel(c.type || "bar"),
      subtitle: `${last ?? find("communities")?.value ?? 0} communities, ${c.labels?.at(-1) || ""}`,
      type: c.type || "bar",
      source,
      config: {
        ...c,
        type: c.type || "bar",
        color: chartColor(c, "#5c2428"),
        seriesLabel: countryName,
        unit: "communities",
      },
    });
  }

  if (charts.leadershipDev) {
    const c = charts.leadershipDev;
    const last = c.data?.at(-1);
    cards.push({
      key: "leadership",
      title: c.title || "Leadership development",
      titleHref: "#/scorecard/journey",
      chartKind: chartKindLabel(c.type),
      subtitle: `${last ?? "—"} average score`,
      type: c.type || "line",
      source,
      config: {
        ...c,
        type: c.type || "line",
        color: chartColor(c, "#c48914"),
        seriesLabel: countryName,
        unit: "score",
      },
    });
  }

  if (charts.householdsReached) {
    const c = charts.householdsReached;
    const last = c.data?.at(-1);
    cards.push({
      key: "households",
      title: c.title || "Homes reached",
      titleHref: "#/scorecard",
      chartKind: chartKindLabel(c.type || "area"),
      subtitle: `${last ? last.toLocaleString() : "—"} homes, latest year`,
      type: c.type || "area",
      source,
      config: {
        ...c,
        type: c.type || "area",
        color: chartColor(c, "#16a34a"),
        seriesLabel: countryName,
        unit: "homes",
      },
    });
  }

  if (charts.projectImpl) {
    const c = charts.projectImpl;
    const top = Math.max(...(c.data || [0]));
    const topIdx = (c.data || []).indexOf(top);
    const topLabel = c.labels?.[topIdx] || "Projects";
    cards.push({
      key: "projects",
      title: c.title || "Project implementation",
      titleHref: "#/scorecard",
      chartKind: chartKindLabel(c.type || "bar"),
      subtitle: `${top} active ${topLabel.toLowerCase()} projects`,
      type: c.type || "bar",
      source,
      config: {
        ...c,
        type: c.type || "bar",
        color: chartColor(c, "#4A5568"),
        seriesLabel: countryName,
        unit: "projects",
      },
    });
  }

  return cards;
}
