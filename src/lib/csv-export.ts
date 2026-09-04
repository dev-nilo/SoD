import type { ImportaVarRow } from "@/types";

export const IMPORTA_VAR_COLUMNS: { key: keyof ImportaVarRow; header: string }[] = [
  { key: "id", header: "id" },
  { key: "perfil", header: "perfil" },
  { key: "funcionalidadeId", header: "funcionalidade id" },
  { key: "funcionalidade", header: "funcionalidade" },
];

export function buildImportaVarRows(importaVarData: ImportaVarRow[]): string[][] {
  return [
    IMPORTA_VAR_COLUMNS.map((c) => c.header),
    ...importaVarData.map((row) => IMPORTA_VAR_COLUMNS.map((c) => String(row[c.key]))),
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
