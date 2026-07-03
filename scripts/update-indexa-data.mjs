import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "public", "data");

const downloads = [
  {
    stat: "volume",
    filename: "indexa_stats_volume.csv",
    // Indexa localiza las cabeceras (ES/FR/EN seg\u00fan su servidor, ignorando el
    // locale de la URL), pero las columnas son estables por posici\u00f3n. Guardamos
    // siempre esta cabecera can\u00f3nica en espa\u00f1ol, que es la que espera src/data.js.
    canonicalHeader: 'Fecha;"Volumen (\u20ac)";"Aportaciones netas (d\u00eda, \u20ac)";"Aportaciones netas acumuladas (\u20ac)"',
    expectedColumns: 4
  },
  {
    stat: "revenue",
    filename: "indexa_stats_revenue.csv",
    canonicalHeader: 'Fecha;"Volumen (\u20ac)";"Ingresos diarios recurrentes (\u20ac, sin IVA)";"Ingresos anuales recurrentes (\u20ac, sin IVA)";"Comisi\u00f3n media anual (%, sin IVA)"',
    expectedColumns: 5
  }
];

async function downloadCsv({ stat, filename, canonicalHeader, expectedColumns }) {
  const url = `https://indexacapital.com/es/esp/stats/download?stat=${stat}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "indexa-capital-analisis-data-updater/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Error descargando ${stat}: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/csv")) {
    throw new Error(`Respuesta inesperada para ${stat}: ${contentType || "sin content-type"}`);
  }

  const content = await response.text();
  const lines = content.split(/\r?\n/);

  // Validaci\u00f3n estructural (independiente del idioma de la cabecera): n\u00famero de
  // columnas correcto y una primera fila de datos con fecha YYYY-MM-DD.
  const headerColumns = (lines[0] ?? "").split(";").length;
  if (headerColumns !== expectedColumns) {
    throw new Error(`Estructura CSV inesperada para ${stat}: ${headerColumns} columnas (esperadas ${expectedColumns})`);
  }
  const firstDataRow = lines[1] ?? "";
  if (!/^\d{4}-\d{2}-\d{2};/.test(firstDataRow)) {
    throw new Error(`Primera fila de datos inesperada para ${stat}: "${firstDataRow.slice(0, 40)}"`);
  }

  // Reescribe la cabecera al formato can\u00f3nico para desacoplarse del idioma que
  // devuelva Indexa; el resto del contenido se conserva \u00edntegro.
  const normalizedContent = [canonicalHeader, ...lines.slice(1)].join("\n");

  const targetPath = path.join(dataDir, filename);
  const tmpPath = `${targetPath}.tmp`;
  await writeFile(tmpPath, normalizedContent, "utf8");
  await rename(tmpPath, targetPath);

  const rowCount = Math.max(normalizedContent.trim().split(/\r?\n/).length - 1, 0);
  console.log(`${filename}: ${rowCount} filas actualizadas`);
}

// ── Scraping de clientes desde la página de testimonios ──────────────────────
async function scrapeAndAppendClients() {
  const url = "https://indexacapital.com/es/esp/testimonies";
  const response = await fetch(url, {
    headers: { "user-agent": "indexa-capital-analisis-data-updater/1.0" }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} al obtener testimonios`);

  const html = await response.text();
  // Busca patrones como "154.811 clientes" o "clientes 154.811"
  const match = html.match(/(\d{1,3}(?:[.,]\d{3})+)\s*clientes/i)
    ?? html.match(/clientes[^0-9]*?(\d{1,3}(?:[.,]\d{3})+)/i);
  if (!match) throw new Error("Número de clientes no encontrado en la página");

  const clients = parseInt(match[1].replace(/[.,]/g, ""), 10);
  if (isNaN(clients) || clients < 10000) throw new Error(`Valor de clientes sospechoso: ${match[1]}`);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filePath = path.join(dataDir, "clients_history.csv");

  let existing = "fecha;clientes\n";
  try { existing = await readFile(filePath, "utf8"); } catch { /* archivo nuevo */ }

  const lines = existing.trim().split(/\r?\n/);
  const lastLine = lines.at(-1) ?? "";
  const [lastDate, lastCountStr] = lastLine.split(";");
  const lastCount = parseInt(lastCountStr ?? "0", 10);

  if (lastDate === today && lastCount === clients) {
    console.log(`clients_history.csv: sin cambios (${today}: ${clients.toLocaleString("es-ES")} clientes)`);
    return;
  }

  const newLine = `${today};${clients}`;
  // Si ya existe la fecha de hoy (misma fecha, cuenta diferente), reemplaza la última línea
  const updatedLines = lastDate === today ? [...lines.slice(0, -1), newLine] : [...lines, newLine];
  await writeFile(filePath, updatedLines.join("\n") + "\n", "utf8");
  console.log(`clients_history.csv: ${today} → ${clients.toLocaleString("es-ES")} clientes`);
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  for (const item of downloads) {
    await downloadCsv(item);
  }

  await scrapeAndAppendClients();

  console.log(`Datos actualizados en ${dataDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
