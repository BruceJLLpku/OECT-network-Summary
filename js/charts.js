(function () {
  "use strict";
  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }
  function number(value) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 3 });
  }
  function render(chart) {
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const width = compact ? 320 : 440;
    const height = 235;
    const left = compact ? 31 : 46;
    const right = 18;
    const top = 28;
    const bottom = 58;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const rawMaximum = Math.max(...chart.points.map((point) => point.value + (point.error || 0))) * 1.26 || 1;
    const magnitude = 10 ** Math.floor(Math.log10(rawMaximum));
    const maximum = [1, 2, 5, 10].find((factor) => factor * magnitude >= rawMaximum) * magnitude;
    const positionY = (value) => top + plotHeight - value / maximum * plotHeight;
    const horizontalValues = chart.x_values?.map((value) => chart.x_scale === "log" ? Math.log10(value) : value);
    const positionX = (index) => {
      if (!horizontalValues) return left + plotWidth * (index + 0.5) / chart.points.length;
      const minimum = Math.min(...horizontalValues);
      const range = Math.max(...horizontalValues) - minimum || 1;
      return left + 17 + (plotWidth - 34) * (horizontalValues[index] - minimum) / range;
    };
    const colors = ["#b6c5e4", "#456be9", "#8c75cf", "#3c8aa5", "#586b9e"];
    const accessible = chart.points.map((point) => `${point.label} ${number(point.value)}${point.error != null ? ` ± ${number(point.error)}` : ""} ${chart.unit}`).join("；");
    const grid = [0, 0.5, 1].map((fraction) => {
      const value = maximum * fraction;
      const vertical = positionY(value);
      return `<line x1="${left}" x2="${width - right}" y1="${vertical}" y2="${vertical}" stroke="#e9edf5" ${fraction ? 'stroke-dasharray="3 4"' : ""}/><text x="${left - 9}" y="${vertical + 3}" text-anchor="end" fill="#9aa8be" font-size="9">${number(value)}</text>`;
    }).join("");
    const path = chart.type === "trend" ? `<polyline points="${chart.points.map((point, index) => `${positionX(index)},${positionY(point.value)}`).join(" ")}" fill="none" stroke="#456be9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    const marks = chart.points.map((point, index) => {
      const horizontal = positionX(index);
      const vertical = positionY(point.value);
      const barWidth = Math.min(66, plotWidth / chart.points.length * 0.46);
      const color = chart.type === "trend" ? "#456be9" : colors[index % colors.length];
      const mark = chart.type === "trend" ? `<circle cx="${horizontal}" cy="${vertical}" r="4.3" fill="white" stroke="${color}" stroke-width="2"/>` : `<rect x="${horizontal - barWidth / 2}" y="${vertical}" width="${barWidth}" height="${positionY(0) - vertical}" rx="4" fill="${color}"/>`;
      const error = point.error == null ? "" : `<path d="M${horizontal} ${positionY(point.value - point.error)}V${positionY(point.value + point.error)}M${horizontal - 4} ${positionY(point.value - point.error)}h8M${horizontal - 4} ${positionY(point.value + point.error)}h8" stroke="#536993" stroke-width="1.1" fill="none"/>`;
      const label = point.label.length > 15 ? point.label.slice(0, 14) + "…" : point.label;
      return `<g><title>${escapeText(`${point.label}: ${number(point.value)} ${chart.unit}`)}</title>${mark}${error}<text x="${horizontal}" y="${positionY(point.value + (point.error || 0)) - 10}" fill="#2b456d" font-size="11" font-weight="600" text-anchor="middle">${number(point.value)}</text><text x="${horizontal}" y="${height - bottom + 21}" fill="#7d8da6" font-size="${chart.points.length > 3 ? 9 : 10}" text-anchor="middle">${escapeText(label)}</text></g>`;
    }).join("");
    const axis = chart.axis ? `<text x="${left + plotWidth / 2}" y="${height - 5}" text-anchor="middle" fill="#9aa7b9" font-size="9">${escapeText(chart.axis)}</text>` : "";
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeText(chart.title + '：' + accessible)}" xmlns="http://www.w3.org/2000/svg"><title>${escapeText(chart.title)}</title>${grid}${path}${marks}${axis}</svg>`;
  }
  window.OectCharts = { render, number };
})();
