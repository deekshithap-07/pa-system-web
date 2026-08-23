import { renderWbScorecard, mountWbScorecard, destroyWbScorecard } from "../components/scorecard/wb-scorecard-hub.js";

/** Unified World Bank–style results hub. Subpages: working, countries, together, journey. */
export function renderScorecard(data, section = "overview") {
  return renderWbScorecard(data, section);
}

export function mountScorecard(_root, data, section = "overview") {
  mountWbScorecard(data, section);
}

export function destroyScorecard() {
  destroyWbScorecard();
}
