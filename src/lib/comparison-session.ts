import { applyOverride } from "@/lib/comparison-row";
import { isHighConfidenceDivergence, matchFunctionality } from "@/lib/match-engine";
import type { ComparisonRow, FilterStatus, ImportaVarRow, VarCatalogItem } from "@/types";

/**
 * RM Functionality lines in raw input text: one per non-blank line.
 */
export function countFunctionalityLines(rawText: string): number {
  return splitFunctionalityLines(rawText).length;
}

function splitFunctionalityLines(rawText: string): string[] {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Turns raw RM input text into Comparison Rows against a VAR Catalog. Pure:
 * no React, no fetch — the catalog and module are passed in, never fetched.
 */
export function buildComparisonRows(
  rawText: string,
  catalog: VarCatalogItem[],
  moduleId: string | number | null
): ComparisonRow[] {
  const lines = splitFunctionalityLines(rawText);

  return lines.map((line, index) => {
    const match = matchFunctionality(line, catalog, moduleId)!;
    return {
      rowId: `row-${index}`,
      originalIndex: index + 1,
      ...match,
      override: null,
    };
  });
}

export function acceptSuggestion(rows: ComparisonRow[], rowId: string): ComparisonRow[] {
  return rows.map((r) => (r.rowId === rowId && r.matchedItem ? applyOverride(r, r.matchedItem, "aprovado") : r));
}

export function acceptHighConfidenceDivergences(rows: ComparisonRow[]): ComparisonRow[] {
  return rows.map((r) =>
    isHighConfidenceDivergence(r) && r.matchedItem ? applyOverride(r, r.matchedItem, "aprovado") : r
  );
}

export function assignManualMatch(rows: ComparisonRow[], rowId: string, item: VarCatalogItem): ComparisonRow[] {
  return rows.map((r) => (r.rowId === rowId ? applyOverride(r, item, "manual") : r));
}

/**
 * A session is resolved once every row has reached Exato — nothing left
 * Divergente or Não Encontrado, and there's at least one row to show for it.
 */
export function selectIsSessionResolved(rows: ComparisonRow[]): boolean {
  return rows.length > 0 && rows.every((r) => r.status === "Exato");
}

export function selectStats(rows: ComparisonRow[]) {
  const total = rows.length;
  const exact = rows.filter((r) => r.status === "Exato").length;
  const divergent = rows.filter((r) => r.status === "Divergente").length;
  const notFound = rows.filter((r) => r.status === "Não Encontrado").length;
  const successRate = total > 0 ? Math.round(((exact + divergent) / total) * 100) : 0;
  return { total, exact, divergent, notFound, successRate };
}

export function selectFilteredResults(
  rows: ComparisonRow[],
  filterStatus: FilterStatus,
  searchQuery: string
): ComparisonRow[] {
  const query = searchQuery.toLowerCase();
  return rows.filter((item) => {
    const matchesFilter = filterStatus === "ALL" || item.status === filterStatus;
    const matchesSearch =
      item.rawInput.toLowerCase().includes(query) ||
      (item.matchedItem?.name.toLowerCase().includes(query) ?? false) ||
      (item.matchedItem?.id !== undefined && String(item.matchedItem.id).includes(searchQuery));

    return matchesFilter && matchesSearch;
  });
}

export function selectImportaVarData(rows: ComparisonRow[], profileId: string, profileCode: string): ImportaVarRow[] {
  return rows
    .map((item) => {
      if (!item.matchedItem) return null;
      return {
        id: profileId,
        perfil: profileCode || "PERFIL_SEM_NOME",
        funcionalidadeId: item.matchedItem.id,
        funcionalidade: item.matchedItem.name,
      };
    })
    .filter((row): row is ImportaVarRow => row !== null);
}
