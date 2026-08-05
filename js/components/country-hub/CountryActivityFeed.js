function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function renderCountryActivityFeed(activities) {
  if (!activities?.length) {
    return `
      <section class="ch-section" id="ch-activity" data-reveal-section>
        <div class="ch-section__head"><h2>Country Activity</h2></div>
        <p class="ch-empty">No recent activity recorded.</p>
      </section>`;
  }

  const items = activities
    .map(
      (a) => `<li class="ch-activity" data-reveal-section>
        <div class="ch-activity__image" aria-hidden="true"><span>Photo</span></div>
        <div class="ch-activity__body">
          <time datetime="${a.date}">${formatDate(a.date)}</time>
          <h3>${a.project}</h3>
          <p>${a.community}</p>
          <span class="ch-activity__status ch-activity__status--${a.status.toLowerCase()}">${a.status}</span>
        </div>
      </li>`
    )
    .join("");

  return `
    <section class="ch-section" id="ch-activity">
      <div class="ch-section__head">
        <h2>Country Activity</h2>
        <p class="ch-section__desc">Recent updates from communities and projects</p>
      </div>
      <ol class="ch-activity-feed">${items}</ol>
    </section>`;
}
