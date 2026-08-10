/**
 * HTML location tags for catchment zones on the Africa MapLibre map.
 */

function shortCoords(lat, lon) {
  if (lat == null || lon == null) return "";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns} · ${Math.abs(lon).toFixed(1)}°${ew}`;
}

/** Spread label boxes around the pin — pin stays on the geographic point. */
function labelSpreadOffset(index, total) {
  if (total <= 1) return [0, 0];
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 44 + (index % 3) * 10;
  return [Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius)];
}

export class CatchmentTags {
  constructor(map, { onSelect } = {}) {
    this.map = map;
    this.onSelect = onSelect;
    this.markers = [];
    this.hub = null;
    this.selectedId = null;
  }

  render(hub) {
    if (!this.map || !hub) return;
    this.clear();
    this.hub = hub;

    const catchments = (hub.catchments || []).filter((ct) => ct.lat != null && ct.lng != null);
    const total = catchments.length || 1;

    catchments.forEach((ct, index) => {
      const outer = document.createElement("div");
      outer.className = "tk-marker-anchor";

      const el = document.createElement("button");
      el.type = "button";
      el.className = "tk-catchment-tag tk-catchment-tag--animate";
      el.dataset.catchmentId = ct.id;
      el.style.setProperty("--tk-tag-delay", `${index * 80}ms`);
      const [lx, ly] = labelSpreadOffset(index, total);
      el.style.setProperty("--tk-label-x", `${lx}px`);
      el.style.setProperty("--tk-label-y", `${ly}px`);
      el.setAttribute("aria-label", `${ct.name} catchment area`);

      el.innerHTML = `
        <span class="tk-catchment-tag__ring" aria-hidden="true"></span>
        <span class="tk-catchment-tag__pin" aria-hidden="true"></span>
        <span class="tk-catchment-tag__body">
          <span class="tk-catchment-tag__name">${ct.name}</span>
          <span class="tk-catchment-tag__coords">${shortCoords(ct.lat, ct.lng)}</span>
        </span>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onSelect?.(ct, hub);
      });

      outer.appendChild(el);

      const marker = new maplibregl.Marker({
        element: outer,
        anchor: "center",
        offset: [0, 0],
        subpixelPositioning: false,
      })
        .setLngLat([ct.lng, ct.lat])
        .addTo(this.map);

      this.markers.push({ id: ct.id, marker, el });
    });

    this.highlight(this.selectedId);
  }

  highlight(catchmentId) {
    this.selectedId = catchmentId || null;
    this.markers.forEach(({ id, el }) => {
      const isSelected = id === catchmentId;
      const isDimmed = catchmentId && id !== catchmentId;
      el.classList.toggle("is-selected", isSelected);
      el.classList.toggle("is-dimmed", isDimmed);
      el.style.zIndex = isSelected ? "12" : isDimmed ? "4" : "8";
    });
  }

  clear() {
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = [];
    this.hub = null;
  }

  destroy() {
    this.clear();
    this.map = null;
    this.onSelect = null;
  }
}
