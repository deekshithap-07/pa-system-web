import { applyMapFeatureLayout, estimateLabelSize } from "../utils/label-layout.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function catchmentIdToSlug(id) {
  return id?.replace(/_/g, "-") || "";
}

function renderLabel(name, x, y, className, id, slug, fontSize = 8) {
  const est = estimateLabelSize(name, { fontSize });
  return `
    <g class="${className}" data-entity-id="${id}" data-entity-slug="${slug || ""}" data-anchor-x="${x}" data-anchor-y="${y}"
       data-est-width="${est.width}" data-est-height="${est.height}" transform="translate(${x},${y})" role="button" tabindex="0" aria-label="${name}">
      <text class="${className}__text" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </g>`;
}

function renderMarker(x, y, className, id, slug, r = 4) {
  return `<circle class="${className}" cx="${x}" cy="${y}" r="${r}"
    data-entity-id="${id}" data-entity-slug="${slug || ""}" aria-hidden="true" />`;
}

export function renderHubGeoMap(model, { variant = "full", mapId = "hub-geo-map", displayMode = "default" } = {}) {
  if (!model) {
    return `<div class="hub-geo-map hub-geo-map--empty"><p>Map data unavailable</p></div>`;
  }

  const isCompact = variant === "compact";
  const communitiesFocus =
    model.mode === "catchment" || (displayMode === "communities" && model.mode === "country");

  const zones = "";

  const catchmentMarkers = communitiesFocus
    ? ""
    : (model.catchments || [])
        .filter((c) => c.x != null)
        .map((c) => renderMarker(c.x, c.y, "hub-geo-map__catchment-anchor", c.id, c.slug, 3.5))
        .join("");

  const catchmentLabels =
    !communitiesFocus && model.mode === "country"
      ? (model.catchments || [])
          .filter((c) => c.x != null)
          .map((c) => renderLabel(c.name, c.x, c.y, "hub-geo-map__catchment-label", c.id, c.slug, 5))
          .join("")
      : "";

  const communityMarkers = communitiesFocus
    ? (model.communities || [])
        .filter((c) => c.x != null)
        .map((c) => renderMarker(c.x, c.y, "hub-geo-map__community-anchor", c.id, c.slug, 3.5))
        .join("")
    : "";

  const communityLabels = communitiesFocus
    ? (model.communities || [])
        .filter((c) => c.x != null)
        .map((c) =>
          renderLabel(c.name, c.x, c.y, "hub-geo-map__community-label", c.id, c.slug, 7)
        )
        .join("")
    : "";

  const svg = `
    <svg class="hub-geo-map__svg" viewBox="${model.viewBox}" role="img"
      aria-label="${model.mode === "catchment" ? `Map of ${model.catchmentName} communities` : `Map of ${model.countryName} catchments`}">
      ${model.countryPath ? `<path class="hub-geo-map__country" d="${model.countryPath}" />` : ""}
      <g class="hub-geo-map__zones">${zones}</g>
      <g class="hub-geo-map__anchors">${catchmentMarkers}${communityMarkers}</g>
      <g class="hub-geo-map__labels hub-geo-map__labels--catchments">${catchmentLabels}</g>
      <g class="hub-geo-map__labels hub-geo-map__labels--communities">${communityLabels}</g>
    </svg>`;

  const listItems = communitiesFocus
    ? (model.communities || [])
        .map(
          (c) => `<li><button type="button" class="hub-geo-map__list-btn" data-community-nav="${c.slug}">
              <span class="hub-geo-map__dot hub-geo-map__dot--active"></span>${c.name}
            </button></li>`
        )
        .join("")
    : model.mode === "country"
      ? (model.catchments?.length ? model.catchments : model.catchmentZones || [])
          .map(
            (z) => `<li><button type="button" class="hub-geo-map__list-btn" data-catchment-highlight="${z.id}" data-catchment-slug="${z.slug || catchmentIdToSlug(z.id)}">
              <span class="hub-geo-map__dot hub-geo-map__dot--${z.status || "inactive"}"></span>${z.name}
            </button></li>`
          )
          .join("")
      : (model.communities || [])
          .map(
            (c) => `<li><button type="button" class="hub-geo-map__list-btn" data-community-nav="${c.slug}">
              <span class="hub-geo-map__dot hub-geo-map__dot--active"></span>${c.name}
            </button></li>`
          )
          .join("");

  const panelTitle = communitiesFocus
    ? model.catchmentName || "Communities"
    : model.mode === "country"
      ? model.countryName
      : model.catchmentName || "Communities";

  const panel =
    !isCompact && listItems
      ? `<aside class="hub-geo-map__panel">
          <h3>${panelTitle}</h3>
          <ul class="hub-geo-map__list">${listItems}</ul>
        </aside>`
      : "";

  return `
    <div class="hub-geo-map hub-geo-map--${variant} hub-geo-map--${model.mode}${model.layout ? ` hub-geo-map--${model.layout}` : ""}${communitiesFocus ? " hub-geo-map--communities-focus" : ""}"
      data-hub-geo-map data-map-id="${mapId}" data-map-mode="${model.mode}">
      <div class="hub-geo-map__canvas">${svg}</div>
      ${panel}
      <div class="hub-geo-map__toast" hidden role="status" aria-live="polite"></div>
    </div>`;
}

export function bindHubGeoMap(root, { countrySlug, catchmentSlug, onCatchmentNavigate, onCommunityNavigate } = {}) {
  root.querySelectorAll("[data-hub-geo-map]").forEach((mapEl) => {
    const svg = mapEl.querySelector(".hub-geo-map__svg");
    if (!svg) return;

    const catchmentLabels = svg.querySelector(".hub-geo-map__labels--catchments");
    if (catchmentLabels?.childElementCount) {
      applyMapFeatureLayout(svg, SVG_NS, {
        labelSelector: ".hub-geo-map__catchment-label",
        anchorSelector: ".hub-geo-map__catchment-anchor",
        idKey: "entityId",
        spread: 2.2,
        maxOffset: 42,
        gap: 10,
        minAnchorDistance: 15,
        anchorMaxNudge: 20,
      });
    }

    const communityLabels = svg.querySelector(".hub-geo-map__labels--communities");
    if (communityLabels?.childElementCount) {
      const isCatchment = mapEl.dataset.mapMode === "catchment";
      applyMapFeatureLayout(svg, SVG_NS, {
        labelSelector: ".hub-geo-map__community-label",
        anchorSelector: ".hub-geo-map__community-anchor",
        idKey: "entityId",
        spread: isCatchment ? 2.4 : 2.8,
        maxOffset: isCatchment ? 38 : 48,
        gap: 11,
        minAnchorDistance: 16,
        anchorMaxNudge: 22,
      });
    }

    const toast = mapEl.querySelector(".hub-geo-map__toast");
    let toastTimer;

    const showToast = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, 2600);
    };

    const goCatchment = (slug, name) => {
      if (slug && countrySlug) {
        if (onCatchmentNavigate) onCatchmentNavigate(slug);
        else location.hash = `#/catchment/${countrySlug}/${slug}`;
        return;
      }
      showToast(`${name} — catchment data not available`);
    };

    const goCommunity = (slug, name) => {
      if (slug && countrySlug && catchmentSlug) {
        if (onCommunityNavigate) onCommunityNavigate(slug);
        else location.hash = `#/community/${countrySlug}/${catchmentSlug}/${slug}`;
        return;
      }
      showToast(`${name} — community page not available`);
    };

    const highlightCatchment = (id) => {
      svg.querySelectorAll(".hub-geo-map__zone").forEach((p) => {
        p.classList.toggle("is-highlighted", p.dataset.catchmentId === id);
      });
      svg.querySelectorAll(".hub-geo-map__catchment-anchor, .hub-geo-map__catchment-label").forEach((el) => {
        el.classList.toggle("is-selected", el.dataset.entityId === id);
      });
    };

    const highlightCommunity = (slug) => {
      svg.querySelectorAll(".hub-geo-map__community-anchor, .hub-geo-map__community-label").forEach((el) => {
        const match = el.dataset.entitySlug === slug;
        el.classList.toggle("is-selected", match);
      });
    };

    svg.querySelectorAll(".hub-geo-map__zone").forEach((path) => {
      const { catchmentSlug: slug, catchmentName: name, catchmentId: id } = path.dataset;
      path.addEventListener("mouseenter", () => {
        path.classList.add("is-hovered");
        highlightCatchment(id);
      });
      path.addEventListener("mouseleave", () => {
        path.classList.remove("is-hovered");
        highlightCatchment(null);
      });
      path.addEventListener("click", () => goCatchment(slug, name));
      path.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goCatchment(slug, name);
        }
      });
    });

    svg.querySelectorAll(".hub-geo-map__catchment-label, .hub-geo-map__catchment-anchor").forEach((el) => {
      const slug = el.dataset.entitySlug;
      const name = el.getAttribute?.("aria-label") || slug;
      el.addEventListener("click", () => goCatchment(slug, name));
    });

    svg.querySelectorAll(".hub-geo-map__community-label, .hub-geo-map__community-anchor").forEach((el) => {
      const slug = el.dataset.entitySlug;
      const name = el.getAttribute?.("aria-label") || slug;
      el.addEventListener("click", () => goCommunity(slug, name));
      el.addEventListener("mouseenter", () => highlightCommunity(slug));
      el.addEventListener("mouseleave", () => highlightCommunity(null));
    });

    mapEl.querySelectorAll("[data-catchment-highlight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.catchmentHighlight;
        const slug = btn.dataset.catchmentSlug;
        highlightCatchment(id);
        goCatchment(slug, btn.textContent.trim());
      });
    });

    mapEl.querySelectorAll("[data-community-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.communityNav;
        highlightCommunity(slug);
        goCommunity(slug, btn.textContent.trim());
      });
    });
  });
}
