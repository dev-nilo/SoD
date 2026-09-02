import type { ComparisonRow, ExportType, ImportaVarRow } from "@/types";

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob(["﻿" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const IMPORTA_VAR_HEADERS = ["perfil", "funcionalidade id", "funcionalidade"];

export function buildImportaVarRows(importaVarData: ImportaVarRow[]): string[][] {
  return [
    IMPORTA_VAR_HEADERS,
    ...importaVarData.map((row) => [row.perfil, String(row.funcionalidadeId), row.funcionalidade]),
  ];
}

function buildImportaVarCsv(importaVarData: ImportaVarRow[]): string {
  // Tab-delimited: matches the "Copiar para Excel" clipboard format, which is the
  // format the VAR importer actually accepts (a comma-delimited file lands in a
  // single column under pt-BR locale settings).
  return buildImportaVarRows(importaVarData)
    .map((row) => row.join("\t"))
    .join("\r\n");
}

function buildAnaliseCsv(results: ComparisonRow[]): string {
  let csv = "Status,Funcionalidade Original,Sugerida Similar,ID Similar,Confiança,Motivo\r\n";
  results.forEach((row) => {
    const status = row.acceptedOverride ? row.acceptedOverride.status : row.status;
    const matched = row.acceptedOverride?.matchedItem ?? row.matchedItem;
    const orig = `"${row.rawInput.replace(/"/g, '""')}"`;
    const sug = matched ? `"${matched.name.replace(/"/g, '""')}"` : '""';
    const id = matched ? matched.id : "";
    csv += `${status},${orig},${sug},${id},${row.confidence}%,${row.reason}\r\n`;
  });
  return csv;
}

export function exportToCSV(
  type: ExportType,
  { results, importaVarData, profileCode }: { results: ComparisonRow[]; importaVarData: ImportaVarRow[]; profileCode: string }
) {
  const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  if (type === "importa_var") {
    downloadFile(buildImportaVarCsv(importaVarData), `Importa_VAR_${profileCode}_${dateStr}.csv`, "text/csv;charset=utf-8;");
  } else {
    downloadFile(buildAnaliseCsv(results), `Analise_Divergencias_${profileCode}_${dateStr}.csv`, "text/csv;charset=utf-8;");
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
