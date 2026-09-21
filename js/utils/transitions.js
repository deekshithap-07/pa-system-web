/**
 * Cinematic page transitions via GSAP.
 */

let overlay;

export function initTransitions() {
  overlay = document.getElementById("transition-overlay");
}

export function transitionTo(callback, { scrollToTop = true, variant = "default" } = {}) {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        overlay.classList.remove("is-active", "is-country-enter");
        if (scrollToTop) window.scrollTo(0, 0);
        resolve();
      },
    });

    overlay.classList.add("is-active");
    if (variant === "country") overlay.classList.add("is-country-enter");

    tl.to(overlay, { opacity: 1, duration: variant === "country" ? 0.35 : 0.45, ease: "power2.inOut" })
      .to("#app", { opacity: 0, y: variant === "country" ? -12 : -20, duration: 0.28 }, "<0.08")
      .call(() => {
        gsap.set("#app", { opacity: 1, y: 0, clearProps: "transform" });
        callback();
      })
      .to(overlay, { opacity: 0, duration: variant === "country" ? 0.4 : 0.5, ease: "power2.inOut" });
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
        el.textContent = target >= 1000 ? Math.round(obj.val).toLocaleString() : Math.round(obj.val * 10) / 10;
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
