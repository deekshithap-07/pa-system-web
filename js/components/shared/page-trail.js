/**
 * Same "on this page" path for every place page (country, community):
 * At a glance → Where → What PA does → Progress → Stories → Knowledge → Get involved.
 * Each page supplies the selector of its own section for each step.
 */

export const PLACE_TRAIL = [
  { id: "glance", label: "At a glance" },
  { id: "where", label: "Where" },
  { id: "work", label: "What PA does" },
  { id: "progress", label: "Progress" },
  { id: "stories", label: "Stories" },
  { id: "knowledge", label: "Knowledge" },
  { id: "next", label: "Get involved" },
];

let trailObserver = null;

export function renderPageTrail(targets = {}, label = "On this page") {
  const links = PLACE_TRAIL.filter((s) => targets[s.id])
    .map(
      (s, i) =>
        `<button type="button" class="pa-trail__link" data-trail-target="${targets[s.id].replace(/"/g, "&quot;")}" data-trail-id="${s.id}" style="--i:${i}">
          <span class="pa-trail__n" aria-hidden="true">${i + 1}</span>${s.label}
        </button>`
    )
    .join("");
  return `<nav class="pa-trail" aria-label="${label}" data-page-trail>
      <div class="container pa-trail__inner">${links}</div>
    </nav>`;
}

export function bindPageTrail(root = document) {
  const nav = root.querySelector("[data-page-trail]");
  if (!nav) return;
  trailObserver?.disconnect();

  const links = [...nav.querySelectorAll("[data-trail-target]")];
  const pairs = links
    .map((a) => ({ a, el: root.querySelector(a.dataset.trailTarget) }))
    .filter((p) => {
      if (!p.el) p.a.remove();
      return Boolean(p.el);
    });

  const headerH = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;

  pairs.forEach(({ a, el }) =>
    a.addEventListener("click", () => {
      const top = el.getBoundingClientRect().top + window.scrollY - headerH() - nav.offsetHeight - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    })
  );

  if (!("IntersectionObserver" in window)) return;
  trailObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const hit = pairs.find((p) => p.el === e.target);
        links.forEach((l) => l.classList.toggle("is-active", l === hit?.a));
        const inner = nav.querySelector(".pa-trail__inner");
        if (hit && inner && inner.scrollWidth > inner.clientWidth) {
          inner.scrollTo({ left: hit.a.offsetLeft - inner.clientWidth / 2 + hit.a.offsetWidth / 2, behavior: "smooth" });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  pairs.forEach((p) => trailObserver.observe(p.el));
}

export function destroyPageTrail() {
  trailObserver?.disconnect();
  trailObserver = null;
}
