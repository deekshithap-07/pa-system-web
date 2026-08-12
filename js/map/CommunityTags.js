/**
 * HTML location tags for communities on the Africa MapLibre map.
 */
import { communityPinColor } from "./africa-map-surface.js";

const PIN_PALETTE = [
  "#D6B352",
  "#E8C96A",
  "#F0D878",
  "#C99C37",
  "#8A6820",
  "#6BCB77",
  "#9B8AFB",
  "#F4A442",
];

function pinColorForCommunity(com, index) {
  const statusColor = communityPinColor(com);
  if (statusColor !== "#C99C37") return statusColor;
  return PIN_PALETTE[index % PIN_PALETTE.length];
}

/** Spread label boxes around the pin — pin stays on the geographic point. */
function labelSpreadOffset(index, total, tightCluster) {
  if (total <= 1) return [0, 0];
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const base = tightCluster ? 40 : 28;
  const radius = base + (index % 3) * (tightCluster ? 10 : 6);
  return [Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius)];
}

export class CommunityTags {
  constructor(map, { onSelect } = {}) {
    this.map = map;
    this.onSelect = onSelect;
    this.markers = [];
    this.selectedId = null;
  }

  render(ct, country) {
    if (!this.map || !ct || !country) return;
    this.clear();

    const communities = (ct.communities || []).filter((c) => c.lat != null && c.lng != null);
    const latSpread =
      communities.length > 1
        ? Math.max(...communities.map((c) => c.lat)) - Math.min(...communities.map((c) => c.lat))
        : 0;
    const lngSpread =
      communities.length > 1
        ? Math.max(...communities.map((c) => c.lng)) - Math.min(...communities.map((c) => c.lng))
        : 0;
    const tightCluster = latSpread < 0.18 && lngSpread < 0.22;

    communities.forEach((com, index) => {
      const pinColor = pinColorForCommunity(com, index);
      const outer = document.createElement("div");
      outer.className = "tk-marker-anchor";

      const el = document.createElement("button");
      el.type = "button";
      el.className = "tk-community-tag tk-community-tag--animate";
      el.dataset.communityId = com.id;
      el.style.setProperty("--tk-tag-delay", `${index * 55}ms`);
      el.style.setProperty("--tk-pin-color", pinColor);
      const [lx, ly] = labelSpreadOffset(index, communities.length, tightCluster);
      el.style.setProperty("--tk-label-x", `${lx}px`);
      el.style.setProperty("--tk-label-y", `${ly}px`);
      el.setAttribute("aria-label", `${com.name} community`);

      el.innerHTML = `
        <span class="tk-community-tag__pin" aria-hidden="true"></span>
        <span class="tk-community-tag__body">
          <span class="tk-community-tag__name">${com.name}</span>
        </span>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onSelect?.(com, ct, country);
      });

      outer.appendChild(el);

      const marker = new maplibregl.Marker({
        element: outer,
        anchor: "center",
        offset: [0, 0],
        subpixelPositioning: false,
      })
        .setLngLat([com.lng, com.lat])
        .addTo(this.map);

      this.markers.push({ id: com.id, marker, el });
    });

    this.highlight(this.selectedId);
  }

  highlight(communityId) {
    this.selectedId = communityId || null;
    this.markers.forEach(({ id, el }) => {
      const isSelected = id === communityId;
      const isDimmed = communityId && id !== communityId;
      el.classList.toggle("is-selected", isSelected);
      el.classList.toggle("is-dimmed", isDimmed);
    });
  }

  clear() {
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = [];
  }

  destroy() {
    this.clear();
    this.map = null;
    this.onSelect = null;
  }
}
