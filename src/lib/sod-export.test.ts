import { describe, expect, it } from "vitest";

import { buildSodWorkbookSheets, sodExportFileName } from "./sod-export";
import type { ProfileFunctionalityRow, TriggeredRisk, VarCatalogItem } from "@/types";

const fn = (id: number, name: string): VarCatalogItem => ({ id, code: "", name, moduleId: 2, moduleName: "TOTVS Gestão Financeira" });
const pagar = fn(1, "[01] Contas a Pagar");
const baixar = fn(2, "[02] Baixa de Títulos");

const triggered: TriggeredRisk[] = [
  {
    risk: { id: "SOD_001", kind: "funcao", description: "Pagar e baixar", criticality: 3 },
    matches: [
      { activity: { id: 1, name: "Pagar", functionalityIds: [1] }, functionality: pagar, status: "Adicionado" },
      { activity: { id: 2, name: "Baixar", functionalityIds: [2] }, functionality: baixar, status: "Mantido" },
    ],
  },
];

const profileRows: ProfileFunctionalityRow[] = [
  { perfil: "FIN", sistema: "TOTVS Gestão Financeira", funcionalidade: "[01] Contas a Pagar", status: "Adicionado" },
  { perfil: "FIN", sistema: "TOTVS Gestão Financeira", funcionalidade: "[02] Baixa de Títulos", status: "Mantido" },
];

describe("buildSodWorkbookSheets", () => {
  const sheets = buildSodWorkbookSheets({
    date: "21/10/2026",
    perfil: "FIN",
    modulo: "TOTVS Gestão Financeira",
    cenario: "manutencao",
    ticket: "",
    analyst: "Maria Silva",
    profileRows,
    triggeredRisks: triggered,
  });

  it("produces Resumo, Riscos and Escopo Analisado sheets in that order", () => {
    expect(sheets.map((s) => s.name)).toEqual(["Resumo", "Riscos", "Escopo Analisado"]);
  });

  it("summarises the analysis", () => {
    expect(sheets[0].rows).toEqual([
      ["Perfil", "FIN"],
      ["Módulo", "TOTVS Gestão Financeira"],
      ["Cenário", "Manutenção"],
      ["Ticket", "—"],
      ["Data", "21/10/2026"],
      ["Analista", "Maria Silva"],
      ["Funcionalidades analisadas", 2],
      ["Riscos encontrados", 1],
    ]);
  });

  it("writes one risk row per functionality in each triggered combination, naming what it conflicts with", () => {
    expect(sheets[1].rows).toEqual([
      ["Funcionalidade", "Status no perfil", "ID Risco", "Tipo", "Descrição Risco", "Criticidade", "Conflito Com"],
      ["[01] Contas a Pagar", "Adicionado", "SOD_001", "SoD", "Pagar e baixar", 3, "[02] Baixa de Títulos"],
      ["[02] Baixa de Títulos", "Mantido", "SOD_001", "SoD", "Pagar e baixar", 3, "[01] Contas a Pagar"],
    ]);
  });

  it("lists the analysed scope", () => {
    expect(sheets[2].rows).toEqual([
      ["Perfil", "Sistema", "Funcionalidade", "Status"],
      ["FIN", "TOTVS Gestão Financeira", "[01] Contas a Pagar", "Adicionado"],
      ["FIN", "TOTVS Gestão Financeira", "[02] Baixa de Títulos", "Mantido"],
    ]);
  });
});

describe("sodExportFileName", () => {
  it("keeps only filename-safe characters from the profile name", () => {
    expect(sodExportFileName("FIN/ANALISTA 01", "2026-10-21")).toBe("Analise_SoD_FIN_ANALISTA_01_2026-10-21.xlsx");
  });
});
