import { renderWbScorecard, mountWbScorecard, destroyWbScorecard } from "../components/scorecard/wb-scorecard-hub.js";

/** Unified World Bank–style scorecard hub (includes former insights content as tabs). */
export function renderScorecard(data) {
  return renderWbScorecard(data);
}

export function mountScorecard(_root, data) {
  const anchor = location.hash.match(/#tab-(\w+)/)?.[1];
  mountWbScorecard(data, anchor || "overview");
}

export function destroyScorecard() {
  destroyWbScorecard();
}
