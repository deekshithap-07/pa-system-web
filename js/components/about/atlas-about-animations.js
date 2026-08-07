import { mountAtlasRings } from "./AtlasRing.js";

let ringCleanup = null;

export function initAboutAtlasAnimations() {
  const page = document.querySelector("[data-about-atlas]");
  if (!page) return;

  ringCleanup?.();
  ringCleanup = mountAtlasRings(page);

  if (typeof gsap === "undefined") return;

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
        delay: 0.1,
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

  page.querySelectorAll(".about-atlas-theme").forEach((theme) => {
    const headline = theme.querySelector("[data-atlas-ring-headline]");
    if (!headline || reducedMotion) return;

    const raw = headline.dataset.count || headline.textContent;
    const numeric = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    if (Number.isNaN(numeric)) return;

    const prefix = String(raw).match(/^[^0-9]*/)?.[0] || "";
    const suffix = String(raw).replace(/^[0-9.]*/, "").replace(/[0-9.]/g, "") || String(raw).replace(/[0-9.]/g, "");
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
        const display = Number.isInteger(numeric) ? Math.round(counter.val) : counter.val.toFixed(1);
        headline.textContent = `${prefix}${display}${suffix}`;
      },
    });
  });

  const themeSections = page.querySelectorAll("[data-about-theme]");
  const navLinks = page.querySelectorAll("[data-about-theme-nav]");

  if (themeSections.length && navLinks.length && typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.aboutTheme;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.dataset.aboutThemeNav === id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    themeSections.forEach((section) => observer.observe(section));
  }

  ScrollTrigger.refresh();
}

export function destroyAboutAtlasAnimations() {
  ringCleanup?.();
  ringCleanup = null;
}
