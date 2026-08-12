/** Footer newsletter signup (demo — same behaviour as hero strip). */
export function initFooter() {
  const form = document.querySelector("[data-footer-newsletter-form]");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.querySelector("[data-footer-newsletter-msg]");
    if (msg) {
      msg.hidden = false;
      form.querySelector("button")?.setAttribute("disabled", "true");
    }
  });
}
