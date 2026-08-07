/**
 * Ministry model page sections — reflects PA's operational structure (Sections 8–11).
 */

export function renderAboutPage(model) {
  if (!model) return `<div class="static-page container"><h1>About</h1><p>Content unavailable.</p></div>`;

  return `
    <div class="about-page" data-about-page>
      ${renderHierarchy(model.hierarchy)}
      ${renderPillars(model.pillars)}
      ${renderJourney(model.journey)}
      ${renderTripleA(model.tripleA)}
      ${renderAboutExplore()}

      <section class="about-cta">
        <div class="container">
          <p>This platform is aligned with real ministry operations — not just visual storytelling.</p>
          <a href="https://www.possibilitiesafrica.org/" target="_blank" rel="noopener">Visit the main PA website &rarr;</a>
        </div>
      </section>
    </div>`;
}

function renderAboutExplore() {
  return `
    <section class="about-explore" id="about-explore">
      <div class="container">
        <p class="eyebrow">See it in action</p>
        <h2>Explore the model on the ground</h2>
        <p class="about-section__desc">You've seen how PA works. These entry points show transformation with real stories and data.</p>
        <div class="about-explore__grid">
          <a href="#/africa" class="about-explore__card" data-link>
            <strong>Africa map</strong>
            <span>Drill from continent to community with live metrics at each level.</span>
          </a>
          <a href="#/country/kenya" class="about-explore__card" data-link>
            <strong>Kenya country hub</strong>
            <span>Example country page — stories, KPIs, catchment map, and reports.</span>
          </a>
          <a href="#/resources#res-case-studies" class="about-explore__card" data-link>
            <strong>Case studies</strong>
            <span>Documented outcomes that explain what the numbers mean.</span>
          </a>
          <a href="#/scorecard" class="about-explore__card" data-link>
            <strong>Network scorecard</strong>
            <span>Rankings and journey progress across all countries.</span>
          </a>
        </div>
      </div>
    </section>`;
}

function renderHierarchy(h) {
  const levelLinks = ["#/africa", "#/country/kenya", "#/catchment/kenya/kajiado", "#/community/kenya/kajiado/koitiko"];
  return `
    <section class="about-section" id="about-hierarchy">
      <div class="container">
        <h2>${h.title}</h2>
        <p class="about-section__desc">${h.description}</p>
        <div class="hierarchy-flow">
          ${h.levels
            .map(
              (l, i) => `<div class="hierarchy-step">
                ${i > 0 ? '<span class="hierarchy-step__arrow" aria-hidden="true">→</span>' : ""}
                <a href="${levelLinks[i] || "#/africa"}" class="hierarchy-step__card hierarchy-step__card--link" data-link>
                  <strong>${l.label}</strong>
                  <p>${l.description}</p>
                  <span class="hierarchy-step__explore">Explore example &rarr;</span>
                </a>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderPillars(pillars) {
  return `
    <section class="about-section about-section--alt" id="about-model">
      <div class="container">
        <h2>How PA's ministry model works</h2>
        <p class="about-section__desc">The platform is designed to reflect how PA actually works on the ground.</p>
        <div class="pillar-grid">${pillars
          .map(
            (p) => `<article class="pillar-card">
              <span class="pillar-card__metric">${p.metric}</span>
              <h3>${p.title}</h3>
              <p>${p.description}</p>
            </article>`
          )
          .join("")}</div>
      </div>
    </section>`;
}

function renderJourney(journey) {
  return `
    <section class="about-section" id="about-journey">
      <div class="container">
        <h2>${journey.title}</h2>
        <p class="about-section__desc">Every community progresses through a structured ${journey.duration} journey — tracked in the community tracking system.</p>
        <div class="journey-timeline">${journey.stages
          .map(
            (s, i) => `<div class="journey-stage" style="--stage-index:${i}">
              <div class="journey-stage__dot"></div>
              <div class="journey-stage__content">
                <span class="journey-stage__month">Month ${s.month}</span>
                <strong>${s.label}</strong>
                <p>${s.description}</p>
              </div>
            </div>`
          )
          .join("")}</div>
      </div>
    </section>`;
}

function renderTripleA(tripleA) {
  return `
    <section class="about-section about-section--alt" id="about-triple-a">
      <div class="container">
        <h2>${tripleA.title}</h2>
        <p class="about-section__desc">${tripleA.description}</p>
        <div class="triple-a-grid">${tripleA.dimensions
          .map(
            (d) => `<div class="triple-a-card">
              <span class="triple-a-card__letter">${d.label.charAt(0)}</span>
              <h3>${d.label}</h3>
              <p>${d.description}</p>
            </div>`
          )
          .join("")}</div>
      </div>
    </section>`;
}
