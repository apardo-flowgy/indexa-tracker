import { useEffect, useState } from "react";
import {
  buildTrackerData,
  COMPANY_TARGET,
  euroCompact,
  EXPONENTIAL_MILESTONES,
  loadIndexaDataset,
  percent,
} from "./data";

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

function MetricCard({ label, value, sub, delta }) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-sub">{sub}</span>
      <StatusBadge delta={delta} />
    </article>
  );
}

function AumChart({ data }) {
  const W = 960;
  const H = 280;
  const pad = { top: 14, right: 28, bottom: 44, left: 82 };
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
          <text x={pad.left - 8} y={(pointY(value) + 4).toFixed(1)} textAnchor="end" fontSize="11" fill="#A0AEC0">
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
        <text key={index} x={pointX(index).toFixed(1)} y={H - 6} textAnchor="middle" fontSize="11" fill="#A0AEC0">
          {data[index].label}
        </text>
      ))}
    </svg>
  );
}

function InflowsChart({ data }) {
  const W = 840;
  const H = 200;
  const pad = { top: 14, right: 28, bottom: 44, left: 82 };
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
          <text x={pad.left - 8} y={(yScale(value) + 4).toFixed(1)} textAnchor="end" fontSize="11" fill="#A0AEC0">
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
          <text key={index} x={xCenter(index).toFixed(1)} y={H - 6} textAnchor="middle" fontSize="11" fill="#A0AEC0">
            {item.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

function SeasonalityChart({ data }) {
  const W = 840;
  const H = 240;
  const pad = { top: 16, right: 20, bottom: 42, left: 54 };
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
            <text x={pad.left - 8} y={(pointY(value) + 4).toFixed(1)} textAnchor="end" fontSize="11" fill="#94A3B8">
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
          <text key={label} x={pointX(index).toFixed(1)} y={H - 8} textAnchor="middle" fontSize="11" fill="#94A3B8">
            {label}
          </text>
        ))}
      </svg>
    </>
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

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIndexaDataset().then(setDataset).catch(setError);
  }, []);

  if (error) return <div className="loading">Error al cargar los datos: {error.message}</div>;
  if (!dataset) return <div className="loading">Cargando datos...</div>;

  const tracker = buildTrackerData(dataset);
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
  } = tracker;

  const today = new Date();

  return (
    <div className="app">
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
            />

            <MetricCard
              label="ARR run rate"
              value={euroCompact.format(currentArr)}
              sub={`Objetivo hoy: ${euroCompact.format(targetArrNow)} · Meta 2030: ${euroCompact.format(COMPANY_TARGET.arrEnd)}`}
              delta={arrDeltaPct}
            />

            <MetricCard
              label="Proyeccion AUM fin de ano"
              value={euroCompact.format(projectedYeAum)}
              sub={`${euroCompact.format(avgMonthlyInflow)}/mes neto · media 3 meses · objetivo: ${euroCompact.format(targetYearEnd)}`}
              delta={paceDeltaPct}
            />
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <h2>Trayectoria de AUM vs objetivo exponencial</h2>
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
              <h2>Aportaciones netas vs retorno de mercado</h2>
              <p>Ultimos 18 meses · separa crecimiento organico de apreciacion de mercado</p>
            </div>
            <div className="chart-legend">
              <span><i className="leg-dot" style={{ background: "#3B82F6" }} />Entradas netas</span>
              <span><i className="leg-dot" style={{ background: "#10B981" }} />Retorno mercado</span>
            </div>
          </div>
          <InflowsChart data={decomposition} />
        </section>

        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <h2>Estacionalidad mensual de aportaciones</h2>
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
                <h2>Estacionalidad trimestral de aportaciones</h2>
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
          <h2>Historico y hitos objetivo</h2>
          <p className="section-sub">
            Datos reales auditados + curva exponencial hasta 2030 · Fee media constante al {percent.format(COMPANY_TARGET.feeRate)} sobre AUM
          </p>
          <HistoryTable yearlyRows={dataset.yearlyRows} />
        </section>
      </main>
    </div>
  );
}
