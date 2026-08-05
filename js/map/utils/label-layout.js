/**
 * Spread overlapping map name labels while keeping them near geographic anchors.
 */

export function estimateLabelSize(name, { fontSize = 13, padX = 14, padY = 8 } = {}) {
  const charW = fontSize * 0.58;
  const width = Math.max(name.length * charW + padX, 48);
  const height = fontSize + padY;
  return { width, height };
}

/**
 * @param {Array<{ id: string, anchorX: number, anchorY: number, width: number, height: number }>} items
 * @returns {Map<string, { x: number, y: number, anchorX: number, anchorY: number, offsetX: number, offsetY: number }>}
 */
export function computeSpreadPositions(items, { gap = 8, iterations = 90, maxOffset = 90, spread = 1 } = {}) {
  if (!items.length) return new Map();

  const effectiveGap = gap * spread;
  const effectiveMax = maxOffset * spread;

  const nodes = items.map((item) => ({
    ...item,
    x: item.anchorX,
    y: item.anchorY,
  }));

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
      const dx = n.anchorX - n.x;
      const dy = n.anchorY - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist > effectiveMax) {
        const ratio = effectiveMax / dist;
        n.x = n.anchorX + dx * ratio;
        n.y = n.anchorY + dy * ratio;
      } else if (dist > 1) {
        n.x += dx * 0.08;
        n.y += dy * 0.08;
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
  } = options;

  const labels = [...container.querySelectorAll(labelSelector)];
  if (labels.length < 2) return;

  container.querySelectorAll(`.${leaderClass}`).forEach((el) => el.remove());

  const items = labels.map((label) => {
    const anchorX = Number(label.dataset.anchorX);
    const anchorY = Number(label.dataset.anchorY);
    const id = label.dataset.entityId || label.dataset.catchmentId || label.dataset.communityId;
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
          width = tb.width + 14;
          height = tb.height + 8;
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
  }).filter((item) => item.id != null && !Number.isNaN(item.anchorX));

  const positions = computeSpreadPositions(items, { spread, maxOffset, gap });
  const scale = options.viewScale || 1;
  const leaderThreshold = 6 / scale;

  labels.forEach((label) => {
    const id = label.dataset.entityId || label.dataset.catchmentId || label.dataset.communityId;
    const pos = positions.get(id);
    if (!pos) return;

    label.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    label.dataset.offsetX = String(pos.offsetX);
    label.dataset.offsetY = String(pos.offsetY);

    const dist = Math.hypot(pos.offsetX, pos.offsetY);
    if (dist > leaderThreshold) {
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
