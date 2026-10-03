import { getStoryBySlug, getCountryForStory } from "../utils/work-locations.js";
import { programmeIdFor, programmeById, pppFor } from "../components/shared/pa-model.js";

const SAMPLE_TAG = '<span class="pa-sample-tag">Sample</span>';
let stepObserver = null;

/** Need → Response → Implementation → Measurement → Transformation → Learning, built from the story's own narrative. */
function journeySteps(story, data, ctx) {
  const n = story.narrative || {};
  const { programme, ppp, country } = ctx;
  const place = country ? country.name : "the community";
  const caseStudy = (data.knowledgeHub?.caseStudies || []).find((cs) => cs.storySlug === story.slug);

  const measurement = programme
    ? `<p>Recorded under <strong>${programme.title}</strong>${ppp ? ` → <strong>${ppp.name}</strong>` : ""} in ${place}.</p>
       <p class="pa-sample-note">${SAMPLE_TAG} Measured results for this story will come from the PA tracking system once it is connected.</p>`
    : `<p class="pa-sample-note">${SAMPLE_TAG} Measured results for this story will come from the PA tracking system once it is connected.</p>`;

  const learningLinks = [
    caseStudy && `<a href="#/resources#kh-case-studies" data-link><strong>${caseStudy.title}</strong><span>${caseStudy.summary || ""}</span></a>`,
    programme && `<a href="#/program/${programme.id}" data-link><strong>${programme.title}</strong><span>${programme.text}</span></a>`,
    `<a href="#/resources" data-link><strong>Knowledge Hub</strong><span>Reports, research and learning from across PA.</span></a>`,
  ].filter(Boolean);

  return [
    n.intro && { id: "need", label: "The need", ask: "What the community faced", html: `<p>${n.intro}</p>` },
    n.challenge && { id: "response", label: "PA's response", ask: "What PA did", html: `<p>${n.challenge}</p>` },
    n.solution && { id: "implementation", label: "Implementation", ask: "What happened", html: `<p>${n.solution}</p>` },
    { id: "measurement", label: "Measurement", ask: "How it is tracked", html: measurement },
    n.impact && { id: "transformation", label: "Transformation", ask: "What changed", html: `<p>${n.impact}</p>` },
    { id: "learning", label: "Learning", ask: "Where to learn more", html: `<div class="sf-learn">${learningLinks.join("")}</div>` },
  ].filter(Boolean);
}

export function renderStoryFeature(slug, data) {
  const story = getStoryBySlug(data, slug);
  if (!story) return `<div class="container static-page"><h1>Story not found</h1></div>`;
  const country = getCountryForStory(data, story);
  const heroImg = story.image || "";
  const photoClass = heroImg ? "" : ` wb-photo--${(story.slug || "").length % 3}`;
  const photoStyle = heroImg
    ? `style="background-image:linear-gradient(180deg,rgba(61,24,28,.35),rgba(42,16,20,.78)),url('${heroImg}');background-size:cover;background-position:center"`
    : "";

  const programme = programmeById(programmeIdFor(story.program));
  const ppp = programme
    ? pppFor([story.title, story.excerpt, story.narrative?.challenge, story.narrative?.solution].join(" "), programme.id)
    : null;
  const hasNarrative = Boolean(story.narrative?.intro || story.narrative?.solution);
  const steps = hasNarrative ? journeySteps(story, data, { programme, ppp, country }) : [];

  const body = hasNarrative
    ? `<ol class="sf-journey">
        ${steps
          .map(
            (s, i) => `
          <li class="sf-step sf-step--${s.id}" id="sf-step-${s.id}" data-sf-step="${s.id}">
            <span class="sf-step__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            <div class="sf-step__body">
              <p class="sf-step__ask">${s.ask}</p>
              <h2 class="sf-step__label">${s.label}</h2>
              <div class="sf-step__text">${s.html}</div>
            </div>
          </li>`
          )
          .join("")}
      </ol>`
    : (story.body || [story.excerpt]).map((p, i) => `<p class="${i === 0 ? "wb-feature__lead" : ""}">${p}</p>`).join("");

  const glance = [
    country && { k: "Country", v: `<a href="#/country/${country.slug}" data-link>${country.name}</a>` },
    programme && { k: "Program", v: `<a href="#/program/${programme.id}" data-link>${programme.title}</a>` },
    ppp && { k: "PPP", v: ppp.name },
    story.sourceUrl && { k: "Source", v: `<a href="${story.sourceUrl}" target="_blank" rel="noopener">possibilitiesafrica.org</a>` },
  ].filter(Boolean);

  const stepNav = steps.length
    ? `<nav class="sf-steps-nav" aria-label="Story journey">
        <p class="sf-steps-nav__title">The change journey</p>
        <ol>${steps.map((s, i) => `<li><a href="#sf-step-${s.id}" data-sf-nav="${s.id}"><span>${i + 1}</span>${s.label}</a></li>`).join("")}</ol>
      </nav>`
    : "";

  const allStoriesTab = country
    ? `<nav class="story-tabs story-tabs--inline" aria-label="More stories">
        <a href="#/stories/${country.slug}" class="story-tabs__link story-tabs__link--highlight" data-link>All stories from ${country.name}</a>
        <a href="#/stories" class="story-tabs__link" data-link>Stories hub</a>
      </nav>`
    : `<nav class="story-tabs story-tabs--inline" aria-label="More stories">
        <a href="#/stories" class="story-tabs__link story-tabs__link--highlight" data-link>All stories</a>
      </nav>`;

  return `
    <article class="wb-feature sf-page" data-story-feature>
      <div class="wb-feature__hero${photoClass}" ${photoStyle}>
        <div class="container">
          <p class="wb-feature__crumb">
            <a href="#/" data-link>Home</a>
            <span>/</span>
            <a href="#/stories" data-link>Stories</a>
            ${country ? `<span>/</span><a href="#/stories/${country.slug}" data-link>${country.name}</a>` : ""}
            <span>/</span>
            <span>Story</span>
          </p>
          <p class="wb-feature__kicker">${story.program || "Field story"}</p>
          <h1>${story.title}</h1>
          ${story.excerpt ? `<p class="sf-hero__excerpt">${story.excerpt}</p>` : ""}
        </div>
      </div>
      <div class="container wb-feature__layout">
        <aside class="wb-feature__aside sf-aside">
          <div class="sf-glance">
            <h2 class="sf-glance__title">Story at a glance</h2>
            <dl>${glance.map((g) => `<div><dt>${g.k}</dt><dd>${g.v}</dd></div>`).join("")}</dl>
          </div>
          ${stepNav}
        </aside>
        <div class="wb-feature__body">
          ${body}
          ${allStoriesTab}
        </div>
      </div>
    </article>`;
}

export function mountStoryFeature() {
  const page = document.querySelector("[data-story-feature]");
  if (!page) return;
  const steps = page.querySelectorAll("[data-sf-step]");
  const navLinks = page.querySelectorAll("[data-sf-nav]");

  navLinks.forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = page.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );

  if (!("IntersectionObserver" in window) || !steps.length) {
    steps.forEach((s) => s.classList.add("is-in"));
    return;
  }
  stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        const id = entry.target.dataset.sfStep;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.sfNav === id));
      });
    },
    { rootMargin: "-30% 0px -55% 0px" }
  );
  steps.forEach((s) => stepObserver.observe(s));
}

export function destroyStoryFeature() {
  stepObserver?.disconnect();
  stepObserver = null;
}
