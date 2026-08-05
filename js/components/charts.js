/**
 * Chart.js renderer — supports line, bar, pie, area, radar.
 */

const instances = [];

export function destroyCharts() {
  instances.forEach((c) => c.destroy());
  instances.length = 0;
}

const COLORS = ["#009FDA", "#002B5C", "#0077B6", "#F5A623", "#4A5568", "#16a34a"];

export function renderChart(canvas, config) {
  if (!canvas || !config) return;

  const type = config.type === "area" ? "line" : config.type;
  const datasets =
    type === "pie" || type === "radar"
      ? [
          {
            data: config.data,
            backgroundColor: COLORS.map((c) => c + "99"),
            borderColor: COLORS,
            borderWidth: 1,
          },
        ]
      : [
          {
            label: config.title,
            data: config.data,
            borderColor: config.color || COLORS[0],
            backgroundColor: (config.color || COLORS[0]) + (type === "line" ? "22" : "88"),
            fill: config.type === "area",
            tension: 0.35,
          },
        ];

  const chart = new Chart(canvas, {
    type,
    data: { labels: config.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type === "pie" || type === "radar" } },
      scales:
        type === "pie" || type === "radar"
          ? {}
          : { y: { beginAtZero: true, grid: { color: "#f0f0f0" } }, x: { grid: { display: false } } },
    },
  });

  instances.push(chart);
  return chart;
}

export function renderDashboardCharts(root, chartConfigs) {
  destroyCharts();
  if (!chartConfigs) return;

  Object.entries(chartConfigs).forEach(([key, config]) => {
    const wrap = root.querySelector(`[data-chart="${key}"] canvas`);
    if (wrap) renderChart(wrap, config);
  });
}
