export function renderBreadcrumb(items) {
  return `<nav class="ch-breadcrumb" aria-label="Breadcrumb">
    ${items
      .map((item, i) => {
        if (i === items.length - 1) return `<span aria-current="page">${item.label}</span>`;
        return `<a href="${item.href}" data-link>${item.label}</a><span class="ch-breadcrumb__sep" aria-hidden="true">&gt;</span>`;
      })
      .join("")}
  </nav>`;
}
