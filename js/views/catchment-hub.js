import {
  renderCatchmentBoard,
  mountCatchmentBoard,
  destroyCatchmentBoard,
} from "../components/catchment-hub/CatchmentBoardPage.js";

export function renderCatchmentHub(countrySlug, catchmentSlug, data) {
  const result = renderCatchmentBoard(countrySlug, catchmentSlug, data);
  if (!result) {
    return {
      html: `<div class="container static-page"><h1>Catchment not found</h1><p><a href="#/country/${countrySlug}" data-link>Back to country</a></p></div>`,
    };
  }

  return {
    html: result.html,
    hub: {
      model: result.model,
      selected: result.selected,
      catchmentName: result.selected.name,
      countryName: result.model.country.name,
    },
  };
}

export function mountCatchmentHub(root, hub) {
  mountCatchmentBoard(root, hub);
}

export function destroyCatchmentHub() {
  destroyCatchmentBoard();
}
