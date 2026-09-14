/**
 * Chart.js renderer — supports line, bar, pie, area, doughnut, radar.
 * Country “By the numbers” cards use World Bank–style hover tooltips.
 */

const instances = [];

export function destroyCharts() {
  instances.forEach((c) => c.destroy());
  instances.length = 0;
}

const COLORS = ["#e8a91a", "#5c2428", "#c48914", "#3f9a4a", "#8b3d42", "#4a403c"];

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
    titleColor: "#5c2428",
    bodyColor: "#4a403c",
    borderColor: "rgba(92, 36, 40, 0.12)",
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

function piePercentPlugin(config) {
  return {
    id: "paPiePercents",
    afterDatasetsDraw(chart) {
      if (!config.showPercent) return;
      if (chart.config.type !== "pie" && chart.config.type !== "doughnut") return;
      const meta = chart.getDatasetMeta(0);
      const values = chart.data.datasets[0]?.data || [];
      const ctx = chart.ctx;
      meta.data.forEach((arc, i) => {
        const value = Number(values[i]);
        if (!Number.isFinite(value) || value <= 0) return;
        const pos = arc.tooltipPosition();
        const label = `${Math.round(value)}%`;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = "700 12px system-ui, Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(42, 16, 20, 0.35)";
        ctx.shadowBlur = 4;
        ctx.fillText(label, pos.x, pos.y);
        ctx.restore();
      });
    },
  };
}

export function renderChart(canvas, config) {
  if (!canvas || !config) return;

  const rawType = config.type === "area" ? "line" : config.type;
  const type = rawType === "doughnut" ? "doughnut" : rawType;
  const isRound = type === "pie" || type === "radar" || type === "doughnut";
  const accent = config.color || "#e8a91a";
  const dataLen = config.data?.length || 0;
  const horizontal = config.indexAxis === "y";
  const showLegend = Boolean(config.showLegend);

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
        maxBarThickness: horizontal ? 28 : 48,
      },
    ];
  } else if (type === "radar") {
    datasets = [
      {
        label: config.seriesLabel || config.title,
        data: config.data,
        borderColor: accent,
        backgroundColor: `${accent}33`,
        pointBackgroundColor: accent,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: accent,
        borderWidth: 2,
        pointRadius: 4,
      },
    ];
  } else if (isRound) {
    const pieColors = sliceColors(dataLen, accent);
    datasets = [
      {
        data: config.data,
        backgroundColor: pieColors,
        borderColor: type === "pie" ? "#fff" : pieColors,
        borderWidth: type === "pie" ? 3 : 0,
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

  let scales = {};
  if (type === "radar") {
    scales = {
      r: {
        beginAtZero: true,
        min: 0,
        max: config.max ?? 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
          color: "#94a3b8",
          backdropColor: "transparent",
        },
        pointLabels: {
          font: { size: 11, weight: "600" },
          color: "#5c2428",
        },
        grid: { color: "rgba(92, 36, 40, 0.1)" },
        angleLines: { color: "rgba(92, 36, 40, 0.1)" },
      },
    };
  } else if (!isRound) {
    const valueAxis = {
      display: true,
      beginAtZero: type === "bar",
      ticks: { font: { size: 10 }, color: "#94a3b8", maxTicksLimit: 5 },
      grid: { color: "#eef2f5", drawBorder: false },
    };
    const categoryAxis = {
      ticks: {
        font: { size: 11, weight: "600" },
        color: "#5c2428",
        autoSkip: false,
        maxRotation: horizontal ? 0 : 0,
        minRotation: 0,
        callback(value) {
          const label = this.getLabelForValue(value);
          if (!label) return "";
          if (!horizontal && String(label).length > 14) {
            const words = String(label).split(" ");
            const mid = Math.ceil(words.length / 2);
            return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
          }
          return label;
        },
      },
      grid: { display: false },
    };
    scales = horizontal
      ? { x: valueAxis, y: categoryAxis }
      : { y: valueAxis, x: categoryAxis };
  }

  const unit = config.unit || "";
  const legendLabels =
    showLegend && (type === "pie" || type === "doughnut")
      ? {
          display: true,
          position: "right",
          align: "center",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 14,
            font: { size: 12, weight: "600" },
            color: "#5c2428",
            generateLabels(chart) {
              const data = chart.data;
              const ds = data.datasets[0] || {};
              const colors = Array.isArray(ds.backgroundColor) ? ds.backgroundColor : [];
              return (data.labels || []).map((label, i) => {
                const value = Number(ds.data?.[i]);
                const pct = Number.isFinite(value) ? `${Math.round(value)}${unit || "%"}` : "";
                return {
                  text: pct ? `${label} · ${pct}` : String(label),
                  fillStyle: colors[i] || accent,
                  strokeStyle: colors[i] || accent,
                  lineWidth: 0,
                  hidden: false,
                  index: i,
                };
              });
            },
          },
        }
      : { display: false };

  const chart = new Chart(canvas, {
    type,
    data: { labels: config.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      cutout: type === "doughnut" ? "72%" : undefined,
      interaction: {
        mode: isRound ? "nearest" : "index",
        intersect: isRound,
        axis: horizontal ? "y" : "x",
      },
      plugins: {
        legend: legendLabels,
        tooltip: wbTooltip(config),
      },
      scales,
      layout: {
        padding: type === "radar" ? 8 : { top: 4, right: 8, bottom: 4, left: 4 },
      },
    },
    plugins: [piePercentPlugin(config)],
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
