import { SCENARIO_LABEL, type SodScenario } from "@/lib/sod-notes";
import type { ProfileFunctionalityRow, TriggeredRisk } from "@/types";

const KIND_LABEL: Record<string, string> = {
  funcao: "SoD",
  critico: "Crítico",
};

export interface SodExportInput {
  date: string;
  perfil: string;
  modulo: string;
  cenario: SodScenario;
  ticket: string;
  analyst: string;
  profileRows: ProfileFunctionalityRow[];
  triggeredRisks: TriggeredRisk[];
}

export interface SheetData {
  name: string;
  rows: (string | number)[][];
}

/**
 * The SoD analysis workbook the approval e-mail refers to as "o Excel em
 * anexo": a summary, one row per functionality in each triggered risk
 * combination, and the profile scope that was analysed.
 */
export function buildSodWorkbookSheets(input: SodExportInput): SheetData[] {
  const resumo: SheetData = {
    name: "Resumo",
    rows: [
      ["Perfil", input.perfil],
      ["Módulo", input.modulo || "—"],
      ["Cenário", SCENARIO_LABEL[input.cenario]],
      ["Ticket", input.ticket.trim() ? `#${input.ticket.trim()}` : "—"],
      ["Data", input.date],
      ["Analista", input.analyst],
      ["Funcionalidades analisadas", input.profileRows.length],
      ["Riscos encontrados", new Set(input.triggeredRisks.map((t) => t.risk.id)).size],
    ],
  };

  const riscos: SheetData = {
    name: "Riscos",
    rows: [
      ["Funcionalidade", "Status no perfil", "ID Risco", "Tipo", "Descrição Risco", "Criticidade", "Conflito Com"],
      ...input.triggeredRisks.flatMap((t) =>
        t.matches.map((m) => [
          m.functionality.name,
          m.status,
          t.risk.id,
          KIND_LABEL[t.risk.kind] ?? t.risk.kind,
          t.risk.description,
          t.risk.criticality,
          t.matches
            .filter((other) => other !== m)
            .map((other) => other.functionality.name)
            .join(" + "),
        ])
      ),
    ],
  };

  const escopo: SheetData = {
    name: "Escopo Analisado",
    rows: [
      ["Perfil", "Sistema", "Funcionalidade", "Status"],
      ...input.profileRows.map((r) => [r.perfil, r.sistema, r.funcionalidade, r.status]),
    ],
  };

  return [resumo, riscos, escopo];
}

export function sodExportFileName(perfil: string, isoDate: string): string {
  const safe = perfil.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "perfil";
  return `Analise_SoD_${safe}_${isoDate}.xlsx`;
}

export async function exportSodAnalysisXlsx(input: SodExportInput, isoDate: string): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  for (const sheet of buildSodWorkbookSheets(input)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheet.rows), sheet.name);
  }
  XLSX.writeFile(workbook, sodExportFileName(input.perfil, isoDate));
}
