export function getPageEntryConfig(view, parts, data, hub) {
  switch (view) {
    case "landing":
      return {
        eyebrow: "Possibilities Africa",
        title: "The whole gospel transforming the whole person and whole community",
        subtitle: "",
      };

    case "africa":
      return {
        eyebrow: "Africa Overview",
        title: "Africa <strong>Network</strong>",
        subtitle: "Network-wide metrics, growth trends, and country hubs across the PA network.",
      };

    case "country":
      return {
        eyebrow: "Country Hub",
        title: hub?.countryName || "Country",
        subtitle: "What is happening in this country — stories, metrics, and catchments.",
      };

    case "catchment":
      return {
        eyebrow: "Catchment Area",
        title: hub?.catchmentName || "Catchment",
        subtitle: `What is happening in this catchment · ${hub?.countryName || ""}`.trim(),
      };

    case "community":
      return {
        eyebrow: "Community Hub",
        title: hub?.community?.name || "Community",
        subtitle: `What is happening in this community · ${hub?.catchment?.name || ""}`.trim(),
      };

    case "resources":
      return {
        eyebrow: "Knowledge Hub",
        title: "Resource <strong>Hub</strong>",
        subtitle: "Transformation stories, case studies, and downloadable data packs.",
      };

    case "stories": {
      const slug = parts[1];
      const country = slug
        ? data?.countries?.countries?.find((c) => c.slug === slug && c.isPaNetwork)
        : null;
      return {
        eyebrow: country ? country.name : "Transformation Stories",
        title: country ? `<strong>${country.name}</strong>` : "Stories of <strong>Impact</strong>",
        subtitle: country
          ? "Field stories and transformation data from pastor-led communities."
          : "Real lives and measurable change across the PA network.",
      };
    }

    case "static":
      return {
        eyebrow: "Possibilities Africa",
        title: "About <strong>Us</strong>",
        subtitle: "The ministry model behind pastor-led holistic transformation across Africa.",
      };

    case "scorecard":
      return {
        eyebrow: "Possibilities Africa",
        title: "Transformation <strong>Scorecard</strong>",
        subtitle: "Network-wide metrics across seven nations",
      };

    default:
      return {
        eyebrow: "Possibilities Africa",
        title: "Transformation <strong>Intelligence</strong>",
        subtitle: "Explore communities and measure progress together.",
      };
  }
}
