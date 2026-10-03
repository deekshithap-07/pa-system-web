/**
 * Context for a public figure: what it means, where, when it was updated, its source,
 * and whether it is PA-published or a Sample placeholder awaiting the tracking system.
 */

export function metricStatusTag(sample) {
  return sample
    ? `<span class="pa-sample-tag" title="Sample figure — awaiting PA verification">Sample</span>`
    : `<span class="pa-metric-ctx__verified" title="Published by Possibilities Africa">Published by PA</span>`;
}

export function renderMetricContext({ meaning = "", where = "", updated = "", source = "", sample = false, className = "" } = {}) {
  const facts = [
    where && { k: "Where", v: where },
    updated && { k: "Updated", v: updated },
    { k: "Source", v: source || (sample ? "Awaiting the PA tracking system" : "Possibilities Africa") },
  ].filter(Boolean);
  return `<div class="pa-metric-ctx${className ? ` ${className}` : ""}">
      ${meaning ? `<p class="pa-metric-ctx__meaning">${meaning}</p>` : ""}
      <dl class="pa-metric-ctx__facts">
        ${facts.map((f) => `<div><dt>${f.k}</dt><dd>${f.v}</dd></div>`).join("")}
      </dl>
      ${metricStatusTag(sample)}
    </div>`;
}
