import {
  renderStoriesPage,
  mountStoriesPage,
  destroyStoriesPage,
} from "../components/stories/stories-page.js";

/** Stories hub — transformation, community, leadership, country, media. */
export function renderStoriesHub(data, countrySlug = null) {
  return renderStoriesPage(data, countrySlug);
}

export function mountStoriesHub(_data) {
  mountStoriesPage();
}

export function destroyStoriesHub() {
  destroyStoriesPage();
}
