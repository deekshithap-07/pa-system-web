export function getPageEntryConfig(view, parts, data, hub) {
  switch (view) {
    case "landing":
      return {
        eyebrow: "Possibilities Africa",
        title: "The whole gospel transforming the whole person and whole community",
        subtitle: "",
      };

    case "africa": {
      const chapter = {
        countries: { title: "Browse <strong>countries</strong>", subtitle: "Seven countries on the network." },
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
        cases: { title: "Case <strong>studies</strong>", subtitle: "Stories from communities you can read and share." },
        packs: { title: "Insight <strong>packs</strong>", subtitle: "Short downloads that sit next to the stories." },
      }[parts[1]] || { title: "Stories &amp; <strong>reports</strong>", subtitle: "Stories, case studies, and reports you can read and share." };
      return {
        eyebrow: "Stories & reports",
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
        eyebrow: country ? country.name : "Stories",
        title: country ? `<strong>${country.name}</strong>` : "Stories of <strong>change</strong>",
        subtitle: country
          ? "People and progress from this country."
          : "Real lives and simple results from the places we work.",
      };
    }

    case "work": {
      const chapter = {
        journey: { title: "The two-year <strong>journey</strong>", subtitle: "From first steps to sharing the work." },
        leadership: { title: "Leadership <strong>growth</strong>", subtitle: "Awareness, ability, and action." },
        projects: { title: "Community <strong>projects</strong>", subtitle: "Pastor-planned and church-led work." },
      }[parts[1]] || { title: "What we <strong>do</strong>", subtitle: "Pastor-led work across Africa." };
      return {
        eyebrow: "What we do",
        title: chapter.title,
        subtitle: chapter.subtitle,
      };
    }

    case "static": {
      return {
        eyebrow: "Possibilities Africa",
        title: "Who we <strong>are</strong>",
        subtitle: "Mission and where to explore next.",
      };
    }


    case "scorecard": {
      const chapter = {
        working: { title: "What’s <strong>working</strong>", subtitle: "Water, farming, health, schools, jobs, and leadership." },
        together: { title: "What is <strong>changing</strong>", subtitle: "Where the work began, what the field shows now, and what may come next." },
        journey: { title: "The two-year <strong>journey</strong>", subtitle: "From first steps to sharing the work with neighbours." },
      }[parts[1]] || { title: "Our <strong>results</strong>", subtitle: "Simple numbers from seven countries" };
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
