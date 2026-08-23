import { renderWbPageHero } from "./shared/wb-page-hero.js";

/** World Bank homepage hero — spotlight + topic cards (not the main menu). */
export function renderHero(hero) {
  const featured = hero.featured || {};

  return renderWbPageHero({
    id: "home-hero",
    tone: "navy",
    eyebrow: featured.eyebrow || hero.eyebrow || "Possibilities Africa",
    title: featured.title || hero.title,
    lead: featured.description || hero.description,
    actions: [
      { label: hero.primaryCta?.label || "Explore countries", href: hero.primaryCta?.target || "#/africa" },
      {
        label: hero.secondaryCta?.label || "Read field reports",
        href: hero.secondaryCta?.target || "#/resources/cases",
        primary: false,
      },
    ],
    related: [],
    extraClass: "wph--home-stack",
  });
}


/** Deloitte-style site overview — pill tabs + flowing dropdown panels. */
export function renderHomeSiteOverview(overview = {}) {
  const tabs = overview.tabs || [];
  if (!tabs.length) return "";

  const tabButtons = tabs
    .map(
      (tab, i) => `<button
        type="button"
        class="home-explorer__pill${i === 0 ? " is-active" : ""}"
        role="tab"
        id="site-overview-tab-${i}"
        aria-selected="${i === 0 ? "true" : "false"}"
        aria-expanded="${i === 0 ? "true" : "false"}"
        aria-controls="site-overview-panel-${i}"
        data-explorer-tab="${i}"
      >${tab.label}</button>`
    )
    .join("");

  const panels = tabs
    .map((tab, i) => {
      const bullets = (tab.bullets || [])
        .map((item) => `<li>${item}</li>`)
        .join("");
      const highlights = (tab.highlights || [])
        .map(
          (item) => `<article class="home-explorer__card">
            <h4>${item.title}</h4>
            <p>${item.text}</p>
          </article>`
        )
        .join("");
      const cta = tab.cta || {};

      return `<article
        class="home-explorer__panel${i === 0 ? " is-active" : ""}"
        id="site-overview-panel-${i}"
        role="tabpanel"
        aria-labelledby="site-overview-tab-${i}"
        data-explorer-panel="${i}"
        data-panel-id="${tab.id || i}"
        ${i === 0 ? "" : "hidden"}
      >
        <div class="home-explorer__visual home-explorer__visual--${tab.id || i}" aria-hidden="true">
          ${
            tab.image
              ? `<img class="home-explorer__photo" src="${tab.image}" alt="${tab.imageAlt || tab.title || tab.label}" loading="lazy" decoding="async">`
              : ""
          }
          <span class="home-explorer__visual-glow"></span>
          <span class="home-explorer__visual-label">${tab.label}</span>
        </div>
        <div class="home-explorer__copy">
          ${tab.tag ? `<p class="home-explorer__panel-tag">${tab.tag}</p>` : ""}
          <h3 class="home-explorer__panel-title">${tab.title || tab.label}</h3>
          ${tab.lead ? `<p class="home-explorer__panel-lead">${tab.lead}</p>` : ""}
          ${bullets ? `<ul class="home-explorer__list">${bullets}</ul>` : ""}
          ${highlights ? `<div class="home-explorer__cards">${highlights}</div>` : ""}
          ${
            cta.href
              ? `<a href="${cta.href}" class="home-explorer__cta" data-link>Open ${cta.label || tab.label} →</a>`
              : ""
          }
        </div>
      </article>`;
    })
    .join("");

  return `
    <section
      class="home-explorer home-explorer--site home-explorer--deloitte"
      id="site-overview"
      data-home-explorer
      data-auto-rotate="false"
      aria-labelledby="site-overview-title"
    >
      <div class="home-explorer__motion" aria-hidden="true">
        <span class="home-explorer__orb home-explorer__orb--1"></span>
        <span class="home-explorer__orb home-explorer__orb--2"></span>
        <span class="home-explorer__orb home-explorer__orb--3"></span>
      </div>
      <div class="home-explorer__sheet">
        <div class="container">
          <div class="home-explorer__intro-block" data-reveal>
            ${overview.eyebrow ? `<p class="home-explorer__eyebrow">${overview.eyebrow}</p>` : ""}
            ${overview.title ? `<h2 class="home-explorer__title" id="site-overview-title">${overview.title}</h2>` : ""}
            ${overview.lead ? `<p class="home-explorer__intro">${overview.lead}</p>` : ""}
          </div>
          <div class="home-explorer__pills" role="tablist" aria-label="Explore this website" data-reveal>${tabButtons}</div>
          <div class="home-explorer__dropdown is-open" data-explorer-dropdown data-reveal>
            <div class="home-explorer__dropdown-inner">
              <div class="home-explorer__panels">${panels}</div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

let explorerTimer = null;
let explorerResizeObserver = null;

function measureExplorerPanel(panel) {
  if (!panel) return 0;
  const wasHidden = panel.hidden;
  panel.hidden = false;
  panel.style.position = "absolute";
  panel.style.visibility = "hidden";
  panel.style.pointerEvents = "none";
  panel.style.width = "100%";
  const height = panel.offsetHeight;
  panel.style.position = "";
  panel.style.visibility = "";
  panel.style.pointerEvents = "";
  panel.style.width = "";
  panel.hidden = wasHidden;
  return height;
}

function syncExplorerDropdown(section, panel, open = true) {
  const dropdown = section.querySelector("[data-explorer-dropdown]");
  if (!dropdown) return;
  dropdown.classList.toggle("is-open", open);
  if (!open) {
    dropdown.style.height = "0px";
    return;
  }
  const height = measureExplorerPanel(panel);
  dropdown.style.height = `${height}px`;
}

export function bindHomeExplorer(root = document) {
  const section = root.querySelector("[data-home-explorer]");
  if (!section || section.dataset.bound) return;
  section.dataset.bound = "true";

  const isDeloitte = section.classList.contains("home-explorer--deloitte");
  const tabs = [...section.querySelectorAll("[data-explorer-tab]")];
  const panels = [...section.querySelectorAll("[data-explorer-panel]")];
  const dots = [...section.querySelectorAll("[data-explorer-dot]")];
  const progressFill = section.querySelector(".home-explorer__progress-fill");
  const count = tabs.length;
  if (!count) return;

  let index = 0;
  let open = isDeloitte;
  let paused = false;
  const autoRotate = section.dataset.autoRotate !== "false";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalMs = 5500;

  const setStep = (next, { forceOpen } = {}) => {
    const requested = (next + count) % count;

    if (isDeloitte) {
      if (requested === index && open && forceOpen !== true) return;
      index = requested;
      open = forceOpen !== false;
    } else {
      index = requested;
      open = true;
    }

    tabs.forEach((tab, i) => {
      const on = open && i === index;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.setAttribute("aria-expanded", on ? "true" : "false");
    });

    panels.forEach((panel, i) => {
      const on = open && i === index;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });

    dots.forEach((dot, i) => dot.classList.toggle("is-active", open && i === index));

    if (isDeloitte) {
      syncExplorerDropdown(section, panels[index], open);
      return;
    }

    if (progressFill && autoRotate) {
      progressFill.style.animation = "none";
      void progressFill.offsetWidth;
      if (!reducedMotion && !paused) progressFill.style.animation = `home-explorer-progress ${intervalMs}ms linear forwards`;
    }
  };

  const stopTimer = () => {
    if (explorerTimer) {
      clearInterval(explorerTimer);
      explorerTimer = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    if (!autoRotate || reducedMotion || paused || isDeloitte) return;
    if (progressFill) {
      progressFill.style.animation = "none";
      void progressFill.offsetWidth;
      progressFill.style.animation = `home-explorer-progress ${intervalMs}ms linear forwards`;
    }
    explorerTimer = window.setInterval(() => setStep(index + 1, { forceOpen: true }), intervalMs);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      paused = true;
      setStep(Number(tab.dataset.explorerTab));
      stopTimer();
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      paused = true;
      setStep(Number(dot.dataset.explorerDot), { forceOpen: true });
      stopTimer();
    });
  });

  section.addEventListener("mouseenter", () => {
    paused = true;
    stopTimer();
    if (progressFill) progressFill.style.animationPlayState = "paused";
  });

  section.addEventListener("mouseleave", () => {
    if (!autoRotate || isDeloitte) return;
    paused = false;
    startTimer();
  });

  section.addEventListener("focusin", () => {
    paused = true;
    stopTimer();
  });

  if (isDeloitte) {
    const activePanel = panels[index];
    requestAnimationFrame(() => syncExplorerDropdown(section, activePanel, open));
    explorerResizeObserver = new ResizeObserver(() => {
      if (open) syncExplorerDropdown(section, panels[index], true);
    });
    if (activePanel) explorerResizeObserver.observe(activePanel);
    window.addEventListener("resize", () => {
      if (open) syncExplorerDropdown(section, panels[index], true);
    });
  }

  setStep(0, { forceOpen: true });
  if (autoRotate && !isDeloitte) startTimer();
}

export function destroyHomeExplorer() {
  if (explorerTimer) {
    clearInterval(explorerTimer);
    explorerTimer = null;
  }
  explorerResizeObserver?.disconnect();
  explorerResizeObserver = null;
  document.querySelector("[data-home-explorer]")?.removeAttribute("data-bound");
}

/** World Bank–style newsletter band (full width, not in Explore next). */
export function renderHomeKnowledgeBand(section = {}) {
  if (!section.title) return "";

  const cards = (section.cards || [])
    .map(
      (card) => {
        const cta = card.cta || {};
        const href = cta.href || "#";
        const linkAttrs = href.startsWith("#/") ? ` href="${href}" data-link` : ` href="${href}"`;
        return `<article class="wb-knowledge-band__card">
          <h3>${card.title}</h3>
          <p>${card.text || ""}</p>
          <a class="wb-knowledge-band__link"${linkAttrs}>${cta.label || "Learn more"}</a>
        </article>`;
      }
    )
    .join("");

  return `
    <section class="wb-knowledge-band" id="home-knowledge-band" aria-labelledby="home-knowledge-band-title">
      <div class="container wb-knowledge-band__grid">
        <div class="wb-knowledge-band__copy" data-reveal>
          <h2 class="wb-knowledge-band__title" id="home-knowledge-band-title">${section.title}</h2>
          ${section.lead ? `<p class="wb-knowledge-band__lead">${section.lead}</p>` : ""}
          ${cards ? `<div class="wb-knowledge-band__duo">${cards}</div>` : ""}
        </div>
        <div class="wb-knowledge-band__visual" data-reveal>
          <figure class="wb-knowledge-band__portrait">
            <svg class="wb-knowledge-band__ring" viewBox="0 0 420 420" aria-hidden="true" focusable="false">
              <circle cx="210" cy="210" r="188" fill="none" stroke="currentColor" stroke-width="28" stroke-linecap="round" stroke-dasharray="1 14" opacity="0.92"/>
              <circle cx="210" cy="210" r="200" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-dasharray="6 18" opacity="0.45"/>
            </svg>
            ${
              section.image
                ? `<img class="wb-knowledge-band__photo" src="${section.image}" alt="${section.imageAlt || ""}" loading="lazy" decoding="async">`
                : `<div class="wb-knowledge-band__photo wb-knowledge-band__photo--placeholder" role="img" aria-label="${section.imageAlt || "Community in Africa"}"></div>`
            }
          </figure>
        </div>
      </div>
    </section>`;
}

/** Deloitte-style site spotlight — four overview cards with images. */
export function renderHomeSiteSpotlight(section = {}) {
  const cards = section.cards || [];
  if (!cards.length) return "";

  const cardHtml = cards
    .slice(0, 4)
    .map((card, i) => {
      const href = card.href || "#";
      const linkAttrs = href.startsWith("#/") ? ` href="${href}" data-link` : ` href="${href}"`;
      return `<a class="home-spotlight__card" ${linkAttrs} style="--i:${i}">
        <h3 class="home-spotlight__card-title">${card.title}</h3>
        <p class="home-spotlight__card-text">${card.text || ""}</p>
        ${card.tag ? `<span class="home-spotlight__tag">${card.tag}</span>` : ""}
        <span class="home-spotlight__media">
          ${
            card.image
              ? `<img src="${card.image}" alt="${card.imageAlt || card.title || ""}" loading="lazy" decoding="async">`
              : `<span class="home-spotlight__media-fallback" aria-hidden="true"></span>`
          }
        </span>
      </a>`;
    })
    .join("");

  return `
    <section class="home-spotlight" id="home-site-spotlight" aria-labelledby="home-spotlight-title">
      <div class="home-spotlight__bar">
        <div class="container">
          <p class="home-spotlight__eyebrow">${section.eyebrow || "Explore the site"}</p>
        </div>
      </div>
      <div class="container home-spotlight__body">
        ${section.title ? `<h2 class="home-spotlight__title" id="home-spotlight-title" data-reveal>${section.title}</h2>` : ""}
        <div class="home-spotlight__grid" data-reveal>${cardHtml}</div>
      </div>
    </section>`;
}

/** World Bank–style newsletter band (full width, not in Explore next). */
export function renderWbNewsletter() {
  return `
    <section class="wb-subscribe wb-subscribe--home" id="newsletter">
      <div class="container wb-subscribe__inner">
        <div class="wb-subscribe__copy">
          <p class="wb-subscribe__eyebrow">Newsletter</p>
          <h2>Subscribe to our newsletter</h2>
          <p>Get the latest stories and field updates. You can unsubscribe at any time.</p>
        </div>
        <form class="wb-subscribe__form" data-newsletter-form onsubmit="return false">
          <label class="sr-only" for="home-newsletter-email">Email address</label>
          <input id="home-newsletter-email" type="email" name="email" placeholder="Email address" required autocomplete="email">
          <button type="submit">Subscribe</button>
          <p class="wb-subscribe__msg" data-newsletter-msg hidden>Thank you — this is a demo signup only.</p>
        </form>
      </div>
    </section>`;
}

export function bindHeroNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = "true";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg =
        form.querySelector("[data-newsletter-msg]") ||
        form.closest("section")?.querySelector("[data-newsletter-msg]");
      if (msg) {
        msg.hidden = false;
        form.querySelector("button")?.setAttribute("disabled", "true");
      }
    });
  });
}

const IMPACT_ICONS = {
  communities: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/><path d="M16 30c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="18" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 32h24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  households: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/><path d="M24 14l10 8v12H14V22l10-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 34v-6h8v6" stroke="currentColor" stroke-width="1.5"/></svg>`,
  projects: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/><circle cx="24" cy="17" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="28" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="31" cy="28" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M24 20v5M21 26l3 2 3-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

/** World Bank–style impact section — headline + scorecard CTA + 3 icon columns */
export function renderImpactOverview(impact) {
  const pillars = impact.pillars || (impact.kpis || []).slice(0, 3).map((k) => ({
    id: k.id,
    category: k.label,
    value: k.value,
    prefix: k.prefix,
    suffix: k.suffix,
    description: k.label,
    icon: k.id,
    theme: "gold",
  }));

  const statBlocks = pillars
    .map(
      (p) => `<article class="wb-impact-stat wb-impact-stat--${p.theme || "gold"}" data-kpi data-value="${p.value}" data-prefix="${p.prefix || ""}" data-suffix="${p.suffix || ""}">
        <div class="wb-impact-stat__rule" aria-hidden="true"></div>
        <p class="wb-impact-stat__category">${p.category}</p>
        <div class="wb-impact-stat__body">
          <div class="wb-impact-stat__icon" aria-hidden="true">${IMPACT_ICONS[p.icon] || IMPACT_ICONS.communities}</div>
          <div class="wb-impact-stat__text">
            <span class="wb-impact-stat__value">—</span>
            <p class="wb-impact-stat__desc">${p.description}</p>
          </div>
        </div>
      </article>`
    )
    .join("");

  const scorecard = impact.scorecardCta || { label: "See our results", target: "#/scorecard" };
  const scorecardAttrs = scorecard.target?.startsWith("#/")
    ? `href="${scorecard.target}" data-link`
    : `href="${scorecard.target || "#/scorecard"}"`;

  return `
    <section class="wb-impact" id="impact-overview">
      <div class="container">
        <div class="wb-impact__head" data-reveal>
          <div class="wb-impact__head-copy">
            ${impact.eyebrow ? `<p class="wb-impact__eyebrow">${impact.eyebrow}</p>` : ""}
            <h2 class="wb-impact__title">${impact.title || "Measuring our <strong>impact</strong> and progress"}</h2>
            <p class="wb-impact__desc">${impact.description || ""}</p>
          </div>
          <a ${scorecardAttrs} class="wb-impact__scorecard-btn">${scorecard.label || "See our results"}</a>
        </div>
        <div class="wb-impact__grid" data-reveal>${statBlocks}</div>
      </div>
    </section>`;
}

/** World Bank Who We Are–style intro to the main PA website */
export function renderPaWebsiteIntro(section) {
  if (!section) return "";

  const cta = section.cta || {
    label: "Possibilities Africa",
    href: "https://www.possibilitiesafrica.org/",
  };
  const href = cta.href || "https://www.possibilitiesafrica.org/";

  return `
    <section class="wb-pa-intro" id="know-more-about-us">
      <div class="container wb-pa-intro__inner">
        <div class="wb-pa-intro__copy" data-reveal>
          <p class="wb-pa-intro__eyebrow">${section.eyebrow || "Want to know more about us"}</p>
          <blockquote class="wb-pa-intro__quote">${section.quote || "The whole gospel transforming the whole person and whole community."}</blockquote>
          ${section.description ? `<p class="wb-pa-intro__desc">${section.description}</p>` : ""}
          <a href="${href}" class="wb-pa-intro__cta" target="_blank" rel="noopener noreferrer">${cta.label || "Possibilities Africa"}</a>
        </div>
        <div class="wb-pa-intro__visual" data-reveal>
          <div class="wb-pa-intro__image" role="img" aria-label="${section.imageAlt || "Pastor-led transformation across Africa"}"></div>
        </div>
      </div>
    </section>`;
}
