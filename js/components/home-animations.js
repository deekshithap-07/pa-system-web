import { formatNumber } from "../utils/format.js";

export function initLandingAnimations() {
  const hero = document.querySelector(".home-hero__content");
  if (hero) {
    gsap.from(hero.children, {
      opacity: 0,
      y: 22,
      duration: 0.6,
      stagger: 0.06,
      ease: "power3.out",
    });
  }

  gsap.utils.toArray(".home-page [data-reveal]").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  initImpactCounters();
  initNetworkFlowAnimations();
}

let flowLoopTween = null;

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

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    cards.forEach((c) => {
      c.classList.add("is-lit");
      gsap.set(c, { opacity: 1, scale: 1, y: 0 });
    });
    connectors.forEach((conn) => {
      const progress = conn.querySelector(".pa-flow__connector-progress");
      if (progress) gsap.set(progress, { [getProgressProp()]: 1 });
    });
    section?.classList.add("is-complete");
    if (legend) gsap.set(legend, { opacity: 1, y: 0 });
    return;
  }

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
  document.querySelectorAll(".impact-kpi[data-kpi]").forEach((el) => {
    const value = parseFloat(el.dataset.value);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const valueEl = el.querySelector(".impact-kpi__value");
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
  ScrollTrigger.getAll().forEach((t) => {
    const tr = t.trigger;
    if (tr?.closest?.(".home-page")) t.kill();
  });
  flowLoopTween?.kill();
  flowLoopTween = null;
  gsap.killTweensOf(".pa-flow__pulse");
  gsap.killTweensOf(".pa-flow__connector-progress");
}

export const initHeroAnimation = initLandingAnimations;
export const initRevealAnimations = () => {};
export const initLiveKpis = () => {};
