import {
  renderImpactDataPage,
  mountImpactDataPage,
  destroyImpactDataPage,
} from "../components/scorecard/impact-data-page.js";

/** Impact & Data hub — PA-branded single page with section anchors. */
export function renderScorecard(data, section = "overview") {
  return renderImpactDataPage(data, section);
}

export function mountScorecard(_root, data, section = "overview") {
  mountImpactDataPage(data, section);
}

export function destroyScorecard() {
  destroyImpactDataPage();
}
