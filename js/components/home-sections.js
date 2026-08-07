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

/** World Bank hero — featured spotlight + “More top stories” strip */
export function renderHero(hero, data) {
  const featured = hero.featured || {};
  const topStories = hero.topStories || [];

  const storyCards = topStories.map(renderTopStoryCard).join("");

  const primaryTarget = featured.cta?.target || hero.primaryCta?.target || "#home-africa-map";
  const primaryLinkAttrs = primaryTarget.startsWith("#/")
    ? `href="${primaryTarget}" data-link`
    : `href="${primaryTarget}"`;

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
          <a ${primaryLinkAttrs} class="wb-hero__spotlight-cta">
            ${featured.cta?.label || hero.primaryCta?.label || "Explore Africa"}
          </a>
        </div>
      </div>
      <div class="wb-hero__stories-bar">
        <div class="container wb-hero__stories-inner">
          <p class="wb-hero__stories-label">More top stories</p>
          <div class="wb-hero__stories-grid">${storyCards}</div>
        </div>
      </div>
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

/** World Bank “Data for Development” — large stat callouts */
export function renderImpactOverview(impact) {
  const kpis = (impact.kpis || []).slice(0, 6);
  const statBlocks = kpis
    .map(
      (k, i) => `<article class="wb-data-stat" data-kpi data-value="${k.value}" data-prefix="${k.prefix || ""}" data-suffix="${k.suffix || ""}" style="--stat-i:${i}">
        <span class="wb-data-stat__value">—</span>
        <p class="wb-data-stat__label">${k.label}</p>
      </article>`
    )
    .join("");

  return `
    <section class="wb-data-section" id="impact-overview">
      <div class="container">
        <header class="wb-data-section__head" data-reveal>
          <p class="eyebrow wb-data-section__eyebrow">${impact.eyebrow || "Data for transformation"}</p>
          <h2>${impact.title}</h2>
          <p>${impact.description}</p>
        </header>
        <div class="wb-data-section__stats" data-reveal>${statBlocks}</div>
        <div class="wb-data-section__foot" data-reveal>
          ${impact.scorecardCta ? `<a href="${impact.scorecardCta.target}" class="wb-hero__spotlight-cta wb-hero__spotlight-cta--sm" data-link>${impact.scorecardCta.label}</a>` : ""}
          ${impact.dataCta ? `<a href="${impact.dataCta.target}" class="wb-data-section__link" data-link>${impact.dataCta.label} &rarr;</a>` : ""}
          ${impact.modelLink ? `<a href="${impact.modelLink.target}" class="wb-data-section__link" data-link>${impact.modelLink.label} &rarr;</a>` : ""}
        </div>
      </div>
    </section>`;
}
