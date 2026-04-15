const MONTHS_PER_YEAR = 12;
const DEFAULT_PROJECTION_YEARS = Array.from({ length: 10 }, (_, index) => 2026 + index);

export const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

export const euroCompact = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1
});

export const percent = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 2
});

export const numberCompact = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1
});

export const PDF_BENCHMARK = [
  { year: 2026, clients: 178000, aumEnd: 5816e6, fees: 13494e3, ebit: 6484e3, netProfit: 4863e3, netCash: 5917e3 },
  { year: 2027, clients: 230000, aumEnd: 7627e6, fees: 17738e3, ebit: 9840e3, netProfit: 7577e3, netCash: 12220e3 },
  { year: 2028, clients: 292000, aumEnd: 9922e6, fees: 23152e3, ebit: 14171e3, netProfit: 10911e3, netCash: 21508e3 },
  { year: 2029, clients: 366000, aumEnd: 12803e6, fees: 29976e3, ebit: 19848e3, netProfit: 15283e3, netCash: 34744e3 },
  { year: 2030, clients: 454000, aumEnd: 16388e6, fees: 38496e3, ebit: 27007e3, netProfit: 20795e3, netCash: 52983e3 }
];

// Objetivo oficial Indexa Capital: 30M€ ARR en 2030
// A 0,25% de fee media implica 12.000M€ de AUM (CAGR ~22% desde 4.403M€ fin-2025)
export const COMPANY_TARGET = {
  aumStart:  4_403e6,   // AUM real auditado 31/12/2025
  aumEnd:   12_000e6,   // implícito: arrEnd / feeRate
  arrStart:  11_008e3,  // 4403M × 0.25%
  arrEnd:   30_000e3,   // objetivo público empresa
  feeRate:  0.0025,
  yearStart: 2025,
  yearEnd:   2030,
  totalYears: 5,
};

function expInterp(start, end, yearFrac, totalYears) {
  if (!start || !end || start === end || totalYears <= 0) return start;
  const t = Math.max(0, Math.min(totalYears, yearFrac));
  return start * Math.pow(end / start, t / totalYears);
}

// Devuelve AUM y ARR objetivo para cualquier fecha
export function targetAtDate(date) {
  const ref = new Date("2025-12-31T00:00:00");
  const yearFrac = (date - ref) / (365.25 * 24 * 60 * 60 * 1000);
  return {
    aumTarget: expInterp(COMPANY_TARGET.aumStart, COMPANY_TARGET.aumEnd, yearFrac, COMPANY_TARGET.totalYears),
    arrTarget: expInterp(COMPANY_TARGET.arrStart, COMPANY_TARGET.arrEnd, yearFrac, COMPANY_TARGET.totalYears),
  };
}

// Jalones anuales de la curva exponencial (para tabla)
export const EXPONENTIAL_MILESTONES = Array.from({ length: 5 }, (_, i) => {
  const year = 2026 + i;
  const t = year - COMPANY_TARGET.yearStart;
  return {
    year,
    aumTarget: expInterp(COMPANY_TARGET.aumStart, COMPANY_TARGET.aumEnd, t, COMPANY_TARGET.totalYears),
    arrTarget: expInterp(COMPANY_TARGET.arrStart, COMPANY_TARGET.arrEnd, t, COMPANY_TARGET.totalYears),
  };
});

const TAX_BY_YEAR = { 2026: 0.25, 2027: 0.23, 2028: 0.23, 2029: 0.23, 2030: 0.23 };
const CASH_CONVERSION_BY_YEAR = { 2026: 0.773, 2027: 0.832, 2028: 0.851, 2029: 0.866, 2030: 0.877 };
const REAL_2025_PYG = {
  fees: 9420746.98,
  personnel: 2752665.41,
  generals: 3176892.9,
  amort: 62579.762
};
const HISTORICAL_PYG = [
  { year: 2021, fees: 2821219.46, personnel: 1009736.09, generals: 1196834.22, amort: 161200.02, ebit: 274021.55, taxes: 0, netProfit: 274021.55 },
  { year: 2022, fees: 3931909.07, personnel: 1416530.97, generals: 1665721.03, amort: 153256.29, ebit: 395574.29, taxes: 0, netProfit: 395574.29 },
  { year: 2023, fees: 4843659.23, personnel: 1750581.96, generals: 2061728.93, amort: 101394.89, ebit: 608217.03, taxes: 199534.04, netProfit: 408682.99 },
  { year: 2024, fees: 6610518.21, personnel: 2400994.48, generals: 2893677.73, amort: 66497.5641666667, ebit: 1239150.03583333, taxes: 474155.51, netProfit: 764994.53 },
  { year: 2025, fees: 9420746.98, personnel: 2752665.41, generals: 3176892.9, amort: 62579.762, ebit: 3272187.058, taxes: 898633.12, netProfit: 2373553.938 }
];

const parseEuroNumber = (raw) => Number(String(raw ?? "").replaceAll(".", "").replace(",", "."));
const sortByDate = (rows) => [...rows].sort((a, b) => a.date.getTime() - b.date.getTime());
const calcCagr = (start, end, years) => (!start || !end || years <= 0 ? 0 : Math.pow(end / start, 1 / years) - 1);

function normalizeHeader(header) {
  return String(header ?? "")
    .replaceAll('"', "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(";").map((value) => normalizeHeader(value.trim()));
  return lines.slice(1).map((line) => {
    const values = line.split(";");
    return headers.reduce((acc, header, index) => ({ ...acc, [header]: values[index] }), {});
  });
}

function rollingAverage(rows, accessor, size) {
  return rows.map((row, index) => {
    const start = Math.max(0, index - size + 1);
    const window = rows.slice(start, index + 1);
    return window.reduce((sum, item) => sum + accessor(item), 0) / window.length;
  });
}

function monthlyFromDaily(volumeRows, revenueRows) {
  const revenueMap = new Map(revenueRows.map((row) => [row.date.toISOString().slice(0, 10), row]));
  const monthlyMap = new Map();

  for (const row of volumeRows) {
    const monthKey = row.date.toISOString().slice(0, 7);
    const revenue = revenueMap.get(row.date.toISOString().slice(0, 10));
    const current = monthlyMap.get(monthKey) ?? {
      key: monthKey,
      date: new Date(`${monthKey}-01T00:00:00`),
      volumeEnd: row.volume,
      inflowsMonthly: 0,
      inflowsAccum: row.inflowsAccum,
      arr: revenue?.arr ?? 0,
      feePct: revenue?.feePct ?? 0
    };

    current.volumeEnd = row.volume;
    current.inflowsMonthly += row.inflowsDaily;
    current.inflowsAccum = row.inflowsAccum;
    if (revenue) {
      current.arr = revenue.arr;
      current.feePct = revenue.feePct;
    }
    monthlyMap.set(monthKey, current);
  }

  return sortByDate([...monthlyMap.values()]).map((row, index, rows) => ({
    ...row,
    returnGenerated: row.volumeEnd - row.inflowsAccum,
    volumeGrowth: index > 0 ? row.volumeEnd / rows[index - 1].volumeEnd - 1 : 0
  }));
}

function yearlyFromMonthly(monthlyRows) {
  const yearlyMap = new Map();
  for (const row of monthlyRows) {
    const year = row.date.getFullYear();
    const current = yearlyMap.get(year) ?? {
      year,
      volumeEnd: row.volumeEnd,
      inflowsAnnual: 0,
      arrEnd: row.arr,
      feePctEnd: row.feePct
    };
    current.volumeEnd = row.volumeEnd;
    current.inflowsAnnual += row.inflowsMonthly;
    current.arrEnd = row.arr;
    current.feePctEnd = row.feePct;
    yearlyMap.set(year, current);
  }
  const sorted = [...yearlyMap.values()].sort((a, b) => a.year - b.year);
  return sorted.map((row, index, rows) => ({
    ...row,
    growthVolumePct: index > 0 ? row.volumeEnd / rows[index - 1].volumeEnd - 1 : 0
  }));
}

function normalizeVolumeRows(rows) {
  return sortByDate(
    rows.map((row) => ({
      date: new Date(`${row.fecha}T00:00:00`),
      volume: parseEuroNumber(row.volumen),
      inflowsDaily: parseEuroNumber(row.aportaciones_netas_dia),
      inflowsAccum: parseEuroNumber(row.aportaciones_netas_acumuladas)
    }))
  );
}

function normalizeRevenueRows(rows) {
  return sortByDate(
    rows.map((row) => ({
      date: new Date(`${row.fecha}T00:00:00`),
      arr: parseEuroNumber(row.ingresos_anuales_recurrentes_sin_iva),
      feePct: parseEuroNumber(row.comision_media_anual_sin_iva) / 100
    }))
  );
}

function buildMetrics(volumeRows, revenueRows, monthlyRows, yearlyRows) {
  const first = volumeRows[0];
  const lastVolume = volumeRows.at(-1);
  const lastRevenue = revenueRows.at(-1);
  const yearsSpan = (lastVolume.date.getTime() - first.date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const inflowTrend = rollingAverage(monthlyRows, (row) => row.inflowsMonthly, 6);
  return {
    summary: {
      startDate: first.date,
      endDate: lastVolume.date,
      currentAum: lastVolume.volume,
      currentArr: lastRevenue.arr,
      currentFeePct: lastRevenue.feePct,
      cumulativeInflows: lastVolume.inflowsAccum,
      profitability: lastVolume.volume - lastVolume.inflowsAccum,
      volumeCagr: calcCagr(first.volume, lastVolume.volume, yearsSpan),
      arrCagr: calcCagr(revenueRows[0]?.arr ?? 0, lastRevenue?.arr ?? 0, yearsSpan)
    },
    derived: {
      inflowTrend: monthlyRows.map((row, index) => ({ date: row.date, value: inflowTrend[index] })),
      monthlyRows,
      yearlyRows
    }
  };
}

function buildSeasonalitySeries(volumeRows, monthlyRows, mode = "month") {
  const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const quarterLabels = ["T1", "T2", "T3", "T4"];
  const firstDailyByYear = new Map();

  for (const row of volumeRows) {
    const year = row.date.getFullYear();
    if (!firstDailyByYear.has(year)) {
      firstDailyByYear.set(year, row);
    }
  }

  const monthlyByYear = new Map();
  for (const row of monthlyRows) {
    const year = row.date.getFullYear();
    const rows = monthlyByYear.get(year) ?? [];
    rows.push(row);
    monthlyByYear.set(year, rows);
  }

  const years = [...monthlyByYear.keys()].sort((a, b) => a - b).slice(-5);
  const latestDate = volumeRows.at(-1)?.date ?? null;
  const latestYear = latestDate?.getFullYear() ?? null;
  const latestMonth = latestDate?.getMonth() ?? null;

  const categories = mode === "quarter" ? quarterLabels : monthLabels;
  const series = years.map((year) => {
    const rows = monthlyByYear.get(year) ?? [];
    const base = firstDailyByYear.get(year)?.inflowsAccum ?? null;
    const isCurrentYear = year === latestYear;

    if (!base || base <= 0) {
      return {
        label: isCurrentYear ? `${year} YTD` : String(year),
        values: categories.map(() => null),
      };
    }

    if (mode === "quarter") {
      const quarterSums = [0, 0, 0, 0];
      const quarterHasData = [false, false, false, false];

      for (const row of rows) {
        const quarterIndex = Math.floor(row.date.getMonth() / 3);
        quarterSums[quarterIndex] += row.inflowsMonthly;
        quarterHasData[quarterIndex] = true;
      }

      return {
        label: isCurrentYear ? `${year} YTD` : String(year),
        values: quarterSums.map((sum, index) => (quarterHasData[index] ? sum / base * 100 : null)),
      };
    }

    const values = Array.from({ length: 12 }, () => null);
    for (const row of rows) {
      const monthIndex = row.date.getMonth();
      values[monthIndex] = row.inflowsMonthly / base * 100;
    }

    if (isCurrentYear && latestMonth != null) {
      for (let i = latestMonth + 1; i < values.length; i += 1) {
        values[i] = null;
      }
    }

    return {
      label: isCurrentYear ? `${year} YTD` : String(year),
      values,
    };
  });

  return { categories, series };
}

function buildDefaultYearInput(year, personnelBase, otherGeneralsBase) {
  const yearOffset = year - 2025;
  return {
    year,
    marketing: 1600000 * Math.pow(1.25, yearOffset),
    cac: 45 * Math.pow(1.05, Math.max(0, year - 2026)),
    churnAnnual: 0.056,
    initialTicket: 9400,
    monthlyNetContribution: 438,
    marketReturn: 0.05,
    feeRate: 0.0025,
    personnel: personnelBase * Math.pow(1.11, yearOffset),
    otherGenerals: otherGeneralsBase * Math.pow(1.1, yearOffset),
    amort: REAL_2025_PYG.amort * Math.pow(1.03, Math.max(0, year - 2026)),
    taxRate: TAX_BY_YEAR[year] ?? 0.23,
    cashConversion: CASH_CONVERSION_BY_YEAR[year] ?? 0.88,
    profitMultiple: 16
  };
}

function projectIndexaScenarios(dataset, assumptions) {
  const year2025 = dataset.yearlyRows.find((row) => row.year === 2025);
  const aum2025 = year2025?.volumeEnd ?? dataset.metrics.summary.currentAum;
  const aumLive2026 = dataset.metrics.summary.currentAum;
  const arrLive2026 = dataset.metrics.summary.currentArr;
  const rows = [];

  let aumPrev = aum2025;
  let clientsPrev = assumptions.clients2025;
  let netCashPrev = assumptions.netCash2025;

  for (const input of assumptions.yearlyInputs) {
    const netAdds = input.marketing / Math.max(input.cac, 1);
    let clientsEnd = clientsPrev * (1 - input.churnAnnual) + netAdds;
    if (input.year === 2026) {
      clientsEnd = Math.max(clientsEnd, assumptions.clientsLive2026);
    }
    const avgClients = (clientsPrev + clientsEnd) / 2;
    const initialFlows = netAdds * input.initialTicket;
    const recurringFlows = avgClients * input.monthlyNetContribution * MONTHS_PER_YEAR;
    const totalNetFlows = initialFlows + recurringFlows;
    const marketImpact = (aumPrev + 0.5 * totalNetFlows) * input.marketReturn;

    let aumEnd = aumPrev + totalNetFlows + marketImpact;
    if (input.year === 2026) {
      aumEnd = Math.max(aumEnd, aumLive2026);
    }
    const avgAum = 0.5 * (aumPrev + aumEnd);

    let fees = avgAum * input.feeRate;
    if (input.year === 2026) {
      fees = Math.max(fees, arrLive2026);
    }

    const nii = Math.max(0, netCashPrev) * 0.0175; // intereses sobre caja neta al 1,75%
    const totalGenerals = input.marketing + input.otherGenerals;
    const ebit = fees + nii - input.personnel - totalGenerals - input.amort;
    const taxes = -Math.max(ebit, 0) * input.taxRate;
    const netProfit = ebit + taxes;
    const freeCashFlow = Math.max(netProfit, 0) * input.cashConversion;
    const netCash = netCashPrev + freeCashFlow;
    const equityValue = Math.max(netProfit, 0) * input.profitMultiple + netCash;

    rows.push({
      year: input.year,
      ...input,
      netAdds,
      clientsStart: clientsPrev,
      clients: clientsEnd,
      avgClients,
      aumStart: aumPrev,
      avgAum,
      aumEnd,
      initialFlows,
      recurringFlows,
      totalNetFlows,
      marketImpact,
      fees,
      totalGenerals,
      ebit,
      taxes,
      netProfit,
      freeCashFlow,
      netCash,
      equityValue,
      efficiencyRatio: (input.personnel + totalGenerals + input.amort) / fees,
      marginEbitPct: ebit / fees,
      marginNetPct: netProfit / fees
    });

    aumPrev = aumEnd;
    clientsPrev = clientsEnd;
    netCashPrev = netCash;
  }

  return rows;
}

function buildHistoricalOperatingRows() {
  return HISTORICAL_PYG.map((row) => {
    const operatingCosts = row.personnel + row.generals + row.amort;
    return {
      ...row,
      efficiencyRatio: operatingCosts / row.fees,
      marginEbitPct: row.ebit / row.fees,
      marginNetPct: row.netProfit / row.fees
    };
  });
}

function buildProjectionComparison(modelRows) {
  return modelRows.map((row) => {
    const benchmark = PDF_BENCHMARK.find((item) => item.year === row.year);
    return {
      year: row.year,
      clientsModel: row.clients,
      clientsPdf: benchmark?.clients ?? null,
      aumModel: row.aumEnd,
      aumPdf: benchmark?.aumEnd ?? null,
      feesModel: row.fees,
      feesPdf: benchmark?.fees ?? null,
      ebitModel: row.ebit,
      ebitPdf: benchmark?.ebit ?? null,
      netModel: row.netProfit,
      netPdf: benchmark?.netProfit ?? null,
      cashModel: row.netCash,
      cashPdf: benchmark?.netCash ?? null,
      deltaAumPct: benchmark?.aumEnd ? row.aumEnd / benchmark.aumEnd - 1 : null,
      deltaFeesPct: benchmark?.fees ? row.fees / benchmark.fees - 1 : null,
      deltaNetPct: benchmark?.netProfit ? row.netProfit / benchmark.netProfit - 1 : null
    };
  });
}

function simulateFundVsIndexa(settings) {
  let fundCapital = settings.initialCapital;
  let indexaEquity = settings.initialCapital;
  const rows = [];

  for (let month = 1; month <= settings.years * MONTHS_PER_YEAR; month += 1) {
    const fundMonthlyReturn = Math.pow(1 + settings.fundAnnualReturn, 1 / MONTHS_PER_YEAR) - 1;
    const fundMonthlyFee = settings.fundFee / MONTHS_PER_YEAR;
    const indexaBusinessReturn = Math.pow(1 + settings.indexaAnnualBusinessReturn, 1 / MONTHS_PER_YEAR) - 1;
    const indexaVolatilityDrag = settings.indexaRiskPenalty / MONTHS_PER_YEAR;

    fundCapital = (fundCapital + settings.monthlyContribution) * (1 + fundMonthlyReturn - fundMonthlyFee);
    indexaEquity = (indexaEquity + settings.monthlyContribution) * (1 + indexaBusinessReturn - indexaVolatilityDrag);
    rows.push({ label: `${Math.floor((month - 1) / MONTHS_PER_YEAR) + 1}.${String(((month - 1) % 12) + 1).padStart(2, "0")}`, fundCapital, indexaEquity, month });
  }

  return rows;
}

export async function loadIndexaDataset() {
  const [volumeCsv, revenueCsv] = await Promise.all([
    fetch("/data/indexa_stats_volume.csv").then((response) => response.text()),
    fetch("/data/indexa_stats_revenue.csv").then((response) => response.text())
  ]);

  const volumeRows = normalizeVolumeRows(parseCsv(volumeCsv));
  const revenueRows = normalizeRevenueRows(parseCsv(revenueCsv));
  const monthlyRows = monthlyFromDaily(volumeRows, revenueRows);
  const yearlyRows = yearlyFromMonthly(monthlyRows);
  return { volumeRows, revenueRows, monthlyRows, yearlyRows, metrics: buildMetrics(volumeRows, revenueRows, monthlyRows, yearlyRows) };
}

export function defaultIndexaAssumptions(dataset) {
  const personnelBase = REAL_2025_PYG.personnel;
  const otherGeneralsBase = Math.max(REAL_2025_PYG.generals - 1600000, 0);

  return {
    clients2025: 134000,
    clientsLive2026: 148621,
    netCash2025: 2157000,
    yearlyInputs: DEFAULT_PROJECTION_YEARS.map((year) => buildDefaultYearInput(year, personnelBase, otherGeneralsBase))
  };
}

export function defaultComparatorSettings(dataset, assumptions) {
  const baseProjection = projectIndexaScenarios(dataset, assumptions);
  const firstYear = baseProjection[0];
  const lastYear = baseProjection.at(-1);
  const annualizedBusinessReturn = firstYear && lastYear
    ? Math.pow(lastYear.equityValue / Math.max(firstYear.equityValue, 1), 1 / Math.max(baseProjection.length - 1, 1)) - 1
    : 0.12;

  return {
    initialCapital: 10000,
    monthlyContribution: 300,
    years: 10,
    fundAnnualReturn: 0.07,
    fundFee: 0.0065,
    indexaAnnualBusinessReturn: annualizedBusinessReturn,
    indexaRiskPenalty: 0.03
  };
}

export function buildScenarioTables(dataset, assumptions, comparatorSettings) {
  const projectionRows = projectIndexaScenarios(dataset, assumptions);
  const historicalOperatingRows = buildHistoricalOperatingRows();
  return {
    historicalOperatingRows,
    projectionRows,
    projectionCompareRows: buildProjectionComparison(projectionRows),
    combinedOperatingRows: [
      ...historicalOperatingRows.map((row) => ({ ...row, label: String(row.year) })),
      ...projectionRows.map((row) => ({ ...row, label: `${row.year}E` }))
    ],
    comparatorRows: simulateFundVsIndexa(comparatorSettings)
  };
}

export function buildTrackerData(dataset) {
  const today = new Date();
  const { currentAum, currentArr, endDate: lastDate } = dataset.metrics.summary;
  const labelFmt = new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit" });

  // ── Objetivos hoy (curva exponencial) ──────────────────────────────────────
  const { aumTarget: targetAumNow, arrTarget: targetArrNow } = targetAtDate(today);
  const aumDeltaPct = targetAumNow > 0 ? currentAum / targetAumNow - 1 : null;
  const arrDeltaPct = targetArrNow > 0 ? currentArr / targetArrNow - 1 : null;

  // ── Proyección de cierre de año al ritmo actual ────────────────────────────
  const last3 = dataset.monthlyRows.slice(-3);
  const avgMonthlyInflow = last3.reduce((s, r) => s + r.inflowsMonthly, 0) / Math.max(last3.length, 1);
  const yearEnd = new Date(`${today.getFullYear() + 1}-01-01T00:00:00`);
  const monthsLeft = Math.max(0, (yearEnd - today) / (30.4375 * 24 * 60 * 60 * 1000));
  const projectedYeAum = currentAum * Math.pow(1.05, monthsLeft / 12) + avgMonthlyInflow * monthsLeft;
  const { aumTarget: targetYearEnd } = targetAtDate(yearEnd);
  const paceDeltaPct = targetYearEnd > 0 ? projectedYeAum / targetYearEnd - 1 : null;

  // ── Gráfico AUM: histórico 2025 + proyección exponencial 2026-2030 ─────────
  // Meses reales desde ene-2025
  const actualMap = new Map(dataset.monthlyRows.map((r) => [r.date.toISOString().slice(0, 7), r]));
  const chartData = [];
  let cur = new Date("2020-01-01T00:00:00");
  const chartEnd = new Date("2031-01-01T00:00:00");
  while (cur < chartEnd) {
    const key = cur.toISOString().slice(0, 7);
    const row = actualMap.get(key);
    const { aumTarget } = targetAtDate(cur);
    const ref = new Date("2025-12-31T00:00:00");
    const isFuture = cur > ref;
    // Incluir diciembre 2025 como punto ancla de la curva objetivo (= 4.403M€)
    // para que las dos líneas se unan visualmente en ese punto
    const isAnchor = cur.getFullYear() === 2025 && cur.getMonth() === 11;
    chartData.push({
      label: labelFmt.format(cur),
      actual: row?.volumeEnd ?? null,
      target: (isFuture || isAnchor) ? aumTarget : null,
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  // ── Descomposición mensual: aportaciones vs mercado (últimos 18 meses) ─────
  const monthly = dataset.monthlyRows;
  const last18 = monthly.slice(-18);
  const decomposition = last18.map((row, i) => {
    const prev = monthly[monthly.length - last18.length + i - 1];
    const prevVol = prev?.volumeEnd ?? COMPANY_TARGET.aumStart;
    const marketImpact = row.volumeEnd - prevVol - row.inflowsMonthly;
    return {
      label: labelFmt.format(row.date),
      inflows: row.inflowsMonthly,
      marketImpact,
      arr: row.arr,
      feePct: row.feePct,
    };
  });

  const seasonalityMonthly = buildSeasonalitySeries(dataset.volumeRows, dataset.monthlyRows, "month");
  const seasonalityQuarterly = buildSeasonalitySeries(dataset.volumeRows, dataset.monthlyRows, "quarter");
  const annualInflows = dataset.yearlyRows
    .filter((row) => row.year >= 2016)
    .map((row) => ({
      year: row.year,
      inflows: row.inflowsAnnual,
    }));

  return {
    currentAum, currentArr, lastDate,
    targetAumNow, targetArrNow,
    aumDeltaPct, arrDeltaPct,
    avgMonthlyInflow, projectedYeAum, targetYearEnd, paceDeltaPct,
    chartData, decomposition,
    seasonalityMonthly, seasonalityQuarterly,
    annualInflows,
  };
}
