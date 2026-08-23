/** Newsletter signup on Home (demo only — not part of the site footer). */
export function initFooter() {
  if (document.documentElement.dataset.newsletterBound) return;
  document.documentElement.dataset.newsletterBound = "true";

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-newsletter-form], [data-footer-newsletter-form]");
    if (!form) return;
    e.preventDefault();
    const msg =
      form.querySelector("[data-newsletter-msg], [data-footer-newsletter-msg]") ||
      form.closest("section")?.querySelector("[data-newsletter-msg], [data-footer-newsletter-msg]");
    if (msg) {
      msg.hidden = false;
      form.querySelector("button")?.setAttribute("disabled", "true");
    }
  });
}
