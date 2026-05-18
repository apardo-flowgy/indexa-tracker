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
const BRAND_HOME_URL = "https://apardo-flowgy.github.io/personal-portfolio/";

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#111827" />
      <path
        d="M18 47 29.5 16h5L46 47h-6.5l-2.2-6.4H26.7L24.5 47H18Zm10.5-11.9h7L32 24.7l-3.5 10.4Z"
        fill="#F8FAFC"
      />
      <path
        d="M17 42.5 25.5 36l6.5 2.5 10.5-12 5 2.5"
        fill="none"
        stroke="#2DD4BF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="47.5" cy="29" r="3.2" fill="#FBBF24" />
    </svg>
  );
}

function BrandSignature({ productName }) {
  return (
    <a
      className="brand-signature"
      href={BRAND_HOME_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Alex Finance Lab - ${productName}`}
    >
      <BrandMark />
      <span className="brand-signature-text">
        <span className="brand-name">Alex Finance Lab</span>
        <span className="brand-product">{productName}</span>
      </span>
    </a>
  );
}

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
        <p className="modal-body">
          La web combina datos públicos, una meta 2030 comunicada por la compañía,
          estimaciones de GVC Gaesco y cálculos propios.
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
          <a className="footer-brand-link" href={BRAND_HOME_URL} target="_blank" rel="noopener noreferrer">
            <BrandMark />
            Alex Finance Lab
          </a>
          <a href="#/">
            Dashboard
          </a>
          <a href="#/tesis">
            Tesis de inversión
          </a>
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

function HeaderNav({ activePage }) {
  return (
    <nav className="header-nav" aria-label="Navegación principal">
      <a className={activePage === "dashboard" ? "active" : ""} href="#/">Dashboard</a>
      <a className={activePage === "tesis" ? "active" : ""} href="#/tesis">Tesis</a>
    </nav>
  );
}

function ContextBanner({ today, lastDate }) {
  return (
    <div className="context-band" aria-label="Contexto del dashboard">
      <div>
        <strong>Dashboard independiente, no afiliado a Indexa Capital.</strong>
        <p>
          Datos públicos, meta 2030 comunicada por la compañía, estimaciones de GVC
          Gaesco y cálculos propios.
        </p>
      </div>
      <div className="context-dates">
        <span>Último dato público: <strong>{fmtDate(lastDate)}</strong></span>
        <span>Cálculos actualizados: <strong>{fmtDate(today)}</strong></span>
      </div>
    </div>
  );
}

function SourceMethodology() {
  return (
    <section className="methodology-section">
      <div className="chart-title-row">
        <h2>Fuentes y metodología</h2>
      </div>
      <div className="methodology-grid">
        <div>
          <h3>Qué es dato real</h3>
          <p>
            AUM, ARR estimado, aportaciones y clientes se construyen a partir de datos
            públicos de Indexa Capital y sus documentos para inversores.
          </p>
        </div>
        <div>
          <h3>Qué es referencia propia</h3>
          <p>
            La curva 2030 toma como meta 30 M EUR de ARR y deriva un AUM implícito de
            12.000 M EUR si la fee media se mantiene en el 0,25%.
          </p>
        </div>
        <div>
          <h3>Qué es estimación externa</h3>
          <p>
            Las cifras de clientes y AUM de 2030 atribuidas al informe son el escenario de GVC
            Gaesco, no una guía oficial de Indexa ni una previsión propia de esta web.
          </p>
        </div>
        <div>
          <h3>Cómo se calcula</h3>
          <p>
            ARR = AUM por fee media anual. La proyección de cierre de año extrapola las
            aportaciones netas recientes y asume una rentabilidad de mercado del 5% anual.
          </p>
        </div>
      </div>
    </section>
  );
}

function ThesisTeaser() {
  return (
    <aside className="thesis-teaser" aria-label="Acceso a tesis de inversión">
      <div>
        <span className="section-eyebrow">Tesis de inversión</span>
        <h2>La lectura estratégica detrás del tracker</h2>
        <p>
          Hipótesis, ventajas, escenario GVC, riesgos e invalidadores.
        </p>
      </div>
      <a className="thesis-teaser-link" href="#/tesis">Ver tesis</a>
    </aside>
  );
}

function DashboardIntro({ today, lastDate }) {
  return (
    <section className="dashboard-intro">
      <ContextBanner today={today} lastDate={lastDate} />
      <ThesisTeaser />
    </section>
  );
}

function InvestmentThesisPage({ today, lastDate }) {
  const thesisMetrics = [
    { label: "AUM 2025", value: "4.403 M EUR", note: "cierre 2025 auditado" },
    { label: "Clientes 2025", value: "134 mil", note: "base de la curva 2030" },
    { label: "Beneficio neto 2025", value: "2,4 M EUR", note: "resultado consolidado" },
    { label: "Escenario GVC 2030", value: "16.388 M EUR", note: "AUM estimado por GVC Gaesco" },
  ];

  const pillars = [
    {
      title: "Mercado final grande e infraoptimizado",
      body: "El ahorro español sigue teniendo una elevada exposición a liquidez y productos bancarios de baja remuneración. La tesis asume que una parte creciente de ese capital migrará hacia soluciones de inversión diversificadas, sencillas y de menor coste.",
    },
    {
      title: "Producto con fricción baja",
      body: "Indexa reduce el trabajo operativo del cliente: perfilado, aportaciones, rebalanceos y mantenimiento de cartera. El atractivo no es solo coste, también disciplina y delegación.",
    },
    {
      title: "Ventaja fiscal frente a ETF",
      body: "En España, las carteras basadas en fondos permiten traspasos sin tributación inmediata. Esa característica puede ser una barrera práctica frente a neobancos y brokers centrados en ETF.",
    },
    {
      title: "Apalancamiento operativo",
      body: "Si AUM y clientes crecen más rápido que costes de personal, tecnología y marketing, el margen incremental puede ser elevado. Esta es la parte clave de la tesis bursátil.",
    },
  ];

  const risks = [
    "Caída prolongada de mercados que reduzca AUM, ARR y apetito de aportaciones.",
    "Compresión de comisiones por competencia de bancos, neobancos o roboadvisors.",
    "Cambios fiscales que reduzcan la ventaja de los fondos frente a ETF.",
    "Deterioro de experiencia de usuario, confianza, soporte o reputación de marca.",
    "Baja liquidez de la acción y valoración sensible a la prima exigida por BME Growth.",
    "Ejecución peor de la esperada en Francia, Bewater o nuevas líneas de producto.",
  ];

  return (
    <div className="thesis-page">
      <section className="thesis-hero">
        <p className="section-eyebrow">Tesis de inversión · borrador editorial</p>
        <h2>Indexa como vehículo cotizado para capturar la transición hacia inversión indexada de bajo coste</h2>
        <p className="thesis-lede">
          La tesis preliminar es que Indexa Capital combina un mercado estructuralmente
          favorable, una propuesta de valor simple para el ahorrador, ventaja fiscal local y
          un modelo operativo escalable. La oportunidad bursátil depende de que ese
          crecimiento se traduzca en beneficios, caja y mayor liquidez de la acción.
        </p>
        <div className="thesis-disclaimer">
          Borrador en revisión. Esta página ordena una hipótesis de inversión y no constituye
          recomendación financiera. Algunas cifras proceden de datos públicos y otras de
          estimaciones de GVC Gaesco o cálculos propios.
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>01</span>
          <div>
            <h2>Tesis central</h2>
            <p>
              Indexa puede beneficiarse de una migración gradual desde ahorro bancario y
              fondos caros hacia carteras indexadas, automatizadas y fiscalmente eficientes.
            </p>
          </div>
        </div>
        <div className="thesis-argument">
          <p>
            El argumento no descansa en que Indexa sea simplemente más barata que la banca.
            Descansa en que resuelve un problema conductual: muchos ahorradores no quieren
            construir, rebalancear y sostener una cartera por su cuenta. Compran delegación,
            disciplina y una estructura de costes razonable.
          </p>
          <p>
            Como inversión cotizada, el punto crítico es si esa captación puede sostenerse
            con un coste de adquisición bajo, baja cancelación y costes operativos que crezcan
            más despacio que ingresos y AUM.
          </p>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>02</span>
          <div>
            <h2>Números de partida</h2>
            <p>Datos y referencias para situar el caso antes de entrar en escenarios.</p>
          </div>
        </div>
        <div className="thesis-metric-grid">
          {thesisMetrics.map((metric) => (
            <article className="thesis-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </div>
        <div className="thesis-table-wrap">
          <table className="thesis-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>2025</th>
                <th>2026e</th>
                <th>2030e GVC</th>
                <th>Lectura</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Clientes</td>
                <td>134 mil</td>
                <td>178 mil</td>
                <td>454 mil</td>
                <td>Crecimiento de base y recurrencia potencial.</td>
              </tr>
              <tr>
                <td>AUM</td>
                <td>4.403 M EUR</td>
                <td>5.816 M EUR</td>
                <td>16.388 M EUR</td>
                <td>Principal motor de ARR y valoración.</td>
              </tr>
              <tr>
                <td>Beneficio neto</td>
                <td>2,4 M EUR</td>
                <td>4,9 M EUR</td>
                <td>20,8 M EUR</td>
                <td>Hipótesis de apalancamiento operativo.</td>
              </tr>
              <tr>
                <td>Meta pública</td>
                <td>-</td>
                <td>-</td>
                <td>{euroCompact.format(COMPANY_TARGET.arrEnd)} ARR</td>
                <td>Meta comunicada por la compañía; AUM implícito propio: {euroCompact.format(COMPANY_TARGET.aumEnd)}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>03</span>
          <div>
            <h2>Pilares de la tesis</h2>
            <p>Los puntos que deben seguir siendo ciertos para que la tesis gane fuerza.</p>
          </div>
        </div>
        <div className="thesis-card-grid">
          {pillars.map((pillar) => (
            <article className="thesis-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="thesis-section thesis-two-col">
        <div>
          <div className="thesis-section-head compact">
            <span>04</span>
            <div>
              <h2>Ventajas competitivas a vigilar</h2>
            </div>
          </div>
          <ul className="thesis-list">
            <li>Marca y confianza en una categoría donde el cliente delega patrimonio a largo plazo.</li>
            <li>Coste total competitivo frente a banca tradicional y carteras gestionadas caras.</li>
            <li>Fiscalidad española de fondos, especialmente relevante para rebalanceos.</li>
            <li>Datos históricos de aportaciones netas positivas como señal de comportamiento cliente.</li>
            <li>Opcionalidad en pensiones, Francia, Bewater, mercados privados y cuenta remunerada.</li>
          </ul>
        </div>
        <div>
          <div className="thesis-section-head compact">
            <span>05</span>
            <div>
              <h2>Qué invalidaría la tesis</h2>
            </div>
          </div>
          <ul className="thesis-list">
            <li>Captación neta persistentemente por debajo del ritmo necesario para la meta 2030.</li>
            <li>Reducción de fee media sin compensación suficiente en volumen.</li>
            <li>Costes de personal, marketing o soporte creciendo más rápido que ingresos.</li>
            <li>Pérdida de diferenciación frente a MyInvestor, Finizens, bancos o brokers globales.</li>
            <li>Descuento bursátil permanente por iliquidez o baja cobertura institucional.</li>
          </ul>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>06</span>
          <div>
            <h2>Riesgos principales</h2>
            <p>La tesis debe leerse junto con sus puntos de ruptura, no como una narrativa lineal.</p>
          </div>
        </div>
        <div className="risk-grid">
          {risks.map((risk) => (
            <div className="risk-item" key={risk}>{risk}</div>
          ))}
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>07</span>
          <div>
            <h2>Fuentes base</h2>
            <p>Referencias que conviene mantener enlazadas y contrastar antes de publicar cifras nuevas.</p>
          </div>
        </div>
        <div className="source-list">
          <a href="https://indexacapital.com/es/esp/stats" target="_blank" rel="noopener noreferrer">Estadísticas públicas de Indexa Capital</a>
          <a href="https://group.indexacapital.com/en/documents" target="_blank" rel="noopener noreferrer">Documentos para inversores de Indexa Capital Group</a>
          <a href="https://www.bmegrowth.es/esp/Ficha/INDEXA_CAPITAL_GROUP_ES0105702007.aspx" target="_blank" rel="noopener noreferrer">Ficha de Indexa Capital Group en BME Growth</a>
          <a href="https://www.bmegrowth.es/docs/analisis/2026/04/05702_Analisis_20260413.pdf?Vu2JMQ%21%21=" target="_blank" rel="noopener noreferrer">Informe GVC Gaesco del 13 de abril de 2026</a>
        </div>
        <p className="thesis-footnote">
          Último dato del dashboard: {fmtDate(lastDate)}. Página de tesis actualizada: {fmtDate(today)}.
        </p>
      </section>
    </div>
  );
}

function statusInfo(delta) {
  if (delta == null) return null;
  if (delta >= 0.05) return { label: "Por encima", cls: "badge-ahead" };
  if (delta >= -0.02) return { label: "En línea", cls: "badge-on-track" };
  if (delta >= -0.08) return { label: "Algo por debajo", cls: "badge-behind" };
  return { label: "Por debajo", cls: "badge-off-track" };
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

function useHashRoute() {
  const readRoute = () => window.location.hash.replace(/^#\/?/, "") || "dashboard";
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function StatusBadge({ delta }) {
  const info = statusInfo(delta);
  if (!info) return null;
  return <span className={`badge ${info.cls}`}>vs ref. {info.label}</span>;
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
  { value: 0.50, label: "+50%", color: "#475569" },
  { value: 0.60, label: "+60%", color: "#334155" },
];

const MONTH_LABELS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function ArrYoYChart({ data }) {
  const W = 1100;
  const H = 310;
  const pad = { top: 26, right: 100, bottom: 56, left: 72 };
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
  const endMs   = data.at(-1).date.getTime();
  const timeRange = endMs - startMs || 1;
  const px  = (d)   => pad.left + ((d.date.getTime() - startMs) / timeRange) * iW;
  const pxMs = (ms) => pad.left + ((ms - startMs) / timeRange) * iW;
  const py  = (v)   => pad.top  + iH * (1 - (v - minVal) / range);
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(d).toFixed(1)},${py(d.yoy).toFixed(1)}`).join(" ");

  const yTicks = [];
  for (let v = minVal; v <= maxVal + 0.001; v += tickStep) yTicks.push(Math.round(v * 1000) / 1000);

  // ── Year labels (top row of X axis) ──────────────────────────────────────
  const yearLabels = [];
  const seenY = new Set();
  for (const d of data) {
    const y = d.date.getFullYear();
    if (d.date.getMonth() === 0 && !seenY.has(y)) { seenY.add(y); yearLabels.push({ x: px(d), label: String(y) }); }
  }

  // ── Last-12-months band ───────────────────────────────────────────────────
  const last       = data.at(-1);
  const lastDate   = last.date;
  const base12Ms   = new Date(lastDate.getFullYear() - 1, lastDate.getMonth(), lastDate.getDate()).getTime();
  const xBase12    = Math.max(pxMs(base12Ms), pad.left);
  const xEnd       = pad.left + iW;
  const bandWidth  = xEnd - xBase12;

  // Month marks within the last-12-months window (bottom row of X axis)
  const monthMarks = [];
  {
    const d = new Date(lastDate);
    d.setDate(1);
    // go back 11 months from current month to cover the full window
    d.setMonth(d.getMonth() - 11);
    while (d.getTime() <= lastDate.getTime()) {
      const ms = d.getTime();
      if (ms >= startMs) {
        monthMarks.push({
          x: pxMs(ms),
          label: MONTH_LABELS_SHORT[d.getMonth()],
          isJan: d.getMonth() === 0,
          year: d.getFullYear(),
          month: d.getMonth(),
        });
      }
      d.setMonth(d.getMonth() + 1);
    }
  }

  const baseLabel  = `${MONTH_LABELS_SHORT[lastDate.getMonth()]} ${lastDate.getFullYear() - 1}`;
  const todayLabel = `${MONTH_LABELS_SHORT[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {/* Last-12-months highlight band */}
      <rect x={xBase12.toFixed(1)} y={pad.top} width={bandWidth.toFixed(1)} height={iH}
        fill="#F0FDF4" rx="0" />

      {/* Grid lines */}
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

      {/* Reference lines */}
      {ARR_YOY_REFS.map(({ value, label, color }) => {
        const y = py(value).toFixed(1);
        return (
          <g key={label}>
            <line x1={pad.left} y1={y} x2={xEnd} y2={y} stroke={color} strokeWidth="1.2" strokeDasharray="6 3" />
            <text x={xEnd + 6} y={(py(value) + 4).toFixed(1)} fontSize="11" fill={color} fontWeight="600">{label}</text>
          </g>
        );
      })}

      {/* Vertical line at base-12 (start of comparison window) */}
      <line x1={xBase12.toFixed(1)} y1={pad.top} x2={xBase12.toFixed(1)} y2={pad.top + iH}
        stroke="#16A34A" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />

      {/* Year labels (top X-axis row) */}
      {yearLabels.map(({ x, label }) => (
        <text key={label} x={x.toFixed(1)} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#A0AEC0">{label}</text>
      ))}

      {/* Month marks within the last-12-months band (second X-axis row) */}
      {monthMarks.map(({ x, label, isJan, year, month }) => (
        <g key={`${year}-${month}`}>
          <line x1={x.toFixed(1)} y1={pad.top + iH} x2={x.toFixed(1)} y2={pad.top + iH + 4}
            stroke="#A0AEC0" strokeWidth="1" />
          <text x={x.toFixed(1)} y={H - pad.bottom + 36} textAnchor="middle" fontSize="9.5"
            fill={isJan ? "#64748B" : "#94A3B8"} fontWeight={isJan ? "700" : "400"}>
            {label}
          </text>
        </g>
      ))}

      {/* Band annotation: inside band, near top — no crowding with X-axis ticks */}
      <text x={(xBase12 + 6).toFixed(1)} y={(pad.top + 14).toFixed(1)} fontSize="9" fill="#15803D" fontWeight="600" opacity="0.85">
        ← {baseLabel}
      </text>
      <text x={(xEnd - 4).toFixed(1)} y={(pad.top + 14).toFixed(1)} textAnchor="end" fontSize="9" fill="#15803D" fontWeight="600" opacity="0.85">
        {todayLabel} →
      </text>

      {/* Chart line */}
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

// ── ARR rebaseado a inicio de año ─────────────────────────────────────────────
const YEARLY_PALETTE = [
  { year: 2019, color: "#94A3B8", width: 1.2 },
  { year: 2020, color: "#7DD3FC", width: 1.2 },
  { year: 2021, color: "#A78BFA", width: 1.2 },
  { year: 2022, color: "#F472B6", width: 1.2 },
  { year: 2023, color: "#FB923C", width: 1.5 },
  { year: 2024, color: "#FBBF24", width: 1.5 },
  { year: 2025, color: "#34D399", width: 2 },
  { year: 2026, color: "#22c55e", width: 2.5 },
];
const MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function ArrYearlyIndexChart({ data }) {
  const W = 1100;
  const H = 320;
  const pad = { top: 24, right: 52, bottom: 50, left: 72 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const allPcts = data.flatMap((s) => s.data.map((d) => d.pct));
  const rawMax = Math.max(...allPcts, 0.1);
  const steps = [0.1, 0.2, 0.25, 0.5, 1.0, 2.0];
  const tickStep = steps.find((s) => s >= rawMax / 5) ?? steps.at(-1);
  const maxVal = Math.ceil(rawMax / tickStep) * tickStep;
  const range = maxVal || 1;

  const px = (x) => pad.left + x * iW;
  const py = (v) => pad.top + iH * (1 - v / range);
  const colorMap = new Map(YEARLY_PALETTE.map((c) => [c.year, c]));

  const yTicks = [];
  for (let v = 0; v <= maxVal + 0.001; v += tickStep) yTicks.push(Math.round(v * 1000) / 1000);

  // Nudge labels apart if they're too close vertically
  const MIN_GAP = 13;
  const labelItems = [...data]
    .sort((a, b) => b.data.at(-1).pct - a.data.at(-1).pct)
    .map((series) => ({ series, cfg: colorMap.get(series.year) ?? { color: "#94A3B8", width: 1 }, last: series.data.at(-1), labelY: 0 }));
  const placed = [];
  for (const item of labelItems) {
    let y = py(item.last.pct);
    for (const p of placed) { if (Math.abs(y - p) < MIN_GAP) y = p + MIN_GAP; }
    placed.push(y);
    item.labelY = y;
  }

  const currentYear = new Date().getFullYear();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={py(v).toFixed(1)} x2={pad.left + iW} y2={py(v).toFixed(1)} stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.left - 8} y={(py(v) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            +{(v * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      {MONTH_LABELS.map((label, i) => {
        const x = px(i / 12).toFixed(1);
        return (
          <g key={label}>
            <line x1={x} y1={pad.top} x2={x} y2={pad.top + iH} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 4" />
            <text x={x} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#A0AEC0">{label}</text>
          </g>
        );
      })}
      {data.map((series) => {
        const cfg = colorMap.get(series.year) ?? { color: "#94A3B8", width: 1 };
        const pathD = series.data.map((d, i) => `${i === 0 ? "M" : "L"}${px(d.x).toFixed(1)},${py(d.pct).toFixed(1)}`).join(" ");
        return <path key={series.year} d={pathD} fill="none" stroke={cfg.color} strokeWidth={cfg.width} opacity={series.year === currentYear ? 1 : 0.7} />;
      })}
      {labelItems.map(({ series, cfg, last, labelY }) => (
        <text key={series.year} x={(px(last.x) + 6).toFixed(1)} y={labelY.toFixed(1)}
          fontSize={series.year === currentYear ? 12 : 11} fill={cfg.color}
          fontWeight={series.year === currentYear ? "700" : "400"}
        >
          {series.year}{series.year === currentYear ? ` +${(last.pct * 100).toFixed(1)}%` : ""}
        </text>
      ))}
    </svg>
  );
}

// ── Rentabilidad TWR ──────────────────────────────────────────────────────────
function retBgColor(ret) {
  if (ret == null) return "#F8FAFC";
  if (ret >=  0.10) return "#16A34A";
  if (ret >=  0.05) return "#4ADE80";
  if (ret >=  0.01) return "#BBF7D0";
  if (ret >= -0.01) return "#F8FAFC";
  if (ret >= -0.05) return "#FECACA";
  if (ret >= -0.10) return "#F87171";
  return "#DC2626";
}
function retTextColor(ret) {
  if (ret == null) return "#CBD5E0";
  return Math.abs(ret) >= 0.07 ? "#FFFFFF" : "#1A202C";
}

function ReturnBarsChart({ annualReturns }) {
  const W = 1100, H = 220;
  const pad = { top: 24, right: 20, bottom: 42, left: 60 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  if (!annualReturns?.length) return null;

  const rets = annualReturns.map((r) => r.return);
  const rawMin = Math.min(...rets, 0);
  const rawMax = Math.max(...rets, 0);
  const steps = [0.05, 0.1, 0.15, 0.2, 0.25];
  const roughStep = Math.max(Math.abs(rawMin), rawMax) / 3;
  const tickStep = steps.find((s) => s >= roughStep) ?? 0.25;
  const minVal = Math.floor(rawMin / tickStep) * tickStep;
  const maxVal = Math.ceil(rawMax / tickStep) * tickStep;
  const range = maxVal - minVal || 1;

  const n = annualReturns.length;
  const slotW = iW / n;
  const barW = Math.min(slotW * 0.62, 62);
  const py = (v) => pad.top + iH * (1 - (v - minVal) / range);
  const zeroY = py(0);

  const yTicks = [];
  for (let v = minVal; v <= maxVal + 0.001; v += tickStep)
    yTicks.push(Math.round(v * 1000) / 1000);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={py(v).toFixed(1)} x2={W - pad.right} y2={py(v).toFixed(1)}
            stroke={v === 0 ? "#94A3B8" : "#E2E8F0"} strokeWidth="1"
            strokeDasharray={v === 0 ? "4 3" : undefined} />
          <text x={pad.left - 8} y={(py(v) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {v >= 0 ? "+" : ""}{(v * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      {annualReturns.map((row, i) => {
        const cx = pad.left + (i + 0.5) * slotW;
        const ret = row.return;
        const barTop = ret >= 0 ? py(ret) : zeroY;
        const barH  = Math.max(2, Math.abs(py(0) - py(ret)));
        const fill  = ret >= 0 ? "#22C55E" : "#F87171";
        const lblY  = ret >= 0 ? barTop - 5 : barTop + barH + 13;
        return (
          <g key={row.year}>
            <rect x={(cx - barW / 2).toFixed(1)} y={barTop.toFixed(1)}
              width={barW.toFixed(1)} height={barH.toFixed(1)}
              fill={fill} opacity={row.isPartial ? 0.65 : 1} rx="3" />
            <text x={cx.toFixed(1)} y={lblY.toFixed(1)} textAnchor="middle"
              fontSize="10" fill={fill} fontWeight="600">
              {ret >= 0 ? "+" : ""}{(ret * 100).toFixed(1)}%
            </text>
            <text x={cx.toFixed(1)} y={H - pad.bottom + 16} textAnchor="middle"
              fontSize="11" fill="#718096">
              {row.year}{row.isPartial ? "*" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ReturnMonthlyHeatmap({ monthlyReturns }) {
  if (!monthlyReturns?.length) return null;

  const retMap = new Map(monthlyReturns.map((r) => [`${r.year}-${r.month}`, r.return]));
  const years  = [...new Set(monthlyReturns.map((r) => r.year))].sort((a, b) => a - b);

  const W       = 1100;
  const labelW  = 48;
  const rightP  = 16;
  const topP    = 26;
  const cellW   = (W - labelW - rightP) / 12;
  const cellH   = 26;
  const H       = topP + years.length * cellH + 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ marginTop: "8px" }}>
      {MONTH_LABELS.map((label, i) => (
        <text key={label}
          x={(labelW + (i + 0.5) * cellW).toFixed(1)} y="18"
          textAnchor="middle" fontSize="11" fill="#718096" fontWeight="500">
          {label}
        </text>
      ))}
      {years.map((year, yi) => {
        const rowY = topP + yi * cellH;
        const todayYear = new Date().getFullYear();
        return (
          <g key={year}>
            <text x={(labelW - 6).toFixed(1)} y={(rowY + cellH * 0.68).toFixed(1)}
              textAnchor="end" fontSize="11" fill="#718096">
              {year}{year === todayYear ? "*" : ""}
            </text>
            {Array.from({ length: 12 }, (_, mi) => {
              const ret = retMap.get(`${year}-${mi}`) ?? null;
              const cx  = labelW + (mi + 0.5) * cellW;
              return (
                <g key={mi}>
                  <rect
                    x={(labelW + mi * cellW + 1).toFixed(1)} y={(rowY + 1).toFixed(1)}
                    width={(cellW - 2).toFixed(1)} height={(cellH - 2).toFixed(1)}
                    fill={retBgColor(ret)} rx="3" />
                  {ret != null && (
                    <text x={cx.toFixed(1)} y={(rowY + cellH * 0.68).toFixed(1)}
                      textAnchor="middle" fontSize="9.5" fill={retTextColor(ret)}>
                      {ret >= 0 ? "+" : ""}{(ret * 100).toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
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
            <text x={pad.left - 8} y={(pointY(value) + 4).toFixed(1)} textAnchor="end" fontSize="16" fill="#94A3B8">
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
          <text key={label} x={pointX(index).toFixed(1)} y={H - 10} textAnchor="middle" fontSize="16" fill="#94A3B8">
            {label}
          </text>
        ))}
      </svg>
    </>
  );
}

function AnnualInflowsChart({ data, projection }) {
  const W = 1040;
  const H = 300;
  const pad = { top: 24, right: 24, bottom: 48, left: 86 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const values = data.map((item) => item.inflows);
  const maxVal = Math.max(...values, projection ?? 0, 0) * 1.12;
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
          <text x={pad.left - 8} y={(yScale(value) + 4).toFixed(1)} textAnchor="end" fontSize="16" fill="#A0AEC0">
            {euroCompact.format(value)}
          </text>
        </g>
      ))}

      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.8" />

      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        const cx = xLeft(index) + barW / 2;
        const showProj = isLast && projection != null && projection > item.inflows;
        return (
          <g key={item.year}>
            {showProj && (
              <rect x={xLeft(index).toFixed(1)} y={yScale(projection).toFixed(1)}
                width={barW.toFixed(1)} height={(yScale(item.inflows) - yScale(projection)).toFixed(1)}
                fill="#3B82F6" opacity="0.25" rx="4" />
            )}
            <rect x={xLeft(index).toFixed(1)} y={barY(item.inflows).toFixed(1)}
              width={barW.toFixed(1)} height={Math.max(1, barH(item.inflows)).toFixed(1)}
              fill={item.inflows >= 0 ? "#2563EB" : "#DC2626"} opacity="0.88" rx="4" />
            {showProj && (
              <text x={cx.toFixed(1)} y={(yScale(projection) - 5).toFixed(1)}
                textAnchor="middle" fontSize="14" fill="#64748B">
                {euroCompact.format(projection)} ↑
              </text>
            )}
            <text x={cx.toFixed(1)}
              y={(item.inflows >= 0 ? barY(item.inflows) - 8 : barY(item.inflows) + barH(item.inflows) + 16).toFixed(1)}
              textAnchor="middle" fontSize="15" fill={item.inflows >= 0 ? "#1E3A8A" : "#991B1B"}>
              {euroCompact.format(item.inflows)}
            </text>
            <text x={cx.toFixed(1)} y={H - 8} textAnchor="middle" fontSize="16" fill="#A0AEC0">
              {item.year}{isLast ? "*" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MonthlyInflowsChart({ data, projection }) {
  const W = 1100;
  const H = 280;
  const pad = { top: 20, right: 24, bottom: 44, left: 86 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  if (!data?.length) return null;

  const values  = data.map((d) => d.inflows);
  const maxVal  = Math.max(...values, projection ?? 0, 0) * 1.12;
  const minVal  = Math.min(...values, 0) * 1.12;
  const range   = maxVal - minVal || 1;
  const slotW   = iW / data.length;
  const barW    = Math.max(2, slotW * 0.78);

  const yScale  = (v) => pad.top + iH * (1 - (v - minVal) / range);
  const zeroY   = yScale(0);
  const xCenter = (i) => pad.left + (i + 0.5) * slotW;
  const yTicks  = [0, 0.25, 0.5, 0.75, 1].map((r) => minVal + r * range);

  // Rolling-12m line path
  const rollingPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xCenter(i).toFixed(1)},${yScale(d.rolling12).toFixed(1)}`)
    .join(" ");

  // Year tick labels (January of each year)
  const yearTicks = data
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d.date.getMonth() === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {/* Y grid */}
      {yTicks.map((v, idx) => (
        <g key={idx}>
          <line x1={pad.left} y1={yScale(v).toFixed(1)} x2={W - pad.right} y2={yScale(v).toFixed(1)}
            stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.left - 8} y={(yScale(v) + 4).toFixed(1)} textAnchor="end" fontSize="16" fill="#A0AEC0">
            {euroCompact.format(v)}
          </text>
        </g>
      ))}
      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)}
        stroke="#94A3B8" strokeWidth="0.8" />

      {/* Monthly bars */}
      {data.map((item, i) => {
        const isLast = i === data.length - 1;
        const x   = pad.left + i * slotW + (slotW - barW) / 2;
        const bY  = item.inflows >= 0 ? yScale(item.inflows) : zeroY;
        const bH  = Math.max(1, Math.abs((item.inflows / range) * iH));
        const showProj = isLast && projection != null && projection > item.inflows;
        return (
          <g key={i}>
            {showProj && (
              <rect x={x.toFixed(1)} y={yScale(projection).toFixed(1)}
                width={barW.toFixed(1)} height={(yScale(item.inflows) - yScale(projection)).toFixed(1)}
                fill="#3B82F6" opacity="0.22" rx="1" />
            )}
            <rect x={x.toFixed(1)} y={bY.toFixed(1)}
              width={barW.toFixed(1)} height={bH.toFixed(1)}
              fill={item.inflows >= 0 ? "#3B82F6" : "#EF4444"}
              opacity="0.75" rx="1" />
          </g>
        );
      })}

      {/* Rolling 12-month average line */}
      <path d={rollingPath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />

      {/* Year labels */}
      {yearTicks.map(({ d, i }) => (
        <text key={d.date.getFullYear()}
          x={xCenter(i).toFixed(1)} y={H - pad.bottom + 16}
          textAnchor="middle" fontSize="15" fill="#94A3B8">
          {d.date.getFullYear()}
        </text>
      ))}
    </svg>
  );
}

function ComparisonBarChart({ data }) {
  const W = 820;
  const H = 300;
  const pad = { top: 24, right: 20, bottom: 48, left: 86 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  if (!data?.length) return null;

  const values = data.map((d) => d.inflows);
  const maxVal = Math.max(...values, 0) * 1.15;
  const minVal = Math.min(...values, 0) * 1.15;
  const range  = maxVal - minVal || 1;
  const n      = data.length;
  const slotW  = iW / n;
  const barW   = Math.min(slotW * 0.65, 52);

  const yScale = (v) => pad.top + iH * (1 - (v - minVal) / range);
  const zeroY  = yScale(0);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => minVal + r * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={yScale(v).toFixed(1)} x2={W - pad.right} y2={yScale(v).toFixed(1)}
            stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.left - 8} y={(yScale(v) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {euroCompact.format(v)}
          </text>
        </g>
      ))}
      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.8" />

      {data.map((item, i) => {
        const cx  = pad.left + (i + 0.5) * slotW;
        const x   = cx - barW / 2;
        const bY  = item.inflows >= 0 ? yScale(item.inflows) : zeroY;
        const bH  = Math.max(1, Math.abs((item.inflows / range) * iH));
        const fill = item.isCurrent ? "#22C55E" : (item.inflows >= 0 ? "#3B82F6" : "#EF4444");
        return (
          <g key={item.year}>
            <rect x={x.toFixed(1)} y={bY.toFixed(1)} width={barW.toFixed(1)} height={bH.toFixed(1)}
              fill={fill} opacity={item.isCurrent ? 1 : 0.82} rx="3" />
            <text x={cx.toFixed(1)} y={(bY - 5).toFixed(1)} textAnchor="middle" fontSize="9.5"
              fill={item.isCurrent ? "#15803D" : "#718096"}>
              {euroCompact.format(item.inflows)}
            </text>
            <text x={cx.toFixed(1)} y={H - pad.bottom + 16} textAnchor="middle" fontSize="11"
              fill={item.isCurrent ? "#15803D" : "#A0AEC0"} fontWeight={item.isCurrent ? "700" : "400"}>
              {item.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StackedComparisonBarChart({ data }) {
  const W = 820;
  const H = 340;
  const pad = { top: 44, right: 20, bottom: 48, left: 86 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  if (!data?.length) return null;

  const allVals = data.flatMap((d) => [d.partial, d.full]).filter((v) => v != null);
  const maxVal = Math.max(...allVals, 0) * 1.18;
  const minVal = Math.min(...allVals, 0) * 1.15;
  const range  = maxVal - minVal || 1;
  const n      = data.length;
  const slotW  = iW / n;
  const barW   = Math.min(slotW * 0.72, 54);

  const yScale = (v) => pad.top + iH * (1 - (v - minVal) / range);
  const zeroY  = yScale(0);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => minVal + r * range);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={yScale(v).toFixed(1)} x2={W - pad.right} y2={yScale(v).toFixed(1)}
            stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.left - 8} y={(yScale(v) + 4).toFixed(1)} textAnchor="end" fontSize="16" fill="#A0AEC0">
            {euroCompact.format(v)}
          </text>
        </g>
      ))}
      <line x1={pad.left} y1={zeroY.toFixed(1)} x2={W - pad.right} y2={zeroY.toFixed(1)} stroke="#94A3B8" strokeWidth="0.8" />

      {data.map((item, i) => {
        const cx = pad.left + (i + 0.5) * slotW;
        const x  = cx - barW / 2;

        // Background bar = full year/month (or projection for current)
        const fullFill = item.isCurrent ? "#86EFAC" : (item.full >= 0 ? "#93C5FD" : "#FCA5A5");
        const fullY = item.full >= 0 ? yScale(item.full) : zeroY;
        const fullH = Math.max(1, Math.abs((item.full / range) * iH));

        // Foreground bar = partial (comparable slice up to same day)
        const partFill = item.isCurrent ? "#22C55E" : (item.partial >= 0 ? "#3B82F6" : "#EF4444");
        const partY = item.partial >= 0 ? yScale(item.partial) : zeroY;
        const partH = Math.max(1, Math.abs((item.partial / range) * iH));

        // YoY% comparing same-period slice
        const prev = data[i - 1];
        const yoyPct = prev && prev.partial ? (item.partial / prev.partial - 1) : null;

        // Place YoY label above the full bar
        const topY = item.full >= 0 ? fullY : zeroY;

        return (
          <g key={item.year}>
            {/* Full / projected bar (background, lighter) */}
            <rect x={x.toFixed(1)} y={fullY.toFixed(1)} width={barW.toFixed(1)} height={fullH.toFixed(1)}
              fill={fullFill} opacity={0.45} rx="3" />
            {/* Partial bar (foreground, solid) */}
            <rect x={x.toFixed(1)} y={partY.toFixed(1)} width={barW.toFixed(1)} height={partH.toFixed(1)}
              fill={partFill} opacity={item.isCurrent ? 1 : 0.85} rx="3" />

            {/* Partial value label */}
            <text x={cx.toFixed(1)} y={(partY - 4).toFixed(1)} textAnchor="middle" fontSize="11"
              fill={item.isCurrent ? "#15803D" : "#718096"}>
              {euroCompact.format(item.partial)}
            </text>

            {/* YoY% label above full bar */}
            {yoyPct != null && (
              <text x={cx.toFixed(1)} y={(topY - 6).toFixed(1)} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={yoyPct >= 0 ? "#059669" : "#DC2626"}>
                {yoyPct >= 0 ? "+" : ""}{(yoyPct * 100).toFixed(0)}%
              </text>
            )}

            {/* Year label */}
            <text x={cx.toFixed(1)} y={H - pad.bottom + 18} textAnchor="middle" fontSize="15"
              fill={item.isCurrent ? "#15803D" : "#A0AEC0"} fontWeight={item.isCurrent ? "700" : "400"}>
              {item.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Clientes históricos anuales (fin de año, datos auditados / benchmark GVC Gaesco)
const CLIENTS_ANNUAL = [
  { year: 2021, clients: 50000 },
  { year: 2022, clients: 59000 },
  { year: 2023, clients: 69000 },
  { year: 2024, clients: 96000 },
  { year: 2025, clients: 134000 },
];
const CLIENTS_TARGETS = [
  { year: 2025, clients: 134000 }, // ancla de la referencia GVC Gaesco
  { year: 2026, clients: 178000 },
  { year: 2027, clients: 230000 },
  { year: 2028, clients: 292000 },
  { year: 2029, clients: 366000 },
  { year: 2030, clients: 454000 },
];

function ClientsChart({ data }) {
  const W = 1100, H = 280;
  const pad = { top: 28, right: 56, bottom: 44, left: 72 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  // Fixed time range: 2021-01-01 → 2030-12-31
  const startMs   = new Date("2021-01-01T00:00:00").getTime();
  const endMs     = new Date("2030-12-31T00:00:00").getTime();
  const timeRange = endMs - startMs;

  const yMin  = 0;
  const yMax  = 480000;
  const range = yMax - yMin;

  const pxMs = (ms) => pad.left + ((ms - startMs) / timeRange) * iW;
  const pxYE = (y)  => pxMs(new Date(`${y}-12-31T00:00:00`).getTime());
  const py   = (v)  => pad.top + iH * (1 - (v - yMin) / range);

  // Y ticks
  const yTicks = [0, 100000, 200000, 300000, 400000];

  // X ticks: one per year
  const yearTicks = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Actual real data path (CSV: histórico anual + scrapeado diario)
  const realPath = (data ?? [])
    .map((d, i) => `${i === 0 ? "M" : "L"}${pxMs(d.date.getTime()).toFixed(1)},${py(d.clients).toFixed(1)}`)
    .join(" ");

  // Annual markers (end-of-year dots from CLIENTS_ANNUAL)
  // Target dashed path
  const targetPath = CLIENTS_TARGETS
    .map((p, i) => `${i === 0 ? "M" : "L"}${pxYE(p.year).toFixed(1)},${py(p.clients).toFixed(1)}`)
    .join(" ");

  const last = data?.at(-1);

  // Daily rate (last 30 scraped points or less)
  const scraped = (data ?? []).filter((d) => d.date.getFullYear() >= 2026);
  const daysBack = Math.min(30, scraped.length - 1);
  const dailyAvg = daysBack > 0
    ? (scraped.at(-1).clients - scraped[scraped.length - 1 - daysBack].clients) / daysBack
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {/* Grid */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={py(v).toFixed(1)} x2={W - pad.right} y2={py(v).toFixed(1)}
            stroke="#E2E8F0" strokeWidth="1" />
          <text x={pad.left - 8} y={(py(v) + 4).toFixed(1)} textAnchor="end" fontSize="12" fill="#A0AEC0">
            {v === 0 ? "0" : `${v / 1000}k`}
          </text>
        </g>
      ))}

      {/* Year ticks */}
      {yearTicks.map((y) => {
        const x = pxYE(y);
        const isFuture = y >= new Date().getFullYear();
        return (
          <g key={y}>
            <line x1={x.toFixed(1)} y1={pad.top + iH} x2={x.toFixed(1)} y2={pad.top + iH + 4}
              stroke="#CBD5E1" strokeWidth="1" />
            <text x={x.toFixed(1)} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11"
              fill={isFuture ? "#CBD5E1" : "#A0AEC0"}>
              {y}{isFuture ? "e" : ""}
            </text>
          </g>
        );
      })}

      {/* Target dashed line */}
      <path d={targetPath} fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 3" />
      {CLIENTS_TARGETS.slice(1).map((p) => (
        <g key={p.year}>
          <circle cx={pxYE(p.year).toFixed(1)} cy={py(p.clients).toFixed(1)} r="3" fill="#CBD5E1" />
          <text x={(pxYE(p.year) + 5).toFixed(1)} y={(py(p.clients) - 6).toFixed(1)}
            fontSize="10" fill="#A0AEC0">{`${p.clients / 1000}k`}</text>
        </g>
      ))}

      {/* Annual historical dots */}
      {CLIENTS_ANNUAL.map((p) => (
        <circle key={p.year} cx={pxYE(p.year).toFixed(1)} cy={py(p.clients).toFixed(1)}
          r="4" fill="#0F766E" />
      ))}

      {/* Real line (CSV data) */}
      {realPath && <path d={realPath} fill="none" stroke="#0F766E" strokeWidth="2.2" />}

      {/* Latest label */}
      {last && (
        <g>
          <circle cx={pxMs(last.date.getTime()).toFixed(1)} cy={py(last.clients).toFixed(1)} r="5" fill="#0F766E" />
          <text x={(pxMs(last.date.getTime()) + 8).toFixed(1)} y={(py(last.clients) + 4).toFixed(1)}
            fontSize="12" fill="#0F766E" fontWeight="700">
            {last.clients.toLocaleString("es-ES")}
          </text>
          {dailyAvg != null && dailyAvg > 0 && (
            <text x={(pxMs(last.date.getTime()) + 8).toFixed(1)} y={(py(last.clients) + 18).toFixed(1)}
              fontSize="10" fill="#718096">
              +{Math.round(dailyAvg)}/día (últ. {daysBack}d)
            </text>
          )}
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${pad.left}, ${pad.top - 10})`}>
        <circle cx="6" cy="0" r="4" fill="#0F766E" />
        <text x="14" y="4" fontSize="10" fill="#718096">Real</text>
        <line x1="60" y1="0" x2="82" y2="0" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="88" y="4" fontSize="10" fill="#A0AEC0">Estimación GVC Gaesco</text>
      </g>
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
            <th>ARR estimado</th>
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
                  {isCurrent && milestone ? <span className="obj-tag"> / ref. {euroCompact.format(milestone.aumTarget)}</span> : null}
                </td>
                <td className={yoyAum != null && yoyAum > 0 ? "col-positive" : ""}>{yoyAum != null ? percent.format(yoyAum) : "-"}</td>
                <td>
                  {euroCompact.format(row.arrEnd)}
                  {isCurrent && milestone ? <span className="obj-tag"> / ref. {euroCompact.format(milestone.arrTarget)}</span> : null}
                </td>
                <td className={yoyArr != null && yoyArr > 0 ? "col-positive" : ""}>{yoyArr != null ? percent.format(yoyArr) : "-"}</td>
                <td>{row.feePctEnd ? percent.format(row.feePctEnd) : "-"}</td>
              </tr>
            );
          })}

          {futureTargets.length > 0 && (
            <tr className="col-divider">
              <td colSpan={6}>Referencia propia - 30 M EUR ARR en 2030</td>
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
          <p className="comparison-sub">Aportaciones netas · ultimos 4 años + {new Date().getFullYear()} proyectado</p>
        </div>
        <InfoTooltip>
          {isMonthly ? (
            <>
              <p>Cada barra muestra las <strong>aportaciones netas brutas</strong> del mismo mes en cada uno de los ultimos 4 años completos.</p>
              <p style={{ marginTop: 8 }}>La barra de <strong>{new Date().getFullYear()}p</strong> es una proyeccion al mes completo calculada asi:</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                aportaciones acumuladas / dias transcurridos × dias totales del mes
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>Util para ver si el ritmo de este mes es alto o bajo comparado con años anteriores.</p>
            </>
          ) : (
            <>
              <p>Cada barra muestra las <strong>aportaciones netas brutas</strong> del mismo trimestre en cada uno de los ultimos 4 años completos.</p>
              <p style={{ marginTop: 8 }}>La barra de <strong>{new Date().getFullYear()}p</strong> es una proyeccion al trimestre completo calculada asi:</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                aportaciones acumuladas / dias transcurridos × dias totales del trimestre
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>Util para ver si el ritmo de este trimestre es alto o bajo comparado con años anteriores.</p>
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
  const route = useHashRoute();

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
    monthlyInflowsData,
    ytdComparison,
    mtdComparison,
    annualProjection,
    monthlyProjection,
    arrYoySeries,
    arrYearlyIndex,
    twrData,
  } = tracker;

  const today = new Date();
  const isThesisPage = route === "tesis";

  return (
    <div className="app">
      {showDisclaimer && <DisclaimerModal onClose={closeDisclaimer} />}
      <header className="app-header">
        <div className="header-inner">
          <div>
            <BrandSignature productName="Indexa Tracker" />
            <h1>Indexa Capital Tracker</h1>
            <p className="header-sub">
              Seguimiento independiente. Meta 2030 comunicada por la compañía: {euroCompact.format(COMPANY_TARGET.arrEnd)} ARR · AUM implícito: {euroCompact.format(COMPANY_TARGET.aumEnd)} con fee media del {percent.format(COMPANY_TARGET.feeRate)}
            </p>
            <HeaderNav activePage={isThesisPage ? "tesis" : "dashboard"} />
          </div>
          <div className="header-meta">
            <span>Último dato público</span>
            <strong>{fmtDate(lastDate)}</strong>
            <span>Cálculos actualizados</span>
            <strong>{fmtDate(today)}</strong>
          </div>
        </div>
      </header>

      <main className={`app-main ${isThesisPage ? "app-main-thesis" : ""}`}>
        {isThesisPage ? (
          <InvestmentThesisPage today={today} lastDate={lastDate} />
        ) : (
          <>
            <DashboardIntro today={today} lastDate={lastDate} />

        <section>
          <p className="section-eyebrow">Resumen vs referencia 2030 · {fmtDate(today)}</p>
          <div className="status-grid">
            <MetricCard
              label="AUM último dato público"
              value={euroCompact.format(currentAum)}
              sub={`Referencia hoy: ${euroCompact.format(targetAumNow)} · Referencia cierre de año: ${euroCompact.format(targetYearEnd)}`}
              delta={aumDeltaPct}
              info={<p>Activos bajo gestión a la fecha del último dato público. Se compara con una curva de referencia propia: CAGR ~22% desde {euroCompact.format(COMPANY_TARGET.aumStart)} a fin de 2025 hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} en 2030. El badge indica la posición frente a esa referencia.</p>}
            />

            <MetricCard
              label="ARR estimado"
              value={euroCompact.format(currentArr)}
              sub={`Referencia hoy: ${euroCompact.format(targetArrNow)} · Meta 2030 comunicada: ${euroCompact.format(COMPANY_TARGET.arrEnd)}`}
              delta={arrDeltaPct}
              info={<p>Ingresos anuales recurrentes estimados: AUM actual × comisión media anual. Es el ritmo de ingresos si el AUM se mantuviera constante un año entero. La meta de 30 M EUR ARR en 2030 fue comunicada por Indexa y está recogida en el informe de GVC Gaesco.</p>}
            />

            <MetricCard
              label="AUM fin de año estimado"
              value={euroCompact.format(projectedYeAum)}
              sub={`Estimación propia · ${euroCompact.format(avgMonthlyInflow)}/mes neto · referencia: ${euroCompact.format(targetYearEnd)}`}
              delta={paceDeltaPct}
              info={<><p>Estimación propia del AUM a 31 de diciembre calculada como:</p><p style={{marginTop:6, fontFamily:"monospace", fontSize:"0.82em", background:"rgba(255,255,255,0.08)", padding:"4px 8px", borderRadius:4}}>AUM × (1 + 5%/12)^meses + aportaciones_medias × meses</p><p style={{marginTop:6}}>Se asume un 5% anual de rentabilidad de mercado y se extrapola el ritmo de aportaciones netas de los últimos 3 meses.</p></>}
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
                <h2>ARR indexado a inicio de año · comparativa anual</h2>
                <InfoTooltip><p>Cada linea parte de 0% el 1 de enero y muestra cuanto creció el ARR a lo largo de ese año. Permite comparar la velocidad de crecimiento dentro del año independientemente del nivel absoluto: si 2026 crece más rápido que 2025 en el mismo periodo del año, es una señal de aceleración real y no de efecto base.</p></InfoTooltip>
              </div>
              <p>ARR relativo a su valor a 1 de enero de cada año · datos diarios desde 2019</p>
            </div>
          </div>
          <ArrYearlyIndexChart data={arrYearlyIndex} />
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>AUM real vs curva de referencia 2030</h2>
                <InfoTooltip><p>Evolución mensual del AUM real (línea verde continua) junto con una curva de referencia propia (línea gris punteada). La curva se ancla en {euroCompact.format(COMPANY_TARGET.aumStart)} a fin de 2025 y crece a CAGR ~22% hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} en 2030, el AUM implícito para alcanzar 30 M EUR ARR con una comisión media del 0,25%.</p></InfoTooltip>
              </div>
              <p>Curva de referencia propia: CAGR ~22% desde {euroCompact.format(COMPANY_TARGET.aumStart)} (fin 2025) hasta {euroCompact.format(COMPANY_TARGET.aumEnd)} (2030)</p>
            </div>
            <div className="chart-legend">
              <span><i className="leg-dot real" />Real mensual</span>
              <span><i className="leg-dash" />Referencia propia</span>
            </div>
          </div>
          <AumChart data={chartData} />
        </section>

        {/* ── Fila 1: Histórico anual + histórico mensual ── */}
        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Aportaciones netas anuales</h2>
                  <InfoTooltip><p>Suma de aportaciones netas de cada ano. La barra del ano en curso muestra el acumulado hasta el ultimo dato; la extension transparente es la proyeccion al cierre del ano al ritmo actual. * = dato parcial.</p></InfoTooltip>
                </div>
                <p>Vision agregada por ano · * proyeccion al cierre del ano al ritmo actual</p>
              </div>
            </div>
            <AnnualInflowsChart data={annualInflows} projection={annualProjection} />
          </article>
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Aportaciones netas mensuales</h2>
                  <InfoTooltip><p>Entradas menos salidas de dinero cada mes desde 2016. La linea amarilla es la media movil de 12 meses. La extension transparente en el ultimo mes es la proyeccion al cierre del mes al ritmo actual.</p></InfoTooltip>
                </div>
                <p>Barras azules: mes completo · extension translucida: proyeccion fin de mes · linea: media movil 12m</p>
              </div>
            </div>
            <MonthlyInflowsChart data={monthlyInflowsData} projection={monthlyProjection} />
          </article>
        </section>

        {/* ── Fila 2: YTD comparativa + MTD comparativa (barras apiladas) ── */}
        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>YTD — comparativa entre años</h2>
                  <InfoTooltip><p>Barra solida: aportaciones acumuladas desde el 1 de enero hasta el mismo dia del ano que el ultimo dato disponible (comparable entre años). Barra clara detras: total del ano completo (o proyeccion para el ano actual). El % sobre cada barra es el crecimiento vs el mismo periodo del ano anterior.</p></InfoTooltip>
                </div>
                <p>Solido: 1 ene → {lastDate ? `${lastDate.getDate()} ${MONTH_LABELS[lastDate.getMonth()]}` : "hoy"} · claro: ano completo / proyectado · % = YoY del mismo periodo</p>
              </div>
            </div>
            <StackedComparisonBarChart data={ytdComparison} />
          </article>
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>MTD — comparativa entre años</h2>
                  <InfoTooltip><p>Barra solida: aportaciones del 1 al dia actual del mes, en cada ano. Barra clara: total del mes completo (o proyeccion para el mes actual). El % muestra el crecimiento vs el mismo tramo del ano anterior.</p></InfoTooltip>
                </div>
                <p>Solido: 1–{lastDate?.getDate() ?? "?"} {lastDate ? MONTH_LABELS[lastDate.getMonth()] : "—"} · claro: mes completo / proyectado · % = YoY del mismo periodo</p>
              </div>
            </div>
            <StackedComparisonBarChart data={mtdComparison} />
          </article>
        </section>



        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Estacionalidad mensual de aportaciones</h2>
                  <InfoTooltip><p>Para cada mes, muestra las aportaciones netas como porcentaje de las aportaciones acumuladas a 1 de enero del mismo ano. Normalizar por la base de enero permite <strong>comparar patrones estacionales entre años de distinto tamano</strong>. Un valor alto indica un mes de captacion fuerte respecto al ritmo del ano.</p></InfoTooltip>
                </div>
                <p>Aportaciones mensuales / aportaciones acumuladas a 1 de enero (%) · ultimos 5 años</p>
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

        {dataset.clientsHistory?.length > 1 && (
          <section className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Evolución de clientes</h2>
                  <InfoTooltip><p>Número de clientes publicado en la página de testimonios de Indexa Capital, capturado automáticamente varias veces al día. La línea gris muestra la estimación de GVC Gaesco hasta 2030, no una guía oficial de Indexa. El ritmo diario se calcula como la media de los últimos 30 días.</p></InfoTooltip>
                </div>
                <p>
                  Clientes actuales: <strong>{dataset.clientsHistory.at(-1).clients.toLocaleString("es-ES")}</strong>
                  {" · "}
                  Datos desde {dataset.clientsHistory[0].date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <ClientsChart data={dataset.clientsHistory} />
          </section>
        )}

        {twrData && (
          <section className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>Rentabilidad de la cartera (TWR)</h2>
                  <InfoTooltip><p>Time-Weighted Return diario con convencion fin-de-dia: factor = (V_fin − CF_dia) / V_ini. Las aportaciones del dia no participan en la rentabilidad de ese dia (se asume compra al cierre). Aisla la rentabilidad pura de la cartera eliminando el efecto del tamano y timing de las aportaciones. Los factores diarios se encadenan por ano y mes.</p></InfoTooltip>
                </div>
                <p>
                  TWR anualizado: <strong>{percent.format(twrData.twrAnnualized)}</strong>
                  {" · "}
                  {new Date().getFullYear()}: <strong>{percent.format(twrData.currentYearReturn ?? 0)}</strong> (parcial)
                  {" · "}
                  Acumulado: <strong>+{(twrData.twrAccumulated * 100).toFixed(0)}%</strong> en {twrData.yearsSpan.toFixed(1)} años
                </p>
              </div>
            </div>
            <ReturnBarsChart annualReturns={twrData.annualReturns.filter((r) => r.year >= 2021)} />
            <p className="chart-note" style={{ marginTop: 16, marginBottom: 4 }}>Desglose mensual — verde: rentabilidad positiva · rojo: negativa · intensidad proporcional a la magnitud</p>
            <ReturnMonthlyHeatmap monthlyReturns={twrData.monthlyReturns.filter((r) => r.year >= 2021)} />
            <p className="chart-note">* Ano en curso, datos parciales hasta el ultimo dato disponible.</p>
          </section>
        )}

        <section className="history-section">
          <div className="chart-title-row">
            <h2>Histórico y referencias 2030</h2>
            <InfoTooltip><p>Datos reales auditados del AUM y ARR a fin de cada año. Las filas en cursiva son <strong>referencias propias</strong> de la curva 2030, no datos reales ni guía oficial. La fee media futura se asume constante al {percent.format(COMPANY_TARGET.feeRate)} sobre AUM.</p></InfoTooltip>
          </div>
          <p className="section-sub">
            Datos reales auditados + curva de referencia hasta 2030 · Fee media constante al {percent.format(COMPANY_TARGET.feeRate)} sobre AUM
          </p>
          <HistoryTable yearlyRows={dataset.yearlyRows} />
        </section>

        <SourceMethodology />
          </>
        )}
      </main>
      <Footer onOpenDisclaimer={() => setShowDisclaimer(true)} />
    </div>
  );
}
