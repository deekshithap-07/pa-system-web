/**
 * Spread overlapping map name labels and anchor dots while keeping them near geographic anchors.
 */

function readDataId(el, idKey) {
  if (!el) return null;
  return el.dataset?.[idKey] ?? el.getAttribute(`data-${idKey.replace(/([A-Z])/g, "-$1").toLowerCase()}`);
}

export function estimateLabelSize(name, { fontSize = 13, padX = 14, padY = 8 } = {}) {
  const charW = fontSize * 0.58;
  const width = Math.max(name.length * charW + padX, 48);
  const height = fontSize + padY;
  return { width, height };
}

/**
 * Nudge clustered anchor dots apart so they do not stack on top of each other.
 */
export function spreadPointMarkers(markers, { minDistance = 16, maxOffset = 22, iterations = 80 } = {}) {
  if (markers.length < 2) return markers;

  const nodes = markers.map((m) => ({
    ...m,
    origX: m.x,
    origY: m.y,
  }));

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist >= minDistance) continue;

        const push = (minDistance - dist) / 2 + 0.4;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }

    nodes.forEach((n) => {
      const dx = n.origX - n.x;
      const dy = n.origY - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxOffset) {
        const ratio = maxOffset / dist;
        n.x = n.origX + dx * ratio;
        n.y = n.origY + dy * ratio;
      } else if (dist > 0.5) {
        n.x += dx * 0.06;
        n.y += dy * 0.06;
      }
    });
  }

  return nodes;
}

/**
 * @param {Array<{ id: string, anchorX: number, anchorY: number, width: number, height: number }>} items
 * @returns {Map<string, { x: number, y: number, anchorX: number, anchorY: number, offsetX: number, offsetY: number }>}
 */
export function computeSpreadPositions(
  items,
  { gap = 8, iterations = 120, maxOffset = 90, spread = 1, obstacles = [] } = {}
) {
  if (!items.length) return new Map();

  const effectiveGap = gap * spread;
  const effectiveMax = maxOffset * spread;

  const nodes = items.map((item) => ({
    ...item,
    x: item.anchorX,
    y: item.anchorY,
  }));

  const repelFromObstacles = (node) => {
    obstacles.forEach((obs) => {
      const dx = node.x - obs.x;
      const dy = node.y - obs.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minDist = node.width / 2 + (obs.r || 4) + effectiveGap;
      if (dist < minDist) {
        const push = minDist - dist + 0.5;
        node.x += (dx / dist) * push;
        node.y += (dy / dist) * push;
      }
    });
  };

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const overlapX = a.width / 2 + b.width / 2 + effectiveGap - Math.abs(a.x - b.x);
        const overlapY = a.height / 2 + b.height / 2 + effectiveGap - Math.abs(a.y - b.y);

        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const dir = a.x <= b.x ? -1 : 1;
            const move = overlapX / 2 + 0.5;
            a.x -= dir * move;
            b.x += dir * move;
          } else {
            const dir = a.y <= b.y ? -1 : 1;
            const move = overlapY / 2 + 0.5;
            a.y -= dir * move;
            b.y += dir * move;
          }
        }
      }
    }

    nodes.forEach((n) => {
      repelFromObstacles(n);

      const dx = n.anchorX - n.x;
      const dy = n.anchorY - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist > effectiveMax) {
        const ratio = effectiveMax / dist;
        n.x = n.anchorX + dx * ratio;
        n.y = n.anchorY + dy * ratio;
      } else if (dist > 1) {
        n.x += dx * 0.07;
        n.y += dy * 0.07;
      }
    });
  }

  const result = new Map();
  nodes.forEach((n) => {
    result.set(n.id, {
      x: n.x,
      y: n.y,
      anchorX: n.anchorX,
      anchorY: n.anchorY,
      offsetX: n.x - n.anchorX,
      offsetY: n.y - n.anchorY,
    });
  });
  return result;
}

/**
 * Measure rendered SVG label groups and apply spread offsets + optional leader lines.
 */
export function applyLabelSpread(container, SVG_NS, options = {}) {
  const {
    labelSelector = ".catchment-name, .community-name",
    leaderClass = "map-label-leader",
    spread = 1,
    maxOffset = 90,
    gap = 8,
    obstacles = [],
    iterations = 120,
    viewBounds = null,
    showLeaders = true,
  } = options;

  const labels = [...container.querySelectorAll(labelSelector)];
  if (!labels.length) return;

  container.querySelectorAll(`.${leaderClass}`).forEach((el) => el.remove());

  const items = labels
    .map((label) => {
      const anchorX = Number(label.dataset.anchorX);
      const anchorY = Number(label.dataset.anchorY);
      const id = readDataId(label, "entityId") || readDataId(label, "catchmentId") || readDataId(label, "communityId");
      let width = Number(label.dataset.estWidth);
      let height = Number(label.dataset.estHeight);

      try {
        const bg = label.querySelector("rect");
        if (bg) {
          width = Number(bg.getAttribute("width")) || width;
          height = Number(bg.getAttribute("height")) || height;
        } else {
          const tb = label.querySelector("text")?.getBBox();
          if (tb?.width > 0) {
            width = tb.width + 4;
            height = tb.height + 2;
          }
        }
      } catch {
        /* bbox unavailable */
      }

      if (!width) {
        const est = estimateLabelSize(label.getAttribute("aria-label") || "");
        width = est.width;
        height = est.height;
      }

      return { id, anchorX, anchorY, width, height };
    })
    .filter((item) => item.id != null && !Number.isNaN(item.anchorX));

  const positions = computeSpreadPositions(items, { spread, maxOffset, gap, obstacles, iterations });
  const scale = options.viewScale || 1;
  const leaderThreshold = 6 / scale;

  labels.forEach((label) => {
    const id = readDataId(label, "entityId") || readDataId(label, "catchmentId") || readDataId(label, "communityId");
    let pos = positions.get(id);
    if (!pos && labels.length === 1) {
      const item = items[0];
      pos = {
        x: item.anchorX,
        y: item.anchorY - 12,
        anchorX: item.anchorX,
        anchorY: item.anchorY,
        offsetX: 0,
        offsetY: -12,
      };
    }
    if (!pos) return;

    let { x, y } = pos;
    if (viewBounds) {
      const w = Number(label.dataset.estWidth) || 48;
      const h = Number(label.dataset.estHeight) || 16;
      const pad = 4;
      x = Math.max(viewBounds.x + w / 2 + pad, Math.min(viewBounds.x + viewBounds.width - w / 2 - pad, x));
      y = Math.max(viewBounds.y + h / 2 + pad, Math.min(viewBounds.y + viewBounds.height - h / 2 - pad, y));
      pos = { ...pos, x, y, offsetX: x - pos.anchorX, offsetY: y - pos.anchorY };
    }

    label.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    label.dataset.offsetX = String(pos.offsetX);
    label.dataset.offsetY = String(pos.offsetY);

    const dist = Math.hypot(pos.offsetX, pos.offsetY);
    if (showLeaders && dist > leaderThreshold) {
      const leader = document.createElementNS(SVG_NS, "line");
      leader.setAttribute("class", leaderClass);
      leader.setAttribute("x1", pos.anchorX);
      leader.setAttribute("y1", pos.anchorY);
      leader.setAttribute("x2", pos.x);
      leader.setAttribute("y2", pos.y);
      container.insertBefore(leader, container.firstChild);
    }
  });
}

/**
 * Spread anchor dots, then spread labels away from each other and from dots.
 */
export function applyMapFeatureLayout(container, SVG_NS, options = {}) {
  const {
    labelSelector,
    anchorSelector,
    idKey = "catchmentId",
    spread = 2,
    maxOffset = 90,
    gap = 12,
    minAnchorDistance = 16,
    anchorMaxNudge = 22,
    viewScale = 1,
    decorateLabel,
    moveAnchors = true,
    layoutMode = "spread",
    viewBounds = null,
    showLeaders = true,
  } = options;

  const idAttr = `data-${idKey.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
  const markers = [];

  container.querySelectorAll(anchorSelector).forEach((anchor) => {
    const id = readDataId(anchor, idKey);
    if (!id) return;
    const x = Number(anchor.getAttribute("cx"));
    const y = Number(anchor.getAttribute("cy"));
    if (Number.isNaN(x) || Number.isNaN(y)) return;

    const hit = container.querySelector(`[class*="path--hit"][${idAttr}="${id}"]`);
    const label = container.querySelector(`${labelSelector}[${idAttr}="${id}"]`);

    markers.push({ id, anchor, hit, label, x, y, origX: x, origY: y });
  });

  if (!markers.length) return;

  const anchorNodes = moveAnchors
    ? spreadPointMarkers(markers, {
        minDistance: minAnchorDistance,
        maxOffset: anchorMaxNudge,
        iterations: options.anchorIterations || 120,
      })
    : markers;

  if (moveAnchors) {
    anchorNodes.forEach((m) => {
      m.anchor.setAttribute("cx", String(m.x));
      m.anchor.setAttribute("cy", String(m.y));
      m.hit?.setAttribute("cx", String(m.x));
      m.hit?.setAttribute("cy", String(m.y));
      if (m.label) {
        m.label.dataset.anchorX = String(m.x);
        m.label.dataset.anchorY = String(m.y);
      }
    });
  }

  if (decorateLabel) {
    container.querySelectorAll(labelSelector).forEach((label) => decorateLabel(label));
  }

  if (layoutMode === "radial") {
    applyRadialLabelLayout(container, SVG_NS, {
      labelSelector,
      baseOffset: options.radialOffset || 14,
      gap: options.radialGap || 5,
      viewBounds,
      showLeaders,
    });
    return;
  }

  const obstacles = anchorNodes.map((m) => ({
    x: m.x,
    y: m.y,
    r: 4,
  }));

  applyLabelSpread(container, SVG_NS, {
    labelSelector,
    spread,
    maxOffset,
    gap,
    viewScale,
    obstacles,
    iterations: options.labelIterations || 160,
    viewBounds,
    showLeaders,
  });
}

function boxesOverlap(a, b, gap = 4) {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 + gap &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2 + gap
  );
}

const RADIAL_DIRS = [
  [0, -1],
  [0.85, -0.55],
  [1, 0],
  [0.85, 0.55],
  [0, 1],
  [-0.85, 0.55],
  [-1, 0],
  [-0.85, -0.55],
];

/**
 * Place labels on compass offsets from fixed anchors — pins stay on exact coordinates.
 */
export function applyRadialLabelLayout(container, SVG_NS, options = {}) {
  const {
    labelSelector = ".hub-geo-map__community-label",
    leaderClass = "map-label-leader",
    baseOffset = 16,
    gap = 6,
    viewBounds = null,
    showLeaders = true,
  } = options;

  const labels = [...container.querySelectorAll(labelSelector)];
  if (!labels.length) return;

  container.querySelectorAll(`.${leaderClass}`).forEach((el) => el.remove());

  const placed = [];

  labels.forEach((label, index) => {
    const anchorX = Number(label.dataset.anchorX);
    const anchorY = Number(label.dataset.anchorY);
    if (Number.isNaN(anchorX)) return;

    let width = Number(label.dataset.estWidth) || 48;
    let height = Number(label.dataset.estHeight) || 16;
    try {
      const bg = label.querySelector("rect");
      if (bg) {
        width = Number(bg.getAttribute("width")) || width;
        height = Number(bg.getAttribute("height")) || height;
      }
    } catch {
      /* ignore */
    }

    const dirs = [...RADIAL_DIRS];
    if (index % 2) dirs.reverse();

    let best = { x: anchorX, y: anchorY - baseOffset - height / 2, score: Infinity };

    for (let distMul = 1; distMul <= 5; distMul += 1) {
      const dist = baseOffset * distMul + height / 2;
      for (const [dx, dy] of dirs) {
        const x = anchorX + dx * dist;
        const y = anchorY + dy * dist;
        if (viewBounds) {
          const pad = 4;
          if (
            x - width / 2 < viewBounds.x + pad ||
            x + width / 2 > viewBounds.x + viewBounds.width - pad ||
            y - height / 2 < viewBounds.y + pad ||
            y + height / 2 > viewBounds.y + viewBounds.height - pad
          ) {
            continue;
          }
        }
        const candidate = { x, y, width, height };
        const hits = placed.some((p) => boxesOverlap(candidate, p, gap));
        if (hits) continue;
        const score = Math.hypot(x - anchorX, y - anchorY) + distMul * 0.5;
        if (score < best.score) best = { x, y, score };
      }
      if (best.score < Infinity) break;
    }

    if (best.score === Infinity) {
      const fallbackDist = baseOffset * 3.2 + height / 2;
      const [dx, dy] = dirs[index % dirs.length];
      best = {
        x: anchorX + dx * fallbackDist,
        y: anchorY + dy * fallbackDist,
        score: fallbackDist,
      };
    }

    placed.push({ x: best.x, y: best.y, width, height });
    label.setAttribute("transform", `translate(${best.x},${best.y})`);
    label.dataset.offsetX = String(best.x - anchorX);
    label.dataset.offsetY = String(best.y - anchorY);

    const offset = Math.hypot(best.x - anchorX, best.y - anchorY);
    if (showLeaders && offset > 4) {
      const leader = document.createElementNS(SVG_NS, "line");
      leader.setAttribute("class", leaderClass);
      leader.setAttribute("x1", String(anchorX));
      leader.setAttribute("y1", String(anchorY));
      leader.setAttribute("x2", String(best.x));
      leader.setAttribute("y2", String(best.y));
      const layer = label.parentElement || container;
      layer.insertBefore(leader, layer.firstChild);
    }
  });
}
