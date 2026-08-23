import { buildCatchmentHubPayload } from "../utils/catchment-hub-data.js";
import {
  renderCatchmentOutcomes,
  mountCatchmentOutcomes,
  destroyCatchmentOutcomes,
} from "../components/catchment-hub/CatchmentOutcomesPage.js";
import {
  mountCatchmentHubAnimations,
  destroyCatchmentHubAnimations,
} from "../components/catchment-hub/catchment-hub-animations.js";

export function renderCatchmentHub(countrySlug, catchmentSlug, data) {
  const hub = buildCatchmentHubPayload(countrySlug, catchmentSlug, data);
  if (!hub) {
    return {
      html: `<div class="container static-page"><h1>Nearby group not found</h1><p><a href="#/country/${countrySlug}" data-link>Back to country</a></p></div>`,
    };
  }

  return { html: renderCatchmentOutcomes(hub), hub };
}

export function mountCatchmentHub(root, hub) {
  mountCatchmentOutcomes(root, hub);
  mountCatchmentHubAnimations(root);
}

export function destroyCatchmentHub() {
  destroyCatchmentHubAnimations();
  destroyCatchmentOutcomes();
}
