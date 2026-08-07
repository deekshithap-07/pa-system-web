const STORAGE_KEY = "pa-africa-nav-revealed";

export function revealAfricaNav() {
  const el = document.querySelector('[data-nav="africa"]');
  if (el) el.hidden = false;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch (_) {
    /* ignore */
  }
}

export function restoreAfricaNav() {
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") revealAfricaNav();
  } catch (_) {
    /* ignore */
  }
}

export function bindAfricaNavTriggers() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-enable-africa-nav]")) revealAfricaNav();
  });
}
