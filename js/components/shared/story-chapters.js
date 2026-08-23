/**
 * Shared story chrome for inner pages (not the interactive map).
 */

export const JOURNEY_STAGES = [
  { id: "awareness", label: "Awareness", month: "1–3" },
  { id: "engagement", label: "Engagement", month: "4–6" },
  { id: "training", label: "Training", month: "7–12" },
  { id: "implementation", label: "Implementation", month: "13–18" },
  { id: "multiplication", label: "Multiplication", month: "19–24" },
];

export function renderStoryLede({ eyebrow = "", title = "", text = "", next = "" } = {}) {
  return `
    <section class="sx-lede" data-story-reveal>
      ${eyebrow ? `<p class="sx-lede__eyebrow">${eyebrow}</p>` : ""}
      ${title ? `<h2 class="sx-lede__title">${title}</h2>` : ""}
      ${text ? `<p class="sx-lede__text">${text}</p>` : ""}
      ${next ? `<p class="sx-lede__next">${next}</p>` : ""}
    </section>`;
}

export function renderJourneyTrack(current = "") {
  const needle = String(current || "").toLowerCase();
  const steps = JOURNEY_STAGES.map((s, i) => {
    const active = needle.includes(s.label.toLowerCase()) || needle.includes(s.id);
    return `<li class="sx-journey__step${active ? " is-active" : ""}" style="--i:${i}">
      <span class="sx-journey__num">${String(i + 1).padStart(2, "0")}</span>
      <strong>${s.label}</strong>
      <em>Month ${s.month}</em>
    </li>`;
  }).join("");

  return `
    <ol class="sx-journey" aria-label="Two-year transformation journey">
      ${steps}
    </ol>`;
}

/** Bloomberg / World Bank geography rail — where this page sits in the organisation. */
export function renderZoomPath({ country, catchment, community, countryHref, catchmentHref } = {}) {
  const steps = [
    { label: "Where we work", href: "#/africa", here: !country },
    country ? { label: country, href: countryHref || "#/africa", here: country && !catchment } : null,
    catchment ? { label: catchment, href: catchmentHref || countryHref, here: catchment && !community } : null,
    community ? { label: community, href: null, here: true } : null,
  ].filter(Boolean);

  return `
    <nav class="sx-zoom" aria-label="Where you are in the organisation">
      <p class="sx-zoom__label">The organisation, one zoom at a time</p>
      <ol>
        ${steps
          .map(
            (s) => `<li class="${s.here ? "is-here" : ""}">${
              s.href && !s.here ? `<a href="${s.href}" data-link>${s.label}</a>` : `<span>${s.label}</span>`
            }</li>`
          )
          .join("")}
      </ol>
    </nav>`;
}

export function renderStoryEssay({ kicker = "", title = "", text = "", pull = "" } = {}) {
  if (!title && !text) return "";
  return `
    <section class="sx-essay" data-story-reveal>
      <div class="container sx-essay__inner">
        <div class="sx-essay__copy">
          ${kicker ? `<p class="sx-essay__kicker">${kicker}</p>` : ""}
          ${title ? `<h2>${title}</h2>` : ""}
          ${text ? `<p>${text}</p>` : ""}
        </div>
        ${pull ? `<blockquote class="sx-essay__pull">${pull}</blockquote>` : ""}
      </div>
    </section>`;
}

export function bindStoryReveals(root) {
  if (!root || typeof gsap === "undefined") return;
  const nodes = root.querySelectorAll("[data-story-reveal]");
  if (!nodes.length) return;

  if (typeof ScrollTrigger === "undefined") {
    gsap.from(nodes, { opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: "power2.out" });
    return;
  }

  nodes.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }),
    });
  });
}
