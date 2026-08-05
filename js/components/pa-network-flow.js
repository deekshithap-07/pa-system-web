/**
 * PA hierarchy — horizontal flowing flowchart
 * PA → Country → Catchment → Community (Households + Pastors)
 */

const FLOW = [
  { type: "root", icon: "PA", label: "Possibilities Africa", desc: "Continental coordination" },
  { type: "country", icon: "CO", label: "Country", desc: "National programme" },
  { type: "catchment", icon: "CT", label: "Catchment area", desc: "Regional zone" },
  { type: "community", icon: "CM", label: "Community", desc: "Local unit", tags: ["Households", "Pastors"] },
];

function renderCard(node, index) {
  const tags =
    node.tags
      ?.map(
        (t) =>
          `<span class="pa-flow__tag pa-flow__tag--${t === "Households" ? "hh" : "ps"}">${t}</span>`
      )
      .join("") || "";

  return `
    <article class="pa-flow__card pa-flow__card--${node.type}" data-flow-card data-flow-type="${node.type}" data-flow-index="${index}">
      <span class="pa-flow__card-glow" aria-hidden="true"></span>
      <span class="pa-flow__card-icon" aria-hidden="true">${node.icon}</span>
      <p class="pa-flow__card-label">${node.label}</p>
      <p class="pa-flow__card-desc">${node.desc}</p>
      ${tags ? `<div class="pa-flow__card-tags">${tags}</div>` : ""}
    </article>`;
}

function renderConnector(index) {
  return `
    <div class="pa-flow__connector" data-flow-connector data-flow-index="${index}" aria-hidden="true">
      <span class="pa-flow__connector-track"></span>
      <span class="pa-flow__connector-progress"></span>
      <span class="pa-flow__pulse"></span>
    </div>`;
}

export function buildNetworkFlowData() {
  return {};
}

export function renderNetworkFlow(section) {
  const parts = FLOW.map((node, i) => {
    const card = renderCard(node, i);
    return i < FLOW.length - 1 ? card + renderConnector(i) : card;
  }).join("");

  return `
    <section class="pa-flow" id="pa-network-flow" aria-labelledby="pa-flow-title">
      <div class="pa-flow__bg" aria-hidden="true">
        <span class="pa-flow__ring pa-flow__ring--1"></span>
        <span class="pa-flow__ring pa-flow__ring--2"></span>
        <span class="pa-flow__ring pa-flow__ring--3"></span>
      </div>
      <div class="container pa-flow__inner">
        <header class="pa-flow__head" data-reveal>
          <p class="eyebrow">${section.eyebrow || "How we work"}</p>
          <h2 id="pa-flow-title">${section.title}</h2>
          <p class="pa-flow__desc">${section.description}</p>
        </header>

        <div class="pa-flow__canvas" data-flow-diagram>
          <div class="pa-flow__row" data-flow-row>${parts}</div>
          <p class="pa-flow__legend" data-reveal>
            One country contains catchment areas → each catchment contains communities →
            each community reaches <strong>households</strong> through <strong>pastors</strong>
          </p>
        </div>

        <div class="pa-flow__footer" data-reveal>
          <a href="${section.cta?.target || "#/africa"}" class="pa-flow__cta" data-link>
            <span>${section.cta?.label || "Explore the Africa map"}</span>
            <span class="pa-flow__cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>`;
}
