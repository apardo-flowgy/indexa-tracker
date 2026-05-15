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
    expectedHeaderTokens: ["fecha", "volumen", "aportaciones netas", "acumuladas"]
  },
  {
    stat: "revenue",
    filename: "indexa_stats_revenue.csv",
    expectedHeaderTokens: ["fecha", "volumen", "ingresos diarios recurrentes", "ingresos anuales recurrentes", "comision media anual"]
  }
];

function normalizeHeaderLine(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^(A-Za-z0-9_;"\s-)]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function downloadCsv({ stat, filename, expectedHeaderTokens }) {
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
  const [firstLine = ""] = content.split(/\r?\n/, 1);
  const normalizedHeader = normalizeHeaderLine(firstLine);
  const hasExpectedHeader = expectedHeaderTokens.every((token) => normalizedHeader.includes(token));
  if (!hasExpectedHeader) {
    throw new Error(`Cabecera CSV no esperada para ${stat}`);
  }

  const targetPath = path.join(dataDir, filename);
  const tmpPath = `${targetPath}.tmp`;
  await writeFile(tmpPath, content, "utf8");
  await rename(tmpPath, targetPath);

  const rowCount = Math.max(content.trim().split(/\r?\n/).length - 1, 0);
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
