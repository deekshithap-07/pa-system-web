/**
 * World Bank "Data for Development"–style stories section.
 * Left: heading, CTA, graph pattern, country pills.
 * Right: flip cards with metric data per story.
 */

function boldify(text) {
  return (text || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function getPaCountries(countries) {
  return (countries?.countries || []).filter((c) => c.isPaNetwork);
}

function renderCountryPills(countries, activeSlug = null) {
  return countries
    .map(
      (c) => `<a
        href="#/stories/${c.slug}"
        class="wb-stories__country-pill${activeSlug === c.slug ? " is-active" : ""}"
        data-link
        data-country-pill="${c.slug}"
      >${c.name}</a>`
    )
    .join("");
}

function renderDataFlipCard(story, countryName, countrySlug, index) {
  const card = story.dataCard || {};
  const accent = card.accent || "people";
  const metrics = (story.metricsList || []).slice(0, 4);

  const metricsHtml = metrics
    .map(
      (m) => `<div class="wb-story-flip__metric">
        <span class="wb-story-flip__metric-val">${m.value}</span>
        <span class="wb-story-flip__metric-lbl">${m.label}</span>
      </div>`
    )
    .join("");

  return `
    <article
      class="wb-story-flip wb-story-flip--${accent}"
      data-story-flip
      data-story-id="${story.id}"
      id="${story.slug}"
      data-country-id="${story.countryId}"
      style="--flip-i:${index}"
      tabindex="0"
      role="button"
      aria-label="Flip card: ${story.title}"
    >
      <div class="wb-story-flip__inner">
        <div class="wb-story-flip__front">
          <div class="wb-story-flip__accent" aria-hidden="true"></div>
          <span class="wb-story-flip__category">${card.category || story.program}</span>
          <p class="wb-story-flip__metric">
            <span class="wb-story-flip__metric-num">${card.metric || "—"}</span>
            ${card.metricSuffix ? `<span class="wb-story-flip__metric-unit">${card.metricSuffix}</span>` : ""}
          </p>
          <p class="wb-story-flip__text">${boldify(card.text || story.excerpt)}</p>
          <footer class="wb-story-flip__foot">
            <a href="${card.sourceTarget || `#/stories/${countryName?.toLowerCase()}`}" class="wb-story-flip__source" data-link>
              Source: ${card.source || "PA field tracking"}
            </a>
            <span class="wb-story-flip__share" aria-hidden="true" title="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
          </footer>
        </div>
        <div class="wb-story-flip__back">
          <span class="wb-story-flip__back-tag">${countryName} · ${story.program}</span>
          <h3 class="wb-story-flip__back-title">${story.title}</h3>
          <p class="wb-story-flip__back-excerpt">${story.excerpt}</p>
          <div class="wb-story-flip__back-metrics">${metricsHtml}</div>
          <a href="#/stories/${countrySlug}#${story.slug}" class="wb-story-flip__read" data-link>
            Read full story &rarr;
          </a>
          <p class="wb-story-flip__hint">Click to flip back</p>
        </div>
      </div>
    </article>`;
}

function countrySlugFromId(countries, countryId) {
  const c = (countries?.countries || []).find((x) => x.id === countryId);
  return c?.slug || countryId;
}

export function renderHomeStoriesSection(data, section) {
  const paCountries = getPaCountries(data.countries);
  const featuredIds = section?.featuredStoryIds || [];
  const allStories = data.stories?.stories || [];

  let featured = featuredIds.length
    ? featuredIds.map((id) => allStories.find((s) => s.id === id)).filter(Boolean)
    : allStories.slice(0, 3);

  const countryMap = {};
  paCountries.forEach((c) => {
    countryMap[c.id] = c.name;
  });

  const cards = featured
    .map((s, i) => renderDataFlipCard(s, countryMap[s.countryId] || s.countryId, countrySlugFromId(data.countries, s.countryId), i))
    .join("");

  const pills = renderCountryPills(paCountries);

  return `
    <section class="wb-stories" id="transformation-stories" data-home-stories>
      <div class="container wb-stories__grid">
        <div class="wb-stories__aside" data-reveal>
          <div class="wb-stories__graph" aria-hidden="true">
            <svg class="wb-stories__graph-svg" viewBox="0 0 320 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wb-stories-graph-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#009fda" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#002b5c" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
              <path class="wb-stories__graph-area" d="M0,160 L40,140 L80,150 L120,100 L160,110 L200,60 L240,80 L280,40 L320,70 L320,200 L0,200 Z" fill="url(#wb-stories-graph-grad)"/>
              <polyline class="wb-stories__graph-line" points="0,160 40,140 80,150 120,100 160,110 200,60 240,80 280,40 320,70" fill="none" stroke="#009fda" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <g class="wb-stories__graph-dots">
                <circle cx="40" cy="140" r="4"/><circle cx="80" cy="150" r="4"/><circle cx="120" cy="100" r="4"/>
                <circle cx="160" cy="110" r="4"/><circle cx="200" cy="60" r="4"/><circle cx="240" cy="80" r="4"/>
                <circle cx="280" cy="40" r="5" fill="#009fda"/>
              </g>
            </svg>
          </div>
          <div class="wb-stories__aside-content">
            <p class="wb-stories__eyebrow">Field Stories</p>
            <h2 class="wb-stories__title" id="home-stories-title">
              Real lives, <strong>rewritten.</strong>
            </h2>
            <p class="wb-stories__desc">${section?.description || "Field stories paired with tracked impact data — see exactly where pastor-led transformation is making a measurable difference."}</p>
            <a href="${section?.cta?.target || "#/stories"}" class="wb-stories__cta" data-link>
              ${section?.cta?.label || "Read more stories"}
            </a>
            <div class="wb-stories__countries">
              <p class="wb-stories__countries-label">Explore by country</p>
              <div class="wb-stories__countries-pills" data-country-pills>${pills}</div>
            </div>
          </div>
        </div>
        <div class="wb-stories__cards" data-story-cards data-reveal>
          ${cards}
        </div>
      </div>
    </section>`;
}

export function bindHomeStoriesSection(root = document, data) {
  const section = root.querySelector("[data-home-stories]");
  if (!section) return null;

  const flips = [...section.querySelectorAll("[data-story-flip]")];
  const countries = (data?.countries?.countries || []).filter((c) => c.isPaNetwork);
  const allStories = data?.stories?.stories || [];

  const toggleFlip = (el) => {
    const isFlipped = el.classList.contains("is-flipped");
    flips.forEach((f) => f.classList.remove("is-flipped"));
    if (!isFlipped) el.classList.add("is-flipped");
  };

  const handlers = flips.map((el) => {
    const onClick = (e) => {
      if (e.target.closest("a[data-link]")) return;
      toggleFlip(el);
    };
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip(el);
      }
    };
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
    return { el, onClick, onKey };
  });

  // Country pill filter — swap visible cards without navigation
  const pills = section.querySelectorAll("[data-country-pill]");
  const cardsContainer = section.querySelector("[data-story-cards]");

  const pillHandlers = [...pills].map((pill) => {
    const onPillClick = (e) => {
      // Let data-link navigate to country stories page — also update home cards on hover preview? 
      // User asked for links to new page — navigation handled by router.
      // Optional: filter cards on home when pill clicked without navigating — user said lead to new page, so we navigate.
    };
    return { pill, onPillClick };
  });

  // Animate graph line on scroll
  if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const line = section.querySelector(".wb-stories__graph-line");
    const dots = section.querySelectorAll(".wb-stories__graph-dots circle");
    if (line) {
      const len = line.getTotalLength?.() || 400;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
      gsap.from(dots, {
        opacity: 0,
        scale: 0,
        duration: 0.35,
        stagger: 0.08,
        delay: 0.4,
        ease: "back.out(2)",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
    }

    gsap.from(flips, {
      opacity: 0,
      y: 28,
      duration: 0.55,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: cardsContainer, start: "top 85%", once: true },
    });
  }

  return {
    destroy: () => {
      handlers.forEach(({ el, onClick, onKey }) => {
        el.removeEventListener("click", onClick);
        el.removeEventListener("keydown", onKey);
      });
    },
  };
}

export function getStoriesByCountry(data, countrySlug) {
  const country = (data.countries?.countries || []).find((c) => c.slug === countrySlug);
  if (!country) return { country: null, stories: [] };
  const stories = (data.stories?.stories || []).filter((s) => s.countryId === country.id);
  return { country, stories };
}

export { renderDataFlipCard, boldify, getPaCountries, countrySlugFromId };
