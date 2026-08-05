import { formatNumber } from "../../utils/format.js";

export function renderCountryKPIGrid(kpis) {
  const cards = (kpis || [])
    .map((k) => {
      const display =
        k.text ||
        (typeof k.value === "number"
          ? k.value >= 1000
            ? formatNumber(k.value)
            : `${k.prefix || ""}${k.value}${k.suffix || ""}`
          : k.value);
      const trendClass = k.direction || "neutral";
      const trendHtml = k.trend
        ? `<span class="ch-kpi__trend ch-kpi__trend--${trendClass}">${k.trend}</span>`
        : "";

      return `<article class="ch-kpi" data-kpi data-value="${typeof k.value === "number" ? k.value : 0}" data-prefix="${k.prefix || ""}" data-suffix="${k.suffix || ""}" data-text="${k.text || ""}">
        <span class="ch-kpi__value">${k.text ? k.text : "—"}</span>
        <span class="ch-kpi__label">${k.label}</span>
        ${trendHtml}
      </article>`;
    })
    .join("");

  return `
    <section class="ch-kpi-section" aria-label="Key metrics">
      <div class="ch-kpi-grid">${cards}</div>
    </section>`;
}
