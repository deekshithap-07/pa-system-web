const NAV_ITEMS = [
  { id: "cth-overview", label: "Overview" },
  { id: "cth-summary", label: "Summary" },
  { id: "cth-map", label: "Map" },
  { id: "cth-charts", label: "Growth" },
  { id: "cth-communities", label: "Communities" },
  { id: "cth-activity", label: "Activity" },
  { id: "cth-reports", label: "Reports" },
  { id: "cth-stories", label: "Stories" },
  { id: "cth-insights", label: "Insights" },
];

export function renderCatchmentSidebar(countrySlug) {
  return `
    <aside class="ch-sidebar" aria-label="Catchment hub navigation">
      <div id="context-map-root" class="ch-sidebar__context-map"></div>
      <nav class="ch-sidebar__nav">
        <p class="ch-sidebar__title">Navigate</p>
        <ul>${NAV_ITEMS.map((i) => `<li><a href="#${i.id}" class="ch-sidebar__link" data-ch-nav="${i.id}">${i.label}</a></li>`).join("")}</ul>
      </nav>
      <div class="ch-sidebar__footer">
        <button type="button" class="ch-sidebar__back" data-back-country data-country-slug="${countrySlug}">&larr; Back to country</button>
      </div>
    </aside>`;
}

export function bindCatchmentSidebar(root, countrySlug) {
  const links = root.querySelectorAll("[data-ch-nav]");
  const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(link.dataset.chNav)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  root.querySelector("[data-back-country]")?.addEventListener("click", () => {
    location.hash = `#/country/${countrySlug}`;
  });

  if (!sections.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.toggle("is-active", l.dataset.chNav === entry.target.id));
        }
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
  root._sidebarObserver = observer;
}

export function destroyCatchmentSidebar(root) {
  root._sidebarObserver?.disconnect();
}
