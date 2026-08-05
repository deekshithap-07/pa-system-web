import { applyLabelSpread, estimateLabelSize } from "../utils/label-layout.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function catchmentIdToSlug(id) {
  return id?.replace(/_/g, "-") || "";
}

function renderLabel(name, x, y, className, id, fontSize = 12) {
  const est = estimateLabelSize(name, { fontSize });
  return `
    <g class="${className}" data-entity-id="${id}" data-anchor-x="${x}" data-anchor-y="${y}"
       data-est-width="${est.width}" data-est-height="${est.height}" transform="translate(${x},${y})" role="button" tabindex="0" aria-label="${name}">
      <text class="${className}__text" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </g>`;
}

export function renderHubGeoMap(model, { variant = "full", mapId = "hub-geo-map" } = {}) {
  if (!model) {
    return `<div class="hub-geo-map hub-geo-map--empty"><p>Map data unavailable</p></div>`;
  }

  const isCompact = variant === "compact";
  const zones = (model.catchmentZones || [])
    .map(
      (z) => `<path class="hub-geo-map__zone hub-geo-map__zone--${z.status || "inactive"}"
        d="${z.d}" data-catchment-id="${z.id}" data-catchment-slug="${z.slug || catchmentIdToSlug(z.id)}"
        data-catchment-name="${z.name}" tabindex="0" role="button" aria-label="${z.name} catchment" />`
    )
    .join("");

  const catchmentAnchors = (model.catchments || [])
    .filter((c) => c.x != null)
    .map(
      (c) => `<circle class="hub-geo-map__catchment-anchor" cx="${c.x}" cy="${c.y}" r="4"
        data-catchment-id="${c.id}" aria-hidden="true" />`
    )
    .join("");

  const catchmentLabels = (model.catchments || [])
    .filter((c) => c.x != null && model.mode === "country")
    .map((c) => renderLabel(c.name, c.x, c.y, "hub-geo-map__catchment-label", c.id, 11))
    .join("");

  const communityAnchors = (model.communities || [])
    .filter((c) => c.x != null)
    .map(
      (c) => `<circle class="hub-geo-map__community-anchor" cx="${c.x}" cy="${c.y}" r="3.5"
        data-community-id="${c.id}" data-community-slug="${c.slug}" aria-hidden="true" />`
    )
    .join("");

  const communityLabels = (model.communities || [])
    .filter((c) => c.x != null)
    .map((c) => renderLabel(c.name, c.x, c.y, "hub-geo-map__community-label", c.id, 10))
    .join("");

  const catchmentOutline = model.catchmentOutline
    ? `<path class="hub-geo-map__zone hub-geo-map__zone--active" d="${model.catchmentOutline}" />`
    : "";

  const svg = `
    <svg class="hub-geo-map__svg" viewBox="${model.viewBox}" role="img"
      aria-label="${model.mode === "catchment" ? `Map of ${model.catchmentName} communities` : `Map of ${model.countryName} catchments`}">
      ${model.countryPath ? `<path class="hub-geo-map__country" d="${model.countryPath}" />` : ""}
      ${catchmentOutline}
      <g class="hub-geo-map__zones">${zones}</g>
      <g class="hub-geo-map__anchors">${catchmentAnchors}${communityAnchors}</g>
      <g class="hub-geo-map__labels hub-geo-map__labels--catchments">${catchmentLabels}</g>
      <g class="hub-geo-map__labels hub-geo-map__labels--communities">${communityLabels}</g>
    </svg>`;

  const listItems =
    model.mode === "country"
      ? (model.catchmentZones || [])
          .map(
            (z) => `<li><button type="button" class="hub-geo-map__list-btn" data-catchment-highlight="${z.id}" data-catchment-slug="${z.slug || catchmentIdToSlug(z.id)}">
              <span class="hub-geo-map__dot hub-geo-map__dot--${z.status || "inactive"}"></span>${z.name}
            </button></li>`
          )
          .join("")
      : (model.communities || [])
          .map(
            (c) => `<li><button type="button" class="hub-geo-map__list-btn" data-community-highlight="${c.slug}">
              <span class="hub-geo-map__dot hub-geo-map__dot--active"></span>${c.name}
            </button></li>`
          )
          .join("");

  const panel =
    !isCompact && listItems
      ? `<aside class="hub-geo-map__panel">
          <h3>${model.mode === "country" ? "Catchments" : "Communities"}</h3>
          <ul class="hub-geo-map__list">${listItems}</ul>
        </aside>`
      : "";

  return `
    <div class="hub-geo-map hub-geo-map--${variant} hub-geo-map--${model.mode}"
      data-hub-geo-map data-map-id="${mapId}" data-map-mode="${model.mode}">
      <div class="hub-geo-map__canvas">${svg}</div>
      ${panel}
      <div class="hub-geo-map__toast" hidden role="status" aria-live="polite"></div>
    </div>`;
}

function decorateLabels(svg) {
  svg.querySelectorAll(".hub-geo-map__catchment-label, .hub-geo-map__community-label").forEach((g) => {
    const text = g.querySelector("text");
    if (!text) return;
    try {
      const tb = text.getBBox();
      if (tb.width <= 0) return;
      const base = g.classList.contains("hub-geo-map__community-label") ? "hub-geo-map__community-label" : "hub-geo-map__catchment-label";
      const padX = 6;
      const padY = 3;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("class", `${base}__bg`);
      rect.setAttribute("x", tb.x - padX);
      rect.setAttribute("y", tb.y - padY);
      rect.setAttribute("width", tb.width + padX * 2);
      rect.setAttribute("height", tb.height + padY * 2);
      rect.setAttribute("rx", 3);
      g.insertBefore(rect, text);
    } catch {
      /* bbox unavailable */
    }
  });
}

export function bindHubGeoMap(root, { countrySlug, catchmentSlug, onCatchmentNavigate, onCommunityNavigate } = {}) {
  root.querySelectorAll("[data-hub-geo-map]").forEach((mapEl) => {
    const svg = mapEl.querySelector(".hub-geo-map__svg");
    if (!svg) return;

    decorateLabels(svg);

    const catchmentLabels = svg.querySelector(".hub-geo-map__labels--catchments");
    if (catchmentLabels) {
      applyLabelSpread(catchmentLabels, SVG_NS, {
        labelSelector: ".hub-geo-map__catchment-label",
        spread: 1.6,
        maxOffset: 48,
        gap: 8,
      });
    }

    const communityLabels = svg.querySelector(".hub-geo-map__labels--communities");
    if (communityLabels) {
      applyLabelSpread(communityLabels, SVG_NS, {
        labelSelector: ".hub-geo-map__community-label",
        spread: 2,
        maxOffset: 42,
        gap: 6,
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

    const highlightCatchment = (id) => {
      svg.querySelectorAll(".hub-geo-map__zone").forEach((p) => {
        p.classList.toggle("is-highlighted", p.dataset.catchmentId === id);
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

    svg.querySelectorAll(".hub-geo-map__catchment-label").forEach((label) => {
      const id = label.dataset.entityId;
      const zone = svg.querySelector(`[data-catchment-id="${id}"]`);
      const slug = zone?.dataset.catchmentSlug;
      const name = zone?.dataset.catchmentName || label.getAttribute("aria-label");
      label.addEventListener("click", () => goCatchment(slug, name));
    });

    mapEl.querySelectorAll("[data-catchment-highlight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.catchmentHighlight;
        const slug = btn.dataset.catchmentSlug;
        highlightCatchment(id);
        goCatchment(slug, btn.textContent.trim());
      });
    });

    mapEl.querySelectorAll("[data-community-highlight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.communityHighlight;
        svg.querySelector(`[data-community-slug="${slug}"]`)?.classList.add("is-pulsed");
        showToast(`${btn.textContent.trim()} — community hub coming soon`);
      });
    });
  });
}
