import { mkdir, rename, writeFile } from "node:fs/promises";
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

async function main() {
  await mkdir(dataDir, { recursive: true });

  for (const item of downloads) {
    await downloadCsv(item);
  }

  console.log(`Datos actualizados en ${dataDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
