import { renderDataFlipCard, getPaCountries, getStoriesByCountry, countrySlugFromId } from "../components/home-stories-section.js";
import { renderStorySection } from "../components/shared/StoryCards.js";
import { renderWbPageHero, bindWbPageHero } from "../components/shared/wb-page-hero.js";

export function renderStoriesHub(data, countrySlug = null) {
  const paCountries = getPaCountries(data.countries);
  const activeCountry = countrySlug
    ? paCountries.find((c) => c.slug === countrySlug)
    : null;
  const allStories = data.stories?.stories || [];

  const countryPills = paCountries
    .map(
      (c) => `<a
        href="#/stories/${c.slug}"
        class="stories-hub__pill${activeCountry?.slug === c.slug ? " is-active" : ""}"
        data-link
      >${c.name}</a>`
    )
    .join("");

  const hero = activeCountry
    ? renderWbPageHero({
        id: "stories-hero",
        tone: "gold",
        skin: "ink",
        flush: true,
        crumbs: [
          { label: "Home", href: "#/" },
          { label: "Stories", href: "#/stories" },
          { label: activeCountry.name },
        ],
        eyebrow: "Results stories",
        title: activeCountry.name,
        lead: `Stories from ${activeCountry.name} — people first, with simple results beside them.`,
        actions: [
          { label: `Open the ${activeCountry.name} chapter`, href: `#/country/${activeCountry.slug}` },
          { label: "All stories", href: "#/stories", primary: false },
        ],
        chapterNext: { kicker: "Country hub", title: `Continue in ${activeCountry.name}`, href: `#/country/${activeCountry.slug}` },
      })
    : renderWbPageHero({
        id: "stories-hero",
        tone: "gold",
        skin: "ink",
        flush: true,
        crumbs: [{ label: "Home", href: "#/" }, { label: "Stories" }],
        eyebrow: "Results stories",
        title: "Stories with results beside them",
        lead: "Every story here sits next to simple facts — leadership, projects, and how far a community has come. People first. Evidence beside them.",
        actions: [
          { label: "Kenya stories", href: "#/stories/kenya" },
          { label: "Case studies", href: "#/resources/cases", primary: false },
        ],
      });

  const spotlight = !activeCountry
    ? `<section class="sx-essay" data-story-reveal>
        <div class="container sx-essay__inner">
          <div class="sx-essay__copy">
            <p class="sx-essay__kicker">Featured from the field</p>
            <h2>Three dispatches to start with</h2>
            <ol class="wph-toc">${allStories
              .slice(0, 3)
              .map((s, i) => {
                const country = paCountries.find((c) => c.id === s.countryId);
                const href = country ? `#/stories/${country.slug}` : "#/stories";
                return `<li><a href="${href}" data-link><span class="wph-toc__n">0${i + 1}</span>${s.title}</a></li>`;
              })
              .join("")}</ol>
          </div>
          <blockquote class="sx-essay__pull">People first. Evidence beside them. That is how PA tells the story of transformation.</blockquote>
        </div>
      </section>`
    : "";

  let body = "";

  if (activeCountry) {
    const { stories } = getStoriesByCountry(data, countrySlug);
    const flipCards = stories
      .map((s, i) => renderDataFlipCard(s, activeCountry.name, activeCountry.slug, i))
      .join("");

    body = `
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
    const featured = allStories.slice(0, 6);
    const cards = featured.map((s, i) => {
      const country = paCountries.find((c) => c.id === s.countryId);
      return renderDataFlipCard(s, country?.name || "", country?.slug || countrySlugFromId(data.countries, s.countryId), i);
    }).join("");

    body = `
      <div class="stories-hub__flip-grid stories-hub__flip-grid--wide" data-story-flips data-reveal>${cards}</div>
      <section class="stories-hub__countries-section" data-reveal>
        <h2>Where we work</h2>
        <p>Pick a country to read stories from that place.</p>
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
      ${hero}
      ${spotlight}
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
    bindWbPageHero(document.querySelector(".stories-hub-page") || document);
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
