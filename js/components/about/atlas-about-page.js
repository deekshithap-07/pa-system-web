import { formatNumber } from "../../utils/format.js";

/**
 * Who we are — World Bank who-we-are structure.
 * https://www.worldbank.org/ext/en/who-we-are
 * About the ministry itself — not a repeat of Where we work / What we do.
 */

function kpiText(k) {
  if (k?.text) return k.text;
  if (typeof k?.value === "number") return formatNumber(k.value);
  return String(k?.value ?? "");
}

function pickKpis(scorecard) {
  const ids = ["communities", "lives", "countries", "leadership", "households"];
  const list = scorecard?.kpis || [];
  const picked = ids.map((id) => list.find((k) => k.id === id)).filter(Boolean);
  if (picked.length >= 3) return picked.slice(0, 3);
  return list.slice(0, 3);
}

export function renderAtlasAboutPage(model, footerHtml = "", section = "overview", scorecard = null) {
  if (!model) return `<div class="static-page container"><h1>About</h1><p>Content unavailable.</p></div>`;

  const ack = model.atlas?.acknowledgements || {};
  const impact = pickKpis(scorecard);
  const approaches = [
    {
      code: "Faith",
      title: "Whole-gospel discipleship",
      text: "Pastors are equipped so spiritual life and daily life grow together — not as separate tracks.",
    },
    {
      code: "Leaders",
      title: "Pastor-led change",
      text: "Local pastors carry the vision. Possibilities Africa walks with them for two years of training and practice.",
    },
    {
      code: "Places",
      title: "Community ownership",
      text: "Water, farming, health, and livelihoods are planned and owned by the church and community — not dropped in from outside.",
    },
    {
      code: "Groups",
      title: "Shalom groups",
      text: "Groups of 30–50 leaders in each community deepen discipleship, cohesion, and local initiative.",
    },
    {
      code: "Path",
      title: "A clear two-year journey",
      text: "Every community moves through awareness, engagement, training, implementation, and multiplication.",
    },
  ];

  const impactCards = impact
    .map((k) => {
      const tags = {
        communities: "People",
        pastors: "Leaders",
        lives: "Reach",
        countries: "Network",
        households: "Homes",
      };
      return `<a href="#/scorecard" class="wb-who-impact__card" data-link data-atlas-reveal>
        <span class="wb-who-impact__tag">${tags[k.id] || "Progress"}</span>
        <span class="wb-who-impact__value">${kpiText(k)}</span>
        <span class="wb-who-impact__label">${k.label}</span>
      </a>`;
    })
    .join("");

  return `
    <div class="about-atlas-page atlas-page wb-who" data-about-atlas>
      <section class="wb-who-hero" data-atlas-scroll>
        <div class="container wb-who-hero__inner" data-atlas-reveal>
          <p class="wb-who-hero__crumb"><a href="#/" data-link>Home</a> / Who we are</p>
          <h1>Who we are</h1>
          <p class="wb-who-hero__mission">We exist so rural communities grow in faith, family life, and daily wellbeing — led by local pastors.</p>
        </div>
        <div class="wb-who-hero__photo" aria-hidden="true"></div>
      </section>

      <section class="wb-who-intro" data-atlas-scroll>
        <div class="container wb-who-intro__grid">
          <div data-atlas-reveal>
            <p class="wb-who-intro__lead"><strong>Our mission is the whole gospel transforming the whole person and whole community.</strong> Rural Africa holds immense possibility. Time matters — and local churches are already present.</p>
          </div>
          <div data-atlas-reveal>
            <p class="wb-who-intro__playbook"><strong>We walk with pastors so the work is:</strong></p>
            <ul class="wb-who-intro__list">
              <li><strong>Inclusive</strong> — women, youth, and households are part of the change, not left behind.</li>
              <li><strong>Resilient</strong> — communities build skills and assets that last beyond a single project.</li>
              <li><strong>Sustainable</strong> — local ownership first; outside support complements what churches already mobilise.</li>
            </ul>
            <p class="wb-who-intro__close">We work as one ministry with churches, partners, and communities across seven countries.</p>
          </div>
        </div>
      </section>

      <section class="wb-who-orgs" data-atlas-scroll>
        <div class="container">
          <div class="wb-who-orgs__head" data-atlas-reveal>
            <h2>Five commitments <em>one ministry</em></h2>
            <p>How Possibilities Africa serves pastors and communities — with knowledge, companionship, and practical skill.</p>
          </div>
          <div class="wb-who-orgs__list">
            ${approaches
              .map(
                (a) => `<article class="wb-who-org" data-atlas-reveal>
                  <span class="wb-who-org__code">${a.code}</span>
                  <h3>${a.title}</h3>
                  <p>${a.text}</p>
                </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="wb-who-impact" data-atlas-scroll>
        <div class="container">
          <div class="wb-who-impact__head" data-atlas-reveal>
            <h2>Measuring our <strong>impact</strong></h2>
            <p>Simple figures that sit beside the stories — how far the network has reached.</p>
            <a href="#/scorecard" class="wb-who-impact__cta" data-link>See our results</a>
          </div>
          ${impactCards ? `<div class="wb-who-impact__grid">${impactCards}</div>` : ""}
        </div>
      </section>

      <section class="wb-who-quote" data-atlas-scroll>
        <div class="container wb-who-quote__grid">
          <div data-atlas-reveal>
            <p class="wb-who-quote__eyebrow">Leadership</p>
            <blockquote>“With God all things are possible — and rural communities already hold the people who will lead the change.”</blockquote>
            <a href="https://www.possibilitiesafrica.org/" class="wb-who-quote__link" target="_blank" rel="noopener noreferrer">Visit the main Possibilities Africa site →</a>
          </div>
          <div class="wb-who-quote__visual" data-atlas-reveal aria-hidden="true"></div>
        </div>
      </section>

      <section class="wb-who-pillars" data-atlas-scroll>
        <div class="container wb-who-pillars__grid">
          <article data-atlas-reveal>
            <div class="wb-who-pillars__img wb-who-pillars__img--1" aria-hidden="true"></div>
            <h3>Partner with churches</h3>
            <p>The world’s challenges are complex. Lasting change needs pastors, congregations, and neighbours working together.</p>
          </article>
          <article data-atlas-reveal>
            <div class="wb-who-pillars__img wb-who-pillars__img--2" aria-hidden="true"></div>
            <h3>Accountable to the field</h3>
            <p>Trust matters. We keep stories and simple results side by side so partners can see what is improving.</p>
          </article>
          <article data-atlas-reveal>
            <div class="wb-who-pillars__img wb-who-pillars__img--3" aria-hidden="true"></div>
            <h3>Open with our learning</h3>
            <p>Field reports and insight packs help churches, supporters, and researchers follow the work clearly.</p>
          </article>
        </div>
      </section>

      <section class="wb-who-history" data-atlas-scroll>
        <div class="container wb-who-history__inner">
          <div data-atlas-reveal>
            <p class="wb-who-history__eyebrow">History</p>
            <h2>From Webuye to seven countries</h2>
            <p>Possibilities Africa began in Webuye, Kenya, in 2005. The same pastor-led model now reaches communities across East and Southern Africa.</p>
            <a href="https://www.possibilitiesafrica.org/" class="wb-who-history__cta" target="_blank" rel="noopener noreferrer">Explore our history</a>
          </div>
          <ol class="wb-who-history__steps" data-atlas-reveal>
            <li><span>2005</span><em>Work begins in Webuye, Kenya</em></li>
            <li><span>2010s</span><em>Networks grow in Malawi, Ethiopia, and Zambia</em></li>
            <li><span>2020s</span><em>Newer footprints in Rwanda, Tanzania, and Burundi</em></li>
            <li><span>Today</span><em>Seven countries · one two-year journey</em></li>
          </ol>
        </div>
      </section>

      <section class="wb-who-newsletter" data-atlas-scroll>
        <div class="container wb-who-newsletter__inner" data-atlas-reveal>
          <div
            class="wb-who-newsletter__photo"
            role="img"
            aria-label="Communities where Possibilities Africa works"
            style="background-image:url('assets/stories/story-kenya-dams.jpg')"
          ></div>
          <div class="wb-who-newsletter__copy">
            <p class="wb-who-newsletter__eyebrow">September’24 Newsletter</p>
            <h2>Read our recent newsletter</h2>
            <p class="wb-who-newsletter__lead">The latest Possibilities Africa field newsletter from the main ministry site — download the PDF as published.</p>
            <a
              href="https://africa.possibilitiesafrica.org/wp-content/uploads/2024/10/PA-Newsletter-for-September.pdf"
              class="wb-who-newsletter__cta"
              target="_blank"
              rel="noopener noreferrer"
            >Download the September’24 newsletter</a>
          </div>
        </div>
      </section>

      <section class="about-atlas-ack" data-atlas-scroll>
        <div class="container about-atlas-ack__inner" data-atlas-reveal>
          <h2>${ack.title || "About this website"}</h2>
          <p>${ack.text || "This site is a storytelling companion to Possibilities Africa’s work — not a replacement for the main ministry website."}</p>
          ${
            ack.cta
              ? `<a href="${ack.cta.href}" class="about-atlas-ack__cta" target="_blank" rel="noopener">${ack.cta.label} →</a>`
              : `<a href="https://www.possibilitiesafrica.org/" class="about-atlas-ack__cta" target="_blank" rel="noopener">Visit possibilitiesafrica.org →</a>`
          }
        </div>
      </section>
      ${footerHtml}
    </div>`;
}
