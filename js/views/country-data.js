import { buildCountryHubPayload } from "../utils/country-hub-data.js";
import { getCatchmentsByCountry, getCommunitiesByCatchment, getCountryBySlug } from "../utils/data.js";
import {
  renderCountryDataPage,
  mountCountryDataPage,
  destroyCountryDataPage,
} from "../components/work/CountryDataPage.js";

export function renderCountryData(slug, data) {
  const country = getCountryBySlug(data.countries, slug);
  if (!country) {
    return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };
  }

  const hub = buildCountryHubPayload(slug, data);
  if (!hub) {
    return { html: `<div class="container static-page"><h1>Data not available</h1></div>` };
  }

  const catchments = getCatchmentsByCountry(data.catchments, country.id);
  const communitiesByCatchment = {};
  catchments.forEach((ct) => {
    communitiesByCatchment[ct.id] = getCommunitiesByCatchment(data.communities, ct.id);
  });

  const networkCompare = data.insightsAnalytics?.countryComparison?.countries || [];
  const countryStats = data.scorecard?.countryStats?.find((c) => c.slug === slug) || null;
  const paCountries = (data.countries?.countries || [])
    .filter((c) => c.isPaNetwork)
    .sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    hub,
    catchments,
    communitiesByCatchment,
    networkCompare,
    countryStats,
    paCountries,
  };

  return {
    html: renderCountryDataPage(payload),
    hub,
    payload,
  };
}

export function mountCountryData(root, hub) {
  mountCountryDataPage(root, hub);
}

export function destroyCountryData(root) {
  destroyCountryDataPage();
}
