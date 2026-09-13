import { formatNumber } from "../utils/format.js";

export function initLandingAnimations() {
  if (typeof gsap === "undefined") return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.querySelectorAll(".home-page [data-reveal], .home-page [data-stagger] > *").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  initHomePhotoHero();
  initHomeScrollStack();
  initHomeSectionMotion();
  initImpactCounters();
  initNetworkFlowAnimations();
}

function animFrom(type) {
  switch (type) {
    case "slide-left":
      return { autoAlpha: 0, x: -36, y: 0, scale: 1 };
    case "slide-right":
      return { autoAlpha: 0, x: 36, y: 0, scale: 1 };
    case "slide-up":
      return { autoAlpha: 0, y: 32, x: 0, scale: 1 };
    case "pop":
      return { autoAlpha: 0, y: 20, scale: 0.92 };
    case "fade":
      return { autoAlpha: 0, y: 10, scale: 1 };
    case "fade-up":
    default:
      return { autoAlpha: 0, y: 28, x: 0, scale: 1 };
  }
}

function playIn(targets, type, opts = {}) {
  const els = gsap.utils.toArray(targets).filter(Boolean);
  if (!els.length) return;

  gsap.fromTo(
    els,
    animFrom(type),
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: opts.duration ?? 0.65,
      stagger: opts.stagger ?? 0,
      ease: type === "pop" ? "back.out(1.4)" : "power3.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: opts.trigger || els[0],
        start: "top 92%",
        once: true,
        // If already on screen when mounted, play immediately
        toggleActions: "play none none none",
      },
      ...opts.extra,
    }
  );
}

function initHomeSectionMotion() {
  const page = document.querySelector(".home-page");
  if (!page || typeof ScrollTrigger === "undefined") return;

  // Never hide whole sections — only animate inner blocks so content can't stay blank
  page.querySelectorAll("[data-reveal]").forEach((el) => {
    // Skip if this element is also a stagger parent (children animate instead)
    if (el.hasAttribute("data-stagger") && el.children.length) return;
    const type = el.dataset.anim || "fade-up";
    playIn(el, type, { trigger: el });
  });

  page.querySelectorAll("[data-stagger]").forEach((group) => {
    const type = group.dataset.stagger === "stats" ? "pop" : group.dataset.stagger || "fade-up";
    const kids = [...group.children];
    if (!kids.length) return;
    // Ensure parent stays visible
    gsap.set(group, { autoAlpha: 1, clearProps: "transform" });
    playIn(kids, type, {
      trigger: group,
      stagger: type === "pop" ? 0.08 : 0.1,
      duration: 0.55,
    });
  });

  // Safety: after a short delay, force any stuck hidden nodes visible
  window.setTimeout(() => {
    page.querySelectorAll("[data-reveal], [data-stagger] > *").forEach((el) => {
      const opacity = window.getComputedStyle(el).opacity;
      if (opacity === "0") {
        gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: "transform" });
      }
    });
  }, 1800);

  const impactBg = page.querySelector(".pa-impact__bg img");
  if (impactBg) {
    gsap.fromTo(
      impactBg,
      { scale: 1.06, y: -16 },
      {
        scale: 1.12,
        y: 16,
        ease: "none",
        scrollTrigger: {
          trigger: ".pa-impact",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      }
    );
  }
}

function initHomePhotoHero() {
  const hero = document.querySelector("[data-home-photo-hero]");
  if (!hero) return;

  const kids = hero.querySelectorAll(".home-photo-hero__copy > *");
  gsap.fromTo(
    kids,
    { autoAlpha: 0, y: 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.09,
      ease: "power3.out",
      clearProps: "transform",
    }
  );

  const watch = hero.querySelector(".home-photo-hero__watch");
  if (watch) {
    gsap.fromTo(
      watch,
      { autoAlpha: 0, x: 18 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.65,
        delay: 0.35,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }
}

let flowLoopTween = null;

function initHomeScrollStack() {
  const stack = document.querySelector("[data-home-scroll-stack]");
  if (!stack || typeof ScrollTrigger === "undefined") return;

  const pin = stack.querySelector(".home-hero-stack__pin");
  const media = pin?.querySelector(".home-photo-hero__img");
  if (!media) return;

  gsap.to(media, {
    y: 40,
    scale: 1.06,
    ease: "none",
    scrollTrigger: {
      trigger: stack,
      start: "top top",
      end: "+=60%",
      scrub: 0.65,
    },
  });
}

function initNetworkFlowAnimations() {
  const diagram = document.querySelector("[data-flow-diagram]");
  if (!diagram) return;

  const section = diagram.closest(".pa-flow");
  const row = diagram.querySelector("[data-flow-row]");
  const cards = [...diagram.querySelectorAll("[data-flow-card]")];
  const connectors = [...diagram.querySelectorAll("[data-flow-connector]")];
  const legend = diagram.querySelector(".pa-flow__legend");
  if (!cards.length) return;

  const isVertical = () => {
    if (!row) return false;
    return window.getComputedStyle(row).flexDirection === "column";
  };

  const getProgressProp = () => (isVertical() ? "scaleY" : "scaleX");
  const getPulseProp = () => (isVertical() ? "top" : "left");
  const getPulseEnd = () => (isVertical() ? "100%" : "100%");

  cards[0]?.classList.add("is-lit", "is-active");

  const runFlowSequence = (onComplete) => {
    const tl = gsap.timeline({ onComplete });
    const progressProp = getProgressProp();
    const pulseProp = getPulseProp();

    connectors.forEach((conn, i) => {
      const nextCard = cards[i + 1];
      const progress = conn.querySelector(".pa-flow__connector-progress");
      const pulse = conn.querySelector(".pa-flow__pulse");
      if (!progress || !nextCard) return;

      tl.set(pulse, { [pulseProp]: "0%", opacity: 1 });
      tl.to(
        progress,
        { [progressProp]: 1, duration: 0.55, ease: "power2.inOut" },
        i === 0 ? 0.15 : undefined
      );
      tl.to(
        pulse,
        {
          [pulseProp]: getPulseEnd(),
          duration: 0.55,
          ease: "power2.inOut",
        },
        "<"
      );
      tl.set(pulse, { opacity: 0 });
      tl.call(() => {
        cards[i]?.classList.remove("is-active");
        nextCard.classList.add("is-lit", "is-active");
      });
      tl.to(
        nextCard,
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" },
        "-=0.2"
      );
    });

    if (legend) {
      tl.to(legend, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.1");
    }

    return tl;
  };

  const startFlowLoop = () => {
    if (flowLoopTween) flowLoopTween.kill();
    section?.classList.add("is-looping");

    const pulseProp = getPulseProp();
    flowLoopTween = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

    connectors.forEach((conn, i) => {
      const pulse = conn.querySelector(".pa-flow__pulse");
      const nextCard = cards[i + 1];
      if (!pulse || !nextCard) return;

      flowLoopTween.set(pulse, { [pulseProp]: "0%", opacity: 1 });
      flowLoopTween.to(pulse, {
        [pulseProp]: getPulseEnd(),
        duration: 0.4,
        ease: "power1.inOut",
      });
      flowLoopTween.set(pulse, { opacity: 0 });
      flowLoopTween.call(() => {
        cards.forEach((c) => c.classList.remove("is-active"));
        nextCard.classList.add("is-active");
      });
      flowLoopTween.to(nextCard, {
        scale: 1.04,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });
    });
  };

  gsap.set(cards.slice(1), { opacity: 0.35, scale: 0.94, y: 8 });
  if (legend) gsap.set(legend, { opacity: 0, y: 8 });

  ScrollTrigger.create({
    trigger: diagram,
    start: "top 75%",
    once: true,
    onEnter: () => {
      section?.classList.add("is-flowing");
      runFlowSequence(() => {
        section?.classList.add("is-complete");
        cards.forEach((c) => c.classList.add("is-lit"));
        cards[cards.length - 1]?.classList.add("is-active");
        startFlowLoop();
      });
    },
  });

  gsap.to(".pa-flow__ring", {
    rotation: 360,
    duration: 120,
    repeat: -1,
    ease: "none",
  });
}

function initImpactCounters() {
  document.querySelectorAll(".impact-kpi[data-kpi], .wb-data-stat[data-kpi], .wb-impact-stat[data-kpi]").forEach((el) => {
    const value = parseFloat(el.dataset.value);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const valueEl =
      el.querySelector(".impact-kpi__value") ||
      el.querySelector(".wb-data-stat__value") ||
      el.querySelector(".wb-impact-stat__value");
    if (!valueEl || Number.isNaN(value)) return;
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            const display = value >= 1000 ? formatNumber(Math.round(obj.val)) : Math.round(obj.val);
            valueEl.textContent = `${prefix}${display}${suffix}`;
          },
        });
      },
    });
  });
}

export function destroyHomeAnimations() {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((t) => {
      const tr = t.trigger;
      if (tr?.closest?.(".home-page") || tr?.closest?.("[data-home-stories]")) t.kill();
    });
  }
  flowLoopTween?.kill();
  flowLoopTween = null;
  if (typeof gsap !== "undefined") {
    gsap.killTweensOf(".pa-flow__pulse");
    gsap.killTweensOf(".pa-flow__connector-progress");
  }
}

export const initHeroAnimation = initLandingAnimations;
export const initRevealAnimations = () => {};
export const initLiveKpis = () => {};
