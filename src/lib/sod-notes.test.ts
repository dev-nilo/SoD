import { describe, expect, it } from "vitest";

import { buildChamadoNote, buildEmailNote, groupRisksByFunctionality, NO_CONFLICT_NOTE } from "./sod-notes";
import type { SodActivity, TriggeredRisk, VarCatalogItem } from "@/types";

const fn = (id: number, name: string): VarCatalogItem => ({ id, code: "", name, moduleId: 2, moduleName: "TOTVS Gestão Financeira" });
const act = (id: number): SodActivity => ({ id, name: `Atividade ${id}`, functionalityIds: [] });

const pagar = fn(1, "[01] Contas a Pagar");
const baixar = fn(2, "[02] Baixa de Títulos");
const fornecedor = fn(3, "[03] Cadastro de Fornecedor");

const triggered: TriggeredRisk[] = [
  {
    risk: { id: "SOD_001", kind: "funcao", description: "d1", criticality: 3 },
    matches: [
      { activity: act(1), functionality: pagar, status: "Adicionado" },
      { activity: act(2), functionality: baixar, status: "Mantido" },
    ],
  },
  {
    risk: { id: "SOD_002", kind: "funcao", description: "d2", criticality: 2 },
    matches: [
      { activity: act(1), functionality: pagar, status: "Adicionado" },
      { activity: act(3), functionality: fornecedor, status: "Mantido" },
    ],
  },
  {
    // a second combination of the same risk must not repeat its id
    risk: { id: "SOD_002", kind: "funcao", description: "d2", criticality: 2 },
    matches: [
      { activity: act(1), functionality: pagar, status: "Adicionado" },
      { activity: act(3), functionality: baixar, status: "Mantido" },
    ],
  },
];

describe("groupRisksByFunctionality", () => {
  it("lists each functionality once, in first-seen order, with its distinct risk ids", () => {
    expect(groupRisksByFunctionality(triggered)).toEqual([
      { functionality: "[01] Contas a Pagar", riskIds: ["SOD_001", "SOD_002"] },
      { functionality: "[02] Baixa de Títulos", riskIds: ["SOD_001", "SOD_002"] },
      { functionality: "[03] Cadastro de Fornecedor", riskIds: ["SOD_002"] },
    ]);
  });
});

const input = {
  date: "21/10/2026",
  perfil: "FIN_ANALISTA",
  modulo: "TOTVS Gestão Financeira",
  cenario: "manutencao" as const,
  ticket: "12345",
  triggeredRisks: triggered,
};

describe("buildChamadoNote", () => {
  it("lists functionalities with their risk ids", () => {
    expect(buildChamadoNote(input)).toBe(`Análise SoD concluída — 21/10/2026
Perfil: FIN_ANALISTA | Módulo: TOTVS Gestão Financeira | Cenário: Manutenção

Foram identificados riscos de Segregação de Funções (SoD). O chamado não pode ser aprovado enquanto os conflitos abaixo não forem tratados.

Funcionalidades com risco (3):
  • [01] Contas a Pagar (SOD_001, SOD_002)
  • [02] Baixa de Títulos (SOD_001, SOD_002)
  • [03] Cadastro de Fornecedor (SOD_002)

Pendência: revisar as permissões do perfil ou encaminhar para aprovação formal de risco residual.`);
  });

  it("uses blanks for a missing module", () => {
    expect(buildChamadoNote({ ...input, modulo: "" })).toContain("Módulo: ________ |");
  });
});

describe("buildEmailNote", () => {
  it("names the profile, module, scenario and ticket", () => {
    const note = buildEmailNote({ ...input, cenario: "criacao" });
    expect(note.startsWith("Assunto: Análise e Aprovação: Análise SOD em ANEXO\n\nOlá, como vai?")).toBe(true);
    expect(note).toContain("liberação das funcionalidades do perfil FIN_ANALISTA no Módulo TOTVS Gestão Financeira");
    expect(note).toContain("  • [01] Contas a Pagar\n  • [02] Baixa de Títulos\n  • [03] Cadastro de Fornecedor\n");
    expect(note).toContain("A Criação do Perfil foi solicitada a partir do ticket #12345.");
    expect(note.endsWith("Att.")).toBe(true);
  });

  it("leaves a blank ticket placeholder when none is given", () => {
    expect(buildEmailNote({ ...input, ticket: "  " })).toContain("a partir do ticket #______.");
  });
});

describe("NO_CONFLICT_NOTE", () => {
  it("matches the original wording", () => {
    expect(NO_CONFLICT_NOTE).toBe("Nenhum conflito de SoD foi identificado para as funcionalidades analisadas.");
  });
});
