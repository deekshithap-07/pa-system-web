import {
  renderWhoWeArePage,
  mountWhoWeArePage,
  destroyWhoWeArePage,
} from "../components/about/who-we-are-page.js";

/** Who we are / About PA — institutional foundation page. */
export function renderAbout(data, section = "overview") {
  return renderWhoWeArePage(data, section);
}

export function mountAbout(_data, section = "overview") {
  mountWhoWeArePage(section);
}

export function destroyAbout() {
  destroyWhoWeArePage();
}
