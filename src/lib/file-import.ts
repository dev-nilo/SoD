/**
 * Reads a browser File into a shape callers can parse further, without
 * committing to what that shape means (spreadsheet rows vs. plain text).
 * xlsx (SheetJS) is dynamically imported so its ~120KB isn't part of the
 * initial page bundle for the common paste/.csv/.txt path.
 */

export function looksLikeXlsx(file: File): boolean {
  return /\.xlsx?$/i.test(file.name);
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!(data instanceof ArrayBuffer)) {
        reject(new Error("Falha ao ler o arquivo."));
        return;
      }
      resolve(data);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

/** Reads the first sheet of a .xlsx/.xls file into its raw rows. */
export async function readWorkbookRows(file: File): Promise<unknown[][]> {
  const [XLSX, data] = await Promise.all([import("xlsx"), readAsArrayBuffer(file)]);
  try {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
  } catch (err) {
    throw err instanceof Error ? err : new Error("Falha ao processar a planilha.");
  }
}

/** Reads a file as plain text. */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") {
        reject(new Error("Falha ao ler o arquivo."));
        return;
      }
      resolve(text);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsText(file);
  });
}
