import { transitionTo } from "./utils/transitions.js";
import {
  saveScrollPosition,
  markProgrammaticNavigation,
  resolveNavigationIntent,
  applyRouteScroll,
} from "./utils/scroll-nav.js";
import { renderHome, mountHome, destroyHome } from "./views/home.js";
import { ensureAfricaMapMounted } from "./components/home-level1.js";
import { renderAfricaIntelligence, mountAfricaIntelligence, destroyAfricaIntelligence } from "./views/africa-intelligence.js";
import { renderCountryData, mountCountryData, destroyCountryData } from "./views/country-data.js";
import { renderCountryHub, mountCountryHub, destroyCountryHub } from "./views/country-hub.js";
import { renderCountryStoriesPage, mountCountryStoriesPage, destroyCountryStoriesPage } from "./views/country-stories.js";
import { renderStoryFeature, mountStoryFeature, destroyStoryFeature } from "./views/story-feature.js";
import { renderCatchmentHub, mountCatchmentHub, destroyCatchmentHub } from "./views/catchment-hub.js";
import { renderCommunityHub, mountCommunityHub, destroyCommunityHub } from "./views/community-hub.js";
import { teardownDashboard } from "./views/dashboard.js";
import { renderScorecard, mountScorecard, destroyScorecard } from "./views/scorecard.js";
import { renderResources, mountResources, destroyResources } from "./views/resources-hub.js";
import { renderFieldReports, mountFieldReports, destroyFieldReports } from "./views/field-reports.js";
import { destroyInsights } from "./views/insights-hub.js";
import { renderAbout, mountAbout, destroyAbout } from "./views/about.js";
import { renderWhatWeDo, mountWhatWeDo, destroyWhatWeDo } from "./views/what-we-do.js";
import { closeSearchModal } from "./components/search-modal.js";
import { closeVideoModal } from "./components/video-modal.js";
import { closeContactModal } from "./components/contact-modal.js";
import { renderStoriesHub, mountStoriesHub, destroyStoriesHub } from "./views/stories-hub.js";
import { renderNewsUpdates, mountNewsUpdates, destroyNewsUpdates } from "./views/news-updates.js";
import { cleanupPageEntry } from "./components/shared/page-entry.js";
import { syncSiteHeader } from "./utils/header.js";

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
    else if (nav === "work") active = parts[0] === "work";
    else if (nav === "africa")
      active = parts[0] === "africa" || parts[0] === "country" || parts[0] === "catchment" || parts[0] === "community" || parts[0] === "story";
    else if (nav === "scorecard") active = parts[0] === "scorecard" || parts[0] === "insights";
    else if (nav === "stories") active = parts[0] === "stories";
    else if (nav === "about") active = parts[0] === "about";
    else if (nav === "resources") active = parts[0] === "resources";
    else active = parts[0] === nav;
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
    if (currentView === "landing" && appData) {
      ensureAfricaMapMounted(appData);
    }
    if (targetAnchor) scrollToAnchor(targetAnchor);
    return;
  }

  closeSearchModal();
  closeVideoModal();
  closeContactModal();
  cleanupPageEntry();
  document.body.classList.remove("pa-entry-active");

  if (lastRouteKey) saveScrollPosition(lastRouteKey);
  const { restore } = resolveNavigationIntent(routeKey);

  lastRouteKey = routeKey;

  const app = document.getElementById("app");
  destroyHome();
  destroyAfricaIntelligence();
  teardownDashboard();
  destroyCountryHub(app);
  destroyCountryData(app);
  destroyCatchmentHub(app);
  destroyCommunityHub(app);
  destroyScorecard(app);
  destroyInsights();
  destroyStoriesHub();
  destroyNewsUpdates();
  destroyResources();
  destroyFieldReports();
  destroyAbout();
  destroyWhatWeDo();
  destroyCountryStoriesPage();
  destroyStoryFeature();
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
    if (parts[1] === "countries") html = renderAfricaIntelligence(appData, "countries");
    else if (parts[1] === "region" && parts[2]) html = renderAfricaIntelligence(appData, "region", parts[2]);
    else if (parts[1] === "how-places-are-grouped") html = renderAfricaIntelligence(appData, "places");
    else html = renderAfricaIntelligence(appData);
  } else if (parts[0] === "story" && parts[1]) {
    view = "story";
    html = renderStoryFeature(parts[1], appData);
  } else if (parts[0] === "country" && parts[1] && parts[2] === "data") {
    view = "country-data";
    const result = renderCountryData(parts[1], appData);
    html = result.html;
    hub = result.hub;
  } else if (parts[0] === "country" && parts[1] && parts[2] === "stories") {
    view = "country-stories";
    html = renderCountryStoriesPage(parts[1], appData);
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
  } else if (parts[0] === "scorecard" || parts[0] === "insights") {
    const tabMap = { outcomes: "working", data: "working", analysis: "together", progress: "journey" };
    if (parts[1] === "countries") {
      location.hash = "#/scorecard";
      return;
    }
    if (targetAnchor?.startsWith("tab-") && tabMap[targetAnchor.slice(4)]) {
      location.hash = `#/scorecard/${tabMap[targetAnchor.slice(4)]}`;
      return;
    }
    view = "scorecard";
    hub = { section: parts[1] || "overview" };
    html = renderScorecard(appData, hub.section);
  } else if (parts[0] === "work") {
    const workRedirects = {
      places: "#/work",
      journey: "#/work#work-journey",
      leadership: "#/work#work-leadership",
      projects: "#/work#work-projects",
    };
    if (parts[1] && workRedirects[parts[1]]) {
      location.hash = workRedirects[parts[1]];
      return;
    }
    view = "work";
    hub = { section: "overview" };
    html = renderWhatWeDo(appData);
  } else if (parts[0] === "about") {
    if (parts[1] === "how-we-work") {
      location.hash = "#/work";
      return;
    }
    if (parts[1] === "journey") {
      location.hash = "#/work#work-journey";
      return;
    }
    view = "static";
    hub = { section: parts[1] || "overview" };
    html = renderAbout(appData, hub.section);
  } else if (parts[0] === "stories") {
    view = "stories";
    html = renderStoriesHub(appData, parts[1] || null);
  } else if (parts[0] === "news") {
    view = "news";
    html = renderNewsUpdates(appData);
  } else if (parts[0] === "field-reports" || parts[0] === "reports") {
    view = "field-reports";
    html = renderFieldReports(appData);
  } else if (parts[0] === "resources") {
    if (targetAnchor === "res-case-studies" || targetAnchor === "res-catalog") {
      location.hash = "#/field-reports";
      return;
    }
    if (parts[1] === "cases" || parts[1] === "field-reports") {
      location.hash = "#/field-reports";
      return;
    }
    if (targetAnchor === "res-packs") {
      location.hash = "#/resources/packs";
      return;
    }
    view = "resources";
    hub = { section: parts[1] || "overview" };
    html = renderResources(appData, hub.section);
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
  syncSiteHeader();

  const runMount = () => {
    if (view === "landing") {
      mountHome(appData);
    } else if (view === "africa") {
      mountAfricaIntelligence(appData, navigate);
    } else if (view === "story") {
      mountStoryFeature();
    } else if (view === "country-stories") {
      mountCountryStoriesPage(app);
    } else if (view === "community" && hub) {
      mountCommunityHub(app, hub);
    } else if (view === "country-data" && hub) {
      mountCountryData(app, hub);
    } else if (view === "country" && hub) {
      mountCountryHub(app, hub, appData, navigate);
    } else if (view === "scorecard") {
      mountScorecard(app, appData, hub?.section || "overview");
    } else if (view === "catchment" && hub) {
      mountCatchmentHub(app, hub, appData, navigate);
    } else if (view === "stories") {
      mountStoriesHub(appData);
    } else if (view === "news") {
      mountNewsUpdates();
    } else if (view === "field-reports") {
      mountFieldReports();
    } else if (view === "resources") {
      mountResources(appData, hub?.section || "overview");
    } else if (view === "work") {
      mountWhatWeDo(app);
    } else if (view === "static") {
      mountAbout(appData, hub?.section || "overview");
    }
  };

  const shouldRestoreScroll = restore && !targetAnchor;

  const finalizeRouteScroll = () => {
    if (targetAnchor) {
      requestAnimationFrame(() => scrollToAnchor(targetAnchor));
      syncSiteHeader();
      return;
    }
    applyRouteScroll(routeKey, shouldRestoreScroll);
    syncSiteHeader();
  };

  requestAnimationFrame(() => {
    runMount();
    finalizeRouteScroll();
  });

  bindAnchorScroll(app);
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
      navigate("/", { isBack: true, useTransition: false, anchor: "home-africa-map" });
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
