function renderTopicThumb(topic, index, active) {
  return `
    <button
      type="button"
      class="dev-topics__thumb${active ? " is-active" : ""}"
      data-topic-thumb
      data-topic-id="${topic.id}"
      data-topic-index="${index}"
      aria-pressed="${active}"
      aria-controls="dev-topic-panel"
    >
      <span class="dev-topics__thumb-ring" aria-hidden="true"></span>
      <span class="dev-topics__thumb-img dev-topics__thumb-img--${topic.theme}" aria-hidden="true">
        <span class="dev-topics__thumb-icon">${topic.title.charAt(0)}</span>
      </span>
      <span class="dev-topics__thumb-text">
        <span class="dev-topics__thumb-cat">${topic.category}</span>
        <span class="dev-topics__thumb-title">${topic.title}</span>
      </span>
    </button>`;
}

function renderTopicPanel(topic) {
  const highlights = (topic.highlights || [])
    .map((h) => `<li>${h}</li>`)
    .join("");

  return `
    <div class="dev-topics__panel" id="dev-topic-panel" data-topic-panel>
      <div class="dev-topics__panel-visual" aria-hidden="true">
        <span class="dev-topics__panel-ring dev-topics__panel-ring--1"></span>
        <span class="dev-topics__panel-ring dev-topics__panel-ring--2"></span>
        <span class="dev-topics__panel-img dev-topics__panel-img--${topic.theme}">
          <span class="dev-topics__panel-icon">${topic.title.charAt(0)}</span>
        </span>
      </div>
      <div class="dev-topics__panel-body" data-topic-body>
        <span class="dev-topics__panel-cat">${topic.category}</span>
        <h3 class="dev-topics__panel-title">${topic.title}</h3>
        <p class="dev-topics__panel-summary">${topic.summary}</p>
        <p class="dev-topics__panel-desc">${topic.description}</p>
        ${highlights ? `<ul class="dev-topics__panel-highlights">${highlights}</ul>` : ""}
        <div class="dev-topics__panel-foot">
          ${topic.stat ? `<div class="dev-topics__stat"><strong>${topic.stat.value}</strong><span>${topic.stat.label}</span></div>` : ""}
          ${topic.link ? `<a href="${topic.link.target}" class="dev-topics__panel-link" data-link>${topic.link.label} &rarr;</a>` : ""}
        </div>
      </div>
    </div>`;
}

export function renderDevelopmentTopics(section) {
  const topics = section.topics || [];
  if (!topics.length) return "";

  const thumbs = topics.map((t, i) => renderTopicThumb(t, i, i === 0)).join("");
  const panel = renderTopicPanel(topics[0]);

  return `
    <section class="dev-topics" id="development-topics" aria-labelledby="dev-topics-title" data-dev-topics>
      <div class="container dev-topics__inner">
        <header class="dev-topics__head" data-reveal>
          <p class="eyebrow">${section.eyebrow || "Focus areas"}</p>
          <h2 id="dev-topics-title">${section.title}</h2>
          <p class="dev-topics__intro">${section.description}</p>
          ${section.browseCta ? `<a href="${section.browseCta.target}" class="dev-topics__browse" data-link>${section.browseCta.label} &rarr;</a>` : ""}
        </header>

        <div class="dev-topics__layout" data-reveal>
          <div class="dev-topics__nav" role="tablist" aria-label="Ministry focus areas">
            ${thumbs}
          </div>
          ${panel}
        </div>
      </div>
    </section>`;
}

export function bindDevelopmentTopics(root = document, topics = []) {
  const section = root.querySelector("[data-dev-topics]");
  if (!section || !topics.length) return null;

  const panel = section.querySelector("[data-topic-panel]");
  const thumbs = [...section.querySelectorAll("[data-topic-thumb]")];
  let activeIndex = 0;

  const renderPanelContent = (topic) => {
    const body = panel.querySelector("[data-topic-body]");
    const visual = panel.querySelector(".dev-topics__panel-visual");
    if (!body || !visual) return;

    const highlights = (topic.highlights || []).map((h) => `<li>${h}</li>`).join("");
    body.innerHTML = `
      <span class="dev-topics__panel-cat">${topic.category}</span>
      <h3 class="dev-topics__panel-title">${topic.title}</h3>
      <p class="dev-topics__panel-summary">${topic.summary}</p>
      <p class="dev-topics__panel-desc">${topic.description}</p>
      ${highlights ? `<ul class="dev-topics__panel-highlights">${highlights}</ul>` : ""}
      <div class="dev-topics__panel-foot">
        ${topic.stat ? `<div class="dev-topics__stat"><strong>${topic.stat.value}</strong><span>${topic.stat.label}</span></div>` : ""}
        ${topic.link ? `<a href="${topic.link.target}" class="dev-topics__panel-link" data-link>${topic.link.label} &rarr;</a>` : ""}
      </div>`;

    const img = visual.querySelector(".dev-topics__panel-img");
    if (img) {
      img.className = `dev-topics__panel-img dev-topics__panel-img--${topic.theme}`;
      const icon = img.querySelector(".dev-topics__panel-icon");
      if (icon) icon.textContent = topic.title.charAt(0);
    }
  };

  const selectTopic = (index, animate = true) => {
    if (index < 0 || index >= topics.length || index === activeIndex) return;
    activeIndex = index;
    const topic = topics[index];

    thumbs.forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
      btn.setAttribute("aria-pressed", String(i === index));
    });

    const body = panel.querySelector("[data-topic-body]");
    const visual = panel.querySelector(".dev-topics__panel-visual");

    if (animate && typeof gsap !== "undefined" && body) {
      gsap.to([body, visual], {
        opacity: 0,
        x: 12,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          renderPanelContent(topic);
          gsap.fromTo([body, visual], { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.05 });
        },
      });
    } else {
      renderPanelContent(topic);
    }
  };

  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectTopic(Number(btn.dataset.topicIndex), true);
    });
  });

  return { selectTopic, destroy: () => {} };
}
