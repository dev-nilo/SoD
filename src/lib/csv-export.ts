import type { ImportaVarRow } from "@/types";

const IMPORTA_VAR_HEADERS = ["id", "perfil", "funcionalidade id", "funcionalidade"];

export function buildImportaVarRows(importaVarData: ImportaVarRow[]): string[][] {
  return [
    IMPORTA_VAR_HEADERS,
    ...importaVarData.map((row) => [row.id, row.perfil, String(row.funcionalidadeId), row.funcionalidade]),
  ];
}

export async function exportToXLSX({
  importaVarData,
  profileCode,
}: {
  importaVarData: ImportaVarRow[];
  profileCode: string;
}) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet(buildImportaVarRows(importaVarData));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Importa VAR");

  const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  XLSX.writeFile(workbook, `Importa_VAR_${profileCode}_${dateStr}.xlsx`);
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
