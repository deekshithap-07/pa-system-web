import { getCountryName } from "../utils/hub-filters.js";
import { renderPageBack } from "../components/shared/wb-page-hero.js";

const TYPE_LABELS = {
  monthly: "Monthly report",
  quarterly: "Quarterly brief",
  annual: "Annual summary",
};

const DEFAULT_PAGE = {
  title: "Field Reports",
  subtitle: "MINISTRY UPDATES FROM ACROSS THE NETWORK",
  aboutLead: "",
  aboutBody: "",
  aboutClosing: "",
  introLink: null,
  primaryDownload: { label: "Download latest report", useLatest: true },
  secondaryDownload: { label: "Download overview", href: "#/resources/packs" },
  mainMessagesLead: "",
  mainMessages: [],
  relatedCards: [],
  relatedLinks: [],
  heroImage: "assets/field-reports/hero.jpg",
  aboutCover: "assets/field-reports/cover.jpg",
};

function formatPeriod(period) {
  if (!period) return "";
  if (/^(\d{4})-Q(\d)$/.test(period)) {
    const [, y, q] = period.match(/^(\d{4})-Q(\d)$/);
    return `Q${q} ${y}`;
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  return period;
}

function countryList(data, ids = []) {
  return ids.map((id) => getCountryName(data.countries, id)).filter(Boolean).join(" · ");
}

function pageConfig(data) {
  return { ...DEFAULT_PAGE, ...(data.reports?.page || {}) };
}

function renderMainMessage(msg, index) {
  const points = (msg.points || [])
    .map((p) => `<li>${p}</li>`)
    .join("");
  return `
    <article class="wdr-fr-msg" data-fr-reveal>
      <h3 class="wdr-fr-msg__title">${msg.title || ""}</h3>
      ${msg.intro ? `<p class="wdr-fr-msg__intro">${msg.intro}</p>` : ""}
      ${points ? `<ul class="wdr-fr-msg__list">${points}</ul>` : ""}
    </article>`;
}

function renderRelatedCard(card, index) {
  const href = card.href || "#";
  const linkAttr = href.startsWith("#/") ? " data-link" : "";
  const imageUrl = card.imageUrl || "";
  const bgStyle = imageUrl ? ` style="background-image:url('${imageUrl}')"` : "";
  const bgClass = imageUrl ? "wdr-fr-carousel__slide-bg" : `wdr-fr-carousel__slide-bg wdr-fr-carousel__slide-bg--${card.image || index}`;

  return `
    <a href="${href}" class="wdr-fr-carousel__slide"${linkAttr}>
      <span class="${bgClass}"${bgStyle} aria-hidden="true"></span>
      <span class="wdr-fr-carousel__slide-label">${card.title}</span>
    </a>`;
}

function renderChapter(report, data, index) {
  const typeLabel = TYPE_LABELS[report.type] || "Report";
  const period = formatPeriod(report.period);
  const countries = countryList(data, report.countryIds);
  const open = index === 0 ? " open" : "";
  const disabled = report.downloadUrl === "#" ? ' aria-disabled="true"' : "";

  return `
    <details class="wdr-fr-chapter" data-fr-item data-country-ids="${(report.countryIds || []).join(",")}" data-report-type="${report.type || ""}"${open}>
      <summary class="wdr-fr-chapter__head">
        <span class="wdr-fr-chapter__thumb wdr-fr-chapter__thumb--${report.type || "monthly"}" aria-hidden="true"></span>
        <span class="wdr-fr-chapter__meta">
          <span class="wdr-fr-chapter__type">${typeLabel}</span>
          ${period ? `<time datetime="${report.period}">${period}</time>` : ""}
        </span>
        <span class="wdr-fr-chapter__title">${report.title}</span>
        <span class="wdr-fr-chapter__chev" aria-hidden="true"></span>
      </summary>
      <div class="wdr-fr-chapter__body">
        <p class="wdr-fr-chapter__summary">${report.summary}</p>
        ${countries ? `<p class="wdr-fr-chapter__countries">${countries}</p>` : ""}
        <div class="wdr-fr-chapter__actions">
          <a href="${report.downloadUrl || "#"}" class="wdr-fr-btn wdr-fr-btn--chapter"${disabled}>Download report</a>
          <a href="#/scorecard" class="wdr-fr-link" data-link>See the numbers →</a>
        </div>
      </div>
    </details>`;
}

export function renderFieldReports(data) {
  const page = pageConfig(data);
  const reports = [...(data.reports?.reports || [])].sort((a, b) => (b.period || "").localeCompare(a.period || ""));
  const countries = (data.countries?.countries || []).filter((c) => c.isPaNetwork);
  const types = [...new Set(reports.map((r) => r.type).filter(Boolean))];
  const latest = reports[0];
  const primaryHref =
    page.primaryDownload?.useLatest && latest?.downloadUrl
      ? latest.downloadUrl
      : page.primaryDownload?.href || latest?.downloadUrl || "#";
  const secondaryHref = page.secondaryDownload?.href || "#/resources/packs";

  const messages = (page.mainMessages || []).map((m, i) => renderMainMessage(m, i)).join("");
  const cards = (page.relatedCards || []).map((c, i) => renderRelatedCard(c, i)).join("");
  const chapters = reports.map((r, i) => renderChapter(r, data, i)).join("");
  const relatedLinks = (page.relatedLinks || [])
    .map((l) => {
      const href = l.href || "#";
      const linkAttr = href.startsWith("#/") ? " data-link" : "";
      return `<li><a href="${href}"${linkAttr}>${l.label}</a></li>`;
    })
    .join("");

  const introLink = page.introLink;
  const introLinkHtml = introLink
    ? `<a href="${introLink.href || "#"}" class="wdr-fr-link"${introLink.href?.startsWith("#/") ? " data-link" : ""}>➜ ${introLink.label}</a>`
    : "";

  const heroImage = page.heroImage || DEFAULT_PAGE.heroImage;
  const aboutCover = page.aboutCover || DEFAULT_PAGE.aboutCover;

  return `
    <div class="wdr-fr" data-field-reports>
      ${renderPageBack({ href: "#/resources", label: "Knowledge Hub" })}
      <div class="wdr-fr-hero-wrap">
        <header class="wdr-fr-hero" style="--wdr-fr-hero:url('${heroImage}')">
          <div class="wdr-fr-hero__shade" aria-hidden="true"></div>
          <div class="container wdr-fr-hero__inner">
            <p class="wdr-fr-hero__series">Possibilities Africa</p>
            <h1 class="wdr-fr-hero__title">${page.title}</h1>
            <p class="wdr-fr-hero__sub">${page.subtitle}</p>
          </div>
          <nav class="wdr-fr-hero-tabs" data-fr-nav aria-label="Publication sections">
            <a href="#about" class="wdr-fr-hero-tabs__link is-active" data-fr-nav-link>About</a>
            <a href="#related" class="wdr-fr-hero-tabs__link" data-fr-nav-link>Related</a>
          </nav>
        </header>

        <section id="about" class="wdr-fr-about-panel" data-fr-section="about">
          <div class="container">
            <article class="wdr-fr-about-panel__card">
              <h2 class="wdr-fr-about-panel__heading">About</h2>
              <div class="wdr-fr-about-panel__grid">
                <figure class="wdr-fr-about-panel__cover">
                  <img src="${aboutCover}" alt="Field Reports publication cover" width="280" height="373" loading="lazy">
                </figure>
                <div class="wdr-fr-about-panel__copy">
                  ${page.aboutLead ? `<p>${page.aboutLead}</p>` : ""}
                  ${page.aboutBody ? `<p>${page.aboutBody}</p>` : ""}
                  ${page.aboutClosing ? `<p>${page.aboutClosing}</p>` : ""}
                  ${introLinkHtml}
                  <div class="wdr-fr-dl">
                    <a href="${primaryHref}" class="wdr-fr-btn wdr-fr-btn--solid"${primaryHref === "#" ? ' aria-disabled="true"' : ""}>${page.primaryDownload?.label || "Download latest report"}</a>
                    <a href="${secondaryHref}" class="wdr-fr-btn wdr-fr-btn--outline"${secondaryHref.startsWith("#/") ? " data-link" : ""}>${page.secondaryDownload?.label || "Download overview"}</a>
                  </div>
                  <p class="wdr-fr-about__press">
                    <span class="wdr-fr-about__press-label">Press release</span>
                    <a href="#/resources" class="wdr-fr-link" data-link>Stories &amp; reports hub</a>
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      ${
        cards
          ? `<section class="wdr-fr-carousel" data-fr-carousel aria-label="Explore related resources">
        <button type="button" class="wdr-fr-carousel__btn wdr-fr-carousel__btn--prev" data-fr-carousel-prev aria-label="Previous slides">‹</button>
        <div class="wdr-fr-carousel__viewport">
          <div class="wdr-fr-carousel__track" data-fr-carousel-track>${cards}</div>
        </div>
        <button type="button" class="wdr-fr-carousel__btn wdr-fr-carousel__btn--next" data-fr-carousel-next aria-label="Next slides">›</button>
        <div class="wdr-fr-carousel__dots" data-fr-carousel-dots aria-hidden="true"></div>
      </section>`
          : ""
      }

      ${
        messages
          ? `<section id="messages" class="wdr-fr-messages" data-fr-section="messages">
        <div class="container">
          <h2 class="wdr-fr-section-title">Main Messages</h2>
          ${page.mainMessagesLead ? `<p class="wdr-fr-messages__lead">${page.mainMessagesLead}</p>` : ""}
          <div class="wdr-fr-messages__stack">${messages}</div>
          <p class="wdr-fr-messages__foot">
            <a href="${primaryHref}" class="wdr-fr-link"${primaryHref === "#" ? ' aria-disabled="true"' : ""}>➜ Download latest report</a>
          </p>
        </div>
      </section>`
          : ""
      }

      <section id="reports" class="wdr-fr-chapters" data-fr-section="reports">
        <div class="container">
          <h2 class="wdr-fr-section-title">Report summaries</h2>
          <p class="wdr-fr-chapters__lead">Browse monthly reports, quarterly briefs, and annual summaries. Expand any entry to read the summary and download.</p>

          <div class="wdr-fr-filters">
            <label class="wdr-fr-filters__field">
              <span>Country</span>
              <select id="fr-filter-country" aria-label="Filter by country">
                <option value="all">All countries</option>
                ${countries.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
              </select>
            </label>
            <label class="wdr-fr-filters__field">
              <span>Type</span>
              <select id="fr-filter-type" aria-label="Filter by report type">
                <option value="all">All types</option>
                ${types.map((t) => `<option value="${t}">${TYPE_LABELS[t] || t}</option>`).join("")}
              </select>
            </label>
            <p class="wdr-fr-filters__count" data-fr-count>${reports.length} reports</p>
          </div>

          <div class="wdr-fr-chapters__list" data-fr-list>${chapters}</div>
          <p class="wdr-fr-chapters__empty is-hidden" data-fr-empty>No reports match these filters.</p>
        </div>
      </section>

      <section id="related" class="wdr-fr-related" data-fr-section="related">
        <div class="container">
          <h2 class="wdr-fr-section-title">Related resources</h2>
          <ul class="wdr-fr-related__list">${relatedLinks}</ul>
        </div>
      </section>
    </div>`;
}

function bindNavSpy(root) {
  const links = [...root.querySelectorAll("[data-fr-nav-link]")];
  const aboutBlock = root.querySelector("#about");
  const relatedBlock = root.querySelector("#related");
  if (!links.length || !aboutBlock) return;

  const setActive = (which) => {
    links.forEach((link) => {
      const isAbout = link.getAttribute("href") === "#about";
      link.classList.toggle("is-active", which === "about" ? isAbout : !isAbout);
    });
  };

  if (typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      const relatedVisible = relatedBlock && entries.some((e) => e.target === relatedBlock && e.isIntersecting);
      setActive(relatedVisible ? "related" : "about");
    },
    { root: null, threshold: 0.25, rootMargin: "-35% 0px -45% 0px" }
  );

  if (relatedBlock) observer.observe(relatedBlock);
  observer.observe(aboutBlock);
  root._frNavOff = () => observer.disconnect();
}

function bindCarousel(root) {
  const carousel = root.querySelector("[data-fr-carousel]");
  const track = root.querySelector("[data-fr-carousel-track]");
  const dotsRoot = root.querySelector("[data-fr-carousel-dots]");
  if (!carousel || !track) return;

  const slides = [...track.querySelectorAll(".wdr-fr-carousel__slide")];
  if (slides.length <= 1) return;

  const prev = root.querySelector("[data-fr-carousel-prev]");
  const next = root.querySelector("[data-fr-carousel-next]");
  let index = 0;

  const pages = () => Math.max(1, Math.ceil(slides.length / getVisibleCount()));

  const getVisibleCount = () => {
    const w = carousel.clientWidth;
    if (w < 640) return 1;
    if (w < 960) return 2;
    return 4;
  };

  const renderDots = () => {
    if (!dotsRoot) return;
    const count = pages();
    dotsRoot.innerHTML = Array.from({ length: count }, (_, i) =>
      `<button type="button" class="wdr-fr-carousel__dot${i === index ? " is-active" : ""}" data-fr-dot="${i}" aria-label="Slide group ${i + 1}"></button>`
    ).join("");
    dotsRoot.querySelectorAll("[data-fr-dot]").forEach((dot) => {
      dot.addEventListener("click", () => scrollToPage(Number(dot.dataset.frDot)));
    });
  };

  const scrollToPage = (page) => {
    index = Math.max(0, Math.min(page, pages() - 1));
    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollTo({ left: index * (slideWidth + gap) * getVisibleCount(), behavior: "smooth" });
    renderDots();
  };

  prev?.addEventListener("click", () => scrollToPage(index - 1));
  next?.addEventListener("click", () => scrollToPage(index + 1));
  window.addEventListener("resize", renderDots);
  renderDots();
  root._frCarouselOff = () => window.removeEventListener("resize", renderDots);
}

export function mountFieldReports() {
  const root = document.querySelector("[data-field-reports]");
  if (!root) return;

  const countrySel = root.querySelector("#fr-filter-country");
  const typeSel = root.querySelector("#fr-filter-type");
  const countEl = root.querySelector("[data-fr-count]");
  const emptyEl = root.querySelector("[data-fr-empty]");
  const items = root.querySelectorAll("[data-fr-item]");

  const applyFilters = () => {
    const countryId = countrySel?.value || "all";
    const type = typeSel?.value || "all";
    let visible = 0;

    items.forEach((item) => {
      const ids = (item.dataset.countryIds || "").split(",").filter(Boolean);
      const itemType = item.dataset.reportType || "";
      const countryMatch = countryId === "all" || ids.includes(countryId);
      const typeMatch = type === "all" || itemType === type;
      const show = countryMatch && typeMatch;
      item.hidden = !show;
      if (show) visible += 1;
    });

    if (countEl) countEl.textContent = `${visible} report${visible === 1 ? "" : "s"}`;
    emptyEl?.classList.toggle("is-hidden", visible > 0);
  };

  countrySel?.addEventListener("change", applyFilters);
  typeSel?.addEventListener("change", applyFilters);
  bindNavSpy(root);
  bindCarousel(root);
}

export function destroyFieldReports() {
  const root = document.querySelector("[data-field-reports]");
  root?._frNavOff?.();
  root?._frCarouselOff?.();
}
