/**
 * charity:water–style metric clusters on the Africa overview (blue palette).
 */
import { formatNumber } from "../../utils/format.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function formatClusterValue(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(value);
}

function clusterRadius(value, min = 14, max = 34) {
  const v = Math.max(1, value);
  const t = Math.min(1, Math.log10(v + 1) / 2.2);
  return min + (max - min) * t;
}

export class MapClusterLayer {
  constructor(svg) {
    this.svg = svg;
    this.layer = null;
  }

  ensureLayer() {
    if (this.layer) return this.layer;
    this.layer = document.createElementNS(SVG_NS, "g");
    this.layer.setAttribute("id", "cluster-layer");
    this.layer.setAttribute("class", "map-cluster-layer");
    const countries = this.svg.querySelector("#countries-layer");
    if (countries?.parentNode) {
      if (countries.nextSibling) {
        countries.parentNode.insertBefore(this.layer, countries.nextSibling);
      } else {
        countries.parentNode.appendChild(this.layer);
      }
    } else {
      this.svg.appendChild(this.layer);
    }
    return this.layer;
  }

  render(countryRegions, drillData, { onClusterClick } = {}) {
    const layer = this.ensureLayer();
    layer.innerHTML = "";

    countryRegions.forEach((region) => {
      const { country } = region;
      if (!country.isPaNetwork) return;

      const hub = drillData.byCountry[country.slug];
      const value = hub?.metrics?.communities ?? country.communities ?? 0;
      if (!value) return;

      let cx;
      let cy;
      try {
        const bb = region.pathEl.getBBox();
        cx = bb.x + bb.width / 2;
        cy = bb.y + bb.height / 2;
      } catch {
        const c = hub?.centroid || [500, 500];
        cx = c[0];
        cy = c[1];
      }

      const r = clusterRadius(value);
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "map-cluster");
      g.setAttribute("data-slug", country.slug);
      g.setAttribute("transform", `translate(${cx},${cy})`);
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");
      g.setAttribute("aria-label", `${country.countryName || country.name}: ${formatNumber(value)} communities`);

      const hit = document.createElementNS(SVG_NS, "circle");
      hit.setAttribute("r", r + 6);
      hit.setAttribute("class", "map-cluster__hit");
      hit.setAttribute("fill", "transparent");

      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("r", r);
      circle.setAttribute("class", "map-cluster__bubble");

      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("class", "map-cluster__label");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = formatClusterValue(value);

      g.appendChild(hit);
      g.appendChild(circle);
      g.appendChild(text);

      const activate = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onClusterClick?.(region);
      };
      g.addEventListener("pointerup", (e) => {
        if (e.button !== 0) return;
        activate(e);
      });
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });

      layer.appendChild(g);
    });
  }

  setVisible(visible) {
    if (!this.layer) return;
    this.layer.style.opacity = visible ? "1" : "0";
    this.layer.style.pointerEvents = visible ? "auto" : "none";
  }

  animateIn() {
    if (!this.layer || typeof gsap === "undefined") return;
    const items = this.layer.querySelectorAll(".map-cluster");
    gsap.from(items, {
      scale: 0,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "back.out(1.6)",
      transformOrigin: "center center",
    });
  }

  clear() {
    if (this.layer) this.layer.innerHTML = "";
  }
}
