/**
 * Map info cards — uses official region names from data only.
 */
import { formatNumber } from "../../utils/format.js";

function sumPaMetric(paCountries, drillData, key) {
  return paCountries.reduce((sum, c) => {
    const hub = drillData.byCountry?.[c.slug];
    const m = hub?.metrics || c.summary || c;
    return sum + (m[key] ?? c[key] ?? 0);
  }, 0);
}

export class MapLevelCards {
  constructor(container) {
    this.container = container;
    this.level = "africa";
    this.renderAfrica({}, { paCountries: [] });
  }

  renderAfrica(drillData, { paCountries = [] } = {}) {
    this.level = "africa";
    this.container.classList.remove("ai-map__level-card--communities");
    const communities = sumPaMetric(paCountries, drillData, "communities") || 1000;

    this.container.innerHTML = this.buildCard({
      level: "africa",
      type: "Africa",
      title: "Africa",
      kpis: [
        { label: "Countries", value: "54+" },
        { label: "Communities", value: `${formatNumber(communities)}+` },
        { label: "Households", value: "500K+" },
        { label: "Growth", value: "+25%" },
      ],
      hint: "Scroll or click a cluster to zoom into a country",
    });
    this.animateIn();
  }

  renderCountry(country, hub) {
    this.level = "country";
    this.container.classList.remove("ai-map__level-card--communities");
    const stats = country.summary || {};

    this.container.innerHTML = this.buildCard({
      level: "country",
      type: country.countryName || country.name,
      title: country.countryName || country.name,
      kpis: [
        { label: "Catchments", value: stats.catchments ?? hub?.catchments?.length ?? 0 },
        { label: "Communities", value: stats.communities ?? country.communities ?? 0 },
        { label: "Pastors", value: formatNumber(stats.pastors ?? country.pastors ?? hub?.metrics?.pastors ?? 0) },
        { label: "Growth", value: `+${country.growth ?? hub?.metrics?.growth ?? 0}%` },
      ],
      hint: "Select a catchment area name on the map",
      link: { href: `#/country/${country.slug}`, label: `Explore ${country.countryName || country.name} hub →`, highlight: true },
    });
    this.animateIn();
  }

  renderCommunities(country, hub, { catchment = null } = {}) {
    this.level = "communities";
    this.container.classList.add("ai-map__level-card--communities");

    if (!catchment) {
      this.container.innerHTML = this.buildCard({
        level: "communities",
        type: country.countryName || country.name,
        title: country.countryName || country.name,
        hint: "Select a catchment area on the map to see its communities",
      });
      this.animateIn();
      return;
    }

    const communities = catchment.communities || [];
    const summary = catchment.summary || {};
    const households = summary.households ?? communities.reduce((sum, c) => sum + (c.households || 0), 0);
    const shalomGroups = summary.shalomGroups ?? communities.reduce((sum, c) => sum + (c.shalomGroups || 0), 0);
    const pastors = summary.pastors ?? communities.reduce((sum, c) => sum + (c.pastors || 0), 0);

    const list = communities.map((c) => {
      const meta = [c.journeyStage, c.households != null ? `${c.households} households` : null]
        .filter(Boolean)
        .join(" · ");
      return `<li>
        <a href="#/community/${country.slug}/${catchment.slug}/${c.slug}" class="ai-level-card__community-link" data-link>
          <strong>${c.name}</strong>
          ${meta ? `<span>${meta}</span>` : ""}
        </a>
      </li>`;
    });

    this.container.innerHTML = this.buildCard({
      level: "communities",
      type: country.countryName || country.name,
      title: catchment.name,
      kpis: [
        { label: "Communities", value: communities.length },
        { label: "Households", value: formatNumber(households) },
        { label: "Shalom groups", value: shalomGroups || "—" },
        { label: "Pastors", value: formatNumber(pastors) },
      ],
      list,
      hint: "Explore communities",
      link: {
        href: `#/catchment/${country.slug}/${catchment.slug}`,
        label: `${catchment.name} — explore all communities →`,
        highlight: true,
      },
    });
    this.animateIn();
  }

  buildCard({ level, type, title, kpis, list, hint, link }) {
    return `
      <article class="ai-level-card ai-level-card--${level}" data-level="${level}">
        <p class="ai-level-card__type">${type}</p>
        <div class="ai-level-card__head">
          <h2 class="ai-level-card__title">${title}</h2>
        </div>
        ${
          kpis?.length
            ? `<dl class="ai-level-card__kpis">
          ${kpis
            .map(
              (k) => `<div class="ai-level-card__kpi">
              <dt>${k.label}</dt>
              <dd>${k.value}</dd>
            </div>`
            )
            .join("")}
        </dl>`
            : ""
        }
        ${list?.length ? `<ul class="ai-level-card__list" aria-label="Communities in ${title}">${list.join("")}</ul>` : ""}
        ${hint ? `<p class="ai-level-card__hint">${hint}</p>` : ""}
        ${link ? `<a href="${link.href}" class="ai-level-card__link${link.highlight ? " ai-level-card__link--highlight" : ""}" data-link>${link.label}</a>` : ""}
      </article>`;
  }

  animateIn() {
    if (typeof gsap === "undefined") return;
    const card = this.container.querySelector(".ai-level-card");
    if (!card) return;
    gsap.fromTo(
      card,
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }

  setLevelFromZoom(zoomLevel, context) {
    if (zoomLevel === 0) {
      this.renderAfrica(context.drillData, { paCountries: context.paCountries });
    } else if (zoomLevel === 1 && context.country) {
      this.renderCountry(context.country, context.hub);
    } else if (zoomLevel >= 2 && context.country) {
      this.renderCommunities(context.country, context.hub, {
        catchment: context.catchment,
      });
    }
  }
}
