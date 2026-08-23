import { renderWbPageHero } from "../shared/wb-page-hero.js";

export function renderCatchmentHero(hub) {
  const firstCommunity = hub.communityCards?.[0] || hub.communities?.[0];

  return renderWbPageHero({
    id: "cth-overview",
    tone: "forest",
    skin: "field",
    variant: "split",
    flush: true,
    extraClass: "ch-hero",
    crumbs: [
      { label: "Where we work", href: "#/africa" },
      { label: hub.countryName, href: `#/country/${hub.countrySlug}` },
      { label: hub.catchmentName },
    ],
    eyebrow: "A group of nearby communities",
    question: "What is happening in this group?",
    title: hub.catchmentName,
    lead:
      hub.description ||
      "This is a group of 3–5 neighbouring communities. Pastors here work together. Open one community to see the people and the projects.",
    chapterNext: firstCommunity
      ? {
          kicker: "Meet a community",
          title: firstCommunity.name,
          href: `#/community/${hub.countrySlug}/${hub.catchmentSlug}/${firstCommunity.slug}`,
        }
      : { kicker: "Up one level", title: hub.countryName, href: `#/country/${hub.countrySlug}` },
    visualHtml: `<div id="context-map-root" class="ch-hero__context-map" aria-label="Africa context map"></div>`,
  });
}
