import { formatNumber } from "../../utils/format.js";
import { countriesByNetworkSize } from "./LocationBrowse.js";
import { renderAfricaBrowseMap, syncAfricaBrowseMap, bindAfricaBrowseMap } from "./AfricaBrowseMap.js";

const THEMES = {
  kenya: { accent: "#009fda", wash: "rgba(0, 43, 92, 0.45)" },
  malawi: { accent: "#5a9468", wash: "rgba(12, 48, 28, 0.5)" },
  ethiopia: { accent: "#c4842c", wash: "rgba(60, 32, 8, 0.5)" },
  zambia: { accent: "#de8a0a", wash: "rgba(48, 28, 4, 0.52)" },
  burundi: { accent: "#8b7aad", wash: "rgba(36, 24, 56, 0.55)" },
  rwanda: { accent: "#0077b6", wash: "rgba(0, 32, 64, 0.5)" },
  tanzania: { accent: "#d4724a", wash: "rgba(56, 24, 12, 0.52)" },
};

function countryCopy(data, country) {
  const hub = data.countryHubs?.hubs?.[country.slug] || {};
  const stage = country.communities > 0 ? "Active network" : "Growing";
  const lead =
    hub.description ||
    hub.overview ||
    (country.communities > 0
      ? `Pastor-led work across ${formatNumber(country.communities)} communities.`
      : `A newer footprint — open ${country.name} to follow the story as it grows.`);
  const theme = THEMES[country.slug] || THEMES.kenya;
  return { stage, lead, theme, hub };
}

export function renderCountryScrollTopics(data) {
  const list = countriesByNetworkSize(data);
  if (!list.length) return `<p class="ao-empty">No countries available.</p>`;

  const firstSlug = list[0]?.slug || null;

  const panels = list
    .map((c, i) => {
      const { stage, lead, theme } = countryCopy(data, c);
      return `<a
        href="#/country/${c.slug}"
        class="wb-ctopics__panel${i === 0 ? " is-active" : ""}"
        data-link
        data-ctopic-panel="${c.slug}"
        style="--ct-accent:${theme.accent}"
      >
        <span class="wb-ctopics__kicker">${stage}</span>
        <h2 class="wb-ctopics__name">${c.name}</h2>
        <p class="wb-ctopics__lead">${lead}</p>
        <p class="wb-ctopics__meta">${formatNumber(c.communities)} communities · ${formatNumber(c.pastors)} pastors</p>
        <span class="wb-ctopics__cta">Open ${c.name} <span aria-hidden="true">→</span></span>
      </a>`;
    })
    .join("");

  return `
    <section class="wb-ctopics" data-country-topics aria-label="Countries where we work">
      <div class="container wb-ctopics__intro">
        <p class="wb-ctopics__eyebrow">Where we work</p>
        <h2 class="wb-ctopics__title">Countries</h2>
        <p class="wb-ctopics__blurb">Scroll through each country. The map highlights where we work — then open a name for the full page.</p>
      </div>
      <div class="wb-ctopics__stage">
        ${renderAfricaBrowseMap(data, firstSlug)}
        <div class="wb-ctopics__rail" data-ctopic-rail>
          ${panels}
        </div>
      </div>
    </section>`;
}

export function mountCountryScrollTopics(root = document) {
  const section = root.querySelector?.("[data-country-topics]") || document.querySelector("[data-country-topics]");
  if (!section) return;

  const panels = [...section.querySelectorAll("[data-ctopic-panel]")];
  if (!panels.length) return;

  const setActive = (slug) => {
    panels.forEach((p) => {
      const on = p.dataset.ctopicPanel === slug;
      p.classList.toggle("is-active", on);
    });
    syncAfricaBrowseMap(section, slug);
    section.dataset.active = slug;
  };

  bindAfricaBrowseMap(section);

  if (typeof IntersectionObserver === "undefined") {
    setActive(panels[0].dataset.ctopicPanel);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const slug = visible[0].target.dataset.ctopicPanel;
      if (slug) setActive(slug);
    },
    {
      root: null,
      threshold: [0.35, 0.55, 0.7],
      rootMargin: "-28% 0px -28% 0px",
    }
  );

  panels.forEach((p) => observer.observe(p));
  section._ctopicOff = () => observer.disconnect();
}

export function destroyCountryScrollTopics(root = document) {
  const section = root.querySelector?.("[data-country-topics]") || document.querySelector("[data-country-topics]");
  section?._ctopicOff?.();
}
