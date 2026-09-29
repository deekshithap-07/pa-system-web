import { applyMapFeatureLayout, estimateLabelSize } from "../utils/label-layout.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function catchmentIdToSlug(id) {
  return id?.replace(/_/g, "-") || "";
}

/** Label size in SVG user units — readable on hub / community maps. */
function labelFontSize(viewBox, { variant = "country" } = {}) {
  const parts = String(viewBox || "0 0 100 100").split(/\s+/).map(Number);
  const span = Math.max(parts[2] || 100, parts[3] || 100);
  if (variant === "schematic") return Math.max(11, Math.min(15, span * 0.048));
  if (variant === "catchment") return Math.max(11, Math.min(15, span * 0.045));
  return Math.max(7.5, Math.min(9, span * 0.032));
}

function renderLabel(name, x, y, className, id, slug, fontSize = 8) {
  const est = estimateLabelSize(name, { fontSize, padX: 4, padY: 2 });
  return `
    <g class="${className}" data-entity-id="${id}" data-entity-slug="${slug || ""}" data-anchor-x="${x}" data-anchor-y="${y}"
       data-est-width="${est.width}" data-est-height="${est.height}" transform="translate(${x},${y})" role="button" tabindex="0" aria-label="${name}">
      <text class="${className}__text" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </g>`;
}

function renderMarker(x, y, className, id, slug, r = 5) {
  return `<circle class="${className}" cx="${x}" cy="${y}" r="${r}"
    data-entity-id="${id}" data-entity-slug="${slug || ""}" aria-hidden="true" />`;
}

function measureLabel(label) {
  try {
    const tb = label.querySelector("text")?.getBBox();
    if (tb?.width > 0) {
      label.dataset.estWidth = String(tb.width + 4);
      label.dataset.estHeight = String(tb.height + 2);
    }
  } catch {
    /* bbox unavailable until painted */
  }
}

function layoutMapLabels(svg, mapEl, options) {
  applyMapFeatureLayout(svg, SVG_NS, { showLeaders: false, decorateLabel: measureLabel, ...options });
}

function parseViewBox(viewBox) {
  const p = String(viewBox || "0 0 100 100").split(/\s+/).map(Number);
  return { x: p[0] || 0, y: p[1] || 0, width: p[2] || 100, height: p[3] || 100 };
}

const REGION_TONES = ["#3f9a4a", "#2f7a38", "#7dbb72", "#5c9e3f", "#9ccc8a", "#24632d"];

function circlePolygon(x, y, r, sides = 28) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return pts;
}

/** Keep the side of the polygon closer to `a` than to `b` (perpendicular bisector clip). */
function clipByBisector(poly, a, b) {
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const c = (b[0] * b[0] + b[1] * b[1] - a[0] * a[0] - a[1] * a[1]) / 2;
  const inside = (p) => p[0] * nx + p[1] * ny <= c;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn !== prevIn) {
      const dx = cur[0] - prev[0];
      const dy = cur[1] - prev[1];
      const t = (c - prev[0] * nx - prev[1] * ny) / (dx * nx + dy * ny);
      out.push([prev[0] + dx * t, prev[1] + dy * t]);
    }
    if (curIn) out.push(cur);
  }
  return out;
}

/** Catchment areas: radius-limited Voronoi cells so neighbours share a border and never overlap. */
function buildCatchmentRegions(model) {
  const sites = (model.catchments || []).filter((c) => c.x != null && c.y != null);
  if (!sites.length) return [];
  const vb = parseViewBox(model.viewBox);
  const span = Math.max(vb.width, vb.height);

  return sites.map((site, i) => {
    const members = (model.communities || []).filter((m) => m.catchmentId === site.id && m.x != null);
    const reach = members.reduce((mx, m) => Math.max(mx, Math.hypot(m.x - site.x, m.y - site.y)), 0);
    const r = Math.max(span * 0.12, reach * 1.35);
    let poly = circlePolygon(site.x, site.y, r);
    sites.forEach((other) => {
      if (other === site || !poly.length) return;
      poly = clipByBisector(poly, [site.x, site.y], [other.x, other.y]);
    });
    return {
      id: site.id,
      slug: site.slug,
      name: site.name,
      tone: REGION_TONES[i % REGION_TONES.length],
      d: poly.length ? `M${poly.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")} Z` : "",
    };
  });
}

export function renderHubGeoMap(model, { variant = "full", mapId = "hub-geo-map", displayMode = "default", regions = false } = {}) {
  if (!model) {
    return `<div class="hub-geo-map hub-geo-map--empty"><p>Map data unavailable</p></div>`;
  }

  const isCompact = variant === "compact";
  const communitiesFocus =
    model.mode === "catchment" || (displayMode === "communities" && model.mode === "country");

  const isSchematic = model.layout === "schematic";
  const fontVariant = isSchematic ? "schematic" : model.mode === "catchment" ? "catchment" : "country";
  const labelFont = labelFontSize(model.viewBox, { variant: fontVariant });

  const showRegions = regions && model.mode === "country" && !communitiesFocus && model.countryPath;
  const clipId = `${mapId}-clip`;
  const realAreas = showRegions && model.catchmentAreas?.length;
  const regionCells = !showRegions
    ? []
    : realAreas
      ? model.catchmentAreas.map((a, i) => ({ ...a, tone: REGION_TONES[i % REGION_TONES.length] }))
      : buildCatchmentRegions(model).filter((r) => r.d);

  const zones = regionCells
    .map(
      (r, i) => `<path class="hub-geo-map__zone hub-geo-map__zone--region" d="${r.d}" style="--zc:${r.tone};--i:${i}"
        data-catchment-id="${r.id}" data-catchment-slug="${r.slug}" data-catchment-name="${r.name}"
        role="button" tabindex="0" aria-label="${r.name} catchment${r.regionName ? `, ${r.regionName} ${r.regionKind || ""}` : ""}"><title>${r.name}${r.regionName ? ` · ${r.regionName} ${r.regionKind || ""}` : ""}</title></path>`
    )
    .join("");

  const regionBorders = realAreas
    ? (model.regionBorders || [])
        .map((b) => `<path class="hub-geo-map__region-border" d="${b.d}" aria-hidden="true" />`)
        .join("")
    : "";

  const catchmentMarkers = communitiesFocus
    ? ""
    : (model.catchments || [])
        .filter((c) => c.x != null)
        .map((c) => renderMarker(c.x, c.y, "hub-geo-map__catchment-anchor", c.id, c.slug, showRegions ? 4.2 : 5))
        .join("");

  const catchmentLabels =
    !communitiesFocus && model.mode === "country"
      ? (model.catchments || [])
          .filter((c) => c.x != null)
          .map((c) => renderLabel(c.name, c.x, c.y, "hub-geo-map__catchment-label", c.id, c.slug, labelFont))
          .join("")
      : "";

  const communityMarkers = communitiesFocus
    ? (model.communities || [])
        .filter((c) => c.x != null)
        .map((c) => renderMarker(c.x, c.y, "hub-geo-map__community-anchor", c.id, c.slug, 5.5))
        .join("")
    : "";

  const communityLabels = communitiesFocus
    ? (model.communities || [])
        .filter((c) => c.x != null)
        .map((c) =>
          renderLabel(c.name, c.x, c.y, "hub-geo-map__community-label", c.id, c.slug, labelFont)
        )
        .join("")
    : "";

  const svg = `
    <svg class="hub-geo-map__svg" viewBox="${model.viewBox}" role="img"
      preserveAspectRatio="xMidYMid meet"
      aria-label="${model.mode === "catchment" ? `Map of ${model.catchmentName} communities` : `Map of ${model.countryName} catchments`}">
      ${showRegions ? `<defs><clipPath id="${clipId}"><path d="${model.countryPath}" /></clipPath></defs>` : ""}
      ${model.countryPath ? `<path class="hub-geo-map__country" d="${model.countryPath}" />` : ""}
      <g class="hub-geo-map__zones"${showRegions ? ` clip-path="url(#${clipId})"` : ""}>${zones}${regionBorders}</g>
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

  const legend = showRegions
    ? `<ul class="hub-geo-map__legend" aria-label="Map key">
        <li><span class="hub-geo-map__key hub-geo-map__key--region"></span>Catchment area</li>
        <li><span class="hub-geo-map__key hub-geo-map__key--catchment"></span>Catchment centre</li>
        ${realAreas ? `<li class="hub-geo-map__credit">Boundaries: geoBoundaries</li>` : ""}
      </ul>`
    : "";

  return `
    <div class="hub-geo-map hub-geo-map--${variant} hub-geo-map--${model.mode}${model.layout ? ` hub-geo-map--${model.layout}` : ""}${communitiesFocus ? " hub-geo-map--communities-focus" : ""}${showRegions ? " hub-geo-map--regions" : ""}"
      data-hub-geo-map data-map-id="${mapId}" data-map-mode="${model.mode}">
      <div class="hub-geo-map__canvas">${svg}</div>
      ${legend}
      ${panel}
      <div class="hub-geo-map__toast" hidden role="status" aria-live="polite"></div>
    </div>`;
}

export function bindHubGeoMap(root, { countrySlug, catchmentSlug, onCatchmentNavigate, onCommunityNavigate } = {}) {
  root.querySelectorAll("[data-hub-geo-map]").forEach((mapEl) => {
    const svg = mapEl.querySelector(".hub-geo-map__svg");
    if (!svg) return;

    const runLayout = () => {
      const vb = parseViewBox(svg.getAttribute("viewBox"));
      const viewBounds = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
      const radialBase = Math.max(12, Math.min(22, vb.width * 0.08));

      const catchmentLabelLayer = svg.querySelector(".hub-geo-map__labels--catchments");
      if (catchmentLabelLayer?.childElementCount) {
        layoutMapLabels(svg, mapEl, {
          labelSelector: ".hub-geo-map__catchment-label",
          anchorSelector: ".hub-geo-map__catchment-anchor",
          idKey: "entityId",
          moveAnchors: false,
          layoutMode: "radial",
          radialOffset: radialBase,
          radialGap: 5,
          maxOffset: Math.min(56, vb.width * 0.28),
          gap: 6,
          viewBounds,
          showLeaders: true,
        });
      }

      const communityLabelLayer = svg.querySelector(".hub-geo-map__labels--communities");
      if (communityLabelLayer?.childElementCount) {
        layoutMapLabels(svg, mapEl, {
          labelSelector: ".hub-geo-map__community-label",
          anchorSelector: ".hub-geo-map__community-anchor",
          idKey: "entityId",
          moveAnchors: false,
          layoutMode: "radial",
          radialOffset: Math.max(10, radialBase * 0.85),
          radialGap: 4,
          maxOffset: Math.min(48, vb.width * 0.24),
          gap: 5,
          viewBounds,
          showLeaders: true,
        });
      }
    };

    requestAnimationFrame(runLayout);

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
      svg.classList.toggle("has-focus", id != null);
    };

    const highlightCommunity = (slug) => {
      svg.querySelectorAll(".hub-geo-map__community-anchor, .hub-geo-map__community-label, .hub-geo-map__zone--community").forEach((el) => {
        const match = el.dataset.entitySlug === slug;
        el.classList.toggle("is-selected", match);
        el.classList.toggle("is-highlighted", match);
      });
    };

    svg.querySelectorAll(".hub-geo-map__zone--community").forEach((path) => {
      const slug = path.dataset.entitySlug;
      const name = path.getAttribute("aria-label") || slug;
      path.addEventListener("click", () => goCommunity(slug, name));
      path.addEventListener("mouseenter", () => highlightCommunity(slug));
      path.addEventListener("mouseleave", () => highlightCommunity(null));
    });

    svg.querySelectorAll(".hub-geo-map__zone:not(.hub-geo-map__zone--community)").forEach((path) => {
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
