/**
 * Shared PA motion helpers — GSAP + ScrollTrigger, prefers-reduced-motion aware.
 * Presentation only; does not change content or routes.
 */

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function revealFrom(type = "fade-up") {
  switch (type) {
    case "slide-left":
      return { autoAlpha: 0, x: -36, y: 0, scale: 1 };
    case "slide-right":
      return { autoAlpha: 0, x: 36, y: 0, scale: 1 };
    case "slide-up":
      return { autoAlpha: 0, y: 32, x: 0, scale: 1 };
    case "clip-left":
      return { autoAlpha: 0, clipPath: "inset(0 72% 0 0)", scale: 1.04 };
    case "clip-right":
      return { autoAlpha: 0, clipPath: "inset(0 0 0 72%)", scale: 1.04 };
    case "clip-up":
      return { autoAlpha: 0, clipPath: "inset(72% 0 0 0)", scale: 1.03 };
    case "clip-down":
      return { autoAlpha: 0, clipPath: "inset(0 0 72% 0)", scale: 1.03 };
    case "scale-in":
      return { autoAlpha: 0, y: 18, scale: 0.96 };
    case "pop":
      return { autoAlpha: 0, y: 20, scale: 0.92 };
    case "fade":
      return { autoAlpha: 0, y: 10, scale: 1 };
    case "fade-up":
    default:
      return { autoAlpha: 0, y: 28, x: 0, scale: 1 };
  }
}

/**
 * One-shot viewport reveal. Safe if GSAP/ScrollTrigger missing.
 */
export function playReveal(targets, type = "fade-up", opts = {}) {
  if (typeof gsap === "undefined") return;
  const els = gsap.utils.toArray(targets).filter(Boolean);
  if (!els.length) return;

  const from = revealFrom(type);
  const usesClip = "clipPath" in from;

  gsap.fromTo(
    els,
    from,
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      clipPath: usesClip ? "inset(0% 0% 0% 0%)" : undefined,
      duration: opts.duration ?? (usesClip ? 0.85 : 0.65),
      stagger: opts.stagger ?? 0,
      ease: type === "pop" ? "back.out(1.4)" : "power3.out",
      clearProps: usesClip ? "transform,clipPath" : "transform",
      scrollTrigger:
        typeof ScrollTrigger !== "undefined"
          ? {
              trigger: opts.trigger || els[0],
              start: opts.start || "top 90%",
              once: true,
              toggleActions: "play none none none",
            }
          : undefined,
      ...opts.extra,
    }
  );
}

/**
 * Count once into view. Preserves prefix/suffix/K formatting via formatter.
 */
export function countUpOnce(el, { value, prefix = "", suffix = "", duration = 1.6, format } = {}) {
  if (!el || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (!Number.isFinite(value)) return;

  const obj = { val: 0 };
  const write = () => {
    const n = Math.round(obj.val);
    el.textContent = `${prefix}${format ? format(n) : n}${suffix}`;
  };

  ScrollTrigger.create({
    trigger: el,
    start: "top 88%",
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: write,
      });
    },
  });
}
