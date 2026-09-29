/**
 * Catchment page — every catchment in the country as a card; the selected one opens
 * wide with its communities. Detail lives on community pages, not here.
 */

import { getCountryBySlug, getCatchmentsByCountry, getCommunitiesByCatchment } from "../../utils/data.js";
import { attachCountryHubGeoMap } from "../../utils/hub-geo-maps.js";
import { renderHubGeoMap, bindHubGeoMap } from "../../map/components/HubGeoMap.js";
import { getCountryCover } from "../../utils/work-locations.js";

const TONES = ["maroon", "green", "gold", "ivory", "sage"];

function fmt(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function esc(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}

function regionOf(geoMap, ct, country) {
  const area = geoMap?.catchmentAreas?.find((a) => a.id === ct.id);
  if (area?.regionName) {
    const kind = area.regionKind ? ` ${area.regionKind[0].toUpperCase()}${area.regionKind.slice(1)}` : "";
    return `${area.regionName}${kind}`;
  }
  return ct.region && ct.region !== country.name ? ct.region : country.name;
}

function buildModel(countrySlug, data) {
  const country = getCountryBySlug(data.countries, countrySlug);
  if (!country) return null;
  const catchments = getCatchmentsByCountry(data.catchments, country.id);
  if (!catchments.length) return null;

  const hub = {
    country,
    catchments,
    catchmentMap: data.countryHubs?.hubs?.[countrySlug]?.catchmentMap,
  };
  attachCountryHubGeoMap(hub, data);

  const items = catchments.map((ct, i) => {
    const text = data.catchmentHubs?.hubs?.[ct.slug] || {};
    const communities = getCommunitiesByCatchment(data.communities, ct.id);
    return {
      ...ct,
      tone: TONES[i % TONES.length],
      regionLabel: regionOf(hub.geoMap, ct, country),
      lead: text.description || "",
      communities,
      stats: {
        communities: ct.summary?.communities ?? communities.length,
        pastors: ct.summary?.pastors ?? 0,
        shalom: ct.summary?.shalomGroups ?? 0,
        households: ct.summary?.households ?? 0,
      },
    };
  });

  const others = data.countries.countries.filter(
    (c) => c.slug !== countrySlug && getCatchmentsByCountry(data.catchments, c.id).length
  );

  return { country, items, geoMap: hub.geoMap, cover: getCountryCover(data, countrySlug), others };
}

function renderCommunityRow(country, ct, com, i) {
  const stage = com.journeyStage || com.status || "";
  return `
    <li style="--j:${i}">
      <a class="ctb-comm" href="#/community/${country.slug}/${ct.slug}/${com.slug}" data-link>
        <span class="ctb-comm__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="ctb-comm__body">
          <strong>${com.name}</strong>
          <span>${typeof com.pastors === "number" ? `${fmt(com.pastors)} pastors` : ""}${stage ? ` · ${stage}` : ""}</span>
        </span>
        <span class="ctb-comm__go" aria-hidden="true">→</span>
      </a>
    </li>`;
}

/** Zero in the public summary means "not reported yet", so it renders as a dash. */
function statValue(n, counted = false) {
  if (!n) return `<strong title="Not yet reported">—</strong>`;
  return counted ? `<strong data-ctb-count="${n}">${fmt(n)}</strong>` : `<strong>${fmt(n)}</strong>`;
}

function renderCardStats(ct) {
  return `
    <span class="ctb-card__stats">
      <span class="ctb-card__stat">${statValue(ct.stats.pastors)}<em>Pastors</em></span>
      <span class="ctb-card__stat">${statValue(ct.stats.shalom)}<em>Shalom groups</em></span>
      <span class="ctb-card__stat">${statValue(ct.stats.households)}<em>Households</em></span>
    </span>`;
}

function renderCard(model, ct, selected) {
  const { country } = model;
  const rows = ct.communities.map((com, i) => renderCommunityRow(country, ct, com, i)).join("");
  const names = ct.communities.map((c) => c.name).join(" · ");
  return `
    <article class="ctb-card ctb-card--${ct.tone}${selected ? " is-selected" : ""}" data-ctb-card="${ct.slug}"
      data-ctb-id="${ct.id}" style="view-transition-name: ctb-${ct.slug}">
      <button type="button" class="ctb-card__head" data-ctb-select="${ct.slug}" aria-expanded="${selected}">
        <span class="ctb-card__region">${ct.regionLabel} · ${country.name}</span>
        <strong class="ctb-card__name">${ct.name}</strong>
        ${ct.lead ? `<span class="ctb-card__statement">${ct.lead}</span>` : ""}
        ${renderCardStats(ct)}
        ${
          names
            ? `<span class="ctb-card__names"><em>${fmt(ct.stats.communities)} communities</em>${names}</span>`
            : ""
        }
      </button>
      <div class="ctb-card__open">
        ${
          rows
            ? `<p class="ctb-card__label">${fmt(ct.communities.length)} communities · open one</p><ol class="ctb-card__comms">${rows}</ol>`
            : `<p class="ctb-card__label">Community profiles for ${ct.name} will appear here.</p>`
        }
      </div>
    </article>`;
}

function renderHeroCopy(model, ct) {
  const { country } = model;
  return `
    <p class="ctb-kicker">Catchment in ${country.name}</p>
    <h1 class="ctb-hero__name" data-ctb-name>${ct.name}</h1>
    <p class="ctb-hero__region">${ct.regionLabel} · ${country.name}</p>
    ${ct.lead ? `<p class="ctb-hero__lead">${ct.lead}</p>` : ""}
    <ul class="ctb-hero__stats">
      <li>${statValue(ct.stats.communities, true)}<span>Communities</span></li>
      <li>${statValue(ct.stats.pastors, true)}<span>Pastors</span></li>
      <li>${statValue(ct.stats.shalom, true)}<span>Shalom groups</span></li>
      <li>${statValue(ct.stats.households, true)}<span>Households</span></li>
    </ul>
    <button type="button" class="ctb-hero__cta" data-ctb-scroll>See its communities ↓</button>`;
}

export function renderCatchmentBoard(countrySlug, catchmentSlug, data) {
  const model = buildModel(countrySlug, data);
  if (!model) return null;
  const selected = model.items.find((c) => c.slug === catchmentSlug);
  if (!selected) return null;
  const { country } = model;

  const html = `
    <div class="ctb-page" data-catchment-board data-country-slug="${country.slug}" data-selected="${selected.slug}">
      <header class="ctb-hero">
        ${model.cover.image ? `<img class="ctb-hero__bg" src="${model.cover.image}" alt="" aria-hidden="true">` : ""}
        <div class="container ctb-hero__grid">
          <div class="ctb-hero__copy">
            <nav class="ctb-trail" aria-label="Geographic hierarchy">
              <a href="#/africa" data-link>Africa</a>
              <a href="#/country/${country.slug}" data-link>${country.name}</a>
              <span class="is-here" data-ctb-trail-here>${selected.name}</span>
            </nav>
            <div data-ctb-hero-copy>${renderHeroCopy(model, selected)}</div>
          </div>
          <div class="ctb-hero__map" data-ctb-map>
            ${model.geoMap ? renderHubGeoMap(model.geoMap, { variant: "compact", mapId: "catchment-board", regions: true }) : ""}
            <p class="ctb-hero__map-hint">Tap an area to switch catchment</p>
          </div>
        </div>
      </header>

      <section class="ctb-board" id="ctb-board" aria-labelledby="ctb-board-title">
        <div class="container">
          <header class="ctb-board__head">
            <div>
              <p class="ctb-kicker ctb-kicker--dark">${model.items.length} catchments in ${country.name}</p>
              <h2 id="ctb-board-title" class="ctb-title">Choose a catchment, open a community</h2>
            </div>
            <p class="ctb-board__hint">The selected catchment opens with its communities. Each community page has the full detail and progress. <span>— not yet reported</span></p>
          </header>
          <div class="ctb-grid" data-ctb-grid style="--ctb-rows:${Math.max(1, Math.ceil((model.items.length - 1) / 2))}">
            ${model.items.map((ct) => renderCard(model, ct, ct.slug === selected.slug)).join("")}
          </div>
        </div>
      </section>

      <section class="ctb-close">
        <div class="container ctb-close__inner">
          <a class="ctb-close__back" href="#/country/${country.slug}" data-link>← Back to ${country.name}</a>
          ${
            model.others.length
              ? `<div class="ctb-close__others"><span>Catchments in</span>${model.others
                  .map((c) => `<a href="#/country/${c.slug}/catchments" data-link>${c.name}</a>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </section>
    </div>`;

  return { html, model, selected };
}

let hashListener = null;

export function mountCatchmentBoard(root, payload) {
  const page = root.querySelector("[data-catchment-board]");
  if (!page || !payload?.model) return;
  const { model } = payload;
  const country = model.country;
  const bySlug = new Map(model.items.map((c) => [c.slug, c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";

  const svg = page.querySelector(".hub-geo-map__svg");
  const highlightMap = (id) => {
    if (!svg) return;
    svg.querySelectorAll(".hub-geo-map__zone--region").forEach((el) => {
      el.classList.toggle("is-highlighted", el.dataset.catchmentId === id);
    });
    svg.querySelectorAll(".hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.entityId === id);
    });
    svg.classList.toggle("has-focus", id != null);
  };

  const countUp = () => {
    if (!hasGsap || reduced) return;
    page.querySelectorAll("[data-ctb-count]").forEach((el) => {
      const target = Number(el.dataset.ctbCount) || 0;
      const obj = { v: 0 };
      el.textContent = "0";
      gsap.to(obj, {
        v: target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = fmt(Math.round(obj.v));
        },
      });
    });
  };

  const applySelection = (slug) => {
    const ct = bySlug.get(slug);
    if (!ct) return;
    page.dataset.selected = slug;
    page.querySelectorAll("[data-ctb-card]").forEach((card) => {
      const on = card.dataset.ctbCard === slug;
      card.classList.toggle("is-selected", on);
      const head = card.querySelector("[data-ctb-select]");
      head?.setAttribute("aria-expanded", on ? "true" : "false");
    });
    const copy = page.querySelector("[data-ctb-hero-copy]");
    if (copy) copy.innerHTML = renderHeroCopy(model, ct);
    const here = page.querySelector("[data-ctb-trail-here]");
    if (here) here.textContent = ct.name;
    highlightMap(ct.id);
  };

  const select = (slug, { updateUrl = true } = {}) => {
    if (!bySlug.has(slug) || page.dataset.selected === slug) return;
    const run = () => applySelection(slug);
    if (document.startViewTransition && !reduced) {
      document.startViewTransition(run).finished.then(() => {
        countUp();
        revealComms();
      });
    } else {
      run();
      countUp();
      revealComms();
    }
    if (updateUrl) {
      history.replaceState(null, "", `#/catchment/${country.slug}/${slug}`);
      document.title = document.title.replace(/^[^|]+/, `${bySlug.get(slug).name} `);
    }
  };

  const revealComms = () => {
    if (!hasGsap || reduced) return;
    const rows = page.querySelectorAll(".ctb-card.is-selected .ctb-card__comms li");
    gsap.fromTo(rows, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", clearProps: "transform" });
  };

  page.addEventListener("click", (e) => {
    if (!e.target.closest("[data-ctb-scroll]")) return;
    const card = page.querySelector(".ctb-card.is-selected") || page.querySelector("#ctb-board");
    const headerH = document.getElementById("site-header")?.offsetHeight || 80;
    window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - headerH - 20, behavior: reduced ? "auto" : "smooth" });
  });

  page.querySelectorAll("[data-ctb-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.ctbSelect;
      select(slug);
      const card = page.querySelector(`[data-ctb-card="${slug}"]`);
      setTimeout(() => card?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" }), 350);
    });
  });

  bindHubGeoMap(page, { countrySlug: country.slug, onCatchmentNavigate: (slug) => select(slug) });

  svg?.querySelectorAll(".hub-geo-map__zone--region, .hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
    el.addEventListener("mouseleave", () => requestAnimationFrame(() => highlightMap(bySlug.get(page.dataset.selected)?.id)));
  });

  highlightMap(payload.selected.id);

  if (hashListener) window.removeEventListener("hashchange", hashListener);
  hashListener = () => {
    const m = location.hash.match(/^#\/catchment\/([^/]+)\/([^/#?]+)/);
    if (m && m[1] === country.slug && document.body.contains(page)) select(m[2], { updateUrl: false });
  };
  window.addEventListener("hashchange", hashListener);

  if (!hasGsap || reduced) return;
  gsap.fromTo(
    page.querySelectorAll(".ctb-trail, [data-ctb-hero-copy] > *"),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out", clearProps: "transform" }
  );
  gsap.fromTo(page.querySelector("[data-ctb-map]"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.15, clearProps: "transform" });
  countUp();
  gsap.fromTo(
    page.querySelectorAll("[data-ctb-card]"),
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.07,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: page.querySelector("[data-ctb-grid]"), start: "top 85%", once: true },
    }
  );
}

export function destroyCatchmentBoard() {
  if (hashListener) {
    window.removeEventListener("hashchange", hashListener);
    hashListener = null;
  }
}
