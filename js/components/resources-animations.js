export function initResourcesAnimations() {
  const page = document.querySelector("[data-resources-hub]");
  if (!page || typeof gsap === "undefined") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    const heroItems = page.querySelectorAll("[data-atlas-hero]");
    if (heroItems.length) {
      gsap.set(heroItems, { opacity: 0, y: 24 });
      gsap.to(heroItems, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.15,
      });
    }
  }

  if (typeof ScrollTrigger === "undefined") return;

  page.querySelectorAll("[data-atlas-scroll]").forEach((section) => {
    const reveals = section.querySelectorAll("[data-atlas-reveal]");
    if (!reveals.length) return;

    if (reducedMotion) {
      reveals.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
      return;
    }

    gsap.set(reveals, { opacity: 0, y: 36 });
    gsap.to(reveals, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        once: true,
      },
    });
  });

  page.querySelectorAll(".atlas-theme").forEach((theme) => {
    const statNum = theme.querySelector(".atlas-theme__stat-num");
    if (!statNum || reducedMotion) return;

    const raw = statNum.dataset.atlasCount || statNum.textContent;
    const numeric = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    if (Number.isNaN(numeric)) return;

    const suffix = String(raw).replace(/[0-9.]/g, "");
    const counter = { val: 0 };

    gsap.to(counter, {
      val: numeric,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: theme,
        start: "top 75%",
        once: true,
      },
      onUpdate: () => {
        const display = Number.isInteger(numeric)
          ? Math.round(counter.val)
          : counter.val.toFixed(1);
        statNum.textContent = `${display}${suffix}`;
      },
    });
  });

  page.querySelectorAll(".rlib-pub, .rlib-case, .rlib-pack, [data-rlib-reveal]").forEach((el) => {
    if (reducedMotion) return;
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 94%",
        once: true,
      },
    });
  });

  page.querySelectorAll("[data-rlib-scroll]").forEach((section) => {
    const reveals = section.querySelectorAll("[data-rlib-reveal]");
    if (!reveals.length || reducedMotion) return;
    gsap.set(reveals, { opacity: 0, y: 24 });
    gsap.to(reveals, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: section, start: "top 85%", once: true },
    });
  });
}
