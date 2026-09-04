import { describe, expect, it } from "vitest";

import {
  acceptHighConfidenceDivergences,
  acceptSuggestion,
  assignManualMatch,
  buildComparisonRows,
  countFunctionalityLines,
  selectFilteredResults,
  selectImportaVarData,
  selectIsSessionResolved,
  selectStats,
} from "@/lib/comparison-session";
import type { ComparisonRow, VarCatalogItem } from "@/types";

const catalog: VarCatalogItem[] = [
  { id: 9010, code: "01", name: "[01] Cadastros", moduleId: 1, moduleName: "TOTVS Gestão Financeira" },
  { id: 9021, code: "01.01", name: "[01.01] Específicos", moduleId: 1, moduleName: "TOTVS Gestão Financeira" },
];

function makeRow(overrides: Partial<ComparisonRow> = {}): ComparisonRow {
  return {
    rowId: "row-0",
    originalIndex: 1,
    status: "Divergente",
    rawInput: "[1] Especificos",
    matchedItem: catalog[1],
    confidence: 92,
    reason: "Divergência de formatação.",
    override: null,
    ...overrides,
  };
}

describe("buildComparisonRows", () => {
  it("skips blank lines and numbers rows from the remaining ones", () => {
    const rows = buildComparisonRows("[01] Cadastros\n\n  \n[01.01] Especificos", catalog, null);

    expect(rows).toHaveLength(2);
    expect(rows[0].originalIndex).toBe(1);
    expect(rows[1].originalIndex).toBe(2);
  });

  it("starts every row with no override", () => {
    const [row] = buildComparisonRows("[01] Cadastros", catalog, null);
    expect(row.override).toBeNull();
  });
});

describe("acceptSuggestion", () => {
  it("only folds the matching row", () => {
    const rows = [makeRow({ rowId: "a" }), makeRow({ rowId: "b" })];
    const result = acceptSuggestion(rows, "a");

    expect(result.find((r) => r.rowId === "a")?.status).toBe("Exato");
    expect(result.find((r) => r.rowId === "b")?.status).toBe("Divergente");
  });
});

describe("acceptHighConfidenceDivergences", () => {
  it("folds every eligible row in one pass", () => {
    const rows = [makeRow({ rowId: "a", confidence: 98 }), makeRow({ rowId: "b", confidence: 50 })];
    const result = acceptHighConfidenceDivergences(rows);

    expect(result.find((r) => r.rowId === "a")?.status).toBe("Exato");
    expect(result.find((r) => r.rowId === "b")?.status).toBe("Divergente");
  });
});

describe("assignManualMatch", () => {
  it("links a not-found row to a chosen catalog item", () => {
    const rows = [makeRow({ status: "Não Encontrado", matchedItem: null })];
    const result = assignManualMatch(rows, "row-0", catalog[0]);

    expect(result[0].status).toBe("Exato");
    expect(result[0].matchedItem).toBe(catalog[0]);
    expect(result[0].override).toBe("manual");
  });
});

describe("selectStats", () => {
  it("counts rows by their current status", () => {
    const rows = [
      makeRow({ status: "Exato" }),
      makeRow({ status: "Divergente" }),
      makeRow({ status: "Não Encontrado", matchedItem: null }),
    ];

    expect(selectStats(rows)).toMatchObject({ total: 3, exact: 1, divergent: 1, notFound: 1 });
  });

  it("counts an accepted row under Exato, not lost from every bucket", () => {
    const rows = [makeRow({ status: "Exato", override: "aprovado" })];
    expect(selectStats(rows)).toMatchObject({ exact: 1, divergent: 0, notFound: 0 });
  });
});

describe("selectFilteredResults", () => {
  it("filters an accepted row into the Exato bucket", () => {
    const rows = [makeRow({ status: "Exato", override: "aprovado" })];
    expect(selectFilteredResults(rows, "Exato", "")).toHaveLength(1);
    expect(selectFilteredResults(rows, "Divergente", "")).toHaveLength(0);
  });

  it("matches search against the raw input or the matched item's name", () => {
    const rows = [makeRow()];
    expect(selectFilteredResults(rows, "ALL", "especific")).toHaveLength(1);
    expect(selectFilteredResults(rows, "ALL", "nada-a-ver")).toHaveLength(0);
  });
});

describe("selectImportaVarData", () => {
  it("drops rows with no matched item", () => {
    const rows = [makeRow(), makeRow({ rowId: "b", matchedItem: null, status: "Não Encontrado" })];
    expect(selectImportaVarData(rows, "3129", "Z_TEST")).toHaveLength(1);
  });

  it("falls back to a placeholder profile name when none is set", () => {
    const rows = [makeRow()];
    expect(selectImportaVarData(rows, "3129", "")[0].perfil).toBe("PERFIL_SEM_NOME");
  });
});

describe("countFunctionalityLines", () => {
  it("counts only non-blank lines", () => {
    expect(countFunctionalityLines("[01] Cadastros\n\n  \n[01.01] Especificos")).toBe(2);
  });

  it("is zero for empty input", () => {
    expect(countFunctionalityLines("")).toBe(0);
  });
});

describe("selectIsSessionResolved", () => {
  it("is false with no rows", () => {
    expect(selectIsSessionResolved([])).toBe(false);
  });

  it("is false while any row is still Divergente or Não Encontrado", () => {
    const rows = [makeRow({ status: "Exato" }), makeRow({ rowId: "b", status: "Divergente" })];
    expect(selectIsSessionResolved(rows)).toBe(false);
  });

  it("is true once every row is Exato", () => {
    const rows = [makeRow({ status: "Exato" }), makeRow({ rowId: "b", status: "Exato", override: "manual" })];
    expect(selectIsSessionResolved(rows)).toBe(true);
  });
});
