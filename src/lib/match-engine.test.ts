import { describe, expect, it } from "vitest";

import { isHighConfidenceDivergence } from "@/lib/match-engine";
import type { ComparisonRow, VarCatalogItem } from "@/types";

const catalogItem: VarCatalogItem = {
  id: 9021,
  code: "01.01",
  name: "[01.01] Específicos",
  moduleId: 1,
  moduleName: "TOTVS Gestão Financeira",
};

function makeRow(overrides: Partial<ComparisonRow> = {}): ComparisonRow {
  return {
    rowId: "row-0",
    originalIndex: 1,
    status: "Divergente",
    rawInput: "[1] Especificos",
    matchedItem: catalogItem,
    confidence: 92,
    reason: "Divergência de formatação.",
    override: null,
    ...overrides,
  };
}

describe("isHighConfidenceDivergence", () => {
  it("is eligible above the structural-match threshold", () => {
    expect(isHighConfidenceDivergence(makeRow({ confidence: 98 }))).toBe(true);
  });

  it("is not eligible below the threshold", () => {
    expect(isHighConfidenceDivergence(makeRow({ confidence: 80 }))).toBe(false);
  });

  it("stops being eligible once already resolved to Exato", () => {
    expect(isHighConfidenceDivergence(makeRow({ status: "Exato", confidence: 100, override: "aprovado" }))).toBe(
      false
    );
  });

  it("is never eligible for rows with no match", () => {
    expect(isHighConfidenceDivergence(makeRow({ status: "Não Encontrado", matchedItem: null, confidence: 0 }))).toBe(
      false
    );
  });
});
