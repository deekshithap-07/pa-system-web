/**
 * Five programs → their three official PPPs, plus how activities and CHIPs fit.
 * Shared by Home (How PA works) and What We Do (PPPs & CHIPs) so both always match.
 * Styling expects a dark band (white text); see .pa-pppx in home-design.css.
 */

import { ACTIVITY_TYPES, PPP_EXAMPLES, CHIP_EXAMPLES, PA_PPPS } from "./pa-model.js";
import { PA_PROGRAMMES } from "./pa-programmes.js";

export function renderPppExplorer({ id = "pppx", reveal = 'data-reveal data-anim="fade-up"' } = {}) {
  const tabs = PA_PROGRAMMES.map(
    (p, i) => `<button type="button" role="tab" class="pa-pppx__tab${i === 0 ? " is-active" : ""}" id="${id}-tab-${p.id}" aria-controls="${id}-panel-${p.id}" aria-selected="${i === 0}" data-pa-pppx-tab="${p.id}">
        <span>${String(i + 1).padStart(2, "0")}</span>${p.title}
      </button>`
  ).join("");

  const panels = PA_PROGRAMMES.map(
    (p, i) => `<div class="pa-pppx__panel" role="tabpanel" id="${id}-panel-${p.id}" aria-labelledby="${id}-tab-${p.id}" data-pa-pppx-panel="${p.id}"${i === 0 ? "" : " hidden"}>
        <p class="pa-pppx__kicker">Program ${String(i + 1).padStart(2, "0")} · its three PPPs</p>
        <h3>${p.title}</h3>
        <p class="pa-pppx__text">${p.text || ""}</p>
        <ol class="pa-pppx__list">
          ${(PA_PPPS[p.id] || [])
            .map(
              (x) => `<li${x.id === "chips" ? ' class="is-chip"' : ""}><strong>${x.name}</strong>${
                x.detail ? `<small>${x.detail}</small>` : ""
              }${x.id === "chips" ? `<small>${CHIP_EXAMPLES.join(" · ")}</small>` : ""}</li>`
            )
            .join("")}
        </ol>
        <a class="pa-pppx__link" href="#/program/${p.id}" data-link>Open the program <span aria-hidden="true">→</span></a>
      </div>`
  ).join("");

  const example = PPP_EXAMPLES[1] || PPP_EXAMPLES[0];

  return `
    <div class="pa-pppx" data-pa-pppx ${reveal}>
      <div class="pa-pppx__tabs" role="tablist" aria-label="The five programs">${tabs}</div>
      <div class="pa-pppx__panels">${panels}</div>
    </div>
    <dl class="pa-pppx__defs" ${reveal}>
      <div>
        <dt>Every activity has a home</dt>
        <dd>Program → PPP → activity type → activity. ${
          example ? `For example: ${example.programme} → ${example.ppp} → ${example.type} → ${example.activity}.` : ""
        }</dd>
      </div>
      <div>
        <dt>Five activity types</dt>
        <dd>${ACTIVITY_TYPES.map((t) => t.label).join(" · ")}</dd>
      </div>
      <div>
        <dt>CHIPs</dt>
        <dd>Community High Impact Projects — a PPP of Economic Productivity, owned by the whole community: ${CHIP_EXAMPLES.join(", ").toLowerCase()}.</dd>
      </div>
    </dl>`;
}

export function bindPppExplorer(root = document) {
  root.querySelectorAll?.("[data-pa-pppx]").forEach((wrap) => {
    if (wrap.dataset.bound) return;
    wrap.dataset.bound = "true";
    const tabs = [...wrap.querySelectorAll("[data-pa-pppx-tab]")];
    const panels = [...wrap.querySelectorAll("[data-pa-pppx-panel]")];

    const show = (id, focus = false) => {
      tabs.forEach((t) => {
        const on = t.dataset.paPppxTab === id;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach((p) => {
        p.hidden = p.dataset.paPppxPanel !== id;
      });
    };

    tabs.forEach((t, i) => {
      t.tabIndex = i === 0 ? 0 : -1;
      t.addEventListener("click", () => show(t.dataset.paPppxTab));
      t.addEventListener("keydown", (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        show(next.dataset.paPppxTab, true);
      });
    });
  });
}
