import { formatNumber } from "../../utils/format.js";

export function renderCommunityHero({ community, country, catchment }) {
  const crumbs = [
    { label: "Africa", href: "africa" },
    { label: country.name, href: `country/${country.slug}` },
    { label: community.name, href: null },
  ];

  return `
    <header class="ch-hero" id="cm-hero">
      <div class="ch-hero__grid ch-hero__grid--single">
        <div class="ch-hero__content">
          <nav class="ch-breadcrumb" aria-label="Breadcrumb">
            ${crumbs
              .map((c, i) =>
                c.href
                  ? `<a href="#/${c.href}" data-link>${c.label}</a>`
                  : `<span aria-current="page">${c.label}</span>`
              )
              .join(' <span aria-hidden="true">/</span> ')}
          </nav>
          <p class="eyebrow ch-hero__tag">${catchment.name}, ${country.name}</p>
          <p class="ch-hero__question">What is happening in this community?</p>
          <h1>${community.name}</h1>
        </div>
      </div>
    </header>`;
}

export function renderCommunityProfile({ community, catchment, dash }) {
  const programs = (dash.programs || []).join(", ") || "—";
  const ppps = (dash.ppps || []).join(", ") || "—";
  const chips = (dash.chips || []).join(", ") || "—";

  const facts = [
    { label: "Location", value: `${catchment.name}, ${catchment.region || community.region || "—"}` },
    { label: "Journey Stage (2-Year Journey)", value: community.journeyStage || dash.kpis?.find((k) => k.text)?.text || "—" },
    {
      label: "Shalom Groups & Households",
      value: `${community.shalomGroups ?? 0} groups · ${formatNumber(community.households ?? 0)} households`,
    },
    { label: "Projects (PPPs & CHIPs)", value: `${ppps} · ${chips}` },
  ];

  return `
    <section class="ch-section" id="cm-profile" data-reveal-section>
      <div class="ch-section__head">
        <h2>Detailed community profile</h2>
        <p class="ch-section__desc">${dash.hero?.description || ""}</p>
      </div>
      <dl class="cm-profile-grid">
        ${facts
          .map(
            (f) => `<div class="cm-profile-item">
            <dt>${f.label}</dt>
            <dd>${f.value}</dd>
          </div>`
          )
          .join("")}
      </dl>
      ${programs !== "—" ? `<p class="cm-profile-programs"><strong>Programmes:</strong> ${programs}</p>` : ""}
    </section>`;
}

export function renderCommunityProjects({ dash }) {
  const timeline = dash.timeline || [];
  const ppps = dash.ppps || [];
  const chips = dash.chips || [];
  const programs = dash.programs || [];

  const projectTags = [
    ...ppps.map((p) => `<span class="cm-tag cm-tag--ppp">${p}</span>`),
    ...chips.map((c) => `<span class="cm-tag cm-tag--chip">${c}</span>`),
  ].join("");

  const activities = timeline.length
    ? timeline
        .map(
          (t) => `<li class="cm-activity" data-reveal-section>
          <span class="cm-activity__year">${t.year}</span>
          <div>
            <strong>${t.title}</strong>
            <p>${t.description}</p>
          </div>
        </li>`
        )
        .join("")
    : `<li class="ch-empty">No project activity recorded.</li>`;

  return `
    <section class="ch-section" id="cm-projects" data-reveal-section>
      <div class="ch-section__head">
        <h2>Projects &amp; activities</h2>
      </div>
      ${projectTags ? `<div class="cm-tag-row">${projectTags}</div>` : ""}
      ${programs.length ? `<p class="cm-program-list">${programs.join(" · ")}</p>` : ""}
      <ol class="cm-activity-list">${activities}</ol>
    </section>`;
}

export function renderCommunityLeadership({ community, dash, analytics }) {
  const comparison = analytics?.communityComparison?.communities?.find((c) => c.id === community.id);
  const leadershipScore =
    comparison?.leadershipScore ?? dash.kpis?.find((k) => k.label === "Leadership Score")?.value ?? "—";
  const shalomLeaders = comparison?.shalomLeaders ?? "—";
  const pastors = community.pastors ?? "—";

  const items = [
    { label: "Leadership (Triple-A)", value: `Score ${leadershipScore} — Awareness, Ability, Action` },
    { label: "Pastor leaders", value: pastors },
    { label: "Shalom leaders", value: shalomLeaders },
    {
      label: "Engagement",
      value: community.participationRate != null ? `${community.participationRate}% participation` : "Field tracking active",
    },
  ];

  return `
    <section class="ch-section" id="cm-leadership" data-reveal-section>
      <div class="ch-section__head">
        <h2>Leadership &amp; engagement</h2>
      </div>
      <dl class="cm-profile-grid">
        ${items
          .map(
            (f) => `<div class="cm-profile-item">
            <dt>${f.label}</dt>
            <dd>${f.value}</dd>
          </div>`
          )
          .join("")}
      </dl>
    </section>`;
}
