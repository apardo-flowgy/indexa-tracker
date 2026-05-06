import { useEffect, useState, useCallback } from "react";
import {
  buildTrackerData,
  buildPeriodComparison,
  COMPANY_TARGET,
  euroCompact,
  EXPONENTIAL_MILESTONES,
  loadIndexaDataset,
  percent,
} from "./data";

const DISCLAIMER_KEY = "indexa-tracker-disclaimer-v1";

function DisclaimerModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Aviso importante</h2>
        <p className="modal-body">
          Esta web es un <strong>proyecto independiente creado por inversores</strong> de
          Indexa Capital para monitorizar el crecimiento de la compañía y hacer
          seguimiento de sus métricas públicas.
        </p>
        <p className="modal-body">
          No tiene ninguna relación ni afiliación con <strong>Indexa Capital</strong>.
          Los datos provienen de fuentes públicas y pueden contener inexactitudes.
          Esta herramienta no constituye asesoramiento financiero.
        </p>
        <button className="modal-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

function Footer({ onOpenDisclaimer }) {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a href="https://indexacapital.com" target="_blank" rel="noopener noreferrer">
            Web oficial
          </a>
          <a href="https://indexacapital.com/es/esp/stats" target="_blank" rel="noopener noreferrer">
            Datos públicos
          </a>
          <a href="https://group.indexacapital.com/en/documents" target="_blank" rel="noopener noreferrer">
            Documentos inversores
          </a>
        </div>
        <button className="footer-disclaimer-btn" onClick={onOpenDisclaimer}>
          Aviso legal
        </button>
      </div>
    </footer>
  );
}

function statusInfo(delta) {
  if (delta == null) return null;
  if (delta >= 0.05) return { label: "Adelantado", cls: "badge-ahead" };
  if (delta >= -0.02) return { label: "En camino", cls: "badge-on-track" };
  if (delta >= -0.08) return { label: "Ligeramente atras", cls: "badge-behind" };
  return { label: "Por detras", cls: "badge-off-track" };
}

function fmtDate(date) {
  return date
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date)
    : "-";
}

function fmtPctPoint(value) {
  if (value == null) return "-";
  return `${value.toFixed(Math.abs(value) >= 10 ? 0 : 1)}%`;
}

function StatusBadge({ delta }) {
  const info = statusInfo(delta);
  if (!info) return null;
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
}

function MetricCard({ label, value, sub, delta, info }) {
  return (
    <article className="metric-card">
      <div className="metric-label-row">
        <span className="metric-label">{label}</span>
        {info && <InfoTooltip>{info}</InfoTooltip>}
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-sub">{sub}</span>
      <StatusBadge delta={delta} />
    </article>
  );
}

function AumChart({ data }) {
  const W = 1100;
  const H = 320;
  const pad = { top: 18, right: 28, bottom: 50, left: 90 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const allVals = data.flatMap((item) => [item.actual, item.target].filter((value) => value != null));
  if (!allVals.length) return null;

  const minVal = Math.min(...allVals) * 0.97;
  const maxVal = Math.max(...allVals) * 1.02;
  const range = maxVal - minVal || 1;
  const pointX = (index) => pad.left + (data.length <= 1 ? 0 : (index / (data.length - 1)) * iW);
  const pointY = (value) => pad.top + iH * (1 - (value - minVal) / range);

  const buildPath = (key) => {
    const parts = [];
    data.forEach((item, index) => {
      if (item[key] == null) return;
      parts.push(`${parts.length === 0 ? "M" : "L"}${pointX(index).toFixed(1)},${pointY(item[key]).toFixed(1)}`);
    });
    return parts.join(" ");
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => minVal + ratio * range);
  const xLabels = [];
  data.forEach((item, index) => {
    if (item.label.startsWith("ene")) xLabels.push(index);
  });
  if (!xLabels.includes(data.length - 1)) xLabels.push(data.length - 1);

  const lastActualIndex = data.reduce((acc, item, index) => (item.actual != null ? index : acc), -1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((value, index) => (
        <g key={index}>
          <line
            x1={pad.left}
            y1={pointY(value).toFixed(1)}
            x2={W - pad.right}
            y2={pointY(value).toFixed(1)}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text x={pad.left - 8} y={(pointY(value) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {euroCompact.format(value)}
          </text>
        </g>
      ))}

      <path
        d={buildPath("target")}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="1.8"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      <path
        d={buildPath("actual")}
        fill="none"
        stroke="#0F766E"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {lastActualIndex >= 0 && (
        <circle
          cx={pointX(lastActualIndex).toFixed(1)}
          cy={pointY(data[lastActualIndex].actual).toFixed(1)}
          r="5"
          fill="#0F766E"
        />
      )}

      {xLabels.map((index) => (
        <text key={index} x={pointX(index).toFixed(1)} y={H - 8} textAnchor="middle" fontSize="12" fill="#A0AEC0">
          {data[index].label}
        </text>
      ))}
    </svg>
  );
}

const ARR_YOY_REFS = [
  { value: 0.30, label: "+30%", color: "#94A3B8" },
  { value: 0.40, label: "+40%", color: "#64748B" },
  { value: 0.60, label: "+60%", color: "#475569" },
];

function ArrYoYChart({ data }) {
  const W = 1100;
  const H = 280;
  const pad = { top: 18, right: 90, bottom: 50, left: 72 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const yoys = data.map((d) => d.yoy);
  const rawMin = Math.min(...yoys);
  const rawMax = Math.max(Math.max(...yoys), ...ARR_YOY_REFS.map((r) => r.value));
  const steps = [0.05, 0.1, 0.2, 0.25, 0.5, 1.0];
  const roughStep = (rawMax - rawMin) / 5;
  const tickStep = steps.find((s) => s >= roughStep) ?? steps.at(-1);
  const minVal = Math.floor(rawMin / tickStep) * tickStep;
  const maxVal = Math.ceil(rawMax / tickStep) * tickStep;
  const range = maxVal - minVal || 1;

  const startMs = data[0].date.getTime();
  const endMs = data.at(-1).date.getTime();
  const timeRange = endMs - startMs || 1;
  const px = (d) => pad.left + ((d.date.getTime() - startMs) / timeRange) * iW;
  const py = (v) => pad.top + iH * (1 - (v - minVal) / range);
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(d).toFixed(1)},${py(d.yoy).toFixed(1)}`).join(" ");

  const yTicks = [];
  for (let v = minVal; v <= maxVal + 0.001; v += tickStep) yTicks.push(Math.round(v * 1000) / 1000);

  const yearLabels = [];
  const seen = new Set();
  for (const d of data) {
    const y = d.date.getFullYear();
    if (d.date.getMonth() === 0 && !seen.has(y)) { seen.add(y); yearLabels.push({ x: px(d), label: String(y) }); }
  }

  const last = data.at(-1);
  const xEnd = pad.left + iW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={pad.left} y1={py(v).toFixed(1)} x2={xEnd} y2={py(v).toFixed(1)}
            stroke={v === 0 ? "#94A3B8" : "#E2E8F0"} strokeWidth="1"
            strokeDasharray={v === 0 ? "4 3" : undefined}
          />
          <text x={pad.left - 8} y={(py(v) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {(v * 100).toFixed(0)}%
          </text>
        </g>
      ))}

      {ARR_YOY_REFS.map(({ value, label, color }) => {
        const y = py(value).toFixed(1);
        return (
          <g key={label}>
            <line x1={pad.left} y1={y} x2={xEnd} y2={y} stroke={color} strokeWidth="1.2" strokeDasharray="6 3" />
            <text x={xEnd + 6} y={(py(value) + 4).toFixed(1)} fontSize="11" fill={color} fontWeight="600">{label}</text>
          </g>
        );
      })}

      {yearLabels.map(({ x, label }) => (
        <text key={label} x={x.toFixed(1)} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#A0AEC0">{label}</text>
      ))}
      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="1.8" />
      <circle cx={px(last).toFixed(1)} cy={py(last.yoy).toFixed(1)} r="4" fill="#22c55e" />
      <text
        x={(px(last) - 8).toFixed(1)} y={(py(last.yoy) - 10).toFixed(1)}
        textAnchor="end" fontSize="12" fill="#22c55e" fontWeight="600"
      >
        {(last.yoy * 100).toFixed(1)}%
      </text>
    </svg>
  );
}

function InflowsChart({ data }) {
  const W = 1040;
  const H = 250;
  const pad = { top: 18, right: 28, bottom: 50, left: 90 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const allVals = data.flatMap((item) => [item.inflows, item.marketImpact]);
  const maxVal = Math.max(...allVals, 0) * 1.1;
  const minVal = Math.min(...allVals, 0) * 1.1;
  const range = maxVal - minVal || 1;
  const slotW = iW / data.length;
  const barW = Math.max(2, slotW * 0.38);
  const gap = Math.max(1, slotW * 0.06);

  const yScale = (value) => pad.top + iH * (1 - (value - minVal) / range);
  const zeroY = yScale(0);
  const barY = (value) => (value >= 0 ? yScale(value) : zeroY);
  const barH = (value) => Math.abs((value / range) * iH);
  const xCenter = (index) => pad.left + (index + 0.5) * slotW;
  const yTicks = [0, 0.5, 1].map((ratio) => minVal + ratio * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((value, index) => (
        <g key={index}>
          <line
            x1={pad.left}
            y1={yScale(value).toFixed(1)}
            x2={W - pad.right}
            y2={yScale(value).toFixed(1)}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text x={pad.left - 8} y={(yScale(value) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {euroCompact.format(value)}
          </text>
        </g>
      ))}

      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.8" />

      {data.map((item, index) => {
        const cx = xCenter(index);
        return (
          <g key={index}>
            <rect
              x={(cx - barW - gap / 2).toFixed(1)}
              y={barY(item.inflows).toFixed(1)}
              width={barW.toFixed(1)}
              height={Math.max(1, barH(item.inflows)).toFixed(1)}
              fill="#3B82F6"
              opacity="0.85"
              rx="2"
            />
            <rect
              x={(cx + gap / 2).toFixed(1)}
              y={barY(item.marketImpact).toFixed(1)}
              width={barW.toFixed(1)}
              height={Math.max(1, barH(item.marketImpact)).toFixed(1)}
              fill={item.marketImpact >= 0 ? "#10B981" : "#EF4444"}
              opacity="0.75"
              rx="2"
            />
          </g>
        );
      })}

      {data.map((item, index) =>
        index % 3 === 0 ? (
          <text key={index} x={xCenter(index).toFixed(1)} y={H - 8} textAnchor="middle" fontSize="12" fill="#A0AEC0">
            {item.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

function SeasonalityChart({ data }) {
  const W = 920;
  const H = 290;
  const pad = { top: 18, right: 20, bottom: 50, left: 62 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const palette = ["#E53935", "#FB8C00", "#43A047", "#1E88E5", "#8E24AA"];

  if (!data?.categories?.length || !data?.series?.length) return null;

  const allValues = data.series.flatMap((serie) => serie.values.filter((value) => value != null));
  if (!allValues.length) return null;

  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(0, ...allValues);
  const span = maxVal - minVal || 1;
  const paddedMin = minVal - span * 0.08;
  const paddedMax = maxVal + span * 0.12;
  const range = paddedMax - paddedMin || 1;

  const pointX = (index) =>
    pad.left + (data.categories.length <= 1 ? iW / 2 : (index / (data.categories.length - 1)) * iW);
  const pointY = (value) => pad.top + iH * (1 - (value - paddedMin) / range);
  const zeroY = pointY(0);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => paddedMin + ratio * range);

  const buildPath = (values) => {
    const parts = [];
    let segmentOpen = false;

    values.forEach((value, index) => {
      if (value == null) {
        segmentOpen = false;
        return;
      }
      parts.push(`${segmentOpen ? "L" : "M"}${pointX(index).toFixed(1)},${pointY(value).toFixed(1)}`);
      segmentOpen = true;
    });

    return parts.join(" ");
  };

  return (
    <>
      <div className="series-legend">
        {data.series.map((serie, index) => (
          <span key={serie.label}>
            <i className="leg-dot" style={{ background: palette[index % palette.length] }} />
            {serie.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        {yTicks.map((value, index) => (
          <g key={index}>
            <line
              x1={pad.left}
              y1={pointY(value).toFixed(1)}
              x2={W - pad.right}
              y2={pointY(value).toFixed(1)}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text x={pad.left - 8} y={(pointY(value) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#94A3B8">
              {fmtPctPoint(value)}
            </text>
          </g>
        ))}

        <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.9" />

        {data.series.map((serie, index) => {
          const color = palette[index % palette.length];
          return (
            <g key={serie.label}>
              <path
                d={buildPath(serie.values)}
                fill="none"
                stroke={color}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {serie.values.map((value, valueIndex) =>
                value != null ? (
                  <circle
                    key={`${serie.label}-${valueIndex}`}
                    cx={pointX(valueIndex).toFixed(1)}
                    cy={pointY(value).toFixed(1)}
                    r="3.6"
                    fill={color}
                  />
                ) : null
              )}
            </g>
          );
        })}

        {data.categories.map((label, index) => (
          <text key={label} x={pointX(index).toFixed(1)} y={H - 10} textAnchor="middle" fontSize="12" fill="#94A3B8">
            {label}
          </text>
        ))}
      </svg>
    </>
  );
}

function AnnualInflowsChart({ data }) {
  const W = 1040;
  const H = 300;
  const pad = { top: 18, right: 24, bottom: 48, left: 86 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const values = data.map((item) => item.inflows);
  const maxVal = Math.max(...values, 0) * 1.12;
  const minVal = Math.min(...values, 0) * 1.12;
  const range = maxVal - minVal || 1;
  const slotW = iW / data.length;
  const barW = Math.max(18, slotW * 0.62);

  const yScale = (value) => pad.top + iH * (1 - (value - minVal) / range);
  const zeroY = yScale(0);
  const barY = (value) => (value >= 0 ? yScale(value) : zeroY);
  const barH = (value) => Math.abs((value / range) * iH);
  const xLeft = (index) => pad.left + index * slotW + (slotW - barW) / 2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => minVal + ratio * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((value, index) => (
        <g key={index}>
          <line
            x1={pad.left}
            y1={yScale(value).toFixed(1)}
            x2={W - pad.right}
            y2={yScale(value).toFixed(1)}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text x={pad.left - 8} y={(yScale(value) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {euroCompact.format(value)}
          </text>
        </g>
      ))}

      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.8" />

      {data.map((item, index) => (
        <g key={item.year}>
          <rect
            x={xLeft(index).toFixed(1)}
            y={barY(item.inflows).toFixed(1)}
            width={barW.toFixed(1)}
            height={Math.max(1, barH(item.inflows)).toFixed(1)}
            fill={item.inflows >= 0 ? "#2563EB" : "#DC2626"}
            opacity="0.88"
            rx="4"
          />
          <text
            x={(xLeft(index) + barW / 2).toFixed(1)}
            y={(item.inflows >= 0 ? barY(item.inflows) - 8 : barY(item.inflows) + barH(item.inflows) + 16).toFixed(1)}
            textAnchor="middle"
            fontSize="11"
            fill={item.inflows >= 0 ? "#1E3A8A" : "#991B1B"}
          >
            {euroCompact.format(item.inflows)}
          </text>
          <text
            x={(xLeft(index) + barW / 2).toFixed(1)}
            y={H - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#A0AEC0"
          >
            {item.year}
          </text>
        </g>
      ))}
    </svg>
  );
}

function HistoryTable({ yearlyRows }) {
  const actuals = [...yearlyRows].filter((row) => row.year >= 2021).sort((a, b) => a.year - b.year);
  const currentYear = new Date().getFullYear();
  const actualYearSet = new Set(actuals.map((row) => row.year));
  const futureTargets = EXPONENTIAL_MILESTONES.filter((milestone) => !actualYearSet.has(milestone.year));

  return (
    <div className="table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>Ano</th>
            <th>AUM fin ano</th>
            <th>Crec. AUM</th>
            <th>ARR run rate</th>
            <th>Crec. ARR</th>
            <th>Fee media</th>
          </tr>
        </thead>
        <tbody>
          {actuals.map((row, index) => {
            const prev = actuals[index - 1];
            const yoyAum = prev ? row.volumeEnd / prev.volumeEnd - 1 : null;
            const yoyArr = prev?.arrEnd ? row.arrEnd / prev.arrEnd - 1 : null;
            const isCurrent = row.year === currentYear;
            const milestone = EXPONENTIAL_MILESTONES.find((item) => item.year === row.year);

            return (
              <tr key={row.year} className={isCurrent ? "row-current" : ""}>
                <td className="year-cell">
                  {row.year}
                  {isCurrent ? <span className="ytd-tag">YTD</span> : null}
                </td>
                <td>
                  {euroCompact.format(row.volumeEnd)}
                  {isCurrent && milestone ? <span className="obj-tag"> / obj. {euroCompact.format(milestone.aumTarget)}</span> : null}
                </td>
                <td className={yoyAum != null && yoyAum > 0 ? "col-positive" : ""}>{yoyAum != null ? percent.format(yoyAum) : "-"}</td>
                <td>
                  {euroCompact.format(row.arrEnd)}
                  {isCurrent && milestone ? <span className="obj-tag"> / obj. {euroCompact.format(milestone.arrTarget)}</span> : null}
                </td>
                <td className={yoyArr != null && yoyArr > 0 ? "col-positive" : ""}>{yoyArr != null ? percent.format(yoyArr) : "-"}</td>
                <td>{row.feePctEnd ? percent.format(row.feePctEnd) : "-"}</td>
              </tr>
            );
          })}

          {futureTargets.length > 0 && (
            <tr className="col-divider">
              <td colSpan={6}>Objetivo exponencial - 30M EUR ARR en 2030</td>
            </tr>
          )}

          {futureTargets.map((milestone) => (
            <tr key={milestone.year} className="row-target">
              <td className="year-cell">{milestone.year}</td>
              <td>{euroCompact.format(milestone.aumTarget)}</td>
              <td>-</td>
              <td>{euroCompact.format(milestone.arrTarget)}</td>
              <td>-</td>
              <td>{percent.format(COMPANY_TARGET.feeRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoTooltip({ children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="info-tooltip-wrap">
      <button
        className="info-tooltip-btn"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label="Mas informacion"
      >?</button>
      {visible && <div className="info-tooltip-box">{children}</div>}
    </span>
  );
}

function PeriodComparisonBars({ label, bars }) {
  if (!bars?.length) return null;

  const W = 480;
  const H = 220;
  const pad = { top: 28, bottom: 32, left: 16, right: 16 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...bars.map((b) => b.inflows), 0) * 1.15;
  const slotW = iW / bars.length;
  const barW = Math.max(18, slotW * 0.55);
  const yScale = (v) => pad.top + iH * (1 - v / (maxVal || 1));
  const xCenter = (i) => pad.left + (i + 0.5) * slotW;

  const isMonthly = !label.startsWith("T");

  return (
    <article className="comparison-card">
      <div className="comparison-header">
        <div>
          <h2 className="comparison-title">{label}</h2>
          <p className="comparison-sub">Aportaciones netas · ultimos 4 anos + {new Date().getFullYear()} proyectado</p>
        </div>
        <InfoTooltip>
          {isMonthly ? (
            <>
              <p>Cada barra muestra las <strong>aportaciones netas brutas</strong> del mismo mes en cada uno de los ultimos 4 anos completos.</p>
              <p style={{ marginTop: 8 }}>La barra de <strong>{new Date().getFullYear()}p</strong> es una proyeccion al mes completo calculada asi:</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                aportaciones acumuladas / dias transcurridos × dias totales del mes
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>Util para ver si el ritmo de este mes es alto o bajo comparado con anos anteriores.</p>
            </>
          ) : (
            <>
              <p>Cada barra muestra las <strong>aportaciones netas brutas</strong> del mismo trimestre en cada uno de los ultimos 4 anos completos.</p>
              <p style={{ marginTop: 8 }}>La barra de <strong>{new Date().getFullYear()}p</strong> es una proyeccion al trimestre completo calculada asi:</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                aportaciones acumuladas / dias transcurridos × dias totales del trimestre
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>Util para ver si el ritmo de este trimestre es alto o bajo comparado con anos anteriores.</p>
            </>
          )}
        </InfoTooltip>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        {bars.map((bar, i) => {
          const bh = Math.max(2, iH - (yScale(bar.inflows) - pad.top));
          const by = yScale(bar.inflows);
          const cx = xCenter(i);
          const isProj = bar.isProjected;
          return (
            <g key={bar.year}>
              <rect
                x={(cx - barW / 2).toFixed(1)}
                y={by.toFixed(1)}
                width={barW.toFixed(1)}
                height={bh.toFixed(1)}
                fill={isProj ? "#CCFBF1" : "#0F766E"}
                stroke={isProj ? "#0F766E" : "none"}
                strokeWidth={isProj ? "1.5" : "0"}
                strokeDasharray={isProj ? "4 2" : "none"}
                rx="4"
                opacity={isProj ? 1 : 0.85}
              />
              <text
                x={cx.toFixed(1)}
                y={(by - 6).toFixed(1)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isProj ? "#0F766E" : "#1A202C"}
              >
                {euroCompact.format(bar.inflows)}
              </text>
              <text
                x={cx.toFixed(1)}
                y={(H - 8).toFixed(1)}
                textAnchor="middle"
                fontSize="12"
                fill={isProj ? "#0F766E" : "#718096"}
                fontWeight={isProj ? "700" : "400"}
              >
                {bar.isProjected ? `${bar.year}p` : bar.year}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(() => !localStorage.getItem(DISCLAIMER_KEY));

  const closeDisclaimer = useCallback(() => {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setShowDisclaimer(false);
  }, []);

  useEffect(() => {
    loadIndexaDataset().then(setDataset).catch(setError);
  }, []);

  if (error) return <div className="loading">Error al cargar los datos: {error.message}</div>;
  if (!dataset) return <div className="loading">Cargando datos...</div>;

  const tracker = buildTrackerData(dataset);
  const periodComp = buildPeriodComparison(dataset);
  const {
    currentAum,
    currentArr,
    lastDate,
    targetAumNow,
    targetArrNow,
    aumDeltaPct,
    arrDeltaPct,
    avgMonthlyInflow,
    projectedYeAum,
    targetYearEnd,
    paceDeltaPct,
    chartData,
    decomposition,
    seasonalityMonthly,
    seasonalityQuarterly,
    annualInflows,
    arrYoySeries,
  } = tracker;

  const today = new Date();

  return (
    <div className="app">
      {showDisclaimer && <DisclaimerModal onClose={closeDisclaimer} />}
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1>Indexa Capital Tracker</h1>
            <p className="header-sub">
              Objetivo: 30M EUR ARR en 2030 · implica {euroCompact.format(COMPANY_TARGET.aumEnd)} de AUM a {percent.format(COMPANY_TARGET.feeRate)} de fee
            </p>
          </div>
          <div className="header-meta">
            <span>Ultimo dato</span>
            <strong>{fmtDate(lastDate)}</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section>
          <p className="section-eyebrow">Seguimiento del objetivo · {fmtDate(today)}</p>
          <div className="status-grid">
            <MetricCard
              label="AUM actual"
              value={euroCompact.format(currentAum)}
              sub={`Objetivo hoy: ${euroCompact.format(targetAumNow)} · Objetivo fin de ano: ${euroCompact.format(targetYearEnd)}`}
              delta={aumDeltaPct}
              info={<p>Activos Bajo Gestion a la fecha del ultimo dato. Se compara con la curva objetivo exponencial (CAGR ~22% desde {euroCompact.format(COMPANY_TARGET.aumStart)} a fin de 2025 hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} en 2030). El badge indica si el AUM esta por encima o por debajo de esa curva hoy.</p>}
            />

            <MetricCard
              label="ARR run rate"
              value={euroCompact.format(currentArr)}
              sub={`Objetivo hoy: ${euroCompact.format(targetArrNow)} · Meta 2030: ${euroCompact.format(COMPANY_TARGET.arrEnd)}`}
              delta={arrDeltaPct}
              info={<p>Ingresos Anuales Recurrentes estimados: AUM actual × comision media anual. Es el ritmo de ingresos si el AUM se mantuviera constante un ano entero. El objetivo publico de Indexa es alcanzar 30M€ ARR en 2030.</p>}
            />

            <MetricCard
              label="Proyeccion AUM fin de ano"
              value={euroCompact.format(projectedYeAum)}
              sub={`${euroCompact.format(avgMonthlyInflow)}/mes neto · media 3 meses · objetivo: ${euroCompact.format(targetYearEnd)}`}
              delta={paceDeltaPct}
              info={<><p>Estimacion del AUM a 31 de diciembre calculada como:</p><p style={{marginTop:6, fontFamily:"monospace", fontSize:"0.82em", background:"rgba(255,255,255,0.08)", padding:"4px 8px", borderRadius:4}}>AUM × (1 + 5%/12)^meses + aportaciones_medias × meses</p><p style={{marginTop:6}}>Se asume un 5% anual de rentabilidad de mercado y se extrapola el ritmo de aportaciones netas de los ultimos 3 meses.</p></>}
            />
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>YoY diario de ARR</h2>
                <InfoTooltip><p>Crecimiento interanual del ARR (Ingresos Anuales Recurrentes) dia a dia desde 2022. Para cada fecha se compara el ARR con el valor del mismo dia hace 12 meses, tomando el dato mas reciente disponible si no existe exactamente. Replica la logica de BUSCARX con coincidencia aproximada que se usa habitualmente en Excel para seguimiento diario.</p></InfoTooltip>
              </div>
              <p>ARR actual / ARR hace 12 meses − 1 · datos diarios desde 2022</p>
            </div>
          </div>
          <ArrYoYChart data={arrYoySeries} />
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>Trayectoria de AUM vs objetivo exponencial</h2>
                <InfoTooltip><p>Evolucion mensual del AUM real (linea verde continua) junto con la curva objetivo exponencial (linea gris punteada). La curva se ancla en {euroCompact.format(COMPANY_TARGET.aumStart)} a fin de 2025 y crece a CAGR ~22% hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} en 2030, lo que implica 30M€ ARR a una comision media del 0,25%.</p></InfoTooltip>
              </div>
              <p>Curva objetivo: CAGR ~22% desde {euroCompact.format(COMPANY_TARGET.aumStart)} (fin 2025) hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} (2030)</p>
            </div>
            <div className="chart-legend">
              <span><i className="leg-dot real" />Real mensual</span>
              <span><i className="leg-dash" />Objetivo exponencial</span>
            </div>
          </div>
          <AumChart data={chartData} />
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>Aportaciones netas anuales</h2>
                <InfoTooltip><p>Suma de todas las aportaciones netas brutas de cada ano (entradas menos salidas de dinero). <strong>No incluye la rentabilidad generada por los mercados</strong>, solo el crecimiento organico. Permite ver si el negocio esta captando mas capital ano a ano.</p></InfoTooltip>
              </div>
              <p>Vision agregada por ano para ver la aceleracion del negocio sin ruido mensual</p>
            </div>
          </div>
          <AnnualInflowsChart data={annualInflows} />
        </section>

        <section className="seasonality-grid">
          <PeriodComparisonBars {...periodComp.monthly} />
          <PeriodComparisonBars {...periodComp.quarterly} />
        </section>

        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Estacionalidad mensual de aportaciones</h2>
                  <InfoTooltip><p>Para cada mes, muestra las aportaciones netas como porcentaje de las aportaciones acumuladas a 1 de enero del mismo ano. Normalizar por la base de enero permite <strong>comparar patrones estacionales entre anos de distinto tamano</strong>. Un valor alto indica un mes de captacion fuerte respecto al ritmo del ano.</p></InfoTooltip>
                </div>
                <p>Aportaciones mensuales / aportaciones acumuladas a 1 de enero (%) · ultimos 5 anos</p>
              </div>
            </div>
            <SeasonalityChart data={seasonalityMonthly} />
            <p className="chart-note">
              Grafico de seguimiento para ver si cada mes viene por encima o por debajo del patron historico. El ano en curso puede ir parcial.
            </p>
          </article>

          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Estacionalidad trimestral de aportaciones</h2>
                  <InfoTooltip><p>La misma metrica que la estacionalidad mensual pero agregada por trimestre. Suaviza el ruido de meses individuales y hace mas visible si hay trimestres sistematicamente fuertes o debiles a lo largo del ano.</p></InfoTooltip>
                </div>
                <p>Misma metrica agregada por trimestre para suavizar ruido mensual y ver mejor la pauta anual</p>
              </div>
            </div>
            <SeasonalityChart data={seasonalityQuarterly} />
            <p className="chart-note">
              Cada punto recoge las aportaciones netas del trimestre sobre la base de aportaciones acumuladas al 1 de enero del mismo ano.
            </p>
          </article>
        </section>

        <section className="history-section">
          <div className="chart-title-row">
            <h2>Historico y hitos objetivo</h2>
            <InfoTooltip><p>Datos reales auditados del AUM y ARR a fin de cada ano. Las filas en cursiva son los <strong>hitos objetivo</strong> de la curva exponencial hasta 2030, no datos reales. La fee media futura se asume constante al {percent.format(COMPANY_TARGET.feeRate)} sobre AUM.</p></InfoTooltip>
          </div>
          <p className="section-sub">
            Datos reales auditados + curva exponencial hasta 2030 · Fee media constante al {percent.format(COMPANY_TARGET.feeRate)} sobre AUM
          </p>
          <HistoryTable yearlyRows={dataset.yearlyRows} />
        </section>
      </main>
      <Footer onOpenDisclaimer={() => setShowDisclaimer(true)} />
    </div>
  );
}
