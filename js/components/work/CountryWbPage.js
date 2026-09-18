/**
 * Country hub — “field spotlight” layout (unique to country pages).
 * Not cards: spotlight reel, metric ribbon, index rail, story river, ledger.
 */

import { formatNumber } from "../../utils/format.js";
import { numberCardsFromHub, storiesForCountry } from "../../utils/work-locations.js";

function storyHref(story) {
  return `#/story/${story.slug}`;
}

function storyHeroImage(story, hub) {
  return hub?.heroStoryImages?.[story.id] || story.image;
}

export function featuredStories(data, hub) {
  const fromHub = hub.stories || [];
  if (fromHub.length) return fromHub;
  return storiesForCountry(data, hub.country?.id);
}

function kpiVal(hub, id) {
  return hub.kpis?.find((k) => k.id === id)?.value;
}

function insight(hub, id) {
  return (hub.insights || []).find((i) => i.id === id);
}

function overviewTabs(hub) {
  const name = hub.countryName;
  const communities = kpiVal(hub, "communities") ?? hub.country?.communities ?? 0;
  const pastors = kpiVal(hub, "pastors") ?? hub.country?.pastors ?? 0;
  const catchments = hub.catchments || [];
  const growth = kpiVal(hub, "growth");
  const live = insight(hub, "livelihood");
  const agri = insight(hub, "agriculture");
  const water = insight(hub, "water");
  const edu = insight(hub, "education");
  const health = insight(hub, "health");
  const lead = insight(hub, "leadership");
  const comm = insight(hub, "community");
  const placeNames = catchments.map((c) => c.name).filter(Boolean);
  const placeLine = placeNames.length
    ? placeNames.length > 1
      ? `${placeNames.slice(0, -1).join(", ")}, and ${placeNames.at(-1)}`
      : placeNames[0]
    : "neighbouring communities";

  const aboutTeaser = hub.overview || hub.description || `Pastor-led work is underway in ${name}.`;
  const aboutMore = [
    hub.description && hub.description !== aboutTeaser ? hub.description : "",
    `The work is grouped simply: the country, then a small cluster of nearby communities, then one community. ${formatNumber(communities)} communities and ${formatNumber(pastors)} pastors are on this journey${growth != null ? `, with ${growth}% growth year on year` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    { id: "about", label: "About", teaser: aboutTeaser, more: aboutMore },
    {
      id: "livelihood",
      label: "Livelihood",
      teaser:
        live?.summary ||
        agri?.summary ||
        `Households in ${name} grow income through farming groups, skills, and local enterprise — usually after pastors and faith groups are in place.`,
      more: [agri?.summary, water?.summary, live?.metric ? `Field tracking notes ${live.metric}.` : ""]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "development",
      label: "Development",
      teaser:
        comm?.summary ||
        `Daily life in ${name} is changing through water, farming, health, and schools — led by local churches, not by a list of projects dropped in from outside.`,
      more: [water?.summary, edu?.summary, health?.summary, insight(hub, "climate")?.summary]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "partnership",
      label: "Partnership",
      teaser:
        lead?.summary ||
        `Possibilities Africa walks with local pastors in ${name} for two years so faith, families, and daily life grow together.`,
      more: `Pastors coordinate the work in ${placeLine}. Nearby groups of 3–5 communities share training and support, then each community keeps its own story and figures.`,
    },
    {
      id: "results",
      label: "Results",
      teaser: `${name} currently reports ${formatNumber(communities)} communities and ${formatNumber(pastors)} pastors${growth != null ? `, with ${growth}% growth` : ""}. These figures sit beside the stories on this page — they do not replace visiting a community.`,
      more: `${kpiVal(hub, "ppp") != null ? `${kpiVal(hub, "ppp")} partnership projects and ` : ""}${kpiVal(hub, "chips") != null ? `${kpiVal(hub, "chips")} household income groups are tracked. ` : ""}Open a nearby group below to see the people behind the totals.`,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      teaser: `A short view of ${name}: ${formatNumber(communities)} communities, ${catchments.length || kpiVal(hub, "catchments") || 0} nearby groups, ${formatNumber(pastors)} pastors.`,
      more: `For charts across all seven countries, open Our results under What we do. For one place, open a nearby group or a community on this country page.`,
    },
  ];
}

/** Spotlight story reel — full-bleed active story + peek strips (no cards). */
export function renderCountryStoryHero(hub, stories = []) {
  const list = (stories.length ? stories : hub.stories || []).slice(0, 4);
  const allHref = `#/country/${hub.country?.slug || ""}/stories`;

  if (!list.length) {
    return `
      <section class="cp-mast" data-cp-section="mast" aria-label="${hub.countryName}">
        <div class="container cp-mast__inner" data-cp-reveal>
          <p class="cp-kicker">${hub.heroTagline || "Where we work"}</p>
          <h1 class="cp-mast__name">${hub.countryName}</h1>
          <p class="cp-mast__intro">${hub.description || hub.overview || ""}</p>
        </div>
      </section>`;
  }

  const panels = list
    .map((s, i) => {
      const src = storyHeroImage(s, hub);
      return `
        <article class="cp-reel__panel${i === 0 ? " is-active" : ""}" data-cp-panel="${i}">
          <a class="cp-reel__hit" href="${storyHref(s)}" data-link aria-label="${s.title}">
            <span class="cp-reel__photo" aria-hidden="true">${src ? `<img src="${src}" alt="" loading="${i === 0 ? "eager" : "lazy"}" decoding="async">` : ""}</span>
            <span class="cp-reel__veil" aria-hidden="true"></span>
            <span class="cp-reel__copy">
              <span class="cp-kicker cp-kicker--light">${s.program || hub.countryName}</span>
              <strong class="cp-reel__title">${s.title}</strong>
              ${s.excerpt ? `<span class="cp-reel__excerpt">${s.excerpt}</span>` : ""}
              <span class="cp-reel__go">Read the story →</span>
            </span>
          </a>
        </article>`;
    })
    .join("");

  const peeks = list
    .map(
      (s, i) => `
      <button type="button" class="cp-reel__peek${i === 0 ? " is-active" : ""}" data-cp-peek="${i}" aria-pressed="${i === 0 ? "true" : "false"}">
        <span class="cp-reel__peek-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="cp-reel__peek-label">${s.title}</span>
      </button>`
    )
    .join("");

  return `
    <section class="cp-mast" data-cp-section="mast" aria-label="Stories from ${hub.countryName}">
      <div class="container cp-mast__bar" data-cp-reveal>
        <div>
          <p class="cp-kicker">${hub.heroTagline || "PA Network"}</p>
          <h1 class="cp-mast__name">${hub.countryName}</h1>
        </div>
        <a class="cp-text-link" href="${allHref}" data-link>All stories →</a>
      </div>
      <div class="cp-reel" data-cp-reel>
        <div class="cp-reel__stage">${panels}</div>
        <div class="cp-reel__peeks" role="tablist" aria-label="Featured stories">${peeks}</div>
      </div>
    </section>`;
}

/** Metric ribbon — continuous strip, not chart cards. */
export function renderByTheNumbers(hub) {
  const cards = numberCardsFromHub(hub);
  if (!cards.length) return "";

  const items = cards
    .map(
      (c, i) => `
      <article class="cp-ribbon__item" data-cp-ribbon-item style="--i:${i}">
        <div class="cp-ribbon__meta">
          <a href="${c.titleHref || "#/scorecard"}" class="cp-ribbon__label" data-link>${c.title}</a>
          <p class="cp-ribbon__sub">${c.subtitle || ""}</p>
        </div>
        <div class="cp-ribbon__chart">
          <canvas data-wb-num="${c.key}" aria-hidden="true"></canvas>
          ${c.center ? `<span class="cp-ribbon__center">${c.center}</span>` : ""}
        </div>
      </article>`
    )
    .join("");

  return `
    <section class="cp-ribbon" data-cp-section="numbers" data-wb-numbers aria-labelledby="cp-numbers-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">By the numbers</p>
          <h2 id="cp-numbers-title" class="cp-sec-title">${hub.countryName} in figures</h2>
          <a href="#/scorecard" class="cp-text-link" data-link>Explore Impact &amp; Data →</a>
        </header>
        <div class="cp-ribbon__row">
          <div class="cp-ribbon__track" data-num-track>${items}</div>
          <div class="cp-ribbon__arrows">
            <button type="button" class="cp-arrow" data-num-prev aria-label="Previous">‹</button>
            <button type="button" class="cp-arrow" data-num-next aria-label="Next">›</button>
          </div>
        </div>
      </div>
    </section>`;
}

/** Overview — vertical index rail + wash panel (hover/click). */
export function renderCountryOverview(hub) {
  const tabs = overviewTabs(hub);
  return `
    <section class="cp-index" id="overview" data-cp-section="overview" aria-labelledby="cp-overview-title">
      <div class="container cp-index__wrap">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Overview</p>
          <h2 id="cp-overview-title" class="cp-sec-title">Inside ${hub.countryName}</h2>
        </header>
        <div class="cp-index__body" data-cp-index>
          <div class="cp-index__rail" role="tablist" aria-label="Overview of ${hub.countryName}">
            ${tabs
              .map(
                (t, i) => `<button
                  type="button"
                  class="cp-index__tab${i === 0 ? " is-active" : ""}"
                  role="tab"
                  id="ov-tab-${t.id}"
                  aria-selected="${i === 0 ? "true" : "false"}"
                  aria-controls="tab-${t.id}"
                  data-ov-tab="${t.id}"
                ><span>${t.label}</span></button>`
              )
              .join("")}
          </div>
          <div class="cp-index__panels">
            ${tabs
              .map((t, i) => {
                const more = (t.more || "").trim();
                const extraHtml =
                  t.id === "dashboard"
                    ? `<p>${more.replace(
                        "open Our results",
                        `<a href="#/scorecard" data-link>open Impact &amp; Data</a>`
                      )}</p>`
                    : `<p>${more}</p>`;
                return `
                <div
                  class="cp-index__panel${i === 0 ? " is-active" : ""}"
                  id="tab-${t.id}"
                  role="tabpanel"
                  data-ov-panel="${t.id}"
                  ${i === 0 ? "" : "hidden"}
                >
                  <p class="cp-index__teaser">${t.teaser}</p>
                  ${more ? `<div class="cp-index__extra" data-ov-extra hidden>${extraHtml}</div>` : ""}
                  ${
                    more
                      ? `<button type="button" class="cp-index__more" data-ov-more aria-expanded="false">
                          <span data-ov-more-label>Read more</span>
                        </button>`
                      : ""
                  }
                </div>`;
              })
              .join("")}
          </div>
        </div>
      </div>
    </section>`;
}

/** Latest stories — alternating river bands. */
export function renderCountryLatest(hub, stories) {
  const all = stories || hub.stories || [];
  if (all.length <= 3) return "";
  const list = all.slice(3, 6);
  if (!list.length) return "";
  const allHref = `#/country/${hub.country.slug}/stories`;

  const bands = list
    .map((s, i) => {
      const src = storyHeroImage(s, hub) || s.image;
      return `
        <a class="cp-river__band${i % 2 ? " cp-river__band--flip" : ""}" href="${storyHref(s)}" data-link data-cp-river-band>
          <span class="cp-river__shot" aria-hidden="true">${src ? `<img src="${src}" alt="" loading="lazy" decoding="async">` : ""}</span>
          <span class="cp-river__copy">
            <span class="cp-kicker">${s.program || "Story"}</span>
            <strong class="cp-river__title">${s.title}</strong>
            <span class="cp-river__go">Read the story →</span>
          </span>
        </a>`;
    })
    .join("");

  return `
    <section class="cp-river" data-cp-section="latest" aria-labelledby="cp-latest-title">
      <div class="container">
        <header class="cp-sec-head cp-sec-head--row" data-cp-reveal>
          <div>
            <p class="cp-kicker">More from the field</p>
            <h2 id="cp-latest-title" class="cp-sec-title">The latest from ${hub.countryName}</h2>
            <p class="cp-sec-lead">Stories from pastors and communities in this country.</p>
          </div>
          <a href="${allHref}" class="cp-text-link" data-link>See all stories →</a>
        </header>
        <div class="cp-river__list">${bands}</div>
      </div>
    </section>`;
}

/** Projects — dual ledger lists. */
export function renderCountryProjects(hub) {
  const reports = hub.reports || [];
  const catchments = hub.catchments || [];
  return `
    <section class="cp-ledger" data-cp-section="projects" aria-labelledby="cp-projects-title">
      <div class="container">
        <header class="cp-sec-head" data-cp-reveal>
          <p class="cp-kicker">Projects &amp; results</p>
          <h2 id="cp-projects-title" class="cp-sec-title">Nearby groups and reports</h2>
          <p class="cp-sec-lead">Clusters of communities, and reports from this country.</p>
        </header>
        <div class="cp-ledger__grid">
          <div class="cp-ledger__col" data-cp-reveal>
            <h3 class="cp-ledger__heading">Nearby groups</h3>
            ${
              catchments.length
                ? `<ul class="cp-ledger__list">${catchments
                    .map(
                      (c) => `<li>
                        <a href="#/catchment/${hub.country.slug}/${c.slug}" class="cp-ledger__row" data-link>
                          <strong>${c.name}</strong>
                          <span>${c.region || "Open communities"}</span>
                        </a>
                      </li>`
                    )
                    .join("")}</ul>`
                : `<p class="cp-ledger__empty">Groups will appear as the work grows.</p>`
            }
          </div>
          <div class="cp-ledger__col" data-cp-reveal>
            <h3 class="cp-ledger__heading">Reports</h3>
            ${
              reports.length
                ? `<ul class="cp-ledger__list">${reports
                    .map(
                      (r) => `<li>
                        <a href="#/field-reports" class="cp-ledger__row" data-link>
                          <strong>${r.title}</strong>
                          <span>${r.summary || r.period || ""}</span>
                        </a>
                      </li>`
                    )
                    .join("")}</ul>`
                : `<p class="cp-ledger__empty">Reports for this country will appear here.</p>`
            }
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCountryStoryHero(root) {
  const reel = root.querySelector("[data-cp-reel]");
  if (!reel) return;

  const panels = [...reel.querySelectorAll("[data-cp-panel]")];
  const peeks = [...reel.querySelectorAll("[data-cp-peek]")];
  if (!panels.length) return;

  const activate = (i) => {
    panels.forEach((p, n) => p.classList.toggle("is-active", n === i));
    peeks.forEach((p, n) => {
      const on = n === i;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  peeks.forEach((peek) => {
    const i = Number(peek.dataset.cpPeek);
    peek.addEventListener("mouseenter", () => activate(i));
    peek.addEventListener("focus", () => activate(i));
    peek.addEventListener("click", (e) => {
      e.preventDefault();
      activate(i);
    });
  });
}

export function bindNumbersCarousel(root) {
  const track = root.querySelector("[data-num-track]");
  if (!track) return;
  const prev = root.querySelector("[data-num-prev]");
  const next = root.querySelector("[data-num-next]");
  const step = () => Math.min(track.clientWidth * 0.7, 320);
  prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
}

export function bindOverviewTabs(root) {
  const tabs = [...root.querySelectorAll("[data-ov-tab]")];
  const panels = [...root.querySelectorAll("[data-ov-panel]")];
  if (!tabs.length) return;

  const show = (id) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.ovTab === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((panel) => {
      const on = panel.dataset.ovPanel === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  };

  tabs.forEach((tab) => {
    const id = tab.dataset.ovTab;
    tab.addEventListener("mouseenter", () => show(id));
    tab.addEventListener("focus", () => show(id));
    tab.addEventListener("click", () => show(id));
  });

  root.querySelectorAll("[data-ov-more]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest("[data-ov-panel]");
      const extra = panel?.querySelector("[data-ov-extra]");
      const label = btn.querySelector("[data-ov-more-label]");
      if (!extra) return;
      const open = extra.hidden;
      extra.hidden = !open;
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Read less" : "Read more";
    });
  });

  const hash = location.hash.split("#").filter(Boolean).pop();
  if (hash?.startsWith("tab-")) {
    const id = hash.slice(4);
    if (tabs.some((t) => t.dataset.ovTab === id)) show(id);
  }
}

/** Country-page-only motion language (curtain / wipe / ribbon). */
export function initCountryPageAnimations(root = document) {
  const page = root.querySelector?.("[data-country-hub]") || document.querySelector("[data-country-hub]");
  if (!page || typeof gsap === "undefined") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    page.classList.add("cp-page--reduced");
    return;
  }

  page.querySelectorAll("[data-cp-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  const reel = page.querySelector("[data-cp-reel]");
  if (reel) {
    const stage = reel.querySelector(".cp-reel__stage");
    const peeks = reel.querySelectorAll(".cp-reel__peek");
    if (stage) {
      gsap.fromTo(
        stage,
        { clipPath: "inset(8% 12% 8% 12% round 0)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: reel, start: "top 85%", once: true },
        }
      );
    }
    if (peeks.length) {
      gsap.fromTo(
        peeks,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: reel, start: "top 80%", once: true },
        }
      );
    }
  }

  const ribbonItems = page.querySelectorAll("[data-cp-ribbon-item]");
  if (ribbonItems.length) {
    gsap.fromTo(
      ribbonItems,
      { opacity: 0, y: 30, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.55,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: page.querySelector("[data-cp-section='numbers']"),
          start: "top 82%",
          once: true,
        },
      }
    );
  }

  const riverBands = page.querySelectorAll("[data-cp-river-band]");
  if (riverBands.length) {
    riverBands.forEach((band) => {
      gsap.fromTo(
        band,
        { opacity: 0, x: band.classList.contains("cp-river__band--flip") ? 40 : -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: band, start: "top 86%", once: true },
        }
      );
    });
  }

  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}
