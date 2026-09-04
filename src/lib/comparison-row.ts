import type { ComparisonRow, OverrideKind, VarCatalogItem } from "@/types";

/**
 * Folds a user-accepted match into the row itself: status becomes "Exato"
 * and matchedItem becomes the accepted item, immediately. `override` is
 * kept only as provenance (how the row got there), never as a second
 * source of truth callers have to resolve against status/matchedItem.
 */
export function applyOverride(row: ComparisonRow, matchedItem: VarCatalogItem, kind: OverrideKind): ComparisonRow {
  return {
    ...row,
    status: "Exato",
    matchedItem,
    override: kind,
  };
}
