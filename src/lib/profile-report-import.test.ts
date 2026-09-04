import { describe, expect, it } from "vitest";

import { extractProfileRows } from "@/lib/profile-report-import";

const HEADER = ["Perfil", "", "Sistema", "", "Funcionalidade", "", "", "", "Status", ""];

describe("extractProfileRows", () => {
  it("finds the header wherever it lands and reads rows after it", () => {
    const rows = [
      ["título", "", "", "", "", "", "", "", "", ""],
      HEADER,
      ["Z_PERFIL", "", "TOTVS RM", "", "[01] Manter cadastro", "", "", "", "Adicionado", ""],
      ["Z_PERFIL", "", "TOTVS RM", "", "[02] Aprovar baixa", "", "", "", "Não alterado", ""],
    ];
    const result = extractProfileRows(rows);
    expect(result).toEqual([
      { perfil: "Z_PERFIL", sistema: "TOTVS RM", funcionalidade: "[01] Manter cadastro", status: "Adicionado" },
      { perfil: "Z_PERFIL", sistema: "TOTVS RM", funcionalidade: "[02] Aprovar baixa", status: "Não alterado" },
    ]);
  });

  it("stops at the report's own risk section instead of reading past it", () => {
    const rows = [
      HEADER,
      ["Z_PERFIL", "", "TOTVS RM", "", "[01] Manter cadastro", "", "", "", "Adicionado", ""],
      ["Riscos SoD para perfil", "", "", "", "", "", "", "", "", ""],
      ["ID Risco", "", "Descrição Risco", "", "", "", "Criticidade", "", "", ""],
      ["SOD_001", "", "desc", "", "", "", "Média", "", "", ""],
    ];
    expect(extractProfileRows(rows)).toHaveLength(1);
  });

  it("throws when the required header is missing", () => {
    expect(() => extractProfileRows([["nada", "a", "ver"]])).toThrow(/cabeçalho/);
  });
});
