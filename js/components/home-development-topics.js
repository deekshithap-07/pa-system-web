function renderPriorityPanel(topic, index, isActive) {
  const panelLabel = topic.panelLabel || topic.shortTitle || topic.title;
  const link = topic.link || { label: "Learn More", target: "#/about" };
  const linkAttrs = link.target?.startsWith("#/") ? `href="${link.target}" data-link` : `href="${link.target || "#"}"`;

  return `
    <article
      class="wb-priority-panel${isActive ? " is-active" : ""}"
      data-priority
      data-priority-id="${topic.id}"
      data-priority-index="${index}"
      role="presentation"
    >
      <button
        type="button"
        class="wb-priority-panel__btn"
        aria-expanded="${isActive}"
        aria-controls="priority-panel-${topic.id}"
        id="priority-trigger-${topic.id}"
      >
        <span
          class="wb-priority-panel__bg wb-priority-panel__bg--${topic.theme}"
          ${topic.image ? `style="background-image:url('${topic.image}')"` : ""}
          aria-hidden="true"
        ></span>
        <span class="wb-priority-panel__shade" aria-hidden="true"></span>
        <span class="wb-priority-panel__inner" id="priority-panel-${topic.id}">
          <span class="wb-priority-panel__collapsed">
            <span class="wb-priority-panel__label">${panelLabel}</span>
            <span class="wb-priority-panel__toggle" aria-hidden="true">
              <span class="wb-priority-panel__icon">+</span>
            </span>
          </span>
          <span class="wb-priority-panel__expanded">
            <h3 class="wb-priority-panel__title">${panelLabel}</h3>
            <p class="wb-priority-panel__desc">${topic.summary}</p>
            <a ${linkAttrs} class="wb-priority-panel__cta">${link.label || "Learn More"}</a>
          </span>
        </span>
      </button>
    </article>`;
}

export function renderDevelopmentTopics(section) {
  const topics = section.topics || [];
  if (!topics.length) return "";

  const panels = topics.map((t, i) => renderPriorityPanel(t, i, i === 0)).join("");

  const titleHtml =
    section.titleHtml ||
    `<span class="wb-priorities-band__lead">OUR</span> <strong>PRIORITIES</strong>`;

  return `
    <section class="wb-priorities-band" id="development-topics" aria-labelledby="dev-topics-title" data-dev-topics>
      <div class="wb-priorities-band__head-wrap">
        <div class="container">
          <header class="wb-priorities-band__head" data-reveal>
            <h2 id="dev-topics-title" class="wb-priorities-band__title">${titleHtml}</h2>
            ${section.description ? `<p class="wb-priorities-band__intro">${section.description}</p>` : ""}
          </header>
        </div>
      </div>
      <div class="wb-priorities-accordion" data-priorities-accordion role="tablist" aria-label="Our priorities">
        ${panels}
      </div>
    </section>`;
}

export function bindDevelopmentTopics(root = document) {
  const section = root.querySelector("[data-dev-topics]");
  if (!section) return null;

  const accordion = section.querySelector("[data-priorities-accordion]");
  const items = [...section.querySelectorAll("[data-priority]")];
  if (!items.length) return null;

  const setActive = (activeItem) => {
    items.forEach((item) => {
      const isActive = item === activeItem;
      const btn = item.querySelector(".wb-priority-panel__btn");
      item.classList.toggle("is-active", isActive);
      btn?.setAttribute("aria-expanded", String(isActive));
    });
  };

  const handlers = items.map((item) => {
    const btn = item.querySelector(".wb-priority-panel__btn");
    if (!btn) return null;

    const onClick = (e) => {
      if (e.target.closest(".wb-priority-panel__cta")) return;
      if (item.classList.contains("is-active")) return;
      setActive(item);
    };

    btn.addEventListener("click", onClick);
    return { btn, onClick };
  });

  const onKeydown = (e) => {
    const current = items.findIndex((item) => item.classList.contains("is-active"));
    if (current < 0) return;

    let next = current;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (current + 1) % items.length;
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (current - 1 + items.length) % items.length;
      e.preventDefault();
    } else {
      return;
    }

    setActive(items[next]);
    items[next].querySelector(".wb-priority-panel__btn")?.focus();
  };

  accordion?.addEventListener("keydown", onKeydown);

  if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.from(items, {
      opacity: 0,
      scale: 0.98,
      duration: 0.65,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: accordion,
        start: "top 85%",
        once: true,
      },
    });
  }

  return {
    destroy: () => {
      handlers.forEach((h) => {
        if (h?.btn && h?.onClick) h.btn.removeEventListener("click", h.onClick);
      });
      accordion?.removeEventListener("keydown", onKeydown);
    },
  };
}
