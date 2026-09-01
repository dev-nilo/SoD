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

function buildImportaVarCsv(importaVarData: ImportaVarRow[]): string {
  let csv = "id,perfil,funcionalidade id,funcionalidade\r\n";
  importaVarData.forEach((row) => {
    const escapedName = `"${row.funcionalidade.replace(/"/g, '""')}"`;
    csv += `${row.id},${row.perfil},${row.funcionalidadeId},${escapedName}\r\n`;
  });
  return csv;
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
