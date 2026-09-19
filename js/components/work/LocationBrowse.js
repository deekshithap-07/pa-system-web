import { formatNumber } from "../../utils/format.js";
import { getPaCountries, getRegions } from "../../utils/work-locations.js";

function countryMeta(data, slug) {
  const country = getPaCountries(data).find((c) => c.slug === slug);
  const stats = (data.scorecard?.countryStats || []).find((s) => s.slug === slug) || {};
  const communities = stats.communities ?? country?.summary?.communities ?? country?.communities ?? 0;
  const pastors = stats.pastors ?? country?.summary?.pastors ?? country?.pastors ?? 0;
  return { country, communities, pastors };
}

/** Largest networks first — not A–Z. */
export function countriesByNetworkSize(data) {
  return getPaCountries(data)
    .map((c) => {
      const meta = countryMeta(data, c.slug);
      return { ...c, communities: meta.communities, pastors: meta.pastors };
    })
    .sort((a, b) => b.communities - a.communities || b.pastors - a.pastors || a.name.localeCompare(b.name));
}

export function renderLocationHero(data) {
  const countries = countriesByNetworkSize(data);
  const countryItems = [
    `<a href="#/africa" class="wb-loc-menu__item" data-link>All countries</a>`,
    ...countries.map((c) => `<a href="#/country/${c.slug}" class="wb-loc-menu__item" data-link>${c.name}</a>`),
  ].join("");

  return `
    <section class="wb-loc-hero" aria-label="Where we work">
      <div class="wb-loc-hero__photo wb-photo--work" role="img" aria-label="Communities where Possibilities Africa works"></div>
    </section>
    <div class="wb-loc-bar">
      <div class="container wb-loc-bar__inner">
        <h1 class="wb-loc-bar__title">Browse our locations</h1>
        <div class="wb-loc-bar__actions">
          <div class="wb-loc-drop" data-loc-drop>
            <button type="button" class="wb-loc-drop__btn" aria-expanded="false" data-loc-toggle>By country</button>
            <div class="wb-loc-menu" hidden>${countryItems}</div>
          </div>
        </div>
      </div>
    </div>`;
}

export function bindLocationMenus(root = document) {
  const drops = [...root.querySelectorAll("[data-loc-drop]")];
  if (!drops.length) return;

  const closeAll = () => {
    drops.forEach((drop) => {
      drop.classList.remove("is-open");
      drop.querySelector("[data-loc-toggle]")?.setAttribute("aria-expanded", "false");
      const menu = drop.querySelector(".wb-loc-menu");
      if (menu) menu.hidden = true;
    });
  };

  drops.forEach((drop) => {
    const btn = drop.querySelector("[data-loc-toggle]");
    const menu = drop.querySelector(".wb-loc-menu");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = drop.classList.contains("is-open");
      closeAll();
      if (!open) {
        drop.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (menu) menu.hidden = false;
      }
    });
  });

  const onDoc = (e) => {
    if (!e.target.closest("[data-loc-drop]")) closeAll();
  };
  document.addEventListener("click", onDoc);
  root._locMenuOff = () => document.removeEventListener("click", onDoc);
}

export function renderRegionPage(data, regionId) {
  const region = getRegions(data).find((r) => r.id === regionId);
  if (!region) return `<div class="container static-page"><h1>Region not found</h1></div>`;

  const cards = region.countrySlugs
    .map((slug) => {
      const { country, communities, pastors } = countryMeta(data, slug);
      if (!country) return "";
      return `<a href="#/country/${country.slug}" class="wb-place-card" data-link>
        <span class="wb-place-card__kicker">Country</span>
        <h3>${country.name}</h3>
        <p>${formatNumber(communities)} communities · ${formatNumber(pastors)} pastors</p>
        <span class="wb-place-card__cta">Open ${country.name}</span>
      </a>`;
    })
    .join("");

  return `
    <div class="wb-place-page" data-work-place>
      ${renderLocationHero(data)}
      <section class="wb-place-body">
        <div class="container">
          <p class="wb-place-crumb"><a href="#/africa" data-link>Where we work</a> / ${region.name}</p>
          <h2 class="wb-place-title">${region.name}</h2>
          <p class="wb-place-lead">${region.lead}</p>
          <div class="wb-place-grid">${cards}</div>
        </div>
      </section>
    </div>`;
}

export function renderPlacesGroupedPage(data) {
  return `
    <div class="wb-place-page" data-work-place>
      ${renderLocationHero(data)}
      <section class="wb-place-body">
        <div class="container">
          <p class="wb-place-crumb"><a href="#/africa" data-link>Where we work</a> / How places are grouped</p>
          <h2 class="wb-place-title">How places are grouped</h2>
          <p class="wb-place-lead">The work is organised the same way in every country: a national network, a small cluster of neighbouring communities, then one community.</p>
          <div class="wb-place-steps">
            <article>
              <span>01</span>
              <h3>Country</h3>
              <p>A national pastor network — stories, figures, and nearby groups.</p>
              <a href="#/africa" data-link>Browse countries</a>
            </article>
            <article>
              <span>02</span>
              <h3>Nearby group</h3>
              <p>3–5 neighbouring communities that share pastors.</p>
            </article>
            <article>
              <span>03</span>
              <h3>One community</h3>
              <p>People, projects, and the two-year journey in one place.</p>
            </article>
          </div>
        </div>
      </section>
    </div>`;
}
