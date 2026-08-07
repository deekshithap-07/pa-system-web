import { formatNumber } from "../utils/format.js";
import { renderDashboardCharts, destroyCharts } from "../components/charts.js";
import {
  renderScorecardSidebar,
  bindScorecardSidebar,
  destroyScorecardSidebar,
  renderScorecardHeader,
  renderScorecardKPIs,
  renderScorecardCountryStats,
  renderScorecardProgress,
  renderScorecardReports,
} from "../components/scorecard/scorecard-sections.js";

/** Scorecard = network snapshot, rankings & journey status (not deep analysis). */
export function renderScorecard(data) {
  const sc = data.scorecard;
  if (!sc) return `<div class="container static-page"><h1>Scorecard data unavailable</h1></div>`;

  return `
    <div class="sc-page" data-scorecard>
      ${renderScorecardSidebar()}
      <main class="sc-main">
        ${renderScorecardHeader(sc.meta, sc.overview)}
        <p class="sc-page__intro">Executive snapshot of network performance — rankings and journey progress. For comparisons and indices, use <a href="#/insights" data-link>Insights</a>.</p>
        ${renderScorecardKPIs(sc.kpis)}
        ${renderScorecardCountryStats(sc.countryStats)}
        ${renderScorecardProgress(sc.progressIndicators)}
        ${renderScorecardReports(sc.reports)}
      </main>
    </div>`;
}

export function mountScorecard(root, data) {
  const page = root.querySelector("[data-scorecard]");
  if (!page) return;

  bindScorecardSidebar(page);
  initScorecardAnimations(page);

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function destroyScorecard(root) {
  const page = root.querySelector("[data-scorecard]");
  if (page) {
    destroyScorecardSidebar(page);
    teardownScorecard(page);
  }
  destroyCharts();
}

function initScorecardAnimations(root) {
  const triggers = [];

  gsap.from(root.querySelectorAll(".sc-hero__inner > *"), {
    opacity: 0,
    y: 18,
    duration: 0.5,
    stagger: 0.06,
    ease: "power3.out",
  });

  root.querySelectorAll("[data-kpi]").forEach((el) => {
    const text = el.dataset.text;
    const valueEl = el.querySelector(".sc-index__value") || el.querySelector(".sc-kpi__value");
    if (!valueEl) return;
    if (text) {
      valueEl.textContent = text;
      return;
    }
    const value = parseFloat(el.dataset.value);
    const obj = { val: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            valueEl.textContent = value >= 1000 ? formatNumber(Math.round(obj.val)) : Math.round(obj.val);
          },
        });
      },
    });
    triggers.push(st);
  });

  root.querySelectorAll("[data-reveal-section]").forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.from(el, { opacity: 0, y: 20, duration: 0.55, ease: "power2.out" }),
    });
    triggers.push(st);
  });

  root._scTriggers = triggers;
}

function teardownScorecard(root) {
  root._scTriggers?.forEach((t) => t.kill());
  root._scTriggers = [];
}
