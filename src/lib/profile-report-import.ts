import { readWorkbookRows } from "@/lib/file-import";
import type { ProfileFunctionalityRow } from "@/types";

const REQUIRED_HEADERS = ["Perfil", "Sistema", "Funcionalidade", "Status"];

/**
 * Pulls just the functionality table out of a profile report (e.g. a Vennx
 * Access "Análise de Risco Perfil" export): finds the header row wherever
 * it lands, then reads rows until the functionality column goes blank —
 * which is also where that report's own risk section starts, if it has
 * one. We never read that section; the risk analysis is ours to compute.
 */
export function extractProfileRows(rows: unknown[][]): ProfileFunctionalityRow[] {
  const headerIndex = rows.findIndex((row) => REQUIRED_HEADERS.every((label) => row.includes(label)));
  if (headerIndex === -1) {
    throw new Error(
      "Não foi possível encontrar o cabeçalho (Perfil / Sistema / Funcionalidade / Status) no relatório."
    );
  }

  const header = rows[headerIndex] as unknown[];
  const [perfilCol, sistemaCol, funcionalidadeCol, statusCol] = REQUIRED_HEADERS.map((label) =>
    header.indexOf(label)
  );

  const result: ProfileFunctionalityRow[] = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const perfil = String(row[perfilCol] ?? "").trim();
    const funcionalidade = String(row[funcionalidadeCol] ?? "").trim();
    if (!perfil || !funcionalidade) break;

    result.push({
      perfil,
      sistema: String(row[sistemaCol] ?? "").trim(),
      funcionalidade,
      status: String(row[statusCol] ?? "").trim(),
    });
  }
  return result;
}

export async function parseProfileReport(file: File): Promise<ProfileFunctionalityRow[]> {
  const rows = await readWorkbookRows(file);
  return extractProfileRows(rows);
}
