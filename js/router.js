import { transitionTo } from "./utils/transitions.js";
import {
  saveScrollPosition,
  markProgrammaticNavigation,
  resolveNavigationIntent,
  applyRouteScroll,
} from "./utils/scroll-nav.js";
import { renderHome, mountHome, destroyHome } from "./views/home.js";
import { renderAfricaIntelligence, mountAfricaIntelligence, destroyAfricaIntelligence } from "./views/africa-intelligence.js";
import { renderCountryHub, mountCountryHub, destroyCountryHub } from "./views/country-hub.js";
import { renderCatchmentHub, mountCatchmentHub, destroyCatchmentHub } from "./views/catchment-hub.js";
import { renderCommunityHub, mountCommunityHub, destroyCommunityHub } from "./views/community-hub.js";
import { teardownDashboard } from "./views/dashboard.js";
import { renderScorecard, mountScorecard, destroyScorecard } from "./views/scorecard.js";
import { renderResources, mountResources } from "./views/resources-hub.js";
import { renderInsights, mountInsights, destroyInsights } from "./views/insights-hub.js";
import { renderAbout } from "./views/about.js";
import { closeSearchModal } from "./components/search-modal.js";
import { renderStoriesHub, mountStoriesHub, destroyStoriesHub } from "./views/stories-hub.js";

let currentView = null;
let appData = null;
let lastRouteKey = null;
let linksBound = false;
let pendingAnchor = null;

export function initRouter(data) {
  appData = data;
  if (!linksBound) {
    bindGlobalLinks();
    linksBound = true;
  }
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

/** Split route path and in-page anchor (e.g. resources#res-catalog). */
function parseRoute() {
  let raw = location.hash.replace(/^#\/?/, "");
  if (!raw) return { parts: [], anchor: null };

  let anchor = null;
  const anchorIdx = raw.indexOf("#");
  if (anchorIdx !== -1) {
    anchor = raw.slice(anchorIdx + 1);
    raw = raw.slice(0, anchorIdx);
  }

  const parts = raw.split("/").filter(Boolean);
  return { parts, anchor };
}

function routeKeyFromParts(parts) {
  return parts.join("/") || "home";
}

async function navigate(path, options = {}) {
  const opts = typeof options === "boolean" ? { useTransition: options } : options;
  const { useTransition = true, isBack = false, anchor = null } = opts;

  let routePath = (path || "/").replace(/^#\/?/, "");
  let routeAnchor = anchor;
  const anchorIdx = routePath.indexOf("#");
  if (anchorIdx !== -1) {
    routeAnchor = routeAnchor || routePath.slice(anchorIdx + 1);
    routePath = routePath.slice(0, anchorIdx);
  }

  pendingAnchor = routeAnchor;
  const hash = routePath === "/" || routePath === "" ? "#/" : `#/${routePath.replace(/^\//, "")}`;

  if (lastRouteKey) saveScrollPosition(lastRouteKey);
  markProgrammaticNavigation(isBack);

  const apply = () => {
    if (location.hash !== hash) location.hash = hash;
    else handleRoute();
  };

  if (useTransition && currentView && currentView !== "landing" && currentView !== "africa") {
    await transitionTo(apply, { scrollToTop: !isBack && !routeAnchor });
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
    else if (nav === "africa") active = ["africa", "country", "catchment", "community", "stories"].includes(parts[0]); else active = parts[0] === nav;
    el.classList.toggle("is-active", active);
  });
}

function scrollToAnchor(anchor) {
  if (!anchor) return;
  const run = () => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(run, 80)));
}

function handleRoute() {
  const { parts, anchor: hashAnchor } = parseRoute();
  const routeKey = routeKeyFromParts(parts);
  const targetAnchor = pendingAnchor || hashAnchor;
  pendingAnchor = null;

  if (routeKey === lastRouteKey && currentView && document.getElementById("app")?.innerHTML) {
    if (targetAnchor) scrollToAnchor(targetAnchor);
    return;
  }

  closeSearchModal();

  if (lastRouteKey) saveScrollPosition(lastRouteKey);
  const { restore } = resolveNavigationIntent(routeKey);

  lastRouteKey = routeKey;

  const app = document.getElementById("app");
  destroyHome();
  destroyAfricaIntelligence();
  teardownDashboard();
  destroyCountryHub(app);
  destroyCatchmentHub(app);
  destroyCommunityHub(app);
  destroyScorecard(app);
  destroyInsights();
  destroyStoriesHub();
  const header = document.getElementById("site-header");
  let html = "";
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
    const result = renderCommunityHub(parts[1], parts[2], parts[3], appData);
    html = result.html;
    hub = result.hub;
  } else if (parts[0] === "scorecard") {
    view = "scorecard";
    html = renderScorecard(appData);
  } else if (parts[0] === "about") {
    view = "static";
    html = renderAbout(appData);
  } else if (parts[0] === "insights") {
    view = "insights";
    html = renderInsights(appData);
  } else if (parts[0] === "stories") {
    view = "stories";
    html = renderStoriesHub(appData, parts[1] || null);
  } else if (parts[0] === "resources" || parts[0] === "reports") {
    view = "resources";
    html = renderResources(appData);
  } else if (parts[0] === "search") {
    view = "landing";
    html = renderHome(appData);
    pendingAnchor = null;
    requestAnimationFrame(() => {
      import("./components/search-modal.js").then((m) => m.openSearchModal());
    });
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
  } else if (view === "community" && hub) {
    requestAnimationFrame(() => mountCommunityHub(app, hub));
  } else if (view === "country" && hub) {
    requestAnimationFrame(() => mountCountryHub(app, hub, appData, navigate));
  } else if (view === "scorecard") {
    requestAnimationFrame(() => mountScorecard(app, appData));
  } else if (view === "catchment" && hub) {
    requestAnimationFrame(() => mountCatchmentHub(app, hub, appData, navigate));
  } else if (view === "insights") {
    requestAnimationFrame(() => mountInsights(appData));
  } else if (view === "stories") {
    requestAnimationFrame(() => mountStoriesHub(appData));
  } else if (view === "resources") {
    requestAnimationFrame(() => mountResources(appData));
  }

  bindAnchorScroll(app);
  applyRouteScroll(routeKey, restore && !targetAnchor);
  if (targetAnchor) scrollToAnchor(targetAnchor);
}

function bindGlobalLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href") || "";
      let path = href.replace(/^#\/?/, "");
      let anchor = null;
      const idx = path.indexOf("#");
      if (idx !== -1) {
        anchor = path.slice(idx + 1);
        path = path.slice(0, idx);
      }
      navigate(path || "/", { anchor });
      return;
    }
    const back = e.target.closest("[data-back]");
    if (back) {
      e.preventDefault();
      navigate("/", { isBack: true });
      return;
    }
    const backMap = e.target.closest("[data-back-map]");
    if (backMap) {
      e.preventDefault();
      navigate("africa", { isBack: true, useTransition: false });
      return;
    }
    const backCountry = e.target.closest("[data-back-country]");
    if (backCountry) {
      e.preventDefault();
      const slug = backCountry.dataset.countrySlug;
      if (slug) navigate(`country/${slug}`, { isBack: true, useTransition: false });
      return;
    }
    const backCatchment = e.target.closest("[data-back-catchment]");
    if (backCatchment) {
      e.preventDefault();
      const { countrySlug, catchmentSlug } = backCatchment.dataset;
      if (countrySlug && catchmentSlug) {
        navigate(`catchment/${countrySlug}/${catchmentSlug}`, { isBack: true, useTransition: false });
      }
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
