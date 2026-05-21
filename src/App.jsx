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

const I18N = {
  es: {
    importantNotice: "Aviso importante",
    disclaimer1: (
      <>
        Esta web es un <strong>proyecto independiente creado por inversores</strong> de
        Indexa Capital para monitorizar el crecimiento de la compañía y hacer
        seguimiento de sus métricas públicas.
      </>
    ),
    disclaimer2: (
      <>
        No tiene ninguna relación ni afiliación con <strong>Indexa Capital</strong>.
        Los datos provienen de fuentes públicas y pueden contener inexactitudes.
        Esta herramienta no constituye asesoramiento financiero.
      </>
    ),
    disclaimer3:
      "La web combina datos públicos, una meta 2030 comunicada por la compañía, estimaciones de GVC Gaesco y cálculos propios.",
    understood: "Entendido",
    dashboard: "Dashboard",
    thesis: "Tesis",
    news: "Noticias",
    investmentThesis: "Tesis de inversión",
    officialWebsite: "Web oficial",
    publicData: "Datos públicos",
    investorDocs: "Documentos inversores",
    legalNotice: "Aviso legal",
    navLabel: "Navegación principal",
    langLabel: "Idioma",
    contextLabel: "Contexto del dashboard",
    independentDashboard: "Dashboard independiente, no afiliado a Indexa Capital.",
    contextText:
      "Datos públicos, meta 2030 comunicada por la compañía, estimaciones de GVC Gaesco y cálculos propios.",
    lastPublicData: "Último dato público",
    calculationsUpdated: "Cálculos actualizados",
    methodologyTitle: "Fuentes y metodología",
    realDataTitle: "Qué es dato real",
    realDataText:
      "AUM, ARR estimado, aportaciones y clientes se construyen a partir de datos públicos de Indexa Capital y sus documentos para inversores.",
    ownReferenceTitle: "Qué es referencia propia",
    ownReferenceText:
      "La curva 2030 toma como meta 30 M EUR de ARR y deriva un AUM implícito de 12.000 M EUR si la fee media se mantiene en el 0,25%.",
    externalEstimateTitle: "Qué es estimación externa",
    externalEstimateText:
      "Las cifras de clientes y AUM de 2030 atribuidas al informe son el escenario de GVC Gaesco, no una guía oficial de Indexa ni una previsión propia de esta web.",
    calculationTitle: "Cómo se calcula",
    calculationText:
      "ARR = AUM por fee media anual. La proyección de cierre de año extrapola las aportaciones netas recientes y asume una rentabilidad de mercado del 5% anual.",
    thesisTeaserLabel: "Tesis de inversión",
    thesisTeaserTitle: "La lectura estratégica detrás del tracker",
    thesisTeaserText: "Hipótesis, ventajas, escenario GVC, riesgos e invalidadores.",
    seeThesis: "Ver tesis",
    loadingData: "Cargando datos...",
    loadingError: "Error al cargar los datos",
    summaryVsReference: "Resumen vs referencia 2030",
    latestAum: "AUM último dato público",
    estimatedArr: "ARR estimado",
    estimatedYearEndAum: "AUM fin de año estimado",
    todayReference: "Referencia hoy",
    yearEndReference: "Referencia cierre de año",
    communicatedTarget2030: "Meta 2030 comunicada",
    ownEstimate: "Estimación propia",
    netPerMonth: "mes neto",
    reference: "referencia",
    vsReference: "vs ref.",
    aboveReference: "Por encima",
    onReference: "En linea",
    slightlyBelowReference: "Algo por debajo",
    belowReference: "Por debajo",
    moreInformation: "Mas informacion",
    latestPublicAumInfo: "Activos bajo gestion a la fecha del ultimo dato publico. Se compara con una curva de referencia propia: CAGR ~22% desde",
    latestPublicAumInfoMid: "a fin de 2025 hasta",
    latestPublicAumInfoEnd: "en 2030. El badge indica la posicion frente a esa referencia.",
    estimatedArrInfo: "Ingresos anuales recurrentes estimados: AUM actual x comision media anual. Es el ritmo de ingresos si el AUM se mantuviera constante un ano entero. La meta de 30 M EUR ARR en 2030 fue comunicada por Indexa y esta recogida en el informe de GVC Gaesco.",
    yearEndAumInfoTitle: "Estimacion propia del AUM a 31 de diciembre calculada como:",
    yearEndAumFormula: "AUM x (1 + 5%/12)^meses + aportaciones_medias x meses",
    yearEndAumInfoEnd: "Se asume un 5% anual de rentabilidad de mercado y se extrapola el ritmo de aportaciones netas de los ultimos 3 meses.",
    arrYoyTitle: "YoY diario de ARR",
    arrYoyInfo: "Crecimiento interanual del ARR dia a dia desde 2022. Para cada fecha se compara el ARR con el valor del mismo dia hace 12 meses, tomando el dato mas reciente disponible si no existe exactamente.",
    arrYoySub: "ARR actual / ARR hace 12 meses - 1 · datos diarios desde 2022",
    arrIndexedTitle: "ARR indexado a inicio de ano · comparativa anual",
    arrIndexedInfo: "Cada linea parte de 0% el 1 de enero y muestra cuanto crecio el ARR a lo largo de ese ano. Permite comparar la velocidad de crecimiento dentro del ano independientemente del nivel absoluto.",
    arrIndexedSub: "ARR relativo a su valor a 1 de enero de cada ano · datos diarios desde 2019",
    aumReferenceTitle: "AUM real vs curva de referencia 2030",
    aumReferenceInfo: "Evolucion mensual del AUM real junto con una curva de referencia propia. La curva se ancla a fin de 2025 y crece a CAGR ~22% hasta 2030.",
    aumReferenceSub: "Curva de referencia propia: CAGR ~22% desde",
    yearEnd2025: "fin 2025",
    realMonthly: "Real mensual",
    ownReferenceLegend: "Referencia propia",
    annualNetInflowsTitle: "Aportaciones netas anuales",
    annualNetInflowsInfo: "Suma de aportaciones netas de cada ano. La barra del ano en curso muestra el acumulado hasta el ultimo dato; la extension transparente es la proyeccion al cierre del ano al ritmo actual. * = dato parcial.",
    annualNetInflowsSub: "Vision agregada por ano · * proyeccion al cierre del ano al ritmo actual",
    monthlyNetInflowsTitle: "Aportaciones netas mensuales",
    monthlyNetInflowsInfo: "Entradas menos salidas de dinero cada mes desde 2016. La linea amarilla es la media movil de 12 meses. La extension transparente en el ultimo mes es la proyeccion al cierre del mes al ritmo actual.",
    monthlyNetInflowsSub: "Barras azules: mes completo · extension translucida: proyeccion fin de mes · linea: media movil 12m",
    ytdComparisonTitle: "YTD - comparativa entre anos",
    ytdComparisonInfo: "Barra solida: aportaciones acumuladas desde el 1 de enero hasta el mismo dia del ano que el ultimo dato disponible. Barra clara detras: total del ano completo o proyeccion para el ano actual. El porcentaje es el crecimiento vs el mismo periodo del ano anterior.",
    ytdComparisonSubPrefix: "Solido: 1 ene ->",
    ytdComparisonSubSuffix: "claro: ano completo / proyectado · % = YoY del mismo periodo",
    mtdComparisonTitle: "MTD - comparativa entre anos",
    mtdComparisonInfo: "Barra solida: aportaciones del 1 al dia actual del mes, en cada ano. Barra clara: total del mes completo o proyeccion para el mes actual.",
    mtdComparisonSubPrefix: "Solido: 1-",
    mtdComparisonSubSuffix: "claro: mes completo / proyectado · % = YoY del mismo periodo",
    today: "hoy",
    monthlySeasonalityTitle: "Estacionalidad mensual de aportaciones",
    monthlySeasonalityInfo: "Para cada mes, muestra las aportaciones netas como porcentaje de las aportaciones acumuladas a 1 de enero del mismo ano. Normalizar por la base de enero permite comparar patrones estacionales entre anos de distinto tamano.",
    monthlySeasonalitySub: "Aportaciones mensuales / aportaciones acumuladas a 1 de enero (%) · ultimos 5 anos",
    monthlySeasonalityNote: "Grafico de seguimiento para ver si cada mes viene por encima o por debajo del patron historico. El ano en curso puede ir parcial.",
    quarterlySeasonalityTitle: "Estacionalidad trimestral de aportaciones",
    quarterlySeasonalityInfo: "La misma metrica que la estacionalidad mensual pero agregada por trimestre. Suaviza el ruido de meses individuales.",
    quarterlySeasonalitySub: "Misma metrica agregada por trimestre para suavizar ruido mensual y ver mejor la pauta anual",
    quarterlySeasonalityNote: "Cada punto recoge las aportaciones netas del trimestre sobre la base de aportaciones acumuladas al 1 de enero del mismo ano.",
    clientsTitle: "Evolucion de clientes",
    clientsInfo: "Numero de clientes publicado en la pagina de testimonios de Indexa Capital, capturado automaticamente varias veces al dia. La linea gris muestra la estimacion de GVC Gaesco hasta 2030, no una guia oficial de Indexa.",
    currentClients: "Clientes actuales",
    dataSince: "Datos desde",
    perDay: "dia",
    lastDays: "ult.",
    real: "Real",
    gvcEstimate: "Estimacion GVC Gaesco",
    portfolioReturnTitle: "Rentabilidad de la cartera (TWR)",
    portfolioReturnInfo: "Time-Weighted Return diario con convencion fin-de-dia. Aisla la rentabilidad pura de la cartera eliminando el efecto del tamano y timing de las aportaciones.",
    annualizedTwr: "TWR anualizado",
    partial: "parcial",
    accumulated: "Acumulado",
    years: "anos",
    monthlyBreakdownNote: "Desglose mensual - verde: rentabilidad positiva · rojo: negativa · intensidad proporcional a la magnitud",
    currentYearPartialNote: "* Ano en curso, datos parciales hasta el ultimo dato disponible.",
    historyTitle: "Historico y referencias 2030",
    historyInfo: "Datos reales auditados del AUM y ARR a fin de cada ano. Las filas en cursiva son referencias propias de la curva 2030, no datos reales ni guia oficial.",
    historySub: "Datos reales auditados + curva de referencia hasta 2030 · Fee media constante al",
    year: "Ano",
    yearEndAum: "AUM fin ano",
    aumGrowth: "Crec. AUM",
    estimatedArrTable: "ARR estimado",
    arrGrowth: "Crec. ARR",
    averageFee: "Fee media",
    ownReferenceRow: "Referencia propia - 30 M EUR ARR en 2030",
    periodComparisonSub: "Aportaciones netas · ultimos 4 anos +",
    projected: "proyectado",
    monthBarsInfo: "Cada barra muestra las aportaciones netas brutas del mismo mes en cada uno de los ultimos 4 anos completos.",
    quarterBarsInfo: "Cada barra muestra las aportaciones netas brutas del mismo trimestre en cada uno de los ultimos 4 anos completos.",
    projectedMonthInfo: "La barra proyectada es una proyeccion al mes completo calculada asi:",
    projectedQuarterInfo: "La barra proyectada es una proyeccion al trimestre completo calculada asi:",
    monthlyFormula: "aportaciones acumuladas / dias transcurridos x dias totales del mes",
    quarterlyFormula: "aportaciones acumuladas / dias transcurridos x dias totales del trimestre",
    monthlyUsefulness: "Util para ver si el ritmo de este mes es alto o bajo comparado con anos anteriores.",
    quarterlyUsefulness: "Util para ver si el ritmo de este trimestre es alto o bajo comparado con anos anteriores.",
    monthsShort: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
    newsEyebrow: "Noticias",
    newsTitle: "Catalizadores y lectura externa",
    newsIntro: "Archivo de noticias relevantes para seguir el contexto de Indexa Capital, roboadvisors, ahorro familiar y gestion pasiva. Cada entrada separa el hecho publicado de la lectura para la tesis.",
    newsSource: "Fuente",
    newsDate: "Fecha",
    newsWhyItMatters: "Por que importa",
    newsOpenArticle: "Abrir noticia",
    newsDisclaimer: "Este apartado enlaza fuentes externas y resume su relevancia editorial. No implica afiliacion con Indexa Capital ni recomendacion de inversion.",
  },
  en: {
    importantNotice: "Important notice",
    disclaimer1: (
      <>
        This website is an <strong>independent project created by investors</strong> in
        Indexa Capital to monitor the company's growth and track its public metrics.
      </>
    ),
    disclaimer2: (
      <>
        It has no relationship or affiliation with <strong>Indexa Capital</strong>.
        The data comes from public sources and may contain inaccuracies. This tool
        does not constitute financial advice.
      </>
    ),
    disclaimer3:
      "The site combines public data, a 2030 target communicated by the company, GVC Gaesco estimates and proprietary calculations.",
    understood: "Understood",
    dashboard: "Dashboard",
    thesis: "Thesis",
    news: "News",
    investmentThesis: "Investment thesis",
    officialWebsite: "Official website",
    publicData: "Public data",
    investorDocs: "Investor documents",
    legalNotice: "Legal notice",
    navLabel: "Main navigation",
    langLabel: "Language",
    contextLabel: "Dashboard context",
    independentDashboard: "Independent dashboard, not affiliated with Indexa Capital.",
    contextText:
      "Public data, the 2030 target communicated by the company, GVC Gaesco estimates and proprietary calculations.",
    lastPublicData: "Latest public data",
    calculationsUpdated: "Calculations updated",
    methodologyTitle: "Sources and methodology",
    realDataTitle: "What is actual data",
    realDataText:
      "AUM, estimated ARR, net inflows and clients are built from Indexa Capital's public data and investor documents.",
    ownReferenceTitle: "What is a proprietary reference",
    ownReferenceText:
      "The 2030 curve uses EUR 30m ARR as the target and derives an implied EUR 12bn AUM if the average fee remains at 0.25%.",
    externalEstimateTitle: "What is an external estimate",
    externalEstimateText:
      "The 2030 client and AUM figures attributed to the report are GVC Gaesco's scenario, not official Indexa guidance or this website's own forecast.",
    calculationTitle: "How it is calculated",
    calculationText:
      "ARR = AUM multiplied by the annual average fee. The year-end projection extrapolates recent net inflows and assumes a 5% annual market return.",
    thesisTeaserLabel: "Investment thesis",
    thesisTeaserTitle: "The strategic view behind the tracker",
    thesisTeaserText: "Assumptions, advantages, GVC scenario, risks and invalidation points.",
    seeThesis: "Read thesis",
    loadingData: "Loading data...",
    loadingError: "Error loading data",
    summaryVsReference: "Summary vs 2030 reference",
    latestAum: "Latest public AUM data",
    estimatedArr: "Estimated ARR",
    estimatedYearEndAum: "Estimated year-end AUM",
    todayReference: "Reference today",
    yearEndReference: "Year-end reference",
    communicatedTarget2030: "Communicated 2030 target",
    ownEstimate: "Own estimate",
    netPerMonth: "net per month",
    reference: "reference",
    vsReference: "vs ref.",
    aboveReference: "Above",
    onReference: "On track",
    slightlyBelowReference: "Slightly below",
    belowReference: "Below",
    moreInformation: "More information",
    latestPublicAumInfo: "Assets under management at the latest public data point. It is compared with a proprietary reference curve: ~22% CAGR from",
    latestPublicAumInfoMid: "at year-end 2025 to",
    latestPublicAumInfoEnd: "in 2030. The badge shows the position versus that reference.",
    estimatedArrInfo: "Estimated annual recurring revenue: current AUM x annual average fee. It is the revenue run-rate if AUM stayed constant for a full year. The EUR 30m ARR target for 2030 was communicated by Indexa and is included in the GVC Gaesco report.",
    yearEndAumInfoTitle: "Proprietary estimate of AUM at 31 December calculated as:",
    yearEndAumFormula: "AUM x (1 + 5%/12)^months + average_inflows x months",
    yearEndAumInfoEnd: "Assumes 5% annual market return and extrapolates the net inflow pace from the last 3 months.",
    arrYoyTitle: "Daily ARR YoY",
    arrYoyInfo: "Year-on-year ARR growth day by day since 2022. Each date compares ARR with the value from the same day 12 months earlier, using the most recent available data point when an exact match does not exist.",
    arrYoySub: "Current ARR / ARR 12 months ago - 1 · daily data since 2022",
    arrIndexedTitle: "ARR indexed to start of year · annual comparison",
    arrIndexedInfo: "Each line starts at 0% on 1 January and shows how much ARR grew during that year. It compares growth speed within the year regardless of absolute level.",
    arrIndexedSub: "ARR relative to its 1 January value each year · daily data since 2019",
    aumReferenceTitle: "Actual AUM vs 2030 reference curve",
    aumReferenceInfo: "Monthly actual AUM evolution alongside a proprietary reference curve. The curve is anchored at year-end 2025 and grows at ~22% CAGR to 2030.",
    aumReferenceSub: "Proprietary reference curve: ~22% CAGR from",
    yearEnd2025: "year-end 2025",
    realMonthly: "Monthly actual",
    ownReferenceLegend: "Proprietary reference",
    annualNetInflowsTitle: "Annual net inflows",
    annualNetInflowsInfo: "Sum of net inflows each year. The current-year bar shows the accumulated amount to the latest data point; the transparent extension is the year-end projection at the current pace. * = partial data.",
    annualNetInflowsSub: "Aggregated view by year · * year-end projection at current pace",
    monthlyNetInflowsTitle: "Monthly net inflows",
    monthlyNetInflowsInfo: "Money in minus money out each month since 2016. The yellow line is the 12-month moving average. The transparent extension in the latest month is the month-end projection at the current pace.",
    monthlyNetInflowsSub: "Blue bars: full month · translucent extension: month-end projection · line: 12m moving average",
    ytdComparisonTitle: "YTD - year comparison",
    ytdComparisonInfo: "Solid bar: inflows accumulated from 1 January to the same day of year as the latest available data point. Pale bar behind: full-year total or projection for the current year. The percentage is growth versus the same period of the prior year.",
    ytdComparisonSubPrefix: "Solid: Jan 1 ->",
    ytdComparisonSubSuffix: "pale: full year / projected · % = YoY for same period",
    mtdComparisonTitle: "MTD - year comparison",
    mtdComparisonInfo: "Solid bar: inflows from day 1 to the current day of the month, for each year. Pale bar: full-month total or projection for the current month.",
    mtdComparisonSubPrefix: "Solid: 1-",
    mtdComparisonSubSuffix: "pale: full month / projected · % = YoY for same period",
    today: "today",
    monthlySeasonalityTitle: "Monthly inflow seasonality",
    monthlySeasonalityInfo: "For each month, shows net inflows as a percentage of accumulated inflows on 1 January of the same year. Normalizing by the January base makes seasonal patterns comparable across years of different sizes.",
    monthlySeasonalitySub: "Monthly inflows / accumulated inflows at 1 January (%) · last 5 years",
    monthlySeasonalityNote: "Tracking chart to see whether each month is above or below the historical pattern. The current year can be partial.",
    quarterlySeasonalityTitle: "Quarterly inflow seasonality",
    quarterlySeasonalityInfo: "The same metric as monthly seasonality but aggregated by quarter. It smooths monthly noise.",
    quarterlySeasonalitySub: "Same metric aggregated by quarter to smooth monthly noise and highlight the annual pattern",
    quarterlySeasonalityNote: "Each point captures quarterly net inflows over accumulated inflows at 1 January of the same year.",
    clientsTitle: "Client evolution",
    clientsInfo: "Number of clients published on Indexa Capital's testimonials page, captured automatically several times per day. The grey line shows GVC Gaesco's estimate to 2030, not official Indexa guidance.",
    currentClients: "Current clients",
    dataSince: "Data since",
    perDay: "day",
    lastDays: "last",
    real: "Actual",
    gvcEstimate: "GVC Gaesco estimate",
    portfolioReturnTitle: "Portfolio return (TWR)",
    portfolioReturnInfo: "Daily Time-Weighted Return with end-of-day convention. It isolates pure portfolio performance by removing the effect of contribution size and timing.",
    annualizedTwr: "Annualized TWR",
    partial: "partial",
    accumulated: "Accumulated",
    years: "years",
    monthlyBreakdownNote: "Monthly breakdown - green: positive return · red: negative return · intensity proportional to magnitude",
    currentYearPartialNote: "* Current year, partial data to the latest available data point.",
    historyTitle: "History and 2030 references",
    historyInfo: "Audited actual AUM and ARR data at year-end. Italic rows are proprietary references from the 2030 curve, not actual data or official guidance.",
    historySub: "Audited actual data + reference curve to 2030 · Average fee constant at",
    year: "Year",
    yearEndAum: "Year-end AUM",
    aumGrowth: "AUM growth",
    estimatedArrTable: "Estimated ARR",
    arrGrowth: "ARR growth",
    averageFee: "Average fee",
    ownReferenceRow: "Proprietary reference - EUR 30m ARR in 2030",
    periodComparisonSub: "Net inflows · last 4 years +",
    projected: "projected",
    monthBarsInfo: "Each bar shows gross net inflows for the same month in each of the last 4 complete years.",
    quarterBarsInfo: "Each bar shows gross net inflows for the same quarter in each of the last 4 complete years.",
    projectedMonthInfo: "The projected bar is a full-month projection calculated as:",
    projectedQuarterInfo: "The projected bar is a full-quarter projection calculated as:",
    monthlyFormula: "accumulated inflows / elapsed days x total days in month",
    quarterlyFormula: "accumulated inflows / elapsed days x total days in quarter",
    monthlyUsefulness: "Useful to see whether this month's pace is high or low compared with previous years.",
    quarterlyUsefulness: "Useful to see whether this quarter's pace is high or low compared with previous years.",
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    newsEyebrow: "News",
    newsTitle: "Catalysts and external coverage",
    newsIntro: "Archive of relevant news for tracking Indexa Capital, roboadvisors, household savings and passive investing. Each entry separates the reported fact from the investment-thesis read-through.",
    newsSource: "Source",
    newsDate: "Date",
    newsWhyItMatters: "Why it matters",
    newsOpenArticle: "Open article",
    newsDisclaimer: "This section links to external sources and summarizes their editorial relevance. It does not imply affiliation with Indexa Capital or investment advice.",
  },
};

function getLocalizedPath(lang, page) {
  const prefix = lang === "en" ? "/en" : "";
  if (page === "noticias") return `#${prefix}/${lang === "en" ? "news" : "noticias"}`;
  return page === "tesis" ? `#${prefix}/tesis` : `#${prefix}/`;
}

const NEWS_ITEMS = [
  {
    id: "cincodias-roboadvisors-2026-04-24",
    date: "2026-04-24",
    source: "Cinco Dias",
    author: "Vera Castello",
    url: "https://cincodias.elpais.com/extras/inversion-fondos-planes/2026-04-24/roboadvisors-inversion-automatizada-que-gana-peso-por-costes-eficiencia-y-accesibilidad.html",
    title: {
      es: "Roboadvisors: inversion automatizada que gana peso por costes, eficiencia y accesibilidad",
      en: "Roboadvisors: automated investing gains weight through cost, efficiency and accessibility",
    },
    summary: {
      es: "Cinco Dias presenta la gestion automatizada como una via cada vez mas consolidada para el ahorrador particular en Espana. En el repaso del sector destaca a Indexa Capital por crecimiento y volumen, citando 5.031 M EUR de patrimonio, un 63% mas interanual, y mas de 150.000 clientes.",
      en: "Cinco Dias frames automated portfolio management as an increasingly established route for retail savers in Spain. In its sector overview, it highlights Indexa Capital for growth and scale, citing EUR 5.031bn in assets, up 63% year on year, and more than 150,000 clients.",
    },
    readThrough: {
      es: "Refuerza dos piezas de la tesis: el crecimiento de la categoria roboadvisor ya no es marginal y la propuesta de coste/eficiencia de Indexa sigue apareciendo como referencia frente a banca y otros actores.",
      en: "It reinforces two parts of the thesis: roboadvisor category growth is no longer marginal, and Indexa's cost/efficiency proposition continues to appear as a reference point versus banks and other players.",
    },
    tags: ["Roboadvisors", "Gestion automatizada", "Indexa Capital", "Costes"],
  },
];

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

function DisclaimerModal({ onClose, t }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t.importantNotice}</h2>
        <p className="modal-body">
          {t.disclaimer1}
        </p>
        <p className="modal-body">
          {t.disclaimer2}
        </p>
        <p className="modal-body">
          {t.disclaimer3}
        </p>
        <button className="modal-btn" onClick={onClose}>
          {t.understood}
        </button>
      </div>
    </div>
  );
}

function Footer({ onOpenDisclaimer, lang, t }) {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a className="footer-brand-link" href={BRAND_HOME_URL} target="_blank" rel="noopener noreferrer">
            <BrandMark />
            Alex Finance Lab
          </a>
          <a href={getLocalizedPath(lang, "dashboard")}>
            {t.dashboard}
          </a>
          <a href={getLocalizedPath(lang, "tesis")}>
            {t.investmentThesis}
          </a>
          <a href={getLocalizedPath(lang, "noticias")}>
            {t.news}
          </a>
          <a href="https://indexacapital.com" target="_blank" rel="noopener noreferrer">
            {t.officialWebsite}
          </a>
          <a href="https://indexacapital.com/es/esp/stats" target="_blank" rel="noopener noreferrer">
            {t.publicData}
          </a>
          <a href="https://group.indexacapital.com/en/documents" target="_blank" rel="noopener noreferrer">
            {t.investorDocs}
          </a>
        </div>
        <button className="footer-disclaimer-btn" onClick={onOpenDisclaimer}>
          {t.legalNotice}
        </button>
      </div>
    </footer>
  );
}

function HeaderNav({ activePage, lang, t }) {
  return (
    <nav className="header-nav" aria-label={t.navLabel}>
      <a className={activePage === "dashboard" ? "active" : ""} href={getLocalizedPath(lang, "dashboard")}>{t.dashboard}</a>
      <a className={activePage === "tesis" ? "active" : ""} href={getLocalizedPath(lang, "tesis")}>{t.thesis}</a>
      <a className={activePage === "noticias" ? "active" : ""} href={getLocalizedPath(lang, "noticias")}>{t.news}</a>
    </nav>
  );
}

function LanguageSwitch({ activePage, lang, t }) {
  return (
    <div className="language-switch" aria-label={t.langLabel}>
      <span>{t.langLabel}</span>
      <a className={lang === "es" ? "active" : ""} href={getLocalizedPath("es", activePage)}>ES</a>
      <a className={lang === "en" ? "active" : ""} href={getLocalizedPath("en", activePage)}>EN</a>
    </div>
  );
}

function ContextBanner({ today, lastDate, lang, t }) {
  return (
    <div className="context-band" aria-label={t.contextLabel}>
      <div>
        <strong>{t.independentDashboard}</strong>
        <p>
          {t.contextText}
        </p>
      </div>
      <div className="context-dates">
        <span>{t.lastPublicData}: <strong>{fmtDate(lastDate, lang)}</strong></span>
        <span>{t.calculationsUpdated}: <strong>{fmtDate(today, lang)}</strong></span>
      </div>
    </div>
  );
}

function SourceMethodology({ t }) {
  return (
    <section className="methodology-section">
      <div className="chart-title-row">
        <h2>{t.methodologyTitle}</h2>
      </div>
      <div className="methodology-grid">
        <div>
          <h3>{t.realDataTitle}</h3>
          <p>
            {t.realDataText}
          </p>
        </div>
        <div>
          <h3>{t.ownReferenceTitle}</h3>
          <p>
            {t.ownReferenceText}
          </p>
        </div>
        <div>
          <h3>{t.externalEstimateTitle}</h3>
          <p>
            {t.externalEstimateText}
          </p>
        </div>
        <div>
          <h3>{t.calculationTitle}</h3>
          <p>
            {t.calculationText}
          </p>
        </div>
      </div>
    </section>
  );
}

function ThesisTeaser({ lang, t }) {
  return (
    <aside className="thesis-teaser" aria-label={t.investmentThesis}>
      <div>
        <span className="section-eyebrow">{t.thesisTeaserLabel}</span>
        <h2>{t.thesisTeaserTitle}</h2>
        <p>
          {t.thesisTeaserText}
        </p>
      </div>
      <a className="thesis-teaser-link" href={getLocalizedPath(lang, "tesis")}>{t.seeThesis}</a>
    </aside>
  );
}

function DashboardIntro({ today, lastDate, lang, t }) {
  return (
    <section className="dashboard-intro">
      <ContextBanner today={today} lastDate={lastDate} lang={lang} t={t} />
      <ThesisTeaser lang={lang} t={t} />
    </section>
  );
}

function NewsPage({ lang, t }) {
  return (
    <div className="news-page">
      <section className="thesis-hero news-hero">
        <p className="section-eyebrow">{t.newsEyebrow}</p>
        <h2>{t.newsTitle}</h2>
        <p className="thesis-lede">{t.newsIntro}</p>
        <p className="news-disclaimer">{t.newsDisclaimer}</p>
      </section>

      <section className="news-list" aria-label={t.newsTitle}>
        {NEWS_ITEMS.map((item) => (
          <article className="news-card" key={item.id}>
            <div className="news-card-meta">
              <span>{t.newsDate}: {fmtDate(new Date(`${item.date}T00:00:00`), lang)}</span>
              <span>{t.newsSource}: {item.source}</span>
              {item.author ? <span>{item.author}</span> : null}
            </div>
            <h3>{item.title[lang]}</h3>
            <p>{item.summary[lang]}</p>
            <div className="news-readthrough">
              <strong>{t.newsWhyItMatters}</strong>
              <p>{item.readThrough[lang]}</p>
            </div>
            <div className="news-card-footer">
              <div className="news-tags">
                {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{t.newsOpenArticle}</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

const GVC_RESEARCH_DOCS = {
  es: {
    complete: "https://group.indexacapital.com/es/view-document/3ce5e4a4-3716-11f1-ac7d-0a0c9f6e68d1/An%C3%A1lisis%20burs%C3%A1til",
    q1: "https://group.indexacapital.com/es/view-document/66a55b48-4919-11f1-96c8-02a2ab306df7/An%C3%A1lisis%20burs%C3%A1til",
  },
  en: {
    complete: "https://group.indexacapital.com/es/view-document/ddd69f4c-373a-11f1-8bf9-0a0c9f6e68d1/An%C3%A1lisis%20burs%C3%A1til",
    q1: "https://group.indexacapital.com/es/view-document/c668d820-4919-11f1-8bb2-02a2ab306df7/An%C3%A1lisis%20burs%C3%A1til",
  },
};

function InvestmentThesisPage({ today, lastDate, lang }) {
  const isEnglish = lang === "en";
  const researchDocs = GVC_RESEARCH_DOCS[lang];
  const thesisMetrics = isEnglish
    ? [
        { label: "2025 AUM", value: "EUR 4,403m", note: "audited 2025 year-end" },
        { label: "2025 clients", value: "134k", note: "base of the 2030 curve" },
        { label: "2025 net profit", value: "EUR 2.4m", note: "consolidated result" },
        { label: "GVC 2030 scenario", value: "EUR 16,388m", note: "AUM estimated by GVC Gaesco" },
      ]
    : [
        { label: "AUM 2025", value: "4.403 M EUR", note: "cierre 2025 auditado" },
        { label: "Clientes 2025", value: "134 mil", note: "base de la curva 2030" },
        { label: "Beneficio neto 2025", value: "2,4 M EUR", note: "resultado consolidado" },
        { label: "Escenario GVC 2030", value: "16.388 M EUR", note: "AUM estimado por GVC Gaesco" },
      ];

  const pillars = isEnglish
    ? [
        {
          title: "Large and under-optimized end market",
          body: "Spanish savings still have high exposure to cash and low-yielding bank products. The thesis assumes that part of that capital will gradually migrate toward diversified, simple and lower-cost investment solutions.",
        },
        {
          title: "Low-friction product",
          body: "Indexa reduces operational work for the client: profiling, contributions, rebalancing and portfolio maintenance. The appeal is not only cost, but also discipline and delegation.",
        },
        {
          title: "Tax advantage versus ETFs",
          body: "In Spain, fund-based portfolios allow transfers without immediate taxation. That feature can be a practical barrier versus neobanks and brokers focused on ETFs.",
        },
        {
          title: "Operating leverage",
          body: "If AUM and clients grow faster than staff, technology and marketing costs, incremental margins can be high. This is the key equity thesis driver.",
        },
      ]
    : [
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

  const risks = isEnglish
    ? [
        "A prolonged market drawdown that reduces AUM, ARR and appetite for new inflows.",
        "Fee compression from banks, neobanks or roboadvisor competition.",
        "Tax changes that reduce the advantage of funds versus ETFs.",
        "Deterioration in user experience, trust, support or brand reputation.",
        "Low share liquidity and valuation sensitivity to the premium required by BME Growth investors.",
        "Weaker-than-expected execution in France, Bewater or new product lines.",
      ]
    : [
        "Caída prolongada de mercados que reduzca AUM, ARR y apetito de aportaciones.",
        "Compresión de comisiones por competencia de bancos, neobancos o roboadvisors.",
        "Cambios fiscales que reduzcan la ventaja de los fondos frente a ETF.",
        "Deterioro de experiencia de usuario, confianza, soporte o reputación de marca.",
        "Baja liquidez de la acción y valoración sensible a la prima exigida por BME Growth.",
        "Ejecución peor de la esperada en Francia, Bewater o nuevas líneas de producto.",
      ];

  return (
    <div className="thesis-page">
      <section className="research-starter">
        <div className="research-starter-copy">
          <span className="section-eyebrow">
            {isEnglish ? "Start here" : "Empieza aqui"}
          </span>
          <h2>
            {isEnglish
              ? "The most complete research document to understand Indexa"
              : "El documento mas completo para empezar a investigar Indexa"}
          </h2>
          <p>
            {isEnglish
              ? "GVC Gaesco's full initiation report is the best starting point for understanding the company, its history, business model, market context, competitive position and listed-equity case. This page is an editorial tracker, but the full PDF is where most of the foundational research sits."
              : "El informe completo de GVC Gaesco es el mejor punto de partida para entender la empresa, su historia, modelo de negocio, contexto de mercado, posicion competitiva y caso bursatil. Esta pagina ordena la tesis editorial, pero el PDF completo concentra gran parte de la investigacion base."}
          </p>
          <div className="research-starter-actions">
            <a className="research-primary-link" href={researchDocs.complete} target="_blank" rel="noopener noreferrer">
              {isEnglish ? "Open full GVC Gaesco thesis" : "Abrir tesis completa de GVC Gaesco"}
            </a>
            <a className="research-secondary-link" href={researchDocs.q1} target="_blank" rel="noopener noreferrer">
              {isEnglish ? "Open Q1 update" : "Abrir actualizacion T1"}
            </a>
          </div>
        </div>
        <div className="research-starter-panel">
          <strong>{isEnglish ? "What you will find" : "Que encontraras"}</strong>
          <ul>
            <li>{isEnglish ? "Company history and positioning" : "Historia y posicionamiento de la compania"}</li>
            <li>{isEnglish ? "Market, competitors and growth drivers" : "Mercado, competidores y motores de crecimiento"}</li>
            <li>{isEnglish ? "Financial model, estimates and valuation case" : "Modelo financiero, estimaciones y caso de valoracion"}</li>
            <li>{isEnglish ? "Risks, assumptions and follow-up metrics" : "Riesgos, hipotesis y metricas de seguimiento"}</li>
          </ul>
        </div>
      </section>

      <section className="thesis-hero">
        <p className="section-eyebrow">
          {isEnglish ? "Investment thesis · editorial draft" : "Tesis de inversión · borrador editorial"}
        </p>
        <h2>
          {isEnglish
            ? "Indexa as a listed vehicle to capture the transition toward low-cost indexed investing"
            : "Indexa como vehículo cotizado para capturar la transición hacia inversión indexada de bajo coste"}
        </h2>
        <p className="thesis-lede">
          {isEnglish
            ? "The preliminary thesis is that Indexa Capital combines a structurally favorable market, a simple value proposition for savers, a local tax advantage and a scalable operating model. The equity opportunity depends on that growth translating into earnings, cash generation and better share liquidity."
            : "La tesis preliminar es que Indexa Capital combina un mercado estructuralmente favorable, una propuesta de valor simple para el ahorrador, ventaja fiscal local y un modelo operativo escalable. La oportunidad bursátil depende de que ese crecimiento se traduzca en beneficios, caja y mayor liquidez de la acción."}
        </p>
        <div className="thesis-disclaimer">
          {isEnglish
            ? "Draft under review. This page structures an investment hypothesis and does not constitute financial advice. Some figures come from public data, while others come from GVC Gaesco estimates or proprietary calculations."
            : "Borrador en revisión. Esta página ordena una hipótesis de inversión y no constituye recomendación financiera. Algunas cifras proceden de datos públicos y otras de estimaciones de GVC Gaesco o cálculos propios."}
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>01</span>
          <div>
            <h2>{isEnglish ? "Core thesis" : "Tesis central"}</h2>
            <p>
              {isEnglish
                ? "Indexa can benefit from a gradual migration from bank savings and expensive funds toward indexed, automated and tax-efficient portfolios."
                : "Indexa puede beneficiarse de una migración gradual desde ahorro bancario y fondos caros hacia carteras indexadas, automatizadas y fiscalmente eficientes."}
            </p>
          </div>
        </div>
        <div className="thesis-argument">
          <p>
            {isEnglish
              ? "The argument is not simply that Indexa is cheaper than banks. It is that it solves a behavioral problem: many savers do not want to build, rebalance and maintain a portfolio by themselves. They buy delegation, discipline and a reasonable cost structure."
              : "El argumento no descansa en que Indexa sea simplemente más barata que la banca. Descansa en que resuelve un problema conductual: muchos ahorradores no quieren construir, rebalancear y sostener una cartera por su cuenta. Compran delegación, disciplina y una estructura de costes razonable."}
          </p>
          <p>
            {isEnglish
              ? "As a listed investment, the critical point is whether that inflow growth can be sustained with low acquisition costs, low churn and operating costs that grow more slowly than revenue and AUM."
              : "Como inversión cotizada, el punto crítico es si esa captación puede sostenerse con un coste de adquisición bajo, baja cancelación y costes operativos que crezcan más despacio que ingresos y AUM."}
          </p>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>02</span>
          <div>
            <h2>{isEnglish ? "Starting numbers" : "Números de partida"}</h2>
            <p>{isEnglish ? "Data and references to frame the case before moving into scenarios." : "Datos y referencias para situar el caso antes de entrar en escenarios."}</p>
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
                <th>{isEnglish ? "Metric" : "Métrica"}</th>
                <th>2025</th>
                <th>2026e</th>
                <th>2030e GVC</th>
                <th>{isEnglish ? "Read-through" : "Lectura"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{isEnglish ? "Clients" : "Clientes"}</td>
                <td>134 mil</td>
                <td>178 mil</td>
                <td>454 mil</td>
                <td>{isEnglish ? "Client base growth and potential recurrence." : "Crecimiento de base y recurrencia potencial."}</td>
              </tr>
              <tr>
                <td>AUM</td>
                <td>4.403 M EUR</td>
                <td>5.816 M EUR</td>
                <td>16.388 M EUR</td>
                <td>{isEnglish ? "Main driver of ARR and valuation." : "Principal motor de ARR y valoración."}</td>
              </tr>
              <tr>
                <td>{isEnglish ? "Net profit" : "Beneficio neto"}</td>
                <td>2,4 M EUR</td>
                <td>4,9 M EUR</td>
                <td>20,8 M EUR</td>
                <td>{isEnglish ? "Operating leverage hypothesis." : "Hipótesis de apalancamiento operativo."}</td>
              </tr>
              <tr>
                <td>{isEnglish ? "Public target" : "Meta pública"}</td>
                <td>-</td>
                <td>-</td>
                <td>{euroCompact.format(COMPANY_TARGET.arrEnd)} ARR</td>
                <td>{isEnglish ? "Company-communicated target; own implied AUM: " : "Meta comunicada por la compañía; AUM implícito propio: "}{euroCompact.format(COMPANY_TARGET.aumEnd)}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>03</span>
          <div>
            <h2>{isEnglish ? "Thesis pillars" : "Pilares de la tesis"}</h2>
            <p>{isEnglish ? "The points that need to remain true for the thesis to strengthen." : "Los puntos que deben seguir siendo ciertos para que la tesis gane fuerza."}</p>
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
              <h2>{isEnglish ? "Competitive advantages to monitor" : "Ventajas competitivas a vigilar"}</h2>
            </div>
          </div>
          <ul className="thesis-list">
            {(isEnglish
              ? [
                  "Brand and trust in a category where the client delegates long-term wealth.",
                  "Competitive total cost versus traditional banking and expensive managed portfolios.",
                  "Spanish fund taxation, especially relevant for rebalancing.",
                  "Historical positive net inflow data as a signal of client behavior.",
                  "Optionality in pensions, France, Bewater, private markets and cash accounts.",
                ]
              : [
                  "Marca y confianza en una categoría donde el cliente delega patrimonio a largo plazo.",
                  "Coste total competitivo frente a banca tradicional y carteras gestionadas caras.",
                  "Fiscalidad española de fondos, especialmente relevante para rebalanceos.",
                  "Datos históricos de aportaciones netas positivas como señal de comportamiento cliente.",
                  "Opcionalidad en pensiones, Francia, Bewater, mercados privados y cuenta remunerada.",
                ]).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <div className="thesis-section-head compact">
            <span>05</span>
            <div>
              <h2>{isEnglish ? "What would invalidate the thesis" : "Qué invalidaría la tesis"}</h2>
            </div>
          </div>
          <ul className="thesis-list">
            {(isEnglish
              ? [
                  "Net inflows persistently below the pace required for the 2030 target.",
                  "Average fee reduction without enough volume compensation.",
                  "Staff, marketing or support costs growing faster than revenue.",
                  "Loss of differentiation versus MyInvestor, Finizens, banks or global brokers.",
                  "Permanent public-market discount due to illiquidity or low institutional coverage.",
                ]
              : [
                  "Captación neta persistentemente por debajo del ritmo necesario para la meta 2030.",
                  "Reducción de fee media sin compensación suficiente en volumen.",
                  "Costes de personal, marketing o soporte creciendo más rápido que ingresos.",
                  "Pérdida de diferenciación frente a MyInvestor, Finizens, bancos o brokers globales.",
                  "Descuento bursátil permanente por iliquidez o baja cobertura institucional.",
                ]).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="thesis-section">
        <div className="thesis-section-head">
          <span>06</span>
          <div>
            <h2>{isEnglish ? "Main risks" : "Riesgos principales"}</h2>
            <p>{isEnglish ? "The thesis should be read together with its breaking points, not as a linear narrative." : "La tesis debe leerse junto con sus puntos de ruptura, no como una narrativa lineal."}</p>
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
            <h2>{isEnglish ? "Core sources" : "Fuentes base"}</h2>
            <p>{isEnglish ? "References that should remain linked and checked before publishing new figures." : "Referencias que conviene mantener enlazadas y contrastar antes de publicar cifras nuevas."}</p>
          </div>
        </div>
        <div className="source-list">
          <a href="https://indexacapital.com/es/esp/stats" target="_blank" rel="noopener noreferrer">{isEnglish ? "Indexa Capital public statistics" : "Estadísticas públicas de Indexa Capital"}</a>
          <a href="https://group.indexacapital.com/en/documents" target="_blank" rel="noopener noreferrer">{isEnglish ? "Indexa Capital Group investor documents" : "Documentos para inversores de Indexa Capital Group"}</a>
          <a href="https://www.bmegrowth.es/esp/Ficha/INDEXA_CAPITAL_GROUP_ES0105702007.aspx" target="_blank" rel="noopener noreferrer">{isEnglish ? "Indexa Capital Group profile on BME Growth" : "Ficha de Indexa Capital Group en BME Growth"}</a>
          <a href="https://www.bmegrowth.es/docs/analisis/2026/04/05702_Analisis_20260413.pdf?Vu2JMQ%21%21=" target="_blank" rel="noopener noreferrer">{isEnglish ? "GVC Gaesco report dated 13 April 2026" : "Informe GVC Gaesco del 13 de abril de 2026"}</a>
        </div>
        <p className="thesis-footnote">
          {isEnglish ? "Latest dashboard data: " : "Último dato del dashboard: "}{fmtDate(lastDate)}. {isEnglish ? "Thesis page updated: " : "Página de tesis actualizada: "}{fmtDate(today)}.
        </p>
      </section>
    </div>
  );
}

function statusInfo(delta, t) {
  if (delta == null) return null;
  if (delta >= 0.05) return { label: t.aboveReference, cls: "badge-ahead" };
  if (delta >= -0.02) return { label: t.onReference, cls: "badge-on-track" };
  if (delta >= -0.08) return { label: t.slightlyBelowReference, cls: "badge-behind" };
  return { label: t.belowReference, cls: "badge-off-track" };
}

function fmtDate(date, lang = "es") {
  return date
    ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date)
    : "-";
}

function fmtPctPoint(value) {
  if (value == null) return "-";
  return `${value.toFixed(Math.abs(value) >= 10 ? 0 : 1)}%`;
}

const ES_MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function localizeMonthLabel(label, t) {
  if (!label || !t?.monthsShort) return label;
  return String(label).replace(/ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic/g, (match) => {
    const index = ES_MONTHS_SHORT.findIndex((month) => month.toLowerCase() === match.toLowerCase());
    return index >= 0 ? t.monthsShort[index] : match;
  });
}

function useHashRoute() {
  const readRoute = () => {
    const rawRoute = window.location.hash.replace(/^#\/?/, "") || "dashboard";
    if (rawRoute === "en") return "en/dashboard";
    return rawRoute;
  };
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function parseLocalizedRoute(route) {
  const isEnglish = route === "en" || route.startsWith("en/");
  const normalizedRoute = isEnglish ? route.replace(/^en\/?/, "") || "dashboard" : route;
  const page =
    normalizedRoute === "tesis"
      ? "tesis"
      : normalizedRoute === "noticias" || normalizedRoute === "news"
        ? "noticias"
        : "dashboard";
  return {
    lang: isEnglish ? "en" : "es",
    page,
  };
}

function StatusBadge({ delta, t }) {
  const info = statusInfo(delta, t);
  if (!info) return null;
  return <span className={`badge ${info.cls}`}>{t.vsReference} {info.label}</span>;
}

function MetricCard({ label, value, sub, delta, info, t }) {
  return (
    <article className="metric-card">
      <div className="metric-label-row">
        <span className="metric-label">{label}</span>
        {info && <InfoTooltip label={t.moreInformation}>{info}</InfoTooltip>}
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-sub">{sub}</span>
      <StatusBadge delta={delta} t={t} />
    </article>
  );
}

function AumChart({ data, t }) {
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
    if (String(item.label).toLowerCase().startsWith("ene")) xLabels.push(index);
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
          {localizeMonthLabel(data[index].label, t)}
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

function ArrYoYChart({ data, t }) {
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
          label: t.monthsShort[d.getMonth()],
          isJan: d.getMonth() === 0,
          year: d.getFullYear(),
          month: d.getMonth(),
        });
      }
      d.setMonth(d.getMonth() + 1);
    }
  }

  const baseLabel  = `${t.monthsShort[lastDate.getMonth()]} ${lastDate.getFullYear() - 1}`;
  const todayLabel = `${t.monthsShort[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

  // ── YTD average ──────────────────────────────────────────────────────────
  const currentYear  = lastDate.getFullYear();
  const ytdData      = data.filter((d) => d.date.getFullYear() === currentYear);
  const ytdAvg       = ytdData.length ? ytdData.reduce((s, d) => s + d.yoy, 0) / ytdData.length : null;
  const ytdStartMs   = new Date(currentYear, 0, 1).getTime();
  const xYtdStart    = Math.max(pxMs(ytdStartMs), pad.left);
  const xYtdEnd      = px(last);

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

      {/* YTD average line */}
      {ytdAvg !== null && (
        <g>
          <line
            x1={xYtdStart.toFixed(1)} y1={py(ytdAvg).toFixed(1)}
            x2={xYtdEnd.toFixed(1)}  y2={py(ytdAvg).toFixed(1)}
            stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 3"
          />
          <text
            x={(xYtdStart + 4).toFixed(1)} y={(py(ytdAvg) - 5).toFixed(1)}
            fontSize="10" fill="#3B82F6" fontWeight="600"
          >
            Ø YTD {currentYear}: {(ytdAvg * 100).toFixed(1)}%
          </text>
        </g>
      )}

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
function ArrYearlyIndexChart({ data, t }) {
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
      {t.monthsShort.map((label, i) => {
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

function ReturnMonthlyHeatmap({ monthlyReturns, t }) {
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
      {t.monthsShort.map((label, i) => (
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

function SeasonalityChart({ data, t }) {
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
            {localizeMonthLabel(serie.label, t)}
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
            {localizeMonthLabel(label, t)}
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

function ClientsChart({ data, t, lang }) {
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
            {last.clients.toLocaleString(lang === "en" ? "en-GB" : "es-ES")}
          </text>
          {dailyAvg != null && dailyAvg > 0 && (
            <text x={(pxMs(last.date.getTime()) + 8).toFixed(1)} y={(py(last.clients) + 18).toFixed(1)}
              fontSize="10" fill="#718096">
              +{Math.round(dailyAvg)}/{t.perDay} ({t.lastDays} {daysBack}d)
            </text>
          )}
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${pad.left}, ${pad.top - 10})`}>
        <circle cx="6" cy="0" r="4" fill="#0F766E" />
        <text x="14" y="4" fontSize="10" fill="#718096">{t.real}</text>
        <line x1="60" y1="0" x2="82" y2="0" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="88" y="4" fontSize="10" fill="#A0AEC0">{t.gvcEstimate}</text>
      </g>
    </svg>
  );
}

function HistoryTable({ yearlyRows, t }) {
  const actuals = [...yearlyRows].filter((row) => row.year >= 2021).sort((a, b) => a.year - b.year);
  const currentYear = new Date().getFullYear();
  const actualYearSet = new Set(actuals.map((row) => row.year));
  const futureTargets = EXPONENTIAL_MILESTONES.filter((milestone) => !actualYearSet.has(milestone.year));

  return (
    <div className="table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>{t.year}</th>
            <th>{t.yearEndAum}</th>
            <th>{t.aumGrowth}</th>
            <th>{t.estimatedArrTable}</th>
            <th>{t.arrGrowth}</th>
            <th>{t.averageFee}</th>
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
                  {isCurrent && milestone ? <span className="obj-tag"> / {t.vsReference} {euroCompact.format(milestone.aumTarget)}</span> : null}
                </td>
                <td className={yoyAum != null && yoyAum > 0 ? "col-positive" : ""}>{yoyAum != null ? percent.format(yoyAum) : "-"}</td>
                <td>
                  {euroCompact.format(row.arrEnd)}
                  {isCurrent && milestone ? <span className="obj-tag"> / {t.vsReference} {euroCompact.format(milestone.arrTarget)}</span> : null}
                </td>
                <td className={yoyArr != null && yoyArr > 0 ? "col-positive" : ""}>{yoyArr != null ? percent.format(yoyArr) : "-"}</td>
                <td>{row.feePctEnd ? percent.format(row.feePctEnd) : "-"}</td>
              </tr>
            );
          })}

          {futureTargets.length > 0 && (
            <tr className="col-divider">
              <td colSpan={6}>{t.ownReferenceRow}</td>
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

function InfoTooltip({ children, label = "More information" }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="info-tooltip-wrap">
      <button
        className="info-tooltip-btn"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label={label}
      >?</button>
      {visible && <div className="info-tooltip-box">{children}</div>}
    </span>
  );
}

function PeriodComparisonBars({ label, bars, t }) {
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
          <p className="comparison-sub">{t.periodComparisonSub} {new Date().getFullYear()} {t.projected}</p>
        </div>
        <InfoTooltip label={t.moreInformation}>
          {isMonthly ? (
            <>
              <p>{t.monthBarsInfo}</p>
              <p style={{ marginTop: 8 }}>{t.projectedMonthInfo}</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                {t.monthlyFormula}
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>{t.monthlyUsefulness}</p>
            </>
          ) : (
            <>
              <p>{t.quarterBarsInfo}</p>
              <p style={{ marginTop: 8 }}>{t.projectedQuarterInfo}</p>
              <p style={{ marginTop: 4, fontFamily: "monospace", fontSize: "0.82em", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4 }}>
                {t.quarterlyFormula}
              </p>
              <p style={{ marginTop: 8, opacity: 0.7 }}>{t.quarterlyUsefulness}</p>
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
  const { lang, page } = parseLocalizedRoute(route);
  const t = I18N[lang];

  const closeDisclaimer = useCallback(() => {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setShowDisclaimer(false);
  }, []);

  useEffect(() => {
    loadIndexaDataset().then(setDataset).catch(setError);
  }, []);

  if (error) return <div className="loading">{t.loadingError}: {error.message}</div>;
  if (!dataset) return <div className="loading">{t.loadingData}</div>;

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
  const isThesisPage = page === "tesis";
  const isNewsPage = page === "noticias";
  const activePage = isThesisPage ? "tesis" : isNewsPage ? "noticias" : "dashboard";

  return (
    <div className="app">
      {showDisclaimer && <DisclaimerModal onClose={closeDisclaimer} t={t} />}
      <header className="app-header">
        <div className="header-inner">
          <BrandSignature productName="Indexa Tracker" />
          <div className="header-actions">
            <HeaderNav activePage={activePage} lang={lang} t={t} />
            <LanguageSwitch activePage={activePage} lang={lang} t={t} />
          </div>
        </div>
      </header>

      <main className={`app-main ${isThesisPage || isNewsPage ? "app-main-thesis" : ""}`}>
        {isThesisPage ? (
          <InvestmentThesisPage today={today} lastDate={lastDate} lang={lang} />
        ) : isNewsPage ? (
          <NewsPage lang={lang} t={t} />
        ) : (
          <>
            <DashboardIntro today={today} lastDate={lastDate} lang={lang} t={t} />

        <section>
          <p className="section-eyebrow">{t.summaryVsReference} · {fmtDate(today, lang)}</p>
          <div className="status-grid">
            <MetricCard
              label={t.latestAum}
              value={euroCompact.format(currentAum)}
              sub={`${t.todayReference}: ${euroCompact.format(targetAumNow)} · ${t.yearEndReference}: ${euroCompact.format(targetYearEnd)}`}
              delta={aumDeltaPct}
              info={<p>{t.latestPublicAumInfo} {euroCompact.format(COMPANY_TARGET.aumStart)} {t.latestPublicAumInfoMid} {euroCompact.format(COMPANY_TARGET.aumEnd)} {t.latestPublicAumInfoEnd}</p>}
              t={t}
            />

            <MetricCard
              label={t.estimatedArr}
              value={euroCompact.format(currentArr)}
              sub={`${t.todayReference}: ${euroCompact.format(targetArrNow)} · ${t.communicatedTarget2030}: ${euroCompact.format(COMPANY_TARGET.arrEnd)}`}
              delta={arrDeltaPct}
              info={<p>{t.estimatedArrInfo}</p>}
              t={t}
            />

            <MetricCard
              label={t.estimatedYearEndAum}
              value={euroCompact.format(projectedYeAum)}
              sub={`${t.ownEstimate} · ${euroCompact.format(avgMonthlyInflow)}/${t.netPerMonth} · ${t.reference}: ${euroCompact.format(targetYearEnd)}`}
              delta={paceDeltaPct}
              info={<><p>{t.yearEndAumInfoTitle}</p><p style={{marginTop:6, fontFamily:"monospace", fontSize:"0.82em", background:"rgba(255,255,255,0.08)", padding:"4px 8px", borderRadius:4}}>{t.yearEndAumFormula}</p><p style={{marginTop:6}}>{t.yearEndAumInfoEnd}</p></>}
              t={t}
            />
          </div>
        </section>


        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>{t.arrYoyTitle}</h2>
                <InfoTooltip label={t.moreInformation}><p>{t.arrYoyInfo}</p></InfoTooltip>
              </div>
              <p>{t.arrYoySub}</p>
            </div>
          </div>
          <ArrYoYChart data={arrYoySeries} t={t} />
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>{t.arrIndexedTitle}</h2>
                <InfoTooltip label={t.moreInformation}><p>{t.arrIndexedInfo}</p></InfoTooltip>
              </div>
              <p>{t.arrIndexedSub}</p>
            </div>
          </div>
          <ArrYearlyIndexChart data={arrYearlyIndex} t={t} />
        </section>

        <section className="chart-section">
          <div className="chart-top">
            <div>
              <div className="chart-title-row">
                <h2>{t.aumReferenceTitle}</h2>
                <InfoTooltip label={t.moreInformation}><p>{t.aumReferenceInfo}</p></InfoTooltip>
              </div>
              <p>{t.aumReferenceSub} {euroCompact.format(COMPANY_TARGET.aumStart)} ({t.yearEnd2025}) {t.latestPublicAumInfoMid} {euroCompact.format(COMPANY_TARGET.aumEnd)} (2030)</p>
            </div>
            <div className="chart-legend">
              <span><i className="leg-dot real" />{t.realMonthly}</span>
              <span><i className="leg-dash" />{t.ownReferenceLegend}</span>
            </div>
          </div>
          <AumChart data={chartData} t={t} />
        </section>

        {/* ── Fila 1: Histórico anual + histórico mensual ── */}
        <section className="seasonality-grid">
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.annualNetInflowsTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.annualNetInflowsInfo}</p></InfoTooltip>
                </div>
                <p>{t.annualNetInflowsSub}</p>
              </div>
            </div>
            <AnnualInflowsChart data={annualInflows} projection={annualProjection} />
          </article>
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.monthlyNetInflowsTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.monthlyNetInflowsInfo}</p></InfoTooltip>
                </div>
                <p>{t.monthlyNetInflowsSub}</p>
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
                  <h2>{t.ytdComparisonTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.ytdComparisonInfo}</p></InfoTooltip>
                </div>
                <p>{t.ytdComparisonSubPrefix} {lastDate ? `${lastDate.getDate()} ${t.monthsShort[lastDate.getMonth()]}` : t.today} · {t.ytdComparisonSubSuffix}</p>
              </div>
            </div>
            <StackedComparisonBarChart data={ytdComparison} />
          </article>
          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.mtdComparisonTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.mtdComparisonInfo}</p></InfoTooltip>
                </div>
                <p>{t.mtdComparisonSubPrefix}{lastDate?.getDate() ?? "?"} {lastDate ? t.monthsShort[lastDate.getMonth()] : "-"} · {t.mtdComparisonSubSuffix}</p>
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
                  <h2>{t.monthlySeasonalityTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.monthlySeasonalityInfo}</p></InfoTooltip>
                </div>
                <p>{t.monthlySeasonalitySub}</p>
              </div>
            </div>
            <SeasonalityChart data={seasonalityMonthly} t={t} />
            <p className="chart-note">
              {t.monthlySeasonalityNote}
            </p>
          </article>

          <article className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.quarterlySeasonalityTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.quarterlySeasonalityInfo}</p></InfoTooltip>
                </div>
                <p>{t.quarterlySeasonalitySub}</p>
              </div>
            </div>
            <SeasonalityChart data={seasonalityQuarterly} t={t} />
            <p className="chart-note">
              {t.quarterlySeasonalityNote}
            </p>
          </article>
        </section>

        {dataset.clientsHistory?.length > 1 && (
          <section className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.clientsTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.clientsInfo}</p></InfoTooltip>
                </div>
                <p>
                  {t.currentClients}: <strong>{dataset.clientsHistory.at(-1).clients.toLocaleString(lang === "en" ? "en-GB" : "es-ES")}</strong>
                  {" · "}
                  {t.dataSince} {dataset.clientsHistory[0].date.toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <ClientsChart data={dataset.clientsHistory} t={t} lang={lang} />
          </section>
        )}

        {twrData && (
          <section className="chart-section">
            <div className="chart-top">
              <div>
                <div className="chart-title-row">
                  <h2>{t.portfolioReturnTitle}</h2>
                  <InfoTooltip label={t.moreInformation}><p>{t.portfolioReturnInfo}</p></InfoTooltip>
                </div>
                <p>
                  {t.annualizedTwr}: <strong>{percent.format(twrData.twrAnnualized)}</strong>
                  {" · "}
                  {new Date().getFullYear()}: <strong>{percent.format(twrData.currentYearReturn ?? 0)}</strong> ({t.partial})
                  {" · "}
                  {t.accumulated}: <strong>+{(twrData.twrAccumulated * 100).toFixed(0)}%</strong> {lang === "en" ? "in" : "en"} {twrData.yearsSpan.toFixed(1)} {t.years}
                </p>
              </div>
            </div>
            <ReturnBarsChart annualReturns={twrData.annualReturns.filter((r) => r.year >= 2021)} />
            <p className="chart-note" style={{ marginTop: 16, marginBottom: 4 }}>{t.monthlyBreakdownNote}</p>
            <ReturnMonthlyHeatmap monthlyReturns={twrData.monthlyReturns.filter((r) => r.year >= 2021)} t={t} />
            <p className="chart-note">{t.currentYearPartialNote}</p>
          </section>
        )}

        <section className="history-section">
          <div className="chart-title-row">
            <h2>{t.historyTitle}</h2>
            <InfoTooltip label={t.moreInformation}><p>{t.historyInfo} {percent.format(COMPANY_TARGET.feeRate)}.</p></InfoTooltip>
          </div>
          <p className="section-sub">
            {t.historySub} {percent.format(COMPANY_TARGET.feeRate)} {lang === "en" ? "over AUM" : "sobre AUM"}
          </p>
          <HistoryTable yearlyRows={dataset.yearlyRows} t={t} />
        </section>

        <SourceMethodology t={t} />
          </>
        )}
      </main>
      <Footer onOpenDisclaimer={() => setShowDisclaimer(true)} lang={lang} t={t} />
    </div>
  );
}
