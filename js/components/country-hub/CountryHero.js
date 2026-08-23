import { renderWbPageHero } from "../shared/wb-page-hero.js";

export function renderCountryHero(hub) {
  const slug = hub.country?.slug || "";
  const firstCatchment = hub.catchments?.[0];

  return renderWbPageHero({
    id: "ch-overview",
    tone: "navy",
    skin: "report",
    variant: "split",
    flush: true,
    extraClass: "ch-hero",
    crumbs: [
      { label: "Where we work", href: "#/africa" },
      { label: hub.countryName },
    ],
    eyebrow: "Country",
    question: "What is happening in this country?",
    title: hub.countryName,
    lead: "Pastors work together across this country. Next, open a small group of nearby communities, then one community. That is how the work is organised.",
    actions: firstCatchment
      ? [{ label: `Open ${firstCatchment.name}`, href: `#/catchment/${slug}/${firstCatchment.slug}` }]
      : [{ label: "Where we work", href: "#/africa" }],
    chapterNext: {
      kicker: "Next in the story",
      title: firstCatchment ? `Open ${firstCatchment.name}` : "Where we work",
      href: firstCatchment ? `#/catchment/${slug}/${firstCatchment.slug}` : "#/africa",
    },
    visualHtml: `<div id="context-map-root" class="ch-hero__context-map" aria-label="Africa context map"></div>`,
  });
}
