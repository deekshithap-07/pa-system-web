/**
 * Chart.js renderer — supports line, bar, pie, area, doughnut, radar.
 * Country “By the numbers” cards use World Bank–style hover tooltips.
 */

const instances = [];

export function destroyCharts() {
  instances.forEach((c) => c.destroy());
  instances.length = 0;
}

const COLORS = ["#009FDA", "#002B5C", "#0077B6", "#F5A623", "#16a34a", "#4A5568"];

function sliceColors(count, accent) {
  if (count <= COLORS.length) return COLORS.slice(0, count);
  return Array.from({ length: count }, (_, i) => COLORS[i % COLORS.length]);
}

function wbTooltip(config) {
  const unit = config.unit || "";
  const series = config.seriesLabel || config.title || "Value";
  return {
    enabled: true,
    backgroundColor: "#ffffff",
    titleColor: "#002244",
    bodyColor: "#334155",
    borderColor: "rgba(0, 34, 68, 0.12)",
    borderWidth: 1,
    cornerRadius: 4,
    padding: 12,
    displayColors: true,
    boxPadding: 4,
    titleFont: { size: 13, weight: "700", family: "inherit" },
    bodyFont: { size: 12, weight: "500", family: "inherit" },
    caretSize: 0,
    callbacks: {
      title(items) {
        return items[0]?.label || "";
      },
      label(ctx) {
        const raw = ctx.parsed?.y ?? ctx.parsed ?? ctx.raw;
        const num = typeof raw === "number" ? raw : Number(raw);
        const value = Number.isFinite(num)
          ? (Number.isInteger(num) ? num.toLocaleString() : num.toLocaleString(undefined, { maximumFractionDigits: 2 }))
          : String(raw ?? "");
        const name = ctx.chart.config.type === "doughnut" || ctx.chart.config.type === "pie"
          ? ctx.label || series
          : series;
        const suffix = unit ? ` ${unit}` : "";
        return ` ${name}: ${value}${suffix}`;
      },
      labelColor(ctx) {
        const ds = ctx.chart.data.datasets[ctx.datasetIndex];
        const bg = ds.backgroundColor;
        const color = Array.isArray(bg) ? bg[ctx.dataIndex] : bg || config.color || "#de8a0a";
        return {
          borderColor: color,
          backgroundColor: color,
          borderWidth: 0,
          borderRadius: 6,
        };
      },
    },
  };
}

export function renderChart(canvas, config) {
  if (!canvas || !config) return;

  const rawType = config.type === "area" ? "line" : config.type;
  const type = rawType === "doughnut" ? "doughnut" : rawType;
  const isRound = type === "pie" || type === "radar" || type === "doughnut";
  const accent = config.color || "#009FDA";
  const dataLen = config.data?.length || 0;

  let datasets;

  if (type === "bar") {
    const barColors = sliceColors(dataLen, accent);
    datasets = [
      {
        label: config.seriesLabel || config.title,
        data: config.data,
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 36,
      },
    ];
  } else if (isRound) {
    const pieColors = sliceColors(dataLen, accent);
    datasets = [
      {
        data: config.data,
        backgroundColor: pieColors,
        borderColor: type === "pie" ? "#fff" : pieColors,
        borderWidth: type === "pie" ? 2 : 0,
        hoverOffset: type === "doughnut" || type === "pie" ? 6 : 0,
      },
    ];
  } else {
    datasets = [
      {
        label: config.seriesLabel || config.title,
        data: config.data,
        borderColor: accent,
        backgroundColor: accent + (config.type === "area" ? "40" : "00"),
        fill: config.type === "area",
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2.5,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: accent,
        borderWidth: 2.5,
      },
    ];
  }

  const chart = new Chart(canvas, {
    type,
    data: { labels: config.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: type === "doughnut" ? "72%" : undefined,
      interaction: {
        mode: isRound ? "nearest" : "index",
        intersect: isRound,
        axis: "x",
      },
      plugins: {
        legend: { display: false },
        tooltip: wbTooltip(config),
      },
      scales: isRound
        ? {}
        : {
            y: {
              display: true,
              beginAtZero: type === "bar",
              ticks: { font: { size: 10 }, color: "#94a3b8", maxTicksLimit: 4 },
              grid: { color: "#eef2f5", drawBorder: false },
            },
            x: {
              ticks: { font: { size: 10 }, color: "#94a3b8", maxTicksLimit: 5 },
              grid: { display: false },
            },
          },
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
