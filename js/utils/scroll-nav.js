/**
 * Per-route scroll positions — forward nav starts at top; back nav restores prior scroll.
 */

const scrollByRoute = new Map();
const routeStack = [];
let restoreOnNextRoute = false;
let programmaticNav = false;

export function saveScrollPosition(routeKey) {
  if (!routeKey) return;
  scrollByRoute.set(routeKey, window.scrollY);
}

export function markProgrammaticNavigation(isBack = false) {
  programmaticNav = true;
  restoreOnNextRoute = isBack;
}

export function resolveNavigationIntent(routeKey) {
  if (programmaticNav) {
    programmaticNav = false;
    if (restoreOnNextRoute) {
      const idx = routeStack.lastIndexOf(routeKey);
      if (idx >= 0) routeStack.length = idx + 1;
      else routeStack.push(routeKey);
      return { restore: true };
    }
    if (routeStack[routeStack.length - 1] !== routeKey) routeStack.push(routeKey);
    return { restore: false };
  }

  const idx = routeStack.lastIndexOf(routeKey);
  const isBack = idx >= 0 && idx < routeStack.length - 1;
  if (isBack) {
    routeStack.length = idx + 1;
    return { restore: true };
  }
  if (routeStack[routeStack.length - 1] !== routeKey) routeStack.push(routeKey);
  return { restore: false };
}

export function shouldRestoreScroll() {
  return restoreOnNextRoute;
}

export function getSavedScroll(routeKey) {
  return scrollByRoute.get(routeKey);
}

export function clearRestoreFlag() {
  restoreOnNextRoute = false;
}

export function applyRouteScroll(routeKey, restore) {
  const savedY = restore ? scrollByRoute.get(routeKey) : null;

  const run = () => {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    if (restore && savedY != null && savedY > 0) {
      window.scrollTo(0, savedY);
    } else {
      window.scrollTo(0, 0);
    }
    clearRestoreFlag();
  };

  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(run, 0)));
}
