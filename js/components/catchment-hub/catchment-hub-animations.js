import { bindCatchmentScrollStory } from "./catchment-academy-hero.js";

let scrollTriggers = [];

export function mountCatchmentHubAnimations(root) {
  destroyCatchmentHubAnimations();
  bindCatchmentScrollStory(root);

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const story = root.querySelector("[data-catchment-scroll-story]");
  if (story) {
    const heroCopy = story.querySelector(".cth-scroll-section--hero [data-scroll-reveal]");
    const heroActions = story.querySelector(".cth-scroll-section--hero .cth-scroll-section__actions");
    if (heroCopy) gsap.from([heroCopy, heroActions].filter(Boolean), {
      opacity: 0,
      y: 28,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.15,
    });

    story.querySelectorAll("[data-scroll-section]:not(.cth-scroll-section--hero) [data-scroll-reveal]").forEach((panel) => {
      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: panel.closest("[data-scroll-section]"),
          start: "top 78%",
          once: true,
          onEnter: () => {
            gsap.from(panel, {
              opacity: 0,
              y: 40,
              duration: 0.65,
              ease: "power3.out",
            });
          },
        })
      );
    });
  }

  root.querySelectorAll(".cth-academy__tail .wb-out__score, .cth-academy__tail .wb-priorities-band, .cth-academy__tail .wb-out__featured, .cth-academy__tail .wb-out__resources").forEach((section) => {
    const items = section.querySelectorAll(".wb-out-metric, .wb-priority-panel, .wb-out-feat, .wb-out-resource");
    if (!items.length) return;

    scrollTriggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "top 86%",
        once: true,
        onEnter: () => {
          gsap.from(items, {
            opacity: 0,
            y: 28,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
          });
        },
      })
    );
  });

  ScrollTrigger.refresh();
}

export function destroyCatchmentHubAnimations() {
  scrollTriggers.forEach((st) => st.kill());
  scrollTriggers = [];
}
