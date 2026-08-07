/**
 * Scorecard-style full-screen entry curtain for page transitions.
 */

export const PAGE_ENTRY_TIMING = {
  textIn: 0.65,
  hold: 1.5,
  slideOut: 0.9,
  contentReveal: 0.6,
  contentOverlap: -0.35,
  skipFade: 0.25,
};

export function renderPageEntry({ eyebrow = "Possibilities Africa", title, subtitle = "", titleVariant = "" }) {
  const titleClass = titleVariant === "tagline" ? " pa-entry__title--tagline" : "";

  return `
    <div class="pa-entry pa-entry--skippable" data-page-entry aria-hidden="true">
      <div class="pa-entry__mesh" aria-hidden="true"></div>
      <div class="pa-entry__inner">
        <p class="pa-entry__eyebrow">${eyebrow}</p>
        <h1 class="pa-entry__title${titleClass}">${title}</h1>
        ${subtitle ? `<p class="pa-entry__sub">${subtitle}</p>` : ""}
      </div>
      <p class="pa-entry__skip-hint">Click to continue</p>
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

function unbindEntrySkip(entry) {
  if (!entry?._skipHandler) return;
  entry.removeEventListener("click", entry._skipHandler);
  entry.removeEventListener("keydown", entry._skipHandler);
  entry._skipHandler = null;
}

/** Optional click / keyboard skip for the entry curtain. */
export function bindEntrySkip(entry, onSkip) {
  if (!entry || entry.dataset.skipBound) return;
  entry.dataset.skipBound = "true";

  const handler = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onSkip();
  };

  entry._skipHandler = handler;
  entry.setAttribute("role", "button");
  entry.setAttribute("tabindex", "0");
  entry.setAttribute("aria-label", "Skip intro and open page");
  entry.addEventListener("click", handler);
  entry.addEventListener("keydown", handler);
}

/** Shared curtain animation — used by all pages. */
export function animatePageEntryCurtain(entry, callbacks = {}) {
  if (!entry) {
    callbacks.onComplete?.();
    return null;
  }

  if (typeof gsap === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    callbacks.onComplete?.();
    return null;
  }

  const entryInner = entry.querySelector(".pa-entry__inner");
  const { textIn, hold, slideOut } = PAGE_ENTRY_TIMING;

  gsap.set(entry, { opacity: 1, visibility: "visible", yPercent: 0 });
  if (entryInner) gsap.set(entryInner, { opacity: 0, y: 20, scale: 0.98 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (entryInner) {
    tl.to(entryInner, { opacity: 1, y: 0, scale: 1, duration: textIn })
      .to({}, { duration: hold })
      .to(entry, {
        yPercent: -100,
        duration: slideOut,
        ease: "power3.inOut",
        onStart: () => callbacks.onSlideStart?.(),
      })
      .set(entry, { pointerEvents: "none" }, "<");
  }

  if (callbacks.onComplete) {
    tl.eventCallback("onComplete", callbacks.onComplete);
  }

  return tl;
}

export function skipPageEntry(entry, { timeline, content, onSlideStart, onComplete } = {}) {
  if (!entry || entry.dataset.skipped) return;
  entry.dataset.skipped = "true";

  unbindEntrySkip(entry);
  timeline?.kill();

  onSlideStart?.();
  document.body.classList.remove("pa-entry-active");

  if (content) {
    content.style.visibility = "visible";
    content.style.pointerEvents = "";
  }

  if (typeof gsap !== "undefined") {
    gsap.to(entry, {
      opacity: 0,
      duration: PAGE_ENTRY_TIMING.skipFade,
      onComplete: () => {
        entry.remove();
        if (content) gsap.set(content, { opacity: 1, y: 0, clearProps: "transform" });
        onComplete?.();
      },
    });
    return;
  }

  entry.remove();
  if (content) content.style.opacity = "1";
  onComplete?.();
}

export function playPageEntry(root, onComplete) {
  if (!root) {
    onComplete?.();
    return;
  }

  const entry = root.querySelector("[data-page-entry]");
  const content = root.querySelector("[data-page-entry-content]");

  const finish = () => {
    if (root.dataset.entryDone) return;
    root.dataset.entryDone = "true";
    document.body.classList.remove("pa-entry-active");
    entry?.remove();
    if (content) {
      content.style.visibility = "visible";
      content.style.pointerEvents = "";
      gsap?.set(content, { opacity: 1, y: 0, clearProps: "transform" });
    }
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

  if (entry.parentElement !== document.body) {
    document.body.appendChild(entry);
  }

  gsap.set("#app", { opacity: 1, y: 0, clearProps: "transform" });
  document.body.classList.add("pa-entry-active");

  if (content) {
    gsap.set(content, { opacity: 0, y: 12 });
    content.style.visibility = "hidden";
    content.style.pointerEvents = "none";
  }

  let tl = null;

  const handleSkip = () => {
    skipPageEntry(entry, {
      timeline: tl,
      content,
      onSlideStart: () => document.body.classList.remove("pa-entry-active"),
      onComplete: finish,
    });
  };

  bindEntrySkip(entry, handleSkip);

  tl = animatePageEntryCurtain(entry, {
    onSlideStart: () => {
      unbindEntrySkip(entry);
      document.body.classList.remove("pa-entry-active");
      if (content) {
        content.style.visibility = "visible";
        content.style.pointerEvents = "";
      }
    },
    onComplete: () => {
      unbindEntrySkip(entry);
      finish();
    },
  });

  if (!tl) {
    finish();
    return;
  }

  if (content) {
    tl.to(
      content,
      {
        opacity: 1,
        y: 0,
        duration: PAGE_ENTRY_TIMING.contentReveal,
      },
      `-=${PAGE_ENTRY_TIMING.contentOverlap}`
    );
  }
}
