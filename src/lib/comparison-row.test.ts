import { describe, expect, it } from "vitest";

import { applyOverride } from "@/lib/comparison-row";
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

describe("applyOverride", () => {
  it("folds the accepted match into status and matchedItem", () => {
    const row = makeRow();
    const resolved = applyOverride(row, catalogItem, "aprovado");

    expect(resolved.status).toBe("Exato");
    expect(resolved.matchedItem).toBe(catalogItem);
    expect(resolved.override).toBe("aprovado");
  });

  it("records the manual override kind separately from an approved one", () => {
    const row = makeRow({ status: "Não Encontrado", matchedItem: null });
    const resolved = applyOverride(row, catalogItem, "manual");

    expect(resolved.status).toBe("Exato");
    expect(resolved.override).toBe("manual");
  });

  it("does not mutate the original row", () => {
    const row = makeRow();
    applyOverride(row, catalogItem, "aprovado");

    expect(row.status).toBe("Divergente");
    expect(row.override).toBeNull();
  });
});
