/**
 * Partner contact modal — email / phone / address (no main-site link).
 */

let modalEl = null;
let lastFocus = null;
let escBound = false;

const DEFAULTS = {
  title: "Get in touch",
  email: "karibu@possibilitiesafrica.org",
  phone: "+254 721 238 198",
  address: "P.O. Box: 55604 - 00200\nNairobi, Kenya",
};

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.id = "pa-contact-modal";
  modalEl.className = "pa-contact-modal";
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.innerHTML = `
    <div class="pa-contact-modal__backdrop" data-contact-close tabindex="-1"></div>
    <div class="pa-contact-modal__panel" role="dialog" aria-modal="true" aria-labelledby="pa-contact-modal-title">
      <button type="button" class="pa-contact-modal__close" data-contact-close aria-label="Close">×</button>
      <p class="pa-contact-modal__eyebrow">Contact</p>
      <h2 id="pa-contact-modal-title" class="pa-contact-modal__title">Get in <em>touch.</em></h2>
      <p class="pa-contact-modal__lead">Reach the team directly — partnership enquiries stay on this platform.</p>
      <div class="pa-contact-modal__channels" data-contact-channels></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.querySelectorAll("[data-contact-close]").forEach((el) => {
    el.addEventListener("click", closeContactModal);
  });

  if (!escBound) {
    escBound = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalEl?.classList.contains("is-open")) closeContactModal();
    });
  }

  return modalEl;
}

function channelHtml({ email, phone, address }) {
  const phoneHref = String(phone).replace(/\s/g, "");
  const addressHtml = String(address).replace(/\n/g, "<br>");
  return `
    <div class="pa-contact-modal__channel">
      <span class="pa-contact-modal__label">Email</span>
      <a href="mailto:${email}">${email}</a>
    </div>
    <div class="pa-contact-modal__channel">
      <span class="pa-contact-modal__label">Phone</span>
      <a href="tel:${phoneHref}">${phone}</a>
    </div>
    <div class="pa-contact-modal__channel">
      <span class="pa-contact-modal__label">Address</span>
      <span>${addressHtml}</span>
    </div>
  `;
}

export function openContactModal(opts = {}) {
  const root = ensureModal();
  const email = opts.email || DEFAULTS.email;
  const phone = opts.phone || DEFAULTS.phone;
  const address = opts.address || DEFAULTS.address;
  const channels = root.querySelector("[data-contact-channels]");
  if (channels) channels.innerHTML = channelHtml({ email, phone, address });

  lastFocus = document.activeElement;
  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("pa-contact-modal-open");
  root.querySelector("[data-contact-close]")?.focus?.();
}

export function closeContactModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pa-contact-modal-open");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  lastFocus = null;
}

export function bindPartnerContact(root = document) {
  const btn = root.querySelector("[data-partner-contact]");
  if (!btn) return () => {};

  const onClick = (e) => {
    e.preventDefault();
    openContactModal({
      email: btn.getAttribute("data-email") || "",
      phone: btn.getAttribute("data-phone") || "",
      address: (btn.getAttribute("data-address") || "").replace(/\\n/g, "\n"),
    });
  };

  btn.addEventListener("click", onClick);
  return () => {
    btn.removeEventListener("click", onClick);
    closeContactModal();
  };
}
