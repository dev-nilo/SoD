import { describe, expect, it } from "vitest";

import { diffCatalog, parseCatalogSheet } from "./catalog-upload";
import type { VarCatalogItem } from "@/types";

const item = (id: number, name: string, moduleId = 2, moduleName = "TOTVS Gestão Financeira"): VarCatalogItem => ({
  id,
  code: name.match(/\[(.*?)\]/)?.[0] ?? "",
  name,
  moduleId,
  moduleName,
});

describe("parseCatalogSheet", () => {
  it("finds the header row wherever it lands and reads items below it", () => {
    const rows = [
      ["Base VAR — agosto"],
      [],
      ["ID Funcionalidade", "Funcionalidade", "ID Módulo", "Módulo"],
      [10, "[01] Contas a Pagar", 2, "TOTVS Gestão Financeira"],
      ["11", " [01.02] Baixa ", "3", "TOTVS Gestão Contábil"],
    ];
    const result = parseCatalogSheet(rows);
    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      item(10, "[01] Contas a Pagar"),
      item(11, "[01.02] Baixa", 3, "TOTVS Gestão Contábil"),
    ]);
  });

  it("matches headers regardless of accents, case and column order", () => {
    const rows = [
      ["modulo", "id modulo", "funcionalidade", "id funcionalidade"],
      ["TOTVS Educacional", 7, "[01] Currículo", 1],
    ];
    expect(parseCatalogSheet(rows).items).toEqual([item(1, "[01] Currículo", 7, "TOTVS Educacional")]);
  });

  it("throws when the header row is missing", () => {
    expect(() => parseCatalogSheet([["a", "b"]])).toThrow(/ID Funcionalidade/);
  });

  it("skips blank rows and reports invalid or duplicate ones by sheet line number", () => {
    const rows = [
      ["ID Funcionalidade", "Funcionalidade", "ID Módulo", "Módulo"],
      ["", "", "", ""],
      ["abc", "[01] X", 2, "TOTVS Gestão Financeira"],
      [5, "", 2, "TOTVS Gestão Financeira"],
      [6, "[01] Y", 2, "TOTVS Gestão Financeira"],
      [6, "[01] Y de novo", 2, "TOTVS Gestão Financeira"],
    ];
    const result = parseCatalogSheet(rows);
    expect(result.items).toEqual([item(6, "[01] Y")]);
    expect(result.errors).toEqual([
      "Linha 3: ID da funcionalidade inválido.",
      "Linha 4: nome da funcionalidade vazio.",
      "Linha 6: ID 6 repetido — mantida a primeira ocorrência.",
    ]);
  });
});

describe("diffCatalog", () => {
  it("splits incoming items into added, updated and unchanged, and lists existing ones missing from the upload", () => {
    const existing = [item(1, "[01] A"), item(2, "[02] B"), item(3, "[03] C")];
    const incoming = [item(1, "[01] A"), item(2, "[02] B renomeada"), item(4, "[04] D")];

    const diff = diffCatalog(existing, incoming);
    expect(diff.added).toEqual([item(4, "[04] D")]);
    expect(diff.updated).toEqual([item(2, "[02] B renomeada")]);
    expect(diff.unchanged).toBe(1);
    expect(diff.missing).toEqual([item(3, "[03] C")]);
  });

  it("counts a module change as an update", () => {
    const diff = diffCatalog([item(1, "[01] A")], [item(1, "[01] A", 3, "TOTVS Gestão Contábil")]);
    expect(diff.updated).toHaveLength(1);
  });
});
