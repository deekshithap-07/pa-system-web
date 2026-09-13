/** Maroon line + gold italic line — shared PA section title format. */
export function formatPaTitle(section = {}, fallback = "") {
  if (section?.titleHtml) return section.titleHtml;
  const title = String(section?.title || fallback || "").trim();
  if (!title) return "";
  const parts = title.match(/^(.+?[.!?])\s+(.+)$/);
  if (parts) return `<span>${parts[1]}</span> <em>${parts[2]}</em>`;
  return `<span>${title}</span>`;
}
