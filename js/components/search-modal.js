/**
 * Site search — modal overlay (no separate page).
 * One index across countries, communities, programs (+ PPPs), stories and Knowledge Hub resources,
 * filtered by type, country and program.
 */

import { PA_PROGRAMMES } from "./shared/pa-programmes.js";
import { PA_PPPS, programmeIdFor } from "./shared/pa-model.js";

let modalEl = null;
let dataRef = null;
let indexCache = null;
const state = { q: "", type: "all", country: "all", program: "all" };

const TYPES = [
  { id: "all", label: "All" },
  { id: "country", label: "Countries" },
  { id: "community", label: "Communities" },
  { id: "program", label: "Programs" },
  { id: "story", label: "Stories" },
  { id: "resource", label: "Resources" },
];
const TYPE_LABEL = { country: "Country", community: "Community", program: "Program", story: "Story", resource: "Resource" };

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function buildIndex(data) {
  const countries = (data.countries?.countries || []).filter((c) => c.isPaNetwork);
  const countryById = Object.fromEntries((data.countries?.countries || []).map((c) => [c.id, c]));
  const catchments = data.catchments?.catchments || [];
  const catchmentById = Object.fromEntries(catchments.map((c) => [c.id, c]));
  const items = [];

  countries.forEach((c) =>
    items.push({
      type: "country",
      title: c.name,
      sub: `${c.summary?.communities || c.communities || 0} communities`,
      href: `#/country/${c.slug}`,
      countryId: c.id,
      programId: null,
    })
  );

  (data.communities?.communities || []).forEach((cm) => {
    const ct = catchmentById[cm.catchmentId];
    const country = ct ? countryById[ct.countryId] : null;
    if (!ct || !country) return;
    items.push({
      type: "community",
      title: cm.name,
      sub: `${ct.name} · ${country.name}`,
      href: `#/community/${country.slug}/${ct.slug}/${cm.slug}`,
      countryId: country.id,
      programId: null,
    });
  });

  PA_PROGRAMMES.forEach((p) => {
    items.push({ type: "program", title: p.title, sub: p.text, href: `#/program/${p.id}`, countryId: null, programId: p.id });
    (PA_PPPS[p.id] || []).forEach((x) =>
      items.push({
        type: "program",
        title: x.name,
        sub: `PPP · ${p.title}`,
        extra: x.detail || "",
        href: `#/program/${p.id}`,
        countryId: null,
        programId: p.id,
      })
    );
  });

  (data.stories?.stories || []).forEach((s) => {
    const country = countryById[s.countryId];
    items.push({
      type: "story",
      title: s.title,
      sub: [s.program, country?.name].filter(Boolean).join(" · "),
      extra: s.excerpt || "",
      href: `#/story/${s.slug}`,
      countryId: s.countryId || null,
      programId: programmeIdFor(s.program),
    });
  });

  const kh = data.knowledgeHub || {};
  const resources = [
    ...Object.values(kh.items || {}).flat(),
    ...(kh.caseStudies || []).map((cs) => ({ ...cs, href: cs.storySlug ? `#/story/${cs.storySlug}` : "#/field-reports" })),
  ];
  resources.forEach((r) =>
    items.push({
      type: "resource",
      title: r.title,
      sub: [r.program, r.year].filter(Boolean).join(" · ") || "Knowledge Hub",
      extra: r.summary || "",
      href: r.href || "#/resources",
      external: Boolean(r.external),
      countryId: r.countryId || null,
      programId: r.program ? programmeIdFor(r.program) : null,
    })
  );

  items.forEach((it) => {
    it.text = `${it.title} ${it.sub} ${it.extra || ""}`.toLowerCase();
  });
  return { items, countries };
}

export function initSearchModal(data) {
  dataRef = data;
  indexCache = null;
  if (document.getElementById("search-modal")) {
    modalEl = document.getElementById("search-modal");
    return;
  }

  const countries = (data.countries?.countries || []).filter((c) => c.isPaNetwork);
  modalEl = document.createElement("div");
  modalEl.id = "search-modal";
  modalEl.className = "search-modal";
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.innerHTML = `
    <div class="search-modal__backdrop" data-search-close></div>
    <div class="search-modal__panel" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
      <button type="button" class="search-modal__close" data-search-close aria-label="Close search">&times;</button>
      <p class="eyebrow">Discover</p>
      <h2 id="search-modal-title">Search PA</h2>
      <input type="search" class="search-modal__input" id="search-modal-input" placeholder="Countries, communities, programs, stories, reports…" autocomplete="off">
      <div class="search-modal__types" role="tablist" aria-label="Result type">
        ${TYPES.map(
          (t) => `<button type="button" role="tab" class="search-modal__type${t.id === "all" ? " is-active" : ""}" data-search-type="${t.id}" aria-selected="${t.id === "all"}">${t.label}</button>`
        ).join("")}
      </div>
      <div class="search-modal__filters">
        <label><span class="sr-only">Country</span>
          <select id="search-modal-country">
            <option value="all">All countries</option>
            ${countries.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}
          </select>
        </label>
        <label><span class="sr-only">Program</span>
          <select id="search-modal-program">
            <option value="all">All programs</option>
            ${PA_PROGRAMMES.map((p) => `<option value="${p.id}">${esc(p.title)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="search-modal__results" id="search-modal-results" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(modalEl);

  modalEl.querySelectorAll("[data-search-close]").forEach((el) => {
    el.addEventListener("click", closeSearchModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl?.classList.contains("is-open")) closeSearchModal();
  });

  const input = modalEl.querySelector("#search-modal-input");
  input?.addEventListener("input", () => {
    state.q = input.value;
    renderResults();
  });
  modalEl.querySelectorAll("[data-search-type]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.type = btn.dataset.searchType;
      modalEl.querySelectorAll("[data-search-type]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      renderResults();
    })
  );
  modalEl.querySelector("#search-modal-country")?.addEventListener("change", (e) => {
    state.country = e.target.value;
    renderResults();
  });
  modalEl.querySelector("#search-modal-program")?.addEventListener("change", (e) => {
    state.program = e.target.value;
    renderResults();
  });
  modalEl.querySelector("#search-modal-results")?.addEventListener("click", (e) => {
    if (e.target.closest("a[data-link]")) closeSearchModal();
  });
}

export function openSearchModal() {
  if (!modalEl) return;
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-modal-open");
  const input = modalEl.querySelector("#search-modal-input");
  input.value = "";
  state.q = "";
  renderResults();
  requestAnimationFrame(() => input?.focus());
}

export function closeSearchModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-modal-open");
}

function renderItem(it, i) {
  const attrs = it.external ? `href="${esc(it.href)}" target="_blank" rel="noopener"` : `href="${esc(it.href)}" data-link`;
  return `<a ${attrs} class="search-modal__item search-modal__item--${it.type}" style="--i:${i}">
      <span class="search-modal__item-type">${TYPE_LABEL[it.type]}</span>
      <strong>${esc(it.title)}</strong>
      <span>${esc(it.sub)}</span>
    </a>`;
}

function renderResults() {
  const root = modalEl?.querySelector("#search-modal-results");
  if (!root || !dataRef) return;
  if (!indexCache) indexCache = buildIndex(dataRef);

  const q = state.q.trim().toLowerCase();
  const filtering = q || state.type !== "all" || state.country !== "all" || state.program !== "all";

  if (!filtering) {
    root.innerHTML = `
      <p class="search-modal__label">Explore PA your way</p>
      <div class="search-modal__quick">
        <a href="#/africa" data-link>By country</a>
        <a href="#/work#work-projects" data-link>By program</a>
        <a href="#/scorecard" data-link>By impact</a>
        <a href="#/stories" data-link>By story</a>
        <a href="#/resources" data-link>By knowledge</a>
        <a href="#/about" data-link>Who we are</a>
      </div>`;
    return;
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const hits = indexCache.items.filter(
    (it) =>
      (state.type === "all" || it.type === state.type) &&
      (state.country === "all" || it.countryId === state.country) &&
      (state.program === "all" || it.programId === state.program) &&
      terms.every((t) => it.text.includes(t))
  );

  if (!hits.length) {
    root.innerHTML = `<p class="search-modal__empty">No matches${q ? ` for “${esc(state.q.trim())}”` : ""}. Try another word or clear a filter.</p>`;
    return;
  }

  const groups = TYPES.filter((t) => t.id !== "all")
    .map((t) => ({ t, list: hits.filter((h) => h.type === t.id) }))
    .filter((g) => g.list.length);
  const perGroup = state.type === "all" ? 5 : 30;
  let n = 0;
  root.innerHTML =
    `<p class="search-modal__count">${hits.length} result${hits.length === 1 ? "" : "s"}</p>` +
    groups
      .map(
        (g) =>
          `<p class="search-modal__label">${g.t.label} <em>${g.list.length}</em></p>${g.list
            .slice(0, perGroup)
            .map((it) => renderItem(it, n++))
            .join("")}`
      )
      .join("");
}
