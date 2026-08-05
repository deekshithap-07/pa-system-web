export function renderBreadcrumb(countryName) {
  return `<nav class="ch-breadcrumb" aria-label="Breadcrumb">
    <a href="#/" data-link>Africa</a>
    <span class="ch-breadcrumb__sep" aria-hidden="true">&gt;</span>
    <span aria-current="page">${countryName}</span>
  </nav>`;
}
