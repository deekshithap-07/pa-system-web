function renderTopStoryCard(item) {
  if (item.isNewsletter) {
    return `
      <article class="wb-topstory wb-topstory--newsletter" data-newsletter-card>
        <div class="wb-topstory__thumb wb-topstory__thumb--newsletter" aria-hidden="true">
          <span>✉</span>
        </div>
        <div class="wb-topstory__body">
          <span class="wb-topstory__tag">NEWSLETTER</span>
          <h3>${item.title}</h3>
          <form class="wb-topstory__subscribe" data-newsletter-form onsubmit="return false">
            <input type="email" placeholder="Email address" aria-label="Email for newsletter" required>
            <button type="submit" class="wb-topstory__subscribe-btn">Subscribe</button>
          </form>
          <p class="wb-topstory__newsletter-msg" data-newsletter-msg hidden>Thank you — demo signup only.</p>
        </div>
      </article>`;
  }

  const href = item.href || "#";
  const linkAttrs = href.startsWith("#/") ? `href="${href}" data-link` : `href="${href}"`;

  return `
    <a ${linkAttrs} class="wb-topstory">
      <div class="wb-topstory__thumb wb-topstory__thumb--${item.theme || "default"}" aria-hidden="true"></div>
      <div class="wb-topstory__body">
        <span class="wb-topstory__tag">${item.type}</span>
        <h3>${item.title}</h3>
      </div>
    </a>`;
}

/** World Bank hero — featured spotlight + newsletter strip */
export function renderHero(hero) {
  const featured = hero.featured || {};
  const newsletterItems = (hero.topStories || []).filter((item) => item.isNewsletter);
  const storyCards = newsletterItems.map(renderTopStoryCard).join("");

  return `
    <section class="wb-hero" id="home-hero">
      <div class="wb-hero__spotlight">
        <div class="wb-hero__spotlight-bg" aria-hidden="true"></div>
        <div class="container wb-hero__spotlight-inner" data-reveal>
          <div class="wb-hero__spotlight-copy">
            <p class="wb-hero__spotlight-eyebrow">${featured.eyebrow || hero.eyebrow || "Possibilities Africa"}</p>
            <h1 class="wb-hero__spotlight-title">${featured.title || hero.title}</h1>
            <p class="wb-hero__spotlight-desc">${featured.description || hero.description}</p>
          </div>
        </div>
      </div>
      ${
        storyCards
          ? `<div class="wb-hero__stories-bar">
        <div class="container wb-hero__stories-inner">
          <div class="wb-hero__stories-grid wb-hero__stories-grid--newsletter">${storyCards}</div>
        </div>
      </div>`
          : ""
      }
    </section>`;
}

export function bindHeroNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const card = form.closest("[data-newsletter-card]");
      const msg = card?.querySelector("[data-newsletter-msg]");
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

  const scorecard = impact.scorecardCta || { label: "See the Scorecard", target: "#/scorecard" };
  const scorecardAttrs = scorecard.target?.startsWith("#/")
    ? `href="${scorecard.target}" data-link`
    : `href="${scorecard.target || "#/scorecard"}"`;

  return `
    <section class="wb-impact" id="impact-overview">
      <div class="container">
        <div class="wb-impact__head" data-reveal>
          <div class="wb-impact__head-copy">
            <h2 class="wb-impact__title">${impact.title || "Measuring our <strong>impact</strong> and progress"}</h2>
            <p class="wb-impact__desc">${impact.description || ""}</p>
          </div>
          <a ${scorecardAttrs} class="wb-impact__scorecard-btn">${scorecard.label || "See the Scorecard"}</a>
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
