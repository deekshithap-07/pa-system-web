/**
 * Country catchments — every catchment in one country as its own block.
 * Country → catchment cards → existing community pages.
 */

import { getCountryBySlug, getCatchmentsByCountry, getCommunitiesByCatchment } from "../utils/data.js";
import { attachCountryHubGeoMap } from "../utils/hub-geo-maps.js";
import { getCountryCover } from "../utils/work-locations.js";
import { renderHubGeoMap, bindHubGeoMap } from "../map/components/HubGeoMap.js";

const TONES = ["maroon", "green", "gold", "ivory"];

function sum(list, key) {
  return list.reduce((n, c) => n + (Number(c.summary?.[key]) || 0), 0);
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function catchmentLine(ct, data) {
  const hub = data.catchmentHubs?.hubs?.[ct.slug];
  return hub?.heroTagline || hub?.description || "";
}

function renderCard(ct, i, country, data) {
  const tone = TONES[i % TONES.length];
  const communities = getCommunitiesByCatchment(data.communities, ct.id);
  const line = catchmentLine(ct, data);
  const region = ct.region && ct.region !== country.name ? ct.region : "";
  const href = `#/catchment/${country.slug}/${ct.slug}`;

  const chips = communities
    .map(
      (c) => `<li><a class="cc-card__chip" href="#/community/${country.slug}/${ct.slug}/${c.slug}" data-link>${c.name}</a></li>`
    )
    .join("");

  return `
    <article class="cc-card cc-card--${tone}${i === 0 ? " cc-card--lead" : ""}" data-cc-card data-cc-id="${ct.id}" style="--i:${i}">
      <header class="cc-card__head">
        <span class="cc-card__n">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3 class="cc-card__name"><a href="${href}" data-link>${ct.name}</a></h3>
          ${region ? `<p class="cc-card__region">${region}</p>` : ""}
        </div>
      </header>
      ${line ? `<p class="cc-card__line">${line}</p>` : ""}
      <dl class="cc-card__stats">
        <div><dt>Communities</dt><dd>${fmt(ct.summary?.communities ?? communities.length)}</dd></div>
        <div><dt>Pastors</dt><dd>${fmt(ct.summary?.pastors)}</dd></div>
        <div><dt>Shalom groups</dt><dd>${fmt(ct.summary?.shalomGroups)}</dd></div>
      </dl>
      ${
        chips
          ? `<div class="cc-card__comms">
              <p class="cc-card__label">Open a community</p>
              <ul class="cc-card__chips">${chips}</ul>
            </div>`
          : ""
      }
      <a class="cc-card__go" href="${href}" data-link>Open ${ct.name} catchment <span aria-hidden="true">→</span></a>
    </article>`;
}

export function renderCountryCatchments(slug, data) {
  const country = getCountryBySlug(data.countries, slug);
  if (!country) return { html: `<div class="container static-page"><h1>Country not found</h1></div>` };

  const catchments = getCatchmentsByCountry(data.catchments, country.id);
  const cover = getCountryCover(data, slug);
  const countryHub = data.countryHubs?.hubs?.[slug] || {};
  const hub = { country, catchments, catchmentMap: countryHub.catchmentMap };
  attachCountryHubGeoMap(hub, data);

  const withCatchments = data.countries.countries.filter(
    (c) => c.slug !== slug && getCatchmentsByCountry(data.catchments, c.id).length
  );

  const totals = [
    { label: "Catchments", value: catchments.length },
    { label: "Communities", value: sum(catchments, "communities") },
    { label: "Pastors", value: sum(catchments, "pastors") },
  ];

  const hero = `
    <header class="cc-hero">
      ${cover.image ? `<img class="cc-hero__img" src="${cover.image}" alt="" aria-hidden="true">` : ""}
      <div class="container cc-hero__inner">
        <nav class="cc-hero__trail" aria-label="Geographic hierarchy">
          <a href="#/africa" data-link>Africa</a><span aria-hidden="true">→</span>
          <a href="#/country/${slug}" data-link>${country.name}</a><span aria-hidden="true">→</span>
          <span class="is-here">Catchments</span>
        </nav>
        <p class="cc-kicker">Nearby groups</p>
        <h1 class="cc-hero__title">Catchments in <em>${country.name}</em></h1>
        <p class="cc-hero__lead">Each catchment is a nearby group of communities walking the two-year journey together. Open a catchment for its progress, or go straight to a community.</p>
        ${
          catchments.length
            ? `<ul class="cc-hero__totals">
                ${totals
                  .map(
                    (t) => `<li><strong data-cc-count="${t.value}">${fmt(t.value)}</strong><span>${t.label}</span></li>`
                  )
                  .join("")}
              </ul>`
            : ""
        }
      </div>
    </header>`;

  if (!catchments.length) {
    return {
      html: `
        <div class="cc-page" data-country-catchments data-country-slug="${slug}">
          ${hero}
          <section class="cc-empty">
            <div class="container">
              <p>Catchment data for ${country.name} will appear here as PA's network grows.</p>
              <a class="cc-btn" href="#/country/${slug}" data-link>Back to ${country.name}</a>
            </div>
          </section>
        </div>`,
      hub,
    };
  }

  const html = `
    <div class="cc-page" data-country-catchments data-country-slug="${slug}">
      ${hero}
      <section class="cc-map" aria-labelledby="cc-map-title">
        <div class="container cc-map__grid">
          <div class="cc-map__copy" data-cc-reveal>
            <p class="cc-kicker">On the map</p>
            <h2 id="cc-map-title" class="cc-title">Where each catchment sits</h2>
            <p class="cc-lead">Shaded areas show each catchment; gold dots mark its communities. Tap an area to open it.</p>
          </div>
          <div class="cc-map__frame" data-cc-map data-cc-reveal>
            ${hub.geoMap ? renderHubGeoMap(hub.geoMap, { variant: "compact", mapId: "country-catchments", regions: true }) : ""}
          </div>
        </div>
      </section>
      <section class="cc-grid-sec" aria-labelledby="cc-grid-title">
        <div class="container">
          <header class="cc-grid-sec__head" data-cc-reveal>
            <p class="cc-kicker">All catchments</p>
            <h2 id="cc-grid-title" class="cc-title">${catchments.length} catchments, ${fmt(sum(catchments, "communities"))} communities</h2>
          </header>
          <div class="cc-grid">${catchments.map((ct, i) => renderCard(ct, i, country, data)).join("")}</div>
        </div>
      </section>
      <section class="cc-more">
        <div class="container cc-more__inner" data-cc-reveal>
          <a class="cc-btn" href="#/country/${slug}" data-link>← Back to ${country.name}</a>
          ${
            withCatchments.length
              ? `<div class="cc-more__others">
                  <span>Catchments in</span>
                  ${withCatchments.map((c) => `<a href="#/country/${c.slug}/catchments" data-link>${c.name}</a>`).join("")}
                </div>`
              : ""
          }
        </div>
      </section>
    </div>`;

  return { html, hub };
}

export function mountCountryCatchments(root, hub) {
  const page = root.querySelector("[data-country-catchments]");
  if (!page) return;

  bindHubGeoMap(page, { countrySlug: hub?.country?.slug });

  const svg = page.querySelector(".hub-geo-map__svg");
  const highlight = (id) => {
    if (!svg) return;
    svg.querySelectorAll(".hub-geo-map__zone--region").forEach((el) => {
      el.classList.toggle("is-highlighted", id != null && el.dataset.catchmentId === id);
    });
    svg.querySelectorAll(".hub-geo-map__community-dot").forEach((el) => {
      el.classList.toggle("is-highlighted", id != null && el.dataset.catchmentId === id);
    });
    svg.querySelectorAll(".hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
      el.classList.toggle("is-selected", id != null && el.dataset.entityId === id);
    });
    svg.classList.toggle("has-focus", id != null);
  };
  page.querySelectorAll("[data-cc-card]").forEach((card) => {
    card.addEventListener("mouseenter", () => highlight(card.dataset.ccId));
    card.addEventListener("mouseleave", () => highlight(null));
  });

  if (typeof gsap === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.fromTo(
    page.querySelectorAll(".cc-hero__trail, .cc-kicker, .cc-hero__title, .cc-hero__lead, .cc-hero__totals li"),
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", clearProps: "transform" }
  );

  page.querySelectorAll("[data-cc-count]").forEach((el) => {
    const target = Number(el.dataset.ccCount) || 0;
    const obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      delay: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = fmt(Math.round(obj.v));
      },
    });
  });

  page.querySelectorAll("[data-cc-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  const zones = page.querySelectorAll(".hub-geo-map__zone--region");
  if (zones.length) {
    gsap.fromTo(
      zones,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: page.querySelector("[data-cc-map]"), start: "top 80%", once: true },
      }
    );
  }

  gsap.fromTo(
    page.querySelectorAll("[data-cc-card]"),
    { opacity: 0, y: 40, rotationX: -8, transformPerspective: 900 },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: page.querySelector(".cc-grid"), start: "top 85%", once: true },
    }
  );
}
