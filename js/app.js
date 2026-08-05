import { getAllData } from "./utils/data.js";
import { initTransitions } from "./utils/transitions.js";
import { initRouter } from "./router.js";

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  initTransitions();

  // Mobile menu
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("is-open"));

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.getAttribute("href").replace(/^#\/?/, "") || "/";
      location.hash = target === "/" ? "#/" : `#/${target}`;
    });
  });

  try {
    const data = await getAllData();
    initRouter(data, null);
  } catch (err) {
    document.getElementById("app").innerHTML = `
      <div class="container static-page">
        <h1>Unable to load data</h1>
        <p>Make sure you're running via Live Server or a local HTTP server (not file://).</p>
        <p style="color:var(--pa-muted);margin-top:0.5rem">${err.message}</p>
      </div>`;
  }
}

boot();
