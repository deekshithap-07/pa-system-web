import { transitionTo } from "./utils/transitions.js";
import { renderHome, mountHome, destroyHome } from "./views/home.js";
import { renderAfricaIntelligence, mountAfricaIntelligence, destroyAfricaIntelligence } from "./views/africa-intelligence.js";
import { renderCountryHub, mountCountryHub, destroyCountryHub } from "./views/country-hub.js";
import { renderCatchmentHub, mountCatchmentHub, destroyCatchmentHub } from "./views/catchment-hub.js";
import {
  renderCommunityDashboard,
  mountDashboardView,
  teardownDashboard,
} from "./views/dashboard.js";
import { renderScorecard, mountScorecard, destroyScorecard } from "./views/scorecard.js";
import { renderResources, mountResources } from "./views/resources-hub.js";
import { renderInsights, mountInsights, destroyInsights } from "./views/insights-hub.js";
import { renderAbout } from "./views/about.js";
import {
  renderSearch,
} from "./views/static-pages.js";

let currentView = null;
let appData = null;
let lastRouteKey = null;
let linksBound = false;

export function initRouter(data) {
  appData = data;
  if (!linksBound) {
    bindGlobalLinks();
    linksBound = true;
  }
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  return { parts, raw: hash };
}

async function navigate(path, useTransition = true) {
  const hash = path === "/" || path === "" ? "#/" : `#/${path.replace(/^\//, "")}`;

  const apply = () => {
    if (location.hash !== hash) location.hash = hash;
    else handleRoute();
  };

  if (useTransition && currentView && currentView !== "landing" && currentView !== "africa") {
    await transitionTo(apply);
  } else {
    apply();
  }
}

export { navigate };

function updateNavActive(parts) {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    const nav = el.dataset.nav;
    let active = false;
    if (nav === "home") active = parts.length === 0;
    else if (nav === "africa") active = parts[0] === "africa" || parts[0] === "country" || parts[0] === "catchment";
    else active = parts[0] === nav;
    el.classList.toggle("is-active", active);
  });
}

function handleRoute() {
  const { parts } = parseRoute();
  const routeKey = parts.join("/") || "home";

  if (routeKey === lastRouteKey && currentView && document.getElementById("app")?.innerHTML) {
    return;
  }
  lastRouteKey = routeKey;

  const app = document.getElementById("app");
  destroyHome();
  destroyAfricaIntelligence();
  teardownDashboard();
  destroyCountryHub(app);
  destroyCatchmentHub(app);
  destroyScorecard(app);
  destroyInsights();
  const header = document.getElementById("site-header");
  let html = "";
  let dash = null;
  let hub = null;
  let view = "landing";

  updateNavActive(parts);
  header.classList.remove("site-header--dark");

  if (parts.length === 0) {
    view = "landing";
    html = renderHome(appData);
  } else if (parts[0] === "africa") {
    view = "africa";
    html = renderAfricaIntelligence(appData);
  } else if (parts[0] === "country" && parts[1]) {
    view = "country";
    const result = renderCountryHub(parts[1], appData);
    html = result.html;
    hub = result.hub;
  } else if (parts[0] === "catchment" && parts[1] && parts[2]) {
    view = "catchment";
    const result = renderCatchmentHub(parts[1], parts[2], appData);
    html = result.html;
    hub = result.hub;
  } else if (parts[0] === "community" && parts[1] && parts[2] && parts[3]) {
    view = "community";
    const result = renderCommunityDashboard(parts[1], parts[2], parts[3], appData);
    html = result.html;
    dash = result.dash;
  } else if (parts[0] === "scorecard") {
    view = "scorecard";
    html = renderScorecard(appData);
  } else if (parts[0] === "about") {
    view = "static";
    html = renderAbout(appData);
  } else if (parts[0] === "insights") {
    view = "insights";
    html = renderInsights(appData);
  } else if (parts[0] === "resources" || parts[0] === "reports") {
    view = "resources";
    html = renderResources(appData);
  } else if (parts[0] === "search") {
    view = "static";
    html = renderSearch(appData);
  } else {
    view = "landing";
    html = renderHome(appData);
  }

  currentView = view;
  app.innerHTML = html;

  if (view === "landing") {
    requestAnimationFrame(() => mountHome(appData));
  } else if (view === "africa") {
    requestAnimationFrame(() => mountAfricaIntelligence(appData, navigate));
  } else if (dash) {
    requestAnimationFrame(() => mountDashboardView(app, dash));
  } else if (view === "country" && hub) {
    requestAnimationFrame(() => mountCountryHub(app, hub, appData, navigate));
  } else if (view === "scorecard") {
    requestAnimationFrame(() => mountScorecard(app, appData));
  } else if (view === "catchment" && hub) {
    requestAnimationFrame(() => mountCatchmentHub(app, hub, appData, navigate));
  } else if (view === "insights") {
    requestAnimationFrame(() => mountInsights(appData));
  } else if (view === "resources") {
    requestAnimationFrame(() => mountResources(appData));
  }

  bindAnchorScroll(app);
}

function bindGlobalLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href").replace(/^#\/?/, "");
      navigate(href);
      return;
    }
    const back = e.target.closest("[data-back]");
    if (back) {
      e.preventDefault();
      navigate("/");
      return;
    }
    const backMap = e.target.closest("[data-back-map]");
    if (backMap) {
      e.preventDefault();
      navigate("africa", false);
    }
  });
}
function bindAnchorScroll(root) {
  root.querySelectorAll('a[href^="#"]:not([data-link])').forEach((el) => {
    const href = el.getAttribute("href");
    if (href.length > 1 && !href.startsWith("#/")) {
      el.addEventListener("click", (e) => {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  });
}
