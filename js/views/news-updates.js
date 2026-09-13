/**
 * News & Updates view wrapper.
 */

import {
  renderNewsUpdatesPage,
  mountNewsUpdatesPage,
  destroyNewsUpdatesPage,
} from "../components/news/news-updates-page.js";

export function renderNewsUpdates(data) {
  return renderNewsUpdatesPage(data);
}

export function mountNewsUpdates() {
  mountNewsUpdatesPage();
}

export function destroyNewsUpdates() {
  destroyNewsUpdatesPage();
}
