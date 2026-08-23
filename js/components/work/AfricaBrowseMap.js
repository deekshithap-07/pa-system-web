import { buildMapCountries } from "../../utils/data.js";

function countryPaths(data) {
  const mapPaths = data.mapPaths || {};
  return buildMapCountries(data.countries, mapPaths).sort((a, b) => {
    if (a.isPaNetwork === b.isPaNetwork) return a.name.localeCompare(b.name);
    return a.isPaNetwork ? 1 : -1;
  });
}

export function renderAfricaBrowseMap(data, activeSlug = null) {
  const mapPaths = data.mapPaths || {};
  const viewBox = mapPaths.viewBox || "0 0 1000 1000";
  const centroids = mapPaths.centroids || {};
  const countries = countryPaths(data);
  const active = countries.find((c) => c.slug === activeSlug) || countries.find((c) => c.isPaNetwork);

  const paths = countries
    .map((c) => {
      const isActive = c.slug === (active?.slug || "");
      const classes = [
        "wb-ctopics__map-country",
        c.isPaNetwork ? "is-pa" : "",
        isActive ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const centroid = centroids[c.isoCode];
      const label = centroid ? ` data-map-x="${centroid[0]}" data-map-y="${centroid[1]}"` : "";
      return `<path class="${classes}" d="${c.path}" data-map-country="${c.slug}" data-map-pa="${c.isPaNetwork ? "1" : "0"}"${label} aria-hidden="true"></path>`;
    })
    .join("");

  const labelX = active && centroids[active.isoCode] ? centroids[active.isoCode][0] : 500;
  const labelY = active && centroids[active.isoCode] ? centroids[active.isoCode][1] : 500;

  return `
    <div class="wb-ctopics__map" data-ctopic-map aria-hidden="true">
      <div class="wb-ctopics__map-frame">
        <svg class="wb-ctopics__map-svg" viewBox="${viewBox}" role="img" aria-label="Map of Africa">
          <rect class="wb-ctopics__map-ocean" width="1000" height="1000"></rect>
          <g class="wb-ctopics__map-land">${paths}</g>
          <g class="wb-ctopics__map-label" data-map-label transform="translate(${labelX}, ${labelY})">
            <circle class="wb-ctopics__map-pin" r="6"></circle>
            <text class="wb-ctopics__map-name" y="-12">${active?.name || ""}</text>
          </g>
        </svg>
      </div>
      <p class="wb-ctopics__map-caption">
        <span class="wb-ctopics__map-caption-label">Highlighted</span>
        <strong data-map-caption>${active?.name || ""}</strong>
      </p>
    </div>`;
}

export function syncAfricaBrowseMap(section, slug) {
  const map = section.querySelector("[data-ctopic-map]");
  if (!map) return;

  const paths = [...map.querySelectorAll("[data-map-country]")];
  const activePath = paths.find((p) => p.dataset.mapCountry === slug);
  const name = activePath
    ? section.querySelector(`[data-ctopic-panel="${slug}"] .wb-ctopics__name`)?.textContent?.trim() || ""
    : "";

  paths.forEach((p) => {
    p.classList.toggle("is-active", p.dataset.mapCountry === slug);
  });

  const caption = map.querySelector("[data-map-caption]");
  if (caption) caption.textContent = name;

  const label = map.querySelector("[data-map-label]");
  const labelText = map.querySelector(".wb-ctopics__map-name");
  if (labelText) labelText.textContent = name;

  if (label && activePath) {
    const x = Number(activePath.dataset.mapX);
    const y = Number(activePath.dataset.mapY);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      label.setAttribute("transform", `translate(${x}, ${y})`);
    }
  }
}

export function bindAfricaBrowseMap(section) {
  section.querySelectorAll("[data-map-country][data-map-pa='1']").forEach((pathEl) => {
    pathEl.style.cursor = "pointer";
    pathEl.addEventListener("click", () => {
      const slug = pathEl.dataset.mapCountry;
      if (slug) window.location.hash = `#/country/${slug}`;
    });
  });
}
