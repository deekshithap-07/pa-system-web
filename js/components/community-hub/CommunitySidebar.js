const NAV_ITEMS = [
  { id: "cm-profile", label: "Profile" },
  { id: "cm-projects", label: "Projects & activities" },
  { id: "cm-leadership", label: "Leadership & engagement" },
  { id: "cm-progress", label: "Progress indicators" },
];

export function renderCommunitySidebar(countrySlug, catchmentSlug) {
  return `
    <aside class="ch-sidebar" aria-label="Community hub navigation">
      <nav class="ch-sidebar__nav">
        <p class="ch-sidebar__title">Navigate</p>
        <ul>
          ${NAV_ITEMS.map(
            (item) =>
              `<li><a href="#${item.id}" class="ch-sidebar__link" data-ch-nav="${item.id}">${item.label}</a></li>`
          ).join("")}
        </ul>
      </nav>
      <div class="ch-sidebar__footer">
        <button type="button" class="ch-sidebar__back" data-back-catchment data-country-slug="${countrySlug}" data-catchment-slug="${catchmentSlug}">&larr; Back to catchment</button>
      </div>
    </aside>`;
}

export function bindCommunitySidebar(root) {
  const links = root.querySelectorAll("[data-ch-nav]");
  const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(link.dataset.chNav)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

export function destroyCommunitySidebar(root) {
  root._sidebarObserver?.disconnect();
}
