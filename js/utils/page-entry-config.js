export function getPageEntryConfig(view, parts, data, hub) {
  switch (view) {
    case "landing":
      return {
        eyebrow: "Possibilities Africa",
        title: "Transforming communities. Developing leaders. Creating possibilities.",
        subtitle: "",
      };

    case "africa": {
      const chapter = {
        "how-places-are-grouped": { title: "How places are <strong>grouped</strong>", subtitle: "Country, nearby group, then one community." },
      }[parts[1]];
      if (parts[1] === "region") {
        return {
          eyebrow: "Where we work",
          title: "By <strong>region</strong>",
          subtitle: "Open a country inside this region.",
        };
      }
      return {
        eyebrow: "Where we work",
        title: chapter?.title || "Where we <strong>work</strong>",
        subtitle: chapter?.subtitle || "Seven countries. Open one to see nearby communities.",
      };
    }

    case "story":
      return {
        eyebrow: "Field story",
        title: "From the <strong>field</strong>",
        subtitle: "A story from a country where we work.",
      };

    case "country-stories":
      return {
        eyebrow: "Where we work",
        title: "Stories from this <strong>country</strong>",
        subtitle: "Each story opens on its own page.",
      };

    case "country-data":
      return {
        eyebrow: "PA Network · Data",
        title: `${hub?.countryName || "Country"} <strong>data profile</strong>`,
        subtitle: "Indicators, trends, and places across this country.",
      };

    case "country":
      return {
        eyebrow: "Where we work",
        title: hub?.countryName || "Country",
        subtitle: "What is happening in this country.",
      };

    case "catchment":
      return {
        eyebrow: "Nearby communities",
        title: hub?.catchmentName || "Community group",
        subtitle: `A group of nearby communities · ${hub?.countryName || ""}`.trim(),
      };

    case "community":
      return {
        eyebrow: "One community",
        title: hub?.community?.name || "Community",
        subtitle: `What is happening here · ${hub?.catchment?.name || ""}`.trim(),
      };

    case "resources": {
      const chapter = {
        cases: { title: "Field <strong>reports</strong>", subtitle: "Ministry updates from across the network." },
        packs: { title: "Insight <strong>packs</strong>", subtitle: "Short downloads that sit next to the stories." },
      }[parts[1]] || {
        title: "Knowledge <strong>Hub</strong>",
        subtitle: "PA as a source of knowledge, learning and evidence.",
      };
      return {
        eyebrow: "Knowledge Hub",
        title: chapter.title,
        subtitle: chapter.subtitle,
      };
    }

    case "stories": {
      const slug = parts[1];
      const country = slug
        ? data?.countries?.countries?.find((c) => c.slug === slug && c.isPaNetwork)
        : null;
      return {
        eyebrow: "Stories",
        title: country ? `<strong>${country.name}</strong>` : "Stories",
        subtitle: country
          ? `Human stories from ${country.name} that explain the meaning behind the data.`
          : "Human stories that explain the meaning behind the data.",
      };
    }

    case "news":
      return {
        eyebrow: "News & Updates",
        title: "A current stream of <strong>PA activity</strong>",
        subtitle: "News, country updates, events, announcements, and milestones.",
      };

    case "work":
      return {
        eyebrow: "What we do",
        title: "What we <strong>do</strong>",
        subtitle: "Pastor-led work across Africa.",
      };

    case "static": {
      const chapter = {
        vision: { title: "Vision &amp; <strong>mission</strong>", subtitle: "Whole gospel. Whole person. Whole community." },
        mission: { title: "Vision &amp; <strong>mission</strong>", subtitle: "Whole gospel. Whole person. Whole community." },
        approach: { title: "Our <strong>approach</strong>", subtitle: "How the work is carried with local churches." },
        leadership: { title: "<strong>Leadership</strong>", subtitle: "People who steward the ministry." },
        history: { title: "<strong>History</strong>", subtitle: "Two decades of possibility across Africa." },
        partners: { title: "<strong>Partners</strong>", subtitle: "Churches and friends walking with us." },
        contact: { title: "<strong>Contact</strong>", subtitle: "Get in touch with Possibilities Africa." },
      }[parts[1]] || {
        title: "Who we <strong>are</strong>",
        subtitle: "The institutional foundation of Possibilities Africa.",
      };
      return {
        eyebrow: "About PA",
        title: chapter.title,
        subtitle: chapter.subtitle,
      };
    }


    case "scorecard": {
      const chapter = {
        working: { title: "What’s <strong>working</strong>", subtitle: "Water, farming, health, schools, jobs, and leadership." },
        together: { title: "What is <strong>changing</strong>", subtitle: "Where the work began, what the field shows now, and what may come next." },
        journey: { title: "The two-year <strong>journey</strong>", subtitle: "From first steps to sharing the work with neighbours." },
      }[parts[1]] || { title: "Impact &amp; <strong>Data</strong>", subtitle: "Simple numbers from seven countries" };
      return {
        eyebrow: "Possibilities Africa",
        title: chapter.title,
        subtitle: chapter.subtitle,
      };
    }

    default:
      return {
        eyebrow: "Possibilities Africa",
        title: "Possibilities <strong>Africa</strong>",
        subtitle: "Where we work, what is happening, and how communities grow.",
      };
  }
}
