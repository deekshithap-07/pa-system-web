/**
 * Scorecard-style full-screen entry curtain for page transitions.
 */

export function renderPageEntry({ eyebrow = "Possibilities Africa", title, subtitle = "" }) {
  return `
    <div class="pa-entry" data-page-entry aria-hidden="true">
      <div class="pa-entry__mesh" aria-hidden="true"></div>
      <div class="pa-entry__inner">
        <p class="pa-entry__eyebrow">${eyebrow}</p>
        <h1 class="pa-entry__title">${title}</h1>
        ${subtitle ? `<p class="pa-entry__sub">${subtitle}</p>` : ""}
      </div>
    </div>`;
}

export function wrapPageContent(html, config) {
  return `
    <div class="page-shell" data-page-root>
      ${renderPageEntry(config)}
      <div data-page-entry-content>${html}</div>
    </div>`;
}

export function cleanupPageEntry() {
  document.body.classList.remove("pa-entry-active");
  document.querySelector("[data-page-entry]")?.remove();
}

export function playPageEntry(root, onComplete) {
  if (!root) {
    onComplete?.();
    return;
  }

  const entry = root.querySelector("[data-page-entry]");
  const content = root.querySelector("[data-page-entry-content]");

  const finish = () => {
    document.body.classList.remove("pa-entry-active");
    entry?.remove();
    onComplete?.();
    window.dispatchEvent(new Event("page-entry-complete"));
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  };

  if (!entry) {
    onComplete?.();
    return;
  }

  if (typeof gsap === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }

  const entryInner = entry.querySelector(".pa-entry__inner");
  document.body.classList.add("pa-entry-active");

  gsap.set(entry, { opacity: 1, visibility: "visible" });
  if (entryInner) gsap.set(entryInner, { opacity: 0, y: 18, scale: 0.98 });
  if (content) gsap.set(content, { opacity: 0, y: 12 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: finish,
  });

  if (entryInner) {
    tl.to(entryInner, { opacity: 1, y: 0, scale: 1, duration: 0.55 })
      .to({}, { duration: 0.45 })
      .to(
        entry,
        {
          yPercent: -100,
          duration: 0.75,
          ease: "power3.inOut",
        },
        "<"
      )
      .set(entry, { pointerEvents: "none" }, "<");
  }

  if (content) {
    tl.to(
      content,
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        onStart: () => document.body.classList.remove("pa-entry-active"),
      },
      entryInner ? "-=0.35" : 0
    );
  }
}
