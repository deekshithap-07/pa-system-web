/** Light bar stays; colour logo stays. Scroll only firms the bar, as on the main PA site. */

export function syncSiteHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  header.classList.remove("site-header--over-hero");
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

export function initHeader() {
  window.addEventListener("scroll", syncSiteHeader, { passive: true });
  window.addEventListener("resize", syncSiteHeader);
  syncSiteHeader();
}
