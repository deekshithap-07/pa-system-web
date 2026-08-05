export function renderCatchmentReports(reports) {
  if (!reports?.length) {
    return `
      <section class="ch-section" id="cth-reports" data-reveal-section>
        <div class="ch-section__head"><h2>Catchment Reports</h2></div>
        <p class="ch-empty">No reports available for this catchment.</p>
      </section>`;
  }

  const cards = reports
    .map((r) => {
      const year = r.period?.slice(0, 4) || "—";
      const category = r.type === "annual" ? "Annual" : "Monthly";
      return `<article class="ch-report-card" data-reveal-section>
        <div class="ch-report-card__meta">
          <span class="ch-report-card__year">${year}</span>
          <span class="ch-report-card__category">${category}</span>
        </div>
        <h3>${r.title}</h3>
        <p>${r.summary}</p>
        <a href="${r.downloadUrl}" class="ch-report-card__download">Download PDF</a>
      </article>`;
    })
    .join("");

  return `
    <section class="ch-section" id="cth-reports">
      <div class="ch-section__head">
        <h2>Catchment Reports</h2>
        <p class="ch-section__desc">Ministry reports and publications for this catchment</p>
      </div>
      <div class="ch-report-grid">${cards}</div>
    </section>`;
}
