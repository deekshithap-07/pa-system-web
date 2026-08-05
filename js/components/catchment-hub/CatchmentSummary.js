export function renderCatchmentSummary(overview, kpis) {
  const kpiHtml = (kpis || [])
    .map((k) => {
      const trendClass = k.direction || "neutral";
      const trendHtml = k.trend ? `<span class="ch-kpi__trend ch-kpi__trend--${trendClass}">${k.trend}</span>` : "";
      return `<article class="ch-kpi" data-kpi data-value="${typeof k.value === "number" ? k.value : 0}" data-text="${k.text || ""}">
        <span class="ch-kpi__value">${k.text ? k.text : "—"}</span>
        <span class="ch-kpi__label">${k.label}</span>
        ${trendHtml}
      </article>`;
    })
    .join("");

  return `
    <section class="ch-section cth-summary-section" id="cth-summary" data-reveal-section>
      <div class="ch-section__head">
        <h2>Catchment Summary</h2>
        <p class="ch-section__desc">The ministry model at catchment level</p>
      </div>
      <div class="ch-summary"><p>${overview}</p></div>
      <div class="cth-kpi-wrap">
        <div class="ch-kpi-grid">${kpiHtml}</div>
      </div>
    </section>`;
}
