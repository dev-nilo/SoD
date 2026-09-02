/**
 * Reads the first sheet of a .xlsx/.xls file and returns column A as
 * newline-separated text, matching the "1 funcionalidade por linha" format
 * the comparison engine expects from a pasted/.csv/.txt input.
 *
 * xlsx (SheetJS) is dynamically imported so its ~120KB isn't part of the
 * initial page bundle for the common paste/.csv/.txt path.
 */
export async function parseSpreadsheetFile(file: File): Promise<string> {
  const XLSX = await import("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!(data instanceof ArrayBuffer)) {
          reject(new Error("Falha ao ler o arquivo."));
          return;
        }
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, blankrows: false });
        const lines = rows
          .map((row) => (row[0] ?? "").toString().trim())
          .filter((line) => line.length > 0);
        resolve(lines.join("\n"));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Falha ao processar a planilha."));
      }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}
