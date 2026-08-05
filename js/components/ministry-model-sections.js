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

      <section class="about-cta">
        <div class="container">
          <p>This platform is aligned with real ministry operations — not just visual storytelling.</p>
          <a href="https://www.possibilitiesafrica.org/" target="_blank" rel="noopener">Visit the main PA website &rarr;</a>
        </div>
      </section>
    </div>`;
}

function renderHierarchy(h) {
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
                <div class="hierarchy-step__card">
                  <strong>${l.label}</strong>
                  <p>${l.description}</p>
                </div>
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
