import { renderDataFlipCard, getPaCountries, getStoriesByCountry, countrySlugFromId } from "../components/home-stories-section.js";
import { renderStorySection } from "../components/shared/StoryCards.js";

export function renderStoriesHub(data, countrySlug = null) {
  const paCountries = getPaCountries(data.countries);
  const activeCountry = countrySlug
    ? paCountries.find((c) => c.slug === countrySlug)
    : null;

  const countryPills = paCountries
    .map(
      (c) => `<a
        href="#/stories/${c.slug}"
        class="stories-hub__pill${activeCountry?.slug === c.slug ? " is-active" : ""}"
        data-link
      >${c.name}</a>`
    )
    .join("");

  let body = "";

  if (activeCountry) {
    const { stories } = getStoriesByCountry(data, countrySlug);
    const flipCards = stories
      .map((s, i) => renderDataFlipCard(s, activeCountry.name, activeCountry.slug, i))
      .join("");

    body = `
      <header class="stories-hub__country-hero" data-reveal>
        <p class="eyebrow">Stories of impact</p>
        <h1>${activeCountry.name}</h1>
        <p class="stories-hub__country-desc">
          Field stories from ${activeCountry.name} — each paired with tracked impact metrics from the PA network.
        </p>
        <div class="stories-hub__country-stats">
          ${activeCountry.communities ? `<span><strong>${activeCountry.communities}</strong> communities</span>` : ""}
          ${activeCountry.pastors ? `<span><strong>${activeCountry.pastors}</strong> pastor leaders</span>` : ""}
          ${activeCountry.projects ? `<span><strong>${activeCountry.projects}</strong> active projects</span>` : ""}
          ${activeCountry.growth ? `<span><strong>+${activeCountry.growth}%</strong> network growth</span>` : ""}
        </div>
      </header>
      <div class="stories-hub__flip-grid" data-story-flips data-reveal>${flipCards}</div>
      ${renderStorySection({
        stories,
        communities: data.communities,
        sectionId: "country-stories-full",
        title: "Full stories with impact data",
        description: "Read the narrative behind each metric — expand any story for field context and tracked outcomes.",
      })}
      <div class="stories-hub__actions" data-reveal>
        <a href="#/country/${activeCountry.slug}" class="stories-hub__btn" data-link>View ${activeCountry.name} country hub &rarr;</a>
        <a href="#/" class="stories-hub__btn stories-hub__btn--ghost" data-link>&larr; Back to home</a>
      </div>`;
  } else {
    const allStories = data.stories?.stories || [];
    const featured = allStories.slice(0, 6);
    const cards = featured.map((s, i) => {
      const country = paCountries.find((c) => c.id === s.countryId);
      return renderDataFlipCard(s, country?.name || "", country?.slug || countrySlugFromId(data.countries, s.countryId), i);
    }).join("");

    body = `
      <header class="stories-hub__hero" data-reveal>
        <p class="eyebrow">Transformation stories</p>
        <h1>Stories with data behind them</h1>
        <p class="stories-hub__hero-desc">
          Every story on this platform is paired with field metrics — leadership scores, project counts, and journey stages tracked in real time.
        </p>
      </header>
      <div class="stories-hub__flip-grid stories-hub__flip-grid--wide" data-story-flips data-reveal>${cards}</div>
      <section class="stories-hub__countries-section" data-reveal>
        <h2>Browse by country</h2>
        <p>Select a country to see all field stories and impact data from that network.</p>
        <div class="stories-hub__country-grid">
          ${paCountries.map((c) => {
            const count = allStories.filter((s) => s.countryId === c.id).length;
            return `<a href="#/stories/${c.slug}" class="stories-hub__country-card" data-link>
              <span class="stories-hub__country-card-name">${c.name}</span>
              <span class="stories-hub__country-card-meta">${count} stories · ${c.pastors || 0} pastors</span>
              <span class="stories-hub__country-card-arrow" aria-hidden="true">&rarr;</span>
            </a>`;
          }).join("")}
        </div>
      </section>`;
  }

  return `
    <div class="stories-hub-page">
      <div class="stories-hub__top">
        <div class="container">
          <nav class="stories-hub__nav" aria-label="Country filter">
            <a href="#/stories" class="stories-hub__pill${!activeCountry ? " is-active" : ""}" data-link>All</a>
            ${countryPills}
          </nav>
        </div>
      </div>
      <div class="container stories-hub__body">
        ${body}
      </div>
    </div>`;
}

export function mountStoriesHub(data) {
  requestAnimationFrame(() => {
    bindFlipCards(document);
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

function bindFlipCards(root) {
  const flips = [...root.querySelectorAll("[data-story-flip]")];
  flips.forEach((el) => {
    const onClick = (e) => {
      if (e.target.closest("a[data-link]")) return;
      const isFlipped = el.classList.contains("is-flipped");
      flips.forEach((f) => f.classList.remove("is-flipped"));
      if (!isFlipped) el.classList.add("is-flipped");
    };
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    };
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
  });

  if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.from(root.querySelectorAll(".stories-hub__flip-grid [data-story-flip]"), {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: root.querySelector(".stories-hub__flip-grid"), start: "top 88%", once: true },
    });
  }

  // Scroll to story anchor if hash present
  const hash = location.hash.replace(/^#\/?/, "");
  const anchorIdx = hash.indexOf("#");
  if (anchorIdx !== -1) {
    const anchor = hash.slice(anchorIdx + 1);
    setTimeout(() => {
      const el = document.getElementById(anchor) || document.querySelector(`[data-story-id="${anchor}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }
}

export function destroyStoriesHub() {
  ScrollTrigger?.getAll?.().forEach((t) => {
    if (t.trigger?.closest?.(".stories-hub-page")) t.kill();
  });
}
