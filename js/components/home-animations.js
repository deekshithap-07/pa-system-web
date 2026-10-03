import { formatNumber } from "../utils/format.js";
import { prefersReducedMotion, playReveal, countUpOnce, revealFrom } from "../utils/pa-motion.js";

export function initLandingAnimations() {
  if (typeof gsap === "undefined") return;

  if (prefersReducedMotion()) {
    document
      .querySelectorAll(
        ".home-page [data-reveal], .home-page [data-stagger] > *, .home-page [data-pa-africa-rise], .home-page [data-motion-img]"
      )
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
    document.querySelectorAll(".home-page [data-home-section]").forEach((el) => el.classList.add("is-in"));
    return;
  }

  initHomePhotoHero();
  initHomeScrollStack();
  initHomeSectionMotion();
  initHomeImageReveals();
  initImpactCounters();
  initAfricaEditorialMotion();
  initKnowNewsMotion();
  initNetworkFlowAnimations();
}

function playIn(targets, type, opts = {}) {
  playReveal(targets, type, opts);
}

function initHomeSectionMotion() {
  const page = document.querySelector(".home-page");
  if (!page || typeof ScrollTrigger === "undefined") return;

  page.querySelectorAll("[data-home-section]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 78%",
      once: true,
      onEnter: () => section.classList.add("is-in"),
    });
  });

  page.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.hasAttribute("data-stagger") && el.children.length) return;
    if (el.matches("img") || el.querySelector(":scope > img")) return;
    playIn(el, el.dataset.anim || "fade-up", { trigger: el, duration: 0.8 });
  });

  page.querySelectorAll("[data-stagger]").forEach((group) => {
    const kids = [...group.children];
    if (!kids.length) return;
    gsap.set(group, { autoAlpha: 1, clearProps: "transform" });
    playIn(kids, group.dataset.stagger || "fade-up", {
      trigger: group,
      stagger: 0.12,
      duration: 0.75,
    });
  });

  window.setTimeout(() => {
    page.querySelectorAll("[data-reveal], [data-stagger] > *").forEach((el) => {
      if (window.getComputedStyle(el).opacity === "0") {
        gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, clearProps: "transform,clipPath" });
      }
    });
  }, 1800);
}

/** Directional clip-path image reveals — varied per section, not identical fades */
function initHomeImageReveals() {
  const page = document.querySelector(".home-page");
  if (!page || typeof ScrollTrigger === "undefined") return;

  const directions = ["clip-left", "clip-right", "clip-up", "clip-down"];
  const images = page.querySelectorAll(
    ".pa-stories__feature-media img, [data-motion-img]"
  );

  images.forEach((img, i) => {
    const type = img.dataset.anim || directions[i % directions.length];
    const frame = img.closest(".pa-stories__feature-media, .pa-know__cover, .home-photo-hero__media") || img;

    gsap.fromTo(
      img,
      revealFrom(type),
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power3.out",
        clearProps: "clipPath",
        scrollTrigger: {
          trigger: frame,
          start: "top 88%",
          once: true,
        },
      }
    );
  });
}

function initHomePhotoHero() {
  const hero = document.querySelector("[data-home-photo-hero]");
  if (!hero) return;

  const kids = hero.querySelectorAll(".home-photo-hero__copy > *");
  gsap.fromTo(
    kids,
    { autoAlpha: 0, y: 28 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.1,
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

    countUpOnce(valueEl, {
      value,
      prefix,
      suffix,
      duration: 1.4,
      format: (n) => (value >= 1000 ? formatNumber(n) : n),
    });
  });
}

function initAfricaEditorialMotion() {
  const section = document.querySelector(".pa-africa");
  if (!section || typeof ScrollTrigger === "undefined") return;

  const rises = section.querySelectorAll("[data-pa-africa-rise]");
  if (rises.length) {
    gsap.fromTo(
      rises,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.11,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: section.querySelector(".pa-africa__top") || section,
          start: "top 78%",
          once: true,
        },
      }
    );
  }

  const ring = section.querySelector(".pa-africa__geo-ring circle");
  const dots = section.querySelectorAll(".pa-africa__geo-dot");
  const arc = section.querySelector(".pa-africa__geo-arc");

  const armOrbit = () => {
    section.classList.add("is-geo-ready");
  };

  if (ring) {
    gsap.set(ring, { strokeDasharray: 1, strokeDashoffset: 1 });
    if (dots.length) gsap.set(dots, { autoAlpha: 0 });
    if (arc) gsap.set(arc, { autoAlpha: 0.6 });

    ScrollTrigger.create({
      trigger: section.querySelector(".pa-africa__top") || section,
      start: "top 78%",
      once: true,
      onEnter: () => {
        if (arc) {
          gsap.to(arc, {
            autoAlpha: 1,
            duration: 1.05,
            ease: "power2.out",
          });
        }
        gsap.to(ring, {
          strokeDashoffset: 0,
          duration: 1.45,
          ease: "power2.out",
        });
        if (dots.length) {
          gsap.to(dots, {
            autoAlpha: 1,
            duration: 0.55,
            stagger: 0.1,
            delay: 0.35,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(dots, { clearProps: "opacity,visibility" });
              armOrbit();
            },
          });
        } else {
          armOrbit();
        }
      },
    });

    /* Safety: if ScrollTrigger misses (already past), arm orbit soon */
    window.setTimeout(() => {
      if (!section.classList.contains("is-geo-ready")) {
        gsap.set(ring, { strokeDashoffset: 0 });
        gsap.set(dots, { autoAlpha: 1, clearProps: "opacity,visibility" });
        if (arc) gsap.set(arc, { autoAlpha: 1 });
        armOrbit();
      }
    }, 2200);
  } else {
    armOrbit();
  }

  const stats = section.querySelectorAll("[data-pa-count]");
  stats.forEach((el) => {
    const target = Number(el.dataset.paCount);
    if (!Number.isFinite(target)) return;
    const prefix = el.dataset.paCountPrefix || "";
    const suffix = el.dataset.paCountSuffix || "";
    const unit = el.dataset.paCountUnit || "";
    const decimals = Number(el.dataset.paCountDecimals) || 0;
    const scale = { K: 1e3, M: 1e6, B: 1e9 }[unit] || 1;

    countUpOnce(el, {
      value: target,
      prefix,
      suffix,
      duration: 1.8,
      format: (n) => (unit ? `${(n / scale).toFixed(decimals)}${unit}` : n),
    });

    gsap.fromTo(
      el,
      { y: 14 },
      {
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  const countries = section.querySelectorAll(".pa-africa__country");
  if (countries.length) {
    gsap.fromTo(
      countries,
      { autoAlpha: 0, x: -12 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.05,
        delay: 0.15,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: section.querySelector(".pa-africa__nav") || section,
          start: "top 82%",
          once: true,
        },
      }
    );
  }

  const bridge = section.querySelector(".pa-africa__bridge-line");
  if (bridge) {
    gsap.fromTo(
      bridge,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: bridge, start: "top 90%", once: true },
      }
    );
  }
}

function initKnowNewsMotion() {
  if (typeof ScrollTrigger === "undefined") return;

  const knowSection = document.querySelector(".pa-know");
  const cover = document.querySelector("[data-pa-know-book] .pa-know__cover");
  const knowCopy = document.querySelector(".pa-know__copy");

  if (knowSection && cover) {
    gsap.set(cover, {
      autoAlpha: 0,
      x: 50,
      scale: 0.94,
      rotation: -7,
      filter: "drop-shadow(0 0 0 rgba(42,16,20,0))",
    });
    if (knowCopy) {
      gsap.set(knowCopy.children, { autoAlpha: 0, x: -22, y: 10 });
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      if (knowCopy) {
        gsap.to(knowCopy.children, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "transform",
        });
      }
      gsap.to(cover, {
        autoAlpha: 1,
        x: 0,
        scale: 1,
        rotation: 0,
        filter: "drop-shadow(0 22px 36px rgba(42,16,20,0.3))",
        duration: 0.95,
        delay: 0.08,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(cover, { clearProps: "transform,filter" });
          /* Restart CSS idle float after entrance */
          cover.style.animation = "none";
          void cover.offsetWidth;
          cover.style.animation = "";
        },
      });
    };

    /* The map above mounts late and shifts layout, so watch real visibility instead of a precomputed scroll offset */
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            reveal();
          }
        },
        { rootMargin: "0px 0px -15% 0px" }
      );
      io.observe(knowSection);
    } else {
      reveal();
    }
  }

  if (cover && window.matchMedia("(hover: none)").matches) {
    let openTimer = null;
    cover.addEventListener("pointerdown", () => {
      cover.classList.add("is-open");
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => cover.classList.remove("is-open"), 900);
    });
  }

  const rail = document.querySelector(".pa-news__rail");
  if (rail) {
    gsap.fromTo(
      rail,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".pa-news__stream",
          start: "top 80%",
          end: "bottom 55%",
          scrub: 0.5,
        },
      }
    );
  }
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
    gsap.killTweensOf(".pa-africa__geo-dot");
    gsap.killTweensOf(".pa-africa__geo-ring circle");
  }
  document.querySelector(".pa-africa")?.classList.remove("is-geo-ready");
}

export const initHeroAnimation = initLandingAnimations;
export const initRevealAnimations = () => {};
export const initLiveKpis = () => {};
