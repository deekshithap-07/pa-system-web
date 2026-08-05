export function initResourcesAnimations() {
  const page = document.querySelector("[data-resources-hub]");
  if (!page || typeof gsap === "undefined") return;

  const heroItems = page.querySelectorAll(".res-hero [data-res-reveal]");
  if (heroItems.length) {
    gsap.from(heroItems, {
      opacity: 0,
      y: 28,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.1,
    });
  }

  page.querySelectorAll("[data-res-scroll]").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 32,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });

  page.querySelectorAll(".res-catalog-item").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: Math.min(i * 0.04, 0.35),
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 92%",
        once: true,
      },
    });
  });

  page.querySelectorAll(".res-case-card").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      scale: 0.96,
      duration: 0.55,
      delay: i * 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
    });
  });
}
