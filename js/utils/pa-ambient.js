/**
 * Continuous ambient motion — second layer after scroll entry reveals.
 * Toggles `.is-ambient` on sections while they are in view.
 * Does not run entry animations or change content/layout.
 */

import { prefersReducedMotion } from "./pa-motion.js";

const AMBIENT_SELECTORS = [
  ".pa-africa",
  ".pa-ra",
  ".pa-stories",
  ".pa-know",
  ".pa-news",
  ".pa-impact",
  ".kh-hero",
  ".kh-featured",
  ".kh-explore",
  ".kh-media-band",
  ".www-hero",
  ".www-map-stage",
  ".www-bridge",
  ".ab-journey",
  ".ab-leaders",
  ".ab-statement",
  ".wb-who-history",
  ".wb-who-hero",
  ".ch-hero",
  ".cp-hero",
  ".cp-geo",
  ".cm-entry",
  ".cm-places",
  ".cm-loc",
  ".id-page",
  ".id-hero",
  ".nu-page",
  ".sp-cinema",
  ".ow-organic",
].join(", ");

let observer = null;
let watched = new Set();

function setAmbient(el, on) {
  if (!el) return;
  el.classList.toggle("is-ambient", Boolean(on));
}

export function destroyPaAmbient() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  watched.forEach((el) => setAmbient(el, false));
  watched.clear();
  document.documentElement.classList.remove("pa-ambient-ready");
}

/**
 * Observe ambient hosts inside root (defaults to #app).
 * Safe to call on every route mount.
 */
export function initPaAmbient(root = document.getElementById("app") || document) {
  destroyPaAmbient();

  if (prefersReducedMotion()) return;
  if (typeof IntersectionObserver === "undefined") return;

  const scope = root?.querySelectorAll ? root : document;
  const nodes = [...scope.querySelectorAll(AMBIENT_SELECTORS)];
  if (!nodes.length) return;

  document.documentElement.classList.add("pa-ambient-ready");

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        /* Active when a meaningful portion is on screen */
        const on =
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.18;
        setAmbient(entry.target, on);
      });
    },
    {
      root: null,
      rootMargin: "8% 0px -6% 0px",
      threshold: [0, 0.18, 0.35, 0.55],
    }
  );

  nodes.forEach((el) => {
    watched.add(el);
    observer.observe(el);
  });
}
