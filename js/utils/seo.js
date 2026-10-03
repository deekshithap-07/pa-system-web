/**
 * SEO foundations for the public SPA (Vision Framework §10).
 * Updates title, description, canonical, and Open Graph tags per route.
 */

import { PA_PROGRAMMES } from "../components/shared/pa-programmes.js";

const SITE = "Possibilities Africa";
const DEFAULT_DESCRIPTION =
  "Across rural Africa, Possibilities Africa walks with pastors and local leaders so churches and communities grow stronger together — in faith, family, livelihoods, and the next generation.";

function ensureMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.property || attrs.name ? "meta" : "link");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) el.setAttribute(k, v);
  });
  return el;
}

function setNamedMeta(name, content) {
  ensureMeta(`meta[name="${name}"]`, { name, content: content || "" });
}

function setPropertyMeta(property, content) {
  ensureMeta(`meta[property="${property}"]`, { property, content: content || "" });
}

function absoluteUrl(path = "") {
  const origin = typeof location !== "undefined" ? location.origin + location.pathname.replace(/\/?index\.html$/, "/") : "";
  const clean = String(path || "").replace(/^\//, "");
  return `${origin}${clean ? `#/${clean}` : ""}`;
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function routeSeo(view, parts, data, hub) {
  const countryName = hub?.countryName || hub?.country?.name || parts[1] || "";
  const communityName = hub?.community?.name || parts[3] || "";

  switch (view) {
    case "landing":
      return {
        title: `${SITE} | Transforming communities. Developing leaders. Creating possibilities.`,
        description: DEFAULT_DESCRIPTION,
        path: "",
      };
    case "africa":
      return {
        title: `Where we work | ${SITE}`,
        description: "Explore Possibilities Africa across seven countries — open a country, catchment, or community.",
        path: parts.join("/"),
      };
    case "country":
      return {
        title: `${countryName || "Country"} | Where we work | ${SITE}`,
        description: hub?.overview || hub?.description || `Possibilities Africa in ${countryName}: places, programmes, stories, and public progress.`,
        path: parts.join("/"),
      };
    case "country-catchments":
      return {
        title: `Catchments in ${countryName || "this country"} | ${SITE}`,
        description: `Every Possibilities Africa catchment in ${countryName || "this country"} — open one for its progress or go straight to a community.`,
        path: parts.join("/"),
      };
    case "catchment":
      return {
        title: `${hub?.catchmentName || parts[2] || "Catchment"} | ${countryName || parts[1]} | ${SITE}`,
        description: `Nearby communities and pastor-led work in ${hub?.catchmentName || parts[2] || "this group"}, ${countryName || parts[1]}.`,
        path: parts.join("/"),
      };
    case "community":
      return {
        title: `${communityName || "Community"} | ${SITE}`,
        description: `Public community profile for ${communityName || "this place"} — journey stage, projects, story, and map context.`,
        path: parts.join("/"),
      };
    case "scorecard":
      return {
        title: `Impact & Data | ${SITE}`,
        description: data?.scorecard?.meta?.subtitle || "Simple numbers from seven countries — reach, progress, and what is changing.",
        path: parts.join("/"),
      };
    case "stories":
      return {
        title: `Stories | ${SITE}`,
        description: "Transformation stories from communities across the Possibilities Africa network.",
        path: parts.join("/"),
      };
    case "field-reports":
      return {
        title: `Field Reports | ${SITE}`,
        description: "Ministry updates and field evidence from across the Possibilities Africa network.",
        path: "field-reports",
      };
    case "resources":
      return {
        title: `Knowledge Hub | ${SITE}`,
        description: "Reports, guides, research, and learning resources from Possibilities Africa.",
        path: parts.join("/"),
      };
    case "news":
      return {
        title: `News & updates | ${SITE}`,
        description: "Recent updates from Possibilities Africa countries and programmes.",
        path: "news",
      };
    case "work":
      return {
        title: `What we do | ${SITE}`,
        description: "Five programmes that guide Possibilities Africa’s work with churches and communities.",
        path: "work",
      };
    case "programs": {
      const programme = parts[0] === "program" ? PA_PROGRAMMES.find((p) => p.id === parts[1]) : null;
      return {
        title: `${programme ? programme.title : "Programs"} | ${SITE}`,
        description: programme?.description || "The five Possibilities Africa programs and the PPPs that carry them.",
        path: parts.join("/"),
      };
    }
    case "static":
      return {
        title: `Who we are | ${SITE}`,
        description: "About Possibilities Africa — mission, model, and the people behind the work.",
        path: parts.join("/"),
      };
    default:
      return {
        title: SITE,
        description: DEFAULT_DESCRIPTION,
        path: parts.join("/"),
      };
  }
}

export function applyPageSeo(view, parts = [], data = null, hub = null) {
  const seo = routeSeo(view, parts, data, hub);
  const title = stripHtml(seo.title);
  const description = stripHtml(seo.description).slice(0, 300);
  const url = absoluteUrl(seo.path);

  document.title = title;
  setNamedMeta("description", description);
  setNamedMeta("robots", "index,follow");

  ensureMeta('link[rel="canonical"]', { rel: "canonical", href: url });

  setPropertyMeta("og:site_name", SITE);
  setPropertyMeta("og:type", view === "landing" ? "website" : "article");
  setPropertyMeta("og:title", title);
  setPropertyMeta("og:description", description);
  setPropertyMeta("og:url", url);

  setNamedMeta("twitter:card", "summary_large_image");
  setNamedMeta("twitter:title", title);
  setNamedMeta("twitter:description", description);

  applyJsonLd(view, title, description, url);
}

function applyJsonLd(view, title, description, url) {
  const id = "pa-seo-jsonld";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }

  const org = {
    "@type": "NGO",
    name: SITE,
    url: absoluteUrl(""),
    description: DEFAULT_DESCRIPTION,
    areaServed: "Africa",
  };

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE,
      url: absoluteUrl(""),
      description: DEFAULT_DESCRIPTION,
      publisher: org,
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("search")}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  if (view !== "landing") {
    graph.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      isPartOf: { "@type": "WebSite", name: SITE, url: absoluteUrl("") },
    });
  }

  el.textContent = JSON.stringify(graph.length === 1 ? graph[0] : { "@context": "https://schema.org", "@graph": graph });
}
