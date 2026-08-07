const NAV_ITEMS = [
  { id: "ch-overview", label: "Overview" },
  { id: "ch-stories", label: "Stories" },
  { id: "ch-kpi-section", label: "Metrics" },
  { id: "ch-map", label: "Map" },
  { id: "ch-charts", label: "Projects & progress" },
  { id: "ch-reports", label: "Reports & updates" },
];

export function renderCountrySidebar() {
  return `
    <aside class="ch-sidebar" aria-label="Country hub navigation">
      <nav class="ch-sidebar__nav">
        <p class="ch-sidebar__title">Navigate</p>
        <ul>
          ${NAV_ITEMS.map(
            (item) => `<li><a href="#${item.id}" class="ch-sidebar__link" data-ch-nav="${item.id}">${item.label}</a></li>`
          ).join("")}
        </ul>
      </nav>
      <div class="ch-sidebar__footer">
        <button type="button" class="ch-sidebar__back" data-back-map>&larr; Back to Africa map</button>
      </div>
    </aside>`;
}

export function bindCountrySidebar(root) {
  const links = root.querySelectorAll("[data-ch-nav]");
  const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.chNav);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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

export function destroyCountrySidebar(root) {
  root._sidebarObserver?.disconnect();
}
