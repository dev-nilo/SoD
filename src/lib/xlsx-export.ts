export interface SheetData {
  name: string;
  rows: (string | number)[][];
}

/** "FIN/ANALISTA 01" -> "FIN_ANALISTA_01": keeps a user-typed name safe inside a file name. */
export function safeFileSegment(value: string, fallback: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || fallback;
}

/** Writes sheets built by the pure builders into a downloaded .xlsx (SheetJS loaded on demand). */
export async function downloadWorkbook(sheets: SheetData[], fileName: string): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheet.rows), sheet.name);
  }
  XLSX.writeFile(workbook, fileName);
}
