import { getAllData } from "./utils/data.js";
import { bindAfricaNavTriggers, restoreAfricaNav } from "./utils/nav-africa.js";
import { initTransitions } from "./utils/transitions.js";
import { initRouter, navigate } from "./router.js";
import { initSearchModal, openSearchModal } from "./components/search-modal.js";

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  initTransitions();
  bindAfricaNavTriggers();
  restoreAfricaNav();

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  toggle?.addEventListener("click", () => nav?.classList.toggle("is-open"));

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.dataset.nav === "search") {
        e.preventDefault();
        nav?.classList.remove("is-open");
        openSearchModal();
        return;
      }
      e.preventDefault();
      const target = el.getAttribute("href").replace(/^#\/?/, "") || "/";
      navigate(target === "/" || target === "" ? "/" : target);
    });
  });

  try {
    const data = await getAllData();
    initSearchModal(data);
    initRouter(data);
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
