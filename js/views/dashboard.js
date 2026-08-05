import {
  getCountryBySlug,
  getCatchmentsByCountry,
  getCatchmentBySlug,
  getCommunitiesByCatchment,
  getCommunityBySlug,
} from "../utils/data.js";
import { renderDashboard, mountDashboard } from "../components/dashboard.js";
import { destroyCharts } from "../components/charts.js";

function breadcrumb(items) {
  return items
    .map((item, i) =>
      i < items.length - 1
        ? `<a href="${item.href}" data-link>${item.label}</a> <span>/</span>`
        : `<span>${item.label}</span>`
    )
    .join(" ");
}

export function renderCountryDashboard(slug, data) {
  const country = getCountryBySlug(data.countries, slug);
  if (!country) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const catchments = getCatchmentsByCountry(data.catchments, country.id);
  const childCards =
    catchments.length > 0
      ? `<section class="section-block container">
          <h2>Catchment Areas</h2>
          <p class="section-desc">Click a catchment to zoom deeper.</p>
          <div class="card-grid">${catchments
            .map(
              (c) => `<a class="entity-card" href="#/catchment/${country.slug}/${c.slug}" data-link>
                <h3>${c.name}</h3>
                <p>${c.summary.communities} communities · ${c.summary.households} households</p>
              </a>`
            )
            .join("")}</div>
        </section>`
      : country.isPaNetwork
        ? `<section class="section-block container"><p style="color:var(--pa-muted)">Catchment data coming soon.</p></section>`
        : "";

  const crumbs = breadcrumb([
    { label: "Africa", href: "#/" },
    { label: country.name, href: `#/country/${country.slug}` },
  ]);

  const result = renderDashboard({
    type: "country",
    entity: country,
    breadcrumbs: crumbs,
    childCards,
    data: { ...data, country },
  });

  return result;
}

export function renderCatchmentDashboard(countrySlug, catchmentSlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const catchment = getCatchmentBySlug(data.catchments, country.id, catchmentSlug);
  if (!catchment) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const communities = getCommunitiesByCatchment(data.communities, catchment.id);
  const childCards = `<section class="section-block container">
    <h2>Communities</h2>
    <p class="section-desc">Select a community for detailed impact data.</p>
    <div class="card-grid">${communities
      .map(
        (c) => `<a class="entity-card" href="#/community/${country.slug}/${catchment.slug}/${c.slug}" data-link>
          <h3>${c.name}</h3>
          <p>${c.journeyStage || "—"} · ${c.households} households</p>
        </a>`
      )
      .join("")}</div>
  </section>`;

  const crumbs = breadcrumb([
    { label: "Africa", href: "#/" },
    { label: country.name, href: `#/country/${country.slug}` },
    { label: catchment.name, href: `#/catchment/${country.slug}/${catchment.slug}` },
  ]);

  return renderDashboard({
    type: "catchment",
    entity: catchment,
    breadcrumbs: crumbs,
    childCards,
    data: { ...data, country },
  });
}

export function renderCommunityDashboard(countrySlug, catchmentSlug, communitySlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const catchment = getCatchmentBySlug(data.catchments, country.id, catchmentSlug);
  if (!catchment) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const community = getCommunityBySlug(data.communities, catchment.id, communitySlug);
  if (!community) return { html: "<div class='container static-page'><h1>Not found</h1></div>" };

  const crumbs = breadcrumb([
    { label: "Africa", href: "#/" },
    { label: country.name, href: `#/country/${country.slug}` },
    { label: catchment.name, href: `#/catchment/${country.slug}/${catchment.slug}` },
    { label: community.name, href: `#/community/${country.slug}/${catchment.slug}/${community.slug}` },
  ]);

  return renderDashboard({
    type: "community",
    entity: community,
    breadcrumbs: crumbs,
    childCards: "",
    data: { ...data, country },
  });
}

export function mountDashboardView(root, dash) {
  mountDashboard(root, dash);
}

export function teardownDashboard() {
  destroyCharts();
}
