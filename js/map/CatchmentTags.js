/**
 * HTML location tags for catchment zones on the Terraink MapLibre map.
 */

function shortCoords(lat, lon) {
  if (lat == null || lon == null) return "";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns} · ${Math.abs(lon).toFixed(1)}°${ew}`;
}

function tagOffset(index, total) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 52 + (index % 3) * 16;
  return [Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius - 12)];
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

      const wrap = document.createElement("div");
      wrap.className = "tk-marker-scale";

      const el = document.createElement("button");
      el.type = "button";
      el.className = "tk-catchment-tag tk-catchment-tag--animate";
      el.dataset.catchmentId = ct.id;
      el.style.setProperty("--tk-tag-delay", `${index * 80}ms`);
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

      wrap.appendChild(el);
      outer.appendChild(wrap);

      const [ox, oy] = tagOffset(index, total);
      const marker = new maplibregl.Marker({ element: outer, anchor: "bottom", offset: [ox, oy] })
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
