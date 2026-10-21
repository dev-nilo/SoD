import { describe, expect, it } from "vitest";

import { buildProfileComparisonSheets, compareProfiles } from "./profile-comparison";
import type { ProfileFunctionalityRow } from "@/types";

const row = (perfil: string, funcionalidade: string, status = "Não alterado"): ProfileFunctionalityRow => ({
  perfil,
  sistema: "TOTVS Gestão Financeira",
  funcionalidade,
  status,
});

describe("compareProfiles", () => {
  const mirror = [row("ESPELHO", "[01] Contas a Pagar"), row("ESPELHO", "[02] Baixa de Títulos"), row("ESPELHO", "[03] Fornecedores")];
  const requested = [row("NOVO", "[1] contas  a pagar"), row("NOVO", "[03] Fornecedores"), row("NOVO", "[04] Bancos")];

  it("splits functionalities into missing from the request, extra in the request, and common", () => {
    const result = compareProfiles(mirror, requested);
    expect(result.faltantes.map((r) => r.funcionalidade)).toEqual(["[02] Baixa de Títulos"]);
    expect(result.extras.map((r) => r.funcionalidade)).toEqual(["[04] Bancos"]);
    expect(result.comuns.map((r) => r.funcionalidade)).toEqual(["[1] contas  a pagar", "[03] Fornecedores"]);
  });

  it("matches names regardless of case, spacing and hierarchical-code padding", () => {
    expect(compareProfiles([row("A", "[01.02] Baixa")], [row("B", "[1.2]  BAIXA")]).comuns).toHaveLength(1);
  });

  it("ignores functionalities the report marks as removed", () => {
    const result = compareProfiles([row("A", "[01] X", "Removido")], [row("B", "[02] Y", "Removida")]);
    expect(result).toEqual({ faltantes: [], extras: [], comuns: [] });
  });

  it("lists a functionality repeated in one report only once", () => {
    const result = compareProfiles([row("A", "[01] X"), row("A", "[01] X")], []);
    expect(result.faltantes).toHaveLength(1);
  });
});

describe("buildProfileComparisonSheets", () => {
  it("produces a summary and one sheet per list", () => {
    const result = compareProfiles([row("ESPELHO", "[01] A"), row("ESPELHO", "[02] B")], [row("NOVO", "[02] B"), row("NOVO", "[03] C")]);
    const sheets = buildProfileComparisonSheets(result, {
      mirrorProfile: "ESPELHO",
      requestedProfile: "NOVO",
      mirrorTotal: 2,
      requestedTotal: 2,
      date: "21/10/2026",
      analyst: "Maria",
    });

    expect(sheets.map((s) => s.name)).toEqual(["Resumo", "Faltantes", "Extras", "Comuns"]);
    expect(sheets[0].rows).toEqual([
      ["Perfil espelho", "ESPELHO"],
      ["Perfil solicitado", "NOVO"],
      ["Funcionalidades no espelho", 2],
      ["Funcionalidades no solicitado", 2],
      ["Faltantes (no espelho, não solicitadas)", 1],
      ["Extras (solicitadas, fora do espelho)", 1],
      ["Comuns", 1],
      ["Data", "21/10/2026"],
      ["Analista", "Maria"],
    ]);
    expect(sheets[1].rows).toEqual([
      ["Funcionalidade", "Sistema", "Status no relatório"],
      ["[01] A", "TOTVS Gestão Financeira", "Não alterado"],
    ]);
  });
});
