/**
 * SVG geometry helpers for map zoom calculations.
 */

export function getPathCentroid(pathEl) {
  if (!pathEl) return { x: 500, y: 500 };
  const bbox = pathEl.getBBox();
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    bbox,
  };
}

function svgToScreen(bbox, svg, container) {
  const viewBox = svg.viewBox.baseVal;
  const vbW = viewBox.width || 1000;
  const vbH = viewBox.height || 1000;
  const scaleX = container.clientWidth / vbW;
  const scaleY = container.clientHeight / vbH;
  return {
    scaleX,
    scaleY,
    bw: bbox.width * scaleX,
    bh: bbox.height * scaleY,
    cx: (bbox.x + bbox.width / 2) * scaleX,
    cy: (bbox.y + bbox.height / 2) * scaleY,
  };
}

/** Expand a bbox to include point anchors (catchments / communities). */
export function expandBBoxWithPoints(bbox, points = [], padRatio = 0.12) {
  let minX = bbox.x;
  let minY = bbox.y;
  let maxX = bbox.x + bbox.width;
  let maxY = bbox.y + bbox.height;

  points.forEach((p) => {
    if (p?.x == null || p?.y == null) return;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  const span = Math.max(maxX - minX, maxY - minY, bbox.width, bbox.height, 1);
  const pad = span * padRatio;
  return {
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

/** Fit a geographic bbox into the canvas aspect ratio (viewBox zoom — crisp SVG text). */
export function computeViewBoxForBBox(bbox, containerW, containerH, padding = 0.12) {
  const padX = bbox.width * padding;
  const padY = bbox.height * padding;
  let w = bbox.width + padX * 2;
  let h = bbox.height + padY * 2;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const containerAR = containerW / Math.max(containerH, 1);
  const bboxAR = w / Math.max(h, 1);

  if (bboxAR > containerAR) {
    h = w / containerAR;
  } else {
    w = h * containerAR;
  }

  return {
    x: cx - w / 2,
    y: cy - h / 2,
    width: w,
    height: h,
  };
}

/** Full-Africa viewBox fitted to the canvas. */
export function computeAfricaViewBox(svg, container) {
  const viewBox = svg.viewBox.baseVal;
  const vbW = viewBox.width || 1000;
  const vbH = viewBox.height || 1000;
  let africaBBox = { x: 24, y: 24, width: vbW - 48, height: vbH - 48 };

  const layer = svg.querySelector("#countries-layer");
  if (layer) {
    try {
      const bb = layer.getBBox();
      if (bb.width > 10 && bb.height > 10) {
        const pad = Math.max(bb.width, bb.height) * 0.05;
        africaBBox = {
          x: bb.x - pad,
          y: bb.y - pad,
          width: bb.width + pad * 2,
          height: bb.height + pad * 2,
        };
      }
    } catch {
      /* getBBox may fail before layout */
    }
  }

  return computeViewBoxForBBox(
    africaBBox,
    container.clientWidth,
    container.clientHeight,
    0.04
  );
}

export function viewBoxZoomRatio(baseViewBox, currentViewBox) {
  if (!baseViewBox?.width || !currentViewBox?.width) return 1;
  return baseViewBox.width / currentViewBox.width;
}

/** Wheel zoom toward cursor — returns a new viewBox. */
export function wheelZoomViewBox(vb, mx, my, containerW, containerH, factor) {
  const relX = mx / Math.max(containerW, 1);
  const relY = my / Math.max(containerH, 1);
  const svgX = vb.x + relX * vb.width;
  const svgY = vb.y + relY * vb.height;
  const ar = vb.width / Math.max(vb.height, 1);

  const newW = vb.width / factor;
  const newH = newW / ar;
  const newX = svgX - relX * newW;
  const newY = svgY - relY * newH;

  return { x: newX, y: newY, width: newW, height: newH };
}

export function clampViewBoxWidth(vb, minWidth, maxWidth) {
  const w = Math.max(minWidth, Math.min(maxWidth, vb.width));
  const ar = vb.width / Math.max(vb.height, 1);
  const h = w / ar;
  const cx = vb.x + vb.width / 2;
  const cy = vb.y + vb.height / 2;
  return {
    x: cx - w / 2,
    y: cy - h / 2,
    width: w,
    height: h,
  };
}

/** @deprecated CSS-transform zoom — kept for home scroll map */
export function computeZoomToBBox(bbox, svg, container, padding = 0.12, maxScaleCap = 6) {
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  const { bw, bh, cx, cy } = svgToScreen(bbox, svg, container);

  const maxScale = Math.min(
    (containerW * (1 - padding * 2)) / Math.max(bw, 1),
    (containerH * (1 - padding * 2)) / Math.max(bh, 1),
    maxScaleCap
  );

  return {
    x: containerW / 2 - cx * maxScale,
    y: containerH / 2 - cy * maxScale,
    scale: maxScale,
    cx,
    cy,
  };
}

/** @deprecated CSS-transform zoom — kept for home scroll map */
export function computeAfricaZoom(svg, container, bboxOverride = null) {
  const viewBox = svg.viewBox.baseVal;
  const vbW = viewBox.width || 1000;
  const vbH = viewBox.height || 1000;
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;

  let africaBBox = bboxOverride;
  if (!africaBBox) {
    const layer = svg.querySelector("#countries-layer");
    africaBBox = { x: 24, y: 24, width: vbW - 48, height: vbH - 48 };
    if (layer) {
      try {
        const bb = layer.getBBox();
        if (bb.width > 10 && bb.height > 10) {
          const pad = Math.max(bb.width, bb.height) * 0.04;
          africaBBox = {
            x: bb.x - pad,
            y: bb.y - pad,
            width: bb.width + pad * 2,
            height: bb.height + pad * 2,
          };
        }
      } catch {
        /* getBBox may fail before layout */
      }
    }
  }

  const { bw, bh, cx, cy } = svgToScreen(africaBBox, svg, container);
  const padding = 0.06;
  const scaleByWidth = (containerW * (1 - padding * 2)) / Math.max(bw, 1);
  const scaleByHeight = (containerH * (1 - padding * 2)) / Math.max(bh, 1);
  const scale = Math.min(scaleByWidth, scaleByHeight, 4.5);

  return {
    x: containerW / 2 - cx * scale,
    y: containerH / 2 - cy * scale,
    scale,
  };
}
