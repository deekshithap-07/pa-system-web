import { renderCountryReports } from "./CountryReports.js";
import { renderCountryActivityFeed } from "./CountryActivityFeed.js";

export function renderCountryReportsAndUpdates(reports, activities) {
  const reportsHtml = renderCountryReports(reports)
    .replace(/<section[^>]*id="ch-reports"[^>]*>/, "")
    .replace(/<div class="ch-section__head">[\s\S]*?<\/div>/, "")
    .replace(/<\/section>\s*$/, "");

  const activityHtml = renderCountryActivityFeed(activities)
    .replace(/<section[^>]*id="ch-activity"[^>]*>/, "")
    .replace(/<div class="ch-section__head">[\s\S]*?<\/div>/, "")
    .replace(/<\/section>\s*$/, "");

  return `
    <section class="ch-section" id="ch-reports" data-reveal-section>
      <div class="ch-section__head">
        <h2>Reports &amp; updates</h2>
        <p class="ch-section__desc">Ministry reports and recent field updates</p>
      </div>
      ${reportsHtml}
      ${activityHtml}
    </section>`;
}
