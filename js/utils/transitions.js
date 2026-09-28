/**
 * Cinematic page transitions via GSAP — burgundy/cream, 400–700ms.
 */

let overlay;

export function initTransitions() {
  overlay = document.getElementById("transition-overlay");
}

export function transitionTo(callback, { scrollToTop = true, variant = "default" } = {}) {
  return new Promise((resolve) => {
    if (!overlay || typeof gsap === "undefined") {
      callback();
      if (scrollToTop) window.scrollTo(0, 0);
      resolve();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      callback();
      if (scrollToTop) window.scrollTo(0, 0);
      resolve();
      return;
    }

    const isCountry = variant === "country";
    const tl = gsap.timeline({
      onComplete: () => {
        overlay.classList.remove("is-active", "is-country-enter");
        if (scrollToTop) window.scrollTo(0, 0);
        resolve();
      },
    });

    overlay.classList.add("is-active");
    if (isCountry) overlay.classList.add("is-country-enter");

    tl.to(overlay, {
      opacity: 1,
      duration: isCountry ? 0.32 : 0.4,
      ease: "power2.inOut",
    })
      .to(
        "#app",
        {
          opacity: 0,
          y: isCountry ? -10 : -16,
          duration: 0.28,
          ease: "power2.in",
        },
        "<0.06"
      )
      .call(() => {
        gsap.set("#app", { opacity: 1, y: 0, clearProps: "transform" });
        callback();
      })
      .fromTo(
        "#app",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
      )
      .to(
        overlay,
        {
          opacity: 0,
          duration: isCountry ? 0.38 : 0.45,
          ease: "power2.inOut",
        },
        "-=0.2"
      );
  });
}

export function animateKPIs(root) {
  root.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent =
          target >= 1000
            ? Math.round(obj.val).toLocaleString()
            : Math.round(obj.val * 10) / 10;
      },
    });
  });
}

export function animateDashboardIn(root) {
  gsap.from(root.querySelectorAll(".kpi-card, .chart-card, .entity-card, .insight-list li"), {
    opacity: 0,
    y: 24,
    duration: 0.6,
    stagger: 0.06,
    ease: "power3.out",
  });
}
