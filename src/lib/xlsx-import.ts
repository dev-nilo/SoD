import { readWorkbookRows } from "@/lib/file-import";

/**
 * Reads the first sheet of a .xlsx/.xls file and returns column A as
 * newline-separated text, matching the "1 funcionalidade por linha" format
 * the comparison engine expects from a pasted/.csv/.txt input.
 */
export async function parseSpreadsheetFile(file: File): Promise<string> {
  const rows = await readWorkbookRows(file);
  return rows
    .map((row) => (row[0] ?? "").toString().trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
