import { formatNumber } from "../../utils/format.js";
import { renderDashboardCharts, destroyCharts } from "../charts.js";

export function initCatchmentHubAnimations(root) {
  const triggers = [];

  gsap.from(root.querySelectorAll(".ch-hero__content > *, .ch-hero__visual"), {
    opacity: 0,
    y: 20,
    duration: 0.55,
    stagger: 0.06,
    ease: "power3.out",
  });

  root.querySelectorAll("[data-kpi]").forEach((el) => {
    const text = el.dataset.text;
    if (text) {
      el.querySelector(".ch-kpi__value").textContent = text;
      return;
    }
    const value = parseFloat(el.dataset.value);
    const valueEl = el.querySelector(".ch-kpi__value");
    const obj = { val: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            valueEl.textContent = value >= 1000 ? formatNumber(Math.round(obj.val)) : Math.round(obj.val);
          },
        });
      },
    });
    triggers.push(st);
  });

  root.querySelectorAll("[data-reveal-section]").forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.from(el, { opacity: 0, y: 24, duration: 0.6, ease: "power2.out" }),
    });
    triggers.push(st);
  });

  root._hubTriggers = triggers;
}

export function mountCatchmentHubCharts(root, charts) {
  renderDashboardCharts(root, charts);
}

export function teardownCatchmentHub(root) {
  root._hubTriggers?.forEach((t) => t.kill());
  root._hubTriggers = [];
  destroyCharts();
}
