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


